import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  Account,
  SimpleWallet,
  TransactionHttp,
  TransferTransaction,
  TimeWindow,
  EmptyMessage,
  XEM,
  NEMLibrary,
  NetworkTypes,
  Address,
  Password,
  AccountHttp
} from 'nem-library';

import { Group } from './models/group';
import { SalesCondition } from './models/sales-condition';
import { Event } from './models/event';
import { Sale } from './models/sales';

const stripe = require('stripe')(functions.config().stripe.sk_live);
const cors = require('cors')({ origin: true });

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

NEMLibrary.bootstrap(NetworkTypes.MAIN_NET);

export const addCapacityV1 = functions.https.onRequest(async (req, res) => {
  try {
    const userId = req.body.userId as string;
    const eventId = req.body.eventId as string;
    const groups = req.body.groups as Group[];
    const token = req.body.token as string;

    if (!userId || !eventId || !groups || !token) {
      throw Error("INVALID_PARAMETERS");
    }

    const event = await admin.firestore().collection("users").doc(userId).collection("events").doc(eventId).get();
    if (!event.exists) {
      throw Error("INVALID_ID")
    }

    let capacity = 0;
    for (const group of groups) {
      capacity += group.capacity;
    }

    //クレジット決済
    const query = {
      amount: capacity * 54,
      currency: 'jpy',
      card: token
    };
    await stripe.charges.create(query);

    for (const group of groups) {
      await event.ref.collection("groups").add(group);
    }

    res.status(200).send();
  } catch (e) {
    res.status(400).send(e.message);
  }
});

export const salesConditionV1 = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const userId = req.body.userId as string;
      const eventId = req.body.eventId as string;

      if (!userId || !eventId) {
        throw Error("INVALID_PARAMETERS");
      }

      const event = await admin.firestore().collection("users").doc(userId).collection("events").doc(eventId).get();
      if (!event.exists) {
        throw Error("INVALID_ID");
      }

      const salesCondition: SalesCondition = await SalesCondition.getFromFirebase(event.ref);

      res.status(200).send(JSON.stringify(salesCondition));
    } catch (e) {
      res.status(400).send(e.message);
    }
  });
});

export const issueTicketsV1 = functions.https.onRequest(async (req, res) => {
  try {
    const userId = req.body.userId as string;
    const eventId = req.body.eventId as string;
    const privateKey = req.body.privateKey as string;
    const customerId = req.body.customerId as string;
    const requests = req.body.request as {
      group: string,
      reservation: string
    }[];

    if (!userId || !eventId || !requests) {
      throw Error("INVALID_PARAMETERS");
    }

    const event = await admin.firestore().collection("users").doc(userId).collection("events").doc(eventId).get();
    if (!event.exists) {
      throw Error("INVALID_ID");
    }

    const eventData = event.data() as Event;
    if (privateKey != eventData.privateKey) {
      throw Error("INVALID_PRIVATE_KEY");
    }

    const salesCondition: SalesCondition = await SalesCondition.getFromFirebase(event.ref);

    for (const group of salesCondition.groups) {
      const filtered = requests.filter(r => r.group == group.name);
      if(filtered.length + group.sales > group.capacity) {
        throw Error("CAPACITY_OVER");
      }
    }

    //検証
    for (const request of requests) {
      const group = salesCondition.groups.find(g => g.name == request.group);
      if (!group) {
        throw Error("INVALID_GROUP");
      }

      //空文字一致はfalseになるので問題ない
      if (salesCondition.reservations.find(r => r == request.reservation)) {
        throw Error("ALREADY_RESERVED");
      }
    }

    const ret: {
      ticket: string,
      qrUrl: string
    }[] = [];
    for (const request of requests) {
      const address = SimpleWallet.create(userId, new Password(userId)).address.plain();
      ret.push({
        ticket: address,
        qrUrl: `http://chart.apis.google.com/chart?chs=300x300&cht=qr&chl=${address}`
      });

      await admin.firestore().collection("users").doc(userId).collection("events").doc(eventId).collection("sales").add({
        ticket: address,
        group: request.group,
        reservation: request.reservation,
        customerId: customerId
      } as Sale);
    }

    res.status(200).send(JSON.stringify(ret));
  } catch (e) {
    res.status(400).send(e.message);
  }
});

