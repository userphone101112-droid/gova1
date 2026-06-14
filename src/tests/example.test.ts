import { describe, it, expect } from '@jest/globals'

describe('Example Test Suite', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle async operations', async () => {
    const promise = Promise.resolve(42)
    await expect(promise).resolves.toBe(42)
  })
})
