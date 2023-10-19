const https = require('https');

function validateAccessToken(token) {
    let options = {
        hostname: 'id.twitch.tv',
        path: '/oauth2/validate',
        method: 'GET',
        headers: {
            Authorization: 'OAuth ' + token
        }
    }
    https.get(options, (resp) => {
        let data = '';
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end',() => {
            let jsonResponse = JSON.parse(data);
            console.log(jsonResponse)
        })
        // console.log(resp);
        // console.log(resp.statusCode, resp.statusMessage);
        // let JsonData = JSON.parse(data);
        // console.log(JsonData);
        // return JsonData;
        // The whole response has been received. Print out the result.
        // let jsonResponse = JSON.parse(data);
        // console.log(jsonResponse);
    })
}

module.exports = { validateAccessToken }