const { App, LogLevel } = require("@slack/bolt");
require('dotenv').config()
const { BOT_TOKEN, SECRET, CHANNEL } = process.env
const seniors = require('./seniors')
const juniors = require('./juniors')

const app = new App({
    token: BOT_TOKEN,
    signingSecret: SECRET,
    LogLevel: LogLevel.DEBUG
})
const doIt = async () => {
    let members = await getUsers()
    let names = await getName(members)
    names = names.reduce((a, e, i) => {
        if (seniors.includes(e)) {
            if (i === 0) {
                a.push(e)
            } else {
                a.push(e + ', ' + juniors[i])
            }
        }
        return a
    }, [])
    names = shuffle(names)
    console.log(await names)
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
    for (let i = 0; i < members.length; i++) {
        const name = await app.client.users.info({
            token: BOT_TOKEN,
            user: members[i]
        })
        if (!name.user.is_bot) {
            names.push(name.user.real_name)
        }
    }
    return await names
}

const printRotation = async (names) => {
    let text = [{
        type: 'header',
        text:
        {
            type: 'mrkdwn',
            text: 'Peer Reviewer :arrow_right: Peer Reviewee'
        }
    }, {
        type: 'divider'
    }
    ]
    for (let i = 0; i < names.length; i++) {
        if (i < names.length - 1) {
            text.push({
                type: 'section',
                fields: [{
                    type: 'mrkdwn',
                    text: `${names[i]} :arrow_right: ${names[i + 1]}`
                }]
            })
        } else {
            text.push({
                type: 'section',
                fields: [{
                    type: 'mrkdwn',
                    text: `${names[i]} :arrow_right: ${names[0]}`
                }]
            })
        }
    }
    // await app.client.chat.postMessage({
    //     channel: CHANNEL,
    //     token: BOT_TOKEN,
    //     text: 'Peer Review Rotation',
    //     blocks: text
    // })
}

try {
    doIt()
}
catch (err) {
    console.error(err)
}