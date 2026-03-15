import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/utils/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (userId && plan) {
          const tier = plan.startsWith("pro") ? "pro" : plan.startsWith("recruiter") ? "recruiter" : "free";

          if (plan === "featured_weekly") {
            // Enable featured profile for 7 days
            await supabase
              .from("portfolios")
              .update({ is_featured: true })
              .eq("user_id", userId);
          } else {
            // Update plan tier
            await supabase
              .from("portfolios")
              .update({
                plan_tier: tier,
                stripe_subscription_id: session.subscription as string,
              })
              .eq("user_id", userId);
          }

          // Send notification
          await supabase.from("notifications").insert({
            user_id: userId,
            type: "assessment",
            title: plan === "featured_weekly" ? "Featured Profile Activated!" : `Upgraded to ${tier.charAt(0).toUpperCase() + tier.slice(1)}!`,
            message: plan === "featured_weekly"
              ? "Your profile will appear at the top of search results for 7 days."
              : `You now have access to all ${tier} features.`,
            link: "/profile",
            read: false,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const { data: portfolio } = await supabase
          .from("portfolios")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (portfolio) {
          const isActive = subscription.status === "active" || subscription.status === "trialing";
          if (!isActive) {
            await supabase
              .from("portfolios")
              .update({ plan_tier: "free" })
              .eq("user_id", (portfolio as { user_id: string }).user_id);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: portfolio } = await supabase
          .from("portfolios")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (portfolio) {
          await supabase
            .from("portfolios")
            .update({ plan_tier: "free", stripe_subscription_id: null })
            .eq("user_id", (portfolio as { user_id: string }).user_id);

          await supabase.from("notifications").insert({
            user_id: (portfolio as { user_id: string }).user_id,
            type: "assessment",
            title: "Subscription Canceled",
            message: "Your plan has been downgraded to Free. Your portfolio and data are safe.",
            link: "/pricing",
            read: false,
          });
        }
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
