#!/usr/bin/env node

import program from "commander";

import { start, commit, push, list, setup, cleanup, fix, open } from "./commands";
import pkg from "../package.json";

program
  .version(pkg.version)
  .description(
    "Kobiflow - Kobiton work flow. For the first time using this freaking cool tool, please type `kobiflow setup` for setting up the environment"
  );

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
  .command("setup")
  .description("Setup kobiflow for the first time")
  .action(setup);

program
  .command("cleanup")
  .description("Cleanup workspace")
  .action(cleanup);

program
  .command("fix")
  .description("Fix review comments, change ticket status")
  .action(fix);

program
  .command("open")
  .description("Open current working pull request on browser")
  .action(open);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
