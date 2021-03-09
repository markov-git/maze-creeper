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

export function createLobby(domContainer, $status, showPopup) {
  domContainer.innerHTML = lobbyTemplate()
  api.connectToServer()

  const btns = {
    create: domContainer.querySelector('#create'),
    connect: domContainer.querySelector('#connect')
  }
  const lobbyBody = document.querySelector('#lobby-body')

  // надо бы добавить удаление этого события
  lobbyBody.addEventListener('click', e => {
    lobbyBody.querySelectorAll('tbody tr')
      .forEach(tr => tr.classList.remove(CHOSEN_CLASS))
    if (e.target.dataset.id) {
      chosenGameId = e.target.dataset.id
      const chosenRow = lobbyBody.querySelector(`[data-id="${chosenGameId}"]`)
      chosenRow.classList.add(CHOSEN_CLASS)
    } else {
      chosenGameId = null
    }
  })

  api.subscribeToEvent('rooms', games => {
    if (games.length === 0) {
      lobbyBody.innerHTML = statusRowTemplate('Свободных игр нет')
    } else {
      lobbyBody.innerHTML = lobbyRowTemplates(games)
    }
  })

  api.subscribeToEvent('error', error => {
    showPopup('error', error)
  })

  api.subscribeToEvent('message', message => {
    showPopup('message', message)
  })

  Object.keys(btns).forEach(key => {
    btns[key].addEventListener('click', () => actions[key]({
      dom: domContainer,
      showPopup,
      btns,
      lobbyBody
    }))
  })
}

function setDisplay(dom, option) {
  dom.style.display = option
}

const cashedModals = {}

const actions = {
  create: async ({dom, btns, lobbyBody}) => {
    try {
      await initCreateModal(dom)
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
    } catch (e) {
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

  return new Promise(((resolve, reject) => {
    cashedModals.modalCreate
      .querySelector('.modal__dropdown')
      .addEventListener('click', () => {
        setDisplay(cashedModals.modalCreate, 'none')
        reject()
      })
    btn.addEventListener('click', async () => {
      setDisplay(cashedModals.modalCreate, 'none')
      const name = nameInput.value
      const nick = nickInput.value
      const password = passwordInput.value
      nameInput.value = ''
      nickInput.value = ''
      passwordInput.value = ''
      await api.createRoom(name, password, nick)
      resolve()
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