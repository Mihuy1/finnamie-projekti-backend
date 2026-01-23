import express from "express";
import userRouter from "./routes/users-router.js";
import authRouter from "./routes/authentication-route.js";
import { authorize } from "./middlewares.js";

const router = express.Router();

router.use("/users", userRouter);
router.use("/auth", authRouter);
router.get("/me", authorize, (req, res) => {
  res.status(200).json({
    user: req.user,
    message: "Session is active",
  });
});

export default router;
