import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/utils/stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Creates a Stripe Customer Portal session for managing subscriptions
export async function POST(request: NextRequest) {
  try {
    const { userId } = (await request.json()) as { userId: string };

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const { data: portfolio } = await supabase
      .from("portfolios")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    const customerId = (portfolio as { stripe_customer_id?: string } | null)?.stripe_customer_id;

    if (!customerId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/profile`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
