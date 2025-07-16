import FSentinelResource from './FSentinelResource.ts'
import { defaultOptions } from './FSentinelOptions.ts'
import type { FSentinelResourcesOptions, FSentinelOptions } from './types.ts'

const UPDATE_INTERVAL_BEFORE_INITIAL_MS = 200
const UPDATE_INTERVAL_AFTER_INITIAL_MS = 2000

export default class FSentinelRessources {
  public resources: { [url: string]: FSentinelResource } = {}
  public fqOptions: FSentinelOptions
  public initialBytes: number | null = null

  public onResourceUpdated: (resource: FSentinelResource) => void = () => {}
  public onInitialFootprint: () => void = () => {}

  private updateTimeout: number | null = null
  private currentUpdateInterval: number = UPDATE_INTERVAL_BEFORE_INITIAL_MS
  private documentLoadedTimestampMs: number | null = null

  public static later(): FSentinelRessources {
    return new FSentinelRessources({
      fgOptions: defaultOptions,
      onResourceUpdated: () => null,
      onInitialFootprint: () => null,
    })
  }

  constructor(options: FSentinelResourcesOptions) {
    this.fqOptions = options.fgOptions
    this.onResourceUpdated = options.onResourceUpdated
    this.onInitialFootprint = options.onInitialFootprint
  }

  public watch() {
    window.addEventListener('DOMContentLoaded', () => {
      this.documentLoadedTimestampMs = Date.now()
      this.sheduleNextUpdate(true)
    })

    // on scroll
    window.addEventListener('scroll', () => {
      this.sheduleNextUpdate(true)
    })

    window.addEventListener('resize', () => {
      this.sheduleNextUpdate(true)
    })
  }

  public addResource(resource: PerformanceResourceTiming): FSentinelRessources {
    if (this.resources[resource.name]) {
      const updated = this.resources[resource.name].updateIfNeeded(resource)
      if (updated) {
        this.onResourceUpdated(this.resources[resource.name])
      }
    } else {
      this.resources[resource.name] = new FSentinelResource(
        resource,
        this.fqOptions
      )
      this.onResourceUpdated(this.resources[resource.name])
    }
    return this
  }

  public totalBytes(): number {
    return Object.values(this.resources).reduce((total, resource) => {
      return total + resource.size
    }, 0)
  }

  public forEach(callback: (resource: FSentinelResource) => void): void {
    Object.values(this.resources).forEach(callback)
  }

  private tryToSetInitialLoadBytesIfNull() {
    if (this.initialBytes) return

    const nowMs = Date.now()

    if (
      this.documentLoadedTimestampMs &&
      nowMs >= this.documentLoadedTimestampMs + 1000
    ) {
      this.initialBytes = this.totalBytes()
      this.currentUpdateInterval = UPDATE_INTERVAL_AFTER_INITIAL_MS
      this.onInitialFootprint()
    }
  }

  private sheduleNextUpdate(reset: boolean = false) {
    this.updateWithCurrentPerformanceEntries()
    this.tryToSetInitialLoadBytesIfNull()
    if (reset) {
      if (this.updateTimeout) {
        clearTimeout(this.updateTimeout)
      }
      this.sheduleNextUpdate()
    } else {
      this.updateTimeout = setTimeout(() => {
        this.sheduleNextUpdate() // Schedule the next execution
      }, this.currentUpdateInterval)
    }
  }

  private updateWithCurrentPerformanceEntries(): FSentinelRessources {
    const entries = [
      ...performance.getEntriesByType('resource'),
      performance.getEntriesByType('navigation')[0],
    ]
    entries.forEach(entry => {
      if (
        entry instanceof PerformanceResourceTiming &&
        this.fqOptions.resourceFilter(entry.name)
      ) {
        this.addResource(entry)
      }
    })
    return this
  }
}
