import { describe, it, expect } from 'vitest'
import { SEGMENTS, ROAD_SIGNS } from './catalog.ts'
import { SEGMENT_IDS } from '../progress/types.ts'

describe('catalog cross-module invariants', () => {
  it('defines exactly one segment definition for each SEGMENT_IDS entry', () => {
    expect(SEGMENTS).toHaveLength(SEGMENT_IDS.length)
    for (const id of SEGMENT_IDS) {
      expect(SEGMENTS.filter((segment) => segment.id === id)).toHaveLength(1)
    }
  })

  it('keeps each segment index in sync with the SEGMENT_IDS ordering', () => {
    SEGMENT_IDS.forEach((id, position) => {
      const segment = SEGMENTS.find((candidate) => candidate.id === id)
      expect(segment?.index).toBe(position + 1)
    })
  })

  it('banners every aiMapping with the AI paradigm mapping marker', () => {
    for (const segment of SEGMENTS) {
      expect(segment.aiMapping.startsWith('【未来 AI 范式映射')).toBe(true)
    }
  })

  it('names every road sign with the sign- prefix', () => {
    for (const sign of ROAD_SIGNS) {
      expect(sign.id.startsWith('sign-')).toBe(true)
    }
  })

  it('labels every road sign title with the 路牌 · prefix', () => {
    for (const sign of ROAD_SIGNS) {
      expect(sign.title.startsWith('路牌 ·')).toBe(true)
    }
  })

  it('starts with a road sign placed after the very first segment', () => {
    expect(ROAD_SIGNS[0].after).toBe(SEGMENT_IDS[0])
  })

  it('covers every segment except the final one exactly once', () => {
    const finalSegment = SEGMENT_IDS[SEGMENT_IDS.length - 1]
    const afters = ROAD_SIGNS.map((sign) => sign.after)
    const expected = SEGMENT_IDS.filter((id) => id !== finalSegment)

    expect(afters).not.toContain(finalSegment)
    expect([...afters].sort()).toEqual([...expected].sort())
  })
})
