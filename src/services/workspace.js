import path from "path";

import { readFile, writeFile, access } from "./fs";
import { exec } from "./process";
import { getRepoName } from "./git";

const WORKSPACE_FILENAME = ".kobiflow";

async function checkWorkspace() {
  const projectPath = process.cwd();
  const projectDotGitPath = path.join(projectPath, ".git");

  try {
    await access(projectDotGitPath);
  } catch (err) {
    throw new Error("Please cd to the root of project");
  }

  try {
    const [stdout] = await exec("git remote show upstream");

    if (
      !/Fetch URL: https:\/\/github.com\/kobiton\/.+\.git/g.test(
        stdout.trim()
      ) ||
      !/Fetch URL: git@github\.com:kobiton\/.+\.git/g.test(stdout.trim())
    ) {
      throw new Error(
        "This is not Kobiton's repository, please try another repository"
      );
    }
  } catch (err) {
    if (err.message.toLowerCase().includes("not kobiton")) {
      throw err;
    } else {
      console.log(
        "Remote upstream does not exist, adding remote upstream to your current local repository"
      );

      const repoName = await getRepoName();

      await exec(
        `git remote add upstream https://github.com/kobiton/${repoName}.git`
      );
    }
  }
}

async function listWorkspaces() {
  await checkWorkspace();

  let workspaces;

  const projectPath = process.cwd();
  const workspacesPath = path.join(projectPath, WORKSPACE_FILENAME);

  try {
    await access(workspacesPath);

    const fileContent = await readFile(workspacesPath, "utf8");

    workspaces = JSON.parse(fileContent);
  } catch (err) {
    workspaces = {};
  }

  return workspaces;
}

async function addWorkspace(workspace) {
  await checkWorkspace();

  let workspaces;

  const projectPath = process.cwd();
  const workspacesPath = path.join(projectPath, WORKSPACE_FILENAME);

  try {
    await access(workspacesPath);

    const fileContent = await readFile(workspacesPath, "utf8");

    workspaces = JSON.parse(fileContent);
  } catch (err) {
    workspaces = {};
  }

  workspaces = { ...workspaces, ...workspace };

  await saveWorkspace(workspaces);

  return workspace;
}

async function saveWorkspace(workspace) {
  const projectPath = process.cwd();
  const workspacesPath = path.join(projectPath, WORKSPACE_FILENAME);

  await writeFile(workspacesPath, JSON.stringify(workspace));
}

async function getWorkingTickets(branchName) {
  const projectPath = process.cwd();
  const workspacesPath = path.join(projectPath, WORKSPACE_FILENAME);
  const fileContent = await readFile(workspacesPath, "utf8");
  const workspaces = JSON.parse(fileContent);

  return workspaces[branchName];
}

export { checkWorkspace, listWorkspaces, addWorkspace, getWorkingTickets };
