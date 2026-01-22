import express from "express";
import {
  getUserById,
  getUsers,
  postUser,
} from "../controllers/users-controller.js";

const userRouter = express.Router();

userRouter.route("/").get(getUsers);
userRouter.route("/:id").get(getUserById);
userRouter.route("/").post(postUser);

export default userRouter;
