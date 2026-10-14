import { describe, it, expect } from 'vitest'
import { SEGMENTS, ROAD_SIGNS } from './catalog.ts'
import { SEGMENT_IDS } from '../progress/types.ts'

describe('segments catalog', () => {
  describe('SEGMENTS', () => {
    it('has exactly the segments defined in SEGMENT_IDS in identical order', () => {
      expect(SEGMENTS.map((s) => s.id)).toEqual([...SEGMENT_IDS])
    })

    it('has unique IDs across all segment definitions', () => {
      const ids = SEGMENTS.map((s) => s.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(SEGMENTS.length)
    })

    it('has 1-based contiguous sequential indices', () => {
      SEGMENTS.forEach((segment, idx) => {
        expect(segment.index).toBe(idx + 1)
      })
    })

    it('has non-empty title, subtitle, hint, goal, and aiMapping for every segment', () => {
      for (const segment of SEGMENTS) {
        expect(segment.id.trim()).not.toBe('')
        expect(segment.title.trim()).not.toBe('')
        expect(segment.subtitle.trim()).not.toBe('')
        expect(segment.hint.trim()).not.toBe('')
        expect(segment.goal.trim()).not.toBe('')
        expect(segment.aiMapping.trim()).not.toBe('')
      }
    })

    it('contains at least one interview Q&A for every segment with non-empty fields', () => {
      for (const segment of SEGMENTS) {
        expect(segment.interviews.length).toBeGreaterThan(0)
        for (const qa of segment.interviews) {
          expect(qa.question.trim()).not.toBe('')
          expect(qa.answer.trim()).not.toBe('')
          expect(qa.focus.trim()).not.toBe('')
        }
      }
    })
  })

  describe('ROAD_SIGNS', () => {
    it('contains road signs', () => {
      expect(ROAD_SIGNS.length).toBeGreaterThan(0)
    })

    it('has unique IDs for every road sign', () => {
      const signIds = ROAD_SIGNS.map((s) => s.id)
      const uniqueSignIds = new Set(signIds)
      expect(uniqueSignIds.size).toBe(ROAD_SIGNS.length)
    })

    it('references an existing segment in SEGMENT_IDS for each road sign after property', () => {
      const segmentSet = new Set(SEGMENT_IDS)
      for (const sign of ROAD_SIGNS) {
        expect(segmentSet.has(sign.after)).toBe(true)
      }
    })

    it('has non-empty id, title, and text for every road sign', () => {
      for (const sign of ROAD_SIGNS) {
        expect(sign.id.trim()).not.toBe('')
        expect(sign.title.trim()).not.toBe('')
        expect(sign.text.trim()).not.toBe('')
      }
    })
  })
})
