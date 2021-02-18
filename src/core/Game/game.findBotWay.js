import initPriority from './game.initPriority'
import findByAStar from './game.AStar'
import direction from './game.directions'

export function findBotWay(matrix, {x, y}, isHasKey) {
  if (isHasKey) {
    if (!_once) {
      _once = true
      _pathToGoal.splice(0, _pathToGoal.length)
    }
    return getNextStepToGoal(matrix, {y, x}, 'exit')
  }

  matrix[y][x] = matrix[y][x] === 'exit' ? 'exit' : 'path'

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
  matrix[y][x] = matrix[y][x] === 'exit' ? 'exit' : 'lockup'
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
    return getNextStepToGoal(matrix, {y, x}, '')
  }
}

function getNextStepToGoal(matrix, myPos, goal) {
  if (_pathToGoal.length) {
    return _pathToGoal.pop()
  } else {
    const indexesPath = findByAStar(matrix, myPos, goal)
    normalizeAndSave(myPos, indexesPath)
    return _pathToGoal.pop()
  }
}

const _pathToGoal = []
let _once = false

function normalizeAndSave(from, path) {
  let lastPos = from
  const normalize = path.map(pos => {
    if (pos.y > lastPos.y) {
      lastPos = pos
      return direction.down
    }
    if (pos.y < lastPos.y) {
      lastPos = pos
      return direction.up
    }
    if (pos.x > lastPos.x) {
      lastPos = pos
      return direction.right
    }
    if (pos.x < lastPos.x) {
      lastPos = pos
      return direction.left
    }
    throw new Error('Something went wrong in normalize')
  }).reverse()
  _pathToGoal.push(...normalize)
}

export function isNotResearched(matrix, {y, x}) {
  return y > 0
    && y < matrix.length
    && x > 0
    && x < matrix[0].length
}

