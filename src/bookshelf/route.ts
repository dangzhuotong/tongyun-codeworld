export const BOOKSHELF_HASH = '#/bookshelf/system-design'

const PREFIX = '/bookshelf/system-design'

export type BookshelfRoute = { open: false } | { open: true; slug: string | null }

export function bookshelfHash(slug?: string | null): string {
  if (!slug) return BOOKSHELF_HASH
  return `${BOOKSHELF_HASH}/${encodeURIComponent(slug)}`
}

function decodeHashPath(hash: string): string {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  const path = (raw.split('?')[0] ?? '').replace(/\/+$/, '')
  try {
    return decodeURIComponent(path)
  } catch {
    return path
  }
}

export function parseBookshelfHash(hash: string): BookshelfRoute {
  const path = decodeHashPath(hash)
  if (path !== PREFIX && !path.startsWith(`${PREFIX}/`)) return { open: false }
  if (path === PREFIX) return { open: true, slug: null }
  const slug = path.slice(PREFIX.length + 1).split('/')[0] ?? ''
  return { open: true, slug: slug || null }
}

export function navigateBookshelf(slug?: string | null): void {
  const nextHash = bookshelfHash(slug)
  if (window.location.hash === nextHash) return
  const next = `${window.location.pathname}${window.location.search}${nextHash}`
  window.history.pushState(null, '', next)
  window.dispatchEvent(new Event('hashchange'))
}

export function closeBookshelf(): void {
  if (!window.location.hash) return
  const next = `${window.location.pathname}${window.location.search}`
  window.history.pushState(null, '', next)
  window.dispatchEvent(new Event('hashchange'))
}
