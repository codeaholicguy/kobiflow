"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyGithubToken = exports.getGithubUser = exports.createPullRequest = undefined;

let createPullRequest = (() => {
  var _ref = _asyncToGenerator(function* (branch, title, body) {
    const {
      token: githubToken,
      username: githubUsername
    } = yield (0, _keychain.getGithubToken)();
    const repoName = yield (0, _git.getRepoName)();

    const { statusCode, body: { html_url: url } } = yield (0, _request.request)({
      url: `https://api.github.com/repos/kobiton/${repoName}/pulls`,
      method: "post",
      json: true,
      headers: {
        Authorization: `token ${githubToken}`,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
      },
      body: {
        title,
        body,
        head: `${githubUsername}:${branch}`,
        base: "master"
      }
    });

    if (statusCode !== _httpStatusCodes2.default.CREATED) {
      throw new Error(`Create pull request failed. ${statusCode}`);
    }

    return url;
  });

  return function createPullRequest(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

let getGithubUser = (() => {
  var _ref2 = _asyncToGenerator(function* () {
    let ok = false;
    let user;

    while (!ok) {
      const { token: githubToken } = yield (0, _keychain.getGithubToken)();
      const { body, statusCode } = yield (0, _request.request)({
        url: "https://api.github.com/user",
        method: "get",
        headers: {
          Authorization: `token ${githubToken}`,
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
        }
      });

      if (statusCode === _httpStatusCodes2.default.OK) {
        ok = true;
        user = JSON.parse(body);
      }
    }

    return user;
  });

  return function getGithubUser() {
    return _ref2.apply(this, arguments);
  };
})();

let verifyGithubToken = (() => {
  var _ref3 = _asyncToGenerator(function* (token) {
    const { statusCode } = yield (0, _request.request)({
      url: "https://api.github.com/user",
      method: "get",
      headers: {
        Authorization: `token ${token}`,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
      }
    });

    if (statusCode !== _httpStatusCodes2.default.OK) {
      throw new Error("Your Github account is not valid");
    }
  });

  return function verifyGithubToken(_x4) {
    return _ref3.apply(this, arguments);
  };
})();

var _httpStatusCodes = require("http-status-codes");

var _httpStatusCodes2 = _interopRequireDefault(_httpStatusCodes);

var _keychain = require("./keychain");

var _request = require("./request");

var _git = require("./git");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.createPullRequest = createPullRequest;
exports.getGithubUser = getGithubUser;
exports.verifyGithubToken = verifyGithubToken;