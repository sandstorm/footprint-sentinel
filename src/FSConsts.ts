import type { FSRating } from './types'

/**
 * Constants values for Footprint Sentinel
 */
export default class FSConsts {
  static readonly cssClass = {
    resourceHint: 'footprint-sentinel-hint',
    resourceHintSmall: 'footprint-sentinel-hint--small',
    resourceHintContent: 'footprint-sentinel-hint__content',
    resourceHintText: 'footprint-sentinel-hint__text',
    resourceHintTextBig: 'footprint-sentinel-hint__text--big',
    sentinel: 'footprint-sentinel',
    sentinelStats: 'footprint-sentinel__stats',
    sentinelStatsHide: 'footprint-sentinel__stats--hide',
    sentinelRow: 'footprint-sentinel__row',
    sentinelRating: 'footprint-sentinel__rating',
    sentinelSize: 'footprint-sentinel__size',
    sentinelLabel: 'footprint-sentinel__label',
  }

  static readonly ratingColors: Record<FSRating, string> = {
    'A+': '#00febc',
    A: '#1aff93',
    B: '#49ff42',
    C: '#70ff01',
    D: '#f9ff00',
    E: '#fea900',
    F: '#fd0100',
  }

  static readonly cssVar = {
    ratingColor: '--footprint-sentinel-rating-color',
  }

  static readonly dataAttr = {
    resourceUrl: 'data-resource-url',
    hasSentinelHint: 'data-has-sentinel-hint',
  }
}
