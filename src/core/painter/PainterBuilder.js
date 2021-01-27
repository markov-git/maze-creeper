import {Painter} from "@core/painter/Painter"
import {SHIELD_SIZE} from "@core/constants"
import {aroundPos, freeSpaceMatrix, localCoords, testInside} from "@core/painter/painter.coordinats"
import {fillMatrix, invertMatrix} from "@core/painter/painter.matrixLogic"
import {calculateItems} from "@core/utils"

export class PainterBuilder extends Painter {
  constructor(canvas, props) {
    super(canvas, props)
    this.fogOfWar = props.fogOfWar
    this.gameIsReady = props.gameIsReady
    this.emitFinishMaze = props.emitFinishMaze
    if (!this.gameIsReady) {
      this.spaceMatrix = freeSpaceMatrix(this.matrixOfMaze)
      this.initBuilder()
    } else {
      this.pathMatrix = invertMatrix(this.matrixOfMaze)
    }
    this.shownInterfase = false
    this.init()
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
    this.prepare()
    if (this.gameIsReady) {
      this.drawInventory()
      this.updatePlayer()
      if (this.fogOfWar) {
        this.drawFog()
      }
    } else {
      this.drawInterface()
      if (this.interfaceWall.clicked) {
        this.drawFreePositions()
      }
      if (this.checkIsGeneratedMaze()) {
        this.canvas.removeEventListener('click', this.onclick)
        this.interfaceWall.clicked = false
        this.gameIsReady = true
        this.canvas.height -= 3 * SHIELD_SIZE
        this.emitFinishMaze(this.matrixOfMaze)
      }
    }
    window.requestAnimationFrame(this.on.bind(this))
  }

  drawInventory() {
    if (!this.shownInterfase) {
      this.shownInterfase = !this.shownInterfase
      this.canvas.height += 3.1 * SHIELD_SIZE
    }

    if (this.inventory.length) {
      // fill background
      this.applyColor('#928fa4')
      this.context.fillRect(0, this.canvas.height - 3 * SHIELD_SIZE,
        +this.canvas.width, SHIELD_SIZE * 3)
      // write title
      this.applyColor('black')
      this.context.font = '32px serif'
      this.context.fillText('Инвентарь:',
        SHIELD_SIZE * .4, this.canvas.height - 2.1 * SHIELD_SIZE)
      // draw items
      const inv = calculateItems(this.inventory)
      for (let i = 0; i < Object.keys(inv).length; i++) {
        const item = Object.keys(inv)[i]
        const count = 'x' + inv[item]
        this.context.drawImage(this.images[item],
          SHIELD_SIZE * (i * 1.5 + .5), this.canvas.height - 1.5 * SHIELD_SIZE)
        this.applyColor('black')
        this.context.font = '18px Arial'
        this.context.fillText(count,
          SHIELD_SIZE * (i * 1.5 + 1.5), this.canvas.height - 1.3 * SHIELD_SIZE)
      }
    }
  }

  drawInterface() {
    this.context.drawImage(this.images.pathImage,
      this.interfaceWall.x, this.interfaceWall.y)
    if (this.interfaceWall.clicked) {
      this.applyColor('red')
      this.context.lineWidth = 2
      this.context.strokeRect(this.interfaceWall.x, this.interfaceWall.y,
        this.interfaceWall.width, this.interfaceWall.height)
    }
  }

  drawFreePositions() {
    for (let row = 1; row < this.spaceMatrix.length - 1; row++) {
      for (let col = 1; col < this.spaceMatrix[row].length - 1; col++) {
        if (this.spaceMatrix[row][col]) {
          this.applyColor(this.regionColor)
          this.context.fillRect(col * SHIELD_SIZE, row * SHIELD_SIZE,
            SHIELD_SIZE, SHIELD_SIZE)
          this.context.lineWidth = 2
          this.context.strokeStyle = 'black'
          this.context.strokeRect(col * SHIELD_SIZE + 2, row * SHIELD_SIZE + 2,
            SHIELD_SIZE - 4, SHIELD_SIZE - 4)
        }
      }
    }
  }

  initBuilder() {
    this.interfaceWall = {
      x: SHIELD_SIZE * .5,
      y: (this.rows + 1) * SHIELD_SIZE,
      width: SHIELD_SIZE,
      height: SHIELD_SIZE,
      clicked: false
    }
    this.onclick = event => {
      const mousePos = localCoords(this.canvas, event)
      if (testInside(mousePos, this.interfaceWall)) {
        this.interfaceWall.clicked = !this.interfaceWall.clicked
      }
      if (this.interfaceWall.clicked) {
        this.updateMatrix(mousePos)
      }
    }
    this.canvas.addEventListener('click', this.onclick)
  }

  updateMatrix(mousePos) {
    const rect = {
      x: SHIELD_SIZE,
      y: SHIELD_SIZE,
      width: (this.columns - 2) * SHIELD_SIZE,
      height: (this.rows - 2) * SHIELD_SIZE
    }
    if (testInside(mousePos, rect)) {
      const col = Math.floor(mousePos.x / SHIELD_SIZE)
      const row = Math.floor(mousePos.y / SHIELD_SIZE)

      if (this.spaceMatrix[row][col]) {
        this.pathMatrix[row][col] = true

        this.recalculateSpaces()
      }
    }
  }

  updateInventory(inv) {
    this.inventory.push(inv)
  }

  recalculateSpaces() {
    const factureOfSpaces = fillMatrix(this.spaceMatrix, 0)
    this.spaceMatrix = fillMatrix(this.spaceMatrix, false)
    for (let row = 0; row < this.spaceMatrix.length; row++) {
      for (let col = 0; col < this.spaceMatrix[row].length; col++) {
        if (this.pathMatrix[row][col]) {
          aroundPos(row, col).forEach(pos => {
            if (!this.pathMatrix[pos.row][pos.col]) {
              factureOfSpaces[pos.row][pos.col]++
              this.matrixOfMaze[pos.row][pos.col] =
                factureOfSpaces[pos.row][pos.col] > 1 || this.matrixOfMaze[pos.row][pos.col]
              this.spaceMatrix[pos.row][pos.col] = factureOfSpaces[pos.row][pos.col] < 2
            }
          })
        }
      }
    }

    for (let row = 1; row < this.matrixOfMaze.length - 1; row++) {
      for (let col = 1; col < this.matrixOfMaze[row].length - 1; col++) {
        let b = true
        aroundPos(row, col).forEach(pos => {
          b = b ? this.matrixOfMaze[pos.row][pos.col] : b
        })
        if (b) {
          this.matrixOfMaze[row][col] = b
        }
      }
    }
  }

  checkIsGeneratedMaze() {
    let res = true
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        if (!this.matrixOfMaze[row][col] && !this.pathMatrix[row][col]) res = false
      }
    }
    this.player.testPosition()
    return res
  }
}
