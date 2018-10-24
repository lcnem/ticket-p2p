import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  SimpleWallet,
  Password,
  NEMLibrary,
  NetworkTypes
} from 'nem-library';

import { SalesCondition } from './models/sales-condition';
import { Event } from '../../../models/event';
import { Sale } from '../../../models/sale';

export const _issueTickets = functions.https.onRequest(async (req, res) => {
  try {
    NEMLibrary.bootstrap(NetworkTypes.MAIN_NET);
  } catch {}
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
    if (privateKey !== eventData.privateKey) {
      throw Error("INVALID_PRIVATE_KEY");
    }

    const salesCondition: SalesCondition = await SalesCondition.getFromFirebase(event.ref);

    for (const group of salesCondition.groups) {
      const filtered = requests.filter(r => r.group === group.name);
      if(filtered.length + group.sales > group.capacity) {
        throw Error("CAPACITY_OVER");
      }
    }

    //検証
    for (const request of requests) {
      const group = salesCondition.groups.find(g => g.name === request.group);
      if (!group) {
        throw Error("INVALID_GROUP");
      }

      //空文字一致はfalseになるので問題ない
      if (salesCondition.reservations.find(r => r === request.reservation)) {
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
