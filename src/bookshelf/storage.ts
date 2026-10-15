const LAST_CHAPTER_KEY = 'tongyun-codeworld:bookshelf:system-design:last'

export function recallChapter(): string | null {
  try {
    const value = localStorage.getItem(LAST_CHAPTER_KEY)
    return value && value.trim() ? value : null
  } catch {
    return null
  }
}

export function rememberChapter(slug: string): void {
  try {
    localStorage.setItem(LAST_CHAPTER_KEY, slug)
  } catch {
    // 只记在这台浏览器上；写不进去时仍可继续读。
  }
}
