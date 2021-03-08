import {Emitter} from '@core/Emitter'
import BotGame from '@core/Game/BotGame'
import PlayerGame from '@core/Game/PlayerGame'
import {createLobby} from '@core/Multiplayer/Lobby'

class Main {
  constructor() {
    this.$app = document.querySelector('#app')
    this.$status = document.querySelector('#status')
    this.$optionContainer = document.querySelector('#option-container')

    this.playerMode = this.$optionContainer.querySelector('#player-checkbox input')
    this.botMode = this.$optionContainer.querySelector('#bot-checkbox input')
    this.autoMode = this.$optionContainer.querySelector('#auto-checkbox input')
    this.handleMode = this.$optionContainer.querySelector('#handle-checkbox input')

    this.unsubs = []
    this.games = []
    this.localTitles = []
    this.emitter = new Emitter()
    this.initListeners()
  }

  initListeners() {
    this.playerMode.addEventListener('click', () => this.botMode.checked = !this.botMode.checked)
    this.botMode.addEventListener('click', () => this.playerMode.checked = !this.playerMode.checked)
    this.autoMode.addEventListener('click', () => this.handleMode.checked = !this.handleMode.checked)
    this.handleMode.addEventListener('click', () => this.autoMode.checked = !this.autoMode.checked)
  }

  chooseGameOptions() {
    const $form = this.$optionContainer.querySelector('form')
    $form.addEventListener('submit', e => {
      e.preventDefault()
      const {value: size} = $form.querySelector('input[name="size"]:checked')
      this.runGame(+size, this.botMode.checked, this.autoMode.checked)

    })
  }

  runGame(size, botMode, autoMode) {  // (размер, с ботом, автогенерация)
    if (botMode) {
      this.$optionContainer.style.display = 'none'
      this.$app.style.display = 'flex'
    }

    if (botMode && autoMode) { // против бота с автогенерацией лабиринта
      this.createGameBoard({
        size: {cols: size, rows: size},
        random: autoMode,
        fogOfWar: true,
        botMode: false
      })
      this.createGameBoard({
        size: {cols: size, rows: size},
        random: autoMode,
        fogOfWar: false,
        botMode: true
      })
      this.$status.innerHTML = 'Игра началась. Ход игрока...'
      for (const game of this.games) {
        game.saveLocalTitles(this.localTitles)
      }
      this.unsubs.push(this.emitter.subscribe('nextStep', () => {
        // открыть возможность хода другого игрока
        this.games[1].makeBotMove()
      }))
    } else if (botMode && !autoMode) { // против бота с ручной генерацией лабиринта
      this.emitter.subscribe('maze-finished', mazeMatrix => {
        this.$app.innerHTML = ''
        this.createGameBoard({
          size: {cols: size, rows: size},
          random: true,
          fogOfWar: true,
          botMode: false
        })
        this.createGameBoard({
          size: {cols: size, rows: size},
          random: true,
          fogOfWar: false,
          botMode: true,
          mazeMatrix
        })
      })

      // need to refactor
      const emit = function (mazeMatrix) {
        return this.emitter.emit('maze-finished', mazeMatrix)
      }

      this.createGameBoard({
        size: {cols: size, rows: size},
        random: autoMode,
        fogOfWar: true,
        botMode: false,
        mazeMatrix: false,
        emit: emit.bind(this)
      })
      this.$status.innerHTML = 'Игра началась. Ход игрока...'
    } else {  // против другого игрока
       createLobby(this.$optionContainer, this.$status)
    }
  }

  createGameBoard(props) {
    const $div = document.createElement('div')
    $div.classList.add('gameBoard')
    const $title = document.createElement('h2')
    $title.classList.add('unselectable')
    $title.innerHTML = props.botMode ? 'Поле противника' : 'Твое поле'
    const $canvas = document.createElement('canvas')
    $div.appendChild($title)
    $div.appendChild($canvas)
    this.$app.appendChild($div)

    this.localTitles.push({node: $title, type: props.botMode ? 'bot' : 'player'})

    const emitNextPlayer = () => {
      this.emitter.emit('nextStep')
    }

    const setStatus = message => {
      this.$status.innerHTML = message
    }

    const setLocalStatus = (message = '', node = $title) => {
      if (message === '') {
        node.innerHTML = props.botMode ? 'Твое поле' : 'Поле противника'
        node.style.color = '#ccc'
      } else {
        node.innerHTML = message
        node.style.color = 'darkred'
      }
    }

    let game = {
      $canvas,
      setStatus,
      emitNextPlayer,
      setLocalStatus,
      ...props
    }
    game = props.botMode ? new BotGame(game) : new PlayerGame(game)

    this.games.push(game)
  }
}

export function main() {
  return new Main()
}