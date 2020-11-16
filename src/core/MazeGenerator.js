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

    createRightWalls(row) {
        this.grid[row]
            .forEach((cell, index, arr) => {
                if (index && !this.hasPreviousCellRightWall(index, arr)) {
                    cell.id = arr[index - 1].id
                }
                cell.createRandomRightWall()
            })
    }

    createBottomWall(pos) {
        const row = this.grid[pos]
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

    generate() {
        this.createRightWalls(this.generatingRowPos)
        this.createBottomWall(this.generatingRowPos)
        return this.grid
    }

}

export function initMaze(cols, rows) {
    return new MazeGenerator(cols, rows).generate()
}