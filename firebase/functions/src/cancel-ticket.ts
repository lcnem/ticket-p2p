import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { Event } from '../../../models/event';

export const _cancelTicket = functions.https.onRequest(async (req, res) => {
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
    if (privateKey !== eventData.privateKey) {
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
