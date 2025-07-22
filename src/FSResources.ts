import type { FSResourcesOptions, FSOptions } from './types.ts'
import FSResource from './FSResource.ts'
import { defaultOptions } from './FSOptions.ts'

const _updateIntervalBeforeInitialMs = 200
const _waitForInitialMs = 1000
const _updateIntervalAfterInitialMs = 2000

/**
 * Class to manage and track resources on the page, based on PerformanceResourceTiming.
 * It collects resource data, updates it, and provides methods to access the total size of resources.
 */
export default class FSRessources {
  /** A map of resources indexed by their URL */
  public resources: { [url: string]: FSResource } = {}
  /** Options for the Footprint Sentinel */
  public options: FSOptions
  /** The initial bytes loaded above the fold during */
  public initialBytes: number | null = null

  /**
   * Callback to get the initial footprint after the page load.
   * This is useful to track the initial footprint with matomo or Google Analytics.
   * */
  public onInitialFootprint: () => void = () => {}

  /**
   * Callback to track delta updates of the total footprint. Can be used to
   * track the footprint with matomo or Google Analytics.
   * */
  public onResourceUpdated: (resource: FSResource) => void = () => {}

  /** Timeout for the next update of the resources */
  private _updateTimeout: number | null = null
  /** Current update interval in milliseconds. Is increased to backoff */
  private _currentUpdateInterval: number = _updateIntervalBeforeInitialMs
  /** Timestamp when the document was loaded, used to calculate the initial footprint */
  private _documentLoadedTimestampMs: number | null = null

  /**
   * Factory method to create a new instance of FSRessources with default options.
   * This is useful for lazy initialization or when you want to create the instance later.
   */
  public static later(): FSRessources {
    return new FSRessources({
      options: defaultOptions,
      onResourceUpdated: () => null,
      onInitialFootprint: () => null,
    })
  }

  constructor(options: FSResourcesOptions) {
    this.options = options.options
    this.onResourceUpdated = options.onResourceUpdated
    this.onInitialFootprint = options.onInitialFootprint
  }

  /**
   * Adds an event listener for DOMContentLoaded, scroll, and resize events to update the resources.
   * This method is called to start tracking resources on the page. We use a timer with backoff strategy
   * to update the resources periodically. Some events like scroll and resize will reset the timer and
   * trigger an immediate update of the resources.
   *
   * WHY: There does not seem to be a reliable way to detect changes of the performance entries, e.g.
   * through some kind of event listener or observer. We tried a MutationObserver, but it did not work.
   */
  public watch() {
    window.addEventListener('DOMContentLoaded', () => {
      this._documentLoadedTimestampMs = Date.now()
      this.scheduleNextUpdate(true)
    })

    window.addEventListener('scroll', () => {
      this.scheduleNextUpdate(true)
    })

    window.addEventListener('resize', () => {
      this.scheduleNextUpdate(true)
    })
  }

  /**
   * Adds a new resource or updates an existing one based on the resource url. If the resource already exists,
   * it checks if the size has changed and updates it if necessary. A rerender of the resource hint is triggered
   *
   * @param resource
   * @returns The current instance of FSRessources for chaining
   */
  public addResource(resource: PerformanceResourceTiming): FSRessources {
    if (this.resources[resource.name]) {
      const updated = this.resources[resource.name].updateIfNeeded(resource)
      if (updated) {
        this.onResourceUpdated(this.resources[resource.name])
      }
    } else {
      this.resources[resource.name] = new FSResource(resource, this.options)
      this.onResourceUpdated(this.resources[resource.name])
    }
    return this
  }

  /**
   * Returns the total size of all resources in bytes. This is useful to get the total footprint of the page.
   *
   * @returns The total size of all resources in bytes
   */
  public totalBytes(): number {
    return Object.values(this.resources).reduce((total, resource) => {
      return total + resource.size
    }, 0)
  }

  /**
   * Set the initial load bytes if it is not already set and if enough time has passed
   * since the document was loaded. The initial bytes are set approximately 1 second
   * after the document is loaded.
   */
  private _tryToSetInitialLoadBytesIfNull() {
    if (this.initialBytes) return

    const nowMs = Date.now()

    if (
      this._documentLoadedTimestampMs &&
      nowMs >= this._documentLoadedTimestampMs + _waitForInitialMs
    ) {
      this.initialBytes = this.totalBytes()
      this._currentUpdateInterval = _updateIntervalAfterInitialMs
      this.onInitialFootprint()
    }
  }

  /**
   * Schedules the next update of the resources. If reset is true, it will reset the timer and
   * start a new one. If reset is false, it will continue with the current timer.
   * The initial update is done immediately after the document is loaded.
   *
   * @param reset - Whether to reset the timer or not
   */
  private scheduleNextUpdate(reset: boolean = false) {
    this._updateWithCurrentPerformanceEntries()
    this._tryToSetInitialLoadBytesIfNull()
    if (reset) {
      if (this._updateTimeout) {
        clearTimeout(this._updateTimeout)
      }
      this.scheduleNextUpdate()
    } else {
      this._updateTimeout = setTimeout(() => {
        this.scheduleNextUpdate() // Schedule the next execution
      }, this._currentUpdateInterval)
    }
  }

  /**
   * Updates the resources with the current performance entries. This is called periodically to
   * ensure that we have the latest resource data. It collects all resource entries from the
   * Performance API and adds them to the resources map if they pass the filter.
   *
   * @returns The current instance of FSRessources for chaining
   */
  private _updateWithCurrentPerformanceEntries(): FSRessources {
    const entries = [
      ...performance.getEntriesByType('resource'),
      performance.getEntriesByType('navigation')[0],
    ]
    entries.forEach(entry => {
      if (
        entry instanceof PerformanceResourceTiming &&
        // The filter can be used to filter out resources that should not be tracked
        // e.g. some backend or cms resources
        this.options.resourceFilter(entry.name)
      ) {
        this.addResource(entry)
      }
    })
    return this
  }
}
