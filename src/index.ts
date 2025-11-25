import type { FSOptions, FSResult } from './types.ts'
import {
  findElementsWithUrl,
  formatBytes,
  getSizeFactorForBytes,
} from './utils'
import styles from './styles'
import { defaultOptions } from './FSOptions'
import type FSResource from './FSResource'
import FSResources from './FSResources'
import { getColorForRating, getRatingForBytes } from './FSRating'
import FSConsts from './FSConsts'

export default class FootprintSentinel extends EventTarget {
  private static instance: FootprintSentinel
  private readonly footprintElement: HTMLDivElement | null = null
  private readonly options: FSOptions = defaultOptions
  private readonly resources: FSResources = FSResources.later()
  private lastTotalBytes = 0
  private lastTotalBytesDebounceTimeout: number | null = null

  constructor(options?: Partial<FSOptions>) {
    super()
    if (FootprintSentinel.instance) {
      // ensure singleton instance
      return
    }
    this.options = {
      ...defaultOptions,
      ...options,
    }

    if (this.options.isActivated) {
      this.resources = new FSResources({
        options: this.options,
        onResourceUpdated: this.handleResourceUpdated.bind(this),
        onInitialFootprint: this._handleInitialFootprint.bind(this),
      })

      if (this.options.showSentinel) {
        this.footprintElement = this.addSentinelElement()
      }

      if (this.options.showSentinel || this.options.showResourceHints) {
        document.body.insertAdjacentHTML('beforeend', styles)
      }

      this.resources.watch()
    }

    // ensure singleton instance
    FootprintSentinel.instance = this
  }

  /**
   * Returns the current footprint. E.g. can be used to get the total footprint
   * before the page is unloaded to report it to an analytics service.
   */
  public get footprint(): FSResult {
    const totalBytes = this.resources.totalBytes()
    const deltaBytes = totalBytes - this.lastTotalBytes
    const rating = getRatingForBytes(totalBytes)
    const color = getColorForRating(rating)
    return {
      total: {
        bytes: totalBytes,
        bytesFormatted: formatBytes(totalBytes),
        rating: rating,
        color: color,
      },
      lastDelta: { bytes: deltaBytes, bytesFormatted: formatBytes(deltaBytes) },
    }
  }

  /**
   * Updates the sentinel with the latest resource data and renders a possible resource hint
   * if the resource exceeds the defined thresholds.
   *
   * Also calls the onFootprintChange callback if defined in options. It debounces the calls.
   * The callback can be used to report the footprint to an analytics service or to create a custom UI
   * showing the footprint. e.g. in the footer of the page.
   */
  private handleResourceUpdated(resource: FSResource) {
    if (this.lastTotalBytesDebounceTimeout) {
      clearTimeout(this.lastTotalBytesDebounceTimeout)
    }

    // making ts happy
    const onFootprintChange = this.options.onFootprintChange

    if (onFootprintChange) {
      this.lastTotalBytesDebounceTimeout = window.setTimeout(() => {
        const newTotalBytes = this.resources.totalBytes()
        if (newTotalBytes > this.lastTotalBytes + 100 * 1024) {
          const deltaBytes = newTotalBytes - this.lastTotalBytes
          const rating = getRatingForBytes(newTotalBytes)
          onFootprintChange({
            total: {
              bytes: newTotalBytes,
              bytesFormatted: formatBytes(newTotalBytes),
              rating: rating,
              color: getColorForRating(rating),
            },
            lastDelta: {
              bytes: deltaBytes,
              bytesFormatted: formatBytes(deltaBytes),
            },
          })
          this.lastTotalBytes = newTotalBytes
        }
        // WHY debounce? The callback is usually used to report the delta to an analytics service.
        // we do not want to report every single resource update, but rather a summary. 500ms seems
        // to be a good compromise between responsiveness and reducing the number of calls.
      }, 500)
    }

    this._updateResourceHint(resource)
    this._updateFootprint()
  }

  /**
   * Calls onInitialFootprint if present in options and initial footprint is set.
   */
  private _handleInitialFootprint() {
    if (this.options.onInitialFootprint) {
      this.options.onInitialFootprint(this.footprint)
    }
  }

