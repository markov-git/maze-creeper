import {autoMode, chooseMode, sizeMode} from '@core/templates/chooseForms'
import {Emitter} from '@core/Emitter'
import BotGame from '@core/Game/BotGame'
import PlayerGame from '@core/Game/PlayerGame'

class Main {
  constructor() {
    this.$app = document.querySelector('#app')
    this.$status = document.querySelector('#status')
    this.unsubs = []
    this.games = []
    this.localTitles = []
    this.emitter = new Emitter()
  }

  chooseGame() {
    this.$app.insertAdjacentHTML('beforeend', chooseMode())
    this.addModeListeners()
  }

  addSizeListener() {
    this.autoMaze = this.autoMaze.bind(this)
    this.$app.addEventListener('click', this.autoMaze)
  }

  autoMaze(event) {
    this.size = Number(event.target.dataset.size)
    if (this.size) {
      this.$app.removeEventListener('click', this.autoMaze)
      this.$app.innerHTML = ''
      this.$app.insertAdjacentHTML('beforeend', autoMode())
      this.runGame = this.runGame.bind(this)
      this.$app.addEventListener('click', this.runGame)
    }
  }

  runGame(event) {
    if (event.target.tagName === 'P') {
      const autoMode = event.target.dataset.option === 'auto'
      this.$app.removeEventListener('click', this.runGame)
      this.$app.innerHTML = ''

      if (this.PVEmode && autoMode) { // против бота с автогенерацией лабиринта
        this.createGameBoard({
          size: {cols: this.size, rows: this.size},
          random: autoMode,
          fogOfWar: true,
          botMode: false
        })
        this.createGameBoard({
          size: {cols: this.size, rows: this.size},
          random: autoMode,
          fogOfWar: false,
          botMode: true
        })
      } else if (this.PVEmode && !autoMode) { // против бота с ручной генерацией лабиринта
        this.emitter.subscribe('maze-finished', mazeMatrix => {
          this.$app.innerHTML = ''
          this.createGameBoard({
            size: {cols: this.size, rows: this.size},
            random: true,
            fogOfWar: true,
            botMode: false
          })
          this.createGameBoard({
            size: {cols: this.size, rows: this.size},
            random: true,
            fogOfWar: false,
            botMode: true,
            mazeMatrix
          })
        })
        const emit = function (mazeMatrix) {
          return this.emitter.emit('maze-finished', mazeMatrix)
        }

        this.createGameBoard({
          size: {cols: this.size, rows: this.size},
          random: autoMode,
          fogOfWar: true,
          botMode: false,
          mazeMatrix: false,
          emit: emit.bind(this)
        })
      } else {  // против другого игрока
        this.$app.insertAdjacentHTML('beforeend', `
                <h1>ERROR</h1>
                <div>Sorry, now it's doesn't work :(</div>
            `)
      }
      for (const game of this.games) {
        game.saveLocalTitles(this.localTitles)
      }
      this.unsubs.push(this.emitter.subscribe('nextStep', () => {
        // открыть возможность хода другого игрока
        this.games[1].makeBotMove()
      }))
      this.$status.innerHTML = 'Игра началась. Ход игрока...'
    }
  }

  addModeListeners() {
    this.pvpMode = () => {
      this.PVEmode = false
      this.removeModeListeners()
      this.$app.insertAdjacentHTML('beforeend', sizeMode())
      this.addSizeListener()
    }
    this.pveMode = () => {
      this.PVEmode = true
      this.removeModeListeners()
      this.$app.insertAdjacentHTML('beforeend', sizeMode())
      this.addSizeListener()
    }
    this.$app.querySelector('#pvp')?.addEventListener('click', this.pvpMode)
    this.$app.querySelector('#pve').addEventListener('click', this.pveMode)
  }

  removeModeListeners() {
    this.$app.querySelector('#pvp')?.removeEventListener('click', this.pvpMode)
    this.$app.querySelector('#pve').removeEventListener('click', this.pveMode)
    this.$app.innerHTML = ''
  }

  createGameBoard(props) {
    const $div = document.createElement('div')
    $div.classList.add('gameBoard')
    const $title = document.createElement('h2')
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
        node.style.color = 'black'
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