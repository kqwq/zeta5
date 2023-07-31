# NOT FINISHED

# zeta5

A simple, easy-to-use, zero-configuration library for connecting Khan Academy programs to a Node.js server.

## Initial setup
All of these instructions only need to be followed once to configure everything for the first time.

### Router setup
1. Expose port 3478 on your router. You can find a guide [here](https://www.noip.com/support/knowledgebase/general-port-forwarding-guide/)
- Make sure the port is forwarded to the computer running the server

### Server-side setup 
2. Fork this repository on GitHub. This step is required for automatic hourly commits.
3. Clone your forked repository ```git clone https://github.com/<Your GitHub username>/zeta5.git```
4. Run ```npm install && npm run setup```
  - Before continuing, make sure /dist/scripts/webpage-cilent.js exists

### Khan Academy Webpage setup
5. Include the following `<script>` tag in your webpage:
```html
<script src="https://cdn.jsdelivr.net/gh/<Your GitHub username>/zeta5@main/dist/scripts/webpage-client.js"></script>
```
1. Paste the connection code from step 6 into the input box at the top of the webpage

## Customizing the server

All server code is well-documented in /server/index.js.

## Customizing the client



## FAQ
1. Does this break the guidelines?
- I'm not sure. Use at your own discretion.
2. Why is this called zeta5?
- This is the 5th version of the project. The `zeta4` library did the same thing but was written in spaghetti code.
3. How do I report a bug?
- Use the Issues tab on GitHub.
4. I still don't understand. Can you help me get this working?
- Yes! DM me on Discord (@kqwq) for help.