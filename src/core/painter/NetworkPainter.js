import {Painter} from '@core/painter/Painter'
import {SHIELD_SIZE} from '@core/constants'

export default class NetworkPainter extends Painter {
  constructor(props) {
    super(props)
    this.shownInterfase = false
    this.gameIsReady = true

    props.subscribeToState(state => {
      this.matrixOfMaze = state.matrixOfMaze
      this.pathMatrix = state.pathMatrix
      this.matrixOfGameElements = state.matrixOfGameElements
      this.player = state.player
      this.matrixOfFog = state.matrixOfFog
      this.isReady = true
    })
    this.init()
  }

  on() {
    if (this.isReady) {
      this.prepare()
      this.drawPlayer()
      this.drawFog()
    }
    window.requestAnimationFrame(this.on.bind(this))
  }

  prepare() {
    if (this.isReady) {
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
  }

  drawPlayer() {
    this.applyColor(this.player.color)
    this.context.beginPath()
    this.context.arc(this.player.x, this.player.y,
      SHIELD_SIZE / 3, 0, Math.PI * 2)
    this.context.closePath()
    this.context.fill()
  }
}