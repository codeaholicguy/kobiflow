"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getGithubToken = exports.getJiraToken = undefined;

let getJiraToken = (() => {
  var _ref = _asyncToGenerator(function* () {
    let token;
    const defaultKeychain = yield getDefaultKeychain();

    try {
      const [stdout, stderr] = yield (0, _process.exec)(`security find-generic-password -s JIRA -g ${defaultKeychain}`);

      const username = /"acct"<blob>="(.*)"/g.exec(stdout.trim())[1];
      const password = /password: "(.*)"/g.exec(stderr.trim())[1];

      token = Buffer.from(`${username}:${password}`).toString("base64");
    } catch (err) {
      console.log("JIRA account does not exist, please input your account (This will be stored in your machine keychain)");

      const { username } = yield (0, _inquirer.prompt)({
        type: "input",
        name: "username",
        message: "Username"
      });
      const { password } = yield (0, _inquirer.prompt)({
        type: "password",
        name: "password",
        message: "Password"
      });

      token = Buffer.from(`${username}:${password}`).toString("base64");

      yield (0, _jira.verifyJiraToken)(token);

      yield (0, _process.exec)(`security add-generic-password -s JIRA -a ${username} -w ${password} ${defaultKeychain}`);

      console.log("Your JIRA account added successfully");
    }

    return token;
  });

  return function getJiraToken() {
    return _ref.apply(this, arguments);
  };
})();

let getGithubToken = (() => {
  var _ref2 = _asyncToGenerator(function* () {
    let result;
    const defaultKeychain = yield getDefaultKeychain();

    try {
      const [stdout, stderr] = yield (0, _process.exec)(`security find-internet-password -s github.com -g ${defaultKeychain}`);

      const username = /"acct"<blob>="(.*)"/g.exec(stdout.trim())[1];
      const token = /password: "(.*)"/g.exec(stderr.trim())[1];

      result = { username, token };
    } catch (err) {
      console.log("Github account does not exist, please input your account (This will be stored in your machine keychain)");

      console.log("Please follow instruction on https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/ for getting access token");

      const { username } = yield (0, _inquirer.prompt)({
        type: "input",
        name: "username",
        message: "Username"
      });
      const { token } = yield (0, _inquirer.prompt)({
        type: "password",
        name: "token",
        message: "Token"
      });

      result = { username, token };

      yield (0, _github.verifyGithubToken)(token);

      yield (0, _process.exec)(`security add-internet-password -s github.com -a ${username} -w ${token} ${defaultKeychain}`);

      console.log("Your Github account added successfully");
    }

    return result;
  });

  return function getGithubToken() {
    return _ref2.apply(this, arguments);
  };
})();

let getDefaultKeychain = (() => {
  var _ref3 = _asyncToGenerator(function* () {
    const [stdout] = yield (0, _process.exec)("security default-keychain");
    const defaultKeychain = stdout.replace(/['"]+/g, "").trim();

    return defaultKeychain;
  });

  return function getDefaultKeychain() {
    return _ref3.apply(this, arguments);
  };
})();

var _inquirer = require("inquirer");

var _process = require("./process");

var _jira = require("./jira");

var _github = require("./github");

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.getJiraToken = getJiraToken;
exports.getGithubToken = getGithubToken;