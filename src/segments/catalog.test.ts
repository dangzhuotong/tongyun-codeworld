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

    it('provides at least two interview Q&As per segment', () => {
      for (const segment of SEGMENTS) {
        expect(segment.interviews.length).toBeGreaterThanOrEqual(2)
      }
    })

    it('has unique titles and subtitles across all segments', () => {
      const titles = SEGMENTS.map((s) => s.title)
      const subtitles = SEGMENTS.map((s) => s.subtitle)
      expect(new Set(titles).size).toBe(SEGMENTS.length)
      expect(new Set(subtitles).size).toBe(SEGMENTS.length)
    })

    it('has unique aiMapping text for every segment', () => {
      const mappings = SEGMENTS.map((s) => s.aiMapping)
      expect(new Set(mappings).size).toBe(SEGMENTS.length)
    })

    it('has unique interview questions within each segment', () => {
      for (const segment of SEGMENTS) {
        const questions = segment.interviews.map((qa) => qa.question)
        expect(new Set(questions).size).toBe(questions.length)
      }
    })

    it('has unique interview questions across all segments', () => {
      const allQuestions = SEGMENTS.flatMap((s) => s.interviews.map((qa) => qa.question))
      expect(new Set(allQuestions).size).toBe(allQuestions.length)
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

    it('has at most one road sign per segment (unique after targets)', () => {
      const afters = ROAD_SIGNS.map((s) => s.after)
      expect(new Set(afters).size).toBe(afters.length)
    })

    it('orders road signs to follow the segment order', () => {
      const order = new Map<string, number>(SEGMENT_IDS.map((id, idx) => [id, idx]))
      const indices = ROAD_SIGNS.map((sign) => order.get(sign.after)!)
      for (let i = 1; i < indices.length; i += 1) {
        expect(indices[i]).toBeGreaterThan(indices[i - 1])
      }
    })

    it('has unique road sign IDs, titles, and texts', () => {
      expect(new Set(ROAD_SIGNS.map((s) => s.id)).size).toBe(ROAD_SIGNS.length)
      expect(new Set(ROAD_SIGNS.map((s) => s.title)).size).toBe(ROAD_SIGNS.length)
      expect(new Set(ROAD_SIGNS.map((s) => s.text)).size).toBe(ROAD_SIGNS.length)
    })
  })
})
