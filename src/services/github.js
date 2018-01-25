import HttpStatusCodes from "http-status-codes";

import { getGithubToken } from "./keychain";
import { request } from "./request";
import { getRepoName } from "./git";

async function createPullRequest(branch, title, body) {
  const {
    token: githubToken,
    username: githubUsername
  } = await getGithubToken();
  const repoName = await getRepoName();

  const { statusCode, body: {html_url: url} } = await request({
    url: `https://api.github.com/repos/kobiton/${repoName}/pulls`,
    method: "post",
    json: true,
    headers: {
      Authorization: `token ${githubToken}`,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
    },
    body: {
      title,
      body,
      head: `${githubUsername}:${branch}`,
      base: "master"
    }
  });

  if (statusCode !== HttpStatusCodes.CREATED) {
    throw new Error(
      `Create pull request failed. ${statusCode}`
    );
  }

  return url;
}

async function getGithubUser() {
  let ok = false;
  let user;

  while (!ok) {
    const { token: githubToken } = await getGithubToken();
    const { body, statusCode } = await request({
      url: "https://api.github.com/user",
      method: "get",
      headers: {
        Authorization: `token ${githubToken}`,
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
      }
    });

    if (statusCode === HttpStatusCodes.OK) {
      ok = true;
      user = JSON.parse(body);
    }
  }

  return user;
}

async function verifyGithubToken(token) {
  const { statusCode } = await request({
    url: "https://api.github.com/user",
    method: "get",
    headers: {
      Authorization: `token ${token}`,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
    }
  });

  if (statusCode !== HttpStatusCodes.OK) {
    throw new Error("Your Github account is not valid");
  }
}

export { createPullRequest, getGithubUser, verifyGithubToken };
