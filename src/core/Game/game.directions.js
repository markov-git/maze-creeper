import {SHIELD_SIZE} from "@core/constants";

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
  },
  calls: 0,
  get return() {
    switch (this.calls) {
      case 0:
        this.calls++
        return this.up
      case 1:
        this.calls++
        return this.left
      case 2:
        this.calls++
        return this.down
      case 3:
        this.calls = 0
        return this.right
    }
  }
}
