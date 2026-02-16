import express from "express";
import {
  getUserById,
  getUserPublicInfo,
  getUsers,
  postUser,
  putUser,
} from "../controllers/users-controller.js";
import { allowRoles, allowSelfOrAdmin, authorize } from "../middlewares.js";

const userRouter = express.Router();

userRouter.route("/public/:id").get(getUserPublicInfo);

userRouter.use(authorize);

userRouter.route("/").get(getUsers).post(allowRoles("admin"), postUser);

userRouter.route("/:id").get(getUserById).put(allowRoles("admin"), putUser);

export default userRouter;
