import express from "express";
import { authorize } from "../middlewares.js";
import { createSession } from "../controllers/stripe-controller.js";

const stripeRouter = express.Router();

stripeRouter.use(authorize);

stripeRouter.route("/create-checkout-session").post(createSession);

export default stripeRouter;
