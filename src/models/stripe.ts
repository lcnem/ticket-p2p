import { AsyncAction } from "rxjs/internal/scheduler/AsyncAction";

declare let Stripe: any;

const stripePublicKey =
  "pk_live_U7J2IacDFZyCvYILl45onao9";
  //"pk_test_sVIc8W1jrazk2t1LxqAdnls3";

export function stripeCharge(result: PaymentResponse, callback: (status: any, response: any) => any) {
  Stripe.setPublishableKey(stripePublicKey);
  Stripe.card.createToken({
    number: result.details.cardNumber,
    cvc: result.details.cardSecurityCode,
    exp_month: result.details.expiryMonth,
    exp_year: result.details.expiryYear
  }, callback);
}