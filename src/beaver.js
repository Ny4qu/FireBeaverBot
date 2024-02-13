const https = require('https');
const { beaverNames } = require("../assets/tweaks");

const beaverTypes = ['Wood','Iron','Gold','Diamond','Emerald'] // 0-700 , 700-900, 900-990, 990-998 , 998-1000
const beaverElements = ['Normal','Fire','Water','Grass','Fighting','Poison','Electric','Ground','Rock','Psychic','Ice','Ghost','Steel','Dragon','Dark','Fairy']

function randomChoice(mn, mx) {
    return Math.random() * (mx - mn) + mn;
}

const rarityValues = {
    'Wood': 0,
    'Iron': 1,
    'Gold': 2,
    'Diamond': 3,
    'Emerald': 4
}

function catchBeaver() {
    let beaverTypeElo = Math.floor(randomChoice(1, 1001));
    let beaver = {};
    beaver.caught_at = Date.now();
    beaver.date_caught = new Date();
    switch(true) {
        case beaverTypeElo < 701: {
            beaver.name = beaverNames[Math.floor(randomChoice(0, beaverNames.length))];
            beaver.rarity = beaverTypes[0];
            beaver.rarity_name = "Деревянный";
            beaver.level = Math.floor(randomChoice(1,26));
            beaver.type = beaverElements[Math.floor(randomChoice(0, beaverElements.length))];
            break;
        }
        case beaverTypeElo < 901 && beaverTypeElo > 700: {
            beaver.name = beaverNames[Math.floor(randomChoice(0, beaverNames.length))];
            beaver.rarity = beaverTypes[1];
            beaver.rarity_name = "Железный";
            beaver.level = Math.floor(randomChoice(20,51));
            beaver.type = beaverElements[Math.floor(randomChoice(0, beaverElements.length))];
            break;
        }
        case beaverTypeElo < 991 && beaverTypeElo > 900: {
            beaver.name = beaverNames[Math.floor(randomChoice(0, beaverNames.length))];
            beaver.rarity = beaverTypes[2];
            beaver.rarity_name = "Золотой";
            beaver.level = Math.floor(randomChoice(40,71));
            beaver.type = beaverElements[Math.floor(randomChoice(0, beaverElements.length))];
            break;
        }
        case beaverTypeElo < 999 && beaverTypeElo > 990: {
            beaver.name = beaverNames[Math.floor(randomChoice(0, beaverNames.length))];
            beaver.rarity = beaverTypes[3];
            beaver.rarity_name = "Алмазный";
            beaver.level = Math.floor(randomChoice(60,86));
            beaver.type = beaverElements[Math.floor(randomChoice(0, beaverElements.length))];
            break;
        }
        case beaverTypeElo < 1001 && beaverTypeElo > 998: {
            beaver.name = beaverNames[Math.floor(randomChoice(0, beaverNames.length))];
            beaver.rarity = beaverTypes[4];
            beaver.rarity_name = "Эмеральдовый";
            beaver.level = Math.floor(randomChoice(75,101));
            beaver.type = beaverElements[Math.floor(randomChoice(0, beaverElements.length ))];
            break;
        }
        default: {
            console.log('U got a rubber boot');
            break;
        }
    }
    return new Promise((resolve) => {
        resolve(beaver);
    })
}

function checkBestBeaver(newBeaver, oldBeaver) {
    if(newBeaver['level'] > oldBeaver['level']) {
        return true;
    } else if(newBeaver['level'] === oldBeaver['level']) {
        if(rarityValues[newBeaver['rarity']] > rarityValues[oldBeaver['rarity']]) {
            return true;
        } else if(rarityValues[newBeaver['rarity'] === rarityValues[oldBeaver['rarity']]]) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

module.exports = { catchBeaver , checkBestBeaver}