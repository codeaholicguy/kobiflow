import HttpStatusCodes from "http-status-codes";

import { getGithubToken, getGithubUsername } from "./keychain";
import { request } from "./request";
import { getRepoName } from "./git";

async function createPullRequest(branch, title, body) {
  const githubUsername = await getGithubUsername();
  const githubToken = await getGithubToken();
  const repoName = await getRepoName();

  const { statusCode, body: responseBody } = await request({
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
    throw new Error(`Create pull request failed. ${JSON.stringify(responseBody)}`);
  }
}

export { createPullRequest };
