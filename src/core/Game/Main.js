import {Game} from "@core/Game/Game"
import {autoMode, chooseMode, sizeMode} from "@core/templates/chooseForms"
import {Emitter} from "@core/Emitter"

class Main {
  constructor() {
    this.$app = document.querySelector('#app')
    this.$status = document.querySelector('#status')
    this.unsubs = []
    this.games = []
    this.emitter = new Emitter()
  }

  chooseGame() {
    this.$app.insertAdjacentHTML('beforeend', chooseMode())
    this.addModeListeners()
  }

  pvpMode() {
    this.PVEmode = false
    this.removeModeListeners()
    this.$app.insertAdjacentHTML('beforeend', sizeMode())
    this.addSizeListener()
  }

  pveMode() {
    this.PVEmode = true
    this.removeModeListeners()
    this.$app.insertAdjacentHTML('beforeend', sizeMode())
    this.addSizeListener()
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
        this.createGameBoard(this.size, autoMode, true, false)
        this.createGameBoard(this.size, autoMode, false, true)
      } else if (this.PVEmode && !autoMode) { // против бота с ручной генерацией лабиринта
        this.emitter.subscribe('maze-finished', mazeMatrix => {
          this.$app.innerHTML = ''
          this.createGameBoard(this.size, true, true, false)
          this.createGameBoard(this.size, true, false, true, mazeMatrix)
        })
        const emit = function (mazeMatrix) {
          return this.emitter.emit('maze-finished', mazeMatrix)
        }
        this.createGameBoard(this.size, autoMode, true, false, false, emit.bind(this))
      } else {  // против другого игрока
        this.$app.insertAdjacentHTML('beforeend', `
                <h1>ERROR</h1>
                <div>Sorry, now it's doesn't work :(</div>
            `)
      }
      this.unsubs.push(this.emitter.subscribe('nextStep', () => {
        // открыть возможность хода другого игрока
        this.games[1].makeBotMove()
      }))

      this.setStatus('Игра началась. Ход игрока...')
    }
  }

  addModeListeners() {
    this.pvpMode = this.pvpMode.bind(this)
    this.pveMode = this.pveMode.bind(this)
    this.$app.querySelector('#pvp')?.addEventListener('click', this.pvpMode)
    this.$app.querySelector('#pve').addEventListener('click', this.pveMode)
  }

  removeModeListeners() {
    this.$app.querySelector('#pvp')?.removeEventListener('click', this.pvpMode)
    this.$app.querySelector('#pve').removeEventListener('click', this.pveMode)
    this.$app.innerHTML = ''
  }

  createGameBoard(size, genMode, fogMode, botMode, mazeMatrix, emit) {
    const $div = document.createElement('div')
    $div.classList.add('gameBoard')
    const $title = document.createElement('h2')
    $title.innerHTML = botMode ? 'Поле противника' : 'Твое поле'
    const $canvas = document.createElement('canvas')
    $div.appendChild($title)
    $div.appendChild($canvas)
    this.$app.appendChild($div)

    const emitNextPlayer = () => {
      this.emitter.emit('nextStep')
    }

    Game.localHeaders.push($title)
    function setLocalStatus(message = '', node = $title) {
      if (message==='') {
        node.innerHTML = botMode ? 'Поле противника' : 'Твое поле'
        node.style.color = 'black'
      } else {
        node.innerHTML = message
        node.style.color = 'darkred'
      }
    }

    const game = new Game(size, size,
      $canvas,
      genMode, fogMode, botMode, mazeMatrix,
      emit, this.setStatus.bind(this), emitNextPlayer, setLocalStatus)
    this.games.push(game)
  }

  setStatus(message) {
    this.$status.innerHTML = message
  }
}

export function main() {
  return new Main()
}