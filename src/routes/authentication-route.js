import express from "express";
import {
  getMe,
  postLogin,
  register,
} from "../controllers/authentication-controller.js";
import { authorize } from "../middlewares.js";

const authRouter = express.Router();

authRouter.route("/").post(postLogin);
authRouter.route("/register").post(register);
authRouter.route("/me").get(authorize, getMe);

export default authRouter;
