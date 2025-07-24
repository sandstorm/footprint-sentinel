import { beforeEach, describe, expect, test, it } from 'vitest'
import { findElementsWithUrl, formatBytes } from '../src/utils'

describe('formatting bytes', () => {
  test('formatBytes() with positive input', () => {
    type _TestCase = { bytes: number; expected: string }
    const testCases: _TestCase[] = [
      // Bytes
      { bytes: 0, expected: '0 B' },
      { bytes: 500, expected: '500 B' },
      { bytes: 1000, expected: '1000 B' },

      // Kilobytes
      { bytes: 1024 * 5, expected: '5 KB' },
      { bytes: 1024 * 5.2, expected: '5 KB' },
      { bytes: 1024 * 5.5, expected: '6 KB' },
      { bytes: 1024 * 55, expected: '55 KB' },
      { bytes: 1024 * 55.2, expected: '55 KB' },
      { bytes: 1024 * 55.5, expected: '56 KB' },
      { bytes: 1024 * 555, expected: '555 KB' },
      { bytes: 1024 * 555.2, expected: '555 KB' },
      { bytes: 1024 * 555.5, expected: '556 KB' },

      // Megabytes
      { bytes: 1024 * 1024 * 5, expected: '5 MB' },
      { bytes: 1024 * 1024 * 5.2, expected: '5.2 MB' },
      { bytes: 1024 * 1024 * 5.5, expected: '5.5 MB' },
      { bytes: 1024 * 1024 * 5.55, expected: '5.55 MB' },
      { bytes: 1024 * 1024 * 5.56, expected: '5.56 MB' },
      { bytes: 1024 * 1024 * 5.555, expected: '5.55 MB' },
      { bytes: 1024 * 1024 * 5.556, expected: '5.56 MB' },

      // Gigabytes
      { bytes: 1024 * 1024 * 1024 * 5, expected: '5 GB' },
      { bytes: 1024 * 1024 * 1024 * 5.2, expected: '5.2 GB' },
      { bytes: 1024 * 1024 * 1024 * 5.5, expected: '5.5 GB' },
      { bytes: 1024 * 1024 * 1024 * 5.55, expected: '5.55 GB' },
      { bytes: 1024 * 1024 * 1024 * 5.56, expected: '5.56 GB' },
      { bytes: 1024 * 1024 * 1024 * 5.555, expected: '5.55 GB' },
      { bytes: 1024 * 1024 * 1024 * 5.556, expected: '5.56 GB' },
    ]
    for (const testCase of testCases) {
      const result = formatBytes(testCase.bytes)
      expect(result).toBe(testCase.expected)
    }
  })

  test('formatBytes() with negative input', () => {
    expect(() => formatBytes(-100)).toThrow('Bytes cannot be negative')
  })
})

describe('finding elements based on their attributes', () => {
  beforeEach(() => {
    // Clear the document before each test
    document.body.innerHTML = ''
    document.head.innerHTML = ''
  })

  it('findElementsWithUrl() should find relative and absolute paths', () => {
    document.body.innerHTML = `
      <img src="/api/images/image.jpg" />
      <img src="/other/image.jpg" />
      <img src="https://example.com/api/images/image.jpg" />
      <img style="background: url(https://example.com/api/images/image.jpg);" />
    `

    let result = findElementsWithUrl(
      new URL('https://example.com/api/images/image.jpg')
    )

    expect(result).toHaveLength(3)
    expect(result[0].getAttribute('src')).toBe('/api/images/image.jpg')
    expect(result[1].getAttribute('src')).toBe(
      'https://example.com/api/images/image.jpg'
    )
    expect(result[2].getAttribute('style')).toContain(
      'background: url(https://example.com/api/images/image.jpg)'
    )
  })
})
