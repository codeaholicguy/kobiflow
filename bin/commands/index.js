"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.check = exports.list = exports.push = exports.commit = exports.start = undefined;

let start = (() => {
  var _ref = _asyncToGenerator(function* (ticketIds) {
    try {
      yield (0, _workspace.checkWorkspace)();

      const workingTickets = yield (0, _jira.getTickets)(ticketIds);

      if (workingTickets.length) {
        const workspace = {};
        const branchNames = workingTickets.map(function ({ ticketId }) {
          return `KOB-${ticketId}`;
        }).join("_");

        workspace[branchNames] = workingTickets;

        yield (0, _workspace.addWorkspace)(workspace);
        yield (0, _process.exec)(`git checkout -b ${branchNames}`);

        console.log("Init workspace successfully");
      } else {
        console.error("Init workspace failed, please double check your tickets");
      }
    } catch (err) {
      console.error(err.message);
    }
  });

  return function start(_x) {
    return _ref.apply(this, arguments);
  };
})();

let commit = (() => {
  var _ref2 = _asyncToGenerator(function* () {
    try {
      yield (0, _workspace.checkWorkspace)();

      const [stdout] = yield (0, _process.exec)("git status --short");
      const changes = stdout.split("\n").filter(function (item) {
        return item.length;
      }).map(function (item) {
        return item.split(" ")[2];
      });
      const { selectedChanges } = yield (0, _inquirer.prompt)({
        type: "checkbox",
        choices: changes,
        name: "selectedChanges",
        message: "Select file you want to add to the index before commit the work"
      });

      yield (0, _process.exec)(`git add ${selectedChanges.join(" ")}`);

      const { commitMessage } = yield (0, _inquirer.prompt)({
        type: "input",
        name: "commitMessage",
        message: "Enter a short and meaningful commit message"
      });

      yield (0, _process.exec)(`git commit -m "${commitMessage}"`);
    } catch (err) {
      console.error(err.message);
    }
  });

  return function commit() {
    return _ref2.apply(this, arguments);
  };
})();

let push = (() => {
  var _ref3 = _asyncToGenerator(function* () {
    try {
      const branchName = yield (0, _git.getCurrentBranchName)();

      yield (0, _workspace.checkWorkspace)();
      yield (0, _process.exec)(`git push -u origin ${branchName}`);

      const tickets = yield (0, _workspace.getWorkingTickets)(branchName);
      const ticketIds = tickets.map(function (ticket) {
        return `KOB-${ticket.ticketId}`;
      });
      const { title } = yield (0, _inquirer.prompt)({
        type: "input",
        name: "title",
        message: "Title of the pull request",
        default: `Submit work for ${ticketIds.toString()}`
      });

      const defaultBody = tickets.reduce(function (content, ticket) {
        content += `Follow https://kobiton.atlassian.net/browse/KOB-${ticket.ticketId}\n`;
        content += `\t- ${ticket.title}\n`;

        return content;
      }, "");

      yield (0, _fs.writeFile)("/tmp/kobiflow", defaultBody);
      yield (0, _process.spawnSync)(process.env["EDITOR"] || "vi", ["/tmp/kobiflow"], {
        stdio: "inherit",
        detached: true
      });

      const body = yield (0, _fs.readFile)("/tmp/kobiflow", "utf8");

      yield (0, _github.createPullRequest)(branchName, title, body);

      console.log("Create pull request successfully");
    } catch (err) {
      console.error(err.message);
    }
  });

  return function push() {
    return _ref3.apply(this, arguments);
  };
})();

let list = (() => {
  var _ref4 = _asyncToGenerator(function* () {
    try {
      const branchName = yield (0, _git.getCurrentBranchName)();
      const workspaces = yield (0, _workspace.listWorkspaces)();

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
  });

  return function list() {
    return _ref4.apply(this, arguments);
  };
})();

let check = (() => {
  var _ref5 = _asyncToGenerator(function* () {
    try {
      yield (0, _workspace.checkWorkspace)();

      console.log("Everything seems good, type 'kobiflow start' to start working, good luck!");
    } catch (err) {
      console.error(err.message);
    }
  });

  return function check() {
    return _ref5.apply(this, arguments);
  };
})();

var _inquirer = require("inquirer");

var _process = require("../services/process");

var _workspace = require("../services/workspace");

var _jira = require("../services/jira");

var _git = require("../services/git");

var _fs = require("../services/fs");

var _github = require("../services/github");

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.start = start;
exports.commit = commit;
exports.push = push;
exports.list = list;
exports.check = check;