"use server"
import Stripe from "stripe";
import { redirect } from "next/navigation";

export default async function checkoutCredits() {
  const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: "price_1PPGhsSBb4nuIOGkXO9ABDMT",
        quantity: 1,
      },
    ],

    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/dress`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/dashboard`,
  });

  redirect(session.url);
}