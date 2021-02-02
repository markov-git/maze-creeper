import {initMaze} from "@core/mazeGenerator/MazeGenerator"
import {Player} from "@core/Game/Player"
import {SHIELD_SIZE} from "@core/constants"
import {initialMatrix, toMatrix} from "@core/utils"
import {Emitter} from "@core/Emitter"
import {PainterBuilder} from "@core/painter/PainterBuilder"
import {aroundPos} from "@core/painter/painter.coordinats"
import {findBotWay} from "./game.findBotWay";
import direction from './game.directions'

export class Game {
  constructor(cols, rows, $canvas, random, fogOfWar, botMode, mazeMatrix, emit, setStatus, emitNextPlayer) {
    this.maze = initMaze(cols, rows)
    this.readyMaze = mazeMatrix
    this.columns = this.maze[0].length * 2 + 1
    this.rows = this.maze.length * 2 + 1
    this.fogOfWar = fogOfWar
    this.botMode = botMode
    this.setStatus = setStatus
    this.emitNextPlayer = emitNextPlayer
    if (random || this.readyMaze) {
      this.matrixOfMaze = this.readyMaze ? this.readyMaze : toMatrix(this.maze, this.columns, this.rows)
      this.boardWidth = this.columns * SHIELD_SIZE
      this.boardHeight = this.rows * SHIELD_SIZE
      this.isReady = random
    } else {
      this.matrixOfMaze = initialMatrix(this.columns, this.rows)
      this.boardWidth = this.columns * SHIELD_SIZE
      this.boardHeight = this.rows * SHIELD_SIZE + 3 * SHIELD_SIZE
      this.isReady = random
      this.emit = emit
    }
    this.$canvas = $canvas
    this.emitter = new Emitter()
    this.unsubs = []
    this.inventory = []
    this.init()
  }

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

    if (!this.botMode) {
      this.unsubs.push(this.emitter.subscribe('wallFound', () => {
        // Переход хода другому игроку
        this.setStatus('Вы наткнулись на стену, ход противника!')
        this.emitNextPlayer()
      }))
      this.addEventListeners()
    } else {
      this.unsubs.push(this.emitter.subscribe('wallFound', () => {
        // Переход хода другому игроку
        this.setStatus('Компьтер наткнулся на стену, ваш ход!')
        // this.emitNextPlayer()
      }))
    }
    ////////////////////////

    this.board.on()
  }

  addElementToRandomPos(element, number = 1) {
    for (let i = 0; i < number; i++) {
      const col = 4 + Math.floor(Math.random() * (this.columns - 5))
      const row = 4 + Math.floor(Math.random() * (this.rows - 5))
      if (!this.board.addGameElement(element, {col, row})) {
        for (const arPos of aroundPos(row, col)) {
          if (this.board.addGameElement(element, {row: arPos.row[0], col: arPos.col[0]})) break
        }
      }
    }
  }

  makeBotMove() {
    // looking for best way
    const move = findBotWay(this.player.matrixAI, this.player.positionIndexes)
    // make a move
    const result = this.player.move(move.move)
    this.chekGameElement('bot')

    if (move.meta && result) {
      setTimeout(this.makeBotMove.bind(this),300)
    }
  }

  addEventListeners() {
    document.addEventListener('keydown', event => {
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
        }, 1000)
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
            ? 'Вы нашли ключ! Ход противника'
            : 'Компьютер нашел ключ! Ваш ход'
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
          message = type === 'gamer'
            ? 'Вы в ловушке, противник ходит 2 раза'
            : 'Компьютер в ловушке, вы ходите 2 раза'
          this.setStatus(message)
          // this.addItemToInv(trap)
        }
        break
    }
  }

  addItemToInv(item) {
    this.inventory.push(item)
    this.board.updateInventory(item)
  }
}