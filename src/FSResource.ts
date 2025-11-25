import type { FSOptions } from './types'
import { createPopperLite as createPopper, type Modifier } from '@popperjs/core'
import FSConsts from './FSConsts'
import { formatBytes } from './utils'

/**
 * Data model created from a PerformanceResourceTiming object to tract he overall size of a resource.
 * Can be updated with a new resource size. We can more easily add more functionality to this class in the future.
 */
export default class FSResource {
  /** The URL/name of the resource */
  public url: string

  /**
   * Resource size in bytes
   *
   * Calculated using FSResource.sizeFromResource() which derives the size
   * from PerformanceResourceTiming
   *
   * @see {@link FSResource.sizeFromResource}
   */
  public size: number

  /**
   * Options are passed down from the Footprint Sentinel instance, so we can use it anywhere we need it.
   * E.g. to render hints or to filter resources.
   */
  public options: FSOptions

  constructor(resource: PerformanceResourceTiming, options: FSOptions) {
    this.url = resource.name
    this.size = _sizeFromResource(resource)
    this.options = options
  }

  /**
   * The resource decides if it needs to be updated based on the new resource size.
   *
   * @param resource - The PerformanceResourceTiming object containing updated resource data
   * @returns True if the resource size was updated, false if no change was needed
   */
  public updateIfNeeded(resource: PerformanceResourceTiming): boolean {
    if (resource.name !== this.url) {
      throw `Resource URL mismatch: expected ${this.url}, got ${resource.name}`
    }
    const newSize = _sizeFromResource(resource)
    if (this.size !== newSize) {
      this.size = newSize
      return true
    }
    return false
  }

  /**
   * Render a hint for the resource if it exceeds the size threshold. We fill search the dom for
   * the url and the render the hint for each element that matches the resource URL.
   *
   * @param element - The DOM element representing the resource, e.g. an image or video element
   */
  public renderHint(element: Element) {
    // If too small we do not bother -> performance optimization
    if (this.size < this.options.ignoreResourcesBelowBytesThreshold) return

    // ######### Getting the hint target #########

    // In some cases the hint needs to be rendered on the parent element, e.g. for picture or video elements
    // if the url was found on a nested source element.
    const parentElement = element.parentElement

    if (!parentElement || !(element instanceof HTMLElement)) return

    // assume the element itself is the target for the hint
    let hintTarget: HTMLElement = element as HTMLElement

    switch (true) {
      case parentElement instanceof HTMLPictureElement:
        // WHY: the <picture> element is defines as inline on default, meaning it will have no size.
        // For the hint to correctly be aligned we need a block element with a size. The picture
        // element always needs an img child element, so we can use that as the hint target.
        hintTarget = parentElement
          .getElementsByTagName('img')
          .item(0) as HTMLElement
        break
      case parentElement instanceof HTMLVideoElement:
        // Currently no support for the video file itself, only for the poster image.
        hintTarget = parentElement
        break
      default:
      // Do nothing for other types of elements
    }

    // ######### Checking thresholds #########

    let rect = hintTarget.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const areaInPx = rect.width * rect.height * dpr * dpr

    const maxBytesAllowedForArea =
      (areaInPx / (100 * 100)) * this.options.maxBytesPer100x100Threshold

    if (maxBytesAllowedForArea <= 0) {
      return
    }

    // either the image is too big for the area it occupies or the resource is too big in general
    const maxBytesAllowed = Math.min(
      maxBytesAllowedForArea,
      this.options.maxBytesPerResourceThreshold
    )

    // ######### Rendering the hint #########

    if (
      this.size > maxBytesAllowed &&
      // IMPORTANT: We only render the hint once per element -> otherwise the browser will freeze when trying
      // to rerender the popper
      !hintTarget.hasAttribute(FSConsts.dataAttr.hasSentinelHint)
    ) {
      hintTarget.setAttribute(FSConsts.dataAttr.hasSentinelHint, 'true')
      const hint = document.createElement('div')
      hint.classList.add(FSConsts.cssClass.resourceHint)
      // we add the resource URL to the hint so we can identify it later in test cases
      hint.setAttribute(FSConsts.dataAttr.resourceUrl, this.url)

      if (rect.height < 200 || rect.width < 200) {
        hint.classList.add(FSConsts.cssClass.resourceHintSmall)
      }

      hint.innerHTML = `
          <div class="${FSConsts.cssClass.resourceHintContent}">
            <strong style="font-size: 1.2em">${formatBytes(this.size)}</strong>
            <span>max ${formatBytes(maxBytesAllowed)}</span>
          </div>
        `

      hintTarget.insertAdjacentElement('afterend', hint)

      // aligning the hint with the popper
      const samePositionAndSize: Modifier<any, any> = {
        name: 'samePositionAndSize',
        enabled: true,
        phase: 'beforeWrite',
        requires: ['computeStyles'],
        fn: ({ state }) => {
          state.styles.popper.width = `${state.rects.reference.width}px`
          state.styles.popper.height = `${state.rects.reference.height}px`

          state.styles.popper.left = `-${state.rects.reference.width}px`
          state.styles.popper.zIndex = '1'
        },
      }

      // WYH popper.js? -> We tried different approaches to position the hint.
      //  * CSS :after pseudo-element cannot be used on <img> tags,  meaning we would need to wrap the element
      //    in a div or rely on a parent element with the right size so the UI does not look broken.
      //  * Using a filter with an SVG to display the hint did not work in all browsers
      //  * Placing an element before or after and then trying to position it with CSS was not reliable enough.
      //  * Wrapping the element in a div has the chance of breaking the layout
      //  * CSS anchor properties are not widely supported yet
      createPopper(hintTarget, hint, {
        placement: 'right-start',
        modifiers: [samePositionAndSize],
      })
    }
  }
}

/**
 * Creates a data URI for an SVG image with the given content. The content is wrapped in a basic SVG structure
 * to ensure it is valid. Using a data URI seem to be the way that has the best browser support for filters. Using
 * svg directly in the filter did not work in the prototype.
 *
 * // TODO LATER: Maybe we can revisit this and use the filter again, but it is not a priority right now.
 *
 * @param content - The inner SVG content to be wrapped
 * @returns A data URI string representing the SVG image
 */
// function _svgDataURI(content: string) {
//   const svgMarkup = `<svg xmlns='http://www.w3.org/2000/svg' width='100%%' height='100%'>${content}</svg>`
//   return `data:image/svg+xml,${encodeURIComponent(svgMarkup)}`
// }

/**
 * How to get the size of a resource from a PerformanceResourceTiming object.
 * If a resource was cached, the size is not available in the resource object. We might get
 * a transferSize, if a redirect was involved but not the actual size of the resource stored in the cache.
 * There currently is no way to get the size of a cached resource from the PerformanceResourceTiming object.
 *
 * TODO LATER: Maybe it is a good idea to store the sizes of resources that were loaded in the past in
 * local storage to improve the dev experience. For now now we have to reload the page with a disabled cache
 * to get the size of a resource.
 *
 * @param resource
 * @return The size of the resource in bytes, or 0 if no size is available
 */
function _sizeFromResource(resource: PerformanceResourceTiming): number {
  // transferSize is the size of the resource that was transferred over the network with headers and body.
  // if 0 the resource was cached so we fall back to encodedBodySize which is the size of the body only.
  // TODO: it seems like encodedBodySize is always 0 for cached resources. -> investigate further. Seems
  // like the performance API does not provide a way to get the size of a cached resource.
  return resource.transferSize || resource.encodedBodySize || 0
}
