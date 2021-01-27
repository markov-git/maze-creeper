import direction from './game.directions'

export function findBotWay(matrix, {x, y}) {
  if (matrix[y - 1][x] === '') {
    return direction.up
  } else if (matrix[y][x + 1] === '') {
    return direction.right
  } else if (matrix[y + 1][x] === '') {
    return direction.down
  } else if (matrix[y][x - 1] === '') {
    return direction.left
  }
}
// переход к поиску стены !!