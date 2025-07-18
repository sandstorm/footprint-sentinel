export function createHash(data: string) {
  const seeds = [5381, 33, 65599, 131071] // Different prime seeds
  let result = ''

  for (const seed of seeds) {
    let hash = seed
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) + hash + data.charCodeAt(i)
    }
    result += (hash >>> 0).toString(16).padStart(8, '0')
  }

  return result
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(i > 1 ? 2 : 0)) + ' ' + sizes[i]
  )
}

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

export function findElementsWithUrl(url: URL, caseSensitive = false) {
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
  const matchingElements: any = []

  allElements.forEach(element => {
    const searchTerm = url.pathname + url.search + url.hash
    console.log(searchTerm)

    // Get all attributes
    const attributes = element.attributes

    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i]
      const value = caseSensitive ? attr.value : attr.value.toLowerCase()
      const search = caseSensitive ? searchTerm : searchTerm.toLowerCase()

      if (value.includes(search)) {
        matchingElements.push(element)
        break // Don't add same element multiple times
      }
    }
  })

  return matchingElements
}

export function updateInnerTextIfChanged(
  newText: string,
  element: Element | undefined | null
) {
  if (element && element instanceof HTMLElement) {
    const current = element.innerText
    if (current !== newText) {
      element.innerText = newText
    }
  }
}
