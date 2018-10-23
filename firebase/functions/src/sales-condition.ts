import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { SalesCondition } from './models/sales-condition';

const cors = require('cors')({ origin: true });

export const salesConditionsV1 = functions.https.onRequest((req, res) => {
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
