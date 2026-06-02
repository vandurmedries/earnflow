import Stripe from 'stripe';

export const PRO_BOOST_AMOUNT = 499; // $4.99 in cents, one-time for demo "Pro for 30 days"

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeClient = new Stripe(key, {
      apiVersion: '2024-04-30' as any,
    });
  }
  return stripeClient;
}

export const STRIPE_PRICE_PRO_BOOST = 'price_pro_boost'; // placeholder - create real product/price in Stripe Dashboard

export function getStripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
}
