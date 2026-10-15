import { describe, it, expect } from 'vitest'
import { CATEGORIES, MAP_NODES, MAP_LINKS } from './knowledgeMapData.ts'
import { ARCHITECTURE_CASES } from './architectureCasesData.ts'
import { SEGMENT_IDS } from '../progress/types.ts'

describe('knowledgeMapData', () => {
  describe('CATEGORIES', () => {
    it('contains non-empty list of categories', () => {
      expect(CATEGORIES.length).toBeGreaterThan(0)
    })

    it('has unique category IDs', () => {
      const ids = CATEGORIES.map((c) => c.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(CATEGORIES.length)
    })

    it('has non-empty fields for each category', () => {
      for (const cat of CATEGORIES) {
        expect(cat.id.trim()).not.toBe('')
        expect(cat.name.trim()).not.toBe('')
        expect(cat.color.trim()).not.toBe('')
        expect(cat.description.trim()).not.toBe('')
      }
    })
  })

  describe('MAP_NODES', () => {
    it('contains non-empty list of nodes', () => {
      expect(MAP_NODES.length).toBeGreaterThan(0)
    })

    it('has unique node IDs', () => {
      const ids = MAP_NODES.map((n) => n.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(MAP_NODES.length)
    })

    it('has non-empty basic fields for each node', () => {
      const allowedImportance = new Set(['core', 'important', 'advanced'])
      for (const node of MAP_NODES) {
        expect(node.id.trim()).not.toBe('')
        expect(node.title.trim()).not.toBe('')
        expect(node.category.trim()).not.toBe('')
        expect(node.categoryId.trim()).not.toBe('')
        expect(node.summary.trim()).not.toBe('')
        expect(node.tag.trim()).not.toBe('')
        expect(allowedImportance.has(node.importance)).toBe(true)
        expect(node.x).toBeGreaterThanOrEqual(0)
        expect(node.x).toBeLessThanOrEqual(100)
        expect(node.y).toBeGreaterThanOrEqual(0)
        expect(node.y).toBeLessThanOrEqual(100)
      }
    })

    it('every node references an existing categoryId and category name matches', () => {
      const categoryMap = new Map(CATEGORIES.map((c) => [c.id, c.name]))
      for (const node of MAP_NODES) {
        expect(categoryMap.has(node.categoryId)).toBe(true)
        expect(node.category).toBe(categoryMap.get(node.categoryId))
      }
    })

    it('has valid doc structure and non-empty documentation strings', () => {
      for (const node of MAP_NODES) {
        const { doc } = node
        expect(doc.overview.trim()).not.toBe('')
        expect(doc.mentalModel.trim()).not.toBe('')
        expect(doc.architectureImpact.trim()).not.toBe('')
        expect(doc.aiEraRelevance.trim()).not.toBe('')
        expect(doc.tradeoffs.trim()).not.toBe('')

        expect(doc.coreMechanisms.length).toBeGreaterThan(0)
        for (const item of doc.coreMechanisms) {
          expect(item.title.trim()).not.toBe('')
          expect(item.desc.trim()).not.toBe('')
        }
      }
    })

    it('every relatedArchCase in doc references an existing ArchitectureCase ID', () => {
      const caseIds = new Set(ARCHITECTURE_CASES.map((c) => c.id))
      for (const node of MAP_NODES) {
        for (const caseId of node.doc.relatedArchCases) {
          expect(caseIds.has(caseId)).toBe(true)
        }
      }
    })

    it('every relatedLabId in doc (when defined) references an existing SegmentId', () => {
      const segmentIds = new Set(SEGMENT_IDS)
      for (const node of MAP_NODES) {
        if (node.doc.relatedLabId !== undefined) {
          expect(segmentIds.has(node.doc.relatedLabId as never)).toBe(true)
        }
      }
    })
  })

  describe('MAP_LINKS', () => {
    it('contains non-empty list of links', () => {
      expect(MAP_LINKS.length).toBeGreaterThan(0)
    })

    it('every link from and to references an existing node ID', () => {
      const nodeIds = new Set(MAP_NODES.map((n) => n.id))
      for (const link of MAP_LINKS) {
        expect(nodeIds.has(link.from)).toBe(true)
        expect(nodeIds.has(link.to)).toBe(true)
      }
    })

    it('does not have self-referencing links', () => {
      for (const link of MAP_LINKS) {
        expect(link.from).not.toBe(link.to)
      }
    })

    it('has non-empty labels when label is provided', () => {
      for (const link of MAP_LINKS) {
        if (link.label !== undefined) {
          expect(link.label.trim()).not.toBe('')
        }
      }
    })

    it('has unique directed links without duplicate connections', () => {
      const linkPairs = MAP_LINKS.map((l) => `${l.from}->${l.to}`)
      const uniqueLinkPairs = new Set(linkPairs)
      expect(uniqueLinkPairs.size).toBe(MAP_LINKS.length)
    })
  })
})
