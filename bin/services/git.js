"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCurrentBranchName = exports.getRepoName = undefined;

let getRepoName = (() => {
  var _ref = _asyncToGenerator(function* () {
    const [stdout] = yield (0, _process.exec)("basename `git rev-parse --show-toplevel`");

    return stdout.trim();
  });

  return function getRepoName() {
    return _ref.apply(this, arguments);
  };
})();

let getCurrentBranchName = (() => {
  var _ref2 = _asyncToGenerator(function* () {
    const [stdout] = yield (0, _process.exec)("git rev-parse --abbrev-ref HEAD");

    return stdout.trim();
  });

  return function getCurrentBranchName() {
    return _ref2.apply(this, arguments);
  };
})();

var _process = require("./process");

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.getRepoName = getRepoName;
exports.getCurrentBranchName = getCurrentBranchName;