import URLS from './api.constants'

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
    const subscribers = this.eventHandlers.get(event) || []
    this.eventHandlers.set(event, [...subscribers, cb])
  }

  unSubscribeToEvent(event) {
    this.eventHandlers.delete(event)
  }

  initListeners() {
    const action = {
      open: () => {
        console.log('connected to server')
      },
      connected: e => {
        this.unSubscribeToEvent('rooms')
        const handlers = this.eventHandlers.get('connected') ?? []
        handlers.forEach(fn => fn())
      },
      close: () => {
        console.log('connection closed')
      },
      error: e => {
        const handlers = this.eventHandlers.get('error') ?? []
        handlers.forEach(fn => fn(e.data))
      },
      message: e => {
        const handlers = this.eventHandlers.get('message') ?? []
        handlers.forEach(fn => fn(e.data))
      },
      start: e => {
        const handlers = this.eventHandlers.get('message') ?? []
        handlers.forEach(fn => fn('Игра началась!'))
        const startHandlers = this.eventHandlers.get('start') ?? []
        startHandlers.forEach(fn => fn({
          sendNewState: this.sendNewState.bind(this),
          size: JSON.parse(e.data)
        }))
      },
      json: e => {
        const handlers = this.eventHandlers.get('json') ?? []
        handlers.forEach(fn => fn(JSON.parse(e.data)))
      },
      key: async e => {
        this.key = e.data
        await this.getFreeRooms()
      },
      roomID: e => {
        this.roomID = e.data
      },
      rooms: e => {
        let counter = 1
        this.rooms = JSON.parse(e.data).map(room => {
          if (!room.name) room.name = `Игра ${counter}`
          room.id = counter++
          return room
        })
        const handlers = this.eventHandlers.get('rooms') ?? []
        handlers.forEach(fn => fn(this.rooms))
      }
    }
    Object.keys(action).forEach(key => {
      this.eventSource.addEventListener(key, action[key])
    })
  }

  getRoomById(id) {
    return this.rooms.find(room => room.id === +id)
  }

  async createRoom(name, pass, nick, size) {
    try {
      this.checkKey()
      await fetch(URLS.NEW_ROOM, POST_OPTIONS({name, pass, nick, key: this.key, size}))
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
