import express from "express";
import userRouter from "./routes/users-route.js";
import authRouter from "./routes/authentication-route.js";
import uploadRouter from "./routes/upload-route.js";
import timeslotRouter from "./routes/timeslot-route.js";
import reviewRouter from "./routes/review-route.js";
import convRouter from "./routes/conv-route.js";

const router = express.Router();

router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/timeslots", timeslotRouter);
router.use("/reviews", reviewRouter);
router.use("/media", uploadRouter);
router.use("/conversations", convRouter);

export default router;
