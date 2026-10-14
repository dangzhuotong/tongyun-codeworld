import { describe, it, expect, beforeEach } from 'vitest'
import { loadProgress, saveProgress } from './storage.ts'
import { emptyProgress, STORAGE_KEY } from './types.ts'
import type { ProgressState } from './types.ts'

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

const mockStorage = createLocalStorageMock()

Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  writable: true,
  configurable: true,
})

describe('progress storage module', () => {
  beforeEach(() => {
    mockStorage.clear()
  })

  describe('loadProgress', () => {
    it('returns emptyProgress when localStorage is empty', () => {
      expect(mockStorage.getItem(STORAGE_KEY)).toBeNull()
      const progress = loadProgress()
      expect(progress).toEqual(emptyProgress())
    })

    it('returns stored progress when valid data is present', () => {
      const saved: ProgressState = {
        segments: {
          switch: { completed: true, lastPattern: '11110000' },
          gates: { completed: true },
          cpu: { completed: false },
          os: { completed: true },
          languages: { completed: false },
          arch: { completed: false },
          nn: { completed: false },
          attn: { completed: false },
        },
      }
      mockStorage.setItem(STORAGE_KEY, JSON.stringify(saved))

      const loaded = loadProgress()
      expect(loaded).toEqual(saved)
    })

    it('merges partial segment data with emptyProgress defaults', () => {
      const partial = {
        segments: {
          switch: { completed: true },
        },
      }
      mockStorage.setItem(STORAGE_KEY, JSON.stringify(partial))

      const loaded = loadProgress()
      expect(loaded.segments.switch.completed).toBe(true)
      // Preserves default lastPattern from emptyProgress
      expect(loaded.segments.switch.lastPattern).toBe('01000001')
      // Other segments remain default
      expect(loaded.segments.gates.completed).toBe(false)
      expect(loaded.segments.cpu.completed).toBe(false)
    })

    it('returns emptyProgress when stored JSON is invalid', () => {
      mockStorage.setItem(STORAGE_KEY, 'not-valid-json{')
      expect(loadProgress()).toEqual(emptyProgress())
    })

    it('returns emptyProgress when parsed value is null or primitive', () => {
      mockStorage.setItem(STORAGE_KEY, 'null')
      expect(loadProgress()).toEqual(emptyProgress())

      mockStorage.setItem(STORAGE_KEY, '"some string"')
      expect(loadProgress()).toEqual(emptyProgress())

      mockStorage.setItem(STORAGE_KEY, '42')
      expect(loadProgress()).toEqual(emptyProgress())
    })

    it('returns emptyProgress when segments key is missing', () => {
      mockStorage.setItem(STORAGE_KEY, JSON.stringify({ otherData: 123 }))
      expect(loadProgress()).toEqual(emptyProgress())
    })

    it('ignores unknown segment keys', () => {
      const payload = {
        segments: {
          unknownSegment: { completed: true },
        },
      }
      mockStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      const loaded = loadProgress()
      expect(loaded).toEqual(emptyProgress())
    })

    it('handles localStorage.getItem error gracefully', () => {
      const originalGetItem = mockStorage.getItem
      mockStorage.getItem = () => {
        throw new Error('Access denied')
      }
      try {
        expect(loadProgress()).toEqual(emptyProgress())
      } finally {
        mockStorage.getItem = originalGetItem
      }
    })
  })

  describe('saveProgress', () => {
    it('serializes and persists progress state to localStorage under STORAGE_KEY', () => {
      const state = emptyProgress()
      state.segments.gates.completed = true

      saveProgress(state)

      const storedRaw = mockStorage.getItem(STORAGE_KEY)
      expect(storedRaw).not.toBeNull()
      expect(JSON.parse(storedRaw!)).toEqual(state)
    })

    it('round-trips state accurately through saveProgress and loadProgress', () => {
      const state = emptyProgress()
      state.segments.switch.completed = true
      state.segments.switch.lastPattern = '10101010'
      state.segments.cpu.completed = true

      saveProgress(state)
      const loaded = loadProgress()
      expect(loaded).toEqual(state)
    })

    it('handles localStorage.setItem error gracefully without throwing', () => {
      const originalSetItem = mockStorage.setItem
      mockStorage.setItem = () => {
        throw new Error('QuotaExceededError')
      }
      try {
        expect(() => saveProgress(emptyProgress())).not.toThrow()
      } finally {
        mockStorage.setItem = originalSetItem
      }
    })
  })
})
