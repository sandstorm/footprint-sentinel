import type { FSOptions, FSResult } from './types.ts'
import { createPopperLite as createPopper } from '@popperjs/core'
import { findElementsWithUrl, formatBytes, shortenUrl } from './utils'
import styles from './styles'
import { defaultOptions } from './FSOptions'
import type FSResource from './FSResource'
import FSResources from './FSResources'
import { getColorForRating, getRatingForBytes } from './FSRating'
import FSConsts from './FSConsts'
import { samePositionAndSizeModifier } from './FSPopperModifiers'

export default class FootprintSentinel extends EventTarget {
  private static instance: FootprintSentinel
  private readonly footprintElement: HTMLButtonElement | null = null
  private readonly options: FSOptions = defaultOptions
  private readonly resources: FSResources = FSResources.later()
  private lastTotalBytes = 0
  private lastTotalBytesDebounceTimeout: number | null = null
  private modalElement: HTMLDivElement | null = null
  private isModalOpen = false

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
        this.modalElement = this.addModalElement()
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
   * Updates the footprint sentinel button in the bottom right corner: the dot color reflects
   * the current rating, and a badge shows the number of oversized resources found so far.
   * Also refreshes the modal content if it is currently open.
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
    const rating = getRatingForBytes(totalBytes)
    const color = getColorForRating(rating)

    const numberOfResourceHintsHtml =
      numberOfResourceHints > 0
        ? `<span class="${FSConsts.cssClass.sentinelNumberOfResourceHints}">${numberOfResourceHints}</span>`
        : ''

    this.footprintElement.innerHTML = `
        <span class="${FSConsts.cssClass.sentinelButtonDot}" style="${FSConsts.cssVar.ratingColor}: ${color};"></span>
        <span class="${FSConsts.cssClass.sentinelButtonLabel}">Show page load</span>
        ${numberOfResourceHintsHtml}
    `

    if (this.isModalOpen) {
      this._renderModalContent()
    }
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
    if (document.querySelector(`.${FSConsts.cssClass.sentinel}`)) {
      console.warn(
        'FootprintGuard element already exists, skipping initialization.'
      )
      return null
    }

    const button = document.createElement('button')
    button.type = 'button'
    button.className = FSConsts.cssClass.sentinel
    button.style.zIndex = this.options.sentinelZIndex.toString()
    button.setAttribute('aria-haspopup', 'dialog')
    button.setAttribute('aria-expanded', 'false')
    button.setAttribute('aria-controls', 'footprint-sentinel-modal')
    button.addEventListener('click', () => this._toggleModal())
    document.body.appendChild(button)

