<script lang="ts">
  import { renderMarkdown } from './markdown'
  import { styleString, terminalStack, themeClass, themeVars, type Look } from './previewTheme'

  // A conversation set in a Preview theme: the live Preview's content and the
  // theme editor's sample are both this, so the editor shows exactly what the
  // Preview renders. Pure view — no tail, no scroll; the caller owns those.
  let {
    items,
    look,
    mode
  }: {
    items: PreviewItem[]
    look: Look
    mode: 'dark' | 'light'
  } = $props()

  // The code font "Terminal" follows the look's own terminal font, so Hold to
  // compare shows Today's code font too, not the selected theme's.
  const style = $derived(styleString(themeVars(look, mode, terminalStack(look))))

  // A compaction arrives as two items, the boundary and then the summary the
  // session continues from (transcript.ts), and draws as ONE divider that
  // folds the summary away. Not a prompt, not a reply: a chapter break, where
  // the agent's memory was rebuilt. Either half can arrive alone (a tail that
  // started between them, a drifted version) and still draws.
  type Row =
    | { kind: 'user' | 'assistant'; text: string }
    | { kind: 'compacted'; label: string; text: string }

  function compactLabel(trigger: string, tokens: number): string {
    const how = trigger === 'auto' ? 'auto' : trigger === 'manual' ? '/compact' : ''
    const size = tokens > 0 ? `${Math.round(tokens / 1000)}k tokens` : ''
    return ['Context compacted', how, size].filter(Boolean).join(' · ')
  }

  const rows = $derived.by(() => {
    const out: Row[] = []
    for (const item of items) {
      if (item.kind === 'compact') {
        out.push({ kind: 'compacted', label: compactLabel(item.trigger, item.tokens), text: '' })
      } else if (item.kind === 'summary') {
        const last = out[out.length - 1]
        if (last?.kind === 'compacted' && !last.text) last.text = item.text
        else out.push({ kind: 'compacted', label: compactLabel('', 0), text: item.text })
      } else out.push(item)
    }
    return out
  })
</script>

