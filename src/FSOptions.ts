import type { FSOptions } from './types.ts'

export const fsDefaultOptions: FSOptions = {
  // Activate the FootprintGuard functionality
  // e.g. can be different for Neos backend and frontend
  isActivated: true,
  showFootprint: true,
  showResourceHints: true,

  // Thresholds for resource sizes based on the area they occupy (similar to what Lighthouse uses)
  // Can be used to debug srcset images, e.g. by resizing the browser window, new resources will loaded
  // and flagged if they exceed the threshold
  //
  // For the default value we used claude ai + trial and error to find a good value
  maxBytesPer100x100Threshold: 10 * 1024,

  // Threshold for the maximum size of a single resource
  // With maxBytesPer100x100Threshold we allow pretty large resources e.g. full width images
  // This is a hard limit for the size of a single resource, e.g. a large image.
  maxBytesPerResourceThreshold: 200 * 1024,

  // Threshold for resources that should be ignored
  // e.g. small images that are used for icons, logos or similar. They might end up getting flagged
  // because of the maxBytesPer100x100Threshold, but do not contribute significantly to the overall footprint.
  // This will also speed up finding relements using this resource in the DOM.
  ignoreResourcesBelowBytesThreshold: 40 * 1024,

  fsZIndex: 1000,

  // Default filter that allows all resources
  // Can be used to e.g. filter out Neos backend resources
  resourceFilter: () => true,
}
