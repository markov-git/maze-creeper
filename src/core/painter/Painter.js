import {SHIELD_SIZE} from '@core/constants'
import {fillMatrix} from '@core/painter/painter.matrixLogic'

export class Painter {
  constructor(props) {
    Object.assign(this, props)
    this.context = this.canvas.getContext('2d')
    this.matrixOfFog = Painter.generateMatrixOfFog(this.matrixOfMaze)
    this.matrixOfGameElements = fillMatrix(this.matrixOfMaze, '')
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.regionColor = 'rgb(48,105,49, 0.5)'
    this.images = {
      wallImage: 'img/wall32.png',
      pathImage: 'img/floor32.png',
      activeExitImage: 'img/aExit32.png',
      passiveExitImage: 'img/pExit32.png',
      keyImage: 'img/key32.png',
      ropeImage: 'img/rope32.png',
      trapImage: 'img/trap32.png'
    }
    this.imageWaiter = []
    this.inventory = []
    this.pathMatrix = new Array(this.rows).fill('').map(_ => new Array(this.columns).fill(false))
  }

  static generateMatrixOfFog(matrix) {
    return matrix.map((row, y, rows) => {
      if (y !== 0 && y !== rows.length - 1) {
        return row.map((_, x, cells) => x !== 0 && x !== cells.length - 1)
      } else {
        return row.map(_ => false)
      }
    })
  }

  async init() {
    this.initImages()
    await Promise.all(this.imageWaiter)
    const canvasHeight = this.canvas.height
    const clientHeight = document.documentElement.clientHeight - 100

    const canvasWidth = this.canvas.width
    const clientWidth = document.documentElement.clientWidth - 80

    if (canvasHeight + 120 > clientHeight) {
      const newWidth = clientHeight - 120
      const scale = newWidth / canvasHeight
      this.canvas.width *= scale
      this.canvas.height *= scale
      this.context.scale(scale, scale)
    } else if (canvasWidth + 100 > clientWidth / 2) {
      const newWidth = (clientWidth - 100) / 2
      const scale = newWidth / canvasWidth
      this.canvas.width *= scale
      this.canvas.height *= scale
      this.context.scale(scale, scale)
    }

    this.on()
  }

  prepare() {
    this.clear()
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        if (this.matrixOfMaze[y][x]) {
          this.context.drawImage(this.images.wallImage,
            x * SHIELD_SIZE, y * SHIELD_SIZE)
        }
        if (this.pathMatrix[y][x]) {
          this.context.drawImage(this.images.pathImage,
            x * SHIELD_SIZE, y * SHIELD_SIZE)
        }
        if (this.matrixOfGameElements[y][x] && this.gameIsReady) {
          this.context.drawImage(this.images[this.matrixOfGameElements[y][x]],
            x * SHIELD_SIZE, y * SHIELD_SIZE)
        }
      }
    }
  }

  on() {
    throw new Error('this method must be implemented')
  }

  clear() {
    this.context.fillStyle = '#928fa4'
    this.context.fillRect(0, 0, this.width, this.height)
  }

  addPlayer(player) {
    this.player = player
    this.removeSomeFog()
  }

  updatePlayerMeta(player) {
    this.player = player
    this.removeSomeFog()
  }

  addGameElement(element, pos) {
    if (!this.matrixOfGameElements[pos.row][pos.col] && !this.matrixOfMaze[pos.row][pos.col]) {
      this.matrixOfGameElements[pos.row][pos.col] = element
      this.pathMatrix[pos.row][pos.col] = false
      return true
    } else return false
  }

  unlockExit() {
    for (let row = 0; row < this.matrixOfGameElements.length; row++) {
      const i = this.matrixOfGameElements[row].findIndex(el => el === 'passiveExitImage')
      if (i !== -1) {
        this.matrixOfGameElements[row][i] = 'activeExitImage'
        break
      }
    }
  }

  getCurrentGameElement(pos) {
    return this.matrixOfGameElements[pos.y][pos.x]
  }

  removeSomeFog() {
    const xIndex = this.player.positionIndexes.x
    const yIndex = this.player.positionIndexes.y
    this.matrixOfFog[yIndex][xIndex] = false
    const walls = this.player.foundedWalls
    if (walls) {
      walls.forEach(wall => {
        this.matrixOfFog[wall.y][wall.x] = false
      })
    }
  }

  drawFog() {
    if (this.fogOfWar) {
      this.applyColor('slategray')
    } else {
      this.applyColor('rgba(112,128,144,.7)')
    }
    for (let y = 0; y < this.matrixOfFog.length; y++) {
      for (let x = 0; x < this.matrixOfFog[y].length; x++) {
        if (this.matrixOfFog[y][x]) {
          this.context.beginPath()
          this.context.fillRect(x * SHIELD_SIZE - 1, y * SHIELD_SIZE - 1, SHIELD_SIZE + 2, SHIELD_SIZE + 2)
          this.context.closePath()
        }
      }
    }
  }

  drawPlayer() {
    this.applyColor(this.player.color)
    this.context.beginPath()
    this.context.arc(this.player.centerPosition.x, this.player.centerPosition.y,
      SHIELD_SIZE / 3, 0, Math.PI * 2)
    this.context.closePath()
    this.context.fill()
  }

  applyColor(color) {
    this.context.fillStyle = this.context.strokeStyle = color
  }

  initImages() {
    for (const key of Object.keys(this.images)) {
      const src = this.images[key]
      this.images[key] = new Image()
      this.images[key].src = src
      this.imageWaiter.push(new Promise(resolve => {
        this.images[key].addEventListener('load', resolve)
      }))
    }
  }
}