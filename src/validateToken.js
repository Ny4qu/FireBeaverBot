const https = require('https');
require('dotenv').config();
const { refreshAccessToken } = require('./refreshToken');
const { getAccessToken } = require("./getAccessToken");

function validateAccessToken(token, refreshToken) {
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

module.exports = { validateAccessToken };