/**
 *
 */

const CONFIGURATION = {
  /*
    authenticationType 
    OPTIONS: "cache" (default) | "no-cache" | "password" | "token"
    | cache: use cached credentials if available, otherwise create new credentials
    | no-cache: ignore cached credentials, create new credentials, and override cached credentials
    | password: use password authentication in CONFIGURATION.email and CONFIGURATION.password
    | token: use token authentication in CONFIGURATION.token

    NOTES:
    - Cached credentials are stored in the filesystem in /server/credentials.json
    - When the server generates new credentials, it will request a new user account
      directly from Khan Academy with a randomized email and password.
  */
  authenticationType: "cache",
  email: "", // Only used for password authentication
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

  /*
    specifics about the TURN server
  */
  listenToPort: 3478, // Default port is 3478
};

// Imports
import fs from "fs";
import Turn from "node-turn";

/*
  A reference of all the Khan Academy API endpoints used
*/
const fkey = "lol"; //`1.0_1njmvmicf891n1ll8t583p4mkr7n59tdo1e5m7102g0hjln3bv6ctf29132nenmkd20_1690745284361`;
const API = {
  signUp: (email, password) => {
    return fetch(
      "https://www.khanacademy.org/api/internal/graphql/signupLearnerWithPasswordMutation",
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: `fkey=${fkey}`,
          "x-ka-fkey": fkey,
        },
        method: "POST",
        body: JSON.stringify({
          operationName: "signupLearnerWithPasswordMutation",
          variables: {
            password: password,
            email: email,
            firstname: "User",
            lastname: "Agent",
            birthdate: "2000-04-01",
          },
          query:
            "mutation signupLearnerWithPasswordMutation($email: String!, $password: String!, $firstname: String!, $lastname: String!, $birthdate: Date!) {\n  signupLearnerWithPassword(email: $email, password: $password, firstname: $firstname, lastname: $lastname, birthdate: $birthdate) {\n    user {\n      id\n      kaid\n      canAccessDistrictsHomepage\n      isTeacher\n      hasUnresolvedInvitations\n      transferAuthToken\n      preferredKaLocale {\n        id\n        kaLocale\n        status\n        __typename\n      }\n      __typename\n    }\n    error {\n      code\n      __typename\n    }\n    __typename\n  }\n}\n",
        }),
      }
    );
  },
  login: (email, password) => {
    return fetch(
      "https://www.khanacademy.org/api/internal/graphql/loginWithPasswordMutation",
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: `fkey=${fkey}`,
          "x-ka-fkey": fkey,
        },
        method: "POST",
        body: JSON.stringify({
          operationName: "loginWithPasswordMutation",
          variables: { identifier: email, password: password },
          query:
            "mutation loginWithPasswordMutation($identifier: String!, $password: String!) {\n  loginWithPassword(identifier: $identifier, password: $password) {\n    user {\n      id\n      kaid\n      canAccessDistrictsHomepage\n      isTeacher\n      hasUnresolvedInvitations\n      transferAuthToken\n      preferredKaLocale {\n        id\n        kaLocale\n        status\n        __typename\n      }\n      __typename\n    }\n    isFirstLogin\n    error {\n      code\n      __typename\n    }\n    __typename\n  }\n}\n",
        }),
      }
    );
  },
  createProgram: (token, title, code) => {
    return fetch(
      "https://www.khanacademy.org/api/internal/graphql/createProgram",
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: `fkey=${fkey};KAAS=${token}`,
          "x-ka-fkey": fkey,
        },
        method: "POST",
        body: JSON.stringify({
          operationName: "createProgram",
          query:
            "mutation createProgram($title: String!, $userAuthoredContentType: UserAuthoredContentType!, $revision: ProgramRevisionInput!, $curationNodeSlug: String!) {\n  createProgram(title: $title, userAuthoredContentType: $userAuthoredContentType, revision: $revision, curationNodeSlug: $curationNodeSlug) {\n    program {\n      ...Program\n      __typename\n    }\n    error {\n      code\n      debugMessage\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment Program on Program {\n  id\n  latestRevision {\n    id\n    code\n    __typename\n  }\n  title\n  url\n  userAuthoredContentType\n  __typename\n}\n",
          variables: {
            title: title,
            userAuthoredContentType: "WEBPAGE",
            revision: {
              code: code,
              folds: [],
              imageUrl:
                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
              configVersion: 4,
            },
            curationNodeSlug: "computer-programming",
          },
        }),
      }
    );
  },
  updateProgram: (token, programId, title, code) => {
    return fetch(
      "https://www.khanacademy.org/api/internal/graphql/updateProgram",
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: `fkey=${fkey};KAAS=${token}`,
          "x-ka-fkey": fkey,
        },
        body: JSON.stringify({
          operationName: "updateProgram",
          query:
            "mutation updateProgram($programId: ID!, $title: String, $revision: ProgramRevisionInput!) {\n  updateProgram(programId: $programId, title: $title, revision: $revision) {\n    program {\n      ...Program\n      __typename\n    }\n    error {\n      code\n      debugMessage\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment Program on Program {\n  id\n  latestRevision {\n    id\n    code\n    __typename\n  }\n  title\n  url\n  userAuthoredContentType\n  __typename\n}\n",
          variables: {
            programId: programId,
            title: title,
            revision: {
              code: code,
              folds: [],
              imageUrl:
                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
              configVersion: 0,
            },
          },
        }),
        method: "POST",
      }
    );
  },
};

