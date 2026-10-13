// Syntax colouring for the Preview's code (kickoff doc, "Preview themes").
// highlight.js core with a fixed set of languages, and never auto-detect: a
// block is coloured only when its language is known, because a guessed
// language paints prose-like text confidently wrong. The output is spans with
// `hljs-*` classes and nothing else; the theme's CSS colours them.
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import css from 'highlight.js/lib/languages/css'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import go from 'highlight.js/lib/languages/go'
import ini from 'highlight.js/lib/languages/ini'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import powershell from 'highlight.js/lib/languages/powershell'
import python from 'highlight.js/lib/languages/python'
import rust from 'highlight.js/lib/languages/rust'
import scss from 'highlight.js/lib/languages/scss'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'

const LANGUAGES = {
  bash,
  c,
  cpp,
  csharp,
  css,
  dockerfile,
  go,
  ini,
  java,
  javascript,
  json,
  markdown,
  powershell,
  python,
  rust,
  scss,
  sql,
  typescript,
  xml,
  yaml
}
for (const [name, language] of Object.entries(LANGUAGES)) hljs.registerLanguage(name, language)
// The reducer's fence names that highlight.js doesn't alias itself (transcript.ts
// LANGS). A Svelte or Vue file is markup with script inside, which is what xml
// colours best without a grammar of its own.
hljs.registerAliases(['svelte', 'vue'], { languageName: 'xml' })
hljs.registerAliases(['shell', 'console'], { languageName: 'bash' })

export function knownLanguage(lang: string): boolean {
  return !!lang && !!hljs.getLanguage(lang)
}

// The language a file name implies, by extension; '' when none is registered.
export function languageOfName(name: string): string {
  const ext = /\.([a-z0-9+#]+)$/i.exec(name)?.[1]?.toLowerCase() ?? ''
  return knownLanguage(ext) ? ext : ''
}

// Escaped HTML for `code`, coloured if `lang` is known and plain otherwise.
export function highlight(code: string, lang: string): string {
  if (knownLanguage(lang))
    return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
  return escapeHtml(code)
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Highlighted HTML cut into lines, closing every open span at a line break and
// reopening it on the next line, so each line can be its own block (line
// numbers, diff tints) without a comment or string that spans lines breaking
// the markup. highlight.js emits only `<span class="…">`, `</span>` and text.
export function splitLines(html: string): string[] {
  const lines: string[] = []
  const open: string[] = []
  let line = ''
  for (const [part] of html.matchAll(/<span[^>]*>|<\/span>|\n|[^<\n]+/g)) {
    if (part === '\n') {
      lines.push(line + '</span>'.repeat(open.length))
      line = open.join('')
    } else {
      if (part.startsWith('<span')) open.push(part)
      else if (part === '</span>') open.pop()
      line += part
    }
  }
  lines.push(line)
  return lines
}
