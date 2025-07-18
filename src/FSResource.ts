import { formatBytes } from './utils'
import type { FSOptions } from './types.ts'
import FSConsts from './FSConsts.ts'

export default class FSResource {
  public url: string
  public size: number
  public options: FSOptions

  constructor(resource: PerformanceResourceTiming, options: FSOptions) {
    this.url = resource.name
    this.size = FSResource.sizeFromResource(resource)
    this.options = options
  }

  public updateIfNeeded(resource: PerformanceResourceTiming): boolean {
    const newSize = FSResource.sizeFromResource(resource)
    if (this.size !== newSize) {
      this.size = newSize
      return true
    }
    return false
  }

  public renderHint(element: Element) {
    _renderResourceHint(element, this)
  }

  static sizeFromResource(resource: PerformanceResourceTiming): number {
    return resource.encodedBodySize || 0
  }
}

function _renderResourceHint(element: Element, resource: FSResource) {
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

    if (resource.size > maxSize && element instanceof HTMLElement) {
      const uuid = crypto.randomUUID()
      hintTarget.classList.add(FSConsts.cssClass.resource)
      hintTarget.classList.add(FSConsts.cssClass.resourceDirty)
      hintTarget.style.setProperty(
        FSConsts.cssVar.resourceDirtyFilter,
        `url(#${uuid})`
      )

      const useSmallText = rect.height < 200 || rect.width < 200

      const svgPanel = svgDataURI(
        `<rect width="50%" height="50%" x="25%" y="25%" fill='#fd0100' />`
      )
      const svgPanelContent = svgDataURI(
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
                <feImage href="${svgPanel}" result="panel"/>
                <feImage href="${svgPanelContent}" result="panelContent"/>
                <feBlend in="SourceGraphic" in2="panel" mode="overlay" result="layer01"/>
                <feBlend in="layer01" in2="panelContent" mode="overlay" result="layer02"/>
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