/**
 * Generates a random email address and password
 * @returns {{email: string, password: string}} {email, password}
 */
function generateRandomCredentials() {
  // Generates a random email (base32 lowercase) / password (base32 uppercase)
  const email = `${Math.random().toString(36).substring(2, 15)}@example.com`;
  const password = Math.random().toString(36).substring(2, 15).toUpperCase();
  return { email, password };
}

/**
  Creates a new user account on Khan Academy
  @param {string} email
  @param {string} password
  @returns {{token: string, kaid: string}} {token, kaid}
  @throws {Error} if sign up fails
*/
const signUp = async (email, password) => {
  const response = await API.signUp(email, password);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  // Get response cookies and extract the KAAS token (...KAAS=...)
  const cookies = response.headers.get("set-cookie");
  const token = cookies.match(/KAAS=([^;]+)/)?.[1];
  if (!token) {
    throw new Error("Could not find KAAS token in response cookies");
  }
  // Get KAID from response body
  const json = await response.json();
  return {
    token,
    kaid: json.data.signupLearnerWithPassword.user.kaid,
  };
};

/**
 * Login using password authentication
 * @param {string} email
 * @param {string} password
 * @returns {{token: string, kaid: string}} {token, kaid}
 * @throws {Error} if login fails
 */
const login = async (email, password) => {
  const response = await API.login(email, password);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  // Get response cookies and extract the KAAS token (...KAAS=...)
  const cookies = response.headers.get("set-cookie");
  console.log("cookies", cookies);
  const token = cookies.match(/KAAS=([^;]+)/)?.[1];
  if (!token) {
    throw new Error("Could not find KAAS token in response cookies");
  }
  // Get KAID from response body
  const json = await response.json();
  return {
    token,
    kaid: json.data.signupLearnerWithPassword.user.kaid,
  };
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
  const json = await response.json();
  console.log(json.data.createProgram.program);
  return json.data.createProgram.program.id; // programId
};

/**
 * Updates an existing program on Khan Academy
 * @param {string} token
 * @param {string} programId
 * @param {string} title
 * @param {string} code
 * @throws {Error} if program update fails
 * @returns {void}
 */
const updateProgram = async (token, programId, title, code) => {
  const response = await API.updateProgram(token, programId, title, code);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
};

/**
 *
 */

const main = async () => {
  // Get the public IP address of the server
  let publicServerIP = null;
  if (CONFIGURATION.publicServerIPEntry === "look-up") {
    const response = await fetch("http://ip-api.com/json");
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    ({ query: publicServerIP } = await response.json());
  } else if (CONFIGURATION.publicServerIPEntry === "known") {
    publicServerIP = CONFIGURATION.publicServerIP;
  }

  // Authenticate on Khan Academy
  let token = null;
  let kaid = null;
  switch (CONFIGURATION.authenticationType) {
    case "cache":
      try {
        ({ token } = JSON.parse(fs.readFileSync("./credentials.json")));
      } catch (e) {
        const { email, password } = generateRandomCredentials();
        ({ token, kaid } = await signUp(email, password));
        fs.writeFileSync(
          "./credentials.json",
          JSON.stringify({ token, kaid, email, password })
        );
      }
      break;

    case "no-cache":
      const { email, password } = generateRandomCredentials();
      ({ token, kaid } = await signUp(email, password));
      fs.writeFileSync(
        "./credentials.json",
        JSON.stringify({ token, kaid, email, password })
      );
      break;

    case "password":
      ({ token } = await login(CONFIGURATION.email, CONFIGURATION.password));
      break;

    case "token":
      token = CONFIGURATION.token;
      break;

    default:
      throw new Error(
        `Invalid authentication type: ${CONFIGURATION.authenticationType}`
      );
  }

  // Create new handshake program or update existing handshake program
  let handshakeProgramId = null;
  if (CONFIGURATION.handshakeProgramType === "create-new") {
    handshakeProgramId = await createProgram(
      token,
      CONFIGURATION.handshakeProgramTitle,
      `Status=new;Date=${new Date().toISOString()};`
    );
  } else if (CONFIGURATION.handshakeProgramType === "use-existing") {
    handshakeProgramId = CONFIGURATION.handshakeProgramId;
    await updateProgram(
      token,
      handshakeProgramId,
      CONFIGURATION.handshakeProgramTitle,
      `Status=update;Date=${new Date().toISOString()};`
    );
  } else {
    throw new Error(
      `Invalid handshake program type: ${CONFIGURATION.handshakeProgramType}`
    );
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
  const server = new Turn({
    authMech: "long-term",
    credentials: {
      username: "password",
    },
  });
  server.onSdpPacket = (contents) => {
    console.log("sdp", contents);
  };
  server.start();
  console.log("TURN server listening on port", CONFIGURATION.listenToPort);
};

main();
