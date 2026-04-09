import "dotenv/config";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET);

const getPriceFromStripeDashboard = async (priceId) => {
  let priceObject;
  if (!priceId) throw new Error("No price id provided.");
  try {
    // https://docs.stripe.com/api/prices/object
    priceObject = await stripe.prices.retrieve(priceId, {
      expand: ["product"],
    });
    return priceObject;
  } catch (e) {
    throw new Error("Failed to fetch price from Stripe.");
  }
};

export const createCheckoutSession = async (priceId, email) => {
  try {
    const priceData = await getPriceFromStripeDashboard(priceId);
    const params = {
      ...(email && { customer_email: email }),
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: priceData.unit_amount,
            product_data: {
              name: `${priceData.product.name} experience`,
              description: priceData.product.description,
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
  } catch (e) {
    console.error(e);
  }
};
