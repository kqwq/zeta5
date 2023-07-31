/**
 *
 */

const CONFIGURATION = {
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
  publicServerPort: 47777, // Default port is 47777 for zeta5

  /*
    specifics about the TURN server
  */
  listenToPort: 47777, // Listen to the same port to avoid IP/port confusion
};

// Imports
import fs from "fs";
import fetch from "node-fetch";
import Turn from "node-turn";
import wtrc from "wrtc";

// Constants
const offersDir = "dist/offers";
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  reset: "\x1b[0m",
};

// Globals
let connectionChannels = [];

function getHourlyFilename(date) {
  // Format YY-MM-DD-HH.js
  const leftPad2 = (num) => {
    return num.toString().padStart(2, "0");
  };
  const year = leftPad2(date.getUTCFullYear());
  const month = leftPad2(date.getUTCMonth());
  const day = leftPad2(date.getUTCDate());
  const hour = leftPad2(date.getUTCHours());
  return `${year}-${month}-${day}-${hour}.js`;
}

async function refreshOffers(numberOfOffers = 100) {
  // Create 100 SDP offers and save them to the offers directory
  for (let i = 0; i < numberOfOffers; i++) {
    const cc = connectionChannels[i];
    if (!cc || !cc.isConnected) {
      // Create offer
      const peerConnection = new wtrc.RTCPeerConnection();
      // On candidate
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("candidate", event.candidate);
        }
      };
      // Add to offers
      const offer = await peerConnection.createOffer();
      const connectionChannel = {
        isConnected: false,
        offer,
        peerConnection,
      };
      connectionChannels[i] = connectionChannel;
    }
  }

  // Remove all files in offers directory
  const files = await fs.promises.readdir(offersDir);
  for (const file of files) {
    await fs.promises.unlink(`${offersDir}/${file}`);
  }

  // Write offers to offers directory
  const date = new Date();
  const filename = getHourlyFilename(date);
  await fs.promises.writeFile(
    `${offersDir}/${filename}`,
    `window.sdp = ${JSON.stringify(
      connectionChannels.map((cc) =>
        cc?.isConnected ? "CONNECTED" : cc.offer.sdp
      ),
      null,
      2
    )};`
  );
  // Log
  console.log(
    colors.green,
    `Wrote ${numberOfOffers} offers to ${offersDir}/${filename}`,
    colors.reset
  );
}

async function main() {
  // Manage websocket connections
  const connections = [];

  await refreshOffers(3);

  // Listen with the TURN server
  const server = new Turn({
    listeningPort: CONFIGURATION.listenToPort,
    authMech: "long-term",
    credentials: {
      username: "password",
    },
  });
  server.onSdpPacket = (contents) => {
    const [identifier, sdpIndex, chunkNumber, data] = contents.split(":");
    const cc = connectionChannels[sdpIndex];
    if (!cc) {
      throw new Error("Invalid sdpIndex");
      return;
    }
    if (cc.isConnected) {
      throw new Error("Connection already established");
      return;
    }

    // Establish connection
    cc.peerConnection.setRemoteDescription({
      type: "answer",
      sdp: data,
    });
    cc.peerConnection.addEventListener("connectionstatechange", (event) => {
      if (cc.peerConnection.connectionState === "connected") {
        cc.isConnected = true;
        console.log("Connection established");
        // Send data
        cc.peerConnection.send("Hello world");
      }
    });
  };
  server.start();
  console.log("TURN server listening on port", CONFIGURATION.listenToPort);
}

main();
