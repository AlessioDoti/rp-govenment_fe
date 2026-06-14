import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value) }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((index) => Object.keys(store)[index] ?? null)
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor() { this.observe = vi.fn(); this.unobserve = vi.fn(); this.disconnect = vi.fn() }
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true, value: IntersectionObserverMock
})

// Mock document.body for theme store
beforeEach(() => {
  localStorageMock.clear()
  vi.restoreAllMocks()
  if (typeof document !== 'undefined') {
    document.body.removeAttribute('data-theme')
  }
})
