import * as template from './lobby.template'
import API from '@core/API/API'
import {lobbyRowTemplates, statusRowTemplate} from './lobby.template'

const api = new API()
const CHOSEN_CLASS = 'chosen'
let chosenGameId = null

export function createLobby(domContainer, $status) {
  domContainer.innerHTML = template.lobbyTemplate()
  api.connectToServer()

  const btns = {
    create: domContainer.querySelector('#create'),
    connect: domContainer.querySelector('#connect')
  }
  const lobbyBody = document.querySelector('#lobby-body')

  lobbyBody.addEventListener('click', e => {
    if (e.target.dataset.id) {
      chosenGameId = e.target.dataset.id
      lobbyBody.querySelectorAll('tbody tr')
        .forEach(tr => tr.classList.remove(CHOSEN_CLASS))
      const chosenRow = lobbyBody.querySelector(`[data-id="${chosenGameId}"]`)
      chosenRow.classList.add(CHOSEN_CLASS)
    }
  })

  api.subscribeToEvent('rooms', games => {
    if (games.length === 0) {
      lobbyBody.innerHTML = statusRowTemplate('Свободных игр нет')
    } else {
      lobbyBody.innerHTML = lobbyRowTemplates(games)
    }
  })

  Object.keys(btns).forEach(key => {
    btns[key].addEventListener('click', () => actions[key](domContainer, $status, lobbyBody))
  })
}

function setDisplay(dom, option) {
  dom.style.display = option
}

const cashedModals = {}
const CREATE_TYPE = 'Create'
const CONNECT_TYPE = 'Connect'

const actions = {
  create: (dom, $status, lobbyBody) => {
    initModal(dom, CREATE_TYPE)
    // отписываемся от прослушки свободных комнат
    api.unSubscribeToEvent('rooms')
    // ждем сообщения о подключении
    api.subscribeToEvent('message', message => {
      $status.innerHTML = lobbyBody.innerHTML = statusRowTemplate(message)
    })
  },

  connect: (dom, $status) => {
    if (!chosenGameId) {
      $status.innerHTML = 'Сначала выберите игру'
    } else {
      const {name, closed} = api.getRoomById(chosenGameId)
      if (closed) {
        initModal(dom, CONNECT_TYPE, name)
      }
      //если все хорошо то отписываемся
      api.unSubscribeToEvent('rooms')
    }
  }
}

function initModal(dom, type, name) {
  const modalType = `modal${type}`
  const apiType = type.toLowerCase()
  if (!cashedModals[modalType]) {
    dom.insertAdjacentHTML('beforeend', template[`${modalType}Template`](name))
    cashedModals[modalType] = dom.querySelector(`#${modalType}`)
  }
  setDisplay(cashedModals[modalType], 'block')
  cashedModals[modalType]
    .querySelector('.modal__dropdown')
    .addEventListener('click', () => setDisplay(cashedModals[modalType], 'none'))
  const btn = dom.querySelector(`#${type}Btn`)
  const nameInput = cashedModals[modalType].querySelector('#name')
  const nickInput = cashedModals[modalType].querySelector('#nick')
  const passwordInput = cashedModals[modalType].querySelector('#password')
  btn.addEventListener('click', async () => {
    setDisplay(cashedModals[modalType], 'none')
    const name = nameInput.value
    const nick = nickInput.value
    const password = passwordInput.value
    nameInput.value = ''
    nickInput.value = ''
    passwordInput.value = ''
    await api[`${apiType}Room`](name, password, nick)

    if (apiType === CREATE_TYPE.toLowerCase()) {
      await api.getFreeRooms()
    }
  })
}