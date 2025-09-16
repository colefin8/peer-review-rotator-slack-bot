//bolt is slack's sdk
const { App, LogLevel } = require("@slack/bolt");
//dotenv is a library that places env variables onto the process object
require('dotenv').config()
//you need your own .env file with the following variables
const { BOT_TOKEN, SECRET, CHANNEL, EXCLUDE } = process.env

// useful user ids
// U019045NWD6 Jeremy Jensen
// U01PY7LFSHK Cole Finlayson
// U02LKHB0HA7 Jarrod Ribble
// U0271KE1LHL Cameron Zollinger

// in the exclude env variable, user ids are separated by a space
let rawExcludeIds = EXCLUDE?.split(',') ?? []
const excludeIds = {};
if (rawExcludeIds.length > 0) {
    rawExcludeIds.forEach(e => {
        let [channel, ids] = e.split(':')
        ids = ids.split(' ')
        excludeIds[channel] = ids
    })
}

let channels = CHANNEL?.split(' ')

//create a new app with the bot token and signing secret
const app = new App({
    token: BOT_TOKEN,
    signingSecret: SECRET,
    LogLevel: LogLevel.DEBUG
})

//start the app
const doIt = async () => {
    for (channel of channels) {
        //get member ids from channel
        let members = await getUsers(channel)
        //get names from member ids
        let names = await getName(members, channel)
        names = shuffle(names)
        printRotation(names, channel)
    }
}


const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;

    // while there remain elements to shuffle
    while (currentIndex != 0) {

        // pick a remaining element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // swap it with the current element
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

const getUsers = async (channel) => {
    const { members } = await app.client.conversations.members({
        channel,
        token: BOT_TOKEN
    })
    return members
}

const getName = async (members, channel) => {
    let names = []
    //# get name of corresponding userid
    for (let i = 0; i < members.length; i++) {
        const name = await app.client.users.info({
            token: BOT_TOKEN,
            user: members[i]
        })
        //# ignore user if it's a bot or if it's in the list of excluded users in the .env
        if (!name.user.is_bot && !excludeIds[channel]?.includes(name.user.id)) {
            names.push(`<@${name.user.id}>`)
        }
    }
    //? not sure i need this await?
    return await names
}

const printRotation = async (names, channel) => {
    let text = []
    for (let i = 0; i < names.length; i++) {
        if (i < names.length - 1) {
            text.push({
                type: 'section',
                fields: [{
                    type: 'mrkdwn',
                    text: `${names[i]} assigns to ${names[i + 1]}`
                }]
            })
        } else {
            text.push({
                type: 'section',
                fields: [{
                    type: 'mrkdwn',
                    text: `${names[i]} assigns to ${names[0]}`
                }]
            })
        }
    }
    // uncomment below to print randomized list to console
    // text.forEach(e => console.log(e.fields))
    // comment out below to avoid spamming chat when testing
    await app.client.chat.postMessage({
        channel,
        token: BOT_TOKEN,
        text: 'Peer Review Rotation',
        blocks: text
    })
}

try {
    doIt()
}
catch (err) {
    console.error(err)
    console.error(channels, excludeIds)
}