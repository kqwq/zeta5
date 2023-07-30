async function connect(connectionString) {
  const [zeta, version, serverIp, handshakeProgramId] =
    connectionString.split(":");
  var pc = new RTCPeerConnection({
    iceServers: [
      {
        urls: [`turn:${serverIp}:3478`],
        username: "testing-ok",
        credential: "auth-token",
      },
    ],
  });

  console.log("Sent TURN request to", serverIp, pc);
}

async function main() {
  // Create a new connection string input
  const input = document.createElement("input");
  input.id = "zeta-connection-string";
  input.type = "text";
  input.placeholder = "zeta:version:server-ip:handshake-program-id";
  input.style = `
    height: 30px;
    width: 300px;
    margin: 2px;
    border-radius: 5px;
    text-align: center;
      `;
  const div = document.createElement("div");
  div.id = "zeta-status-bar";
  div.style = `
     display: flex;
     justify-content: center;
     align-items: center;
     font-family: sans-serif;
     top: 0;
     left: 0; 
     width: 100%;
     height: 40px; 
     background-color: #F1C40F;
     gap: 5px;
     `;
  div.innerHTML = `Not connected`;
  div.appendChild(input);
  document.body.prepend(div);

  // Set triggers
  input.addEventListener("change", (e) => {
    const connectionString = e.target.value;
    if (connectionString) {
      div.innerHTML = `Connecting to ${connectionString}...`;
      try {
        connect(connectionString);
      } catch (e) {
        console.error(e);
        div.innerHTML = `[CHECK CONSOLE] Error: ${e.message}`;
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", main);
