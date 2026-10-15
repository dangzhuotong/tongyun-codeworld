import { describe, it, expect } from 'vitest'
import { ARCHITECTURE_CASES } from './architectureCasesData.ts'
import { MAP_NODES } from './knowledgeMapData.ts'

describe('architectureCasesData', () => {
  it('contains non-empty list of architecture cases', () => {
    expect(ARCHITECTURE_CASES.length).toBeGreaterThan(0)
  })

  it('has unique IDs across all architecture cases', () => {
    const ids = ARCHITECTURE_CASES.map((c) => c.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ARCHITECTURE_CASES.length)
  })

  it('has non-empty basic metadata fields for each case', () => {
    for (const item of ARCHITECTURE_CASES) {
      expect(item.id.trim()).not.toBe('')
      expect(item.title.trim()).not.toBe('')
      expect(item.subtitle.trim()).not.toBe('')
      expect(item.icon.trim()).not.toBe('')
      expect(item.category.trim()).not.toBe('')
      expect(item.trafficScale.trim()).not.toBe('')
      expect(item.latencyGoal.trim()).not.toBe('')
      expect(item.businessScenario.trim()).not.toBe('')
      expect(item.interviewInsight.trim()).not.toBe('')
    }
  })

  it('references existing knowledge map nodes in relatedNodeIds without duplicates', () => {
    const nodeIds = new Set(MAP_NODES.map((n) => n.id))
    for (const item of ARCHITECTURE_CASES) {
      expect(item.relatedNodeIds.length).toBeGreaterThan(0)
      const uniqueRelated = new Set(item.relatedNodeIds)
      expect(uniqueRelated.size).toBe(item.relatedNodeIds.length)

      for (const nodeId of item.relatedNodeIds) {
        expect(nodeIds.has(nodeId)).toBe(true)
      }
    }
  })

  it('contains valid layers with non-empty fields for each case', () => {
    for (const item of ARCHITECTURE_CASES) {
      expect(item.layers.length).toBeGreaterThan(0)
      for (const layer of item.layers) {
        expect(layer.name.trim()).not.toBe('')
        expect(layer.tech.trim()).not.toBe('')
        expect(layer.responsibility.trim()).not.toBe('')
      }
    }
  })

  it('contains sequential coreFlow steps with 1-based indexing and non-empty fields', () => {
    for (const item of ARCHITECTURE_CASES) {
      expect(item.coreFlow.length).toBeGreaterThan(0)
      item.coreFlow.forEach((step, idx) => {
        expect(step.step).toBe(idx + 1)
        expect(step.title.trim()).not.toBe('')
        expect(step.action.trim()).not.toBe('')
        expect(step.component.trim()).not.toBe('')
        expect(step.detail.trim()).not.toBe('')
      })
    }
  })

  it('contains technical challenges with non-empty problem, badApproach, and architectSolution', () => {
    for (const item of ARCHITECTURE_CASES) {
      expect(item.challenges.length).toBeGreaterThan(0)
      for (const challenge of item.challenges) {
        expect(challenge.problem.trim()).not.toBe('')
        expect(challenge.badApproach.trim()).not.toBe('')
        expect(challenge.architectSolution.trim()).not.toBe('')
      }
    }
  })
})
