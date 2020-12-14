import {Game} from "@core/Game/Game";
import {autoMode, chooseMode, sizeMode} from "@core/templates/chooseForms";
import {Emitter} from "@core/Emitter";

class Main {
    constructor() {
        this.$app = document.querySelector('#app')
        this.gameBoards = {
            count: 0,
            $cnv: []
        }
        this.emitter = new Emitter()
    }

    chooseGame() {
        this.$app.insertAdjacentHTML('beforeend', this.modeTemplate)
        this.addModeListeners()
    }

    pvpMode() {
        this.PVEmode = false
        this.removeModeListeners()
        this.$app.insertAdjacentHTML('beforeend', this.sizeTemplate)
        this.addSizeListener()
    }

    pveMode() {
        this.PVEmode = true
        this.removeModeListeners()
        this.$app.insertAdjacentHTML('beforeend', this.sizeTemplate)
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
            this.$app.insertAdjacentHTML('beforeend', this.autoTemplate)
            this.runGame = this.runGame.bind(this)
            this.$app.addEventListener('click', this.runGame)
        }
    }

    runGame(event) {
        if (event.target.tagName === 'P') {
            const autoMode = event.target.dataset.option === 'auto'
            this.$app.removeEventListener('click', this.runGame)
            this.$app.innerHTML = ''

            if (this.PVEmode && autoMode) {
                this.createGameBoard(this.size, autoMode, true, false)
                this.createGameBoard(this.size, autoMode, false, true)
            } else if (this.PVEmode && !autoMode) {
                this.emitter.subscribe('maze-finished', mazeMatrix => {
                    this.$app.innerHTML = ''
                    this.createGameBoard(this.size, true, true, false)
                    this.createGameBoard(this.size, true, false, true, mazeMatrix)
                })
                const emit = function (mazeMatrix) {
                    return this.emitter.emit('maze-finished', mazeMatrix)
                }
                this.createGameBoard(this.size, autoMode, true, false, false, emit.bind(this))
            } else {
                this.$app.insertAdjacentHTML('beforeend', `
                <h1>ERROR</h1>
                <div>Sorry, now it's doesn't work :(</div>
            `)
            }
        }
    }

    addModeListeners() {
        this.pvpMode = this.pvpMode.bind(this)
        this.pveMode = this.pveMode.bind(this)
        this.$app.querySelector('#pvp').addEventListener('click', this.pvpMode)
        this.$app.querySelector('#pve').addEventListener('click', this.pveMode)
    }

    removeModeListeners() {
        this.$app.querySelector('#pvp').removeEventListener('click', this.pvpMode)
        this.$app.querySelector('#pve').removeEventListener('click', this.pveMode)
        this.$app.innerHTML = ''
    }

    get modeTemplate() {
        return chooseMode()
    }

    get sizeTemplate() {
        return sizeMode()
    }

    get autoTemplate() {
        return autoMode()
    }

    createGameBoard(size, genMode, fogMode, botMode, mazeMatrix, emit) {
        const $canvas = document.createElement('canvas')
        this.gameBoards.count++
        this.gameBoards.$cnv.push($canvas)
        this.$app.appendChild($canvas)
        new Game(size, size, $canvas, genMode, fogMode, botMode, mazeMatrix, emit)
    }
}

export function main() {
    return new Main()
}