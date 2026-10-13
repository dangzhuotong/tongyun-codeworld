import { emptyProgress, STORAGE_KEY, SEGMENT_IDS, type ProgressState } from './types.ts'

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    const base = emptyProgress()
    if (parsed && typeof parsed === 'object' && parsed.segments) {
      for (const key of SEGMENT_IDS) {
        if (parsed.segments[key]) {
          base.segments[key] = {
            ...base.segments[key],
            ...parsed.segments[key],
          } as never
        }
      }
    }
    return base
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(progress: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // 进度只留在本地；写不进去时界面仍可玩，只是刷新会丢。
  }
}
