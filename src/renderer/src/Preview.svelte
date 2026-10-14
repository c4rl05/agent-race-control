<script lang="ts">
  import { tick, untrack } from 'svelte'
  import Conversation from './Conversation.svelte'
  import { previewCleared, visiblePreviewItems } from './sessions.svelte'
  import type { Look } from './previewTheme'

  // Read-only conversation preview: a pure view of the per-session item
  // cache the store fills from main's transcript tail (the stream is routed
  // once, in App — see applyPreviewItems). Mounting arms the tail,
  // unmounting only disarms it — the cache and main's byte offset both
  // survive, so remounting renders instantly from memory and ships just the
  // delta. Observation only — nothing here can write to the session.
  // How it LOOKS is the selected Preview theme (Conversation.svelte renders
  // it, the same component the theme editor's sample uses).
  let {
    sessionId,
    cwd,
    kind = 'claude',
    look,
    mode,
    find,
    findEpoch,
    onFindClose
  }: {
    sessionId: string
    cwd: string
    // Which agent wrote this transcript — main uses it to pick both the file
    // and the fold, the only two things that differ between them.
    kind?: 'claude' | 'codex'
    look: Look
    mode: 'dark' | 'light'
    // The find bar (App owns whether it's open: the tab bar's Find, the
    // context menu and Ctrl+F all open it). A bumped epoch re-focuses it.
    find: boolean
    findEpoch: number
    onFindClose: () => void
  } = $props()

  // Everything since the last Clear (sessions.svelte.ts, previewCleared).
  const items = $derived(visiblePreviewItems(sessionId))
  const cleared = $derived(previewCleared[sessionId] !== undefined)
  let scroller: HTMLDivElement

  // Auto-scroll to the live tail unless the user has scrolled up to read.
  let stick = true

  function onScroll(): void {
    stick = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 32
  }

  // Arm the tail for the current conversation id, re-arming if it changes —
  // `/clear` re-points sessionId to a fresh transcript mid-mount (issue #2), so
  // the cleanup disarms the old id and the re-run watches the new one.
  $effect(() => {
    const id = sessionId
    window.arc.transcript.watch(id, cwd, kind)
    return () => window.arc.transcript.unwatch(id)
  })

  // Follow appended items — and the initial cached render — unless the user
  // has scrolled up.
  $effect(() => {
    void items.length
    if (stick) void tick().then(() => scroller?.scrollTo({ top: scroller.scrollHeight }))
  })

  // ---- Find (2026-10-14). Matches are painted with the CSS Custom Highlight
  // API, so the rendered conversation is never rewritten: no wrapper spans in
  // the markdown, nothing for the render cache to forget. Electron's
  // findInPage was the other way, and it searches the whole window, tower and
  // all. Plain text, case-insensitive, over what's rendered — so a Clear also
  // narrows the search, and a match in a folded block is counted and unfolded
  // when stepped onto (Chrome's own find does the same).
  let query = $state('')
  let matches = $state.raw<Range[]>([])
  let current = $state(0)
  let input = $state<HTMLInputElement | null>(null)
  const MAX_MATCHES = 5000

  // The one text the eye reads as the page: every text node's data, end to
  // end, with each node's offset into it, so a match may cross the spans a
  // highlighted code line is cut into. The app's icon ligatures ('expand_more')
  // and the prompt's hidden "You" label are glyphs, not text, and stay out.
  function findRanges(root: HTMLElement, needle: string): Range[] {
    const nodes: Text[] = []
    const starts: number[] = []
    let text = ''
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) =>
        node.parentElement?.closest('.material-symbols-outlined, .who')
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT
    })
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      nodes.push(node as Text)
      starts.push(text.length)
      text += (node as Text).data
    }
    // Lower-casing can change a string's length (İ → i̇), which would skew every
    // offset after it; such a page is searched case-sensitively instead.
    const folded = text.toLowerCase()
    const sameLength = folded.length === text.length
    const hay = sameLength ? folded : text
    const want = sameLength ? needle.toLowerCase() : needle
    const out: Range[] = []
    let first = 0
    for (let at = hay.indexOf(want); at !== -1 && out.length < MAX_MATCHES;) {
      const end = at + want.length
      while (first + 1 < nodes.length && starts[first + 1] <= at) first++
      let last = first
      while (last + 1 < nodes.length && starts[last + 1] < end) last++
      const range = document.createRange()
      range.setStart(nodes[first], at - starts[first])
      range.setEnd(nodes[last], end - starts[last])
      out.push(range)
      at = hay.indexOf(want, end)
    }
    return out
  }

  function paint(): void {
    if (!('highlights' in CSS)) return
    if (!find || matches.length === 0) {
      CSS.highlights.delete('arc-find')
      CSS.highlights.delete('arc-find-current')
      return
    }
    CSS.highlights.set('arc-find', new Highlight(...matches))
    CSS.highlights.set('arc-find-current', new Highlight(matches[current]))
  }

  // Bring a match into view: unfold any block it sits in, then scroll the
  // preview (and a code block, sideways) so it lands a third of the way down.
  // Measured with client rects, which report VISUAL px, while scroll offsets
  // are the element's own px — the pane's per-pane zoom is the ratio.
  function reveal(range: Range): void {
    for (
      let el = range.startContainer.parentElement;
      el && el !== scroller;
      el = el.parentElement
    ) {
      if (el instanceof HTMLDetailsElement && !el.open) el.open = true
    }
    const pre = range.startContainer.parentElement?.closest('pre')
    if (pre) {
      const box = pre.getBoundingClientRect()
      const rect = range.getBoundingClientRect()
      const scale = box.width / pre.offsetWidth || 1
      if (rect.left < box.left || rect.right > box.right) {
        pre.scrollLeft += (rect.left - box.left - box.width / 3) / scale
      }
    }
    const box = scroller.getBoundingClientRect()
    const rect = range.getBoundingClientRect()
    const scale = box.height / scroller.offsetHeight || 1
    if (rect.top < box.top || rect.bottom > box.bottom) {
      scroller.scrollTop += (rect.top - box.top - box.height / 3) / scale
    }
  }

  function step(by: number): void {
    if (matches.length === 0) return
    current = (current + by + matches.length) % matches.length
    reveal(matches[current])
    paint()
  }

  // Re-search when the query changes, and when the conversation grows or
  // re-renders under an open bar. A new query starts at the first match at or
  // below where you are reading rather than yanking you to the top; growth
  // keeps your place. Its only dependencies are the four read up front: it
  // writes `matches` and paint() reads it back, so the clear path runs
  // untracked, or the write would re-run the effect forever.
  let searched = ''
  $effect(() => {
    const needle = query
    const open = find
    void items
    void look
    void mode
    if (!open || !needle) {
      untrack(() => {
        if (matches.length) matches = []
        searched = ''
        paint()
      })
      return
    }
    void tick().then(() => {
      if (!scroller) return
      matches = findRanges(scroller, needle)
      if (needle !== searched) {
        searched = needle
        const top = scroller.getBoundingClientRect().top
        const below = matches.findIndex((r) => r.getBoundingClientRect().bottom >= top)
        current = Math.max(0, below)
        if (matches.length) reveal(matches[current])
      } else if (current >= matches.length) current = Math.max(0, matches.length - 1)
      paint()
    })
  })

  $effect(() => {
    void findEpoch
    if (find) void tick().then(() => input?.select())
  })

  // Highlights are document-wide; take ours with us.
  $effect(() => () => {
    if ('highlights' in CSS) {
      CSS.highlights.delete('arc-find')
      CSS.highlights.delete('arc-find-current')
    }
  })
