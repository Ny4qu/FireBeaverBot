let cooldownCommands = {
    "9impulse": {
        "бобры": 0,
        "охота": 0,
        "лучший": 0,
    },
    "nyaqu": {
        "бобры": 0,
        "охота": 0,
        "лучший": 0,
    }
}
let cooldownForCommands = {
    "9impulse": {
        "бобры": 300,
        "охота": 300,
        "лучший": 5,
    },
    "nyaqu": {
        "бобры": 5,
        "охота": 120,
        "лучший": 5,
    }
}
let overUsing = {};

function checkCoolDown(channel, command) {
    let timeNow = Math.floor(new Date().getTime() / 1000);
    if((timeNow - cooldownCommands[channel][command]) > cooldownForCommands[channel][command]) {
        cooldownCommands[channel][command] = timeNow;
        return false;
    } else {
        return true;
    }
}
module.exports = { checkCoolDown };