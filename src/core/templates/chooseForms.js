export function chooseMode() {
    return `
        <div class="choose__form">
            <h1>Новая игра</h1>
            <p id="pve">Игра с компьютером</p>
            <p id="pvp">Игра с другим игроком</p>
        </div>
    `
}

export function sizeMode() {
    return `
        <div class="choose__form">
            <h1>Размер поля</h1>
            <p data-size="3">5х5</p>
            <p data-size="4">7х7</p>
            <p data-size="5">9х9</p>
            <p data-size="6">11х11</p>
            <p data-size="7">13х13</p>
            <p data-size="8">15х15</p>
            <p data-size="9">17х17</p>
        </div>
    `
}

export function autoMode() {
    return `
        <div class="choose__form">
            <h1>Сгенерировать поле противнику?</h1>
            <p data-option="auto">Да</p>
            <p>Нет, я сам</p>
        </div>
    `
}
