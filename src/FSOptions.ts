import type { FSOptions } from './types.ts'

/**
 * Default options for the Footprint Sentinel.
 * These options can be overridden by the user to customize the behavior of the sentinel.
 */
export const defaultOptions: FSOptions = {
  // activate the Footprint Sentinel -> callbacks will work.
  // if no ui is activated, footprint sentinel can be used to collect data, e.g. matomo or Google Analytics
  isActivated: true,
  // Show two bars in the bottom right corner of the screen. The initial and total footprints with their rating
  showSentinel: true,
  // Show resource hints in the DOM, if a resource exceeds the defined thresholds
  showResourceHints: true,

  // Thresholds for resource sizes based on the area they occupy (similar to what Lighthouse uses)
  // Can be used to debug srcset images, e.g. by resizing the browser window, new resources will loaded
  // and flagged if they exceed the threshold

  // For the default value we used claude ai + trial and error to find a good value
  maxBytesPer100x100Threshold: 10 * 1024,

  // Threshold for the maximum size of a single resource
  // With maxBytesPer100x100Threshold we allow pretty large resources e.g. full width images
  // This is a hard limit for the size of a single resource, e.g. a large image.
  maxBytesPerResourceThreshold: 200 * 1024,

  // Threshold for resources that should be ignored
  // e.g. small images that are used for icons, logos or similar. They might end up getting flagged
  // because of the maxBytesPer100x100Threshold, but do not contribute significantly to the overall footprint.
  // Speed up the performance by ignoring these resources.
  ignoreResourcesBelowBytesThreshold: 40 * 1024,

  // zIndex to be used for displaying the footprint sentinel. Change this if you have other elements overlapping
  // the sentinel.
  sentinelZIndex: 10000,

  // Default filter that allows all resources
  // Can be used to e.g. filter out Neos backend resources
  skipResource: () => false,
}
