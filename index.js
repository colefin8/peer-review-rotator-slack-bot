//bolt is slack's sdk
const { App, LogLevel } = require("@slack/bolt");
//dotenv is a library that places env variables onto the process object
require('dotenv').config()
const { BOT_TOKEN, SECRET, CHANNEL, EXCLUDE } = process.env

// useful user ids
// U019045NWD6 Jeremy Jensen
// U01PY7LFSHK Cole Finlayson
// U02LKHB0HA7 Jarrod Ribble
// U0271KE1LHL Cameron Zollinger

const excludeIds = EXCLUDE?.split(' ') ?? []

const app = new App({
    token: BOT_TOKEN,
    signingSecret: SECRET,
    LogLevel: LogLevel.DEBUG
})
const doIt = async () => {
    //get member ids from channel
    let members = await getUsers()
    //get names from member ids
    let names = await getName(members)
    // this code is specific to the juniors and seniors I listed, if you just wanted to do individual employees you can just remove this reduce method
    // names = names.reduce((a, e, i) => {
    //     if (seniors.includes(e)) {
    //         if(juniors.length > i) {
    //             a.push(e + ', ' + juniors[i])
    //         } else {
    //             a.push(e)
    //         }
    //     }
    //     return a
    // }, [])
    names = shuffle(names)
    printRotation(names)
}

function shuffle(array) {
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

try {
    doIt()
}
catch (err) {
    console.error(err)
}