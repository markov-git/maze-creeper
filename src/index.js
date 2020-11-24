import './styles/index.css'
import {initMaze} from '@core/mazeGenerator/MazeGenerator'
import {Painter} from '@core/painter/Painter'
import {Game} from "@core/Game/Game";

const $app = document.querySelector('#app')
const $canvas = document.createElement('canvas')
$app.appendChild($canvas)

const cols = 5
const rows = 5

const firstBoard = new Game({cols, rows}, $canvas)
firstBoard.init()