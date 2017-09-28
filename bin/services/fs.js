"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.writeFile = exports.readFile = exports.access = undefined;

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  accessAsync: access,
  readFileAsync: readFile,
  writeFileAsync: writeFile
} = _bluebird2.default.promisifyAll(require("fs"));

exports.access = access;
exports.readFile = readFile;
exports.writeFile = writeFile;