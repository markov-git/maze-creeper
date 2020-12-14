import {initMaze} from "@core/mazeGenerator/MazeGenerator"
import {Player} from "@core/Game/Player"
import {SHIELD_SIZE} from "@core/constants"
import {initialMatrix, toMatrix} from "@core/utils"
import {Emitter} from "@core/Emitter";
import {PainterBuilder} from "@core/painter/PainterBuilder";
import {aroundPos} from "@core/painter/painter.coordinats";

export class Game {
    constructor(cols, rows, $canvas, random, fogOfWar, botMode, mazeMatrix, emit) {
        this.maze = initMaze(cols, rows)
        this.readyMaze = mazeMatrix
        this.columns = this.maze[0].length * 2 + 1
        this.rows = this.maze.length * 2 + 1
        this.fogOfWar = fogOfWar
        this.botMode = botMode
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
                width: this.boardWidth,
                height: this.boardHeight,
                columns: this.columns,
                raws: this.rows,
                emitMove: meta => {
                    this.emitter.emit('move', meta)
                }
            }, this.matrixOfMaze)
        this.board.addPlayer(this.player)
        if (this.isReady) {
            this.addElementsToRandomPos()
        }
        ////////////////////////
        // Нужно сделать добавление событий при выполнении условия старта игры
        ////////////////////////
        if (!this.botMode) {
            this.unsubs.push(this.emitter.subscribe('move', player => {
                this.board.updatePlayerMeta(player)
            }))
            this.addEventListeners()
        }
        ////////////////////////

        this.board.on(this.player)
    }

    addElementsToRandomPos() {
        const col = 4 + Math.floor(Math.random() * (this.columns - 5))
        const row = 4 + Math.floor(Math.random() * (this.rows - 5))
        if (!this.board.addGameElement('passiveExitImage', {col, row})) {
            for (const arPos of aroundPos(row, col)) {
                if (this.board.addGameElement('passiveExitImage', {row: arPos.row[0], col: arPos.col[0]})) break
            }
        }

    }

    addEventListeners() {
        document.addEventListener('keydown', event => {
            switch (event.key) {
                case 'ArrowRight':
                    this.player.move({
                        x: SHIELD_SIZE,
                        y: 0
                    })
                    event.preventDefault()
                    break
                case 'ArrowUp':
                    this.player.move({
                        x: 0,
                        y: -SHIELD_SIZE
                    })
                    event.preventDefault()
                    break
                case 'ArrowLeft':
                    this.player.move({
                        x: -SHIELD_SIZE,
                        y: 0
                    })
                    event.preventDefault()
                    break
                case 'ArrowDown':
                    this.player.move({
                        x: 0,
                        y: SHIELD_SIZE
                    })
                    event.preventDefault()
                    break
            }
        })
    }
}