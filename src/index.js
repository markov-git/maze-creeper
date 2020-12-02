import './styles/index.css'
import {Game} from "@core/Game/Game";

const $app = document.querySelector('#app')
const $canvas1 = document.createElement('canvas')
$app.appendChild($canvas1)

const cols = 5
const rows = 5

const firstBoard = new Game({cols, rows}, $canvas1, true)
