<script lang="ts">
  import Conversation from './Conversation.svelte'
  import { SAMPLE } from './themeSample'
  import {
    CODE_RANGES,
    CODE_THEMES,
    CODE_THEME_IDS,
    MEASURE_NONE,
    PROMPT_RANGES,
    PROMPT_STYLES,
    PROMPT_TINTS,
    TERMINAL_FONT,
    THEME_FONTS,
    TODAY,
    TYPE_RANGES,
    codeColors,
    exportTheme,
    fontStack,
    importTheme,
    terminalStack,
    type FontKind,
    type PreviewTheme,
    type ThemeApp,
    type ThemeCode,
    type ThemePrompt,
    type ThemeType
  } from './previewTheme'
  import {
    activeTheme,
    addTheme,
    allThemes,
    deleteTheme,
    duplicateTheme,
    editableTheme,
    newThemeId,
    renameTheme,
    themeNames,
    ui
  } from './sessions.svelte'
  import { FONTS, UI_FONTS, type FontOption, type Mode } from './theme'

  // The theme editor (kickoff doc, "Preview themes"): the playground's layout
  // inside the app. Tabs on the left; on the right the sample conversation,
  // rendered by the same Conversation component the Preview uses. Every
  // control writes the selected theme directly — a built-in is forked into a
  // user copy by the first edit — and the store's persist effect saves it.
  let {
    mode,
    onclose
  }: {
    mode: 'dark' | 'light'
    onclose: () => void
  } = $props()

  type Tab = 'themes' | 'type' | 'prompts' | 'code' | 'app'
  const TABS: { id: Tab; label: string }[] = [
    { id: 'themes', label: 'Themes' },
    { id: 'type', label: 'Type' },
    { id: 'prompts', label: 'Prompts' },
    { id: 'code', label: 'Code' },
    { id: 'app', label: 'App' }
  ]
  const MODES: { id: Mode; label: string }[] = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'system', label: 'System' }
  ]
  const SWATCHES = ['#a371f7', '#d29922', '#3fb950', '#db61a2', '#f0883e', '#39c5cf', '#8b949e']

  let tab = $state<Tab>('themes')
  let comparing = $state(false)
  let paneWidth = $state(780)
  let unfolded = $state(true)
  let note = $state('')
  let renaming = $state<string | null>(null)
  let renameText = $state('')
  let confirmDelete = $state<string | null>(null)
  let stage: HTMLDivElement

  const theme = $derived(activeTheme())
  const look = $derived(comparing ? TODAY : theme)
  const builtins = $derived(allThemes().filter((t) => t.builtin))
  const yours = $derived(allThemes().filter((t) => !t.builtin))

  // ---- editing: every write goes through here, so a built-in forks first.
  function edit(change: (target: PreviewTheme) => void): void {
    const wasBuiltin = theme.builtin
    const target = editableTheme()
    change(target)
    if (wasBuiltin) note = `Built-in themes don't change, so you're now editing "${target.name}".`
  }
  const setType =
    <K extends keyof ThemeType>(key: K) =>
    (value: ThemeType[K]) =>
      edit((t) => (t.type[key] = value))
  const setPrompt =
    <K extends keyof ThemePrompt>(key: K) =>
    (value: ThemePrompt[K]) =>
      edit((t) => (t.prompt[key] = value))
  const setCode =
    <K extends keyof ThemeCode>(key: K) =>
    (value: ThemeCode[K]) =>
      edit((t) => (t.code[key] = value))
  const setApp =
    <K extends keyof ThemeApp>(key: K) =>
    (value: ThemeApp[K]) =>
      edit((t) => (t.app[key] = value))

  // The stack "Terminal font" stands for in the font lists and theme cards:
  // the selected theme's own terminal font.
  const terminalFont = $derived(terminalStack(theme))

  function pickPromptStyle(style: ThemePrompt['style']): void {
    edit((t) => {
      t.prompt.style = style
      t.prompt.tint = PROMPT_TINTS[style] ?? (t.prompt.tint || 10)
    })
  }

  // ---- the manager
  function select(id: string): void {
    ui.previewTheme = id
    note = ''
    renaming = null
    confirmDelete = null
  }

  function startRename(): void {
    renaming = theme.id
    renameText = theme.name
  }

  function finishRename(): void {
    if (renaming) renameTheme(renaming, renameText)
    renaming = null
  }

  function remove(): void {
    if (confirmDelete !== theme.id) {
      confirmDelete = theme.id
      return
    }
    const name = theme.name
    deleteTheme(theme.id)
    confirmDelete = null
    note = `Deleted "${name}".`
  }

  function duplicate(): void {
    const copy = duplicateTheme(theme.id)
    note = `Made "${copy.name}".`
  }

  function exportCurrent(): void {
    navigator.clipboard.writeText(exportTheme(theme)).then(
      () => (note = `Copied "${theme.name}" to the clipboard.`),
      () => (note = "Couldn't write to the clipboard.")
    )
  }

  function importFromClipboard(): void {
    navigator.clipboard.readText().then(
      (text) => {
        const imported = importTheme(text, newThemeId(), themeNames())
        if (!imported) {
          note = "The clipboard doesn't hold an exported theme."
          return
        }
        addTheme(imported)
        note = `Imported "${imported.name}".`
      },
      () => (note = "Couldn't read the clipboard.")
    )
  }

  // ---- display helpers
  function fmt(value: number, unit = ''): string {
    return `${Number.isInteger(value) ? value : +value.toFixed(3)}${unit}`
  }

  const KINDS: { kind: FontKind; label: string }[] = [
    { kind: 'sans', label: 'Sans' },
    { kind: 'serif', label: 'Serif' },
    { kind: 'mono', label: 'Mono' }
  ]
  const fontsOf = (kind: FontKind): string[] =>
    THEME_FONTS.filter((f) => f.kind === kind).map((f) => f.name)

  // Fold or unfold the sample's file blocks. The Preview folds them by
  // default; here they start open, because the code colours are half of what
  // is being chosen.
  $effect(() => {
    const open = unfolded
    void look
    for (const d of stage?.querySelectorAll('details') ?? []) (d as HTMLDetailsElement).open = open
  })
