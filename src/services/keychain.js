import { prompt } from "inquirer";

import { exec } from "./process";
import { verifyJiraToken } from "./jira";
import { verifyGithubToken } from "./github";

async function getJiraToken() {
  let token;
  const defaultKeychain = await getDefaultKeychain();

  try {
    const [stdout, stderr] = await exec(
      `security find-generic-password -s JIRA -g ${defaultKeychain}`
    );

    const username = /"acct"<blob>="(.*)"/g.exec(stdout.trim())[1];
    const password = /password: "(.*)"/g.exec(stderr.trim())[1];

    token = Buffer.from(`${username}:${password}`).toString("base64");
  } catch (err) {
    console.log(
      "JIRA account does not exist, please input your account (This will be stored in your machine keychain)"
    );

    const { username } = await prompt({
      type: "input",
      name: "username",
      message: "Username"
    });
    const { password } = await prompt({
      type: "password",
      name: "password",
      message: "Password"
    });

    token = Buffer.from(`${username}:${password}`).toString("base64");

    await verifyJiraToken(token);

    await exec(
      `security add-generic-password -s JIRA -a ${username} -w ${password} ${defaultKeychain}`
    );

    console.log("Your JIRA account added successfully");
  }

  return token;
}

async function getGithubToken() {
  let result;
  const defaultKeychain = await getDefaultKeychain();

  try {
    const [stdout, stderr] = await exec(
      `security find-internet-password -s github.com -g ${defaultKeychain}`
    );

    const username = /"acct"<blob>="(.*)"/g.exec(stdout.trim())[1];
    const token = /password: "(.*)"/g.exec(stderr.trim())[1];

    result = { username, token };
  } catch (err) {
    console.log(
      "Github account does not exist, please input your account (This will be stored in your machine keychain)"
    );

    console.log(
      "Please follow instruction on https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/ for getting access token"
    );

    const { username } = await prompt({
      type: "input",
      name: "username",
      message: "Username"
    });
    const { token } = await prompt({
      type: "password",
      name: "token",
      message: "Token"
    });

    result = { username, token };

    await verifyGithubToken(token);

    await exec(
      `security add-internet-password -s github.com -a ${username} -w ${token} ${defaultKeychain}`
    );

    console.log("Your Github account added successfully");
  }

  return result;
}

async function getDefaultKeychain() {
  const [stdout] = await exec("security default-keychain");
  const defaultKeychain = stdout.replace(/['"]+/g, "").trim();

  return defaultKeychain;
}

export { getJiraToken, getGithubToken };
