const https = require("https");
let cooldownCommands = {
    "пиво": 0,
    "охота": 0,
    "вопрос": 0,
    "создатель": 0,
    'help': 0,
    "охотник": 0
}
let cooldownForCommands = {
    "пиво": 3,
    "охота": 15,
    "вопрос": 5,
    "создатель": 5,
    'help': 15,
    "охотник": 10
}

function checkCoolDown(command) {
    let timeNow = Math.floor(new Date().getTime() / 1000);
    if((timeNow - cooldownCommands[command]) > cooldownForCommands[command]) {
        cooldownCommands[command] = timeNow;
        return false;
    } else {
        return true;
    }
}

async function isStreamOnline(accessToken) {
    let options = {
        hostname: 'api.twitch.tv',
        path: 'helix/streams?user_login=nyaqu',
        method: 'GET',
        headers: {
            'Client-Id': process.env.CLIENT_ID,
            "Authorization": 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        }
    }

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = "";
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                let jsonResponse = JSON.parse(data);
                if(jsonResponse.data[0] === undefined) {
                    resolve(false);
                } else if(jsonResponse.data[0]['type'] === 'live') {
                    resolve(true);
                }
            })
        })

        req.on('error', (err) => {
            reject(err)
        })

        req.on('timeout', () => {
            req.destroy()
            reject(new Error('Request time out'))
        })
        req.end()
    })
}

module.exports = { checkCoolDown , isStreamOnline };