import {MazeCell} from "@core/MazeCell";

class MazeGenerator {
    constructor(cols, rows) {
        this.cols = cols
        this.rows = rows
        this.grid = this.initGrid()
        this.generatingRowPos = 0
    }

    initGrid() {
        return new Array(this.rows)
            .fill([])
            .map(this.createRow.bind(this))
    }

    createRow(_, y) {
        return new Array(this.cols)
            .fill({})
            .map((cell, index) => new MazeCell(index, y))
    }

    generateFirstRaw(rowNum) {
        this.createRightWallsOfFirstRaw(rowNum)
        this.createBottomWall(rowNum)
    }

    createRightWallsOfFirstRaw(rowNum) {
        this.grid[rowNum]
            .forEach((cell, index, arr) => {
                if (index && !this.hasPreviousCellRightWall(index, arr)) {
                    cell.id = arr[index - 1].id
                }
                cell.createRandomRightWall()
            })
    }

    createBottomWall(rowNum) {
        const row = this.grid[rowNum]
        const spaces = this.countsOfFreeSpacesInRow(row)
        row.forEach(cell => {
            if (spaces[cell.id] > 1) {
                if (cell.createRandomBottomWall()) {
                    spaces[cell.id] -= 1
                }
            }
        })
    }

    countsOfFreeSpacesInRow(row) {
        const ids = new Set()
        row.forEach(cell => ids.add(cell.id))
        const state = {}
        for (const id of ids) {
            state[id] = row.reduce((sum, val) => {
                if (val.id === id) {
                    return sum + 1
                }
                return sum
            }, 0)
        }
        return state
    }

    hasPreviousCellRightWall(index, arr) {
        return arr[index - 1].border.right
    }

    copyPreviousRowIDs(from, to) {
        this.grid[from].forEach((cell, index) => {
            if (!cell.border.bottom) {
                this.grid[to][index].id = cell.id
            }
        })
    }

    generateRaw(rowNum) {
        this.createRightWalls(rowNum)
        this.createBottomWall(rowNum)
    }

    createRightWalls(rowNum) {
        this.grid[rowNum]
            .forEach((cell, index, arr) => {
                if (index && !this.hasPreviousCellRightWall(index, arr)) {
                    cell.id = arr[index - 1].id
                }
                let isRandomNextWall = !(index + 1 < arr.length && cell.id === arr[index + 1].id)
                cell.createRandomRightWall(isRandomNextWall)
            })
    }

    removeEndBorders() {
        for (const row of this.grid) {
            for (const cell of row) {
                if (cell.x === this.cols - 1) cell.removeWall('right')
                if (cell.y === this.rows - 1) cell.removeWall('bottom')
            }
        }
    }

    correctLastRaw() {
        this.grid[this.rows - 1].forEach((cell, index, array) => {
            if (index + 1 < this.cols && cell.id !== array[index + 1].id) {
                cell.removeWall('right')
            }
        })
    }

    generate() {
        this.generateFirstRaw(this.generatingRowPos)
        for (let y = 1; y < this.rows; y++) {
            this.copyPreviousRowIDs(this.generatingRowPos, ++this.generatingRowPos)
            this.generateRaw(this.generatingRowPos)
        }
        this.correctLastRaw()
        this.removeEndBorders()
        return this.grid
    }

}

export function initMaze(cols, rows) {
    return new MazeGenerator(cols, rows).generate()
}