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

export function initMatrix(matrix) {
  return matrix.map((row, y) => {
    if (y === 0 || y === matrix.length - 1) {
      return row.map(() => 'wall')
    } else {
      return row.map((ell, x) => {
        if (x === 0 || x === row.length - 1) {
          return 'wall'
        } else {
          return ell
        }
      })
    }
  })
}