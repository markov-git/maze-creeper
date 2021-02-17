import {createRandomPriority, isNotResearched} from '@core/Game/game.findBotWay'

export default function (matrix, position, goal) {
  const reachable = [{position, cost: 0}]
  const explored = []

  while (reachable.length) {
    const node = chooseNode()
    const {x, y} = node.position
    if (matrix[y][x] === goal) {
      return buildPath(node)
    } else {
      const neighbors = findNeighbors(node.position)
        .filter(pos => explored.findIndex(n => n.position.x === pos.x && n.position.y === pos.y) === -1)
        .map(pos => ({
          position: pos,
          previous: node.position,
          cost: Infinity
        }))
        .map(n => {
          if (node.cost + 1 < n.cost) {
            n.previous = node.position
            n.cost = node.cost + 1
          }
          return n
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
    let index = Math.round(Math.random() * (reachable.length - 1))
    let minCost = Infinity
    reachable.forEach((n, i) => {
      if (n.cost < minCost) {
        minCost = n.cost
        index = i
      }
    })
    return reachable.splice(index, 1)[0]
  }
}

function isMovable(matrix, {y, x}) {
  return ['path', 'lockup', '', 'exit'].includes(matrix[y][x])
}