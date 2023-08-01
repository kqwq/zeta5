import fs from "fs";
import simpleGit from "simple-git";

// Constants
const offersDir = "dist/offers";
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  reset: "\x1b[0m",
};

/**
 *
 * @param {Date} date
 * @returns {string} "YYYY-MM-DD-HH"
 */
function getDashedDate(date) {
  const leftPad2 = (num) => {
    return num.toString().padStart(2, "0");
  };
  const year = date.getUTCFullYear();
  const month = leftPad2(date.getUTCMonth());
  const day = leftPad2(date.getUTCDate());
  const hour = leftPad2(date.getUTCHours());
  return `${year}-${month}-${day}-${hour}`;
}

export async function updateOffersDirectory(connectionChannels) {
  // Get filename
  const date = new Date();
  const dashedDate = getDashedDate(date);

  // Remove all files in offers directory (except for ones with the same year-month-day-hour)
  // We keep these so the client knows to continue fetching for year-month-day-hour.REVISION.js
  // until it gets a 404, increasing the revision number each time
  const files = await fs.promises.readdir(offersDir);
  for (const file of files) {
    if (!file.startsWith(dashedDate)) {
      await fs.promises.unlink(`${offersDir}/${file}`);
    }
  }

  // Write offers to offers directory
  const code = `window.sdp = ${JSON.stringify(
    connectionChannels.map((cc) =>
      // Blank if already connected, encoded in base64 if available
      cc?.isConnected ? "" : Buffer.from(cc.offer.sdp).toString("base64")
    ),
    null,
    2
  )};`;
  for (let i = 0; i < 50; i++) {
    // If the file already exists, then we need to increment the revision number
    const filename = `${dashedDate}.${i}.js`;
    const filepath = `${offersDir}/${filename}`;
    try {
      fs.promises.writeFile(filepath, code);
      console.log(colors.green, "Wrote to", filepath, colors.reset);
      break;
    } catch (error) {
      console.log(colors.red, "Error writing to", filepath, colors.reset);
    }
  }
}

export async function commitToGithub(message = "") {
  const git = simpleGit();
  await git.add(".");
  await git.commit(message);
  await git.push();
  console.log(colors.green, "Pushed to Github", colors.reset);
}
