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

    createRandomRightWall() {
        if (Math.random() < RIGHT_WALL_CHANCE) {
            this.border.right = true
        }
    }

    createRandomBottomWall() {
        if (Math.random() < BOTTOM_WALL_CHANCE) {
            this.border.bottom = true
            return true
        }
        return false
    }
}