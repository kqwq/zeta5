/**
 *
 */

const CONFIGURATION = {
  /*
    authenticationType 
    OPTIONS: "cache" (default) | "no-cache" | "password" | "token"
    | cache: use cached credentials if available, otherwise create new credentials
    | no-cache: ignore cached credentials, create new credentials, and override cached credentials
    | password: use password authentication in CONFIGURATION.username and CONFIGURATION.password
    | token: use token authentication in CONFIGURATION.token

    NOTES:
    - Cached credentials are stored in the filesystem in /server/credentials.json
    - When the server generates new credentials, it will request a new user account
      directly from Khan Academy with a randomized username and password.
  */
  authenticationType: "cache",
  username: "", // Only used for password authentication
  password: "", // Only used for password authentication
  token: "", // Only used for token authentication

  /*
    handshakeProgramType 
    OPTIONS: "create-new" (default) | "use-existing"
    | create-new: create a new handshake program on Khan Academy
    | use-existing: update this user's existing program of ID CONFIGURATION.handshakeProgramId
  */
  handshakeProgramType: "create-new",
  handshakeProgramId: "", // Only used for use-existing handshake program type
  handshakeProgramTitle: "zeta5 Handshake Program",

  /*
    publicServerIPEntry
    OPTIONS: "look-up" (default) | "known"
    | look-up: fetch https://ip-api.com/ to look up the public IPv4 address of the server
    | known: use the known public IPv4 address of the server. example: "1.1.1.1"

    NOTES:
    - Depending on your router config, you may need to expose port 3478 to the internet.
      Instructions to do so are in the README.
      
  */
  publicServerIPEntry: "look-up",
  publicServerIP: "", // Only used for known public server IP type
};

// Imports
import fs from "fs";

/*
  A reference of all the Khan Academy API endpoints used
*/
const headers = {
  "Content-Type": "application/json",
};
const body = {
  loginWithPasswordMutation: (username, password) =>
    JSON.stringify({ "...": "..." }),
};
const API = {
  signUp: (username, password) => {
    return fetch("https://www.khanacademy.org/api/internal/user/signup", {
      headers,
      body: body.loginWithPasswordMutation,
    });
  },
  login: (username, password) => {
    return fetch("https://www.khanacademy.org/api/internal/user/login", {
      headers,
      body: body.loginWithPasswordMutation,
    });
  },
  createProgram: (token, title, code) => {
    return fetch("https://www.khanacademy.org/api/internal/user/signup", {
      headers,
      body: body.loginWithPasswordMutation,
    });
  },
  updateProgram: (token, programId, title, code) => {
    return fetch("https://www.khanacademy.org/api/internal/user/signup", {
      headers,
      body: body.loginWithPasswordMutation,
    });
  },
};

/**
  Creates a new user account on Khan Academy
  @param {string} username
  @param {string} password
  @returns {string} token
  @throws {Error} if sign up fails
*/
const signUp = async () => {
  // Generates a random username (base32 uppercase) / password (base32 lowercase)
  const randomUsername =
    "User agent " + Math.random().toString(36).substring(2, 9).toUpperCase();
  const randomPassword = Math.random().toString(36).substring(2, 15);
  const response = await API.signUp(randomUsername, randomPassword);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = await response.json();
  console.log(data);
};

/**
 * Login using password authentication
 * @param {string} username
 * @param {string} password
 * @returns {string} token
 * @throws {Error} if login fails
 */
const login = async (username, password) => {
  const response = await API.login(username, password);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = await response.json();
  console.log(data);
};

/**
 * Creates a new program on Khan Academy
 * @param {string} token
 * @param {string} title
 * @param {string} code
 * @returns {string} programId
 * @throws {Error} if program creation fails
 */
const createProgram = async (token, title, code) => {
  const response = await API.createProgram(token, title, code);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = await response.json();
  console.log(data);
};

/**
 * Updates an existing program on Khan Academy
 * @param {string} token
 * @param {string} programId
 * @param {string} code
 * @throws {Error} if program update fails
 * @returns {void}
 */
const updateProgram = async (token, programId, code) => {
  const response = await API.updateProgram(token, programId, code);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = await response.json();
  console.log(data);
};

/**
 *
 */

const main = async () => {
  // Authenticate
  let token = null;
  switch (CONFIGURATION.authenticationType) {
    case "cache":
      try {
        ({ token } = JSON.parse(fs.readFileSync("./credentials.json")));
      } catch (e) {
        token = await signUp();
        fs.writeFileSync("./credentials.json", JSON.stringify({ token }));
      }
      break;

    case "no-cache":
      token = await signUp();
      fs.writeFileSync("./credentials.json", JSON.stringify({ token }));
      break;

    case "password":
      token = await login(CONFIGURATION.username, CONFIGURATION.password);
      break;

    case "token":
      token = CONFIGURATION.token;
      break;

    default:
      throw new Error(
        `Invalid authentication type: ${CONFIGURATION.authenticationType}`
      );
  }

  // Create handshake program if necessary
  let handshakeProgramId = null;
  if (CONFIGURATION.handshakeProgramType === "create-new") {
    handshakeProgramId = await createProgram(
      token,
      "handshake",
      "zeta5 handshake program"
    );
  } else if (CONFIGURATION.handshakeProgramType === "use-existing") {
    handshakeProgramId = CONFIGURATION.handshakeProgramId;
  }

  // Get the public IP address of the server
  let publicServerIP = null;
  if (CONFIGURATION.publicServerIPEntry === "look-up") {
    const response = await fetch("https://ip-api.com/json");
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    ({ query: publicServerIP } = await response.json());
  } else if (CONFIGURATION.publicServerIPEntry === "known") {
    publicServerIP = CONFIGURATION.publicServerIP;
  }

  // Log the connection code
  const colors = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    reset: "\x1b[0m",
  };
  console.log(
    `Connection code (copy / paste)\n\n` +
      colors.green +
      `zeta:v5.0:${publicServerIP}:${handshakeProgramId}` +
      colors.reset +
      `\n\n ^ ^ ^ `
  );

  // Manage websocket connections
  const connections = [];

  // If a client tries to connect, complete the handshake by updating the handshake program
  //...

  // Listen with the TURN server
  //...
};
