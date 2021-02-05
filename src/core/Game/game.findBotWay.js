import direction from './game.directions'
import {SHIELD_SIZE} from "@core/constants";

export function findBotWay(matrix, {x, y}) {
  matrix[y][x] = 'path'
  if (isNotResearched(matrix, y + 1, x)) {
    return {
      // meta: true,
      move: direction.down
    }
  } else if (isNotResearched(matrix, y, x + 1)) {
    return {
      // meta: true,
      move: direction.right
    }
  } else if (isNotResearched(matrix, y - 1, x)) {
    return {
      // meta: true,
      move: direction.up
    }
  } else if (isNotResearched(matrix, y, x - 1)) {
    return {
      // meta: true,
      move: direction.left
    }
  } else {
    let returnMove, newY, newX
    matrix[y][x] = 'lockup'
    do {
      returnMove = direction.return
      newX = x + returnMove.x / SHIELD_SIZE
      newY = y + returnMove.y / SHIELD_SIZE
    } while (matrix[newY][newX] !== 'path')
    return {
      // meta: true,
      move: returnMove
    }
  }
}

function isNotResearched(matrix, y, x) {
  return matrix[y][x] === ''
    && y > 0
    && y < matrix.length
    && x > 0
    && x < matrix[0].length
}
