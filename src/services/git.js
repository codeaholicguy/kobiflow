import { exec } from "./process";

async function getRepoName() {
  const [stdout] = await exec("basename `git rev-parse --show-toplevel`");

  return stdout.trim();
}

async function getCurrentBranchName() {
  const [stdout] = await exec("git rev-parse --abbrev-ref HEAD");

  return stdout.trim();
}

export { getRepoName, getCurrentBranchName };
