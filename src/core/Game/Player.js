import {SHIELD_SIZE} from "@core/constants";
import {translateToCenter} from "@core/utils";

export class Player {
    constructor(prop, matrix) {
        this.position = {x: prop.x, y: prop.y}
        this.centerPosition = translateToCenter(this.position)
        this.path = [this.centerPosition]
        this.foundedWalls = []
        this.matrix = matrix
        this.emitMove = prop.emitMove
        this.color = 'red'
        this.testPosition()
    }

    testPosition() {
        if (this.matrix[this.positionIndexes.y][this.positionIndexes.x]) {
            if (!this.matrix[this.positionIndexes.y][this.positionIndexes.x + 1]) {
                this.position.x += SHIELD_SIZE
                this.centerPosition = translateToCenter(this.position)
            } else {
                this.position.y += SHIELD_SIZE
                this.centerPosition = translateToCenter(this.position)
            }
            this.path[0] = this.centerPosition
        }
    }

    move(dPos) {
        const nextX = Player.getPositionIndex(this.centerPosition.x + dPos.x)
        const nextY = Player.getPositionIndex(this.centerPosition.y + dPos.y)
        if (!this.matrix[nextY][nextX]) {
            this.position.x += dPos.x
            this.position.y += dPos.y
            this.centerPosition = translateToCenter(this.position)
            this.path.push(this.centerPosition)
        } else {
            this.addWall({x: this.centerPosition.x + dPos.x, y: this.centerPosition.y + dPos.y})
            // dev
            console.log(`Oh it's a wall, opponent's move`)
        }
        this.emitMove(this)
    }

    addWall(pos) {
        if (!this.foundedWalls.map(pos => JSON.stringify(pos)).includes(JSON.stringify(pos))) {
            this.foundedWalls.push({
                x: Player.getPositionIndex(pos.x),
                y: Player.getPositionIndex(pos.y)
            })
        }
    }

    static getPositionIndex(pos) {
        return Math.floor(pos / SHIELD_SIZE)
    }

    get positionIndexes() {
        return {
            x: Player.getPositionIndex(this.centerPosition.x),
            y: Player.getPositionIndex(this.centerPosition.y)
        }
    }
}