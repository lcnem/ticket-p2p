import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { addCapacityV1 } from './add-capacity';
import { cancelTicketV1 } from './cancel-ticket';
import { checkTicketV1 } from './check-ticket';
import { issueTicketsV1 } from './issue-tickets';
import { salesConditionsV1 } from './sales-condition';
import { sendRewardV1 } from './send-reward';

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

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === "addCapacityV1") {
  exports.addCapacityV1 = addCapacityV1;
}
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === "cancelTicketV1") {
  exports.cancelTicketV1 = cancelTicketV1;
}
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === "checkTicketV1") {
  exports.checkTicketV1 = checkTicketV1;
}
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === "issueTicketsV1") {
  exports.issueTicketsV1 = issueTicketsV1;
}
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === "salesConsitionsV1") {
  exports.salesConsitionsV1 = salesConditionsV1;
}
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === "sendRewardV1") {
  exports.sendRewardV1 = sendRewardV1;
}