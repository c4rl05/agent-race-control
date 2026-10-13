// Preview themes (kickoff doc, "Preview themes"): how the Preview tab sets a
// conversation. Pure — the catalogue, the built-ins, the validation every
// persisted or imported theme goes through, and the CSS custom properties a
// theme becomes. The store holds which theme is selected and the user's own;
// Conversation.svelte owns the CSS that reads these properties.

export type FontKind = 'serif' | 'sans' | 'mono'

// Every family a theme can name. All but the `native` four are self-hosted
// (previewFonts.ts registers them); keep the two lists in step.
export const THEME_FONTS: { name: string; kind: FontKind; native?: true }[] = [
  { name: 'Source Serif 4', kind: 'serif' },
  { name: 'Literata', kind: 'serif' },
  { name: 'Newsreader', kind: 'serif' },
  { name: 'IBM Plex Serif', kind: 'serif' },
  { name: 'Fraunces', kind: 'serif' },
  { name: 'Lora', kind: 'serif' },
  { name: 'Spectral', kind: 'serif' },
  { name: 'Crimson Pro', kind: 'serif' },
  { name: 'Merriweather', kind: 'serif' },
  { name: 'Gelasio', kind: 'serif' },
  { name: 'Instrument Serif', kind: 'serif' },
  { name: 'DM Serif Display', kind: 'serif' },
  { name: 'Young Serif', kind: 'serif' },
  { name: 'Inter', kind: 'sans' },
  { name: 'Inter Tight', kind: 'sans' },
  { name: 'Source Sans 3', kind: 'sans' },
  { name: 'IBM Plex Sans', kind: 'sans' },
  { name: 'Roboto', kind: 'sans' },
  { name: 'Geist', kind: 'sans' },
  { name: 'Atkinson Hyperlegible Next', kind: 'sans' },
  { name: 'Instrument Sans', kind: 'sans' },
  { name: 'DM Sans', kind: 'sans' },
  { name: 'Figtree', kind: 'sans' },
  { name: 'Space Grotesk', kind: 'sans' },
  { name: 'Hanken Grotesk', kind: 'sans' },
  { name: 'Manrope', kind: 'sans' },
  { name: 'Karla', kind: 'sans' },
  { name: 'Work Sans', kind: 'sans' },
  { name: 'Red Hat Text', kind: 'sans' },
  { name: 'Red Hat Display', kind: 'sans' },
  { name: 'Bricolage Grotesque', kind: 'sans' },
  { name: 'Libre Franklin', kind: 'sans' },
  { name: 'Public Sans', kind: 'sans' },
  { name: 'Onest', kind: 'sans' },
  { name: 'Segoe UI', kind: 'sans', native: true },
  { name: 'Arial', kind: 'sans', native: true },
  { name: 'Cascadia Mono', kind: 'mono', native: true },
  { name: 'Consolas', kind: 'mono', native: true },
  { name: 'JetBrains Mono', kind: 'mono' },
  { name: 'Fira Code', kind: 'mono' },
  { name: 'IBM Plex Mono', kind: 'mono' },
  { name: 'Source Code Pro', kind: 'mono' },
  { name: 'Geist Mono', kind: 'mono' },
  { name: 'Atkinson Hyperlegible Mono', kind: 'mono' },
  { name: 'DM Mono', kind: 'mono' },
  { name: 'Space Mono', kind: 'mono' },
  { name: 'Red Hat Mono', kind: 'mono' },
  { name: 'Martian Mono', kind: 'mono' }
]

// The code font that isn't a family: whatever the terminal font picker holds,
// which is what the Preview's code always used.
export const TERMINAL_FONT = 'Terminal'
// The prompt font can also follow one of the theme's own three.
export const PROMPT_FOLLOW = ['body', 'head', 'code'] as const

const KIND = new Map(THEME_FONTS.map((f) => [f.name, f.kind]))

export function fontStack(name: string, terminalStack: string): string {
  if (name === TERMINAL_FONT) return terminalStack
  const kind = KIND.get(name)
  if (kind === 'serif') return `'${name}', Georgia, serif`
  if (kind === 'mono') return `'${name}', 'Cascadia Mono', Consolas, monospace`
  return `'${name}', system-ui, sans-serif`
}

