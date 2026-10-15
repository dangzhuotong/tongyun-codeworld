import { beforeEach, describe, expect, it } from 'vitest'
import { recallChapter, rememberChapter } from './storage.ts'

function createLocalStorageMock() {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => {
      store[key] = String(value)
    },
    removeItem: (key: string): void => {
      delete store[key]
    },
    clear: (): void => {
      store = {}
    },
    get length(): number {
      return Object.keys(store).length
    },
    key: (index: number): string | null => Object.keys(store)[index] ?? null,
  }
}

describe('bookshelf last chapter', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      writable: true,
      configurable: true,
    })
  })

  it('remembers the last opened slug on this browser', () => {
    expect(recallChapter()).toBeNull()
    rememberChapter('04-rate-limiter')
    expect(recallChapter()).toBe('04-rate-limiter')
    expect(localStorage.getItem('tongyun-codeworld:bookshelf:system-design:last')).toBe('04-rate-limiter')
  })
})
