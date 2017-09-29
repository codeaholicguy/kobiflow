#!/usr/bin/env node
"use strict";

var _commander = require("commander");

var _commander2 = _interopRequireDefault(_commander);

var _commands = require("./commands");

var _package = require("../package.json");

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version(_package2.default.version).description("Kobiflow - Kobiton work flow");

_commander2.default.command("start [ticketIds...]").description("Start working on tickets, open workspace").action(_commands.start);

_commander2.default.command("commit").description("Record changes to current workspace").action(_commands.commit);

_commander2.default.command("push").description("Push code to Github and auto create pull request").action(_commands.push);

_commander2.default.command("list").description("List all your workspaces").action(_commands.list);

_commander2.default.command("check").description("Check current workspace is good to go").action(_commands.check);

_commander2.default.parse(process.argv);

if (!process.argv.slice(2).length) {
  _commander2.default.outputHelp();
}