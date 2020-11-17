import {BOTTOM_WALL_CHANCE, RIGHT_WALL_CHANCE} from "@core/constants";

export class MazeCell {
    static initId = 0

    constructor(x, y) {
        this.id = MazeCell.initId++
        this.x = x
        this.y = y
        this.border = {
            right: false,
            top: false,
            left: false,
            bottom: false,
        }
        return this
    }

    createRandomRightWall(isRandom = true) {
        this.border.right = Math.random() < RIGHT_WALL_CHANCE || !isRandom
    }

    createRandomBottomWall() {
        if (Math.random() < BOTTOM_WALL_CHANCE) {
            this.border.bottom = true
            return true
        }
        return false
    }

    removeWall(side) {
        if (this.border.hasOwnProperty(side)) {
            this.border[side] = false
        } else {
            console.warn('Такой стороны у ячейки нет:', side)
        }
    }
}