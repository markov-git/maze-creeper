import {Painter} from "@core/painter/Painter";
import {SHIELD_SIZE} from "@core/constants";
import {aroundPos, freeSpaceMatrix, localCoords, testInside} from "@core/painter/painter.coordinats";
import {fillMatrix, invertMatrix} from "@core/painter/painter.matrixLogic";

export class PainterBuilder extends Painter {
    constructor(canvas, props) {
        super(canvas, props)
        this.gameIsReady = props.gameIsReady
        if (!this.gameIsReady) {
            this.spaceMatrix = freeSpaceMatrix(this.matrixOfMaze)
            this.initBuilder()
        } else {
            this.pathMatrix = invertMatrix(this.matrixOfMaze)
        }
    }

    prepare() {
        this.clear()
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                if (this.matrixOfMaze[y][x]) {
                    this.context.drawImage(this.wallImage,
                        x * SHIELD_SIZE, y * SHIELD_SIZE)
                }
                if (this.pathMatrix[y][x]) {
                    this.context.drawImage(this.pathImage,
                        x * SHIELD_SIZE, y * SHIELD_SIZE)
                }
            }
        }
    }

    on() {
        this.prepare()
        if (this.gameIsReady) {
            this.updatePlayer()
            this.drawFog()
        } else {
            this.drawInterface()
            if (this.interfaceWall.clicked) {
                this.drawFreePositions()
            }
            if (this.checkIsGeneratedMaze()) {
                this.canvas.removeEventListener('click', this.onclick)
                this.interfaceWall.clicked = false
                this.gameIsReady = true
                this.canvas.height = this.canvas.height - 3 * SHIELD_SIZE
            }
        }
        window.requestAnimationFrame(this.on.bind(this))
    }

    drawInterface() {
        this.context.drawImage(this.pathImage,
            this.interfaceWall.x, this.interfaceWall.y)
        if (this.interfaceWall.clicked) {
            this.applyColor('red')
            this.context.lineWidth = 2
            this.context.strokeRect(this.interfaceWall.x, this.interfaceWall.y,
                this.interfaceWall.width, this.interfaceWall.height)
        }
    }

    drawFreePositions() {
        for (let row = 1; row < this.spaceMatrix.length - 1; row++) {
            for (let col = 1; col < this.spaceMatrix[row].length - 1; col++) {
                if (this.spaceMatrix[row][col]) {
                    this.applyColor(this.regionColor)
                    this.context.fillRect(col * SHIELD_SIZE, row * SHIELD_SIZE,
                        SHIELD_SIZE, SHIELD_SIZE)
                    this.context.lineWidth = 2
                    this.context.strokeStyle = 'black'
                    this.context.strokeRect(col * SHIELD_SIZE + 2, row * SHIELD_SIZE + 2,
                        SHIELD_SIZE - 4, SHIELD_SIZE - 4)
                }
            }
        }
    }

    initBuilder() {
        this.interfaceWall = {
            x: SHIELD_SIZE,
            y: (this.rows + 1) * SHIELD_SIZE,
            width: SHIELD_SIZE,
            height: SHIELD_SIZE,
            clicked: false
        }
        this.onclick = event => {
            const mousePos = localCoords(this.canvas, event)
            if (testInside(mousePos, this.interfaceWall)) {
                this.interfaceWall.clicked = !this.interfaceWall.clicked
            }
            if (this.interfaceWall.clicked) {
                this.updateMatrix(mousePos)
            }
        }
        this.canvas.addEventListener('click', this.onclick)
    }

    updateMatrix(mousePos) {
        const rect = {
            x: SHIELD_SIZE,
            y: SHIELD_SIZE,
            width: (this.columns - 2) * SHIELD_SIZE,
            height: (this.rows - 2) * SHIELD_SIZE
        }
        if (testInside(mousePos, rect)) {
            const col = Math.floor(mousePos.x / SHIELD_SIZE)
            const row = Math.floor(mousePos.y / SHIELD_SIZE)

            if (this.spaceMatrix[row][col]) {
                this.pathMatrix[row][col] = true

                this.recalculateSpaces()
            }
        }
    }

    recalculateSpaces() {
        const factureOfSpaces = fillMatrix(this.spaceMatrix, 0)
        this.spaceMatrix = fillMatrix(this.spaceMatrix, false)
        for (let row = 0; row < this.spaceMatrix.length; row++) {
            for (let col = 0; col < this.spaceMatrix[row].length; col++) {
                if (this.pathMatrix[row][col]) {
                    aroundPos(row, col).forEach(pos => {
                        if (!this.pathMatrix[pos.row][pos.col]) {
                            factureOfSpaces[pos.row][pos.col]++
                            this.matrixOfMaze[pos.row][pos.col] =
                                factureOfSpaces[pos.row][pos.col] > 1 || this.matrixOfMaze[pos.row][pos.col]
                            this.spaceMatrix[pos.row][pos.col] = factureOfSpaces[pos.row][pos.col] < 2
                        }
                    })
                }
            }
        }

        for (let row = 1; row < this.matrixOfMaze.length - 1; row++) {
            for (let col = 1; col < this.matrixOfMaze[row].length - 1; col++) {
                let b = true
                aroundPos(row, col).forEach(pos => {
                    b = b ? this.matrixOfMaze[pos.row][pos.col] : b
                })
                if (b) {
                    this.matrixOfMaze[row][col] = b
                }
            }
        }
    }

    checkIsGeneratedMaze() {
        let res = true
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                if (!this.matrixOfMaze[row][col] && !this.pathMatrix[row][col]) res = false
            }
        }
        return res
    }
}
