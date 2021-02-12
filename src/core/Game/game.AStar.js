import {createRandomPriority, isNotResearched} from '@core/Game/game.findBotWay'

export default function (matrix, position, ell) {
  const reachable = [{position}]
  const explored = []

  while (reachable.length) {
    const node = chooseNode()
    const {x, y} = node.position
    if (matrix[y][x] === ell) {
      return buildPath(node)
    } else {
      let neighbors = findNeighbors(node.position)
      neighbors = neighbors.filter(pos => {
        return explored.findIndex(n => n.position.x === pos.x && n.position.y === pos.y) === -1
      })
      neighbors = neighbors.map(pos => {
        return {
          position: pos,
          previous: node.position
        }
      })
      reachable.push(...neighbors)
      explored.push(node)
    }
  }

  if (!reachable.length) {
    console.log('matrix', matrix)
    console.log('explored', explored)
    throw new Error('Ничего не нашли')
  }

  function buildPath(toNode) {
    const path = []
    while (toNode.position && toNode.previous) {
      path.push(toNode.position)
      const {x, y} = toNode.previous
      toNode = explored.find(n => n.position.x === x && n.position.y === y)
    }
    return path.reverse()
  }

  function findNeighbors({y, x}) {
    return createRandomPriority()
      .map(step => step.indexes(y, x))
      .filter(indexes => isNotResearched(matrix, indexes) && isMovable(matrix, indexes))
  }

  function chooseNode() {
    const index = Math.round(Math.random() * (reachable.length - 1))
    return reachable.splice(index, 1)[0]
  }
}

function isMovable(matrix, {y, x}) {
  return matrix[y][x] === 'path' || matrix[y][x] === 'lockup' || matrix[y][x] === ''
}