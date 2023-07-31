//<<< Replace everything between the triple arrows with the updated connection info
const connectionInfo = {};
//>>>

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
const directory = `https://cdn.jsdelivr.net/gh/kqwq/zeta5@dev/offers`;
const dateStr = getHourlyFilename(new Date());
const filename = `${directory}/${dateStr}`;
top.$.getJSON(filename, (data) => {
  console.log(data);
});
