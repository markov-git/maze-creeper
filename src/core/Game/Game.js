import {initMaze} from "@core/mazeGenerator/MazeGenerator"
import {Painter} from "@core/painter/Painter"
import {Player} from "@core/Game/Player"
import {SHIELD_SIZE} from "@core/constants"
import {toMatrix} from "@core/utils"
import {Emitter} from "@core/Emitter";

export class Game {
    constructor({cols, rows}, $canvas) {
        this.maze = initMaze(cols, rows)
        this.columns = this.maze[0].length * 2 + 1
        this.rows = this.maze.length * 2 + 1
        this.matrixOfMaze = toMatrix(this.maze, this.columns, this.rows)
        this.boardWidth = this.columns * SHIELD_SIZE
        this.boardHeight = this.rows * SHIELD_SIZE
        this.$canvas = $canvas
        this.emitter = new Emitter()
    }

    init() {
        this.board = new Painter(this.$canvas, {
            columns: this.columns,
            rows: this.rows,
            matrixOfMaze: this.matrixOfMaze,
            boardWidth: this.boardWidth,
            boardHeight: this.boardHeight
        })

        this.board.init()

        this.unsub = this.emitter.subscribe('move', player => {
            this.board.updatePlayerMeta(player)
        })

        document.addEventListener('keydown', event => {
            event.preventDefault()
            switch (event.key) {
                case 'ArrowRight':
                    this.player.move({
                        x: SHIELD_SIZE,
                        y: 0
                    })
                    break
                case 'ArrowUp':
                    this.player.move({
                        x: 0,
                        y: -SHIELD_SIZE
                    })
                    break
                case 'ArrowLeft':
                    this.player.move({
                        x: -SHIELD_SIZE,
                        y: 0
                    })
                    break
                case 'ArrowDown':
                    this.player.move({
                        x: 0,
                        y: SHIELD_SIZE
                    })
                    break
            }
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

        this.board.on(this.player)

    }
}