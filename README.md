# peer-review-rotator-slack-bot

bot that pulls all users from a specific channel it's been invited to, sorts them according to position (junior or senior developer) and then randomizes
pairs for peer review.

for users A,B,C,D,E it might output

```
A assigns to E
E assigns to B
B assigns to C
c assigns to D
D assigns to A
```

clone this repo down, run `npm i`, then add an env with the following values

BOT_TOKEN get from cole
SECRET get from cole
CHANNEL = channel id
EXCLUDE = user ids to exclude separated by spaces

have Cole install this bot on your channel
