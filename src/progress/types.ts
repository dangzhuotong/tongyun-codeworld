export const SEGMENT_IDS = ['switch', 'gates', 'cpu', 'nn', 'attn'] as const

export type SegmentId = (typeof SEGMENT_IDS)[number]

export interface SwitchProgress {
  completed: boolean
  lastPattern: string
}

export interface SegmentFlag {
  completed: boolean
}

export interface ProgressState {
  segments: {
    switch: SwitchProgress
    gates: SegmentFlag
    cpu: SegmentFlag
    nn: SegmentFlag
    attn: SegmentFlag
  }
}

export const STORAGE_KEY = 'tongyun-codeworld:progress'

export function emptyProgress(): ProgressState {
  return {
    segments: {
      switch: { completed: false, lastPattern: '000' },
      gates: { completed: false },
      cpu: { completed: false },
      nn: { completed: false },
      attn: { completed: false },
    },
  }
}
