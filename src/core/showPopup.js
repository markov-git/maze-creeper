import {POPUP_DELAY, POPUP_TIMEOUT} from '@core/constants'

const $popup = document.querySelector('#popup')
const $popupTitle = $popup.querySelector('h2')
let isShownNow = false

export const showPopup = (type, message) => {
  if (!isShownNow) {
    switch (type) {
      case 'error': {
        $popup.style.borderLeftColor = 'darkred'
        $popup.style.boxShadow = '0 0 15px red'
        break
      }
      case 'warn': {
        $popup.style.borderLeftColor = 'darkorange'
        $popup.style.boxShadow = '0 0 15px darkorange'
        break
      }
      default: {
        $popup.style.borderLeftColor = 'darkgreen'
        $popup.style.boxShadow = '0 0 15px darkgreen'
      }
    }

    isShownNow = true
    $popupTitle.innerText = message.toString()
    $popup.style.right = '50px'
    setTimeout(() => {
      $popup.style.right = '-100%'
      $popupTitle.innerText = ''
      isShownNow = false
    }, POPUP_TIMEOUT)
  } else {
    setTimeout(() => showPopup(type, message), POPUP_TIMEOUT + POPUP_DELAY)
  }
}

