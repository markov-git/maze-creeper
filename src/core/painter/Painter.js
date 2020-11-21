import {SHIELD_SIZE} from "@core/constants";
import {toMatrix} from "@core/utils";
import {Player} from "@core/painter/Player";

export class Painter {
    constructor(canvas, initialMaze) {
        this.canvas = canvas
        this.context = this.canvas.getContext('2d')
        this.initialMaze = initialMaze
        this.sizeX = (this.initialMaze[0].length * 2 + 1)
        this.sizeY = (this.initialMaze.length * 2 + 1)
        this.matrixOfMaze = toMatrix(this.initialMaze, this.sizeX, this.sizeY)
        this.width = this.canvas.width = this.sizeX * SHIELD_SIZE
        this.height = this.canvas.height = this.sizeY * SHIELD_SIZE
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
        this.player = new Player({x:SHIELD_SIZE*1.5, y:SHIELD_SIZE*1.5})

        this.player.draw(this.createCircle.bind(this))
    }

    clear() {
        this.context.fillStyle = "#928fa4"
        this.context.fillRect(0, 0, this.width, this.height)
    }

    createCircle(x, y, rad, fill, color) {
        this.context.fillStyle = this.context.strokeStyle = color;
        this.context.beginPath();
        this.context.arc(x, y, rad, 0, Math.PI * 2);
        this.context.closePath();
        fill ? this.context.fill() : this.context.stroke();
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