export function toMatrix(mazeConfig, sizeX, sizeY) {
    const config = normalizeConfig(mazeConfig)
    const matrix = []
    let curRaw = 0
    let curCell = 0
    matrix.push(new Array(sizeX).fill(true))

    for (let y = 1; y < sizeY - 1; y++) {
        const matrixRaw = new Array(sizeX - 2)
            .fill(false)
            .map((value, index, array) => {
                    return  config[y-1][index]
            })
        curCell = 0
        matrix.push([true, ...matrixRaw, true])
        if (y%2!==0) {
            curRaw++
        }
    }
    matrix.push(new Array(sizeX).fill(true))
    return matrix
}
function normalizeConfig(config){
    const configure = []
    for (const raw of config){
        const curRaw = []
        const underRaw = []
        for (const cell of raw){
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