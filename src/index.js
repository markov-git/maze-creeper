import './styles/index.css'
import {initMaze} from '@core/MazeGenerator'


const cols = 15
const rows = 15
const maze = initMaze(cols, rows)

const $app = document.querySelector('#app')
const normCells = []

const container = document.createElement('div')
container.className = 'container'

for (let y = 0; y<rows;y++) {
    const $row = document.createElement('div')
    $row.className = 'row'
    const tempRow = []
    for (let x = 0; x < cols; x++) {
        const cell = document.createElement('div')
        cell.className = 'cell'
        $row.appendChild(cell)
        tempRow.push(cell)
    }
    container.appendChild($row)
    normCells.push(tempRow)
}
container.style.width = cols * 50 + 'px'
container.style.border = 'black solid 2px'
$app.appendChild(container)

for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
        if (maze[y][x].border.right) {
            normCells[y][x].style.borderRight = 'black solid 3px'
        }
        if (maze[y][x].border.bottom) {
            normCells[y][x].style.borderBottom = 'black solid 3px'
        }
        // normCells[y][x].innerHTML = maze[y][x].id
    }
}