export const PROMPT_STYLES = [
  { id: 'current', label: 'Bar', note: 'Accent bar on the left, subtle fill.' },
  { id: 'bubble', label: 'Bubble', note: 'Right-aligned chat bubble.' },
  { id: 'gutter', label: 'Gutter label', note: '"You" sits in the left margin.' },
  { id: 'heading', label: 'As a heading', note: 'The prompt titles the answer below it.' },
  { id: 'chevron', label: 'Chevron', note: 'A › mark, like a shell prompt.' },
  { id: 'band', label: 'Band', note: 'A full-width tinted band.' },
  { id: 'quote', label: 'Quote', note: 'A large opening quote mark.' },
  { id: 'outline', label: 'Outline', note: 'A rounded box with an accent edge.' },
  { id: 'marker', label: 'Highlighter', note: 'A marker stroke under the text.' },
  { id: 'ruled', label: 'Ruled', note: 'Between two hairlines, with a label.' },
  { id: 'card', label: 'Card', note: 'A tinted card with a labelled header.' },
  { id: 'dot', label: 'Dot', note: 'A single accent dot, nothing else.' },
  { id: 'tab', label: 'Tab', note: 'A labelled tab, like the file blocks.' },
  { id: 'pull', label: 'Pull right', note: 'Right-aligned, accent rule on the right.' }
] as const
export type PromptStyle = (typeof PROMPT_STYLES)[number]['id']

// The tint a treatment looks right at, applied when it is picked — a bubble at
// 0% is invisible, a band at 22% is loud.
export const PROMPT_TINTS: Partial<Record<PromptStyle, number>> = {
  current: 0,
  bubble: 16,
  band: 10,
  outline: 5,
  marker: 22,
  card: 10,
  tab: 12
}

// One syntax palette per mode. `plain` is no highlighting at all: the chrome's
// own tokens, which is what the Preview always had.
interface CodeColors {
  bg: string
  fg: string
  border: string
  com: string
  kw: string
  str: string
  num: string
  fn: string
  type: string
  prop: string
  add: string
  del: string
  kwWeight?: number
  comItalic?: true
}
const c = (
  bg: string,
  fg: string,
  border: string,
  com: string,
  kw: string,
  str: string,
  num: string,
  fn: string,
  type: string,
  prop: string,
  add: string,
  del: string,
  extra: Partial<CodeColors> = {}
): CodeColors => ({ bg, fg, border, com, kw, str, num, fn, type, prop, add, del, ...extra })
const it = { comItalic: true } as const

const PLAIN: CodeColors = {
  bg: 'var(--page-subtle)',
  fg: 'var(--fg)',
  border: 'var(--border)',
  com: 'var(--fg)',
  kw: 'var(--fg)',
  str: 'var(--fg)',
  num: 'var(--fg)',
  fn: 'var(--fg)',
  type: 'var(--fg)',
  prop: 'var(--fg)',
  add: 'var(--success)',
  del: 'var(--danger)'
}

