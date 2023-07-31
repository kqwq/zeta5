const connectionInfo = {
  serverIp: "71.191.41.44",
  serverPort: 47777,
  offersUrl: "https://cdn.jsdelivr.net/gh/kqwq/zeta5@dev/dist/offers",
};

console.log("hello world!");

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
async function addScriptToDocument(src) {
  const script = document.createElement("script");
  script.src = src;
  document.body.appendChild(script);
  // Onload, return
  return new Promise((resolve) => {
    script.onload = resolve;
  });
}
async function main() {
  const dateStr = "2023-06-31-17";
  // const dateStr = getHourlyFilename(new Date());
  const filename = `${connectionInfo.offersUrl}/${dateStr}.js`;
  await addScriptToDocument(filename);
  console.log("Loaded offers from", offers);
}

document.addEventListener("DOMContentLoaded", main);
