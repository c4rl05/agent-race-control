import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { escapeHtml, highlight, languageOfName, splitLines } from './highlight'

// The Preview's markdown renderer, shared by the live Preview and the theme
// editor's sample so that what the editor shows is what the Preview renders.
// Everything here is registered at module scope, so it runs once.
//
// Every fenced block is ours now (it used to fall through to marked's default
// unless it was a diff or a titled file): each line is its own span, which is
// what the theme's line numbers and diff tints hang off, and a known language
// is coloured (highlight.ts). Two things ride on top of that:
//
// Diff colouring (issue #1): the reducer emits Edit/MultiEdit as ```diff
// blocks with `+ `/`- ` prefixes (transcript.ts), and each line is tinted by its
// leading marker. The code after the marker is coloured by the file name's
// language when the block has one.
//
// The file NAME (2026-09-09): a block the session wrote arrives with its name
// in the fence info string, and is drawn as a tab welded to the top of the
// code that folds it.

// A code fence's info string, in the one shape the reducer emits:
// `<lang>` alone, or `<lang> title="<file name>"` when the block is a file
// the session wrote (transcript.ts). `\S*` may match empty, which is how an
// unknown extension — no language at all — still parses its title.
const INFO = /^(\S*)\s*title="([^"]*)"\s*$/

function splitInfo(info: string): { lang: string; title: string } {
  const match = INFO.exec(info)
  if (match) return { lang: match[1], title: match[2] }
  return { lang: info.split(/\s+/)[0] ?? '', title: '' }
}

const line = (cls: string, html: string): string =>
  `<span class="dl${cls}">${html || '&#8203;'}</span>`

// `+`/`-` mark added/removed; `+++`/`---` (file headers), `@@`, and anything
// else stay neutral and uncoloured, so a hand-written ```diff in prose reads
// correctly too. Each line is highlighted on its own — a construct spanning
// lines can colour wrong inside a diff, and the tint stays the signal.
function diffLines(text: string, lang: string): string[] {
  return text.split('\n').map((raw) => {
    const prefixed = /^[+-](?![+-]{2})|^ /.exec(raw)
    if (!prefixed) return line(raw.startsWith('@@') ? ' diff-hunk' : '', escapeHtml(raw))
    const cls = raw[0] === '+' ? ' diff-add' : raw[0] === '-' ? ' diff-del' : ''
    return line(
      cls,
      `<span class="mk">${escapeHtml(raw[0])}</span>${highlight(raw.slice(1), lang)}`
    )
  })
}

function codeBlock(text: string, lang: string, title: string): string {
  const body = text.replace(/\n$/, '')
  const diff = lang === 'diff'
  const colour = diff ? languageOfName(title) : lang
  const lines = diff
    ? diffLines(body, colour)
    : splitLines(highlight(body, colour)).map((l) => line('', l))
  const cls = lang ? ` class="language-${escapeHtml(lang)}"` : ''
  return `<pre class="code${diff ? ' diff' : ''}"><code${cls}>${lines.join('')}</code></pre>`
}

// The file name as a TAB on the code rather than a line of prose above it:
// one <details> whose <summary> is the tab, so the same thing that names the
// block folds it. Native disclosure — no script inside rendered content, and
// DOMPurify passes details/summary.
//
// FOLDED by default (no `open`). The preview is for reading the
// conversation, and a file listing is the one thing in it that can run to
// hundreds of lines — expanded, a single Write buries the prose either side
// of it. The tab keeps saying what was written, so nothing is hidden that
// the reader has to go looking for; the code is one click away when it is
// the code they actually came for.
function fileBlock(title: string, block: string): string {
  return `<details class="file"><summary class="file-tab">${escapeHtml(title)}</summary>${block}</details>`
}

marked.use({
  renderer: {
    code(token) {
      const { lang, title } = splitInfo((token.lang ?? '').trim())
      const block = codeBlock(token.text, lang, title)
      return title ? fileBlock(title, block) : block
    }
  }
})

// Rendered HTML by message text. A long conversation re-renders nothing when
// the theme changes (that is all CSS), but the Preview remounts on every tab
// switch and refocus, and highlighting a big Write listing is the expensive
// part. Bounded, oldest out first.
const cache = new Map<string, string>()
const CACHE_MAX = 600

// Conversation content is untrusted input — never inject unsanitized HTML.
// style is forbidden on top of the defaults: inline CSS (position:fixed,
// z-index) would let rendered content overlay and spoof the app's own UI.
export function renderMarkdown(text: string): string {
  const hit = cache.get(text)
  if (hit !== undefined) return hit
  const html = DOMPurify.sanitize(marked.parse(text, { async: false }), { FORBID_ATTR: ['style'] })
  cache.set(text, html)
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value!)
  return html
}
