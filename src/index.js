#!/usr/bin/env node

import program from "commander";

import { start, commit, push, list, check } from "./commands";

program.version("0.0.1").description("Kobiflow - Kobiton work flow");

program
  .command("start [ticketIds...]")
  .description("Start working on tickets, open workspace")
  .action(start);

program
  .command("commit")
  .description("Record changes to current workspace")
  .action(commit);

program
  .command("push")
  .description("Push code to Github and auto create pull request")
  .action(push);

program
  .command("list")
  .description("List all your workspaces")
  .action(list);

program
  .command("check")
  .description("Check current workspace is good to go")
  .action(check);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
