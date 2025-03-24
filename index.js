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
const excludeIds = EXCLUDE?.split(' ') ?? []

//create a new app with the bot token and signing secret
const app = new App({
    token: BOT_TOKEN,
    signingSecret: SECRET,
    LogLevel: LogLevel.DEBUG
})

//start the app
const doIt = async () => {
    //delete messages older than 30 days
    deleteBotMessages(await getChannelMessages())
    //get member ids from channel
    let members = await getUsers()
    //get names from member ids
    let names = await getName(members)
    names = shuffle(names)
    printRotation(names)
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

const getUsers = async () => {
    const { members } = await app.client.conversations.members({
        channel: CHANNEL,
        token: BOT_TOKEN
    })
    return members
}

const getName = async (members) => {
    let names = []
    //# get name of corresponding userid
    for (let i = 0; i < members.length; i++) {
        const name = await app.client.users.info({
            token: BOT_TOKEN,
            user: members[i]
        })
        //# ignore user if it's a bot or if it's in the list of excluded users in the .env
        if (!name.user.is_bot && !excludeIds.includes(name.user.id)) {
            names.push(`<@${name.user.id}>`)
        }
    }
    //? not sure i need this await?
    return await names
}

const printRotation = async (names) => {
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
        channel: CHANNEL,
        token: BOT_TOKEN,
        text: 'Peer Review Rotation',
        blocks: text
    })
}

const getChannelMessages = async () => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    const monthAgoDate = Math.floor(date / 1000).toFixed(0)
    const history = await app.client.conversations.history({
        channel: CHANNEL,
        token: BOT_TOKEN,
        oldest: monthAgoDate
    })
    return history.messages
}

const deleteBotMessages = async (messages) => {
    for (message of messages) {
        console.log(message)
        console.log(message.user === 'U02URUE9BMZ')
        if (message.user === 'U02URUE9BMZ') {
            await app.client.chat.delete({
                channel: CHANNEL,
                token: BOT_TOKEN,
                ts: message.ts
            })
        }
    }
}

try {
    doIt()
}
catch (err) {
    console.error(err)
}