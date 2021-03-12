import {SHIELD_SIZE} from '@core/constants'
import {translateToCenter} from '@core/utils'
import {fillMatrix, initMatrix} from '@core/painter/painter.matrixLogic'

export class Player {
  static color = 'red'

  constructor(prop) {
    Object.assign(this, prop)
    this.centerPosition = translateToCenter(this.position)
    this.foundedWalls = []
    this.matrixAI = initMatrix(fillMatrix(this.matrix, ''))
    this.color = Player.color
    this.testPosition()
  }

  testPosition() {
    if (this.matrix[this.positionIndexes.y][this.positionIndexes.x]) {
      if (!this.matrix[this.positionIndexes.y][this.positionIndexes.x + 1]) {
        this.position.x += SHIELD_SIZE
        this.centerPosition = translateToCenter(this.position)
      } else {
        this.position.y += SHIELD_SIZE
        this.centerPosition = translateToCenter(this.position)
      }
    }
  }

  move(dPos) {
    const nextX = Player.getPositionIndex(this.centerPosition.x + dPos.x)
    const nextY = Player.getPositionIndex(this.centerPosition.y + dPos.y)
    if (!this.matrix[nextY][nextX]) {
      this.position.x += dPos.x
      this.position.y += dPos.y
      this.centerPosition = translateToCenter(this.position)
      this.emitMove(this)
      return true
    } else {
      this.addWall({x: this.centerPosition.x + dPos.x, y: this.centerPosition.y + dPos.y})
      this.emitWall()
      this.emitMove(this)
      return false
    }
  }

  addWall(pos) {
    const x = Player.getPositionIndex(pos.x)
    const y = Player.getPositionIndex(pos.y)
    if (!this.foundedWalls.map(pos => JSON.stringify(pos)).includes(JSON.stringify(pos))) {
      this.matrixAI[y][x] = 'wall'
      this.foundedWalls.push({x, y})
    }
  }

  static getPositionIndex(pos) {
    return Math.floor(pos / SHIELD_SIZE)
  }

  get positionIndexes() {
    return {
      x: Player.getPositionIndex(this.centerPosition.x),
      y: Player.getPositionIndex(this.centerPosition.y)
    }
  }
}