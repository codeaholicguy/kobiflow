"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getWorkingTickets = exports.addWorkspace = exports.listWorkspaces = exports.checkWorkspace = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let checkWorkspace = (() => {
  var _ref = _asyncToGenerator(function* () {
    const projectPath = process.cwd();
    const projectDotGitPath = _path2.default.join(projectPath, ".git");

    try {
      yield (0, _fs.access)(projectDotGitPath);
    } catch (err) {
      throw new Error("Please cd to the root of project");
    }

    try {
      const [stdout] = yield (0, _process.exec)("git remote show upstream");
      const kobitonRepo = /Fetch URL: https:\/\/github.com\/kobiton\/.+\.git/g.test(stdout.trim()) || /Fetch URL: git@github\.com:kobiton\/.+\.git/g.test(stdout.trim());

      if (!kobitonRepo) {
        throw new Error("This is not Kobiton's repository, please try another repository");
      }
    } catch (err) {
      if (err.message.toLowerCase().includes("not kobiton")) {
        throw err;
      } else {
        console.log("Remote upstream does not exist, adding remote upstream to your current local repository");

        const repoName = yield (0, _git.getRepoName)();

        yield (0, _process.exec)(`git remote add upstream https://github.com/kobiton/${repoName}.git`);
      }
    }
  });

  return function checkWorkspace() {
    return _ref.apply(this, arguments);
  };
})();

let listWorkspaces = (() => {
  var _ref2 = _asyncToGenerator(function* () {
    yield checkWorkspace();

    let workspaces;

    const projectPath = process.cwd();
    const workspacesPath = _path2.default.join(projectPath, WORKSPACE_FILENAME);

    try {
      yield (0, _fs.access)(workspacesPath);

      const fileContent = yield (0, _fs.readFile)(workspacesPath, "utf8");

      workspaces = JSON.parse(fileContent);
    } catch (err) {
      workspaces = {};
    }

    return workspaces;
  });

  return function listWorkspaces() {
    return _ref2.apply(this, arguments);
  };
})();

let addWorkspace = (() => {
  var _ref3 = _asyncToGenerator(function* (workspace) {
    yield checkWorkspace();

    let workspaces;

    const projectPath = process.cwd();
    const workspacesPath = _path2.default.join(projectPath, WORKSPACE_FILENAME);

    try {
      yield (0, _fs.access)(workspacesPath);

      const fileContent = yield (0, _fs.readFile)(workspacesPath, "utf8");

      workspaces = JSON.parse(fileContent);
    } catch (err) {
      workspaces = {};
    }

    workspaces = _extends({}, workspaces, workspace);

    yield saveWorkspace(workspaces);

    return workspace;
  });

  return function addWorkspace(_x) {
    return _ref3.apply(this, arguments);
  };
})();

let saveWorkspace = (() => {
  var _ref4 = _asyncToGenerator(function* (workspace) {
    const projectPath = process.cwd();
    const workspacesPath = _path2.default.join(projectPath, WORKSPACE_FILENAME);

    yield (0, _fs.writeFile)(workspacesPath, JSON.stringify(workspace));
  });

  return function saveWorkspace(_x2) {
    return _ref4.apply(this, arguments);
  };
})();

let getWorkingTickets = (() => {
  var _ref5 = _asyncToGenerator(function* (branchName) {
    const projectPath = process.cwd();
    const workspacesPath = _path2.default.join(projectPath, WORKSPACE_FILENAME);
    const fileContent = yield (0, _fs.readFile)(workspacesPath, "utf8");
    const workspaces = JSON.parse(fileContent);

    return workspaces[branchName];
  });

  return function getWorkingTickets(_x3) {
    return _ref5.apply(this, arguments);
  };
})();

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("./fs");

var _process = require("./process");

var _git = require("./git");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const WORKSPACE_FILENAME = ".kobiflow";

exports.checkWorkspace = checkWorkspace;
exports.listWorkspaces = listWorkspaces;
exports.addWorkspace = addWorkspace;
exports.getWorkingTickets = getWorkingTickets;