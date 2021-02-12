import {createRandomPriority, isNotResearched} from '@core/Game/game.findBotWay'

export default function (matrix, position, ell) {
  Node.matrix = matrix
  const reachable = [new Node(position)] // узлы в которые мы знаем как попасть из первого
  const explored = [] //уже рассмотренные узлы

  while(reachable.length) {
    const candidate = reachable[0].neighbor

    if (candidate) {

      const {x: candidateX, y: candidateY} = candidate.position
      if (matrix[candidateY][candidateX] === ell) {
        return [...candidate.from, candidate.position]
      } else {
        explored.push(reachable.shift())

        reachable.push(new Node(candidate.position))
        // need to draw this schema
      }

    }
  }
}

class Node {
  static matrix = []

  constructor(position) {
    this.position = position  // {x: 2, y: 2}
    this.neighbors = getNeighbor(Node.matrix, position)
  }

  get neighbor() {
    if (this.neighbors.length) {
      return {
        position: this.neighbors.pop(),
        from: [this.position]
      }
    } else {
      return false
    }
  }
}

function getNeighbor(matrix, {y, x}) {
  return createRandomPriority()
    .map(step => step.indexes(y, x))
    .filter(indexes => isNotResearched(matrix, indexes) && isMovable(matrix, indexes))
}

function isMovable(matrix, {y, x}) {  // this maybe wil be needed '' shield
  return matrix[y][x] === 'path' || matrix[y][x] === 'lockup'
}