import { expect, test } from 'vitest'
import FSConsts from '../src/FSConsts'
import { getColorForRating, getRatingForBytes } from '../src/FSRating'
import type { FSRating } from '../src/types'

test('getRatingForBytes', () => {
  type _TestCase = { bytes: number; expectedRating: FSRating; color: string }
  const testCases: _TestCase[] = [
    { bytes: 0, expectedRating: 'A+', color: FSConsts.ratingColors['A+'] },
    {
      bytes: 800 * 1024,
      expectedRating: 'B',
      color: FSConsts.ratingColors['B'],
    },
    {
      bytes: 1000 * 1024,
      expectedRating: 'C',
      color: FSConsts.ratingColors['C'],
    },
    {
      bytes: 1500 * 1024,
      expectedRating: 'D',
      color: FSConsts.ratingColors['D'],
    },
    {
      bytes: 2000 * 1024,
      expectedRating: 'E',
      color: FSConsts.ratingColors['E'],
    },
    { bytes: 2500 * 1024, expectedRating: 'F', color: FSConsts.ratingColors.F },
    { bytes: 5000 * 1024, expectedRating: 'F', color: FSConsts.ratingColors.F },
    { bytes: 7500 * 1024, expectedRating: 'F', color: FSConsts.ratingColors.F },
    {
      bytes: 10000 * 1024,
      expectedRating: 'F',
      color: FSConsts.ratingColors.F,
    },
  ]

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    const rating = getRatingForBytes(testCase.bytes)
    expect(rating).toBe(testCase.expectedRating)
    expect(getColorForRating(rating)).toBe(testCase.color)
  }
})
