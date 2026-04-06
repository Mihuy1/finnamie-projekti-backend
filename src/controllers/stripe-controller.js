import { getReservationPrice } from "../models/reservation-model.js";
import { createCheckoutSession } from "../utils/stripe.js";

export const createSession = async (req, res, next) => {
  try {
    const { type, email } = req.body;
    const { price_id } = await getReservationPrice(type);
    const sessionUrl = await createCheckoutSession(price_id, email);
    if (sessionUrl) res.status(200).json({ url: sessionUrl });
    else {
      res.status(503).json({
        message: "Something went wrong while creating Stripe checkout session.",
      });
    }
  } catch (e) {
    next(e);
  }
};
