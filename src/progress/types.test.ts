import { describe, it, expect } from 'vitest'
import { emptyProgress, SEGMENT_IDS, STORAGE_KEY } from './types.ts'

describe('progress types', () => {
  describe('STORAGE_KEY', () => {
    it('uses the tongyun-codeworld namespace prefix', () => {
      expect(STORAGE_KEY.startsWith('tongyun-codeworld:')).toBe(true)
      expect(STORAGE_KEY).toBe('tongyun-codeworld:progress')
    })
  })

  describe('SEGMENT_IDS', () => {
    it('contains a non-empty list of unique segment ids', () => {
      expect(SEGMENT_IDS.length).toBeGreaterThan(0)
      expect(new Set(SEGMENT_IDS).size).toBe(SEGMENT_IDS.length)
    })
  })

  describe('emptyProgress', () => {
    it('includes exactly the keys declared in SEGMENT_IDS', () => {
      const progress = emptyProgress()
      expect(Object.keys(progress.segments).sort()).toEqual([...SEGMENT_IDS].sort())
    })

    it('marks every segment incomplete by default', () => {
      const progress = emptyProgress()
      for (const id of SEGMENT_IDS) {
        expect(progress.segments[id].completed).toBe(false)
      }
    })

    it('gives the switch segment a default ASCII pattern for "A"', () => {
      expect(emptyProgress().segments.switch.lastPattern).toBe('01000001')
    })

    it('returns a fresh independent object on every call', () => {
      const first = emptyProgress()
      const second = emptyProgress()
      expect(first).not.toBe(second)
      expect(first.segments).not.toBe(second.segments)

      first.segments.switch.completed = true
      first.segments.gates.completed = true

      expect(second.segments.switch.completed).toBe(false)
      expect(second.segments.gates.completed).toBe(false)
      expect(emptyProgress().segments.switch.completed).toBe(false)
    })
  })
})
