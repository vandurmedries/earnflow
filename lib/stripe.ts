import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20', // latest stable at time of writing
});

export const STRIPE_PRICE_PRO_BOOST = 'price_pro_boost'; // placeholder - in real, create product in Stripe dashboard for one-time $4.99 "Pro Boost"

export const PRO_BOOST_AMOUNT = 499; // $4.99 in cents, one-time for demo "Pro for 30 days"

export function getStripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
}
