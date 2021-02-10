import {Game} from '@core/Game/Game'
import {findBotWay} from '@core/Game/game.findBotWay'
import {MOVE_DELAY} from '@core/constants'

export default class BotGame extends Game {
  constructor(props) {
    super(props)
    this.type = 'bot'
  }

  init() {
    super.init()
    this.unsubs.push(this.emitter.subscribe('wallFound', () => {
      this.setStatus('Компьтер наткнулся на стену, ваш ход!')
      Game.forbidToMove('bot')
      Game.allowToMove('player')
      this.setTitleStatus()
    }))
  }

  makeBotMove() {
    this.setTitleStatus()
    if (Game.availableToMove.bot === 0) {
      this.tryToMove()
    } else {
      this.allowPlayerToMove()
    }
    this.setTitleStatus()
  }

  allowPlayerToMove() {
    const playerBlock = Game.allowToMove('player')
    this.setTitleStatus(true)
    if (playerBlock) {
      setTimeout(() => {
        Game.allowToMove('bot')
        this.makeBotMove()
      }, MOVE_DELAY)
    }
  }

  tryToMove() {
    const {move} = findBotWay(this.player.matrixAI, this.player.positionIndexes)
    const result = this.player.move(move)
    if (result) {
      this.chekGameElement()
      setTimeout(() => {
        this.makeBotMove()
      }, MOVE_DELAY)
    } else {
      this.allowPlayerToMove()
    }
  }

  exitAction(mode) {
    const message = mode ? 'Компьютер победил' : 'Компьютеру нужен ключ чтобы выйти из лабиринта!'
    this.setStatus(message)
  }

  keyAction() {
    this.setStatus('Компьютер нашел ключ!')
  }

  ropeAction() {
    this.setStatus('Компьютер нашел веревку! Ваш ход')
  }

  trapAction() {
    this.setLocalStatus(`Пропуск 2 ходов`)
    Game.forbidToMove('bot', 2)
    Game.allowToMove('player')
    this.setStatus('Компьютер в ловушке - пропускает 2 хода')
  }
}
