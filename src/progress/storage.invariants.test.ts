import { describe, it, expect, beforeEach } from 'vitest'
import { loadProgress, saveProgress } from './storage.ts'
import { emptyProgress, SEGMENT_IDS, STORAGE_KEY } from './types.ts'

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

describe('progress storage invariants', () => {
  beforeEach(() => {
    mockStorage.clear()
  })

  it('returns emptyProgress when the stored raw value is an empty string', () => {
    mockStorage.setItem(STORAGE_KEY, '')
    expect(loadProgress()).toEqual(emptyProgress())
  })

  it('preserves a custom switch lastPattern while keeping completed default', () => {
    mockStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ segments: { switch: { lastPattern: '11110000' } } }),
    )

    const loaded = loadProgress()
    expect(loaded.segments.switch.lastPattern).toBe('11110000')
    expect(loaded.segments.switch.completed).toBe(false)
  })

  it('restores every known segment flag from a fully completed state', () => {
    const stored = emptyProgress()
    for (const id of SEGMENT_IDS) {
      stored.segments[id].completed = true
    }
    mockStorage.setItem(STORAGE_KEY, JSON.stringify(stored))

    const loaded = loadProgress()
    for (const id of SEGMENT_IDS) {
      expect(loaded.segments[id].completed).toBe(true)
    }
  })

  it('returns independent populated objects on successive calls', () => {
    const stored = emptyProgress()
    stored.segments.gates.completed = true
    mockStorage.setItem(STORAGE_KEY, JSON.stringify(stored))

    const first = loadProgress()
    const second = loadProgress()
    expect(first).not.toBe(second)
    expect(first).toEqual(second)

    first.segments.gates.completed = false
    expect(second.segments.gates.completed).toBe(true)
  })

  it('does not pollute Object.prototype through a __proto__ segment key', () => {
    mockStorage.setItem(STORAGE_KEY, '{"segments":{"__proto__":{"polluted":true}}}')

    expect(loadProgress()).toEqual(emptyProgress())
    expect(Object.prototype.hasOwnProperty.call(Object.prototype, 'polluted')).toBe(false)
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  })

  it('round-trips an unknown extra field kept inside a known segment', () => {
    const state = emptyProgress()
    ;(state.segments.gates as unknown as { note?: string }).note = 'kept'

    saveProgress(state)

    const loaded = loadProgress()
    expect((loaded.segments.gates as unknown as { note?: string }).note).toBe('kept')
    expect(loaded.segments.gates.completed).toBe(false)
  })

  it('treats falsy numeric or boolean segment payloads as absent', () => {
    mockStorage.setItem(STORAGE_KEY, JSON.stringify({ segments: { gates: 0, cpu: false } }))

    const loaded = loadProgress()
    expect(loaded.segments.gates).toEqual({ completed: false })
    expect(loaded.segments.cpu).toEqual({ completed: false })
  })

  it('does not mutate the raw stored string while loading', () => {
    const raw = JSON.stringify({
      segments: { switch: { completed: true, lastPattern: '00001111' } },
    })
    mockStorage.setItem(STORAGE_KEY, raw)

    loadProgress()

    expect(mockStorage.getItem(STORAGE_KEY)).toBe(raw)
  })
})
