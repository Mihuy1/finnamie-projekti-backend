import express from "express";
import {
  getUserById,
  getUsers,
  postUser,
  putUser,
} from "../controllers/users-controller.js";
import { allowSelfOrAdmin, authorize } from "../middlewares.js";

const userRouter = express.Router();

userRouter.route("/").post(postUser);

// Kommenttiin testaamisen vuoksi.
// Pitäs varmaa käyttää testaamisessakin.
//userRouter.use(authorize);

userRouter.route("/").get(getUsers);
userRouter.route("/:id").get(getUserById).put(allowSelfOrAdmin, putUser);

export default userRouter;