export const checkTicketV1 = functions.https.onRequest(async (req, res) => {
  try {
    const userId = req.body.userId as string;
    const eventId = req.body.eventId as string;
    const ticket = req.body.ticket as string;

    if (!userId || !eventId || !ticket) {
      throw Error("INVALID_PARAMETERS");
    }

    const address = new Address(ticket);

    const accountHttp = new AccountHttp();
    const transactionHttp = new TransactionHttp();

    let ok = false;

    const event = await admin.firestore().collection("users").doc(userId).collection("events").doc(eventId).get();
    if (!event) {
      res.status(400).send("INVALID_EVENT_ID");
    }

    const sales = await admin.firestore().collection("users").doc(userId).collection("events").doc(eventId).collection("sales").where("ticket", "==", address.plain()).get();
    if (sales.empty) {
      res.status(400).send("INVALID_TICKET");
      return;
    }
    const sale = sales.docs[0].data() as Sale;

    if ((await accountHttp.unconfirmedTransactions(address).toPromise()).length === 0) {
      const transactions = await accountHttp.allTransactions(address).toPromise();
      if (transactions.length === 0) {
        ok = true;
      }
    }

    if (!ok) {
      res.status(400).send("USED_TICKET");
    }

    const account = Account.createWithPrivateKey(functions.config().nem.private_key);

    const signed = account.signTransaction(TransferTransaction.create(
      TimeWindow.createWithDeadline(),
      address,
      new XEM(0),
      EmptyMessage
    ));
    await transactionHttp.announceTransaction(signed).toPromise();

    res.status(200).send(JSON.stringify({ group: sale.group }));
  } catch (e) {
    res.status(400).send(e.message);
  }
});

export const cancelTicketV1 = functions.https.onRequest(async (req, res) => {
  try {
    const userId = req.body.userId as string;
    const eventId = req.body.eventId as string;
    const ticket = req.body.ticket as string;
    const privateKey = req.body.privateKey as string;

    if (!userId || !eventId || !ticket) {
      throw Error("INVALID_PARAMETERS");
    }

    const event = await admin.firestore().collection("users").doc(userId).collection("events").doc(eventId).get();
    if (!event.exists) {
      throw Error("INVALID_ID");
    }

    const eventData = event.data() as Event;
    if (privateKey != eventData.privateKey) {
      throw Error("INVALID_PRIVATE_KEY");
    }

    const query = await event.ref.collection("sales").where("ticket", "==", ticket).get();
    if (query.empty) {
      throw Error("INVALID_TICKET");
    }

    await query.docs[0].ref.delete();

    res.status(200).send();
  } catch (e) {
    res.status(400).send(e.message);
  }
});

export const sendRewardV1 = functions.https.onRequest(async (req, res) => {
  try {
    const userId = req.body.userId as string;
    const eventId = req.body.eventId as string;
    const token = req.body.token as string;
    const amount = Number(req.body.amount) || 0;
    const fee = Number(req.body.fee) || 0;
    const address = req.body.address as string;

    if (!userId || !eventId || !token || !amount || !fee || !address) {
      throw Error("INVALID_PARAMETERS");
    }

    const event = await admin.firestore().collection("users").doc(userId).collection("events").doc(eventId).get();
    if (!event.exists) {
      throw Error("INVALID_ID")
    }

    const query = {
      amount: amount + fee,
      currency: 'jpy',
      card: token
    };
    await stripe.charges.create(query);

    const salesQuery = await event.ref.collection("sales").where("ticket", "==", address).get();
    if (salesQuery.empty) {
      throw Error("INVALID_TICKET");
    }
    await salesQuery.docs[0].ref.delete();

    res.status(200).send();
  } catch (e){
    res.status(400).send(e.message);
  }
});
