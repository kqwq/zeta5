/*
Goals
- Get github offers directory for webpage-client.js
- Get server IP for webpage-client.js
- Create connection info for webpage-client.js
- Take src/client/webpage-client.template.js and replace the placeholders with the connection info
- Create output/webpage-client.js
*/

import simpleGit from "simple-git";
import fs from "fs";

/**
 *
 * @returns {{serverIp: string, serverPort: number, offersUrl: string}}
 */
const setup = async () => {
  // Get remotes from git
  const git = simpleGit();
  const remotes = await git.getRemotes(true);
  const pushDir = remotes.find((remote) => remote.name === "origin").refs.push;
  const ghUsername = pushDir.split("/")[3];
  const ghRepoName = pushDir.split("/")[4].split(".")[0];
  const branch = await git.branch();
  const ghBranch = branch.current;
  const offersUrl = `https://cdn.jsdelivr.net/gh/${ghUsername}/${ghRepoName}@${ghBranch}/dist/offers`;

  // Get public server IP
  const response = await fetch("http://ip-api.com/json");
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const { query } = await response.json();
  const publicServerIP = query;

  // Create connection info
  const connectionInfo = {
    serverIp: publicServerIP,
    serverPort: 47777,
    offersUrl,
  };

  // Load template
  const template = await fs.promises.readFile(
    "src/client/webpage-client.template.js",
    {
      encoding: "utf-8",
    }
  );
  const startIndex = template.indexOf("//<<<");
  const endIndex = template.indexOf("//>>>") + 5;
  const newCode =
    template.slice(0, startIndex) +
    "const connectionInfo = " +
    JSON.stringify(connectionInfo) +
    ";\n" +
    template.slice(endIndex);

  // Write to output file
  if (!fs.existsSync("dist")) {
    fs.mkdirSync("dist");
  }
  if (!fs.existsSync("dist/offers")) {
    fs.mkdirSync("dist/offers");
  }
  if (!fs.existsSync("dist/scripts/")) {
    fs.mkdirSync("dist/scripts/");
  }
  // TODO !
  // await fs.promises.writeFile("dist/scripts/webpage-client.js", newCode);

  // Write to config.json file
  await fs.promises.writeFile(
    "dist/scripts/config.json",
    JSON.stringify(connectionInfo, null, 2)
  );

  // Log
  console.log("Configured client code in dist/scripts/webpage-client.js");

  // Return
  return connectionInfo;
};

setup();
