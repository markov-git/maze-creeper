import {Painter} from '@core/painter/Painter'
import {SHIELD_SIZE} from '@core/constants'
import {Player} from '@core/Game/Player'

export default class NetworkPainter extends Painter {
  constructor(props) {
    super(props)
    this.shownInterfase = false
    this.gameIsReady = true

    let inited = false

    props.subscribeToState(async state => {
      this.matrixOfMaze = state.matrixOfMaze
      this.pathMatrix = state.pathMatrix
      this.matrixOfGameElements = state.matrixOfGameElements
      this.player = state.player
      this.player.color = Player.color
      this.matrixOfFog = state.matrixOfFog
      if (!inited) {
        await this.init()
        inited = true
      }
      this.on()
    })
  }

  on() {
    this.prepare()
    this.drawPlayer()
    this.drawFog()
    window.requestAnimationFrame(this.on.bind(this))
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