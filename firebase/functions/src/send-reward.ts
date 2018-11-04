import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as request from 'request'

export const _sendReward = functions.https.onRequest(async (req, res) => {
  try {
    const stripe = require('stripe')(req.body.test ? functions.config().stripe.sk_test : functions.config().stripe.sk_live);
    const userId = req.body.userId as string;
    const eventId = req.body.eventId as string;
    const token = req.body.token as string;
    const amount = Number(req.body.amount) || 0;
    const fee = Number(req.body.fee) || 0;
    const ticket = req.body.ticket as string;
    const invalidator = req.body.invalidator as string;

    if (!userId || !eventId || !token || !amount || !fee || !invalidator || !ticket) {
      throw Error(`INVALID_PARAMETERS`);
    }

    const event = await admin.firestore().collection("users").doc(userId).collection("events").doc(eventId).get();
    if (!event.exists) {
      throw Error("INVALID_ID")
    }

    const salesQuery = await event.ref.collection("sales").where("ticket", "==", ticket).get();
    if (salesQuery.empty) {
      throw Error("INVALID_TICKET");
    }
    await salesQuery.docs[0].ref.delete();

    request.post(
      functions.config().gas.send_reward,
      {
        form: {
          nem: invalidator,
          amount: amount
        }
      },
      () => {
        async () => {
          try {
            const query = {
              amount: amount + fee,
              currency: 'jpy',
              card: token
            };
            await stripe.charges.create(query);
          } catch (e) {
            console.error(e)
            res.status(400).send(e.message);
          }
        }
        res.status(200).send();
      }
    );
  } catch (e) {
    console.error(e)
    res.status(400).send(e.message);
  }
});
