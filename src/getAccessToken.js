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
                console.log(err);
            });

            resp.on('end', () => {
                let jsonResponse = JSON.parse(data);
                resolve(jsonResponse);
            })
        })
    })
}

module.exports = { getAccessToken }