export function fillMatrix(matrix, val) {
    return matrix.map(row => {
        return row.map(_ => val)
    })
}

export function invertMatrix(matrix) {
    return matrix.map(row => {
        return row.map(val => !val)
    })
}