    return button
  }

  /**
   * Creates the (initially hidden) modal showing the page load overview. It is built once
   * and its content is (re-)rendered whenever it is opened or the footprint changes while open.
   */
  private addModalElement() {
    const overlay = document.createElement('div')
    overlay.className = FSConsts.cssClass.modalOverlay
    overlay.id = 'footprint-sentinel-modal'
    overlay.innerHTML = `
        <div class="${FSConsts.cssClass.modal}" role="dialog" aria-modal="true" aria-label="Page load overview">
            <button type="button" class="${FSConsts.cssClass.modalClose}" aria-label="Close">&times;</button>
            <div class="${FSConsts.cssClass.modalBody}"></div>
        </div>
    `

    overlay.addEventListener('click', e => {
      if (e.target === overlay) this._closeModal()
    })
    overlay
      .querySelector(`.${FSConsts.cssClass.modalClose}`)!
      .addEventListener('click', () => this._closeModal())
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isModalOpen) this._closeModal()
    })

    document.body.appendChild(overlay)

    return overlay
  }

  private _toggleModal() {
    if (this.isModalOpen) {
      this._closeModal()
    } else {
      this._openModal()
    }
  }

  private _openModal() {
    if (!this.modalElement) return
    this._renderModalContent()
    this.modalElement.style.display = 'flex'
    this.isModalOpen = true
    this.footprintElement?.setAttribute('aria-expanded', 'true')
  }

  private _closeModal() {
    if (!this.modalElement) return
    this.modalElement.style.display = 'none'
    this.isModalOpen = false
    this.footprintElement?.setAttribute('aria-expanded', 'false')
  }

  /**
   * Renders the modal body: a summary table (total/initial bytes, page load time) and a
   * table of oversized resources, sourced from the resource hints already rendered on the page.
   */
  private _renderModalContent() {
    if (!this.modalElement) return
    const body = this.modalElement.querySelector(
      `.${FSConsts.cssClass.modalBody}`
    )
    if (!body) return

    const totalBytes = this.resources.totalBytes()
    const initialBytes = this.resources.initialBytes || 0
    const totalRating = getRatingForBytes(totalBytes)
    const initialRating = getRatingForBytes(initialBytes)
    const pageLoadMs = this._getPageLoadTimeMs()
    const oversizedResources = this._getOversizedResources()

    body.innerHTML = `
        <h2 class="${FSConsts.cssClass.modalTitle}">Page load overview</h2>
        <table class="${FSConsts.cssClass.modalSummary}">
            <tbody>
                <tr>
                    <th>Total transferred</th>
                    <td>
                        <span class="${FSConsts.cssClass.modalRatingBadge}" style="${FSConsts.cssVar.ratingColor}: ${getColorForRating(totalRating)};">${totalRating}</span>
                        ${formatBytes(totalBytes)}
                    </td>
                </tr>
                <tr>
                    <th>Initial (above the fold)</th>
                    <td>
                        ${
                          initialBytes
                            ? `<span class="${FSConsts.cssClass.modalRatingBadge}" style="${FSConsts.cssVar.ratingColor}: ${getColorForRating(initialRating)};">${initialRating}</span> ${formatBytes(initialBytes)}`
                            : '–'
                        }
                    </td>
                </tr>
                <tr>
                    <th>Page load time</th>
                    <td>${pageLoadMs !== null ? `${(pageLoadMs / 1000).toFixed(2)}s` : 'measuring…'}</td>
                </tr>
            </tbody>
        </table>

        <h3 class="${FSConsts.cssClass.modalSubtitle}">Oversized images (${oversizedResources.length})</h3>
        ${
          oversizedResources.length === 0
            ? `<p class="${FSConsts.cssClass.modalEmpty}">No oversized resources detected.</p>`
            : `<table class="${FSConsts.cssClass.modalTable}">
                    <thead>
                        <tr>
                            <th>Resource</th>
                            <th>Size</th>
                            <th>Max allowed</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${oversizedResources
                          .map(
                            (resource, index) => `
                            <tr
                                class="${resource.element ? FSConsts.cssClass.modalTableRowClickable : ''}"
                                data-index="${index}"
                                title="${resource.url}"
                            >
                                <td>${shortenUrl(resource.url)}</td>
                                <td>${formatBytes(resource.size)}</td>
                                <td>${formatBytes(resource.maxBytesAllowed)}</td>
                            </tr>
                        `
                          )
                          .join('')}
                    </tbody>
                </table>`
        }
    `

    body
      .querySelectorAll<HTMLTableRowElement>(
        `.${FSConsts.cssClass.modalTableRowClickable}`
      )
      .forEach(row => {
        const index = Number(row.dataset.index)
        const element = oversizedResources[index]?.element
        if (!element) return
        row.addEventListener('click', () => this._scrollToElement(element))
      })
  }

  /**
   * Closes the modal and scrolls the given element into view, briefly highlighting it
   * so it is easy to spot which image was flagged.
   */
  private _scrollToElement(element: HTMLElement) {
    this._closeModal()
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    this._flashHighlightOverlay(element)
  }

  /**
   * Overlays a translucent red div exactly on top of the given element and fades it out.
   * WHY not a CSS class/filter directly on the element? A class on an <img> can't paint a
   * color over its pixels (box-shadow is not drawn on top of replaced element content, and a
   * filter recolors the image itself instead of overlaying it) — so, same as the resource
   * hints, we position a real overlay element with popper.js.
   */
  private _flashHighlightOverlay(element: HTMLElement) {
    const overlay = document.createElement('div')
    overlay.className = FSConsts.cssClass.highlight
    element.insertAdjacentElement('afterend', overlay)

    const popperInstance = createPopper(element, overlay, {
      placement: 'right-start',
      modifiers: [samePositionAndSizeModifier],
    })

    overlay.addEventListener('animationend', () => {
      popperInstance.destroy()
      overlay.remove()
    })
  }

  /**
   * Time (in ms) until the page's load event finished, based on the Navigation Timing entry.
   * Returns null while the page is still loading.
   */
  private _getPageLoadTimeMs(): number | null {
    const navigationEntry = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming | undefined
    if (!navigationEntry || !navigationEntry.loadEventEnd) return null
    return navigationEntry.loadEventEnd
  }

  /**
   * Reads the oversized resources already flagged via resource hints (see FSResource.renderHint),
   * so the modal table reuses the exact same area-based threshold evaluation instead of duplicating it.
   * Also resolves the flagged DOM element itself (the hint is always inserted right after it),
   * so the modal can scroll to it when its row is clicked.
   */
  private _getOversizedResources(): {
    url: string
    size: number
    maxBytesAllowed: number
    element: HTMLElement | null
  }[] {
    const hints = document.querySelectorAll(
      `.${FSConsts.cssClass.resourceHint}`
    )
    const result: {
      url: string
      size: number
      maxBytesAllowed: number
      element: HTMLElement | null
    }[] = []

    hints.forEach(hint => {
      const url = hint.getAttribute(FSConsts.dataAttr.resourceUrl)
      if (!url) return
      result.push({
        url,
        size: Number(hint.getAttribute(FSConsts.dataAttr.sizeBytes)),
        maxBytesAllowed: Number(
          hint.getAttribute(FSConsts.dataAttr.maxBytesAllowed)
        ),
        element:
          hint.previousElementSibling instanceof HTMLElement
            ? hint.previousElementSibling
            : null,
      })
    })

    return result.sort((a, b) => b.size - a.size)
  }

  public static getInstance(options?: Partial<FSOptions>): FootprintSentinel {
    if (!FootprintSentinel.instance) {
      FootprintSentinel.instance = new FootprintSentinel(options)
    }
    return FootprintSentinel.instance
  }
}
