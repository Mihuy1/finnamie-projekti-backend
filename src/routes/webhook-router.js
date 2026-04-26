import express from "express";
import "dotenv/config";
import { stripe } from "../utils/stripe.js";
import { setReservationPaid } from "../controllers/reservation-controller.js";
import { sendPaymentVerificationEmail } from "../services/brevoService.js";

const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

export const webhookRouter = express.Router();

webhookRouter.post(
  "/",
  express.raw({ type: "application/json" }),
  (req, res) => {
    let event;
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = req.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          endpointSecret,
        );
      } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.sendStatus(400);
      }

      // Handle the event
      switch (event.type) {
        case "checkout.session.completed":
          const data = event.data.object;
          const { resId, email } = data.metadata;
          setReservationPaid(resId);
          sendPaymentVerificationEmail(email);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a response to acknowledge receipt of the event
      res.json({ received: true });
    }
  },
);
