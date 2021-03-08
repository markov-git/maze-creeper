const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''
const URLS = {
  SSE_URL: `${BASE_URL}/sse/init`,
  NEW_ROOM: `${BASE_URL}/sse/newRoom`,
  NEW_STATE: `${BASE_URL}/sse/newState`,
  GET_ROOMS: key => `${BASE_URL}/sse/info/${key}`,
  CONNECT: `${BASE_URL}/sse/connect`,
  REMOVE: `${BASE_URL}/sse/remove`,
}

const POST_OPTIONS = body => ({
  headers: {
    'Content-Type': 'application/json'
  },
  method: 'POST',
  body: JSON.stringify(body)
})

export default class API {
  constructor() {
    this.key = null
    this.roomID = null
    this.name = null
    this.pass = null
    this.rooms = []
    this.eventHandlers = new Map()
  }

  connectToServer() {
    this.eventSource = new EventSource(URLS.SSE_URL)
    this.initListeners()
  }

  subscribeToEvent(event, cb) {
    this.eventHandlers.set(event, cb)
  }

  unSubscribeToEvent(event) {
    this.eventHandlers.delete(event)
  }

  initListeners() {
    const handlers = {
      open: () => {
        console.log('connected to server')
      },
      close: () => {
        console.log('connection closed')
      },
      error: () => {
        console.warn('sse error')
      },
      message: e => {
        console.log('sse message: ', e.data)
      },
      json: e => {
        console.log('state: ', e.data)
      },
      key: async e => {
        this.key = e.data
        await this.getFreeRooms()
      },
      roomID: e => {
        console.log('new roomID', e.data)
        this.roomID = e.data
      },
      rooms: e => {
        let counter = 1
        console.log(e.data)
        this.rooms = JSON.parse(e.data).map(room => {
          if (!room.name) room.name = `Игра ${counter}`
          room.id = counter++
          return room
        })
        const handler = this.eventHandlers.get('rooms')
        handler(this.rooms)
      }
    }

    Object.keys(handlers).forEach(key => {
      this.eventSource.addEventListener(key, handlers[key])
    })
  }

  getRoomById(id) {
    return this.rooms.find(room => room.id === +id)
  }

  async createRoom(name, pass, nick) {
    try {
      this.checkKey()
      await fetch(URLS.NEW_ROOM, POST_OPTIONS({name, pass, nick, key: this.key}))
      this.name = name
      this.pass = pass
      this.nick = nick

      window.addEventListener('beforeunload', this.close.bind(this))
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

  async connectRoom(roomID, pass) {
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

  async close() {
    try {
      this.checkRoomId()
      await fetch(URLS.REMOVE, POST_OPTIONS({id: this.roomID, key: this.key}))
      this.eventSource.close()
    } catch (e) {
      console.warn(e)
    }
  }
}