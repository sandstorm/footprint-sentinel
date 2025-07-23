/**
 * Bytes to human-readable format
 *
 * @param bytes
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(i > 1 ? 2 : 0)) + ' ' + sizes[i]
  )
}

/**
 * Get a factor for scaling the font size and the length of the sentinel
 *
 * @param bytes
 * @param maxFactor
 */
export function getSizeFactorForBytes(
  bytes: number,
  maxFactor: number = 8
): number {
  const kb = bytes / 1024

  // Define your range
  const maxKb = 2419.56 // Your F threshold

  // Linear interpolation from 1 to maxFactor
  const factor = 1 + (kb / maxKb) * (maxFactor - 1)

  // Clamp between 1 and maxFactor
  return Math.min(maxFactor, Math.max(1, factor))
}

/**
 * Find all elements in the document that have attribute values containing the given URL.
 * E.g. as src or href attributes or in style attributes e.g. as a background-image.
 *
 * @param url
 */
export function findElementsWithUrl(url: URL): Element[] {
  // WHY not *
  // Performance reasons, we only want to search for elements that are likely to have a src or href attribute
  // -> feel free to change this selector to include more elements if needed
  const allElements = document.querySelectorAll(`
      img[src],
      img[srcset],
      script[src],
      link[href],
      iframe[src],
      embed[src],
      object[data],
      source[src],
      source[srcset],
      track[src],
      audio[src],
      video[src],
      input[src],
      frame[src],
      [style]
    `)

  const matchingElements: Element[] = []

  allElements.forEach(element => {
    const searchTerm = url.pathname + url.search + url.hash

    // Get all attributes
    const attributes = element.attributes

    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i]
      const value = attr.value.toLowerCase()
      const search = searchTerm.toLowerCase()

      if (value.includes(search)) {
        matchingElements.push(element)
        break // Don't add same element multiple times
      }
    }
  })

  return matchingElements
}
