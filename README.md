# NOT FINISHED

# zeta5

A simple, minimal library for connecting Khan Academy programs to a Node.js server.

## How to set up

### Server-side setup
1. Clone this repository ```git clone https://github.com/kqwq/zeta5.git```
2. Edit /server/config.ts
3. Run ```npm install && npm run start```

### PJS program setup
4. Copy and paste the contents of /client/pjs-client.js into the beginning of your program.
5. A green bar at the top of the programs indicates that the client and server are connected.

### Webpage setup
4. Include the following `<script>` tag in your webpage:
```html
<script src="https://raw.githubusercontent.com/kqwq/zeta5/main/client/webpage-client.js"></script>
```
5. A green bar at the top of the webpage indicates that the client and server are connected.

## Customizing the server

All server code is well-documented in /server/server.ts. You can edit the server to your liking.

## Customizing the client

Likewise, all client code should be well-commented in their respective files.

## FAQ
1. Does this break the guidelines?
- I'm not sure. Use at your own discretion.
2. Why is this called zeta5?
- This is the 5th version of the project. The `zeta4` library did the same thing but was written in spaghetti code.
3. How do I report a bug?
- Use the Issues tab on GitHub.
4. I still don't understand. Can you help me get this working?
- Yes! DM me on Discord (@kqwq) for help.