import { emptyProgress, STORAGE_KEY, type ProgressState } from './types.ts'

function isBitPattern(value: unknown): value is string {
  return typeof value === 'string' && /^[01]{3}$/.test(value)
}

function isProgress(value: unknown): value is ProgressState {
  if (!value || typeof value !== 'object') return false
  const segments = (value as ProgressState).segments
  if (!segments) return false
  return (
    typeof segments.switch?.completed === 'boolean' &&
    isBitPattern(segments.switch.lastPattern) &&
    typeof segments.gates?.completed === 'boolean' &&
    typeof segments.cpu?.completed === 'boolean' &&
    typeof segments.nn?.completed === 'boolean' &&
    typeof segments.attn?.completed === 'boolean'
  )
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    const parsed: unknown = JSON.parse(raw)
    return isProgress(parsed) ? parsed : emptyProgress()
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
