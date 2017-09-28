"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.spawnSync = exports.exec = undefined;

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _child_process = require("child_process");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { execAsync } = _bluebird2.default.promisifyAll(require("child_process"), {
  multiArgs: true
});

exports.exec = execAsync;
exports.spawnSync = _child_process.spawnSync;