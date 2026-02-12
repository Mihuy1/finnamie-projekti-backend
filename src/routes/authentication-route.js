import express from "express";
import {
  getMe,
  logout,
  postLogin,
  register,
  updateProfile,
} from "../controllers/authentication-controller.js";
import { authorize } from "../middlewares.js";

const authRouter = express.Router();

authRouter.route("/").post(postLogin);
authRouter.route("/register").post(register);
authRouter.route("/update").post(authorize, updateProfile);
authRouter.route("/me").get(authorize, getMe);
authRouter.route("/logout").get(logout);

export default authRouter;
