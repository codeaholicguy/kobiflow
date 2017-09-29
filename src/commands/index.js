import { prompt } from "inquirer";

import { exec, spawnSync } from "../services/process";
import {
  checkWorkspace,
  addWorkspace,
  listWorkspaces,
  getWorkingTickets
} from "../services/workspace";
import { getTickets } from "../services/jira";
import { getCurrentBranchName } from "../services/git";
import { readFile, writeFile } from "../services/fs";
import { createPullRequest } from "../services/github";

async function start(ticketIds) {
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

async function commit() {
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

async function push() {
  try {
    const branchName = await getCurrentBranchName();

    await checkWorkspace();
    await exec(`git push -u origin ${branchName}`);

    const tickets = await getWorkingTickets(branchName);
    const ticketIds = tickets.map(ticket => `KOB-${ticket.ticketId}`);
    const { title } = await prompt({
      type: "input",
      name: "title",
      message: "Title of the pull request",
      default: `Submit work for ${ticketIds.toString()}`
    });

    const defaultBody = tickets.reduce((content, ticket) => {
      content += `Follow https://kobiton.atlassian.net/browse/KOB-${ticket.ticketId}\n`;
      content += `\t- ${ticket.title}\n`;

      return content;
    }, "");

    await writeFile("/tmp/kobiflow", defaultBody);
    await spawnSync(process.env["EDITOR"] || "vi", ["/tmp/kobiflow"], {
      stdio: "inherit",
      detached: true
    });

    const body = await readFile("/tmp/kobiflow", "utf8");

    await createPullRequest(branchName, title, body);

    console.log("Create pull request successfully");
  } catch (err) {
    console.error(err.message);
  }
}

async function list() {
  try {
    const branchName = await getCurrentBranchName();
    const workspaces = await listWorkspaces();

    for (const workspace of Object.keys(workspaces)) {
      if (branchName === workspace) {
        console.log(`->${workspace}`);
      } else {
        console.log(`  ${workspace}`);
      }
    }
  } catch (err) {
    console.error(err.message);
  }
}

async function check() {
  try {
    await checkWorkspace();

    console.log(
      "Everything seems good, type 'kobiflow start' to start working, good luck!"
    );
  } catch (err) {
    console.error(err.message);
  }
}

export { start, commit, push, list, check };
