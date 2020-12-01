import {initMaze} from "@core/mazeGenerator/MazeGenerator"
import {Painter} from "@core/painter/Painter"
import {Player} from "@core/Game/Player"
import {SHIELD_SIZE} from "@core/constants"
import {initialMatrix, toMatrix} from "@core/utils"
import {Emitter} from "@core/Emitter";
import {PainterBuilder} from "@core/painter/PainterBuilder";

export class Game {
    constructor({cols, rows}, $canvas, random) {
        this.maze = initMaze(cols, rows)
        this.columns = this.maze[0].length * 2 + 1
        this.rows = this.maze.length * 2 + 1
        if (random) {
            this.matrixOfMaze = toMatrix(this.maze, this.columns, this.rows)
            this.boardWidth = this.columns * SHIELD_SIZE
            this.boardHeight = this.rows * SHIELD_SIZE
            this.isReady = random
        } else {
            this.matrixOfMaze = initialMatrix(this.columns, this.rows)
            this.boardWidth = this.columns * SHIELD_SIZE
            this.boardHeight = this.rows * SHIELD_SIZE + 3 * SHIELD_SIZE
            this.isReady = random
        }
        this.$canvas = $canvas
        this.emitter = new Emitter()

        this.init()
    }

    init() {
        this.board = new PainterBuilder(this.$canvas, {
            columns: this.columns,
            rows: this.rows,
            matrixOfMaze: this.matrixOfMaze,
            boardWidth: this.boardWidth,
            boardHeight: this.boardHeight,
            gameIsReady: this.isReady
        })
        this.board.init()

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


        ////////////////////////
        // Нужно сделать добавление событий при условии старта игры
        ////////////////////////
        this.unsub = this.emitter.subscribe('move', player => {
            this.board.updatePlayerMeta(player)
        })
        this.addEventListeners()
        ////////////////////////

        this.board.on(this.player)
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