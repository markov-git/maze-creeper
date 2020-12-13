import {SHIELD_SIZE} from "@core/constants"
import {fillMatrix} from "@core/painter/painter.matrixLogic";

export class Painter {
    constructor(canvas, {columns, rows, matrixOfMaze, boardWidth, boardHeight}) {
        this.canvas = canvas
        this.context = this.canvas.getContext('2d')
        this.columns = columns
        this.rows = rows
        this.matrixOfMaze = matrixOfMaze
        this.matrixOfFog = Painter.generateMatrixOfFog(matrixOfMaze)
        this.matrixOfGameElements = fillMatrix(matrixOfMaze, '')
        this.width = this.canvas.width = boardWidth
        this.height = this.canvas.height = boardHeight
        this.regionColor = 'rgb(48,105,49, 0.5)'
        this.pathColor = 'black'
        this.images = {
            wallImage: 'img/wall32.png',
            pathImage: 'img/floor32.png',
            activeExitImage: 'img/aExit32.png',
            passiveExitImage: 'img/pExit32.png'
        }
        this.imageWaiter = []
        this.pathMatrix = new Array(this.rows).fill('').map(_ => new Array(this.columns).fill(false))
    }

    static generateMatrixOfFog(matrix) {
        return matrix.map((row, y, rows) => {
            if (y !== 0 && y !== rows.length - 1) {
                return row.map((_, x, cells) => x !== 0 && x !== cells.length - 1)
            } else {
                return row.map(_ => false)
            }
        })
    }

    async init() {
        this.initImages()
        await Promise.all(this.imageWaiter).then(this.prepare.bind(this))
    }

    prepare() {
        this.clear()
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                if (this.matrixOfMaze[y][x]) {
                    this.context.drawImage(this.images.wallImage,
                        x * SHIELD_SIZE, y * SHIELD_SIZE)
                } else {
                    this.context.drawImage(this.images.pathImage,
                        x * SHIELD_SIZE, y * SHIELD_SIZE)
                }
            }
        }
    }

    on() {
        this.prepare()
        this.updatePlayer()
        this.drawFog()
        window.requestAnimationFrame(this.on.bind(this))
    }

    updatePlayer() {
        this.drawPlayerPath()
        this.drawPlayer()
    }

    clear() {
        this.context.fillStyle = '#928fa4'
        this.context.fillRect(0, 0, this.width, this.height)
    }

    addPlayer(player) {
        this.player = player
        this.removeSomeFog()
    }

    updatePlayerMeta(player) {
        this.player = player
        this.removeSomeFog()
    }

    addGameElement(element, pos) {
        if (this.matrixOfGameElements[pos.row][pos.col] === '' && !this.matrixOfMaze[pos.row][pos.col]) {
            this.matrixOfGameElements[pos.row][pos.col] = element
            this.pathMatrix[pos.row][pos.col] = false
            return true
        } else return false
    }

    removeSomeFog() {
        const xIndex = this.player.positionIndexes.x
        const yIndex = this.player.positionIndexes.y
        this.matrixOfFog[yIndex][xIndex] = false
        const walls = this.player.foundedWalls
        if (walls) {
            walls.forEach(wall => {
                this.matrixOfFog[wall.y][wall.x] = false
            })
        }
    }

    drawFog() {
        this.applyColor('slategrey')
        for (let y = 0; y < this.matrixOfFog.length; y++) {
            for (let x = 0; x < this.matrixOfFog[y].length; x++) {
                if (this.matrixOfFog[y][x]) {
                    this.context.beginPath()
                    this.context.fillRect(x * SHIELD_SIZE, y * SHIELD_SIZE, SHIELD_SIZE, SHIELD_SIZE)
                    this.context.closePath()
                }
            }
        }
    }

    drawPlayerPath() {
        const path = this.player.path
        if (path.length > 1) {
            this.applyColor(this.pathColor)
            this.context.lineCap = "round"
            this.context.setLineDash([10, 12])
            this.context.lineWidth = 3
            this.context.beginPath()
            this.context.moveTo(path[0].x, path[0].y)
            for (let step = 1; step < path.length; step++) {
                this.context.lineTo(path[step].x, path[step].y)
            }
            this.context.stroke()
            this.context.closePath()
        }
    }

    drawPlayer() {
        this.applyColor(this.player.color)
        this.context.beginPath()
        this.context.arc(this.player.centerPosition.x, this.player.centerPosition.y,
            SHIELD_SIZE / 3, 0, Math.PI * 2)
        this.context.closePath()
        this.context.fill()
    }

    applyColor(color) {
        this.context.fillStyle = this.context.strokeStyle = color
    }

    initImages() {
        for (const key of Object.keys(this.images)) {
            const src = this.images[key]
            this.images[key] = new Image()
            this.images[key].src = src
            this.imageWaiter.push(new Promise(resolve => {
                this.images[key].addEventListener('load', resolve)
            }))
        }
    }
}