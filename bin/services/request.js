"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.request = undefined;

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const requestAsync = _bluebird2.default.promisify(require("request"));

exports.request = requestAsync;