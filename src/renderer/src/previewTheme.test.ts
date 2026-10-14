import { describe, expect, it } from 'vitest'
import {
  BUILTIN_THEMES,
  MEASURE_NONE,
  TERMINAL_FONT,
  TODAY,
  TODAY_ID,
  exportTheme,
  fontStack,
  importTheme,
  normalizeLook,
  normalizeThemes,
  promptFontName,
  themeClass,
  themeVars,
  terminalStack,
  uiStack,
  uniqueName
} from './previewTheme'
import { splitLines } from './highlight'

describe('normalizeLook', () => {
  it('turns nothing into Today', () => {
    expect(normalizeLook(undefined)).toEqual(TODAY)
    expect(normalizeLook({ type: 'nope', prompt: 3 })).toEqual(TODAY)
  })

  it('keeps every built-in exactly as written', () => {
    for (const theme of BUILTIN_THEMES) {
      const { type, prompt, code, app } = theme
      expect(normalizeLook({ type, prompt, code, app })).toEqual({ type, prompt, code, app })
    }
  })

  // The App section (2026-10-14): only the faces the old pickers offered, and
  // a theme from before it existed gets Today's — the pickers' old defaults.
  it("takes the app fonts only from the old pickers' lists", () => {
    const look = normalizeLook({ app: { terminal: 'JetBrains Mono', ui: 'Lora' } })
    expect(look.app).toEqual({ terminal: 'JetBrains Mono', ui: TODAY.app.ui })
    // A catalogue mono the terminal was never verified with is refused.
    expect(normalizeLook({ app: { terminal: 'Geist Mono' } }).app.terminal).toBe(TODAY.app.terminal)
    expect(normalizeLook({ type: { body: 'Lora' } }).app).toEqual(TODAY.app)
    expect(TODAY.app).toEqual({ terminal: 'Cascadia Mono', ui: 'Inter' })
  })

  it("pairs a built-in's app fonts with its own, where the app can take them", () => {
    const plex = BUILTIN_THEMES.find((t) => t.id === 'plex')!
    expect(plex.app).toEqual({ terminal: 'IBM Plex Mono', ui: 'IBM Plex Sans' })
    // Geist Mono and Geist are neither a terminal nor a chrome font.
    const geist = BUILTIN_THEMES.find((t) => t.id === 'geist')!
    expect(geist.app).toEqual(TODAY.app)
  })

  it('builds the app stacks exactly as the old pickers did', () => {
    expect(terminalStack(TODAY)).toBe('"Cascadia Mono", Consolas, monospace')
    expect(uiStack({ ...TODAY, app: { terminal: 'Consolas', ui: 'Roboto' } })).toBe(
      "'Roboto', system-ui, sans-serif"
    )
  })

  it('clamps numbers to the editor ranges and drops non-numbers', () => {
    const look = normalizeLook({
      type: { size: 400, lh: -1, strength: 'loud' },
      code: { radius: 99 }
    })
    expect(look.type.size).toBe(20)
    expect(look.type.lh).toBe(1.3)
    expect(look.type.strength).toBe(TODAY.type.strength)
    expect(look.code.radius).toBe(14)
    expect(normalizeLook({ type: { size: Infinity } }).type.size).toBe(TODAY.type.size)
  })

  it('accepts colours only as hex — nothing else can reach a CSS value', () => {
    const look = normalizeLook({
      type: { bodyColor: '#ABC', headColor: 'red', linkColor: '#123456;position:fixed' },
      prompt: { accent: 'url(x)', color: '#a1b2c3' }
    })
    expect(look.type.bodyColor).toBe('#abc')
    expect(look.type.headColor).toBe('')
    expect(look.type.linkColor).toBe('')
    expect(look.prompt.accent).toBe('')
    expect(look.prompt.color).toBe('#a1b2c3')
  })

  it('takes fonts only from the catalogue', () => {
    const look = normalizeLook({
      type: { body: 'Lora', head: "Evil'; }", code: TERMINAL_FONT },
      prompt: { font: 'code' }
    })
    expect(look.type.body).toBe('Lora')
    expect(look.type.head).toBe(TODAY.type.head)
    expect(look.type.code).toBe(TERMINAL_FONT)
    expect(look.prompt.font).toBe('code')
    // The terminal sentinel is a code font only.
    expect(normalizeLook({ type: { body: TERMINAL_FONT } }).type.body).toBe(TODAY.type.body)
  })

  it('takes enums only from their sets', () => {
    const look = normalizeLook({
      prompt: { style: 'marquee' },
      code: { theme: 'solarized', bg: 'neon' },
      type: { headCase: 'small-caps', inline: 'blink' }
    })
    expect(look.prompt.style).toBe(TODAY.prompt.style)
    expect(look.code.theme).toBe('solarized')
    expect(look.code.bg).toBe(TODAY.code.bg)
    expect(look.type.headCase).toBe('small-caps')
    expect(look.type.inline).toBe(TODAY.type.inline)
  })
})

