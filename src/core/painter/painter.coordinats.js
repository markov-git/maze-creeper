import {SHIELD_SIZE} from "@core/constants";

export function localCoords(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    }
}

export function testInside({x, y}, currentPos) {
    const x1 = currentPos.x
    const y1 = currentPos.y
    const x2 = x1 + SHIELD_SIZE
    const y2 = y1 + SHIELD_SIZE

    return x > x1 && x < x2 && y > y1 && y < y2
}