const tmi = require('tmi.js');
require('dotenv').config();
const { refreshAccessToken , getAccessToken , validateAccessToken } = require('./refreshToken');
const { randomTimeOut } = require('./randomTimeOut');
const { beerThief } = require('./randomChatter');
const { ballAnswers } = require('./ball8answers');
const { rangeTimeOut } = require("./rangeTimeOut");
const { emoteTimeOut } = require("./streakOut");
const { addBeaverDB , drawHunters, verifyUser , checkPlayers} = require("./beaverConnection");
const { catchBeaver, checkBestBeaver } = require("./beaver");
const { checkCoolDown , isStreamOnline } = require("./coldownCommands");

let streamerTokenData = {};
let botTokenData = {};
let temporaryEmote = '';
let emoteCounter = 0;
let emoteRegex = /^[-a-zA-Z_]+$/d;
let streamStatus = false;

const client = new tmi.Client({
    options: { debug: true },
    identity: {
        username: process.env.USERNAME,
        password: process.env.PASSWORD
    },
    channels: process.env.CHANNELS.split(' ')
});

try {
    refreshAccessToken(process.env.REFRESHTOKENBOT).then( value => {
        botTokenData = {...value};
    }).catch(() => {
        getAccessToken(process.env.CODEBOT).then( value => {
            botTokenData = {...value};
        })
    })
    client.connect().catch((error) => {
        console.log(error);
    });
} catch (error) {
    console.log(error);
}

