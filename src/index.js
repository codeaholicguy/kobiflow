#!/usr/bin/env node

import program from "commander";
import Promise from "bluebird";
import HttpStatusCodes from "http-status-codes";

import { prompt } from "inquirer";

import { getJiraToken } from "./services/keychain";
import { execAsync } from "./services/process";
import { writeFileAsync } from "./services/fs";

const requestAsync = Promise.promisify(require("request"));

program.version("0.0.1").description("Kobiflow - Kobiton work flow");

program
  .command("start [ticketIds...]")
  .description("Start working on tickets, open workspace")
  .action(start);

program
  .command("commit")
  .description("Record changes to current workspace")
  .action(commit);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

async function start(ticketIds) {
  try {
    const jiraRequests = ticketIds.map(ticketId => {
      return {
        ticketId,
        url: `https://kobiton.atlassian.net/rest/api/latest/issue/KOB-${ticketId}`
      };
    });
    const jiraToken = await getJiraToken();
    const workingTickets = [];

    for (const { url, ticketId } of jiraRequests) {
      const { body, statusCode } = await requestAsync({
        url,
        method: "get",
        headers: {
          Authorization: `Basic ${jiraToken}`
        }
      });

      if (statusCode === HttpStatusCodes.OK) {
        workingTickets.push({
          ticketId,
          title: JSON.parse(body).fields.summary
        });
      } else {
        console.error(`Ticket KOB-${ticketId} is not found`);
      }
    }

    if (workingTickets.length) {
      await writeFileAsync(
        `${process.cwd()}/.kobiflow`,
        JSON.stringify(workingTickets)
      );

      const branchNames = workingTickets
        .map(({ ticketId }) => `KOB-${ticketId}`)
        .join("_");

      await execAsync(`git checkout -b ${branchNames}`);

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
    const [stdout] = await execAsync("git status --short");
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

    await execAsync(`git add ${selectedChanges.join(" ")}`);

    const { commitMessage } = await prompt({
      type: "input",
      name: "commitMessage",
      message: "Enter a short and meaningful commit message"
    });

    await execAsync(`git commit -m "${commitMessage}"`);
  } catch (err) {
    console.error(err.message);
  }
}
