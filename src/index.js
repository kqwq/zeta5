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
import { commitToGithub, updateOffersDirectory } from "./lib/github.js";
import { acceptPCAnswer, newPCWithDataChannel } from "./lib/webrtc.js";

// Globals
const badConnectStates = ["failed", "disconnected", "closed"];
let peerConnections = [];

async function refreshOffers(numberOfOffers = 100) {
  // Create 100 SDP offers and save them to the offers directory
  for (let i = 0; i < numberOfOffers; i++) {
    const pc = peerConnections[i];
    if (!pc || badConnectStates.includes(pc.connectionState)) {
      peerConnections[i] = newPCWithDataChannel();
    }
  }
}

/**
 * Recieves a chunk of an SDP offer and merges it with the other chunks,
 * if all chunks are present then return it
 * @param {string} contents
 * @returns {Promise<string | null>}
 */
async function mergeSDPChunks(contents) {
  // Make sure contents are valid
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
  const pc = peerConnections[sdpIndex];
  if (!pc) {
    throw new Error("Invalid sdpIndex" + sdpIndex);
  }
  if (pc.connectionState === "connected") {
    throw new Error("Connection already established");
  }
  if (badConnectStates.includes(pc.connectionState)) {
    throw new Error("Connection in bad state: " + pc.connectionState);
  }

  // Add chunk to peer connection
  if (!pc.sdpChunks) {
    pc.sdpChunks = [];
  }
  pc.sdpChunks.push({
    index: chunkIndex,
    chunk,
  });

  // If all chunks from index 0 to totalChunks - 1 are present, then we can establish the connection
  if (pc.sdpChunks.length !== totalChunks) {
    return null;
  }

  // If all chunks are present, then we can establish the connection
  const sdp = cc.sdpChunks
    .sort((a, b) => a.index - b.index)
    .map((c) => c.chunk)
    .join("");
  return sdp;
}

async function main() {
  // Start by creating 100 peer connection offers, saving them to the offers directory, and committing to github
  await refreshOffers(100);
  await updateOffersDirectory(peerConnections);
  await commitToGithub("Update offers");

  // Start up a TURN server to listen for SDP answers
  const turnServer = new Turn({
    listeningPort: CONFIGURATION.listenToPort,
    authMech: "long-term",
    credentials: {
      username: "password",
    },
  });
  turnServer.onSdpPacket = async (contents) => {
    try {
      // Log
      // console.log("onSdpPacket", JSON.stringify(contents));
      const sdpAnswer = await mergeSDPChunks(contents);
      await acceptPCAnswer(cc.pc, sdpAnswer);
    } catch (error) {
      console.error(error);
    }
  };
  turnServer.start();

  // Log
  console.log("TURN server listening on port", CONFIGURATION.listenToPort);
}

main();
