import express from "express";
import {
  getMe,
  getProfileInfo,
  logout,
  postLogin,
  register,
  resendVerificationEmail,
  updateProfile,
  verifyEmail,
} from "../controllers/authentication-controller.js";
import { authorize } from "../middlewares.js";

const authRouter = express.Router();

authRouter.route("/").post(postLogin);
authRouter.route("/register").post(register);
authRouter.route("/update").post(authorize, updateProfile);
authRouter.route("/profile").get(authorize, getProfileInfo);
authRouter.route("/me").get(authorize, getMe);
authRouter.route("/logout").get(logout);
authRouter.route("/verify").get(verifyEmail);
authRouter.route("/resend-verification/:email").post(resendVerificationEmail);

export default authRouter;
