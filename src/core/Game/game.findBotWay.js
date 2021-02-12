import initPriority from './game.initPriority'
import findByAStar from './game.AStar'

export function findBotWay(matrix, {x, y}) {
  matrix[y][x] = 'path'
  // console.log(matrix.map(row => row.map(el => el === '' ? 'oooo' : el)))  // dev

  const priority = createRandomPriority()

  while (priority.length) {
    const candidate = priority.pop()
    const newIndexes = candidate.indexes(y, x)
    if (isNotResearched(matrix, newIndexes) && matrix[newIndexes.y][newIndexes.x] === '') {
      return candidate.direction
    }
  }
  return moveBack(matrix, y, x)
}

export function createRandomPriority() {
  const array = initPriority()
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}

function moveBack(matrix, y, x) {
  let move, newY, newX
  matrix[y][x] = 'lockup'
  const priority = createRandomPriority()
  do {
    const candidate = priority.pop()
    move = candidate.direction
    newX = candidate.indexes(y, x).x
    newY = candidate.indexes(y, x).y
  } while (matrix[newY][newX] !== 'path' && priority.length)
  if (matrix[newY][newX] === 'path') {
    return move
  } else {
    // algorithm to made a path to closest unresearched shield
    const debug = findByAStar(matrix, {y, x}, '')
    console.log(debug)
    return debug // :Array
  }
}

export function isNotResearched(matrix, {y, x}) {
  return y > 0
    && y < matrix.length
    && x > 0
    && x < matrix[0].length
}

