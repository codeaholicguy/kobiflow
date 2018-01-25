import { prompt } from "inquirer";

import { exec } from "../services/process";
import {
  checkWorkspace,
  addWorkspace,
  listWorkspaces,
  getWorkingTickets,
  updateWorkspace
} from "../services/workspace";
import {
  getTickets,
  getJiraUser,
  doTransition,
  TICKET_STATUS
} from "../services/jira";
import { getCurrentBranchName } from "../services/git";
import { createPullRequest, getGithubUser } from "../services/github";

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
    await exec("git add .");

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
    await checkWorkspace();

    const branchName = await getCurrentBranchName();

    await exec(`git push -u origin ${branchName}`);

    const tickets = await getWorkingTickets(branchName);
    const ticketIds = tickets.map(ticket => ticket.ticketId);
    const ticketCodes = tickets.map(ticket => `KOB-${ticket.ticketId}`);

    let prTitle;

    if (tickets.length > 1) {
      prTitle = `Submit work for ${ticketCodes.join(" ")}`;
    } else {
      const ticket = tickets[0];
      const ticketCode = ticketCodes[0];

      prTitle = `[${ticketCode}] ${ticket.title}`;
    }

    const { title } = await prompt({
      type: "input",
      name: "title",
      message: "Title of the pull request",
      default: prTitle
    });

    const defaultBody = tickets.reduce((content, ticket) => {
      content += `Follow https://kobiton.atlassian.net/browse/KOB-${ticket.ticketId}\n`;
      content += `  - ${ticket.title}\n`;

      return content;
    }, "");

    const { body } = await prompt({
      type: "editor",
      name: "body",
      message: "Compose your pull request description",
      default: defaultBody
    });

    const url = await createPullRequest(branchName, title, body);
    const workspace = await getWorkingTickets(branchName);

    await updateWorkspace({...workspace, url});

    console.log("Create pull request successfully");

    await doTransition(ticketIds, TICKET_STATUS.WAIT_FOR_MERGE);

    console.log("Pushing code completed");
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

async function setup() {
  try {
    await checkWorkspace();
    await getJiraUser();
    await getGithubUser();

    console.log(
      "Everything seems good, type 'kobiflow start' to start working, good luck!"
    );
  } catch (err) {
    console.error(err.message);
  }
}

async function cleanup() {
  try {
    await checkWorkspace();

    const { option } = await prompt({
      type: "list",
      choices: [
        {
          name: "Delete all branches except master",
          value: "all"
        },
        { name: "Select branch to delete", value: "select" }
      ],
      name: "option",
      message: "What do you want dude?"
    });

    if (option === "all") {
      await exec("git branch | grep -v 'master' | xargs git branch -D");
    } else {
      const [stdout] = await exec("git branch --format '%(refname:lstrip=2)'");
      const branches = stdout.split("\n").filter(item => item.length);
      const { selectedBranches } = await prompt({
        type: "checkbox",
        choices: branches,
        name: "selectedBranches",
        message: "Select branches you want to delete"
      });

      await exec(`git branch -D ${selectedBranches.join(" ")}`);
    }

    console.log("Cleanup successfully");
  } catch (err) {
    console.error(err.message);
  }
}

async function fix() {
  try {
    await checkWorkspace();

    const branchName = await getCurrentBranchName();
    const tickets = await getWorkingTickets(branchName);
    const ticketIds = tickets.map(ticket => ticket.ticketId);

    await doTransition(ticketIds, TICKET_STATUS.IN_PROGRESS);

    console.log("Great, now you can start fixing your pull request");
  } catch (err) {
    console.error(err.message);
  }
}

async function open() {
  try {
    await checkWorkspace();

    const branchName = await getCurrentBranchName();
    const workspace = await getWorkingTickets(branchName);

    if (!workspace.url) {
      throw new Error("This workspace has not been completed yet");
    }

    await exec(`open ${workspace.url}`);
  } catch (err) {
    console.error(err.message);
  }
}

export { start, commit, push, list, setup, cleanup, fix, open };
