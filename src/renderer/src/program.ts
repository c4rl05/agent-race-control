// Program status — the THIRD technique for the status dot (`ui.statusSource ===
// 'program'`). Claude Code (from 2.1.296) reports its own state over the
// Program Status Protocol (https://www.superlogical.com/rex/docs/build/program-status):
//
//   ESC ] 7501 ; key=value:key=value ST
//
// with `state` one of idle · working · blocked · done · error (plus `clear`,
// which drops a record), `kind` on blocked, an optional `id` for a CHILD record
// (a background subagent), and base64 `msg`/`title`. A program sends
// `OSC 7501 ; ?` once at startup and reports only if the terminal answers.
//
// Everything here is pure: one OSC payload in, a verdict out. Terminal.svelte
// owns the handler and the reply; the store decides whether the verdict paints.
// The mapping was measured on 2.1.296 (kickoff doc, "A third status
// technique"), and every choice below is the one recorded there.

import type { ScreenState } from './screen'

// The same three states the screen scan produces — delegating is not one of
// them: the root record says `working` for as long as a subagent runs, so it
// cannot tell "main busy" from "only subagents busy" (measured).
export type ProgramState = ScreenState

// The answer to the probe — exactly the probe echoed back, which is what Rex
// (and any terminal implementing the protocol) sends. A terminal reply, the
// same category as the DA1 answer xterm already sends on our behalf.
export const PROBE_REPLY = '\x1b]7501;?\x1b\\'

export function isProbe(payload: string): boolean {
  return payload.startsWith('?')
}

// One report → a dot state, or null for "no opinion" (the dot holds — the same
// failure mode the screen scan chose). Child records are ignored for the dot;
// so are `clear`, unknown states and anything malformed.
export function programState(payload: string): ProgramState | null {
  const fields = new Map<string, string>()
  for (const pair of payload.split(':')) {
    // Split on the FIRST '=' only: base64 values end in '=' padding.
    const at = pair.indexOf('=')
    if (at > 0) fields.set(pair.slice(0, at), pair.slice(at + 1))
  }
  if (fields.has('id')) return null
  switch (fields.get('state')) {
    case 'working':
      return 'running'
    case 'blocked':
      return 'waiting'
    // `done` is sticky (typing afterwards doesn't move it) and `idle` comes on
    // startup and after Esc — both are "your turn". `error` was never observed;
    // the turn is over either way.
    case 'idle':
    case 'done':
    case 'error':
      return 'idle'
    default:
      return null
  }
}
