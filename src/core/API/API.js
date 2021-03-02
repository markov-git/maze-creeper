const URLS = {
  SSE_URL: '/sse/init',
  NEW_ROOM: '/sse/newRoom',
  NEW_STATE: `/sse/newState`,
  GET_ROOMS: key => `/sse/info/${key}`,
  CONNECT: '/sse/connect'
}

const POST_OPTIONS = body => ({
  headers: {
    'Content-Type': 'application/json'
  },
  method: 'POST',
  body: JSON.stringify(body)
})

class API {
  constructor() {
    this.eventSource = new EventSource(URLS.SSE_URL)
    this.key = null
    this.roomID = null
    this.name = null
    this.pass = null
    this.initListeners()
  }

  initListeners() {
    const handlers = {
      open: () => {
        console.log('connected to server')
      },
      error: () => {
        console.warn('sse error')
      },
      mess: e => {
        console.log('sse message: ', e.data)
      },
      room: e => {
        console.log('rooms: ', e.data)
      },
      json: e => {
        console.log('state: ', e.data)
      },
      key: e => {
        this.key = e.data
      },
      roomID: e => {
        this.roomID = e.data
      }
    }

    Object.keys(handlers).forEach(key => {
      this.eventSource.addEventListener(key, handlers[key])
    })
  }

  async createNewRoom(name, pass) {
    try {
      this.checkKey()
      await fetch(URLS.NEW_ROOM, POST_OPTIONS({name, pass, key: this.key}))
      this.name = name
      this.pass = pass
    } catch (e) {
      console.warn('error with creating room', e)
    }
  }

  async sendNewState(state) {
    try {
      this.checkKey()
      this.checkRoomId()
      this.checkPass()
      await fetch(URLS.NEW_STATE, POST_OPTIONS({data: state, id: this.roomID, pass: this.pass, key: this.key}))
    } catch (e) {
      console.warn('error with sending state', e)
    }
  }

  async connectToRoom(roomID, pass) {
    try {
      this.checkKey()
      await fetch(URLS.CONNECT, POST_OPTIONS({id: roomID, pass, key: this.key}))
      this.roomID = roomID
    } catch (e) {
      console.warn(e)
    }
  }

  async getFreeRooms() {
    try {
      this.checkKey()
      await fetch(URLS.GET_ROOMS(this.key))
    } catch (e) {
      console.warn(e)
    }
  }

  checkPass() {
    if (!this.pass) throw new Error('pass is undefined')
  }

  checkRoomId() {
    if (!this.roomID) throw new Error('roomID is undefined')
  }

  checkKey() {
    if (!this.key) throw new Error('key is undefined')
  }

  close() {
    this.eventSource.close()
  }
}

