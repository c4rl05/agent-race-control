import { app } from 'electron'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// The state JSON in userData — the app's only persistence. No DB.

export interface PersistedSession {
  type: 'shell' | 'claude'
  name: string
  cwd: string
  claudeSessionId: string | null
  // The Notes tab's text. Optional/additive like the fields on AppState below:
  // absent means the user never typed any, so it needs no version bump.
  notes?: string
  // The last terminal title, so a row restored unstarted keeps its name.
  // Optional/additive, same rule.
  title?: string
}

export interface AppState {
  // Pre-1.0 no-compat policy (see the kickoff doc): a schema change bumps
  // this and loadState discards older files — factory reset, no migrations.
  version: 2
  mode: 'system' | 'light' | 'dark'
  // Optional/additive — absent reads as the renderer's default, so a new one
  // needs no version bump (the no-compat policy governs breaking changes only).
  // Absent → true.
  statusRgb?: boolean
  // Draw the status dot at all. Absent → true. The defaults live in one place,
  // the renderer's `ui` and restoreState — main only stores what it is sent.
  statusDot?: boolean
  // Paint a row title's leading glyph by which glyph it is. Absent → true.
  glyphColor?: boolean
  // Hold the machine out of idle sleep while the app runs (awake.ts). Absent → true.
  keepAwake?: boolean
  // Legacy font ids, read once by the renderer to move them into the selected
  // theme and never written since (2026-10-14).
  font?: string
  uiFont?: string
  // The selected Preview theme's id, and the user's own themes. Absent →
  // Today and none. The renderer validates both on restore (previewTheme.ts).
  previewTheme?: string
  previewThemes?: unknown[]
  towerWidth?: number
  // Window zoom level (Ctrl+=/−/0), owned by main. The renderer's per-pane
  // offsets ride alongside it under `paneZoom`, in HALF levels, and are reset
  // to 0 whenever one of those keys fires.
  zoomLevel?: number
  paneZoom?: Record<string, number>
  focusedIndex: number
  dirOrder?: string[]
  dirColors?: Record<string, string>
  recentDirs?: string[]
  sessions: PersistedSession[]
  lastPickedDir?: string
}

function statePath(): string {
  return join(app.getPath('userData'), 'state.json')
}

export function loadState(): AppState | null {
  try {
    const state = JSON.parse(readFileSync(statePath(), 'utf8')) as AppState
    return state.version === 2 ? state : null
  } catch {
    return null
  }
}

let pending: AppState | null = null
let writeTimer: NodeJS.Timeout | null = null

export function saveState(state: AppState): void {
  pending = state
  if (writeTimer) clearTimeout(writeTimer)
  writeTimer = setTimeout(flushState, 300)
}

export function flushState(): void {
  if (writeTimer) clearTimeout(writeTimer)
  writeTimer = null
  if (!pending) return
  try {
    writeFileSync(statePath(), JSON.stringify(pending, null, 2))
  } catch {
    // best-effort — never crash over state persistence
  }
}
