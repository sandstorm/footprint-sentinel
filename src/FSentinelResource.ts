import { createShortHashSync, formatBytes } from './utils'
import type { FSentinelOptions } from './types.ts'

export default class FSentinelResource {
  public url: string
  public size: number
  public options: FSentinelOptions

  constructor(resource: PerformanceResourceTiming, options: FSentinelOptions) {
    this.url = resource.name
    this.size = FSentinelResource.sizeFromResource(resource)
    this.options = options
  }

  public updateIfNeeded(resource: PerformanceResourceTiming): boolean {
    const newSize = FSentinelResource.sizeFromResource(resource)
    if (this.size !== newSize) {
      this.size = newSize
      return true
    }
    return false
  }

  public getHash() {
    return createShortHashSync(this.url + this.size)
  }

  public renderHint(element: Element) {
    _renderResourceHint(element, this)
  }

  static sizeFromResource(resource: PerformanceResourceTiming): number {
    return resource.transferSize || resource.encodedBodySize || 0
  }
}

function _renderResourceHint(element: Element, resource: FSentinelResource) {
  if (resource.size < resource.options.ignoreResourcesBelowBytesThreshold)
    return

  const parentElement = element.parentElement

  if (parentElement) {
    let hintTarget: HTMLElement = element as HTMLElement
    switch (true) {
      case parentElement instanceof HTMLPictureElement:
      case parentElement instanceof HTMLVideoElement:
        hintTarget = parentElement
        break
      default:
      // Do nothing for other types of elements
    }

    let rect = hintTarget.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const realArea = rect.width * rect.height * dpr * dpr // Calculate the real area in pixels
    const maxSizeByArea =
      (realArea / (100 * 100)) * resource.options.maxBytesPer100x100Threshold

    if (maxSizeByArea <= 0) {
      return
    }

    const maxSize = Math.min(
      maxSizeByArea,
      resource.options.maxBytesPerResourceThreshold
    )

    // TODO: strange behavior when resizing the browser window down and then up again. Maybe still flagged for a resource
    // that was loaded but not used anymore -> srcset images?
    if (resource.size > maxSize && element instanceof HTMLElement) {
      const uuid = crypto.randomUUID()
      hintTarget.classList.add('dirty')
      hintTarget.style.setProperty('--dirty-filter', `url(#${uuid})`)

      const panel = svgDataURI(
        `<rect width="50%" height="50%" x="25%" y="25%" fill='#fd0100' />`
      )

      const useSmallText = rect.height < 200 || rect.width < 200

      const content = svgDataURI(
        `
            <text x="50%" y="50%" text-anchor="middle" fill="white" font-family="sans-serif">
                <tspan x="50%" dy="-2" font-size="${useSmallText ? 12 : 20}" font-weight="bold">${formatBytes(resource.size)}</tspan>
                <tspan x="50%" dy="${useSmallText ? 14 : 20}" font-size="${useSmallText ? 12 : 14}">max ${formatBytes(maxSize)}</tspan>
            </text>
        `
      )

      hintTarget.insertAdjacentHTML(
        'beforebegin',
        `
          <svg style="display: none;">
            <defs>
              <filter id="${uuid}">
                <feImage href="${panel}" result="panel"/>
                <feImage href="${content}" result="content"/>
                <feBlend in="SourceGraphic" in2="panel" mode="overlay" result="l1"/>
                <feBlend in="l1" in2="content" mode="overlay"/>
              </filter>
            </defs>
          </svg>
      `
      )
    }
  }
}

function svgDataURI(content: string) {
  const svgMarkup = `<svg xmlns='http://www.w3.org/2000/svg' width='100%%' height='100%'>${content}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svgMarkup)}`
}