<div class="conv {themeClass(look)}" {style}>
  <div class="inner">
    {#each rows as item, index (index)}
      {#if item.kind === 'assistant'}
        <div class="assistant">{@html renderMarkdown(item.text)}</div>
      {:else if item.kind === 'compacted'}
        {#if item.text}
          <details class="compacted">
            <summary class="compact-rule">
              <span class="compact-label"
                ><span class="material-symbols-outlined chev">expand_more</span>{item.label}</span
              >
            </summary>
            <div class="assistant compact-body">{@html renderMarkdown(item.text)}</div>
          </details>
        {:else}
          <div class="compacted">
            <div class="compact-rule"><span class="compact-label">{item.label}</span></div>
          </div>
        {/if}
      {:else}
        <div class="user">
          <span class="who">You</span>
          <div class="ptext">{item.text}</div>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  /* Every value below that varies comes from previewTheme.ts's themeVars, set
     on this element. The theme decides; this file only says where each value
     goes. */
  .conv {
    box-sizing: border-box;
    min-height: 100%;
    padding: 12px 16px;
    background: var(--page-bg);
    font-family: var(--body-font);
    font-size: var(--size);
    line-height: var(--lh);
    font-weight: var(--body-w);
    overflow-wrap: break-word;
    user-select: text;
    /* A display face that ships one weight must not be smeared into a fake
       bold; it stays the weight it was drawn at. */
    font-synthesis: none;
  }

  .inner {
    max-width: var(--measure);
  }

  .center .inner {
    margin: 0 auto;
  }

  .inner > :first-child {
    margin-top: 0;
  }

  /* The theme's strength softens the whole message (the old half-strength
     body, now a slider); headings and code take themselves back out. */
  .assistant {
    margin: calc(var(--para) * 1.2) 0;
    color: var(--body-col);
  }

  .assistant :global(p) {
    margin: var(--para) 0;
  }

  .assistant :global(:is(h1, h2, h3, h4, h5, h6)) {
    margin: calc(var(--para) * 2.1) 0 calc(var(--para) * 0.7);
    color: var(--head-col);
    font-family: var(--head-font);
    font-weight: var(--head-w);
    letter-spacing: var(--head-track);
    text-transform: var(--head-case);
    font-variant-caps: var(--head-caps);
    line-height: 1.25;
    font-size: 1em;
  }

  .assistant :global(h1) {
    font-size: calc(1em * var(--hs));
  }

  .assistant :global(h2) {
    font-size: calc(1em * (1 + (var(--hs) - 1) * 0.6));
  }

  .assistant :global(h3) {
    font-size: calc(1em * (1 + (var(--hs) - 1) * 0.3));
  }

  .assistant :global(:is(strong, b)) {
    font-weight: var(--strong-w);
    color: var(--strong-col);
  }

  .assistant :global(em) {
    color: var(--strong-col);
  }

  .assistant :global(a) {
    color: var(--link-col);
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
    text-decoration-color: color-mix(in srgb, var(--link-col) 45%, transparent);
  }

  .assistant :global(:is(ul, ol)) {
    margin: var(--para) 0;
    padding-left: 1.6em;
  }

  .assistant :global(li) {
    margin: 0.25em 0;
  }

  .assistant :global(li::marker) {
    color: var(--marker-col);
  }

  .assistant :global(blockquote) {
    margin: var(--para) 0;
    padding-left: 0.9em;
    border-left: 3px solid var(--border);
    color: var(--fg-muted);
  }

  .assistant :global(table) {
    border-collapse: collapse;
    display: block;
    overflow-x: auto;
    margin: var(--para) 0;
  }

  .assistant :global(:is(th, td)) {
    border: 1px solid var(--border);
    padding: 0.3em 0.7em;
    text-align: left;
  }

  .assistant :global(th) {
    color: var(--head-col);
    font-weight: var(--strong-w);
  }

  .assistant :global(hr) {
    border: none;
    border-top: 1px solid var(--border);
  }

  .assistant :global(img) {
    max-width: 100%;
  }

  /* Inline code: five treatments; `today` is the old bgSubtle chip, which on
     true-black dark reads as plain mono (the kickoff doc's known flattening). */
  .assistant :global(:not(pre) > code) {
    font-family: var(--code-font);
    font-size: calc(1em * var(--code-size));
    font-weight: var(--code-w);
    font-variant-ligatures: var(--lig);
    color: var(--fg);
    padding: 0.1em 0.35em;
    border-radius: 4px;
  }

  .ic-today .assistant :global(:not(pre) > code) {
    background: var(--page-subtle);
  }

  .ic-chip .assistant :global(:not(pre) > code) {
    background: color-mix(in srgb, var(--fg) 9%, transparent);
  }

  .ic-tint .assistant :global(:not(pre) > code) {
    background: color-mix(in srgb, var(--pa) 15%, transparent);
    color: color-mix(in srgb, var(--pa) 55%, var(--fg));
  }

  .ic-outline .assistant :global(:not(pre) > code) {
    border: 1px solid var(--border);
    padding: 0 0.3em;
  }

  .ic-plain .assistant :global(:not(pre) > code) {
    padding: 0;
    color: var(--head-col);
  }

  /* Code blocks: every fence is one span per line (markdown.ts), which is what
     the line numbers and diff tints hang off. The code is inline-block at
     min-width 100% so a line's tint runs to the block's edge and on across a
     horizontal scroll; the pre keeps vertical padding only. */
  .assistant :global(pre) {
    margin: var(--para) 0;
    padding: 0.7em 0;
    background: var(--c-bg);
    border: 1px solid var(--c-edge);
    border-radius: var(--c-radius);
    overflow-x: auto;
  }

  .assistant :global(pre code) {
    display: inline-block;
    min-width: 100%;
    box-sizing: border-box;
    font-family: var(--code-font);
    font-size: calc(1em * var(--code-size));
    font-weight: var(--code-w);
    font-variant-ligatures: var(--lig);
    line-height: 1.6;
    color: var(--c-fg);
    counter-reset: ln;
  }

  .assistant :global(pre .dl) {
    display: block;
    padding: 0 1.1em;
    white-space: pre;
  }

  .lnums .assistant :global(pre .dl::before) {
    counter-increment: ln;
    content: counter(ln);
    display: inline-block;
    width: 2.2em;
    margin-right: 1em;
    text-align: right;
    color: var(--c-com);
    opacity: 0.55;
  }

  .assistant :global(pre .diff-add) {
    background: color-mix(in srgb, var(--c-add) var(--diff), transparent);
  }

  .assistant :global(pre .diff-del) {
    background: color-mix(in srgb, var(--c-del) var(--diff), transparent);
  }

  .assistant :global(pre .diff-add .mk) {
    color: var(--c-add);
  }

  .assistant :global(pre .diff-del .mk) {
    color: var(--c-del);
  }

  .assistant :global(pre .diff-hunk) {
    color: var(--c-com);
  }

  /* highlight.js's classes onto the theme's eight roles. */
  .assistant :global(:is(.hljs-comment, .hljs-quote, .hljs-meta)) {
    color: var(--c-com);
    font-style: var(--c-com-style);
  }

  .assistant :global(:is(.hljs-keyword, .hljs-selector-tag, .hljs-tag, .hljs-name)) {
    color: var(--c-kw);
    font-weight: var(--c-kw-w);
  }

  .assistant :global(:is(.hljs-string, .hljs-regexp, .hljs-template-tag, .hljs-char)) {
    color: var(--c-str);
  }

  .assistant :global(:is(.hljs-number, .hljs-literal, .hljs-symbol, .hljs-bullet, .hljs-link)) {
    color: var(--c-num);
  }

  .assistant :global(:is(.hljs-title, .hljs-section, .hljs-selector-id)) {
    color: var(--c-fn);
  }

  .assistant :global(:is(.hljs-type, .hljs-built_in, .hljs-title.class_, .hljs-selector-class)) {
    color: var(--c-type);
  }

  .assistant
    :global(
      :is(
        .hljs-attr,
        .hljs-attribute,
        .hljs-property,
        .hljs-variable,
        .hljs-template-variable,
        .hljs-params
      )
    ) {
    color: var(--c-prop);
  }

  .assistant :global(.hljs-emphasis) {
    font-style: italic;
  }

  .assistant :global(.hljs-strong) {
    font-weight: 700;
  }

  .assistant :global(pre::-webkit-scrollbar) {
    height: 6px;
  }

  .assistant :global(pre::-webkit-scrollbar-thumb) {
    background: color-mix(in srgb, var(--c-fg) 22%, transparent);
    border-radius: 3px;
  }

  /* A file the session wrote: <details> whose <summary> is a tab welded to the
     top-left of the block. Clicking the tab folds the code. `display: flex` on
     the summary drops the native disclosure triangle; the chevron replaces it. */
  .assistant :global(details.file) {
    margin: var(--para) 0;
  }

  .assistant :global(details.file > summary) {
    display: flex;
    align-items: center;
    gap: 4px;
    width: fit-content;
    max-width: 100%;
    box-sizing: border-box;
    padding: 3px 10px;
    border: 1px solid var(--c-edge);
    border-bottom: none;
    border-radius: var(--c-radius) var(--c-radius) 0 0;
    background: var(--c-bg);
    color: var(--c-com);
    font-family: var(--code-font);
    font-size: calc(1em * var(--code-size) * 0.95);
    font-style: normal;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    user-select: none;
  }

  .assistant :global(details.file > summary:hover) {
    color: var(--c-fg);
  }

  /* Folded, the tab is all there is, so it closes itself into a whole pill. */
  .assistant :global(details.file:not([open]) > summary) {
    border-bottom: 1px solid var(--c-edge);
    border-radius: var(--c-radius);
  }

  /* The app's own caret glyph, drawn from the Material Symbols ligature the
     rest of the chrome uses — reachable here because the face is registered
     app-wide, and this is rendered content that must not carry markup of its
     own. Points down when open, right when folded. */
  .assistant :global(details.file > summary::before) {
    content: 'expand_more';
    flex: none;
    font-family: 'Material Symbols Outlined';
    font-size: 14px;
    font-weight: normal;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    white-space: nowrap;
    direction: ltr;
    font-feature-settings: 'liga';
    font-variation-settings: 'wght' 300;
    transition: transform 0.12s;
  }

  .assistant :global(details.file:not([open]) > summary::before) {
    transform: rotate(-90deg);
  }

  /* The block loses the corner the tab sits on, and the margin that would
     otherwise open a gap between the two — the details owns the spacing. */
  .assistant :global(details.file > pre) {
    margin: 0;
    border-top-left-radius: 0;
  }

  /* ---- a compaction: a rule across the measure, the summary folded under it.
     Chrome, not conversation — the app's small-caps label idiom (.who) in muted
     ink, so no prompt treatment or body style can make it read as either side
     of the conversation. ---- */
  .compacted {
    margin: calc(var(--para) * 2.6) 0;
  }

  .compact-rule {
    display: flex;
    align-items: center;
    gap: 10px;
    list-style: none;
    color: var(--fg-muted);
    font:
      600 10.5px/1 var(--ui-font, system-ui),
      sans-serif;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    user-select: none;
  }

  .compact-rule::-webkit-details-marker {
    display: none;
  }

  .compact-rule::before,
  .compact-rule::after {
    content: '';
    flex: 1;
    border-top: 1px dashed var(--border);
  }

  summary.compact-rule {
    cursor: pointer;
  }

  summary.compact-rule:hover {
    color: var(--fg);
  }

  .compact-label {
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }

  .chev {
    font-size: 14px;
    transition: transform 0.12s;
  }

  .compacted:not([open]) .chev {
    transform: rotate(-90deg);
  }

  /* Unfolded: the summary as the agent will read it, set back and muted —
     markdown, through the same renderer as a reply, so its lists and code read. */
  .assistant.compact-body {
    margin: var(--para) 0 0;
    padding-left: 0.9em;
    border-left: 2px solid var(--border);
    color: var(--fg-muted);
    font-size: 0.92em;
  }

  /* ---- your prompts: fourteen treatments, one class each (ps-*). ---- */
  .user {
    position: relative;
    margin: calc(var(--para) * 2.6) 0 calc(var(--para) * 1.4);
    font-family: var(--prompt-font);
    font-weight: var(--prompt-w);
    font-size: calc(1em * var(--prompt-size));
    font-style: var(--prompt-style);
    color: var(--prompt-col);
  }

  /* Your text keeps its own line breaks. On the text, not on .user: there the
     markup's whitespace before the (usually hidden) "You" label rendered as an
     empty first line inside every prompt. */
  .ptext {
    white-space: pre-wrap;
  }

  .inner > .user:first-child {
    margin-top: 0;
  }

  .who {
    display: none;
    font:
      650 10.5px/1 var(--ui-font, system-ui),
      sans-serif;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    font-style: normal;
    color: var(--pa);
    white-space: nowrap;
  }

  /* Today's: an accent bar over the subtle ground, with the tint layered on. */
  .ps-current .user {
    padding: 6px 10px;
    border-left: 3px solid var(--pa);
    border-radius: 0 6px 6px 0;
    background: linear-gradient(var(--pa-bg), var(--pa-bg)), var(--page-subtle);
  }

  .ps-bubble .user {
    width: fit-content;
    max-width: 82%;
    margin-left: auto;
    padding: 0.55em 0.95em;
    border-radius: 16px 16px 4px 16px;
    background: var(--pa-bg-strong);
  }

  .ps-gutter .user {
    display: grid;
    grid-template-columns: 3.4em 1fr;
    gap: 0.6em;
  }

  .ps-gutter .who {
    display: block;
    padding-top: 0.35em;
    text-align: right;
  }

  .ps-heading .user {
    padding-top: 0.9em;
    border-top: 1px solid var(--border);
    font-size: calc(1em * var(--prompt-size) * 1.22);
    line-height: 1.35;
  }

  .ps-heading .who {
    display: block;
    margin-bottom: 0.55em;
    font-size: 10px;
  }

  .ps-chevron .user {
    padding-left: 1.3em;
  }

  .ps-chevron .user::before {
    content: '›';
    position: absolute;
    left: 0.1em;
    top: -0.08em;
    color: var(--pa);
    font-weight: 700;
    font-size: 1.25em;
    font-style: normal;
  }

  /* Full-bleed: out through .conv's 16px side padding. */
  .ps-band .user {
    margin-left: -16px;
    margin-right: -16px;
    padding: 0.75em 16px;
    background: var(--pa-bg);
    border-block: 1px solid color-mix(in srgb, var(--pa) 28%, transparent);
  }

  .ps-quote .user {
    padding-left: 1.7em;
  }

  .ps-quote .user::before {
    content: '\201C';
    position: absolute;
    left: -0.05em;
    top: -0.32em;
    font:
      400 2.9em/1 Georgia,
      serif;
    color: var(--pa);
  }

  .ps-outline .user {
    padding: 0.6em 0.85em;
    border: 1px solid color-mix(in srgb, var(--pa) 60%, transparent);
    border-radius: 9px;
    background: var(--pa-bg);
  }

  .ps-marker .ptext {
    display: inline;
    padding: 0 0.15em;
    background: linear-gradient(
      transparent 52%,
      var(--pa-bg-strong) 52%,
      var(--pa-bg-strong) 92%,
      transparent 92%
    );
    box-decoration-break: clone;
  }

  .ps-ruled .user {
    padding: 0.8em 0;
    border-block: 1px solid var(--border);
  }

  .ps-ruled .who {
    display: block;
    margin-bottom: 0.5em;
    color: var(--fg-muted);
  }

  .ps-card .user {
    padding: 0.7em 0.9em 0.8em;
    border-radius: 10px;
    background: var(--pa-bg);
  }

  .ps-card .who {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 0.55em;
  }

  .ps-card .who::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--pa);
  }

  .ps-dot .user {
    padding-left: 1.25em;
  }

  .ps-dot .user::before {
    content: '';
    position: absolute;
    left: 0.15em;
    top: calc(0.5lh - 4px);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--pa);
  }

  .ps-tab .user {
    margin-top: calc(var(--para) * 2.6 + 1.7em);
    padding: 0.55em 0.9em;
    border-radius: 0 8px 8px 8px;
    background: var(--pa-bg);
  }

  .ps-tab .who {
    display: block;
    position: absolute;
    left: 0;
    top: -1.75em;
    padding: 0.5em 0.8em;
    border-radius: 6px 6px 0 0;
    background: var(--pa-bg);
  }

  .ps-pull .user {
    margin-left: 12%;
    padding-right: 0.9em;
    border-right: 3px solid var(--pa);
    text-align: right;
  }
</style>
