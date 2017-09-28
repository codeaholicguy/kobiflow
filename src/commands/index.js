import { prompt } from "inquirer";

import { exec } from "../services/process";
import {
  checkWorkspace,
  addWorkspace,
  listWorkspaces
} from "../services/workspace";
import { getTickets } from "../services/jira";

export async function start(ticketIds) {
  try {
    await checkWorkspace();

    const workingTickets = await getTickets(ticketIds);

    if (workingTickets.length) {
      const workspace = {};
      const branchNames = workingTickets
        .map(({ ticketId }) => `KOB-${ticketId}`)
        .join("_");

      workspace[branchNames] = workingTickets;

      await addWorkspace(workspace);
      await exec(`git checkout -b ${branchNames}`);

      console.log("Init workspace successfully");
    } else {
      console.error("Init workspace failed, please double check your tickets");
    }
  } catch (err) {
    console.error(err.message);
  }
}

export async function commit() {
  try {
    await checkWorkspace();

    const [stdout] = await exec("git status --short");
    const changes = stdout
      .split("\n")
      .filter(item => item.length)
      .map(item => item.split(" ")[2]);
    const { selectedChanges } = await prompt({
      type: "checkbox",
      choices: changes,
      name: "selectedChanges",
      message: "Select file you want to add to the index before commit the work"
    });

    await exec(`git add ${selectedChanges.join(" ")}`);

    const { commitMessage } = await prompt({
      type: "input",
      name: "commitMessage",
      message: "Enter a short and meaningful commit message"
    });

    await exec(`git commit -m "${commitMessage}"`);
  } catch (err) {
    console.error(err.message);
  }
}

export async function push() {
  try {
    await checkWorkspace();
    await exec("git push");
  } catch (err) {
    console.error(err.message);
  }
}

export async function list() {
  try {
    const workspaces = await listWorkspaces();

    for (const workspace of Object.keys(workspaces)) {
      console.log(`\t ${workspace}`);
    }
  } catch (err) {
    console.error(err.message);
  }
}

export async function check() {
  try {
    await checkWorkspace();

    console.log(
      "Everything seems good, type 'kobiflow start' to start working, good luck!"
    );
  } catch (err) {
    console.error(err.message);
  }
}
