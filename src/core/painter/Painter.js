import {SHIELD_SIZE} from "@core/constants";
import {toMatrix} from "@core/utils";

export class Painter {
    constructor(canvas, initialMaze) {
        this.canvas = canvas
        this.context = this.canvas.getContext('2d')
        this.initialMaze = initialMaze
        this.sizeX = (this.initialMaze[0].length * 2 + 1)
        this.sizeY = (this.initialMaze.length * 2 + 1)
        this.width = this.canvas.width = this.sizeX * SHIELD_SIZE
        this.height = this.canvas.height = this.sizeY * SHIELD_SIZE
        this.images = {
            img: [
                {
                    name: 'wallImage',
                    src: 'img/wall32.png'
                },
            ],
            prep: []
        }
        this.init()
    }

    init() {
        this.initImages()
        Promise.all(this.images.prep).then(this.prepare.bind(this))
    }

    prepare() {
        this.clear()


        for (let y = 0; y < this.sizeY; y++) {
            for (let x = 0; x < this.sizeX; x++) {
                if (toMatrix(this.initialMaze, this.sizeX, this.sizeY)[y][x]) {
                    this.context.drawImage(this.images.img[0].image, x * SHIELD_SIZE, y * SHIELD_SIZE)
                }
            }
        }
    }

    on() {
        // this.context.clearRect(0, 0, this.width, this.height)

        window.requestAnimationFrame(this.on)
    }

    clear() {
        this.context.fillStyle = "#928fa4"
        this.context.fillRect(0, 0, this.width, this.height)
    }

    initImages() {
        for (const image of this.images.img) {
            this.images.prep.push(new Promise((resolve => {
                image.image = new Image()
                image.image.src = image.src
                image.image.addEventListener('load', resolve)
            })))
        }
    }
}