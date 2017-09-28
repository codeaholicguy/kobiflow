"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTickets = undefined;

let getTickets = (() => {
  var _ref = _asyncToGenerator(function* (ticketIds) {
    const jiraToken = yield (0, _keychain.getJiraToken)();
    const jiraRequests = ticketIds.map(function (ticketId) {
      return {
        ticketId,
        url: `https://kobiton.atlassian.net/rest/api/latest/issue/KOB-${ticketId}`
      };
    });
    const workingTickets = [];

    for (const _ref2 of jiraRequests) {
      const { url, ticketId } = _ref2;

      const { body, statusCode } = yield (0, _request.request)({
        url,
        method: "get",
        headers: {
          Authorization: `Basic ${jiraToken}`
        }
      });

      if (statusCode === _httpStatusCodes2.default.OK) {
        workingTickets.push({
          ticketId,
          title: JSON.parse(body).fields.summary
        });
      } else {
        console.error(`Ticket KOB-${ticketId} is not found`);
      }
    }

    return workingTickets;
  });

  return function getTickets(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _httpStatusCodes = require("http-status-codes");

var _httpStatusCodes2 = _interopRequireDefault(_httpStatusCodes);

var _keychain = require("./keychain");

var _request = require("./request");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.getTickets = getTickets;