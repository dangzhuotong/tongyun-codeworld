import { describe, expect, it } from 'vitest'
import { bookshelfHash, parseBookshelfHash } from './route.ts'

describe('bookshelf hash route', () => {
  it('opens the shelf index', () => {
    expect(parseBookshelfHash('#/bookshelf/system-design')).toEqual({ open: true, slug: null })
    expect(parseBookshelfHash('#/bookshelf/system-design/')).toEqual({ open: true, slug: null })
    expect(bookshelfHash(null)).toBe('#/bookshelf/system-design')
  })

  it('opens a chapter slug', () => {
    expect(parseBookshelfHash('#/bookshelf/system-design/04-rate-limiter')).toEqual({
      open: true,
      slug: '04-rate-limiter',
    })
    expect(bookshelfHash('04-rate-limiter')).toBe('#/bookshelf/system-design/04-rate-limiter')
  })

  it('leaves the main journey alone for other hashes', () => {
    expect(parseBookshelfHash('')).toEqual({ open: false })
    expect(parseBookshelfHash('#labs')).toEqual({ open: false })
    expect(parseBookshelfHash('#/bookshelf')).toEqual({ open: false })
  })

  it('ignores a broken percent escape instead of throwing', () => {
    expect(parseBookshelfHash('#/bookshelf/system-design/%')).toEqual({
      open: true,
      slug: '%',
    })
  })
})
