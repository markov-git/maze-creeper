import {Painter} from '@core/painter/Painter'
import {SHIELD_SIZE} from '@core/constants'
import {Player} from '@core/Game/Player'
import {Game} from '@core/Game/Game'
import {showPopup} from '@core/showPopup'

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

      const enemyState = +state.gameState
      console.log('Enemy blocked steps: ', enemyState)
      if (enemyState === 1) {
        Game.allowToMove('player')
        if (Game.availableToMove.player === 0) {
          showPopup('message', 'Ваш ход!')
        }
      } else if (enemyState === 2) {
        Game.allowToMove('player')
        // bug with double message about 2 steps .. must be 2 step then 1 step
        showPopup('message', 'Противник пропускает 2 хода!')
      }

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