import express from "express";
import { getUserById, getUsers } from "../controllers/users-controller.js";

const userRouter = express.Router();

userRouter.route("/").get(getUsers);
userRouter.route("/:id").get(getUserById);

export default userRouter;
