const https = require('https');
const goodResponses = ["Это определенно так.", "Это ясно как день.", "Без сомнений.", "Точно да.", "Ты можешь полагаться на это.", "Как я вижу, да.", "Вероятнее всего.", "Перспектива хорошая.", "Да.", "Карты указывают на да."];
const neutralResponses = ["Ответ туманный, попробуйте еще раз.", "Спросите позже.", "Лучше не говорить тебе сейчас.", "Не могу предсказать сейчас.", "Сконцентрируйтесь и спросите снова."];
const badResponses = ["Не рассчитывайте на это.", "Мой ответ - нет.", "Мои источники говорят, что нет.", "Перспективы не очень.", "Очень сомнительно."];

function randomChoice(mn, mx) {
    return Math.random() * (mx - mn) + mn;
}

async function ballAnswers() {
    return new Promise( (resolve,reject) => {
        switch(Math.floor(randomChoice(1,4))) {
            case 1: {
                resolve(goodResponses[Math.floor(randomChoice(1,goodResponses.length + 1)) - 1]);
                break;
            }
            case 2: {
                resolve(neutralResponses[Math.floor(randomChoice(1,neutralResponses.length + 1)) - 1])
                break;
            }
            case 3: {
                resolve(badResponses[Math.floor(randomChoice(1,badResponses.length + 1)) - 1])
                break;
            }
        }
    })
}

module.exports = { ballAnswers }