import {SHIELD_SIZE} from '@core/constants'

export default {
  up: {
    x: 0,
    y: -SHIELD_SIZE
  },
  right: {
    x: SHIELD_SIZE,
    y: 0
  },
  down: {
    x: 0,
    y: SHIELD_SIZE
  },
  left: {
    x: -SHIELD_SIZE,
    y: 0
  }
}
