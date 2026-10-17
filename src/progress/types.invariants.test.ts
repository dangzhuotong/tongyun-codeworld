import { describe, it, expect } from 'vitest'
import { emptyProgress, SEGMENT_IDS, STORAGE_KEY, type ProgressState } from './types.ts'

const EXPECTED_SEGMENT_IDS = [
  'switch',
  'gates',
  'cpu',
  'os',
  'languages',
  'arch',
  'nn',
  'attn',
] as const

describe('progress types invariants', () => {
  it('locks the canonical segment ordering', () => {
    expect([...SEGMENT_IDS]).toEqual([...EXPECTED_SEGMENT_IDS])
  })

  it('uses a namespaced storage key without whitespace or trailing separator', () => {
    expect(STORAGE_KEY).toBe('tongyun-codeworld:progress')
    expect(STORAGE_KEY).not.toMatch(/\s/)
    expect(STORAGE_KEY.endsWith(':')).toBe(false)
  })

  it('builds the full default ProgressState shape', () => {
    const expected: ProgressState = {
      segments: {
        switch: { completed: false, lastPattern: '01000001' },
        gates: { completed: false },
        cpu: { completed: false },
        os: { completed: false },
        languages: { completed: false },
        arch: { completed: false },
        nn: { completed: false },
        attn: { completed: false },
      },
    }

    expect(emptyProgress()).toEqual(expected)
  })

  it('exposes exactly one top-level segments container', () => {
    expect(Object.keys(emptyProgress())).toEqual(['segments'])
  })

  it('gives the switch segment exactly the completed and lastPattern fields', () => {
    expect(Object.keys(emptyProgress().segments.switch).sort()).toEqual([
      'completed',
      'lastPattern',
    ])
  })

  it('gives every non-switch segment exactly one completed flag', () => {
    const progress = emptyProgress()
    for (const id of SEGMENT_IDS) {
      if (id === 'switch') continue
      expect(Object.keys(progress.segments[id])).toEqual(['completed'])
    }
  })

  it('uses an 8-character binary string as the default switch pattern', () => {
    expect(emptyProgress().segments.switch.lastPattern).toMatch(/^[01]{8}$/)
  })
})
