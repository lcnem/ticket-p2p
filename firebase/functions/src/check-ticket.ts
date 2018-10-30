import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  Account,
  TransactionHttp,
  TransferTransaction,
  TimeWindow,
  EmptyMessage,
  XEM,
  Address,
  AccountHttp,
  NEMLibrary,
  NetworkTypes
} from 'nem-library';
import { Sale } from './models/sale';

export const _checkTicket = functions.https.onRequest(async (req, res) => {
  try {
    NEMLibrary.bootstrap(NetworkTypes.MAIN_NET);
  } catch { }
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

    try {
      const account = Account.createWithPrivateKey(functions.config().nem.private_key);

      const signed = account.signTransaction(TransferTransaction.create(
        TimeWindow.createWithDeadline(),
        address,
        new XEM(0),
        EmptyMessage
      ));
      await transactionHttp.announceTransaction(signed).toPromise();
    } catch (e) {
      console.log(e.message);
    }

    res.status(200).send(JSON.stringify({ group: sale.group }));
  } catch (e) {
    res.status(400).send(e.message);
  }
});
