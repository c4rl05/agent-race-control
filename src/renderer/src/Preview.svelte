<script lang="ts">
  import { tick } from 'svelte'
  import Conversation from './Conversation.svelte'
  import { previewItems } from './sessions.svelte'
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
    terminalFont
  }: {
    sessionId: string
    cwd: string
    // Which agent wrote this transcript — main uses it to pick both the file
    // and the fold, the only two things that differ between them.
    kind?: 'claude' | 'codex'
    look: Look
    mode: 'dark' | 'light'
    terminalFont: string
  } = $props()

  const items = $derived(previewItems[sessionId] ?? [])
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
</script>

<div class="preview" bind:this={scroller} onscroll={onScroll}>
  {#if items.length === 0}
    <div class="empty">No conversation yet.</div>
  {:else}
    <Conversation {items} {look} {mode} {terminalFont} />
  {/if}
</div>

<style>
  .preview {
    height: 100%;
    overflow-y: auto;
    box-sizing: border-box;
  }

  /* .empty comes from App.svelte's shared :global rule */
</style>
