import express from "express";
import userRouter from "./routes/users-router.js";
import authRouter from "./routes/authentication-route.js";
import uploadRouter from "./routes/upload-route.js";
import timeslotRouter from "./routes/timeslot-router.js";
import reviewRouter from "./routes/review-route.js";

const router = express.Router();

router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/timeslots", timeslotRouter);
router.use("/reviews", reviewRouter);
router.use("/media", uploadRouter);

export default router;
