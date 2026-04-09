import "dotenv/config";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET);

const getPriceFromDashboard = async (priceId) => {
  let price;
  if (!priceId) throw new Error("No price id provided.");
  try {
    console.log();
    price = await stripe.prices.retrieve(priceId);
  } catch (e) {
    throw new Error("Failed to fetch price from Stripe.");
  }
  return price;
};

export const createCheckoutSession = async (priceId, email) => {
  const params = {
    ...(email && { customer_email: email }),
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: (await getPriceFromDashboard(priceId)).unit_amount,
          product_data: {
            name: "backendistä",
            description: "jahuu bingbäng",
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.FRONTEND_BASE_URL}success/`,
    cancel_url: `${process.env.FRONTEND_BASE_URL}profile/`,
  };
  const session = await stripe.checkout.sessions.create(params);
  return session.url;
};
