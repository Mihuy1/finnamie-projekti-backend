import express from "express";
import { postLogin } from "../controllers/authentication-controller.js";

const authRouter = express.Router();

authRouter.route("/").post(postLogin);

export default authRouter;
