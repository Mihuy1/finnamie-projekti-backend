import express from "express";
import { authorize } from "../middlewares.js";
import {
  getConvsByUserId,
  getMessagesByConvId,
} from "../controllers/conv-controller.js";

const convRouter = express.Router();

convRouter.use(authorize);

convRouter.route("/").get(getConvsByUserId);

convRouter.route("/:id").get(getMessagesByConvId);

export default convRouter;
