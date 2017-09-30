"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TICKET_STATUS = exports.doTransition = exports.verifyJiraToken = exports.getJiraUser = exports.getTickets = undefined;

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

let getJiraUser = (() => {
  var _ref3 = _asyncToGenerator(function* () {
    let ok = false;
    let user;

    while (!ok) {
      const jiraToken = yield (0, _keychain.getJiraToken)();
      const { body, statusCode } = yield (0, _request.request)({
        url: "https://kobiton.atlassian.net/rest/api/2/myself",
        method: "get",
        headers: {
          Authorization: `Basic ${jiraToken}`
        }
      });

      if (statusCode === _httpStatusCodes2.default.OK) {
        ok = true;
        user = JSON.parse(body);
      }
    }

    return user;
  });

  return function getJiraUser() {
    return _ref3.apply(this, arguments);
  };
})();

let verifyJiraToken = (() => {
  var _ref4 = _asyncToGenerator(function* (token) {
    const { statusCode } = yield (0, _request.request)({
      url: "https://kobiton.atlassian.net/rest/api/2/myself",
      method: "get",
      headers: {
        Authorization: `Basic ${token}`
      }
    });

    if (statusCode !== _httpStatusCodes2.default.OK) {
      throw new Error("Your Jira account is not valid");
    }
  });

  return function verifyJiraToken(_x2) {
    return _ref4.apply(this, arguments);
  };
})();

let doTransition = (() => {
  var _ref5 = _asyncToGenerator(function* (ticketIds, status) {
    const jiraToken = yield (0, _keychain.getJiraToken)();
    const jiraRequests = ticketIds.map(function (ticketId) {
      return {
        url: `https://kobiton.atlassian.net/rest/api/latest/issue/KOB-${ticketId}/transitions`
      };
    });

    for (const _ref6 of jiraRequests) {
      const { url } = _ref6;

      yield (0, _request.request)({
        url,
        method: "post",
        json: true,
        headers: {
          Authorization: `Basic ${jiraToken}`
        },
        body: { transition: { id: status } }
      });
    }
  });

  return function doTransition(_x3, _x4) {
    return _ref5.apply(this, arguments);
  };
})();

var _httpStatusCodes = require("http-status-codes");

var _httpStatusCodes2 = _interopRequireDefault(_httpStatusCodes);

var _keychain = require("./keychain");

var _request = require("./request");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const TICKET_STATUS = {
  IN_PROGRESS: 21,
  WAIT_FOR_MERGE: 31
};

exports.getTickets = getTickets;
exports.getJiraUser = getJiraUser;
exports.verifyJiraToken = verifyJiraToken;
exports.doTransition = doTransition;
exports.TICKET_STATUS = TICKET_STATUS;