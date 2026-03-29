import express from "express";
import { authorize } from "../middlewares.js";
import {
  getConvId,
  getConvsByUserId,
  getMessagesByConvId,
  startConversation,
} from "../controllers/conv-controller.js";

const convRouter = express.Router();

convRouter.use(authorize);

convRouter.route("/").get(getConvsByUserId).post(startConversation);
convRouter.route("/conv-id/:receiver_id").get(getConvId);
convRouter.route("/:id").get(getMessagesByConvId);

export default convRouter;
