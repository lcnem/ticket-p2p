import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { _addCapacity } from './add-capacity';
import { _cancelTicket } from './cancel-ticket';
import { _checkTicket } from './check-ticket';
import { _issueTickets } from './issue-tickets';
import { _salesConditions } from './sales-condition';
import { _sendReward } from './send-reward';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(JSON.stringify(functions.config().service_account).replace(/\\\\n/g, "\\n"))),
  databaseURL: "https://ticket-p2p.firebaseio.com"
});

export let addCapacity: functions.HttpsFunction;
export let cancelTicket: functions.HttpsFunction;
export let checkTicket: functions.HttpsFunction;
export let issueTickets: functions.HttpsFunction;
export let salesConditions: functions.HttpsFunction;
export let sendReward: functions.HttpsFunction;

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === "addCapacity") {
  addCapacity = _addCapacity;
}
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === "salesConditions") {
  salesConditions = _salesConditions;
}
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === "issueTickets") {
  issueTickets = _issueTickets;
}
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === "checkTicket") {
  checkTicket = _checkTicket;
}
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === "cancelTicket") {
  cancelTicket = _cancelTicket;
}
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === "sendReward") {
  sendReward = _sendReward;
}
