import express from "express";
import userRouter from "./routes/users-router.js";
import authRouter from "./routes/authentication-route.js";
import { authorize } from "./middlewares.js";

const router = express.Router();

router.use("/users", userRouter);
router.use("/auth", authRouter);

export default router;
