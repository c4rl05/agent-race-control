import { describe, expect, it } from 'vitest'
import { isProbe, programState } from './program'

// Payloads as Claude Code 2.1.296 sent them (kickoff doc, "A third status
// technique"): the text between `ESC ] 7501 ;` and the terminator.
const b64 = (text: string): string => btoa(text)

describe('isProbe', () => {
  it('recognises the startup query and nothing else', () => {
    expect(isProbe('?')).toBe(true)
    expect(isProbe('state=idle')).toBe(false)
  })
})

describe('programState', () => {
  it('maps the root record onto the dot', () => {
    expect(programState('state=working')).toBe('running')
    expect(programState('state=blocked:kind=permission')).toBe('waiting')
    expect(programState('state=idle')).toBe('idle')
    expect(programState('state=done')).toBe('idle')
    expect(programState('state=error')).toBe('idle')
  })

  it('reads the state wherever it sits, past base64 values with padding', () => {
    const msg = b64('approve Bash: node -e "console.log(4)"')
    expect(msg.endsWith('=')).toBe(true) // the fixture really does pad
    expect(programState(`msg=${msg}:state=blocked:kind=permission`)).toBe('waiting')
    expect(programState(`state=working:msg=${b64('Printing 42 with Node')}`)).toBe('running')
  })

  it('ignores child records — a subagent never paints the row', () => {
    expect(programState(`state=working:id=task-1:title=${b64('explore')}`)).toBe(null)
    expect(programState('state=clear:id=task-1')).toBe(null)
  })

  it('has no opinion on clear, unknown states, or junk', () => {
    expect(programState('state=clear')).toBe(null)
    expect(programState('state=thinking')).toBe(null)
    expect(programState('')).toBe(null)
    expect(programState('=working')).toBe(null)
  })
})