// Hexes from each theme's published palette (dark / light variant).
export const CODE_THEMES = {
  plain: { label: 'Plain', dark: PLAIN, light: PLAIN },
  github: {
    label: 'GitHub',
    dark: c(
      '#0d1117',
      '#e6edf3',
      '#30363d',
      '#8b949e',
      '#ff7b72',
      '#a5d6ff',
      '#79c0ff',
      '#d2a8ff',
      '#ffa657',
      '#79c0ff',
      '#3fb950',
      '#f85149'
    ),
    light: c(
      '#f6f8fa',
      '#1f2328',
      '#d0d7de',
      '#6e7781',
      '#cf222e',
      '#0a3069',
      '#0550ae',
      '#8250df',
      '#953800',
      '#0550ae',
      '#1a7f37',
      '#cf222e'
    )
  },
  one: {
    label: 'One',
    dark: c(
      '#282c34',
      '#abb2bf',
      '#3e4451',
      '#7f848e',
      '#c678dd',
      '#98c379',
      '#d19a66',
      '#61afef',
      '#e5c07b',
      '#e06c75',
      '#98c379',
      '#e06c75',
      it
    ),
    light: c(
      '#fafafa',
      '#383a42',
      '#e5e5e6',
      '#a0a1a7',
      '#a626a4',
      '#50a14f',
      '#986801',
      '#4078f2',
      '#c18401',
      '#e45649',
      '#50a14f',
      '#e45649',
      it
    )
  },
  tokyo: {
    label: 'Tokyo Night',
    dark: c(
      '#1a1b26',
      '#c0caf5',
      '#292e42',
      '#565f89',
      '#bb9af7',
      '#9ece6a',
      '#ff9e64',
      '#7aa2f7',
      '#2ac3de',
      '#73daca',
      '#9ece6a',
      '#f7768e',
      it
    ),
    light: c(
      '#e1e2e7',
      '#3760bf',
      '#c4c8da',
      '#848cb5',
      '#9854f1',
      '#587539',
      '#b15c00',
      '#2e7de9',
      '#007197',
      '#387068',
      '#587539',
      '#f52a65',
      it
    )
  },
  catppuccin: {
    label: 'Catppuccin',
    dark: c(
      '#1e1e2e',
      '#cdd6f4',
      '#313244',
      '#7f849c',
      '#cba6f7',
      '#a6e3a1',
      '#fab387',
      '#89b4fa',
      '#f9e2af',
      '#b4befe',
      '#a6e3a1',
      '#f38ba8',
      it
    ),
    light: c(
      '#eff1f5',
      '#4c4f69',
      '#ccd0da',
      '#8c8fa1',
      '#8839ef',
      '#40a02b',
      '#fe640b',
      '#1e66f5',
      '#df8e1d',
      '#7287fd',
      '#40a02b',
      '#d20f39',
      it
    )
  },
  rosepine: {
    label: 'Rosé Pine',
    dark: c(
      '#191724',
      '#e0def4',
      '#26233a',
      '#6e6a86',
      '#31748f',
      '#f6c177',
      '#f6c177',
      '#ebbcba',
      '#9ccfd8',
      '#c4a7e7',
      '#9ccfd8',
      '#eb6f92',
      it
    ),
    light: c(
      '#faf4ed',
      '#575279',
      '#f2e9e1',
      '#9893a5',
      '#286983',
      '#ea9d34',
      '#ea9d34',
      '#d7827e',
      '#56949f',
      '#907aa9',
      '#56949f',
      '#b4637a',
      it
    )
  },
  nord: {
    label: 'Nord',
    dark: c(
      '#2e3440',
      '#d8dee9',
      '#3b4252',
      '#616e88',
      '#81a1c1',
      '#a3be8c',
      '#b48ead',
      '#88c0d0',
      '#8fbcbb',
      '#d8dee9',
      '#a3be8c',
      '#bf616a'
    ),
    light: c(
      '#eceff4',
      '#2e3440',
      '#d8dee9',
      '#7b88a1',
      '#5e81ac',
      '#5f7f45',
      '#8f5e86',
      '#3b7d8c',
      '#3f7f7d',
      '#2e3440',
      '#5f7f45',
      '#bf616a'
    )
  },
  vitesse: {
    label: 'Vitesse',
    dark: c(
      '#121212',
      '#dbd7ca',
      '#252525',
      '#758575',
      '#4d9375',
      '#c98a7d',
      '#4c9a91',
      '#80a665',
      '#5da994',
      '#b8a965',
      '#4d9375',
      '#cb7676'
    ),
    light: c(
      '#ffffff',
      '#393a34',
      '#eeeeee',
      '#a0ada0',
      '#1e754f',
      '#b56959',
      '#2f798a',
      '#59873a',
      '#2e8f82',
      '#998418',
      '#1e754f',
      '#ab5959'
    )
  },
  gruvbox: {
    label: 'Gruvbox',
    dark: c(
      '#282828',
      '#ebdbb2',
      '#3c3836',
      '#928374',
      '#fb4934',
      '#b8bb26',
      '#d3869b',
      '#8ec07c',
      '#fabd2f',
      '#83a598',
      '#b8bb26',
      '#fb4934',
      it
    ),
    light: c(
      '#fbf1c7',
      '#3c3836',
      '#ebdbb2',
      '#928374',
      '#9d0006',
      '#79740e',
      '#8f3f71',
      '#427b58',
      '#b57614',
      '#076678',
      '#79740e',
      '#9d0006',
      it
    )
  },
  solarized: {
    label: 'Solarized',
    dark: c(
      '#002b36',
      '#93a1a1',
      '#073642',
      '#586e75',
      '#859900',
      '#2aa198',
      '#d33682',
      '#268bd2',
      '#b58900',
      '#cb4b16',
      '#859900',
      '#dc322f'
    ),
    light: c(
      '#fdf6e3',
      '#586e75',
      '#eee8d5',
      '#93a1a1',
      '#859900',
      '#2aa198',
      '#d33682',
      '#268bd2',
      '#b58900',
      '#cb4b16',
      '#859900',
      '#dc322f'
    )
  },
  ink: {
    label: 'Ink',
    dark: c(
      '#0b0b0b',
      '#bdbdbd',
      '#262626',
      '#6a6a6a',
      '#ffffff',
      '#8f8f8f',
      '#ffffff',
      '#ffffff',
      '#e2e2e2',
      '#bdbdbd',
      '#3fb950',
      '#f85149',
      { kwWeight: 700, comItalic: true }
    ),
    light: c(
      '#f7f7f7',
      '#3a3a3a',
      '#e3e3e3',
      '#9a9a9a',
      '#000000',
      '#6b6b6b',
      '#000000',
      '#000000',
      '#1a1a1a',
      '#3a3a3a',
      '#1a7f37',
      '#cf222e',
      { kwWeight: 700, comItalic: true }
    )
  }
} satisfies Record<string, { label: string; dark: CodeColors; light: CodeColors }>
export type CodeThemeId = keyof typeof CODE_THEMES
export const CODE_THEME_IDS = Object.keys(CODE_THEMES) as CodeThemeId[]

