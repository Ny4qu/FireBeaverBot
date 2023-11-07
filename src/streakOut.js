const https = require('https');

function emoteTimeOut(userID,time,emoteCounter,channel,accessToken) {
    switch(channel) {
        case 'nyaqu': channel = process.env.STREAMERID; break;
        case '9impulse': channel = process.env.STREAMERIMPULSE; break;
    }
    const body = {
        "data":
            {
                "user_id":userID,
                "reason":"Прервал стрик из эмоутов maaaaan",
                "duration": time
            }
    }
    const dataString = JSON.stringify(body)

    const options = {
        hostname: 'api.twitch.tv',
        path: '/helix/moderation/bans?broadcaster_id=' + channel + '&moderator_id=' + process.env.BOTID,
        method: 'POST',
        headers: {
            "Authorization": 'Bearer ' + accessToken,
            'Client-Id': process.env.CLIENT_ID,
            'Content-Type': 'application/json',
        },
        timeout: 1000, // in ms
    }

    return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = "";
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve("Прервал стрик из " + emoteCounter + " эмоутов maaaaan");
                    } else if (res.statusCode > 299) {
                        reject("Попросите Кирилла вас забанить")
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

            req.write(dataString)
            req.end()
    })
}

module.exports = { emoteTimeOut }