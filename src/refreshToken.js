const https = require('https');



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

module.exports = { refreshAccessToken }