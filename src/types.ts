import type FSResource from './FSResource.ts'

export type FSOptions = {
  isActivated: boolean
  showFootprint: boolean
  showResourceHints: boolean
  maxBytesPer100x100Threshold: number
  maxBytesPerResourceThreshold: number
  ignoreResourcesBelowBytesThreshold: number
  fsZIndex: number
  resourceFilter: (url: string) => boolean
  onInitialFootprint?: (footprint: FSResult) => void
  onFootprintChange?: (footprint: FSChangeResult) => void
}

export type FSResult = {
  total: { bytes: number; bytesFormatted: string; rating: string }
  lastDelta: { bytes: number; bytesFormatted: string }
}

export type FSChangeResult = {
  total: { bytes: number; bytesFormatted: string; rating: string }
  lastDelta: { bytes: number; bytesFormatted: string }
}

export type FSRating = 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export type FSResourcesOptions = {
  fsOptions: FSOptions
  onResourceUpdated: (resource: FSResource) => void
  onInitialFootprint: () => void
}
