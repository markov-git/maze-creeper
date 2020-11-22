import './styles/index.css'
import {initMaze} from '@core/mazeGenerator/MazeGenerator'
import {Painter} from '@core/painter/Painter'
import {Game} from "@core/Game/Game";

const $app = document.querySelector('#app')
const $canvas = document.createElement('canvas')
$app.appendChild($canvas)

const cols = 10
const rows = 10

const firstBoard = new Game({cols, rows}, $canvas)
firstBoard.init()