</script>

<svelte:window onpointerup={() => (comparing = false)} />

{#snippet range(
  label: string,
  value: number,
  r: readonly [number, number, number],
  set: (v: number) => void,
  unit = ''
)}
  <label class="ctl">
    <span class="lbl">{label}</span>
    <input
      type="range"
      min={r[0]}
      max={r[1]}
      step={r[2]}
      {value}
      oninput={(e) => set(Number(e.currentTarget.value))}
    />
    <output>{label === 'Measure' && value >= MEASURE_NONE ? 'none' : fmt(value, unit)}</output>
  </label>
{/snippet}

{#snippet fontSelect(
  label: string,
  value: string,
  set: (v: string) => void,
  extra: { value: string; label: string }[] = [],
  monoFirst = false
)}
  <label class="ctl">
    <span class="lbl">{label}</span>
    <select class="wide" {value} onchange={(e) => set(e.currentTarget.value)}>
      {#if extra.length}
        <optgroup label="Follow">
          {#each extra as option (option.value)}
            <option value={option.value}>{option.label}</option>
          {/each}
        </optgroup>
      {/if}
      {#each monoFirst ? [KINDS[2], KINDS[0], KINDS[1]] : KINDS as group (group.kind)}
        <optgroup label={group.label}>
          {#each fontsOf(group.kind) as name (name)}
            <option value={name} style:font-family={fontStack(name, terminalFont)}>{name}</option>
          {/each}
        </optgroup>
      {/each}
    </select>
  </label>
{/snippet}

<!-- `set` takes `never` so one snippet serves every option type; each call
     site's setter narrows it back (App.svelte's segRow does the same). -->
{#snippet seg(
  label: string,
  options: { id: string; label: string }[],
  value: string,
  set: (v: never) => void
)}
  <div class="ctl">
    <span class="lbl">{label}</span>
    <div class="seg wide" role="radiogroup" aria-label={label}>
      {#each options as option (option.id)}
        <button
          class:on={value === option.id}
          role="radio"
          aria-checked={value === option.id}
          onclick={() => set(option.id as never)}>{option.label}</button
        >
      {/each}
    </div>
  </div>
{/snippet}

<!-- The App tab's two fonts: only the faces the terminal and the chrome can
     take (previewTheme.ts, ThemeApp), each option set in its own face. -->
{#snippet appFont(label: string, value: string, options: FontOption[], set: (v: string) => void)}
  {@const current = options.find((f) => f.label === value) ?? options[0]}
  <label class="ctl">
    <span class="lbl">{label}</span>
    <select
      class="wide"
      {value}
      style:font-family={current.stack}
      onchange={(e) => set(e.currentTarget.value)}
    >
      {#each options as option (option.id)}
        <option value={option.label} style:font-family={option.stack}>{option.label}</option>
      {/each}
    </select>
  </label>
{/snippet}

{#snippet colour(label: string, value: string, set: (v: string) => void, swatches = false)}
  <div class="ctl">
    <span class="lbl">{label}</span>
    <div class="colours wide">
      <button class="auto" class:on={!value} onclick={() => set('')}>Auto</button>
      <input
        type="color"
        aria-label={`${label} colour`}
        value={value || '#808080'}
        oninput={(e) => set(e.currentTarget.value)}
      />
      {#if swatches}
        {#each SWATCHES as hex (hex)}
          <button
            class="sw"
            class:on={value === hex}
            style:background={hex}
            aria-label={hex}
            onclick={() => set(hex)}
          ></button>
        {/each}
      {/if}
    </div>
  </div>
{/snippet}

{#snippet check(label: string, value: boolean, set: (v: boolean) => void)}
  <label class="chk">
    <input type="checkbox" checked={value} onchange={(e) => set(e.currentTarget.checked)} />
    {label}
  </label>
{/snippet}

{#snippet themeCard(t: PreviewTheme)}
  {@const cc = codeColors(t.code.theme, mode)}
  <button class="card" class:on={t.id === theme.id} onclick={() => select(t.id)}>
    <span class="name">{t.name}</span>
    <span
      class="spec-h"
      style:font-family={fontStack(t.type.head, terminalFont)}
      style:font-weight={t.type.headW}
      style:letter-spacing={`${t.type.headTrack}em`}
      style:text-transform={t.type.headCase === 'uppercase' ? 'uppercase' : 'none'}>Lazy start</span
    >
    <span class="spec-b" style:font-family={fontStack(t.type.body, terminalFont)}
      >A restored row waits behind a grey dot.</span
    >
    <span class="strip">
      <i style:background={t.prompt.accent || 'var(--accent)'}></i>
      {#each [cc.kw, cc.str, cc.fn, cc.type] as hex, i (i)}
        <i style:background={hex}></i>
      {/each}
    </span>
  </button>
{/snippet}

<div class="editor" role="dialog" aria-label="Theme" style:color-scheme={mode}>
  <aside>
    <header>
      <span class="material-symbols-outlined">palette</span>
      <span class="title">Theme</span>
      <span class="current" title={theme.name}>{theme.name}</span>
    </header>
    <div class="tabs" role="tablist">
      {#each TABS as t (t.id)}
        <button
          role="tab"
          class:on={tab === t.id}
          aria-selected={tab === t.id}
          onclick={() => (tab = t.id)}>{t.label}</button
        >
      {/each}
    </div>
    {#if note}
      <p class="note">{note}</p>
    {/if}

    <div class="panel">
      {#if tab === 'themes'}
        <div class="actions">
          {#if renaming === theme.id}
            <!-- svelte-ignore a11y_autofocus -->
            <input
              class="rename"
              bind:value={renameText}
              autofocus
              onkeydown={(e) => {
                if (e.key === 'Enter') finishRename()
                if (e.key === 'Escape') {
                  e.stopPropagation()
                  renaming = null
                }
              }}
              onblur={finishRename}
            />
          {:else}
            <button class="btn" onclick={duplicate}>Duplicate</button>
            <button class="btn" disabled={theme.builtin} onclick={startRename}>Rename</button>
            <button
              class="btn"
              class:danger={confirmDelete === theme.id}
              disabled={theme.builtin}
              onclick={remove}>{confirmDelete === theme.id ? 'Really delete?' : 'Delete'}</button
            >
            <button class="btn" onclick={exportCurrent}>Export</button>
            <button class="btn" onclick={importFromClipboard}>Import</button>
          {/if}
        </div>
        <p class="hint">
          Export copies the selected theme to the clipboard; Import adds the theme the clipboard
          holds.
        </p>
        {#if yours.length}
          <h3>Yours</h3>
          <div class="grid">
            {#each yours as t (t.id)}
              {@render themeCard(t)}
            {/each}
          </div>
        {/if}
        <h3>Built in</h3>
        <div class="grid">
          {#each builtins as t (t.id)}
            {@render themeCard(t)}
          {/each}
        </div>
      {:else if tab === 'type'}
        <h3>Page</h3>
        {@render colour('Background', theme.type.bgColor, setType('bgColor'))}
        <p class="hint">Auto is the pane's own background, light or dark with Appearance.</p>
        <h3>Body</h3>
        {@render fontSelect('Font', theme.type.body, setType('body'))}
        {@render range('Weight', theme.type.bodyW, TYPE_RANGES.bodyW, setType('bodyW'))}
        {@render range('Size', theme.type.size, TYPE_RANGES.size, setType('size'), 'px')}
        {@render range('Line height', theme.type.lh, TYPE_RANGES.lh, setType('lh'))}
        {@render range(
          'Strength',
          theme.type.strength,
          TYPE_RANGES.strength,
          setType('strength'),
          '%'
        )}
        {@render colour('Colour', theme.type.bodyColor, setType('bodyColor'))}
        {@render range(
          'Measure',
          theme.type.measure,
          TYPE_RANGES.measure,
          setType('measure'),
          'ch'
        )}
        {@render seg(
          'Align',
          [
            { id: 'left', label: 'Left' },
            { id: 'center', label: 'Centred' }
          ],
          theme.type.align,
          setType('align')
        )}
        {@render range('Paragraph gap', theme.type.para, TYPE_RANGES.para, setType('para'), 'em')}

        <h3>Headings</h3>
        {@render fontSelect('Font', theme.type.head, setType('head'))}
        {@render range('Weight', theme.type.headW, TYPE_RANGES.headW, setType('headW'))}
        {@render range(
          'Scale',
          theme.type.headScale,
          TYPE_RANGES.headScale,
          setType('headScale'),
          '×'
        )}
        {@render range(
          'Tracking',
          theme.type.headTrack,
          TYPE_RANGES.headTrack,
          setType('headTrack'),
          'em'
        )}
        {@render seg(
          'Case',
          [
            { id: 'none', label: 'Aa' },
            { id: 'uppercase', label: 'AA' },
            { id: 'small-caps', label: 'Small caps' }
          ],
          theme.type.headCase,
          setType('headCase')
        )}
        {@render colour('Colour', theme.type.headColor, setType('headColor'))}

        <h3>Emphasis and links</h3>
        {@render range('Bold weight', theme.type.strongW, TYPE_RANGES.strongW, setType('strongW'))}
        {@render check(
          'Bold and italic at full strength',
          theme.type.fullStrong,
          setType('fullStrong')
        )}
        {@render colour('Bold colour', theme.type.strongColor, setType('strongColor'))}
        {@render colour('Links', theme.type.linkColor, setType('linkColor'))}
        {@render colour('List markers', theme.type.markerColor, setType('markerColor'))}

        <h3>Code font</h3>
        {@render fontSelect(
          'Font',
          theme.type.code,
          setType('code'),
          [{ value: TERMINAL_FONT, label: 'Terminal font' }],
          true
        )}
        {@render range('Weight', theme.type.codeW, TYPE_RANGES.codeW, setType('codeW'))}
        {@render range(
          'Size',
          theme.type.codeSize,
          TYPE_RANGES.codeSize,
          setType('codeSize'),
          'em'
        )}
        {@render seg(
          'Inline code',
          [
            { id: 'today', label: 'Today' },
            { id: 'chip', label: 'Chip' },
            { id: 'tint', label: 'Tint' },
            { id: 'outline', label: 'Line' },
            { id: 'plain', label: 'Plain' }
          ],
          theme.type.inline,
          setType('inline')
        )}
        {@render check('Ligatures', theme.type.ligatures, setType('ligatures'))}
      {:else if tab === 'prompts'}
        <div class="grid">
          {#each PROMPT_STYLES as style (style.id)}
            <button
              class="card small"
              class:on={theme.prompt.style === style.id}
              onclick={() => pickPromptStyle(style.id)}
            >
              <span class="name">{style.label}</span>
              <span class="desc">{style.note}</span>
            </button>
          {/each}
        </div>
        <h3>Accent</h3>
        {@render colour('Colour', theme.prompt.accent, setPrompt('accent'), true)}
        {@render range('Tint', theme.prompt.tint, PROMPT_RANGES.tint, setPrompt('tint'), '%')}
        <h3>Text</h3>
        {@render fontSelect('Font', theme.prompt.font, setPrompt('font'), [
          { value: 'body', label: 'Same as body' },
          { value: 'head', label: 'Same as headings' },
          { value: 'code', label: 'Same as code' }
        ])}
        {@render range('Weight', theme.prompt.w, PROMPT_RANGES.w, setPrompt('w'))}
        {@render range('Size', theme.prompt.size, PROMPT_RANGES.size, setPrompt('size'), '×')}
        {@render colour('Colour', theme.prompt.color, setPrompt('color'))}
        {@render check('Italic', theme.prompt.italic, setPrompt('italic'))}
      {:else if tab === 'app'}
        <h3>Fonts</h3>
        {@render appFont('Terminal', theme.app.terminal, FONTS, setApp('terminal'))}
        {@render appFont('Interface', theme.app.ui, UI_FONTS, setApp('ui'))}
        <p class="hint">
          The terminal's font, and the font of everything around it. A code font of "Terminal font"
          follows the first.
        </p>
      {:else}
        <p class="hint">Each code theme has a dark and a light variant; Appearance picks one.</p>
        <div class="grid">
          {#each CODE_THEME_IDS as id (id)}
            {@const cc = codeColors(id, mode)}
            <button
              class="card small"
              class:on={theme.code.theme === id}
              onclick={() => setCode('theme')(id)}
            >
              <span class="name">{CODE_THEMES[id].label}</span>
              <span class="code-spec" style:background={cc.bg} style:color={cc.fg}
                ><span style:color={cc.kw} style:font-weight={cc.kwWeight ?? 'normal'}>const</span>
                <span style:color={cc.fn}>start</span> =
                <span style:color={cc.str}>'idle'</span>
                <span style:color={cc.com} style:font-style={cc.comItalic ? 'italic' : 'normal'}
                  >// ok</span
                ></span
              >
            </button>
          {/each}
        </div>
        <h3>Blocks</h3>
        {@render seg(
          'Background',
          [
            { id: 'theme', label: 'Theme' },
            { id: 'blend', label: 'Blend' },
            { id: 'pane', label: 'Pane' }
          ],
          theme.code.bg,
          setCode('bg')
        )}
        {@render range('Corner', theme.code.radius, CODE_RANGES.radius, setCode('radius'), 'px')}
        {@render range('Diff tint', theme.code.diff, CODE_RANGES.diff, setCode('diff'), '%')}
        {@render check('Line numbers', theme.code.lineNums, setCode('lineNums'))}
      {/if}
    </div>
  </aside>

  <main>
    <div class="bar">
      {@render seg('Appearance', MODES, ui.mode, (m: Mode) => (ui.mode = m))}
      <label class="ctl width">
        <span class="lbl">Pane width</span>
        <input type="range" min="380" max="1400" step="10" bind:value={paneWidth} />
        <output>{paneWidth}px</output>
      </label>
      <button class="btn" onclick={() => (unfolded = !unfolded)}
        >{unfolded ? 'Fold files' : 'Unfold files'}</button
      >
      <span class="spacer"></span>
      <button
        class="btn hold"
        class:on={comparing}
        title="Hold to see the Preview as it was before themes"
        onpointerdown={() => (comparing = true)}>Hold to compare with Today</button
      >
      <button class="close" aria-label="Close theme editor" onclick={onclose}>
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="stage">
      <div class="pane" style:width={`${paneWidth}px`} bind:this={stage}>
        <Conversation items={SAMPLE} {look} {mode} />
      </div>
    </div>
  </main>
</div>

<style>
  .editor {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: grid;
    grid-template-columns: 380px 1fr;
    background: var(--bg);
    color: var(--fg);
    font-family: var(--ui-font);
    font-size: 12.5px;
  }

  aside {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-right: 1px solid var(--border);
  }

  header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px 8px;
  }

  header .title {
    font-weight: 600;
    font-size: 13px;
  }

  header .current {
    margin-left: auto;
    max-width: 200px;
    color: var(--fg-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tabs {
    display: flex;
    padding: 0 10px;
    border-bottom: 1px solid var(--border);
  }

  .tabs button {
    flex: 1;
    padding: 7px 0 8px;
    border: none;
    background: none;
    color: var(--fg-muted);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  .tabs button.on {
    color: var(--fg);
    box-shadow: inset 0 -2px var(--accent);
  }

  .note {
    margin: 0;
    padding: 7px 14px;
    border-bottom: 1px solid var(--border);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }

  .panel {
    flex: 1;
    overflow-y: auto;
    padding: 10px 14px 40px;
  }

  h3 {
    margin: 16px 0 6px;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--fg-muted);
  }

  .hint {
    margin: 4px 0 8px;
    color: var(--fg-muted);
    font-size: 11.5px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
    padding: 8px 9px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: none;
    color: var(--fg);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .card:hover {
    border-color: var(--fg-muted);
  }

  .card.on {
    border-color: var(--accent);
    box-shadow: inset 0 0 0 1px var(--accent);
  }

  .card .name {
    font-weight: 600;
    font-size: 11.5px;
  }

  .card .desc {
    color: var(--fg-muted);
    font-size: 11px;
    line-height: 1.35;
  }

  .spec-h,
  .spec-b {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .spec-h {
    font-size: 17px;
    line-height: 1.2;
  }

  .spec-b {
    font-size: 11.5px;
    color: color-mix(in srgb, var(--fg) 70%, transparent);
  }

  .strip {
    display: flex;
    gap: 3px;
    margin-top: 3px;
  }

  .strip i {
    flex: 1;
    height: 6px;
    border-radius: 2px;
  }

  .code-spec {
    margin-top: 3px;
    padding: 4px 6px;
    border-radius: 4px;
    font:
      10.5px/1.4 'JetBrains Mono',
      monospace;
    white-space: pre;
    overflow: hidden;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .btn {
    padding: 4px 10px;
    border: 1px solid var(--border);
    border-radius: 5px;
    background: none;
    color: var(--fg);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  .btn:hover:not(:disabled) {
    background: var(--border);
  }

  .btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .btn.danger {
    border-color: var(--danger);
    color: var(--danger);
  }

  .rename {
    flex: 1;
  }

  .ctl {
    display: grid;
    grid-template-columns: 92px 1fr 46px;
    align-items: center;
    gap: 8px;
    margin: 4px 0;
  }

  .lbl {
    color: color-mix(in srgb, var(--fg) 80%, transparent);
  }

  .ctl input[type='range'] {
    width: 100%;
    accent-color: var(--accent);
  }

  .ctl output {
    color: var(--fg-muted);
    font-size: 11px;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .wide {
    grid-column: 2 / 4;
  }

  select,
  input:not([type]) {
    padding: 3px 5px;
    border: 1px solid var(--border);
    border-radius: 5px;
    background: var(--bg);
    color: var(--fg);
    font: inherit;
  }

  .seg {
    display: flex;
    border: 1px solid var(--border);
    border-radius: 5px;
    overflow: hidden;
  }

  .seg button {
    flex: 1;
    padding: 3px 4px;
    border: none;
    border-right: 1px solid var(--border);
    background: none;
    color: var(--fg-muted);
    font: inherit;
    font-size: 11px;
    cursor: pointer;
  }

  .seg button:last-child {
    border-right: none;
  }

  .seg button.on {
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    color: var(--fg);
    font-weight: 600;
  }

  .colours {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
  }

  .colours input[type='color'] {
    width: 30px;
    height: 22px;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: none;
    cursor: pointer;
  }

  .auto {
    padding: 2px 7px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: none;
    color: var(--fg-muted);
    font: inherit;
    font-size: 11px;
    cursor: pointer;
  }

  .auto.on {
    border-color: var(--accent);
    color: var(--fg);
  }

  .sw {
    width: 18px;
    height: 18px;
    padding: 0;
    border: 2px solid transparent;
    border-radius: 50%;
    cursor: pointer;
  }

  .sw.on {
    border-color: var(--fg);
  }

  .chk {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 6px 0;
    color: color-mix(in srgb, var(--fg) 80%, transparent);
    cursor: pointer;
  }

  .chk input {
    margin: 0;
    accent-color: var(--accent);
  }

  main {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
  }

  .bar .ctl {
    margin: 0;
    grid-template-columns: auto 200px;
  }

  .bar .ctl.width {
    grid-template-columns: auto 150px 50px;
  }

  .bar .seg {
    grid-column: auto;
  }

  .spacer {
    flex: 1;
  }

  .hold {
    user-select: none;
  }

  .hold.on {
    border-color: var(--accent);
    background: var(--accent);
    color: #fff;
  }

  .close {
    display: flex;
    padding: 2px;
    border: none;
    border-radius: 4px;
    background: none;
    color: var(--fg-muted);
    cursor: pointer;
  }

  .close:hover {
    background: var(--border);
    color: var(--fg);
  }

  .stage {
    flex: 1;
    min-height: 0;
    display: flex;
    justify-content: center;
    padding: 18px;
    overflow: hidden;
    background: color-mix(in srgb, var(--fg) 3%, var(--bg));
  }

  .pane {
    max-width: 100%;
    overflow-y: auto;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg);
  }
</style>
