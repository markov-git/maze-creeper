import {Game} from '@core/Game/Game'
import NetworkPainter from '@core/painter/NetworkPainter'
import {SHIELD_SIZE} from '@core/constants'

export default class NetworkGame extends Game {
  constructor(props) {
    super(props)
  }

  init() {
    this.columns = this.rows = this.size.cols * 2 + 1
    this.boardWidth = this.columns * SHIELD_SIZE
    this.boardHeight = this.rows * SHIELD_SIZE

    this.board = new NetworkPainter({
      subscribeToState: this.subscribeToState,
      canvas: this.$canvas,
      columns: this.columns,
      rows: this.rows,
      matrixOfMaze: [],
      width: this.boardWidth,
      height: this.boardHeight,
      gameIsReady: true,
      fogOfWar: false
    })
  }

  stateHandler(state) {
    this.matrixOfMaze = state.matrixOfMaze
    this.pathMatrix = state.pathMatrix
    this.matrixOfGameElements = state.matrixOfGameElements
    this.player = state.player
    this.matrixOfFog = state.matrixOfFog
  }
}