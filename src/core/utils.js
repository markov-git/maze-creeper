import {SHIELD_SIZE} from "@core/constants";

export function toMatrix(mazeConfig, cols, rows) {
    const config = normalizeConfig(mazeConfig)
    const matrix = []
    matrix.push(new Array(cols).fill(true))
    for (let y = 1; y < rows - 1; y++) {
        const matrixRaw = new Array(cols - 2)
            .fill(false)
            .map((_, index) => config[y - 1][index])
        matrix.push([true, ...matrixRaw, true])
    }
    matrix.push(new Array(cols).fill(true))
    return matrix
}

function normalizeConfig(config) {
    const configure = []
    for (const raw of config) {
        const curRaw = []
        const underRaw = []
        for (const cell of raw) {
            curRaw.push(false)
            curRaw.push(cell.border.right)
            underRaw.push(cell.border.bottom)
            underRaw.push(true)
        }
        configure.push(curRaw)
        configure.push(underRaw)
    }
    return configure
}

export function initialMatrix(cols, rows) {
    return new Array(rows).fill(new Array(cols).fill(false)).map((ell, index) => {
        if (index === 0 || index === rows - 1) {
            return ell.map(_ => true)
        } else {
            return ell.map((cell, i) => {
                return i === 0 || i === cols - 1;
            })
        }
    })
}

export function translateToCenter(pos) {
    return {x: pos.x + SHIELD_SIZE * 0.5, y: pos.y + SHIELD_SIZE * 0.5}
}