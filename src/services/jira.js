import HttpStatusCodes from "http-status-codes";

import { getJiraToken } from "./keychain";
import { request } from "./request";

const TICKET_STATUS = {
  IN_PROGRESS: 21,
  WAIT_FOR_MERGE: 31
};

async function getTickets(ticketIds) {
  const jiraToken = await getJiraToken();
  const jiraRequests = ticketIds.map(ticketId => {
    return {
      ticketId,
      url: `https://kobiton.atlassian.net/rest/api/latest/issue/KOB-${ticketId}`
    };
  });
  const workingTickets = [];

  for (const { url, ticketId } of jiraRequests) {
    const { body, statusCode } = await request({
      url,
      method: "get",
      headers: {
        Authorization: `Basic ${jiraToken}`
      }
    });

    if (statusCode === HttpStatusCodes.OK) {
      workingTickets.push({
        ticketId,
        title: JSON.parse(body).fields.summary
      });
    } else {
      console.error(`Ticket KOB-${ticketId} is not found`);
    }
  }

  return workingTickets;
}

async function getJiraUser() {
  let ok = false;
  let user;

  while (!ok) {
    const jiraToken = await getJiraToken();
    const { body, statusCode } = await request({
      url: "https://kobiton.atlassian.net/rest/api/2/myself",
      method: "get",
      headers: {
        Authorization: `Basic ${jiraToken}`
      }
    });

    if (statusCode === HttpStatusCodes.OK) {
      ok = true;
      user = JSON.parse(body);
    }
  }

  return user;
}

async function verifyJiraToken(token) {
  const { statusCode } = await request({
    url: "https://kobiton.atlassian.net/rest/api/2/myself",
    method: "get",
    headers: {
      Authorization: `Basic ${token}`
    }
  });

  if (statusCode !== HttpStatusCodes.OK) {
    throw new Error("Your Jira account is not valid");
  }
}

async function doTransition(ticketIds, status) {
  const jiraToken = await getJiraToken();
  const jiraRequests = ticketIds.map(ticketId => {
    return {
      url: `https://kobiton.atlassian.net/rest/api/latest/issue/KOB-${ticketId}/transitions`
    };
  });

  for (const { url } of jiraRequests) {
    await request({
      url,
      method: "post",
      json: true,
      headers: {
        Authorization: `Basic ${jiraToken}`
      },
      body: { transition: { id: status } }
    });
  }
}

export {
  getTickets,
  getJiraUser,
  verifyJiraToken,
  doTransition,
  TICKET_STATUS
};
