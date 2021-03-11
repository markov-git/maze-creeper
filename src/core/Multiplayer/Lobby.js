import API from '@core/API/API'
import {
  lobbyRowTemplates,
  lobbyTemplate,
  modalConnectTemplate,
  modalCreateTemplate,
  statusRowTemplate
} from './lobby.template'

const api = new API()
const CHOSEN_CLASS = 'chosen'
let chosenGameId = null

export function createLobby(domContainer, showPopup, initGame) {
  domContainer.innerHTML = lobbyTemplate()
  api.connectToServer()
  const btns = {
    create: domContainer.querySelector('#create'),
    connect: domContainer.querySelector('#connect')
  }
  const lobbyBody = document.querySelector('#lobby-body')

  const choseGameHandler = e => {
    lobbyBody.querySelectorAll('tbody tr')
      .forEach(tr => tr.classList.remove(CHOSEN_CLASS))
    if (e.target.dataset.id) {
      chosenGameId = e.target.dataset.id
      const chosenRow = lobbyBody.querySelector(`[data-id="${chosenGameId}"]`)
      chosenRow.classList.add(CHOSEN_CLASS)
    } else {
      chosenGameId = null
    }
  }

  const removeListener = () => lobbyBody.removeEventListener('click', choseGameHandler)

  lobbyBody.addEventListener('click', choseGameHandler)
  Object.keys(apiHandlers).forEach(key => {
    api.subscribeToEvent(key, e => apiHandlers[key](e, {
      showPopup,
      lobbyBody,
      removeListener,
      initGame
    }))
  })
  Object.keys(btns).forEach(key => {
    btns[key].addEventListener('click', () => actions[key]({
      dom: domContainer,
      btns,
      showPopup,
      lobbyBody,
      removeListener
    }))
  })
}

function setDisplay(dom, option) {
  dom.style.display = option
}

const apiHandlers = {
  connected: (_, {removeListener}) => {
    removeListener()
  },
  start: (e, {initGame}) => {
    initGame(e, cb => {
      api.subscribeToEvent('json', cb)
    })
  },
  error: (error, {showPopup}) => {
    showPopup('error', error)
  },
  message: (message, {showPopup}) => {
    showPopup('message', message)
  },
  rooms: (games, {lobbyBody}) => {
    if (games.length === 0) {
      lobbyBody.innerHTML = statusRowTemplate('Свободных игр нет')
    } else {
      lobbyBody.innerHTML = lobbyRowTemplates(games)
    }
  }
}

const actions = {
  create: async ({dom, btns, lobbyBody, removeListener}) => {
    try {
      const ok = await initCreateModal(dom)
      if (ok) {
        removeListener()
        Object.values(btns).forEach(btn => btn.disabled = true)
        api.unSubscribeToEvent('rooms')
        lobbyBody.innerHTML = ''

        const startWaiting = new Date()
        setInterval(() => {
          const currentTime = new Date()
          const d = new Date(currentTime - startWaiting)
          const formattedTime = d.toLocaleTimeString().slice(-5)
          lobbyBody.innerHTML = statusRowTemplate(`Ждем противника ${formattedTime}`)
        }, 1000)
      }
    } catch (e) {
      console.warn(e)
    }
  },

  connect: async ({dom, showPopup}) => {
    if (!chosenGameId) {
      showPopup('error', 'Сначала выберите игру')
    } else {
      const {name, closed, uid} = api.getRoomById(chosenGameId)
      if (closed) {
        initConnectModal(dom, name, uid)
      } else {
        await api.connectRoom(uid)
      }
    }
  }
}

const cashedModals = {}

function initCreateModal(dom) {
  if (!cashedModals.modalCreate) {
    dom.insertAdjacentHTML('beforeend', modalCreateTemplate())
    cashedModals.modalCreate = dom.querySelector('#modalCreate')
  }
  setDisplay(cashedModals.modalCreate, 'block')
  const btn = dom.querySelector('#CreateBtn')
  const nameInput = cashedModals.modalCreate.querySelector('#name')
  const nickInput = cashedModals.modalCreate.querySelector('#nick')
  const passwordInput = cashedModals.modalCreate.querySelector('#password')

  return new Promise((resolve => {
    cashedModals.modalCreate
      .querySelector('.modal__dropdown')
      .addEventListener('click', () => {
        setDisplay(cashedModals.modalCreate, 'none')
        resolve(false)
      }, {once: true})
    btn.addEventListener('click', async () => {
      setDisplay(cashedModals.modalCreate, 'none')
      const name = nameInput.value
      const nick = nickInput.value
      const password = passwordInput.value
      nameInput.value = ''
      nickInput.value = ''
      passwordInput.value = ''
      await api.createRoom(name, password, nick)
      resolve(true)
    }, {once: true})
  }))
}

function initConnectModal(dom, name, uid) {
  if (!cashedModals.modalConnect) {
    dom.insertAdjacentHTML('beforeend', modalConnectTemplate(name))
    cashedModals.modalConnect = dom.querySelector('#modalConnect')
  }
  setDisplay(cashedModals.modalConnect, 'block')
  cashedModals.modalConnect
    .querySelector('.modal__dropdown')
    .addEventListener('click', () => setDisplay(cashedModals.modalConnect, 'none'))
  const btn = dom.querySelector('#ConnectBtn')
  const passwordInput = cashedModals.modalConnect.querySelector('#mc_password')
  btn.addEventListener('click', async () => {
    setDisplay(cashedModals.modalConnect, 'none')
    const password = passwordInput.value
    passwordInput.value = ''
    await api.connectRoom(uid, password)
  }, {once: true})
}