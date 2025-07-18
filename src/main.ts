import type { FSentinelOptions, FootprintGuardResult } from './types.ts'
import { defaultOptions } from './FSentinelOptions.ts'
import FSentinelRessources from './FSentinelResources.ts'
import {
  findElementsWithUrl,
  formatBytes,
  getSizeFactorForBytes,
} from './utils.ts'
import { getRatingForBytes } from './FSentinelRating.ts'
import FSentinelResource from './FSentinelResource.ts'
import styles from './styles.ts'

const FOOTPRINT_ELEMENT_CLASS_NAME = 'footprint-guard'

export default class FootprintSentinel extends EventTarget {
  private static instance: FootprintSentinel
  private footprintElement: HTMLDivElement | null = null
  private fgOptions: FSentinelOptions = defaultOptions
  private fgResources: FSentinelRessources = FSentinelRessources.later()
  private lastTotalBytes = 0
  private lastTotalBytesDebounceTimeout: number | null = null

  constructor(options: Partial<FSentinelOptions>) {
    super()
    if (FootprintSentinel.instance) {
      // ensure singleton instance
      return FootprintSentinel.instance
    }
    this.fgOptions = {
      ...defaultOptions,
      ...options,
    }

    if (this.fgOptions.isActivated) {
      this.fgResources = new FSentinelRessources({
        fgOptions: this.fgOptions,
        onResourceUpdated: this.handleResourceUpdated.bind(this),
        onInitialFootprint: this.handleInitialFootprint.bind(this),
      })

      if (this.fgOptions.showFootprint) {
        this.footprintElement = this.addFootprintElement()
      }

      this.fgResources.watch()
    }

    // ensure singleton instance
    FootprintSentinel.instance = this
  }

  public get footprint(): FootprintGuardResult {
    const totalBytes = this.fgResources.totalBytes()
    const deltaBytes = totalBytes - this.lastTotalBytes
    return {
      total: {
        bytes: totalBytes,
        bytesFormatted: formatBytes(totalBytes),
        rating: getRatingForBytes(totalBytes),
      },
      lastDelta: { bytes: deltaBytes, bytesFormatted: formatBytes(deltaBytes) },
    }
  }

  private handleResourceUpdated(resource: FSentinelResource) {
    if (this.lastTotalBytesDebounceTimeout) {
      clearTimeout(this.lastTotalBytesDebounceTimeout)
    }

    this.lastTotalBytesDebounceTimeout = window.setTimeout(() => {
      const newTotalBytes = this.fgResources.totalBytes()
      if (newTotalBytes > this.lastTotalBytes + 100 * 1024) {
        if (this.fgOptions.onFootprintChange) {
          const deltaBytes = newTotalBytes - this.lastTotalBytes
          this.fgOptions.onFootprintChange({
            total: {
              bytes: newTotalBytes,
              bytesFormatted: formatBytes(newTotalBytes),
              rating: getRatingForBytes(newTotalBytes),
            },
            lastDelta: {
              bytes: deltaBytes,
              bytesFormatted: formatBytes(deltaBytes),
            },
          })
        }
        this.lastTotalBytes = newTotalBytes
      }
    }, 500)

    this.updateFootprint()
    this.updateResourceHint(resource)
  }

  private handleInitialFootprint() {
    if (this.fgOptions.onInitialFootprint) {
      this.fgOptions.onInitialFootprint(this.footprint)
    }
  }

  private updateFootprint() {
    if (!this.fgOptions?.showFootprint || !this.footprintElement) return

    const totalBytes = this.fgResources.totalBytes()
    const initialBytes = this.fgResources.initialBytes || 0

    const showInitialLoad = initialBytes && initialBytes !== totalBytes

    const totalBytesFormatted = formatBytes(totalBytes)
    const totalBytesFactor = getSizeFactorForBytes(totalBytes)
    const totalBytesRating = getRatingForBytes(totalBytes)
    const totalBytesStyle = `z-index: 1; width: ${100 + 40 * totalBytesFactor}px; font-size: ${0.95 + 0.05 * totalBytesFactor}em;`
    const totalBytesLabel = 'Total'

    const initialBytesFormatted = formatBytes(initialBytes)
    const initialFactor = getSizeFactorForBytes(initialBytes)
    const initialRating = getRatingForBytes(initialBytes)
    const initialStyle = `width: ${100 + 40 * initialFactor}px; font-size: ${0.85 + 0.05 * initialFactor}em;`
    const initialLabel = 'Initial'

    this.footprintElement.innerHTML = `

        <div class="footprint-guard__stats" data-rating="${totalBytesRating}" style="${totalBytesStyle}">
            <div class="footprint-guard__row">
                <span class="footprint-guard__rating">${totalBytesRating}</span>
                <span style="width: 10px;"></span>
                <span class="footprint-guard__size"><strong>${totalBytesFormatted}</strong></span>
            </div>
            <div class="footprint-guard__label">
                ${!showInitialLoad ? initialLabel : totalBytesLabel}
            </div>
        </div>

        <div class="footprint-guard__stats ${!showInitialLoad ? 'footprint-guard__stats--hide' : ''}" data-rating="${initialRating}" style="${initialStyle}">
            <div class="footprint-guard__row">
                <span class="footprint-guard__rating">${initialRating}</span>
                <span style="width: 10px;"></span>
                <span class="footprint-guard__size">${initialBytesFormatted}</span>
            </div>
            <div class="footprint-guard__label">
                ${initialLabel}
            </div>
        </div>
    `
  }

  private updateResourceHint(resource: FSentinelResource) {
    if (!this.fgOptions?.showResourceHints) return

    if (resource.size < this.fgOptions.ignoreResourcesBelowBytesThreshold) {
      return
    }

    findElementsWithUrl(new URL(resource.url)).forEach((element: Element) => {
      resource.renderHint(element)
    })
  }

  private addFootprintElement() {
    if (document.querySelector(FOOTPRINT_ELEMENT_CLASS_NAME)) {
      console.warn(
        'FootprintGuard element already exists, skipping initialization.'
      )
      return null
    }

    document.body.insertAdjacentHTML('beforeend', styles)
    const element = document.createElement('div')
    element.className = FOOTPRINT_ELEMENT_CLASS_NAME
    element.style.zIndex = this.fgOptions.guardZIndex.toString()
    document.body.appendChild(element)

    return element
  }
}
