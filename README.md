# NOT FINISHED

# zeta5

A simple, easy-to-use library for connecting Khan Academy programs to a Node.js server.

## How to set up

### Router setup
0. Expose port 3478 on your router. You can find a guide [here](https://www.noip.com/support/knowledgebase/general-port-forwarding-guide/)
- Make sure the port is forwarded to the computer running the server

### Server-side setup
1. Clone this repository ```git clone https://github.com/kqwq/zeta5.git```
2. Find your public IPv4 address. You can use a website like [this one](https://www.whatismyip.com/what-is-my-public-ip-address/).
3. (Optional) Edit the `CONFIGURATION` variable in /server/index.js
  - Use the IPv4 address from step 2 for the public IP fields
4. cd into `/server`
5. Run ```npm install && npm run start```
6. Copy the connection code from the console

### PJS program setup
7. Copy and paste the contents of /client/pjs-client.js into the beginning of your program
8. Paste the connection code from step 6 into the input box at the top of the program

### Webpage setup
7. Include the following `<script>` tag in your webpage:
```html
<script src="https://raw.githubusercontent.com/kqwq/zeta5/main/client/webpage-client.js"></script>
```
8. Paste the connection code from step 6 into the input box at the top of the webpage

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