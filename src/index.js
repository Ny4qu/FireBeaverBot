const tmi = require('tmi.js');
const fs = require('fs');
require('dotenv').config();
const { getAccessToken } = require('./getAccessToken');
const { validateAccessToken } = require('./validateToken');
const { refreshAccessToken } = require('./refreshToken');
const { randomTimeOut } = require('./randomTimeOut');
const { beerThief } = require('./beerThief');
const { ballAnswers } = require('./ball8answers');
const { vanishTimeOut } = require('./vanish');
const { rangeTimeOut } = require("./rangeTimeOut");
const { checkCoolDown } = require("./coldownCommands");
const { typesTranslate } = require("../assets/tweaks");
const { emoteTimeOut } = require("./streakOut");

let streamerTokenData = {};
let botTokenData = {};
let temporaryEmote = '';
let emoteCounter = 0;
let emoteRegex = /^[-a-zA-Z_]+$/d

const client = new tmi.Client({
    options: { debug: true },
    identity: {
        username: process.env.USERNAME,
        password: process.env.PASSWORD
    },
    channels: process.env.CHANNELS.split(' ')
});

refreshAccessToken(process.env.REFRESHTOKENSTREAMER).then( value => {
    streamerTokenData = value;
    refreshAccessToken(process.env.REFRESHTOKENBOT).then( value => {
        botTokenData = value;
    }).catch(err => {
        getAccessToken(process.env.CODEBOT).then( value => {
            botTokenData = value;
        })
    })
    client.connect();
}).catch(err => {
    getAccessToken(process.env.CODEACCESS).then( value => {
        streamerTokenData = value;
    })
})

client.on('message', (channel, tags, message, self) => {
    if(self) return;

    if(temporaryEmote === message.split(' ')[0]) {
        emoteCounter += 1;
    } else {
        if(emoteCounter > 3) {
            let badges = tags['badges-raw'] === null ? '': tags['badges-raw'];
            if(badges.includes('moderator')) {
                client.say(channel,tags['display-name'] + ' модератор прервал стрик unmod');
            } else {
                emoteTimeOut(tags['user-id'], 60, emoteCounter, channel.replace('#',''), botTokenData).then(value => {
                    client.say(channel, tags['display-name'] + " " + value);
                }).catch(err => {
                    client.say(channel, tags['display-name'] + " " + err);
                })
            }
        }
        temporaryEmote = message.split(' ')[0].match(emoteRegex) ? message.split(' ')[0] : '';
        emoteCounter = 1;
    }

    if(message.startsWith('!')) {
        let timeNow = new Date().getTime() / 1000;
        let channelName = channel.replace('#','');
        let message_array = message.trim().slice(1).split(' ');
        switch(message_array[0].toLowerCase()) {
            case 'rr': {
                let amount = 180;
                if(tags.mod){
                    client.say(channel, tags['display-name'] + " Модерам нельзя баловаться с рулеткой");
                } else {
                    if(parseInt(message_array[1]) < 180) {
                        amount = 180;
                    } else if(parseInt(message_array[1]) > 259200) {
                        amount = 259200
                    } else {
                        amount = isNaN(message_array[1]) ? 180 : message_array[1];
                    }
                    randomTimeOut(tags['user-id'], amount, channelName, botTokenData).then(value => {
                        client.say(channel, tags['display-name'] + " " + value);
                    }).catch(err => {
                        client.say(channel, tags['display-name'] + " " + err);
                    })
                }
                break;
            }
			case 'пиво':
            case 'beer': {
                beerThief(tags['user-id'], channelName ,botTokenData).then(value => {
                    if(Math.floor(Math.random() * 2)) {
                        client.say(channel, ".me " + tags["display-name"] + " EZ украл у " + value.name + " widePeepoShortMad " + value.amount + " банок пива ppBeerBounce");
                    } else {
                        client.say(channel, ".me " + tags["display-name"] + " Otvali отдал " + value.name + " widePeepoShortMad " + value.amount + " банок пива ppBeerBounce");
                    }
                }).catch(err => {
                    if(err.error === 'Unauthorized') {
                        refreshAccessToken(process.env.REFRESHTOKENBOT).then( value => {
                            botTokenData = value;
                            beerThief(tags['user-id'], channelName ,botTokenData).then(value => {
                                if(Math.floor(Math.random() * 2)) {
                                    client.say(channel, ".me " + tags["display-name"] + " EZ украл у " + value.name + " widePeepoShortMad " + value.amount + " банок пива ppBeerBounce");
                                } else {
                                    client.say(channel, ".me " + tags["display-name"] + " Otvali отдал " + value.name + " widePeepoShortMad " + value.amount + " банок пива ppBeerBounce");
                                }
                            })
                        }).catch(err => {
                            getAccessToken(process.env.CODEBOT).then( value => {
                                botTokenData = value;
                            })
                        })
                    }
                });
                break;
            }
            case 'вопрос': {
                ballAnswers().then(response => {
                    client.say(channel, tags["display-name"] + " " + response);
                })
                break;
            }
            case 'скучно': {
                rangeTimeOut(tags['user-id'], channelName ,botTokenData).then(value => {

                }).catch(err => {

                })
                break;
            }
        }
    }
});

process.on('SIGINT', async function() {
    console.log('About to exit');
    process.exit();
});

