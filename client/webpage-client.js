const ip = "198.251.74.16";
var linkId = "5918360080531456";

const pc = new RTCPeerConnection({
  iceServers: [
    {
      urls: [`turn:${serverIp}:3478`],
      username: content,
      credential: "1",
    },
  ],
  iceCandidatePoolSize: 1,
});
