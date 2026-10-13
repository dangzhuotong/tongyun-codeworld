export const SEGMENT_IDS = [
  'switch',
  'gates',
  'cpu',
  'os',
  'languages',
  'arch',
  'nn',
  'attn',
] as const

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
    os: SegmentFlag
    languages: SegmentFlag
    arch: SegmentFlag
    nn: SegmentFlag
    attn: SegmentFlag
  }
}

export const STORAGE_KEY = 'tongyun-codeworld:progress'

export function emptyProgress(): ProgressState {
  return {
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
}