export function codeColors(id: CodeThemeId, mode: 'dark' | 'light'): CodeColors {
  return CODE_THEMES[id][mode]
}

// ------------------------------------------------------------------ the look

export interface ThemeType {
  // The Preview's own ground; '' is the pane's (the app palette's --bg).
  bgColor: string
  body: string
  head: string
  code: string
  size: number
  lh: number
  bodyW: number
  strength: number
  bodyColor: string
  measure: number
  align: 'left' | 'center'
  para: number
  headW: number
  headScale: number
  headTrack: number
  headCase: 'none' | 'uppercase' | 'small-caps'
  headColor: string
  strongW: number
  fullStrong: boolean
  strongColor: string
  linkColor: string
  markerColor: string
  codeW: number
  codeSize: number
  inline: 'today' | 'chip' | 'tint' | 'outline' | 'plain'
  ligatures: boolean
}
export interface ThemePrompt {
  style: PromptStyle
  accent: string
  tint: number
  // 'body' | 'head' | 'code' follow the theme's own fonts; anything else is a family.
  font: string
  w: number
  size: number
  color: string
  italic: boolean
}
export interface ThemeCode {
  theme: CodeThemeId
  bg: 'theme' | 'blend' | 'pane'
  radius: number
  diff: number
  lineNums: boolean
}
export interface Look {
  type: ThemeType
  prompt: ThemePrompt
  code: ThemeCode
}
export interface PreviewTheme extends Look {
  id: string
  name: string
  builtin?: true
}

// [min, max, step] — the editor's sliders and the clamp on load are one table.
// `measure` at its max reads as "no measure".
export const TYPE_RANGES = {
  size: [11, 20, 0.5],
  lh: [1.3, 2, 0.05],
  bodyW: [300, 700, 25],
  strength: [40, 100, 2],
  measure: [44, 112, 2],
  para: [0.3, 1.3, 0.05],
  headW: [300, 800, 25],
  headScale: [0.85, 1.8, 0.05],
  headTrack: [-0.04, 0.14, 0.005],
  strongW: [500, 800, 25],
  codeW: [300, 600, 25],
  codeSize: [0.75, 1.05, 0.01]
} as const satisfies Partial<Record<keyof ThemeType, readonly [number, number, number]>>
export const PROMPT_RANGES = {
  tint: [0, 40, 1],
  w: [300, 700, 25],
  size: [0.9, 1.4, 0.02]
} as const satisfies Partial<Record<keyof ThemePrompt, readonly [number, number, number]>>
export const CODE_RANGES = {
  radius: [0, 14, 1],
  diff: [6, 40, 1]
} as const satisfies Partial<Record<keyof ThemeCode, readonly [number, number, number]>>
export const MEASURE_NONE = TYPE_RANGES.measure[1]

// The Preview exactly as it was before themes: 13px Inter at half strength,
// the terminal font for code, no highlighting, the accent-bar prompt.
export const TODAY: Look = {
  type: {
    bgColor: '',
    body: 'Inter',
    head: 'Inter',
    code: TERMINAL_FONT,
    size: 13,
    lh: 1.55,
    bodyW: 400,
    strength: 50,
    bodyColor: '',
    measure: MEASURE_NONE,
    align: 'left',
    para: 0.6,
    headW: 700,
    headScale: 1.15,
    headTrack: 0,
    headCase: 'none',
    headColor: '',
    strongW: 700,
    fullStrong: false,
    strongColor: '',
    linkColor: '',
    markerColor: '',
    codeW: 400,
    codeSize: 0.885,
    inline: 'today',
    ligatures: false
  },
  prompt: {
    style: 'current',
    accent: '',
    tint: 0,
    font: 'body',
    w: 400,
    size: 1,
    color: '',
    italic: false
  },
  code: { theme: 'plain', bg: 'theme', radius: 6, diff: 15, lineNums: false }
}

// A built-in: a pairing (playground-tuned type), a prompt treatment, a code theme.
function builtin(
  id: string,
  name: string,
  type: Partial<ThemeType>,
  style: PromptStyle,
  theme: CodeThemeId
): PreviewTheme {
  return {
    id,
    name,
    builtin: true,
    type: { ...TODAY.type, inline: 'chip', fullStrong: true, ...type },
    prompt: { ...TODAY.prompt, style, tint: PROMPT_TINTS[style] ?? 10 },
    code: { theme, bg: 'theme', radius: 8, diff: 16, lineNums: false }
  }
}

export const TODAY_ID = 'today'