  /**
   * Updates the footprint sentinel element in the bottom right corner.
   * This is called whenever a resource is updated.
   */
  private _updateFootprint() {
    if (!this.options?.showSentinel || !this.footprintElement) return

    const numberOfResourceHints: number = this.options.showResourceHints
      ? document.querySelectorAll(
          `[${FSConsts.dataAttr.hasSentinelHint}="true"]`
        ).length
      : 0

    const totalBytes = this.resources.totalBytes()
    const initialBytes = this.resources.initialBytes || 0

    const showInitialLoad = initialBytes && initialBytes !== totalBytes

    const totalBytesFormatted = formatBytes(totalBytes)
    const totalBytesFactor = getSizeFactorForBytes(totalBytes)
    const totalBytesRating = getRatingForBytes(totalBytes)
    const totalBytesStyle = `z-index: 1; width: ${100 + 40 * totalBytesFactor}px; font-size: ${0.95 + 0.05 * totalBytesFactor}em; ${FSConsts.cssVar.ratingColor}: ${getColorForRating(totalBytesRating)};)`
    const totalBytesLabel = 'Total'

    const initialBytesFormatted = formatBytes(initialBytes)
    const initialFactor = getSizeFactorForBytes(initialBytes)
    const initialRating = getRatingForBytes(initialBytes)
    const initialStyle = `width: ${100 + 40 * initialFactor}px; font-size: ${0.85 + 0.05 * initialFactor}em; ${FSConsts.cssVar.ratingColor}: ${getColorForRating(initialRating)};`
    const initialLabel = 'Initial'

    const numberOfResourceHintsHtml =
      numberOfResourceHints > 0
        ? `
      <div class="${FSConsts.cssClass.sentinelNumberOfResourceHints}">${numberOfResourceHints}</div>
    `
        : ''

    this.footprintElement.innerHTML = `
        ${numberOfResourceHintsHtml}
        <div class="${FSConsts.cssClass.sentinelStats}" data-rating="${totalBytesRating}" style="${totalBytesStyle}">
            <div class="${FSConsts.cssClass.sentinelRow}">
                <span class="${FSConsts.cssClass.sentinelRating}">${totalBytesRating}</span>
                <span style="width: 10px;"></span>
                <span class="${FSConsts.cssClass.sentinelSize}"><strong>${totalBytesFormatted}</strong></span>
            </div>
            <div class="${FSConsts.cssClass.sentinelLabel}">
                ${!showInitialLoad ? initialLabel : totalBytesLabel}
            </div>
        </div>

        <div class="${FSConsts.cssClass.sentinelStats} ${!showInitialLoad ? FSConsts.cssClass.sentinelStatsHide : ''}" data-rating="${initialRating}" style="${initialStyle}">
            <div class="${FSConsts.cssClass.sentinelRow}">
                <span class="${FSConsts.cssClass.sentinelRating}">${initialRating}</span>
                <span style="width: 10px;"></span>
                <span class="${FSConsts.cssClass.sentinelSize}">${initialBytesFormatted}</span>
            </div>
            <div class="${FSConsts.cssClass.sentinelLabel}">
                ${initialLabel}
            </div>
        </div>
    `
  }

  private _updateResourceHint(resource: FSResource) {
    if (!this.options?.showResourceHints) return

    if (resource.size < this.options.ignoreResourcesBelowBytesThreshold) {
      return
    }

    findElementsWithUrl(new URL(resource.url)).forEach((element: Element) => {
      resource.renderHint(element)
    })
  }

  private addSentinelElement() {
    if (document.querySelector(FSConsts.cssClass.sentinel)) {
      console.warn(
        'FootprintGuard element already exists, skipping initialization.'
      )
      return null
    }

    const element = document.createElement('div')
    element.className = FSConsts.cssClass.sentinel
    element.style.zIndex = this.options.sentinelZIndex.toString()
    document.body.appendChild(element)

    return element
  }

  public static getInstance(options?: Partial<FSOptions>): FootprintSentinel {
    if (!FootprintSentinel.instance) {
      FootprintSentinel.instance = new FootprintSentinel(options)
    }
    return FootprintSentinel.instance
  }
}
