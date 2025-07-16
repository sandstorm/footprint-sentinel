import { createShortHashSync, formatBytes, updateInnerTextIfChanged } from './utils'
import type {FSentinelOptions} from "./types.ts";

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
        return false;
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
    if (resource.size < resource.options.ignoreResourcesBelowBytesThreshold) return

    const parentElement = element.parentElement

    if (parentElement) {
        let target = element
        switch (true) {
            case parentElement instanceof HTMLPictureElement:
            case parentElement instanceof HTMLVideoElement:
                target = parentElement
                break
            default:
            // Do nothing for other types of elements
        }

        if (target instanceof HTMLImageElement) {
            target = parentElement
        }

        const computedStyle = window.getComputedStyle(target)
        const position = computedStyle.position

        if (position === 'static') {
            target.classList.add('footprint-guard-resource--force-relative')
        }

        let rect = target.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        const realArea = rect.width * rect.height * dpr * dpr // Calculate the real area in pixels
        const maxSizeByArea = (realArea / (100 * 100)) * resource.options.maxBytesPer100x100Threshold

        if (maxSizeByArea <= 0) {
            return
        }

        const maxSize = Math.min(maxSizeByArea, resource.options.maxBytesPerResourceThreshold)

        // TODO: strange behavior when resizing the browser window down and then up again. Maybe still flagged for a resource
        // that was loaded but not used anymore -> srcset images?
        if (resource.size > maxSize) {
            let resourceWarning = target.getElementsByClassName('footprint-guard-resource').item(0)
            if (!resourceWarning) {
                resourceWarning = document.createElement('div')
                resourceWarning.className = `footprint-guard-resource footprint-guard-resource--dirty ${resource.getHash()}`
                resourceWarning.innerHTML = `
                <div class="footprint-guard-resource__content">
                    <div class="footprint-guard-resource__bytes"></div>
                    <div class="footprint-guard-resource__max"></div>
                </div>
            `
                target.appendChild(resourceWarning)
            }

            updateInnerTextIfChanged(formatBytes(resource.size), resourceWarning.getElementsByClassName('footprint-guard-resource__bytes').item(0))
            updateInnerTextIfChanged(`Max: ${formatBytes(maxSize)} allowed`, resourceWarning.getElementsByClassName('footprint-guard-resource__max').item(0))
        } else {
            target.getElementsByClassName('footprint-guard-resource').item(0)?.remove()
        }
    }

}
