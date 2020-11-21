import {SHIELD_SIZE} from "@core/constants";

export class Player {
    constructor(pos) {
        this.position = pos
        this.path = [this.position]
    }
    move(dPos) {
        this.position.x += dPos.x
        this.position.y += dPos.y
        this.path.push(this.position)
    }
    draw(action) {
        action(this.position.x, this.position.y,
            SHIELD_SIZE/3, true, 'red')
    }
}