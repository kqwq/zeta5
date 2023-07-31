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
      // Create and add offer
      const peerConnection = new wtrc.RTCPeerConnection();
      const sendChannel = peerConnection.createDataChannel("sendChannel");
      sendChannel.onopen = (x) => {
        sendChannel.send("open", x);
      };
      sendChannel.onclose = (x) => {
        sendChannel.send("close", x);
      };
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
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
    try {
      // Log
      console.log("onSdpPacket", JSON.stringify(contents));
      if (!contents.includes(":")) {
        throw new Error("Invalid contents");
      }

      // Extract contents
      const [identifier, chunkIndexStr, totalChunksStr, sdpIndexStr, ...rest] =
        contents.split(":");
      const chunk = rest.join(":");
      const chunkIndex = parseInt(chunkIndexStr);
      const totalChunks = parseInt(totalChunksStr);
      const sdpIndex = parseInt(sdpIndexStr);

      // Make sure connectionChannels[sdpIndex] is valid
      const cc = connectionChannels[sdpIndex];
      if (!cc) {
        throw new Error("Invalid sdpIndex" + sdpIndex);
      }
      if (cc.isConnected) {
        throw new Error("Connection already established");
      }

      // Add chunk to cc.sdpChunks
      if (!cc.sdpChunks) {
        cc.sdpChunks = [];
      }
      cc.sdpChunks.push({
        index: chunkIndex,
        chunk,
      });

      // If all chunks from index 0 to totalChunks - 1 are present, then we can establish the connection
      if (cc.sdpChunks.length !== totalChunks) {
        return;
      }

      // If all chunks are present, then we can establish the connection
      const sdp = cc.sdpChunks
        .sort((a, b) => a.index - b.index)
        .map((c) => c.chunk)
        .join("");
      console.log("sdp", sdp);
      cc.peerConnection.setRemoteDescription({
        type: "answer",
        sdp,
      });

      // If the connection is established, then send a message
      cc.peerConnection.onconnectionstatechange = () => {
        if (cc.peerConnection.connectionState === "connected") {
          // Log
          console.log("Connection established");
          cc.isConnected = true;
          // Send message
          cc.peerConnection.createDataChannel("test");
        }
      };
    } catch (error) {
      console.error("error", error.message);
    }
  };
  server.start();
  console.log("TURN server listening on port", CONFIGURATION.listenToPort);
}

main();
