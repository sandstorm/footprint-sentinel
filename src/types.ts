import type FSResource from './FSResource'

export type FSOptions = {
  isActivated: boolean
  showSentinel: boolean
  showResourceHints: boolean
  maxBytesPer100x100Threshold: number
  maxBytesPerResourceThreshold: number
  ignoreResourcesBelowBytesThreshold: number
  sentinelZIndex: number
  skipResource: (url: string) => boolean
  onInitialFootprint?: (footprint: FSResult) => void
  onFootprintChange?: (footprint: FSChangeResult) => void
}

export type FSResult = {
  total: {
    bytes: number
    bytesFormatted: string
    rating: string
    color: string
  }
  lastDelta: { bytes: number; bytesFormatted: string }
}

export type FSChangeResult = {
  total: {
    bytes: number
    bytesFormatted: string
    rating: string
    color: string
  }
  lastDelta: { bytes: number; bytesFormatted: string }
}

export type FSRating = 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export type FSResourcesOptions = {
  options: FSOptions
  onResourceUpdated: (resource: FSResource) => void
  onInitialFootprint: () => void
}