export const BUILTIN_THEMES: PreviewTheme[] = [
  { id: TODAY_ID, name: 'Today', builtin: true, ...TODAY },
  builtin(
    'refined',
    'Inter, refined',
    {
      code: 'JetBrains Mono',
      size: 14,
      lh: 1.7,
      headW: 600,
      headScale: 1.25,
      headTrack: -0.01,
      strength: 72,
      measure: 72,
      para: 0.8
    },
    'gutter',
    'github'
  ),
  builtin(
    'editorial',
    'Editorial',
    {
      body: 'Source Serif 4',
      code: 'JetBrains Mono',
      size: 15,
      lh: 1.65,
      headW: 650,
      headScale: 1.25,
      headTrack: -0.01,
      strength: 84,
      measure: 68,
      para: 0.8
    },
    'gutter',
    'github'
  ),
  builtin(
    'literata',
    'Literata',
    {
      body: 'Literata',
      head: 'Inter Tight',
      code: 'IBM Plex Mono',
      size: 14.5,
      lh: 1.7,
      headW: 650,
      headScale: 1.25,
      strength: 84,
      measure: 66,
      para: 0.8
    },
    'card',
    'one'
  ),
  builtin(
    'newsroom',
    'Newsroom',
    {
      body: 'Newsreader',
      head: 'Newsreader',
      code: 'JetBrains Mono',
      size: 16,
      lh: 1.6,
      headW: 600,
      headScale: 1.45,
      headTrack: -0.015,
      strength: 84,
      measure: 64,
      para: 0.75
    },
    'heading',
    'vitesse'
  ),
  builtin(
    'plex',
    'Plex',
    {
      body: 'IBM Plex Sans',
      head: 'IBM Plex Serif',
      code: 'IBM Plex Mono',
      size: 14,
      lh: 1.65,
      headW: 600,
      headScale: 1.3,
      strength: 78,
      measure: 72,
      para: 0.75
    },
    'band',
    'github'
  ),
  builtin(
    'plex-serif',
    'Plex Serif',
    {
      body: 'IBM Plex Serif',
      head: 'IBM Plex Sans',
      code: 'IBM Plex Mono',
      size: 14,
      lh: 1.7,
      headW: 600,
      headScale: 0.9,
      headTrack: 0.08,
      headCase: 'uppercase',
      strength: 80,
      measure: 68,
      para: 0.8
    },
    'ruled',
    'nord'
  ),
  builtin(
    'geist',
    'Geist',
    {
      body: 'Geist',
      head: 'Geist',
      code: 'Geist Mono',
      size: 14,
      lh: 1.65,
      headW: 600,
      headScale: 1.25,
      headTrack: -0.02,
      strength: 70,
      measure: 72,
      para: 0.75
    },
    'chevron',
    'vitesse'
  ),
  builtin(
    'hyperlegible',
    'Hyperlegible',
    {
      body: 'Atkinson Hyperlegible Next',
      head: 'Atkinson Hyperlegible Next',
      code: 'Atkinson Hyperlegible Mono',
      size: 14.5,
      lh: 1.65,
      headW: 700,
      headScale: 1.2,
      strength: 88,
      measure: 70,
      para: 0.8
    },
    'outline',
    'github'
  ),
  builtin(
    'instrument',
    'Instrument',
    {
      body: 'Instrument Sans',
      head: 'Instrument Serif',
      code: 'JetBrains Mono',
      size: 14.5,
      lh: 1.6,
      headW: 400,
      headScale: 1.65,
      headTrack: -0.01,
      strength: 78,
      measure: 70,
      para: 0.75
    },
    'quote',
    'rosepine'
  ),
  builtin(
    'dm',
    'DM',
    {
      body: 'DM Sans',
      head: 'DM Serif Display',
      code: 'DM Mono',
      size: 14,
      lh: 1.65,
      headW: 400,
      headScale: 1.5,
      strength: 76,
      measure: 70,
      para: 0.75
    },
    'bubble',
    'catppuccin'
  ),
  builtin(
    'soft',
    'Soft display',
    {
      body: 'Figtree',
      head: 'Fraunces',
      code: 'Fira Code',
      size: 14.5,
      lh: 1.65,
      headW: 600,
      headScale: 1.4,
      headTrack: -0.01,
      strength: 78,
      measure: 68,
      para: 0.8,
      inline: 'tint'
    },
    'card',
    'rosepine'
  ),
  builtin(
    'technical',
    'Technical',
    {
      body: 'Hanken Grotesk',
      head: 'Space Grotesk',
      code: 'Space Mono',
      size: 14,
      lh: 1.65,
      headW: 600,
      headScale: 1.3,
      headTrack: -0.02,
      strength: 74,
      measure: 72,
      para: 0.75,
      inline: 'outline',
      codeSize: 0.84
    },
    'chevron',
    'tokyo'
  ),
  builtin(
    'bookish',
    'Bookish',
    {
      body: 'Lora',
      head: 'Manrope',
      code: 'JetBrains Mono',
      size: 15,
      lh: 1.7,
      headW: 700,
      headScale: 0.9,
      headTrack: 0.1,
      headCase: 'uppercase',
      strength: 82,
      measure: 66,
      para: 0.85
    },
    'ruled',
    'gruvbox'
  ),
  builtin(
    'spectral',
    'Spectral',
    {
      body: 'Spectral',
      head: 'Karla',
      code: 'Source Code Pro',
      size: 15.5,
      lh: 1.65,
      headW: 700,
      headScale: 1.2,
      strength: 84,
      measure: 66,
      para: 0.8
    },
    'dot',
    'solarized'
  ),
  builtin(
    'classic',
    'Classic',
    {
      body: 'Crimson Pro',
      head: 'Work Sans',
      code: 'IBM Plex Mono',
      size: 17,
      lh: 1.55,
      headW: 600,
      headScale: 1.1,
      strength: 86,
      measure: 64,
      para: 0.75,
      codeSize: 0.8
    },
    'quote',
    'gruvbox'
  ),
  builtin(
    'source',
    'Source',
    {
      body: 'Source Sans 3',
      head: 'Source Serif 4',
      code: 'Source Code Pro',
      size: 15,
      lh: 1.6,
      headW: 600,
      headScale: 1.35,
      strength: 80,
      measure: 70,
      para: 0.75
    },
    'outline',
    'one'
  ),
  builtin(
    'redhat',
    'Red Hat',
    {
      body: 'Red Hat Text',
      head: 'Red Hat Display',
      code: 'Red Hat Mono',
      size: 14.5,
      lh: 1.6,
      headW: 700,
      headScale: 1.3,
      headTrack: -0.01,
      strength: 78,
      measure: 70,
      para: 0.75
    },
    'tab',
    'github'
  ),
  builtin(
    'bricolage',
    'Bricolage',
    {
      body: 'Onest',
      head: 'Bricolage Grotesque',
      code: 'Martian Mono',
      size: 14,
      lh: 1.65,
      headW: 700,
      headScale: 1.4,
      headTrack: -0.02,
      strength: 76,
      measure: 70,
      para: 0.75,
      inline: 'tint',
      codeSize: 0.8
    },
    'marker',
    'tokyo'
  ),
  builtin(
    'merriweather',
    'Merriweather',
    {
      body: 'Merriweather',
      head: 'Libre Franklin',
      code: 'JetBrains Mono',
      size: 13.5,
      lh: 1.8,
      headW: 700,
      headScale: 1.2,
      strength: 82,
      measure: 68,
      para: 0.85
    },
    'gutter',
    'nord'
  ),
  builtin(
    'public',
    'Public',
    {
      body: 'Public Sans',
      head: 'Young Serif',
      code: 'Fira Code',
      size: 14,
      lh: 1.65,
      headW: 400,
      headScale: 1.4,
      strength: 76,
      measure: 70,
      para: 0.75
    },
    'bubble',
    'one'
  ),
  builtin(
    'georgia',
    'Georgia-ish',
    {
      body: 'Gelasio',
      code: 'Cascadia Mono',
      size: 15,
      lh: 1.65,
      headW: 700,
      headScale: 1.15,
      strength: 84,
      measure: 68,
      para: 0.8
    },
    'current',
    'github'
  ),
  builtin(
    'mono',
    'All mono',
    {
      body: 'JetBrains Mono',
      head: 'JetBrains Mono',
      code: 'JetBrains Mono',
      size: 13,
      lh: 1.7,
      headW: 700,
      headScale: 1.1,
      strength: 74,
      measure: 84,
      para: 0.8,
      inline: 'tint',
      codeSize: 0.95
    },
    'chevron',
    'ink'
  )
]

