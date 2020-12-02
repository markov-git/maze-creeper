import {SHIELD_SIZE} from "@core/constants"

export class Painter {
    constructor(canvas, {columns, rows, matrixOfMaze, boardWidth, boardHeight}) {
        this.canvas = canvas
        this.context = this.canvas.getContext('2d')
        this.columns = columns
        this.rows = rows
        this.matrixOfMaze = matrixOfMaze
        this.matrixOfFog = Painter.generateMatrixOfFog(matrixOfMaze)
        this.width = this.canvas.width = boardWidth
        this.height = this.canvas.height = boardHeight
        this.regionColor = 'rgb(48,105,49, 0.5)'
        this.pathColor = 'black'
        this.wallImage = 'img/wall32.png'
        this.pathImage = 'img/floor32.png'
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
                    this.context.drawImage(this.wallImage,
                        x * SHIELD_SIZE, y * SHIELD_SIZE)
                } else {
                    this.context.drawImage(this.pathImage,
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
        const srcWall = this.wallImage
        this.wallImage = new Image()
        this.wallImage.src = srcWall
        this.imageWaiter.push(new Promise(resolve => {
            this.wallImage.addEventListener('load', resolve)
        }))
        const srcFloor = this.pathImage
        this.pathImage = new Image()
        this.pathImage.src = srcFloor
        this.imageWaiter.push(new Promise(resolve => {
            this.pathImage.addEventListener('load', resolve)
        }))
    }
}