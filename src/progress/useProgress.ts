import { useState } from 'react'
import { loadProgress, saveProgress } from './storage.ts'
import {
  emptyProgress,
  SEGMENT_IDS,
  type ProgressState,
  type SegmentId,
} from './types.ts'

function markCompleted(prev: ProgressState, id: SegmentId): ProgressState {
  switch (id) {
    case 'switch':
      return {
        ...prev,
        segments: {
          ...prev.segments,
          switch: { ...prev.segments.switch, completed: true },
        },
      }
    case 'gates':
      return {
        ...prev,
        segments: { ...prev.segments, gates: { completed: true } },
      }
    case 'cpu':
      return {
        ...prev,
        segments: { ...prev.segments, cpu: { completed: true } },
      }
    case 'nn':
      return {
        ...prev,
        segments: { ...prev.segments, nn: { completed: true } },
      }
    case 'attn':
      return {
        ...prev,
        segments: { ...prev.segments, attn: { completed: true } },
      }
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress())
  const [resetCount, setResetCount] = useState(0)

  const complete = (id: SegmentId) => {
    setProgress((prev) => {
      if (prev.segments[id].completed) return prev
      const next = markCompleted(prev, id)
      saveProgress(next)
      return next
    })
  }

  const setSwitchPattern = (pattern: string) => {
    setProgress((prev) => {
      const completed = prev.segments.switch.completed || pattern === '101'
      const next: ProgressState = {
        ...prev,
        segments: {
          ...prev.segments,
          switch: { completed, lastPattern: pattern },
        },
      }
      saveProgress(next)
      return next
    })
  }

  const reset = () => {
    const next = emptyProgress()
    saveProgress(next)
    setProgress(next)
    setResetCount((count) => count + 1)
  }

  const completedCount = SEGMENT_IDS.filter((id) => progress.segments[id].completed).length

  return { progress, complete, setSwitchPattern, reset, resetCount, completedCount }
}
