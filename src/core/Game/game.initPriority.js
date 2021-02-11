import direction from './game.directions'

export default function () {
  return [
    {
      indexes(y, x) {
        return {
          y: y + 1,
          x: x
        }
      },
      direction: direction.down
    },
    {
      indexes(y, x) {
        return {
          y: y,
          x: x + 1
        }
      },
      direction: direction.right
    },
    {
      indexes(y, x) {
        return {
          y: y - 1,
          x: x
        }
      },
      direction: direction.up
    },
    {
      indexes(y, x) {
        return {
          y: y,
          x: x - 1
        }
      },
      direction: direction.left
    }
  ]
}