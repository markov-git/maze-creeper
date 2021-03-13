import {Game} from '@core/Game/Game'
import direction from '@core/Game/game.directions'
import {GAME_MODE_NETWORK} from '@core/constants'

export default class PlayerGame extends Game {
  constructor(props) {
    super(props)
    this.type = 'player'
  }

  init() {
    super.init()
    this.unsubs.push(
      this.emitter.subscribe('wallFound', () => {
        this.setStatus('Вы наткнулись на стену, ход противника!')
        Game.forbidToMove('player')
        if (this.vsMode !== GAME_MODE_NETWORK) {
          this.setTitleStatus()
          Game.allowToMove('bot')
          this.emitNextPlayer()
        }
      })
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

        if (this.vsMode === GAME_MODE_NETWORK) {
          const newState = this.board.currentState
          this.sendNewState(newState)
        }
      }
    })
  }

  exitAction(mode) {
    const message = mode ? 'Вы победили!' : 'Вам нужен ключ чтобы выйти из лабиринта!'
    this.setStatus(message)
  }

  keyAction() {
    this.setStatus('Вы нашли ключ!')
  }

  ropeAction() {
    this.setStatus('Вы нашли веревку! Ход противника')
  }

  trapAction() {
    this.setLocalStatus(`Пропуск 2 ходов`)
    Game.forbidToMove('player', 2)
    Game.allowToMove('bot')
    this.setStatus('Вы в ловушке - пропускаете 2 хода')
    this.emitNextPlayer()
  }
}
