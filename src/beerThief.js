const https = require('https');
let pages = true;
let totalRows = 0;
let paginationKey = "";

function randomChoice(mn, mx) {
    return Math.random() * (mx - mn) + mn;
}

async function getChatters(accessToken, channel) {
    let options = {
        hostname: 'api.twitch.tv',
        path: '/helix/chat/chatters?broadcaster_id=' + channel + '&moderator_id=' + process.env.BOTID + '&first=999' + ((pages !== true) ? '' : "&after=" + paginationKey),
        method: 'GET',
        headers: {
            "Authorization": 'Bearer ' + accessToken,
            "Client-Id": process.env.CLIENT_ID,
            'Content-Type': 'application/json',
        },
    }

    return new Promise((resolve, reject) => {
        https.get(options, (resp) => {
            // A chunk of data has been received.
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                let jsonResponse = JSON.parse(data);
                totalRows = jsonResponse.total;
                if(jsonResponse['pagination'] === undefined || Object.keys(jsonResponse['pagination']).length === 0) {
                    pages = false;
                } else {
                    paginationKey = jsonResponse['pagination'].cursor;
                }
                if (resp.statusCode === 200) {
                    resolve(jsonResponse.data);
                } else if (resp.statusCode === 401) {
                    reject(jsonResponse)
                }
            })
        })
    })
}

async function beerThief(userID,channel,accessToken) {
    let rejectResponse = true;
    switch(channel) {
        case 'nyaqu': channel = process.env.STREAMERID; break;
        case '9impulse': channel = process.env.STREAMERIMPULSE; break;
    }
    let chattersArray = [];
    await getChatters(accessToken, channel).then(users => {
        chattersArray = users;
    }).catch(err => {
        rejectResponse = {...err};
    });

    while(pages) {
        await getChatters(accessToken, channel).then(users => {
            chattersArray = chattersArray.concat(users);
        }).catch(err => {
            rejectResponse = {...err};
        });
    }
    pages = true;
    paginationKey = "";
    return new Promise( (resolve,reject) => {
        if(rejectResponse === true) {
            resolve({
                "name" : chattersArray[Math.floor(randomChoice(1, totalRows)) - 1].user_name,
                "amount" : Math.floor(randomChoice(1,101)),
            });
        } else {
            reject(rejectResponse);
        }
    })
}

module.exports = { beerThief }