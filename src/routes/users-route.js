import express from "express";
import {
  getUserById,
  getUsers,
  postUser,
  putUser,
} from "../controllers/users-controller.js";
import { allowRoles, allowSelfOrAdmin, authorize } from "../middlewares.js";

const userRouter = express.Router();

userRouter.use(authorize);

userRouter.route("/").get(getUsers).post(allowRoles("admin"), postUser);

userRouter.route("/:id").get(getUserById).put(allowSelfOrAdmin, putUser);

export default userRouter;
