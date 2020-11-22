import {SHIELD_SIZE} from "@core/constants";
import {translateToCenter} from "@core/utils";

export class Player {
    constructor(prop, matrix) {
        this.position = {x: prop.x, y: prop.y}
        this.centerPosition = translateToCenter(this.position)
        this.path = [this.position]
        this.cavasProp = {
            width: prop.width,
            height: prop.height,
            columns: prop.columns,
            raws: prop.raws
        }
        this.matrix = matrix
        this.emitMove = prop.emitMove
    }

    move(dPos) {
        this.position.x += dPos.x
        this.position.y += dPos.y
        this.centerPosition = translateToCenter(this.position)
        this.path.push(this.position)

        this.emitMove(this)
    }

    draw(action) {
        action(this.centerPosition.x, this.centerPosition.y,
            SHIELD_SIZE / 3, true, 'red')
    }

    showWays(action) {
        const availablePos = []
        const shieldSize = this.cavasProp.height / this.cavasProp.raws
        const rightPos = {x: this.position.x + SHIELD_SIZE, y: this.position.y}
        const topPos = {x: this.position.x, y: this.position.y - SHIELD_SIZE}
        const leftPos = {x: this.position.x - SHIELD_SIZE, y: this.position.y}
        const bottomPos = {x: this.position.x, y: this.position.y + SHIELD_SIZE}

        const y = Math.floor(this.centerPosition.y / shieldSize)
        const x = Math.floor(this.centerPosition.x / shieldSize)

        if (!this.matrix[y][x + 1]) availablePos.push(rightPos)
        if (!this.matrix[y - 1][x]) availablePos.push(topPos)
        if (!this.matrix[y][x - 1]) availablePos.push(leftPos)
        if (!this.matrix[y + 1][x]) availablePos.push(bottomPos)

        action(availablePos, 'rgb(48,105,49, 0.5)')
    }
}