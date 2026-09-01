import type { FSRating } from './types'

/**
 * Constants values for Footprint Sentinel
 */
export default class FSConsts {
  static readonly cssClass = {
    resourceHint: 'footprint-sentinel-hint',
    resourceHintOpen: 'footprint-sentinel-hint--open',
    resourceHintIcon: 'footprint-sentinel-hint__icon',
    resourceHintIconMark: 'footprint-sentinel-hint__icon-mark',
    resourceHintContent: 'footprint-sentinel-hint__content',
    sentinel: 'footprint-sentinel',
    sentinelButtonDot: 'footprint-sentinel__button-dot',
    sentinelButtonLabel: 'footprint-sentinel__button-label',
    sentinelNumberOfResourceHints:
      'footprint-sentinel__number-of-resource-hints',
    modalOverlay: 'footprint-sentinel__modal-overlay',
    modal: 'footprint-sentinel__modal',
    modalClose: 'footprint-sentinel__modal-close',
    modalBody: 'footprint-sentinel__modal-body',
    modalTitle: 'footprint-sentinel__modal-title',
    modalSubtitle: 'footprint-sentinel__modal-subtitle',
    modalSummary: 'footprint-sentinel__modal-summary',
    modalRatingBadge: 'footprint-sentinel__modal-rating-badge',
    modalTable: 'footprint-sentinel__modal-table',
    modalTableRowClickable: 'footprint-sentinel__modal-table-row--clickable',
    modalEmpty: 'footprint-sentinel__modal-empty',
    highlight: 'footprint-sentinel__highlight',
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
    sizeBytes: 'data-size-bytes',
    maxBytesAllowed: 'data-max-bytes-allowed',
  }
}
