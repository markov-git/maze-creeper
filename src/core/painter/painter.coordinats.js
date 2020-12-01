export function localCoords(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    }
}

export function testInside({x, y}, rect) {
    return x >= rect.x
        && x <= rect.x + rect.width
        && y >= rect.y
        && y <= rect.y + rect.height
}

export function freeSpaceMatrix(matrixOfMaze) {
    const matrix = []
    for (let row = 0; row < matrixOfMaze.length; row++) {
        matrix.push(matrixOfMaze[row].map(cell => !cell))
    }
    return matrix
}

export function aroundPos(row, col) {
    return [
        // {row: [row - 1], col: [col - 1]},
        {row: [row - 1], col: [col]},
        // {row: [row - 1], col: [col + 1]},
        {row: [row], col: [col - 1]},
        {row: [row], col: [col + 1]},
        // {row: [row + 1], col: [col - 1]},
        {row: [row + 1], col: [col]},
        // {row: [row + 1], col: [col + 1]}
        ]
}
