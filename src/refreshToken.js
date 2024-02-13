const https = require('https');

function getAccessToken() {
    let options = {
        hostname: 'id.twitch.tv',
        path: '/oauth2/token?client_id=' + process.env.CLIENT_ID + '&client_secret=' + process.env.CLIENT_SECRET + '&code=' + process.env.CODEACCESS+ '&grant_type=authorization_code&redirect_uri=http://localhost',
        method: 'POST',
    }

    return new Promise((resolve,reject) => {
        https.get(options, (resp) => {
            let data = '';
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('error', (err) => {
                reject(err);
            });

            resp.on('end', () => {
                let jsonResponse = JSON.parse(data);
                resolve(jsonResponse);
            })
        })
    })
}

async function refreshAccessToken(refreshToken ) {
    let options = {
        hostname: 'id.twitch.tv',
        path: '/oauth2/token?grant_type=refresh_token&refresh_token='+ refreshToken +'&client_id=' + process.env.CLIENT_ID + '&client_secret=' + process.env.CLIENT_SECRET,
        method: 'POST',
    }

    return new Promise( (resolve,reject) => {
        https.get(options, (resp) => {
            // A chunk of data has been recieved.
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end',() => {
                let jsonResponse = JSON.parse(data);
                if(resp.statusCode === 200) {
                    resolve(jsonResponse);
                } else if(resp.statusCode === 400 || resp.statusCode === 403 ) {
                    reject(jsonResponse);
                }
            })
            resp.on('error', (err) => {
                console.log(err);
            });
        })
    })
}

async function validateAccessToken(token, refreshToken) {
    let options = {
        hostname: 'id.twitch.tv',
        path: '/oauth2/validate',
        method: 'GET',
        headers: {
            Authorization: 'OAuth ' + token
        }
    }
    return new Promise( (resolve,reject) => {
        https.get(options, (resp) => {
            let data = '';
            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', () => {
                let jsonResponse = JSON.parse(data);
                if (jsonResponse['status'] === 401) {
                    refreshAccessToken(refreshToken).then(tokenData => {
                        resolve(tokenData);
                    }).catch(() => {
                        getAccessToken(process.env.CODEBOT).then( tokenData => {
                            resolve(tokenData);
                        }).catch(err => {
                            reject(err);
                        })
                    })
                }
            })
        })
    })
}

module.exports = { refreshAccessToken , getAccessToken , validateAccessToken }