"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.open = exports.fix = exports.cleanup = exports.setup = exports.list = exports.push = exports.commit = exports.start = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

        workspace[branchNames] = { tickets: workingTickets };

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
      yield (0, _process.exec)("git add .");

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
      yield (0, _workspace.checkWorkspace)();

      const branchName = yield (0, _git.getCurrentBranchName)();

      yield (0, _process.exec)(`git push -u origin ${branchName}`);

      const tickets = yield (0, _workspace.getWorkingTickets)(branchName);
      const ticketIds = tickets.map(function (ticket) {
        return ticket.ticketId;
      });
      const ticketCodes = tickets.map(function (ticket) {
        return `KOB-${ticket.ticketId}`;
      });

      let prTitle;

      if (tickets.length > 1) {
        prTitle = `Submit work for ${ticketCodes.join(" ")}`;
      } else {
        const ticket = tickets[0];
        const ticketCode = ticketCodes[0];

        prTitle = `[${ticketCode}] ${ticket.title}`;
      }

      const { title } = yield (0, _inquirer.prompt)({
        type: "input",
        name: "title",
        message: "Title of the pull request",
        default: prTitle
      });

      const defaultBody = tickets.reduce(function (content, ticket) {
        content += `Follow https://kobiton.atlassian.net/browse/KOB-${ticket.ticketId}\n`;
        content += `  - ${ticket.title}\n`;

        return content;
      }, "");

      const { body } = yield (0, _inquirer.prompt)({
        type: "editor",
        name: "body",
        message: "Compose your pull request description",
        default: defaultBody
      });

      const url = yield (0, _github.createPullRequest)(branchName, title, body);
      const workspace = yield (0, _workspace.getWorkspace)(branchName);

      yield (0, _workspace.updateWorkspace)({ [branchName]: _extends({}, workspace, { url }) });

      console.log("Create pull request successfully");

      yield (0, _jira.doTransition)(ticketIds, _jira.TICKET_STATUS.WAIT_FOR_MERGE);

      console.log("Pushing code completed");
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
          console.log(`-> ${workspace} (${workspaces[workspace].url || "work in progress"})`);
        } else {
          console.log(`   ${workspace} (${workspaces[workspace].url || "work in progress"})`);
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

let setup = (() => {
  var _ref5 = _asyncToGenerator(function* () {
    try {
      yield (0, _workspace.checkWorkspace)();
      yield (0, _jira.getJiraUser)();
      yield (0, _github.getGithubUser)();

      console.log("Everything seems good, type 'kobiflow start' to start working, good luck!");
    } catch (err) {
      console.error(err.message);
    }
  });

  return function setup() {
    return _ref5.apply(this, arguments);
  };
})();

let cleanup = (() => {
  var _ref6 = _asyncToGenerator(function* () {
    try {
      yield (0, _workspace.checkWorkspace)();

      const { option } = yield (0, _inquirer.prompt)({
        type: "list",
        choices: [{
          name: "Delete all branches except master",
          value: "all"
        }, { name: "Select branch to delete", value: "select" }],
        name: "option",
        message: "What do you want dude?"
      });

      if (option === "all") {
        yield (0, _process.exec)("git branch | grep -v 'master' | xargs git branch -D");
      } else {
        const [stdout] = yield (0, _process.exec)("git branch --format '%(refname:lstrip=2)'");
        const branches = stdout.split("\n").filter(function (item) {
          return item.length;
        });
        const { selectedBranches } = yield (0, _inquirer.prompt)({
          type: "checkbox",
          choices: branches,
          name: "selectedBranches",
          message: "Select branches you want to delete"
        });

        yield (0, _process.exec)(`git branch -D ${selectedBranches.join(" ")}`);
      }

      console.log("Cleanup successfully");
    } catch (err) {
      console.error(err.message);
    }
  });

  return function cleanup() {
    return _ref6.apply(this, arguments);
  };
})();

let fix = (() => {
  var _ref7 = _asyncToGenerator(function* () {
    try {
      yield (0, _workspace.checkWorkspace)();

      const branchName = yield (0, _git.getCurrentBranchName)();
      const tickets = yield (0, _workspace.getWorkingTickets)(branchName);
      const ticketIds = tickets.map(function (ticket) {
        return ticket.ticketId;
      });

      yield (0, _jira.doTransition)(ticketIds, _jira.TICKET_STATUS.IN_PROGRESS);

      console.log("Great, now you can start fixing your pull request");
    } catch (err) {
      console.error(err.message);
    }
  });

  return function fix() {
    return _ref7.apply(this, arguments);
  };
})();

let open = (() => {
  var _ref8 = _asyncToGenerator(function* () {
    try {
      yield (0, _workspace.checkWorkspace)();

      const branchName = yield (0, _git.getCurrentBranchName)();
      const workspace = yield (0, _workspace.getWorkspace)(branchName);

      if (!workspace.url) {
        throw new Error("This workspace has not been completed yet");
      }

      yield (0, _process.exec)(`open ${workspace.url}`);
    } catch (err) {
      console.error(err.message);
    }
  });

  return function open() {
    return _ref8.apply(this, arguments);
  };
})();

var _inquirer = require("inquirer");

var _process = require("../services/process");

var _workspace = require("../services/workspace");

var _jira = require("../services/jira");

var _git = require("../services/git");

var _github = require("../services/github");

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.start = start;
exports.commit = commit;
exports.push = push;
exports.list = list;
exports.setup = setup;
exports.cleanup = cleanup;
exports.fix = fix;
exports.open = open;