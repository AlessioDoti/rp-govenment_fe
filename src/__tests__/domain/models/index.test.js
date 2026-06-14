import { describe, it, expect } from 'vitest'

describe('Domain models (JSDoc typedefs)', () => {
  it('exports an empty default (JSDoc-only module)', async () => {
    const mod = await import('@/domain/models/index.js')
    expect(Object.keys(mod)).toHaveLength(0)
  })
})
