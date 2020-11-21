export function toMatrix(mazeConfig, sizeX, sizeY) {
    const config = normalizeConfig(mazeConfig)
    const matrix = []
    matrix.push(new Array(sizeX).fill(true))
    for (let y = 1; y < sizeY - 1; y++) {
        const matrixRaw = new Array(sizeX - 2)
            .fill(false)
            .map((_, index) => config[y - 1][index])
        matrix.push([true, ...matrixRaw, true])
    }
    matrix.push(new Array(sizeX).fill(true))
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