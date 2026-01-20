import express from "express";
import userRouter from "./routes/users-router.js";

const router = express.Router();

router.use("/users", userRouter);

export default router;
