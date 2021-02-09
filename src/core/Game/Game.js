import {initMaze} from '@core/mazeGenerator/MazeGenerator'
import {Player} from '@core/Game/Player'
import {MOVE_DELAY, SHIELD_SIZE} from '@core/constants'
import {initialMatrix, randomIndexes, toMatrix} from '@core/utils'
import {Emitter} from '@core/Emitter'
import {PainterBuilder} from '@core/painter/PainterBuilder'
import {aroundPos} from '@core/painter/painter.coordinats'
import {findBotWay} from './game.findBotWay'
import direction from './game.directions'

export class Game {
  constructor(props) {
    const maze = initMaze(props.size)
    Object.assign(this, props)
    this.columns = maze[0].length * 2 + 1
    this.rows = maze.length * 2 + 1
    if (this.random || this.mazeMatrix) {
      this.matrixOfMaze = this.mazeMatrix || toMatrix(maze, this.columns, this.rows)
      this.boardWidth = this.columns * SHIELD_SIZE
      this.boardHeight = this.rows * SHIELD_SIZE
      this.isReady = this.random
    } else {
      this.matrixOfMaze = initialMatrix(this.columns, this.rows)
      this.boardWidth = this.columns * SHIELD_SIZE
      this.boardHeight = (this.rows + 3) * SHIELD_SIZE
      this.isReady = this.random
    }
    this.emitter = new Emitter()
    this.unsubs = []
    this.inventory = []
    this.init()
  }

  static availableToMove = {
    player: 0,
    bot: 0
  }

  static localHeaders = []

  init() {
    this.board = new PainterBuilder(this.$canvas, {
      columns: this.columns,
      rows: this.rows,
      matrixOfMaze: this.matrixOfMaze,
      boardWidth: this.boardWidth,
      boardHeight: this.boardHeight,
      gameIsReady: this.isReady,
      fogOfWar: this.fogOfWar,
      emitFinishMaze: this.emit
    })

    this.player = new Player(
      {
        x: SHIELD_SIZE,
        y: SHIELD_SIZE,
        emitMove: meta => {
          this.emitter.emit('move', meta)
        },
        emitWall: () => {
          this.emitter.emit('wallFound')
        }
      }, this.matrixOfMaze)
    this.board.addPlayer(this.player)
    if (this.isReady) {
      this.addElementToRandomPos('passiveExitImage')
      this.addElementToRandomPos('keyImage')
      this.addElementToRandomPos('trapImage', 3)
      this.addElementToRandomPos('ropeImage')
    }
    ////////////////////////
    // Нужно сделать добавление событий при выполнении условия старта игры
    ////////////////////////
    this.unsubs.push(this.emitter.subscribe('move', player => {
      this.board.updatePlayerMeta(player)
    }))
    // if player
    if (!this.botMode) {
      this.unsubs.push(this.emitter.subscribe('wallFound', () => {
        // Переход хода другому игроку
        this.setStatus('Вы наткнулись на стену, ход противника!')
        Game.forbidToMove('player')
        this.calculatePlayerStatus()
        Game.allowToMove('bot')
        this.emitNextPlayer()
      }))
      this.addEventListeners()
      // if bot
    } else {
      this.unsubs.push(this.emitter.subscribe('wallFound', () => {
        // Переход хода другому игроку
        this.setStatus('Компьтер наткнулся на стену, ваш ход!')
        Game.forbidToMove('bot')
        Game.allowToMove('player')
        this.calculatePlayerStatus()
      }))
    }
    this.board.on()
  }

  calculateBotStatus() {
    const count = Game.availableToMove.bot
    if (count) {
      this.setLocalStatus(
        `Пропуск ${count} ${count === 1 ? 'хода' : 'ходов'}`,
        Game.localHeaders[1])
    } else {
      this.setLocalStatus('', Game.localHeaders[1])
    }
  }

  calculatePlayerStatus() {
    const count = Game.availableToMove.player
    if (count) {
      const message = `Пропуск ${count} ${count === 1 ? 'хода' : 'ходов'}`
      this.setLocalStatus(message, Game.localHeaders[0])
    } else {
      this.setLocalStatus('', Game.localHeaders[0])
    }
  }

