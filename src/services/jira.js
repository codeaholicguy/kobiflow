import Promise from "bluebird";
import HttpStatusCodes from "http-status-codes";

import { getJiraToken } from "./keychain";

const requestAsync = Promise.promisify(require("request"));

export async function getTickets(ticketIds) {
  const jiraToken = await getJiraToken();
  const jiraRequests = ticketIds.map(ticketId => {
    return {
      ticketId,
      url: `https://kobiton.atlassian.net/rest/api/latest/issue/KOB-${ticketId}`
    };
  });
  const workingTickets = [];

  for (const { url, ticketId } of jiraRequests) {
    const { body, statusCode } = await requestAsync({
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