client.on('connected', () => {
    let huntDelay = {};
    setInterval(async () => {
        await isStreamOnline(botTokenData['access_token']).then( (status) => {
            if(status) {
                if(streamStatus === false) {
                    streamStatus = true;
                    huntDelay = setInterval(async () => {
                        drawHunters().then((hunter => {
                            verifyUser(hunter['username']).then((userData) => {
                                catchBeaver().then((beaver) => {
                                    if (userData['userExist'] === undefined) {
                                        if(checkBestBeaver(beaver, userData[0]['best_beaver'])) {
                                            addBeaverDB(beaver, hunter['username'], 'better', userData[0]['total']);
                                            client.say(process.env.HUNTCHANNEL, hunter['username'] + " вы поймали бобра " + beaver.name + " " + beaver.level +" lvl ▲");
                                        } else {
                                            addBeaverDB(beaver, hunter['username'], 'standard', userData[0]['total']);
                                            client.say(process.env.HUNTCHANNEL, hunter['username'] + " вы поймали бобра " + beaver.name + " " + beaver.level + " lvl ▼");
                                        }
                                    } else {
                                        addBeaverDB(beaver, hunter['username'], 'new');
                                        client.say(process.env.HUNTCHANNEL, hunter['username'] + " вы поймали бобра " + beaver.name + " " + beaver.level + " lvl ▲");
                                    }
                                })
                            })
                        }))
                    }, 60 * 60 * 1000);
                } else {
                    streamStatus = true;
                }
            } else {
                if(streamStatus === true) {
                    streamStatus = false;
                    clearInterval(huntDelay);
                } else {
                    streamStatus = false;
                }
            }
        });
    }, 60 * 1000); // Interval set to 1 minute
});

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
                emoteTimeOut(tags['user-id'], 60, emoteCounter, channel.replace('#',''), botTokenData['access_token']).then(value => {
                    client.say(channel, tags['display-name'] + " " + value);
                }).catch(() => {
                    validateAccessToken(botTokenData['access_token'],botTokenData['refresh_token']).then((tokenData) => {
                        botTokenData = {...tokenData};
                        emoteTimeOut(tags['user-id'], 60, emoteCounter, channel.replace('#',''), botTokenData['access_token']).then(value => {
                            client.say(channel, tags['display-name'] + " " + value);
                        }).catch((err) => {
                            console.log("ERROR: Error on getting token" + JSON.stringify(err));
                        });
                    }).catch((err) => {
                        console.log("ERROR: Unable to validate or get Access" + JSON.stringify(err));
                    })
                })
            }
        }
        temporaryEmote = message.split(' ')[0].match(emoteRegex) ? message.split(' ')[0] : '';
        emoteCounter = 1;
    }

    if(message.startsWith('!')) {
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
                    randomTimeOut(tags['user-id'], amount, channelName, botTokenData['access_token']).then(value => {
                        client.say(channel, tags['display-name'] + " " + value);
                    }).catch(() => {
                        validateAccessToken(botTokenData['access_token'],botTokenData['refresh_token']).then((tokenData) => {
                            botTokenData = {...tokenData};
                            randomTimeOut(tags['user-id'], amount, channelName, botTokenData['access_token']).then(value => {
                                client.say(channel, tags['display-name'] + " " + value);
                            }).catch((err) => {
                                console.log("ERROR: Error on getting token" + JSON.stringify(err));
                            });
                        }).catch((err) => {
                            console.log("ERROR: Unable to validate or get Access" + JSON.stringify(err));
                        })
                    })
                }
                break;
            }
			case 'beer':
            case 'пиво': {
                if(checkCoolDown('пиво')) {
                    break;
                } else {
                    beerThief(tags['user-id'], channelName , botTokenData['access_token']).then(value => {
                        if(Math.floor(Math.random() * 2)) {
                            client.say(channel, ".me " + tags["display-name"] + " EZ украл у " + value.name + " widePeepoShortMad " + value.amount + " банок пива ppBeerBounce");
                        } else {
                            client.say(channel, ".me " + tags["display-name"] + " Otvali отдал " + value.name + " widePeepoShortMad " + value.amount + " банок пива ppBeerBounce");
                        }
                    }).catch(err => {
                        if(err['status'] >= 400){
                            validateAccessToken(botTokenData['access_token'],botTokenData['refresh_token']).then((tokenData) => {
                                botTokenData = {...tokenData};
                                beerThief(tags['user-id'], channelName ,botTokenData['access_token']).then(value => {
                                    if(Math.floor(Math.random() * 2)) {
                                        client.say(channel, ".me " + tags["display-name"] + " EZ украл у " + value.name + " widePeepoShortMad " + value.amount + " банок пива ppBeerBounce");
                                    } else {
                                        client.say(channel, ".me " + tags["display-name"] + " Otvali отдал " + value.name + " widePeepoShortMad " + value.amount + " банок пива ppBeerBounce");
                                    }
                                }).catch((err) => {
                                    console.log("ERROR: Error on getting token " + JSON.stringify(err));
                                });
                            }).catch((err) => {
                                console.log("ERROR: Unable to validate or get Access" + JSON.stringify(err));
                            })
                        }
                    });
                }
                break;
            }
			case 'question':
            case 'вопрос': {
                if(checkCoolDown('вопрос')) {
                    break;
                } else {
                    ballAnswers().then(response => {
                        client.say(channel, tags["display-name"] + " " + response);
                    })
                }
                break;
            }
			case 'boring':
            case 'скучно': {
                rangeTimeOut(tags['user-id'], channelName ,botTokenData['access_token']).then(() => {
                    client.say(channel, tags["display-name"] + " Пошел смотреть аниме с Кирчиком");
                }).catch(() => {
                    validateAccessToken(botTokenData['access_token'],botTokenData['refresh_token']).then((tokenData) => {
                        botTokenData = {...tokenData};
                        rangeTimeOut(tags['user-id'], channelName ,botTokenData).then(() => {

                        }).catch((err) => {
                            console.log("ERROR: Error on getting token" + JSON.stringify(err));
                        });
                    }).catch((err) => {
                        console.log("ERROR: Unable to validate or get Access" + JSON.stringify(err));
                    })
                })
                break;
            }
			case 'flip':
            case 'монетка':{
                if(Math.floor(Math.random() * 2)) {
                    client.say(channel, tags["display-name"] + " ⚪ (Орел)");
                } else {
                    client.say(channel, tags["display-name"] + " ⚫ (Решка)");
                }
                break;
            }
            case 'hunter':
            case 'охотник': {
                if(checkCoolDown('охотник')) {
                    break;
                } else {
                    checkPlayers(tags["username"]).then((status) => {
                        if(status['userExist']) {
                            client.say(channel, tags["display-name"] + " вы уже получили лицензию охотника.");
                        } else {
                            client.say(channel, tags["display-name"] + " вы получили лицензию охотника, удачной охоты.")
                        }
                    })
                }
                break;
            }
            case 'help': {
                if(checkCoolDown('help')) {
                    break;
                } else {
                    client.say(channel, tags["display-name"] + ' у бота есть такие команды как: !пиво, !монетка, !скучно, !вопрос, !rr, !охота, !обновления');
                }
                break;
            }
            case 'hunt':
            case 'охота': {
                if(checkCoolDown('охота')) {
                    break;
                } else {
                    client.say(channel, tags["display-name"] + ' для того что бы участвовать в охоте вам понадобится лицензия охотника, которую можно получить написав команду "!охотник". (При участии у вас есть шанс раз в некоторое количество времени поймать бобра)');
                }
                break;
            }
            case 'source':
            case 'создатель': {
                if(checkCoolDown('создатель')) {
                    break;
                } else {
                    client.say(channel,'Я тут --> https://github.com/Ny4qu/FireBeaverBot');
                }
                break;
            }
        }
    }
});

process.on('SIGINT', async function() {
    console.log('About to exit');
    process.exit();
});


