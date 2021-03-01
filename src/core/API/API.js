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

  async createNewRoom() {
    try {
      if (this.key) {
        await fetch(URLS.NEW_ROOM, POST_OPTIONS({name: 'name', pass: '1234', key: this.key}))
      } else {
        // return new Error('key is undefined')
      }
    } catch (e) {
      console.warn('error with creating room',e)
    }
  }

  async sendNewState() {
    try {
      if (this.key) {
        await fetch(URLS.NEW_STATE, POST_OPTIONS({data: sendData.value, id: myRoomID, pass: '1234', key: this.key}))
      } else {
        // return new Error('key is undefined')
      }
    } catch (e) {
      console.warn('error with sending state', e)
    }
  }

  close() {
    this.eventSource.close()
  }
}

