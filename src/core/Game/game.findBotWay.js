import direction from './game.directions'

export function findBotWay(matrix, {x, y}) {
  matrix[y][x] = 'path'
  console.log(matrix)
  if (matrix[y - 1][x] === '') {
    return direction.up
  } else if (matrix[y][x + 1] === '') {
    return direction.right
  } else if (matrix[y + 1][x] === '') {
    return direction.down
  } else if (matrix[y][x - 1] === '') {
    return direction.left
  } else {

  }
}
