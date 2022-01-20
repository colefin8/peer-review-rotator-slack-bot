# peer-review-rotator-slack-bot

bot that pulls all users from a specific channel it's been invited to, sorts them according to position (junior or senior developer) and then randomizes
pairs for peer review.

for users A,B,C,D,E it might output

```
Peer Reviewer => Peer Reviewee
A => E
E => B
B => C
c => D
D => A
```
