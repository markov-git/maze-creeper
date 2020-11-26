import {Painter} from "@core/painter/Painter";
import {ANIMATE_SPEED, DRAG_OFFSET, SHIELD_SIZE} from "@core/constants";
import {localCoords, testInside} from "@core/painter/painter.coordinats";

export class PainterBuilder extends Painter {
    constructor(canvas, props) {
        super(canvas, props)
        this.gameIsReady = props.gameIsReady

        this.state = {
            mouse: {
                x: 0, y: 0,
                sx: 0, sy: 0,
                dx: 0, dy: 0,
                down: false
            },
            ondrag: false
        }

        if (!this.gameIsReady) {


            this.initBuilder()
        }
    }

    on() {
        this.prepare()

        if (this.gameIsReady) {
            this.updatePlayer()

            this.drawFog()
        } else {
            this.drawInterface()
        }

        window.requestAnimationFrame(this.on.bind(this))
    }

    drawInterface() {
        this.context.drawImage(this.wallImage,
            SHIELD_SIZE,
            (this.rows + 1) * SHIELD_SIZE)
    }

    initBuilder() {
        this.metaWall = {
            speed: ANIMATE_SPEED,
            dragOffset: DRAG_OFFSET,
            rect: {x: SHIELD_SIZE, y: (this.rows + 1) * SHIELD_SIZE},
            current: {x: SHIELD_SIZE, y: (this.rows + 1) * SHIELD_SIZE},
            target: null,
            animateTo: null,
            snapped: true,
            beforeMoved: null,
            animateDone: false,
            isDragging: false
        }

        const unSub = this.ondrag.bind(this)

        document.addEventListener('mousedown', (event) => {
            this.state.mouse.down = true
            const {x, y} = localCoords(this.canvas, event)
            this.state.mouse.sx = x
            this.state.mouse.sy = y
            this.state.mouse.x = x
            this.state.mouse.y = y
            this.drag()

            document.addEventListener('mousemove', unSub)
        })

        document.addEventListener('mouseup', (event) => {
            this.state.mouse.down = false

            if (this.state.draging) {
                this.state.draging = null
            }

            this.state.mouse.dx = 0
            this.state.mouse.dy = 0

            document.removeEventListener('mousemove', unSub)
        })
    }

    drag() {
        const x = this.state.mouse.x
        const y = this.state.mouse.y
        this.state.draging = null

        if (testInside({x, y}, this.metaWall.current)) {
            this.state.draging = this.metaWall
        }

        if (this.state.draging) {
            this.state.draging.isDragging = true
            this.state.draging.snapped = true
            this.state.draging.beforeMoved = {...this.state.draging.current}
        }
    }

    ondrag(event) {
        const {x, y} = localCoords(this.canvas, event)

        this.state.mouse.x = x
        this.state.mouse.y = y

        console.log(this.state.mouse)
        if (this.state.mouse.down) {
            this.state.mouse.dx = x - this.state.mouse.sx
            this.state.mouse.dy = y - this.state.mouse.sy
        }
    }
}