import { environment } from "src/environments/environment";

declare let Stripe: any;

export function stripeCharge(result: PaymentResponse, callback: (status: any, response: any) => any) {
  Stripe.setPublishableKey(environment.stripe.pk);
  Stripe.card.createToken({
    number: result.details.cardNumber,
    cvc: result.details.cardSecurityCode,
    exp_month: result.details.expiryMonth,
    exp_year: result.details.expiryYear
  }, callback);
}