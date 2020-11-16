import './styles/index.css'
import {initMaze} from '@core/MazeGenerator'


const cols = 10
const rows = 2
const maze = initMaze(cols, rows)
// console.log(maze)
//just for testing
const cells = document.querySelectorAll('.cell')
const normCells = [
    [cells[0], cells[1], cells[2], cells[3], cells[4], cells[5], cells[6], cells[7], cells[8], cells[9]],
    [cells[10], cells[11], cells[12], cells[13], cells[14], cells[15], cells[16], cells[17], cells[18], cells[19]]
]

for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
        if (maze[y][x].border.right){
            normCells[y][x].style.borderRight = 'black solid 3px'
        }
        if (maze[y][x].border.bottom){
            normCells[y][x].style.borderBottom = 'black solid 3px'
        }
        normCells[y][x].innerHTML = maze[y][x].id
    }
}