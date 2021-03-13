import {initMaze} from '@core/mazeGenerator/MazeGenerator'
import {Player} from '@core/Game/Player'
import {SHIELD_SIZE} from '@core/constants'
import {initialMatrix, randomIndexes, toMatrix} from '@core/utils'
import {Emitter} from '@core/Emitter'
import {PainterBuilder} from '@core/painter/PainterBuilder'
import {aroundPos} from '@core/painter/painter.coordinats'

export class Game {
  constructor(props) {
    Object.assign(this, props)
    this.emitter = new Emitter()
    this.unsubs = []
    this.inventory = []
    this.init()
  }

  static availableToMove = {
    player: 0,
    bot: 0,
    gameBlocked: false
  }

  static forbidToMove(who, num = 1) {
    Game.availableToMove[who] += num
  }

  static allowToMove(who) {
    return Game.availableToMove[who] - 1 >= 0
      ? --Game.availableToMove[who]
      : Game.availableToMove[who]
  }

  init() {
    const maze = initMaze(this.size)
    this.columns = maze[0].length * 2 + 1
    this.rows = maze.length * 2 + 1
    this.boardWidth = this.columns * SHIELD_SIZE
    // if auto generation or matrix also was created
    if (this.random || this.mazeMatrix) {
      this.matrixOfMaze = this.mazeMatrix || toMatrix(maze, this.columns, this.rows)
      this.boardHeight = this.rows * SHIELD_SIZE
      this.isReady = true
    } else {
      this.matrixOfMaze = initialMatrix(this.columns, this.rows)
      this.boardHeight = (this.rows + 3) * SHIELD_SIZE
      this.isReady = false
    }

    this.board = new PainterBuilder({
      canvas: this.$canvas,
      columns: this.columns,
      rows: this.rows,
      matrixOfMaze: this.matrixOfMaze,
      width: this.boardWidth,
      height: this.boardHeight,
      gameIsReady: this.isReady,
      fogOfWar: this.fogOfWar,
      emitFinishMaze: this.emit
    })

    this.player = new Player({
      position: {
        x: SHIELD_SIZE,
        y: SHIELD_SIZE
      },
      matrix: this.matrixOfMaze,
      emitMove: meta => {
        this.emitter.emit('move', meta)
      },
      emitWall: () => {
        this.emitter.emit('wallFound')
      }
    })
    this.board.addPlayer(this.player)
    if (this.isReady) {
      this.addElementToRandomPos('passiveExitImage')  // есть шанс что итем не добавится
      this.addElementToRandomPos('keyImage')
      this.addElementToRandomPos('trapImage', 3)
      // this.addElementToRandomPos('ropeImage') не Добавлен функционал
    }
    ////////////////////////
    // Нужно сделать добавление событий при выполнении условия старта игры в мультиплеере и в ручной генерации лабиринта
    ////////////////////////
    this.unsubs.push(this.emitter.subscribe('move', player => {
      this.board.updatePlayerMeta(player)
    }))
  }

  saveLocalTitles(titles) {
    this.localTitles = titles
  }

  get myTitle() {
    return this.localTitles.find(el => el.type === this.type).node
  }

  get opponentTitle() {
    return this.localTitles.find(el => el.type !== this.type).node
  }

  setTitleStatus(isOpponent) {
    const candidate = isOpponent ? 'player' : this.type
    const count = Game.availableToMove[candidate]
    const title = isOpponent ? this.opponentTitle : this.myTitle
    const message = count ? `Пропуск ${count} ${count === 1 ? 'хода' : 'ходов'}` : ''
    this.setLocalStatus(message, title)
  }

  addElementToRandomPos(element, number = 1) {
    for (let i = 0; i < number; i++) {
      const pos = randomIndexes(this.columns, this.rows)
      if (!this.board.addGameElement(element, pos)) {
        for (const arPos of aroundPos(pos.row, pos.col)) {
          if (this.board.addGameElement(element, arPos)) break
        }
      }
    }
  }

  chekGameElement() {

    const currentPlayerPosition = this.player.positionIndexes
    const gameElement = this.board.getCurrentGameElement(currentPlayerPosition)
    switch (gameElement) {
      case 'activeExitImage':
        // Game Over
        this.exitAction(true)
        Game.availableToMove.gameBlocked = true
        setTimeout(() => {
          window.location.reload()
        }, 1000)
        break
      case 'passiveExitImage':
        this.exitAction(false, currentPlayerPosition)
        break
      case 'keyImage':
        // Message that key found and switch exitBlock
        if (!this.inventory.includes('keyImage')) {
          this.keyAction()
          this.addItemToInv('keyImage')
          this.board.unlockExit()
        }
        break
      case 'ropeImage':
        // Message that you found a rope
        const rope = 'ropeImage:' + this.player.positionIndexes.toString()
        if (!this.inventory.includes(rope)) {
          this.ropeAction()
          this.addItemToInv(rope)
        }
        break
      case 'trapImage':
        // Message that you was took in trap
        const trap = 'trapImage:' + JSON.stringify(this.player.positionIndexes)
        if (!this.inventory.includes(trap)) {
          this.trapAction()
          this.addItemToInv(trap)
        }
        break
    }
    this.board.on()
  }

  exitAction() {
    throw new Error('keyAction must be override in subclass')
  }

  keyAction() {
    throw new Error('keyAction must be override in subclass')
  }

  ropeAction() {
    throw new Error('ropeAction must be override in subclass')
  }

  trapAction() {
    throw new Error('trapAction must be override in subclass')
  }

  addItemToInv(item) {
    this.inventory.push(item)
    this.board.updateInventory(item)
  }
}