// ------------------------------------------------------------------ validation

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i
const FONT_NAMES = new Set(THEME_FONTS.map((f) => f.name))

function num(
  value: unknown,
  [min, max]: readonly [number, number, number],
  fallback: number
): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback
}
function color(value: unknown): string {
  return typeof value === 'string' && HEX.test(value) ? value.toLowerCase() : ''
}
function pick<T>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}
function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}
function font(value: unknown, fallback: string, extra: readonly string[] = []): string {
  return typeof value === 'string' && (FONT_NAMES.has(value) || extra.includes(value))
    ? value
    : fallback
}
function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

// Every theme that reaches the store passes through here: the state file and
// the clipboard are external data, and these values end up inside CSS. Unknown
// keys are dropped, every number is clamped to the editor's own range, colours
// are hex or nothing, fonts come from the catalogue. Missing parts fall back to
// Today's, so a partial theme is still a whole one.
export function normalizeLook(raw: unknown): Look {
  const r = record(raw)
  const t = record(r.type)
  const p = record(r.prompt)
  const k = record(r.code)
  const d = TODAY
  const R = TYPE_RANGES
  return {
    type: {
      bgColor: color(t.bgColor),
      body: font(t.body, d.type.body),
      head: font(t.head, d.type.head),
      code: font(t.code, d.type.code, [TERMINAL_FONT]),
      size: num(t.size, R.size, d.type.size),
      lh: num(t.lh, R.lh, d.type.lh),
      bodyW: num(t.bodyW, R.bodyW, d.type.bodyW),
      strength: num(t.strength, R.strength, d.type.strength),
      bodyColor: color(t.bodyColor),
      measure: num(t.measure, R.measure, d.type.measure),
      align: pick(t.align, ['left', 'center'] as const, d.type.align),
      para: num(t.para, R.para, d.type.para),
      headW: num(t.headW, R.headW, d.type.headW),
      headScale: num(t.headScale, R.headScale, d.type.headScale),
      headTrack: num(t.headTrack, R.headTrack, d.type.headTrack),
      headCase: pick(t.headCase, ['none', 'uppercase', 'small-caps'] as const, d.type.headCase),
      headColor: color(t.headColor),
      strongW: num(t.strongW, R.strongW, d.type.strongW),
      fullStrong: bool(t.fullStrong, d.type.fullStrong),
      strongColor: color(t.strongColor),
      linkColor: color(t.linkColor),
      markerColor: color(t.markerColor),
      codeW: num(t.codeW, R.codeW, d.type.codeW),
      codeSize: num(t.codeSize, R.codeSize, d.type.codeSize),
      inline: pick(t.inline, ['today', 'chip', 'tint', 'outline', 'plain'] as const, d.type.inline),
      ligatures: bool(t.ligatures, d.type.ligatures)
    },
    prompt: {
      style: pick(
        p.style,
        PROMPT_STYLES.map((s) => s.id),
        d.prompt.style
      ),
      accent: color(p.accent),
      tint: num(p.tint, PROMPT_RANGES.tint, d.prompt.tint),
      font: font(p.font, d.prompt.font, PROMPT_FOLLOW),
      w: num(p.w, PROMPT_RANGES.w, d.prompt.w),
      size: num(p.size, PROMPT_RANGES.size, d.prompt.size),
      color: color(p.color),
      italic: bool(p.italic, d.prompt.italic)
    },
    code: {
      theme: pick(k.theme, CODE_THEME_IDS, d.code.theme),
      bg: pick(k.bg, ['theme', 'blend', 'pane'] as const, d.code.bg),
      radius: num(k.radius, CODE_RANGES.radius, d.code.radius),
      diff: num(k.diff, CODE_RANGES.diff, d.code.diff),
      lineNums: bool(k.lineNums, d.code.lineNums)
    }
  }
}