</script>

<div class="preview-wrap">
  <div class="preview" bind:this={scroller} onscroll={onScroll}>
    {#if items.length === 0}
      <div class="empty">
        {cleared ? 'Cleared. What comes next shows here.' : 'No conversation yet.'}
      </div>
    {:else}
      <Conversation {items} {look} {mode} />
    {/if}
  </div>
  {#if find}
    <div class="find" role="search">
      <span class="material-symbols-outlined">search</span>
      <input
        bind:this={input}
        bind:value={query}
        placeholder="Find in preview"
        spellcheck="false"
        aria-label="Find in preview"
        onkeydown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            step(e.shiftKey ? -1 : 1)
          }
        }}
      />
      <span class="count">
        {#if query}
          {matches.length === 0
            ? 'No results'
            : `${current + 1} of ${matches.length}${matches.length >= MAX_MATCHES ? '+' : ''}`}
        {/if}
      </span>
      <button
        class="find-btn"
        aria-label="Previous match"
        title="Previous (Shift+Enter)"
        disabled={matches.length === 0}
        onclick={() => step(-1)}
      >
        <span class="material-symbols-outlined">keyboard_arrow_up</span>
      </button>
      <button
        class="find-btn"
        aria-label="Next match"
        title="Next (Enter)"
        disabled={matches.length === 0}
        onclick={() => step(1)}
      >
        <span class="material-symbols-outlined">keyboard_arrow_down</span>
      </button>
      <button class="find-btn" aria-label="Close find" title="Close (Esc)" onclick={onFindClose}>
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .preview-wrap {
    position: relative;
    height: 100%;
  }

  .preview {
    height: 100%;
    overflow-y: auto;
    box-sizing: border-box;
  }

  /* .empty comes from App.svelte's shared :global rule */

  /* The find bar floats over the conversation's top-right corner, as an
     editor's does, so opening it moves nothing you were reading. Chrome, so
     the app's tokens and font, never the Preview theme's. */
  .find {
    position: absolute;
    top: 8px;
    right: 16px;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 3px 4px 3px 8px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
    font-family: var(--ui-font);
    font-size: 12px;
    color: var(--fg);
  }

  .find > .material-symbols-outlined {
    font-size: 15px;
    color: var(--fg-muted);
  }

  .find input {
    width: 180px;
    padding: 3px 6px;
    border: none;
    outline: none;
    background: none;
    color: var(--fg);
    font: inherit;
  }

  .count {
    min-width: 64px;
    padding-right: 4px;
    color: var(--fg-muted);
    text-align: right;
    white-space: nowrap;
  }

  .find-btn {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: none;
    color: var(--fg-muted);
    cursor: pointer;
  }

  .find-btn .material-symbols-outlined {
    font-size: 17px;
  }

  /* Hover paints with `border`, the app's hover idiom (dark's bgSubtle is its bg). */
  .find-btn:hover:not(:disabled) {
    background: var(--border);
    color: var(--fg);
  }

  .find-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  /* Chrome's own find colours: yellow for every match, orange for the one
     you're on, with dark ink forced so a match reads on either theme and over
     any syntax colour. Highlight pseudos are document-wide, hence :global. */
  :global(::highlight(arc-find)) {
    background-color: rgba(255, 214, 0, 0.55);
    color: #1f2328;
  }

  :global(::highlight(arc-find-current)) {
    background-color: #ff9632;
    color: #1f2328;
  }
</style>
