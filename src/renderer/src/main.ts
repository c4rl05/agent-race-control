import { mount } from 'svelte'
// Self-hosted Google Material Symbols (outlined set only) — bundled locally,
// no CDN (CSP forbids remote fonts, and the app must work offline).
import 'material-symbols/outlined.css'
import App from './App.svelte'
import { registerPreviewFonts } from './previewFonts'

// The bundled text fonts. Mono (terminal picker's non-native choices): latin
// 400/700 — xterm draws ANSI bold from the 700 face. Roboto (an Interface
// picker choice): latin 400/600/700, the chrome's three weights. Inter and IBM
// Plex Sans are registered with the Preview themes' fonts (previewFonts.ts),
// as variable faces that cover those three weights and every other.
// We import only the woff2 and register each @font-face by hand rather than pull
// @fontsource's CSS: that CSS also references a paired .woff, which Chromium
// never loads (woff2 always wins) yet Vite still ships — ~248 KB of dead
// installer weight. The native picker choices (Cascadia Mono, Consolas) and
// the system-ui chrome fallback need no import. Keep this list in sync with
// theme.ts's FONTS/UI_FONTS. Material Symbols keeps its CSS import (its own concern).
import jetbrains400 from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2?url'
import jetbrains700 from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2?url'
import fira400 from '@fontsource/fira-code/files/fira-code-latin-400-normal.woff2?url'
import fira700 from '@fontsource/fira-code/files/fira-code-latin-700-normal.woff2?url'
import plex400 from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2?url'
import plex700 from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-700-normal.woff2?url'
import roboto400 from '@fontsource/roboto/files/roboto-latin-400-normal.woff2?url'
import roboto600 from '@fontsource/roboto/files/roboto-latin-600-normal.woff2?url'
import roboto700 from '@fontsource/roboto/files/roboto-latin-700-normal.woff2?url'

const FONT_FACES: [family: string, weight: string, url: string][] = [
  ['JetBrains Mono', '400', jetbrains400],
  ['JetBrains Mono', '700', jetbrains700],
  ['Fira Code', '400', fira400],
  ['Fira Code', '700', fira700],
  ['IBM Plex Mono', '400', plex400],
  ['IBM Plex Mono', '700', plex700],
  ['Roboto', '400', roboto400],
  ['Roboto', '600', roboto600],
  ['Roboto', '700', roboto700]
]
for (const [family, weight, url] of FONT_FACES) {
  document.fonts.add(new FontFace(family, `url(${url})`, { weight, display: 'swap' }))
}
registerPreviewFonts()

const app = mount(App, { target: document.getElementById('app')! })

export default app
