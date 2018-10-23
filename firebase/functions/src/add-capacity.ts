import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Group } from '../../../models/group';

const stripe = require('stripe')(functions.config().stripe.sk_live);

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
