import type { Modifier } from '@popperjs/core'

/**
 * Popper modifier that forces the popper element to match the reference element's position
 * and size exactly, effectively turning it into an overlay perfectly aligned with it.
 *
 * WHY: see the note in FSResource.renderHint on why we use popper.js for this instead of
 * plain CSS positioning.
 */
export const samePositionAndSizeModifier: Modifier<any, any> = {
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
