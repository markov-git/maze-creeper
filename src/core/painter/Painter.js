import {SHIELD_SIZE} from "@core/constants"

export class Painter {
    constructor(canvas, {columns, rows, matrixOfMaze, boardWidth, boardHeight}) {
        this.canvas = canvas
        this.context = this.canvas.getContext('2d')

        this.sizeX = columns
        this.sizeY = rows
        this.matrixOfMaze = matrixOfMaze
        this.width = this.canvas.width = boardWidth
        this.height = this.canvas.height = boardHeight

        this.wallImage = 'img/wall32.png'
        this.imageWaiter = []
    }

    async init() {
        this.initImages()


        await Promise.all(this.imageWaiter).then(this.prepare.bind(this))
    }

    prepare() {
        this.clear()
        for (let y = 0; y < this.sizeY; y++) {
            for (let x = 0; x < this.sizeX; x++) {
                if (this.matrixOfMaze[y][x]) {
                    this.context.drawImage(this.wallImage,
                        x * SHIELD_SIZE, y * SHIELD_SIZE)
                }
            }
        }
    }

    on() {
        this.prepare()

        this.updatePlayer()

        window.requestAnimationFrame(this.on.bind(this))
    }

    updatePlayer() {
        this.player.draw(this.createPlayer.bind(this))
        this.player.showWays(this.createWayRegion.bind(this))
    }

    clear() {
        this.context.fillStyle = '#928fa4'
        this.context.fillRect(0, 0, this.width, this.height)
    }

    addPlayer(player) {
        this.player = player
    }

    updatePlayerMeta(player) {
        this.player = player
    }

    createPlayer(x, y, rad, fill, color) {
        this.applyColor(color)
        this.context.beginPath()
        this.context.arc(x, y, rad, 0, Math.PI * 2)
        this.context.closePath()
        fill ? this.context.fill() : this.context.stroke()
    }

    createWayRegion(regions, color) {
        this.applyColor(color)
        for (const region of regions) {
            this.context.beginPath()
            this.context.fillRect(region.x, region.y, SHIELD_SIZE, SHIELD_SIZE)
            this.context.closePath()
        }
    }

    applyColor(color) {
        this.context.fillStyle = this.context.strokeStyle = color
    }

    initImages() {
        const src = this.wallImage
        this.wallImage = new Image()
        this.wallImage.src = src
        this.imageWaiter.push(new Promise(resolve => {
            this.wallImage.addEventListener('load', resolve)
        }))
    }
}