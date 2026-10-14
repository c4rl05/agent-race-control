// The theme editor's sample conversation: every element the Preview can show
// (headings, a list, a quote, a table, inline code, a file the session wrote,
// an Edit diff, a folded file, a prose fence, a compaction, prompts long and
// short), in the exact shapes the reducer emits (transcript.ts) — so it renders
// through the same path as a real transcript.

const LISTING = `// A restored row waits behind a grey dot until it is first selected.
export function startSession(session: Session): void {
  if (session.status !== 'unstarted') return
  session.status = isAgent(session.type) ? 'idle' : 'running'
  session.statusSince = Date.now()
}

export function applyTitle(session: Session, title: string): void {
  session.title = title
  const clean = cleanTitle(title)
  if (clean) session.lastTitle = clean
}

const SAVE_DEBOUNCE_MS = 300 // one write per burst of changes`

const DIFF = `-     <Terminal {session} onTitle={(t) => (session.title = t)} />
+     {#if session.status !== 'unstarted'}
+       <Terminal {session} onTitle={(title) => applyTitle(session, title)} />
+     {/if}`

const TEST = `describe('lazy start', () => {
  it('a restored row waits until it is selected', () => {
    const row = restore({ title: 'Lazy start', type: 'claude' })
    expect(row.status).toBe('unstarted')
    startSession(row)
    expect(row.status).toBe('idle')
  })
})`

export const SAMPLE: PreviewItem[] = [
  {
    kind: 'user',
    text: 'i noticed the app takes a long time to load when there are many sessions. can we make the sessions load when selected, instead of all at once?'
  },
  {
    kind: 'assistant',
    text: `Yes. The slow part is that \`restoreState\` spawns every row's PTY before the window is usable. With twenty Claude rows, that's twenty \`claude --resume\` processes all reading their transcripts from disk at once.

## Proposal: lazy start

A restored row comes back **unstarted**. It keeps its title and its folder colour, wears a grey dot, and spawns the first time you select it. The focused row starts right away, so the window opens on a live terminal.

- The \`Terminal\` component isn't mounted while the row is unstarted. Mounting it *is* the spawn.
- The last clean title is persisted, so an unstarted row still reads as itself.
- Folder colour and Relaunch wait until the row is live.

> Starting is not the colour change that clears a TODO flag.

### What changes

| File | Change |
| --- | --- |
| \`sessions.svelte.ts\` | new \`unstarted\` status, \`startSession\`, \`applyTitle\` |
| \`App.svelte\` | mount the terminal on first select |
| \`state.ts\` | persist \`title\` |

One question before I write it: is a **grey disc** fine for the unstarted dot, or would you rather have a hollow ring?`
  },
  { kind: 'user', text: 'grey disc is fine, go ahead' },
  {
    kind: 'assistant',
    text: `Done. The store gains one status and two helpers:

\`\`\`ts title="sessions.svelte.ts"
${LISTING}
\`\`\`

The pane only mounts the terminal once the row has started:

\`\`\`diff title="App.svelte"
${DIFF}
\`\`\`

\`\`\`ts title="sessions.test.ts"
${TEST}
\`\`\`

Typecheck is clean and all **268** tests pass. To try it:

\`\`\`bash
# from the repo root
npm run dev --silent   # renderer on http://localhost:5290
\`\`\`

1. Quit with several sessions open.
2. Relaunch. Only the focused row spawns.
3. Click a grey row and its conversation resumes.

The decision is recorded in the [kickoff doc](#) under *Lazy start*.`
  },
  { kind: 'compact', trigger: 'auto', tokens: 162480 },
  {
    kind: 'summary',
    text: `This session is being continued from a previous conversation that ran out of context. The summary below covers the earlier portion of the conversation.

1. **Primary request:** restored rows should spawn when selected, not all at once.
2. **Done:** an \`unstarted\` status, \`startSession\`, the terminal mounted on first select. 268 tests pass.`
  },
  {
    kind: 'user',
    text: 'nice. one more thing: when I click a grey row it takes a second before anything shows.\ncould the pane show the last title while it boots?'
  },
  {
    kind: 'assistant',
    text: "It already does. The row's `lastTitle` is painted from the saved state, so the card reads correctly before the PTY answers. The blank second is ConPTY starting `claude.exe`. That's about **900 ms** on this machine, and not something the app can shorten without changing how Claude is spawned."
  }
]