const NAME_MAX = 60

// A user theme from untrusted input, or null if it isn't one. Built-in status
// is never read from outside: anything that comes in is the user's.
export function normalizeTheme(raw: unknown): PreviewTheme | null {
  const r = record(raw)
  if (typeof r.id !== 'string' || !r.id || typeof r.name !== 'string') return null
  const name = r.name.trim().slice(0, NAME_MAX)
  if (!name) return null
  return { id: r.id, name, ...normalizeLook(r) }
}

// The persisted list: each entry validated, ids unique, no id that shadows a
// built-in (a built-in's id is how the selection finds it).
export function normalizeThemes(raw: unknown): PreviewTheme[] {
  if (!Array.isArray(raw)) return []
  const taken = new Set(BUILTIN_THEMES.map((t) => t.id))
  const out: PreviewTheme[] = []
  for (const entry of raw) {
    const theme = normalizeTheme(entry)
    if (!theme || taken.has(theme.id)) continue
    taken.add(theme.id)
    out.push(theme)
  }
  return out
}

// "Name", "Name 2", "Name 3"… — the first one not in use.
export function uniqueName(base: string, taken: readonly string[]): string {
  const name = base.trim().slice(0, NAME_MAX) || 'Theme'
  if (!taken.includes(name)) return name
  for (let n = 2; ; n++) if (!taken.includes(`${name} ${n}`)) return `${name} ${n}`
}

// A user theme carrying another's look under a new id and name.
export function copyTheme(source: Look, id: string, name: string): PreviewTheme {
  return { id, name, ...normalizeLook(JSON.parse(JSON.stringify(source))) }
}

// What export writes: the look and its name, never the id (an import gets a
// fresh one, so importing the same theme twice can't collide).
export function exportTheme(theme: PreviewTheme): string {
  const { name, type, prompt, code } = theme
  return JSON.stringify({ arcPreviewTheme: 1, name, type, prompt, code }, null, 2)
}

// The clipboard's text as a theme, or null. Accepts exactly what exportTheme writes.
export function importTheme(
  text: string,
  id: string,
  taken: readonly string[]
): PreviewTheme | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return null
  }
  const r = record(parsed)
  if (r.arcPreviewTheme !== 1 || typeof r.name !== 'string') return null
  const theme = normalizeTheme({ ...r, id })
  return theme && { ...theme, name: uniqueName(theme.name, taken) }
}

