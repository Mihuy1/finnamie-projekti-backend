import express from "express";
import userRouter from "./routes/users-route.js";
import authRouter from "./routes/authentication-route.js";
import uploadRouter from "./routes/upload-route.js";
import timeslotRouter from "./routes/timeslot-route.js";
import reviewRouter from "./routes/review-route.js";
import convRouter from "./routes/conv-route.js";
import activitiesRouter from "./routes/activities-route.js";
import activitiesSuggestionsRoute from "./routes/activities-suggestions-route.js";
import reservationRouter from "./routes/reservation-route.js";
import timeslotRulesRouter from "./routes/timeslot-rules-route.js";
import experiencesRouter from "./routes/experiences-route.js";
import stripeRouter from "./routes/stripe-route.js";

const router = express.Router();

router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/timeslots", timeslotRouter);
router.use("/timeslotRules", timeslotRulesRouter);
router.use("/reviews", reviewRouter);
router.use("/media", uploadRouter);
router.use("/conversations", convRouter);
router.use("/activities", activitiesRouter);
router.use("/activities/suggestions", activitiesSuggestionsRoute);
router.use("/reservations", reservationRouter);
router.use("/experiences", experiencesRouter);
router.use("/stripe/", stripeRouter);

export default router;
