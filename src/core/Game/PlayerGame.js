import {Game} from '@core/Game/Game'
import direction from '@core/Game/game.directions'
import {GAME_MODE_NETWORK} from '@core/constants'
import {showPopup} from '@core/showPopup'

export default class PlayerGame extends Game {
  constructor(props) {
    super(props)
    this.type = 'player'
    this._twoSteps = false
  }

  init() {
    super.init()
    if (Game.availableToMove.player !== 0) {
      showPopup('warn', 'Ход противника!')
    }
    let nextPlayerAction

    if (this.vsMode === GAME_MODE_NETWORK) {
      this.sendNewStateToServer()

      nextPlayerAction = () => {
        // this.setStatus('Вы наткнулись на стену, ход противника!')
        if (!this._twoSteps) {
          showPopup('warn', 'Ход противника!')
        }
        Game.forbidToMove('player')
      }
    } else {
      nextPlayerAction = () => {
        this.setStatus('Вы наткнулись на стену, ход противника!')
        Game.forbidToMove('player')
        this.setTitleStatus()
        Game.allowToMove('bot')
        this.emitNextPlayer()
      }
    }

    this.unsubs.push(
      this.emitter.subscribe('wallFound', nextPlayerAction)
    )
    this.addEventListeners()
  }

  addEventListeners() {
    const keyType = 'Arrow'
    document.addEventListener('keydown', event => {
      if (Game.availableToMove.player === 0 && event.key.includes(keyType)) {
        const dir = event.key.slice(keyType.length).toLowerCase()
        this.player.move(direction[dir])
        event.preventDefault()
        this.chekGameElement()
        this.sendNewStateToServer()
      }
    })

    if (this.vsMode === GAME_MODE_NETWORK) {
      this.subscribeToState(async state => {
        const enemyState = +state.gameState
        if (enemyState && Game.availableToMove.player > 1) {
          Game.allowToMove('player')
          showPopup('warn', 'Пропуск еще одного хода!')
          this.sendNewStateToServer()
        } else if (enemyState === 1) {
          Game.allowToMove('player')
          if (Game.availableToMove.player === 0) {
            showPopup('message', 'Ваш ход!')
            this._twoSteps = false
          }
        } else if (enemyState === 2) {
          Game.allowToMove('player')
          // bug with double message about 2 steps .. must be 2 step then 1 step
          showPopup('message', 'Противник пропускает 2 хода!')
          this._twoSteps = true
        }
      })
    }
  }

  sendNewStateToServer() {
    if (this.vsMode === GAME_MODE_NETWORK) {
      const newState = this.board.currentState
      this.sendNewState(newState)
    }
  }

  exitAction(mode) {
    const message = mode ? 'Вы победили!' : 'Вам нужен ключ чтобы выйти из лабиринта!'
    const type = mode ? 'message' : 'warn'
    showPopup(type, message)
    if (this.vsMode === GAME_MODE_NETWORK && mode) {
      this.sendNewMessage('Противник победил!')
    }
  }

  keyAction() {
    showPopup('message', 'Вы нашли ключ!')
    if (this.vsMode === GAME_MODE_NETWORK) {
      this.sendNewMessage('Противник нашел ключ!')
    }
  }

  ropeAction() {
    showPopup('message', 'Вы нашли веревку!')
  }

  trapAction() {
    showPopup('warn', 'Ловушка! Пропуск 2 ходов')
    Game.forbidToMove('player', 2)
    if (this.vsMode !== GAME_MODE_NETWORK) {
      Game.allowToMove('bot')
      this.setStatus('Вы в ловушке - пропускаете 2 хода')
      this.emitNextPlayer()
    }
  }
}
