"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exec = undefined;

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { execAsync } = _bluebird2.default.promisifyAll(require("child_process"), {
  multiArgs: true
});

exports.exec = execAsync;