  addElementToRandomPos(element, number = 1) {
    for (let i = 0; i < number; i++) {
      const {col, row} = randomIndexes(this.columns, this.rows)
      if (!this.board.addGameElement(element, {col, row})) {
        for (const arPos of aroundPos(row, col)) {
          if (this.board.addGameElement(element, {row: arPos.row[0], col: arPos.col[0]})) break
        }
      }
    }
  }

  makeBotMove() {
    this.calculateBotStatus()
    // делаем ход ботом если можем
    if (Game.availableToMove.bot === 0) {
      // looking for best way
      const move = findBotWay(this.player.matrixAI, this.player.positionIndexes)
      // make a move
      const result = this.player.move(move.move)
      this.chekGameElement('bot')

      if (result) {
        setTimeout(this.makeBotMove.bind(this), MOVE_DELAY)
      } else {
        this.calculateBotStatus()
        setTimeout(() => {
          if (Game.allowToMove('player')) {
            this.calculatePlayerStatus()
            this.makeBotMove()
          }
        }, MOVE_DELAY)
      }
      // иначе передаем ход игроку
    } else if (Game.allowToMove('player')) {
      this.makeBotMove()
    }
    this.calculatePlayerStatus()
  }

  static forbidToMove(who, num = 1) {
    Game.availableToMove[who] += num
  }

  static allowToMove(who) {
    return Game.availableToMove[who] - 1 >= 0
      ? --Game.availableToMove[who]
      : Game.availableToMove[who]
  }

  addEventListeners() {
    document.addEventListener('keydown', event => {
      if (Game.availableToMove.player === 0) {
        switch (event.key) {
          case 'ArrowRight':
            this.player.move(direction.right)
            event.preventDefault()
            break
          case 'ArrowUp':
            this.player.move(direction.up)
            event.preventDefault()
            break
          case 'ArrowLeft':
            this.player.move(direction.left)
            event.preventDefault()
            break
          case 'ArrowDown':
            this.player.move(direction.down)
            event.preventDefault()
            break
        }
        this.chekGameElement('gamer')
      }
    })
  }

  chekGameElement(type) {
    const gameElement = this.board.getCurrentGameElement(this.player.positionIndexes)
    let message
    switch (gameElement) {
      case 'activeExitImage':
        // Game Over
        message = type === 'gamer' ? 'Вы победили!' : 'Комрьютер победил'
        this.setStatus(message)
        // dev option
        setTimeout(() => {
          window.location.reload()
        }, 3000)
        break
      case 'passiveExitImage':
        // Message that need a key
        message = type === 'gamer'
          ? 'Вам нужен ключ чтобы выйти из лабиринта!'
          : 'Компьютеру нужен ключ чтобы выйти из лабиринта!'
        this.setStatus(message)
        break
      case 'keyImage':
        // Message that key found and switch exitBlock
        // if for optimization
        if (!this.inventory.includes('keyImage')) {
          message = type === 'gamer'
            ? 'Вы нашли ключ!'
            : 'Компьютер нашел ключ!'
          this.setStatus(message)
          this.addItemToInv('keyImage')
          this.board.unlockExit()
        }
        break
      case 'ropeImage':
        // Message that you found a rope
        const rope = 'ropeImage:' + this.player.positionIndexes.toString()
        if (!this.inventory.includes(rope)) {
          message = type === 'gamer'
            ? 'Вы нашли веревку! Ход противника'
            : 'Компьютер нашел веревку! Ваш ход'
          this.setStatus(message)
          this.addItemToInv(rope)
        }
        break
      case 'trapImage':
        // Message that you was took in trap
        const trap = 'trapImage:' + JSON.stringify(this.player.positionIndexes)
        if (!this.inventory.includes(trap)) {
          if (type === 'gamer') {
            message = 'Вы в ловушке - пропускаете 2 хода'
            Game.forbidToMove('player', 2)
            this.setLocalStatus(`Пропуск 2 ходов`)
            Game.allowToMove('bot')
            this.emitNextPlayer()
          } else {
            message = 'Компьютер в ловушке - пропускает 2 хода'
            this.setLocalStatus(`Пропуск 2 ходов`)
            Game.forbidToMove('bot', 2)
            Game.allowToMove('player')
          }
          this.setStatus(message)
          this.addItemToInv(trap)
        }
        break
    }
  }

  addItemToInv(item) {
    this.inventory.push(item)
    this.board.updateInventory(item)
  }
}