// ------------------------------------------------------------------ CSS

export function promptFontName(look: Look): string {
  const { font } = look.prompt
  return font === 'body'
    ? look.type.body
    : font === 'head'
      ? look.type.head
      : font === 'code'
        ? look.type.code
        : font
}

// The custom properties a theme becomes, for Conversation.svelte's CSS. Every
// value is either a number we clamped, a hex we matched, a catalogue name, or
// a literal of ours — normalizeLook is what makes building CSS from it safe.
export function themeVars(
  look: Look,
  mode: 'dark' | 'light',
  terminalStack: string
): Record<string, string> {
  const { type: t, prompt: p, code: k } = look
  const cc = codeColors(k.theme, mode)
  const accent = p.accent || 'var(--accent)'
  const head = t.headColor || 'var(--fg)'
  const codeBg =
    k.bg === 'pane'
      ? 'var(--page-bg)'
      : k.bg === 'blend'
        ? `color-mix(in srgb, ${cc.bg} 45%, var(--page-bg))`
        : cc.bg
  // A themed block on its own ground needs no edge; the plain one, or one
  // painted on the pane's ground, does.
  const edge = k.bg === 'theme' && k.theme !== 'plain' ? 'transparent' : cc.border
  return {
    // The ground, and the "subtle" one a few surfaces sit on. Auto keeps the
    // palette's own pair exactly (Today depends on it); a chosen ground gets a
    // subtle tone mixed from it, since the palette's would clash.
    '--page-bg': t.bgColor || 'var(--bg)',
    '--page-subtle': t.bgColor
      ? `color-mix(in srgb, var(--fg) 5%, ${t.bgColor})`
      : 'var(--bg-subtle)',
    '--body-font': fontStack(t.body, terminalStack),
    '--head-font': fontStack(t.head, terminalStack),
    '--code-font': fontStack(t.code, terminalStack),
    '--size': `${t.size}px`,
    '--lh': String(t.lh),
    '--body-w': String(t.bodyW),
    '--body-col': `color-mix(in srgb, ${t.bodyColor || 'var(--fg)'} ${t.strength}%, transparent)`,
    '--measure': t.measure >= MEASURE_NONE ? 'none' : `${t.measure}ch`,
    '--para': `${t.para}em`,
    '--head-w': String(t.headW),
    '--hs': String(t.headScale),
    '--head-track': `${t.headTrack}em`,
    '--head-case': t.headCase === 'uppercase' ? 'uppercase' : 'none',
    '--head-caps': t.headCase === 'small-caps' ? 'all-small-caps' : 'normal',
    '--head-col': head,
    '--strong-w': String(t.strongW),
    '--strong-col': t.strongColor || (t.fullStrong ? head : 'currentColor'),
    '--link-col': t.linkColor || 'var(--accent)',
    '--marker-col': t.markerColor || 'currentColor',
    '--code-w': String(t.codeW),
    '--code-size': String(t.codeSize),
    '--lig': t.ligatures ? 'normal' : 'none',
    '--pa': accent,
    '--pa-bg': `color-mix(in srgb, ${accent} ${p.tint}%, transparent)`,
    '--pa-bg-strong': `color-mix(in srgb, ${accent} ${Math.max(p.tint, 8)}%, transparent)`,
    '--prompt-font': fontStack(promptFontName(look), terminalStack),
    '--prompt-w': String(p.w),
    '--prompt-size': String(p.size),
    '--prompt-col': p.color || 'var(--fg)',
    '--prompt-style': p.italic ? 'italic' : 'normal',
    '--c-bg': codeBg,
    '--c-edge': edge,
    '--c-fg': cc.fg,
    '--c-com': cc.com,
    '--c-kw': cc.kw,
    '--c-str': cc.str,
    '--c-num': cc.num,
    '--c-fn': cc.fn,
    '--c-type': cc.type,
    '--c-prop': cc.prop,
    '--c-add': cc.add,
    '--c-del': cc.del,
    '--c-kw-w': String(cc.kwWeight ?? 'inherit'),
    '--c-com-style': cc.comItalic ? 'italic' : 'normal',
    '--c-radius': `${k.radius}px`,
    '--diff': `${k.diff}%`
  }
}

export function themeClass(look: Look): string {
  const { type: t, prompt: p, code: k } = look
  return [
    `ps-${p.style}`,
    `ic-${t.inline}`,
    k.lineNums && 'lnums',
    t.align === 'center' && 'center'
  ]
    .filter(Boolean)
    .join(' ')
}

export function styleString(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([name, value]) => `${name}:${value}`)
    .join(';')
}