describe('normalizeThemes', () => {
  it('keeps valid user themes, in order, and drops the rest', () => {
    const themes = normalizeThemes([
      { id: 'user-a', name: '  Evening  ', type: { body: 'Lora' } },
      { id: 'user-b', name: '' },
      { name: 'no id' },
      'junk',
      { id: 'user-a', name: 'duplicate id' },
      { id: TODAY_ID, name: 'shadows a built-in' },
      { id: 'user-c', name: 'Morning', builtin: true }
    ])
    expect(themes.map((t) => [t.id, t.name])).toEqual([
      ['user-a', 'Evening'],
      ['user-c', 'Morning']
    ])
    expect(themes[0].type.body).toBe('Lora')
    // Built-in status never comes from outside.
    expect(themes[1].builtin).toBeUndefined()
    expect(normalizeThemes('nope')).toEqual([])
  })
})

describe('uniqueName', () => {
  it('numbers a taken name from 2', () => {
    expect(uniqueName('Editorial', [])).toBe('Editorial')
    expect(uniqueName('Editorial', ['Editorial'])).toBe('Editorial 2')
    expect(uniqueName('Editorial', ['Editorial', 'Editorial 2'])).toBe('Editorial 3')
    expect(uniqueName('   ', [])).toBe('Theme')
  })
})

describe('export / import', () => {
  const editorial = BUILTIN_THEMES.find((t) => t.id === 'editorial')!

  it('round-trips a theme under a fresh id and a free name', () => {
    const text = exportTheme(editorial)
    expect(text).not.toContain('"id"')
    const imported = importTheme(text, 'user-new', ['Editorial'])!
    expect(imported.id).toBe('user-new')
    expect(imported.name).toBe('Editorial 2')
    expect(imported.builtin).toBeUndefined()
    expect({ ...imported.type }).toEqual(editorial.type)
    expect(imported.code).toEqual(editorial.code)
    expect(imported.app).toEqual(editorial.app)
  })

  it('refuses anything that is not an exported theme', () => {
    expect(importTheme('not json', 'x', [])).toBeNull()
    expect(importTheme('{"name":"no marker"}', 'x', [])).toBeNull()
    expect(importTheme('{"arcPreviewTheme":1}', 'x', [])).toBeNull()
  })

  it('validates what it imports', () => {
    const imported = importTheme(
      JSON.stringify({
        arcPreviewTheme: 1,
        name: 'Loud',
        type: { size: 900, bodyColor: 'javascript:' }
      }),
      'x',
      []
    )!
    expect(imported.type.size).toBe(20)
    expect(imported.type.bodyColor).toBe('')
  })
})

describe('themeVars', () => {
  it("draws Today with the palette's own tokens and the terminal font", () => {
    const vars = themeVars(TODAY, 'dark', 'TERM')
    expect(vars['--code-font']).toBe('TERM')
    expect(vars['--page-bg']).toBe('var(--bg)')
    expect(vars['--page-subtle']).toBe('var(--bg-subtle)')
    expect(vars['--body-col']).toBe('color-mix(in srgb, var(--fg) 50%, transparent)')
    expect(vars['--measure']).toBe('none')
    expect(vars['--strong-col']).toBe('currentColor')
    expect(vars['--c-kw']).toBe('var(--fg)')
  })

  it('switches a code theme with the mode and follows a chosen ground', () => {
    const look = normalizeLook({
      type: { bgColor: '#101820', measure: 70 },
      code: { theme: 'github', bg: 'pane' }
    })
    expect(themeVars(look, 'dark', '')['--c-kw']).toBe('#ff7b72')
    expect(themeVars(look, 'light', '')['--c-kw']).toBe('#cf222e')
    const vars = themeVars(look, 'dark', '')
    expect(vars['--page-bg']).toBe('#101820')
    expect(vars['--c-bg']).toBe('var(--page-bg)')
    expect(vars['--measure']).toBe('70ch')
    expect(MEASURE_NONE).toBeGreaterThan(70)
  })

  it('classes the look by prompt treatment, inline code and the two toggles', () => {
    expect(themeClass(TODAY)).toBe('ps-current ic-today')
    const look = normalizeLook({
      prompt: { style: 'bubble' },
      type: { inline: 'tint', align: 'center' },
      code: { lineNums: true }
    })
    expect(themeClass(look)).toBe('ps-bubble ic-tint lnums center')
  })

  it('resolves a following prompt font, and stacks fonts by kind', () => {
    const look = normalizeLook({ type: { head: 'Lora' }, prompt: { font: 'head' } })
    expect(promptFontName(look)).toBe('Lora')
    expect(fontStack('Lora', '')).toBe("'Lora', Georgia, serif")
    expect(fontStack('Geist Mono', '')).toContain('monospace')
    expect(fontStack(TERMINAL_FONT, 'TERM')).toBe('TERM')
  })
})

describe('splitLines', () => {
  it('closes and reopens a span that crosses a line break', () => {
    const html = 'a <span class="c">/* one\ntwo */</span> b\nc'
    expect(splitLines(html)).toEqual([
      'a <span class="c">/* one</span>',
      '<span class="c">two */</span> b',
      'c'
    ])
  })

  it('keeps empty lines', () => {
    expect(splitLines('x\n\ny')).toEqual(['x', '', 'y'])
  })
})
