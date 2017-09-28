"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPullRequest = undefined;

let createPullRequest = (() => {
  var _ref = _asyncToGenerator(function* (branch, title, body) {
    const githubUsername = yield (0, _keychain.getGithubUsername)();
    const githubToken = yield (0, _keychain.getGithubToken)();
    const repoName = yield (0, _git.getRepoName)();

    const { statusCode, body: responseBody } = yield (0, _request.request)({
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
      throw new Error(`Create pull request failed. ${JSON.stringify(responseBody)}`);
    }
  });

  return function createPullRequest(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
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