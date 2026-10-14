import { app, ipcMain } from 'electron'
import type { WebContents } from 'electron'
import { autoUpdater } from 'electron-updater'

// AUTO-UPDATE (2026-10-14, reversing the packaging call "No auto-update"; the
// kickoff doc's *Auto-update*): the installed app finds, downloads and stages
// its own updates from GitHub Releases. electron-updater reads the
// `resources/app-update.yml` electron-builder embeds, then the newest
// release's `latest.yml`, and checks the download against its sha512.
//
// It NEVER restarts the app on its own: a restart kills every PTY, and every
// running agent with it, so that is always the user's call. A downloaded
// update is announced to the renderer (the tower's Update ready chip, which
// calls install below), and otherwise installs silently when the app next
// quits, so the next launch is already current.
//
// Installed builds only. Dev has nothing to update. The Portable build
// re-extracts to %TEMP% on every launch, so there is nothing for an update to
// replace, and the updater would install a per-user copy beside it instead.

const CHECK_EVERY_MS = 6 * 60 * 60 * 1000

export const updatesSupported = (): boolean =>
  app.isPackaged && !process.env['PORTABLE_EXECUTABLE_FILE']

let timer: NodeJS.Timeout | null = null
let wired = false
let ready: string | null = null

// Failures are quiet: no network, a GitHub hiccup, a release without
// latest.yml. Logged, never shown, tried again at the next check — an updater
// that nags is worse than none.
function check(): void {
  autoUpdater.checkForUpdates().catch((err: unknown) => {
    console.warn('[arc] update check failed', err instanceof Error ? err.message : err)
  })
}

function wire(contents: () => WebContents | null): void {
  if (wired) return
  wired = true
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.on('error', (err) => console.warn('[arc] updater', err.message))
  autoUpdater.on('update-downloaded', (info) => {
    ready = info.version
    console.log(`[arc] update ${info.version} downloaded`)
    contents()?.send('update:ready', info.version)
  })
}

// The Update automatically setting. The renderer owns the default and sends it
// once state is restored (as Keep awake does), so a saved OFF never checks,
// even once at boot. Turning it on checks right away.
function setEnabled(on: boolean, contents: () => WebContents | null): void {
  if (!updatesSupported()) return
  wire(contents)
  autoUpdater.autoInstallOnAppQuit = on
  if (on && !timer) {
    check()
    timer = setInterval(check, CHECK_EVERY_MS)
  } else if (!on && timer) {
    clearInterval(timer)
    timer = null
  }
}

export function registerUpdaterHandlers(contents: () => WebContents | null): void {
  ipcMain.handle('update:info', () => ({
    version: app.getVersion(),
    supported: updatesSupported(),
    // A renderer reload mustn't lose a chip for an update already staged.
    ready
  }))
  ipcMain.on('update:enabled', (_event, on: boolean) => setEnabled(on === true, contents))
  // Silent install, then relaunch: the user clicked Update ready, so the
  // restart is theirs.
  ipcMain.on('update:install', () => {
    if (ready) autoUpdater.quitAndInstall(true, true)
  })
}
