const https = require('https');
const russianArray = [0,0,0,1,0,0];
const rejectPhrases = ["Заклинило, живи...", "Не сегодня", "Сыграем еще раз?", "Ладно,не буду", "Ну я старался", "Сегодня явно твой день", "Недокрутился барабан до патрона", "Прекрасный день что бы не быть забаненным", "Повезло", "Пока,пока . . . а стоп че", "Пронесло"]
const aprovePhrases = ["Интересно что будет если нажать.... ой", "Sayonara", "Впрочем никто и не будет скучать ", "死", "5 минут полет нормальный", "Welcome to Brixton", "Будем честны он не совсем мне нравился", "Хорошо летит, жаль не долетел", "BOOOOOOM -1", "*Звук выстрела*", "Не повезло, не фортануло"]

function randomChoice(mn, mx) {
    return Math.random() * (mx - mn) + mn;
}

function randomTimeOut(userID,time,channel,tokenData) {
	switch(channel) {
		case 'nyaqu': channel = process.env.STREAMERID; break;
		case '9impulse': channel = process.env.STREAMERIMPULSE; break;		
	}
    const body = {
        "data":
            {
                "user_id":userID,
                "reason":"Проиграл Боту RIP",
                "duration": time
            }
    }
    const dataString = JSON.stringify(body)

    const options = {
        hostname: 'api.twitch.tv',
        path: '/helix/moderation/bans?broadcaster_id=' + channel + '&moderator_id=' + process.env.BOTID,
        method: 'POST',
        headers: {
            "Authorization": 'Bearer ' + tokenData.access_token,
            'Client-Id': process.env.CLIENT_ID,
            'Content-Type': 'application/json',
        },
        timeout: 1000, // in ms
    }

    return new Promise((resolve, reject) => {
        if(russianArray[Math.floor(randomChoice(1,6) - 1)]) {
            const req = https.request(options, (res) => {
                let data = "";
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(aprovePhrases[Math.floor(randomChoice(1,aprovePhrases.length + 1) - 1)]);
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
        } else {
            resolve(rejectPhrases[Math.floor(randomChoice(1,aprovePhrases.length + 1) - 1)]);
        }

    })
}

module.exports = { randomTimeOut }