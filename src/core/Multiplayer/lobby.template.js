import svg from './svg'

export function lobbyTemplate() {
  return `
    <div class="lobby board unselectable">
    <h3 class="lobby__title">Доступные комнаты</h3>
    <table class="lobby__table">
      <thead>
      <tr>
        <th>№</th>
        <th>Название</th>
        <th>Игрок</th>
        <th>Пароль</th>
      </tr>
      </thead>
      <tbody id="lobby-body">
      <tr class="lobby__init-row" id="init-row"><td colspan="3">Свободных игр нет</td></tr>
      </tbody>
    </table>
    <div class="lobby__controls">
      <button class="btn shadow unselectable" id="create">Создать</button>
      <button class="btn shadow unselectable" id="connect">Подключиться</button>
    </div>
  </div>
  `.trim()
}

export function statusRowTemplate(message) {
  return `<tr class="lobby__init-row" id="init-row"><td colspan="3">${message}</td></tr>`
}

export function lobbyRowTemplates(games) {
  return games.map(game => {
    return `
    <tr data-id="${game.id}">
      <td data-id="${game.id}">${game.id}</td>
      <td data-id="${game.id}">${game.name || `Игра ${game.id}`}</td>
      <td data-id="${game.id}">${game.nick || 'Безымянный'}</td>
      <td data-id="${game.id}">${game.closed ? svg : ''}</td>
    </tr>
  `
  }).join('')
}

export function modalCreateTemplate() {
  return `
  <div class="modal" id="modalCreate">
    <div class="modal__dropdown"></div>
    <div class="modal__form">
      <div class="modal__title unselectable">Создание новой комнаты</div>
      <div class="modal__options">
        <div class="modal__option">
          <label class="modal__label unselectable" for="name">Название комнаты:</label>
          <input type="text" class="modal__input" id="name" autocomplete="off">
        </div>
        <div class="modal__option">
          <label class="modal__label unselectable" for="nick">Ваш ник:</label>
          <input type="text" class="modal__input" id="nick" autocomplete="off">
        </div>
        <div class="modal__option">
          <label class="modal__label unselectable" for="password">Пароль (опционально):</label>
          <input type="password" class="modal__input" id="password">
        </div>
      </div>
      <button class="button btn shadow unselectable modal_button" id="CreateBtn">Создать</button>
    </div>
  </div>
  `.trim()
}

export function modalConnectTemplate(name) {
  return `
  <div class="modal" id="modalConnect">
    <div class="modal__dropdown"></div>
    <div class="modal__form">
      <div class="modal__title unselectable">Подключение к игре "${name}"</div>
      <div class="modal__options">
        <div class="modal__option">
          <label class="modal__label unselectable" for="mc_password">Пароль:</label>
          <input type="password" class="modal__input" id="mc_password">
        </div>
      </div>
      <button class="button btn shadow unselectable modal_button" id="ConnectBtn">Подключиться</button>
    </div>
  </div>
  `.trim()
}