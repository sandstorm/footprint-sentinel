import { beforeEach, describe, expect, test, vi } from 'vitest'
import { defaultOptions } from '../src/FSOptions'
import FSResource from '../src/FSResource'
import { findElementsWithUrl } from '../src/utils'
import FSConsts from '../src/FSConsts'

describe('updating resource with new size', () => {
  test('create and update resource ', () => {
    const performanceResourceTiming = {
      name: 'https://someurl.de/assets/img.jpg',
      transferSize: 1050 * 1024,
      encodedBodySize: 1000 * 1024,
    } as PerformanceResourceTiming

    const resource = new FSResource(performanceResourceTiming, defaultOptions)

    expect(resource.url).toBe('https://someurl.de/assets/img.jpg')
    // encodedBodySize is used as size if not 0
    expect(resource.size).toBe(1050 * 1024)
    expect(resource.options).toBe(defaultOptions)
    expect(resource.updateIfNeeded(performanceResourceTiming)).toBe(false)
    // size changed, so updateIfNeeded should return true
    expect(
      resource.updateIfNeeded({
        ...performanceResourceTiming,
        transferSize: 2000 * 1024,
      })
    ).toBe(true)

    // TODO LATER: expect().toThrow() is not working as expected here, so we use a workaround
    let errorMessaage = ''
    try {
      resource.updateIfNeeded({
        ...performanceResourceTiming,
        name: 'https://totallydifferenturl.de/assets/img.jpg',
      })
    } catch (e) {
      errorMessaage = `${e}`
    }
    expect(errorMessaage).toBe(
      'Resource URL mismatch: expected https://someurl.de/assets/img.jpg, got https://totallydifferenturl.de/assets/img.jpg'
    )
  })

  test('create resource with zero transferSize', () => {
    const performanceResourceTiming = {
      name: 'https://someurl.de/assets/img.jpg',
      transferSize: 0,
      encodedBodySize: 1000 * 1024,
    } as PerformanceResourceTiming

    const resource = new FSResource(performanceResourceTiming, defaultOptions)
    expect(resource.size).toBe(1000 * 1024)
  })
})

describe('hints render correctly', () => {
  beforeEach(() => {
    // Clear the document before each test
    document.body.innerHTML = ''
    document.head.innerHTML = ''
    // Mock getBoundingClientRect for all elements. We use 100x100px as a default size
    // which matches the 100x100px max threshold for the resource hint.
    // @ts-ignore
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 100,
      height: 100,
    }))
  })

  test('render hint', () => {
    type _TestResource = {
      url: string
      size: number
      innerHTML: (url: string) => string
      hintCount: number
      resourceElementCount: number
    }

    const options: FSOptions = defaultOptions

    let testResources: _TestResource[] = [
      {
        url: 'https://foo.bar/no-hints-0B-single.jpg',
        size: 0,
        innerHTML: url => `<img src="${url}"/>`,
        resourceElementCount: 1,
        hintCount: 0,
      },
      {
        url: 'https://foo.bar/no-hints-treshholdB-single.jpg',
        size: options.ignoreResourcesBelowBytesThreshold - 1,
        innerHTML: url => `<img src="${url}"/>`,
        resourceElementCount: 1,
        hintCount: 0,
      },
      {
        url: 'https://foo.bar/hints-1KB-single.jpg',
        size: 1000 * 1024,
        innerHTML: url => `<img src="${url}"/>`,
        resourceElementCount: 1,
        hintCount: 1,
      },
      {
        url: 'https://foo.bar/hints-1KB-multi.jpg',
        size: 1000 * 1024,
        innerHTML: url =>
          `<img src="${url}"/><video poster="${url}"></video><div style="background: url(${url})"></div>`,
        resourceElementCount: 3,
        hintCount: 3,
      },
    ]

    document.body.innerHTML = testResources.reduce(
      (acc, current) => acc + current.innerHTML(current.url),
      ''
    )

    for (let testResource of testResources) {
      const performanceResourceTiming = {
        name: testResource.url,
        transferSize: testResource.size,
        encodedBodySize: testResource.size,
      } as PerformanceResourceTiming

      const resource = new FSResource(performanceResourceTiming, options)
      const resourceElements = findElementsWithUrl(new URL(resource.url))

      for (let element of resourceElements) {
        resource.renderHint(element)
      }

      const resourceHintElements = document.querySelectorAll(
        `[${FSConsts.dataAttr.resourceUrl}="${resource.url}"]`
      )

      expect(resourceElements.length).toBe(testResource.resourceElementCount)
      expect(resourceHintElements.length).toBe(testResource.hintCount)
    }

    const totalHintCount = testResources.reduce(
      (acc, current) => acc + current.hintCount,
      0
    )

    expect(
      document.querySelectorAll(`.${FSConsts.cssClass.resourceHint}`).length
    ).toBe(totalHintCount)
  })
})
