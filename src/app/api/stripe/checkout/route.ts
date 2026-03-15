import { NextRequest, NextResponse } from "next/server";
import { getStripe, PRICE_IDS, PlanKey } from "@/utils/stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: NextRequest) {
  try {
    const { plan, userId, email } = (await request.json()) as {
      plan: PlanKey;
      userId: string;
      email: string;
    };

    if (!plan || !userId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Check if user already has a Stripe customer ID
    const { data: portfolio } = await supabase
      .from("portfolios")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    let customerId = (portfolio as { stripe_customer_id?: string } | null)?.stripe_customer_id;

    // Create Stripe customer if needed
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email,
        metadata: { userId },
      });
      customerId = customer.id;

      // Save customer ID
      await supabase
        .from("portfolios")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", userId);
    }

    // Create checkout session
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: plan === "featured_weekly" ? "payment" : "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?canceled=true`,
      metadata: { userId, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
