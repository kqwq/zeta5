import wtrc from "wrtc";

/**
 * Create a new peer connection with a data channel
 * @returns {Promise<{pc: RTCPeerConnection}>}
 */
export async function newPCWithDataChannel() {
  const pc = new wtrc.RTCPeerConnection();
  const dataChannel = pc.createDataChannel("chat");
  dataChannel.onopen = (x) => {
    dataChannel.send("open", x);
  };
  dataChannel.onclose = (x) => {
    dataChannel.send("close", x);
  };
  dataChannel.onmessage = (x) => {
    console.log("onmessage", x);
  };
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return { pc };
}

/**
 * Accept an answer from the remote peer
 * @param {*} localPC
 * @param {string} answer
 */
export async function acceptPCAnswer(localPC, sdpAnswer) {
  localPC.setRemoteDescription({
    type: "answer",
    sdp: sdpAnswer,
  });

  // If the connection is established, then send a message
  localPC.onconnectionstatechange = () => {
    if (cc.peerConnection.connectionState === "connected") {
      // Log
      console.log("Connection established");
      cc.isConnected = true;
      // Send message
      cc.peerConnection.createDataChannel("test");
    }
  };
}
