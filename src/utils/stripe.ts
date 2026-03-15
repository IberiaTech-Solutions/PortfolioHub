import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

// Price IDs — set these in your Stripe Dashboard and .env.local
export const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
  pro_annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || "",
  recruiter_monthly: process.env.STRIPE_RECRUITER_MONTHLY_PRICE_ID || "",
  recruiter_annual: process.env.STRIPE_RECRUITER_ANNUAL_PRICE_ID || "",
  featured_weekly: process.env.STRIPE_FEATURED_WEEKLY_PRICE_ID || "",
};

export type PlanKey = keyof typeof PRICE_IDS;
