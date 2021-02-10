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
      // Переход хода другому игроку
      this.setStatus('Компьтер наткнулся на стену, ваш ход!')
      Game.forbidToMove('bot')
      Game.allowToMove('player')
      this.setTitleStatus()
    }))
  }

  makeBotMove() {
    this.setTitleStatus()
    // делаем ход ботом если можем
    if (Game.availableToMove.bot === 0) {
      // looking for best way
      const move = findBotWay(this.player.matrixAI, this.player.positionIndexes)
      // make a move
      const result = this.player.move(move.move)
      this.chekGameElement()

      if (result) {
        setTimeout(this.makeBotMove.bind(this), MOVE_DELAY)
      } else {
        this.setTitleStatus()
        setTimeout(() => {
          if (Game.allowToMove('player')) {
            this.setTitleStatus()
            this.makeBotMove()
          }
        }, MOVE_DELAY)
      }
      // иначе передаем ход игроку
    } else if (Game.allowToMove('player')) {
      this.makeBotMove()
    }
    this.setTitleStatus()
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
