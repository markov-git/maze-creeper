import {Emitter} from '@core/Emitter'
import BotGame from '@core/Game/BotGame'
import PlayerGame from '@core/Game/PlayerGame'
import NetworkGame from '@core/Game/NetworkGame'
import {createLobby} from '@core/Multiplayer/Lobby'
import {GAME_MODE_BOT, GAME_MODE_NETWORK, GAME_MODE_PLAYER} from './constants'

const POPUP_TIMEOUT = 2000

class Main {
  constructor() {
    this.$app = document.querySelector('#app')
    this.$status = document.querySelector('#status')
    this.$optionContainer = document.querySelector('#option-container')
    this.$popup = document.querySelector('#popup')

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
      const gameMode = this.botMode.checked ? GAME_MODE_BOT : GAME_MODE_PLAYER
      this.runGame(+size, gameMode, this.autoMode.checked)
    })
  }

  runGame(size, gameMode, autoMode) {  // (размер, с ботом, автогенерация)
    if (gameMode === GAME_MODE_BOT) {
      this.$optionContainer.style.display = 'none'
      this.$app.style.display = 'flex'
    }

    if (gameMode === GAME_MODE_BOT && autoMode) { // против бота с автогенерацией лабиринта
      this.createGameBoard({
        size: {cols: size, rows: size},
        random: autoMode,
        fogOfWar: true,
        gameMode: GAME_MODE_PLAYER
      })
      this.createGameBoard({
        size: {cols: size, rows: size},
        random: autoMode,
        fogOfWar: false,
        gameMode: GAME_MODE_BOT
      })
      this.$status.innerHTML = 'Игра началась. Ход игрока...'
      for (const game of this.games) {
        game.saveLocalTitles(this.localTitles)
      }
      this.unsubs.push(this.emitter.subscribe('nextStep', () => {
        // открыть возможность хода другого игрока
        this.games[1].makeBotMove()
      }))
    } else if (gameMode === GAME_MODE_BOT && !autoMode) { // против бота с ручной генерацией лабиринта
      this.emitter.subscribe('maze-finished', mazeMatrix => {
        this.$app.innerHTML = ''
        this.createGameBoard({
          size: {cols: size, rows: size},
          random: true,
          fogOfWar: true,
          gameMode: GAME_MODE_PLAYER
        })
        this.createGameBoard({
          size: {cols: size, rows: size},
          random: true,
          fogOfWar: false,
          gameMode: GAME_MODE_BOT,
          mazeMatrix
        })
      })

      // need to refactor
      const emit = (mazeMatrix) => {
        return this.emitter.emit('maze-finished', mazeMatrix)
      }

      this.createGameBoard({
        size: {cols: size, rows: size},
        random: autoMode,
        fogOfWar: true,
        gameMode: GAME_MODE_PLAYER,
        mazeMatrix: false,
        emit
      })
      this.$status.innerHTML = 'Игра началась. Ход игрока...'
    } else {  // против другого игрока
      const $popupTitle = this.$popup.querySelector('h2')
      const showPopup = (type, message) => {
        switch (type) {
          case 'error': {
            this.$popup.style.borderLeftColor = 'darkred'
            this.$popup.style.boxShadow = '0 0 15px red'
            break
          }
          default: {
            this.$popup.style.borderLeftColor = 'darkgreen'
            this.$popup.style.boxShadow = '0 0 15px darkgreen'
          }
        }

        $popupTitle.innerText = message.toString()
        this.$popup.style.right = '50px'
        setTimeout(() => {
          this.$popup.style.right = '-100%'
          $popupTitle.innerText = ''
        }, POPUP_TIMEOUT)
      }
      const initGame = (sendNewState, newSize, subscribeToState) => {
        this.$app.innerHTML = ''
        this.createGameBoard({
          size: {cols: newSize, rows: newSize},
          random: autoMode,
          fogOfWar: true,
          gameMode: GAME_MODE_PLAYER,
          sendNewState,
          vsMode: GAME_MODE_NETWORK
        })
        this.createGameBoard({
          size: {cols: newSize, rows: newSize},
          random: autoMode,
          fogOfWar: false,
          gameMode: GAME_MODE_NETWORK,
          subscribeToState
        })
        this.$optionContainer.style.display = 'none'
        this.$app.style.display = 'flex'
      }
      createLobby(this.$optionContainer, showPopup, initGame, size)
    }
  }

  createGameBoard(props) {
    const $div = document.createElement('div')
    $div.classList.add('gameBoard')
    const $title = document.createElement('h2')
    $title.classList.add('unselectable')
    $title.innerHTML = props.gameMode === GAME_MODE_BOT ? 'Поле противника' : 'Твое поле'
    const $canvas = document.createElement('canvas')
    $div.appendChild($title)
    $div.appendChild($canvas)
    this.$app.appendChild($div)

    this.localTitles.push({node: $title, type: props.gameMode === GAME_MODE_BOT ? 'bot' : 'player'})

    const emitNextPlayer = () => {
      this.emitter.emit('nextStep')
    }

    const setStatus = message => {
      this.$status.innerHTML = message
    }

    const setLocalStatus = (message = '', node = $title) => {
      if (message === '') {
        node.innerHTML = props.gameMode === GAME_MODE_BOT ? 'Твое поле' : 'Поле противника'
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
    switch (props.gameMode) {
      case GAME_MODE_BOT: {
        game = new BotGame(game)
        break
      }
      case GAME_MODE_PLAYER: {
        game = new PlayerGame(game)
        break
      }
      case GAME_MODE_NETWORK: {
        game = new NetworkGame(game)
        break
      }
    }
    this.games.push(game)
  }
}

export function main() {
  return new Main()
}