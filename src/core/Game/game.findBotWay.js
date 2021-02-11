import initPriority from './game.initPriority'

export function findBotWay(matrix, {x, y}) {
  matrix[y][x] = 'path'
  console.log(matrix.map(row => row.map(el => el === '' ? 'oooo' : el)))  // dev

  const priority = createRandomPriority()

  while (priority.length) {
    const candidate = priority.pop()
    if (isNotResearched(matrix, candidate.indexes(y, x))) {
      return candidate.direction
    }
  }
  return moveBack(matrix, y, x)
}

function createRandomPriority() {
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
    const debug = findPathToEll(matrix, {y, x}, '')
    console.log(debug)
    return debug // :Array
  }
}

function isNotResearched(matrix, {y, x}) {
  return matrix[y][x] === ''
    && y > 0
    && y < matrix.length
    && x > 0
    && x < matrix[0].length
}

function isMovable(matrix, {y, x}) {
  return matrix[y][x] === 'path' || matrix[y][x] === 'lockup'
}

function getMovableIndexes(matrix, {y, x}) {
  const priority = createRandomPriority()
  while (priority.length) {
    const candidate = priority.pop()
    const candidateIndexes = candidate.indexes(y, x)
    if (isNotResearched(matrix, candidateIndexes) && isMovable(matrix, candidateIndexes)) { // если туда можно пойти
      return {index: candidateIndexes, move: candidate.direction}
    }
  }
  throw new Error('Something go wrong, there are no spaces to move')
}

function findPathToEll(matrix, position, element) {
  const reachable = [position]
  const explored = []
  // const path = []

  const {index, move} = getMovableIndexes(matrix, position)

  if (matrix[index.y][index.x] === element) {
    return path // need to generate right path to this ell
  }
}