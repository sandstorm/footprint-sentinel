import type { FSRating } from './types.ts'
import FSConsts from './FSConsts.ts'

/**
 * Get digital carbon rating according to Sustainable Web Design guidelines
 * Evaluates the environmental impact of data transfer based on byte size
 *
 * @see {@link https://sustainablewebdesign.org/digital-carbon-ratings} for rating methodology
 *
 * @param bytes - bytes - The number of bytes to evaluate (must be non-negative)
 * @returns The corresponding FSRating based on carbon footprint thresholds
 */
export function getRatingForBytes(bytes: number): FSRating {
  const kb = bytes / 1024
  if (kb < 272.51) {
    return 'A+'
  } else if (kb < 531.15) {
    return 'A'
  } else if (kb < 975.85) {
    return 'B'
  } else if (kb < 1410.39) {
    return 'C'
  } else if (kb < 1875.01) {
    return 'D'
  } else if (kb < 2419.56) {
    return 'E'
  } else {
    return 'F'
  }
}

/**
 * Get the color associated with a given FSRating
 * @param rating
 */
export function getColorForRating(rating: FSRating): string {
  switch (rating) {
    case 'A+':
      return FSConsts.ratingColors['A+']
    case 'A':
      return FSConsts.ratingColors.A
    case 'B':
      return FSConsts.ratingColors.B
    case 'C':
      return FSConsts.ratingColors.C
    case 'D':
      return FSConsts.ratingColors.D
    case 'E':
      return FSConsts.ratingColors.E
    case 'F':
      return FSConsts.ratingColors.F
    default:
      throw new Error(`Unknown rating: ${rating}`)
  }
}
