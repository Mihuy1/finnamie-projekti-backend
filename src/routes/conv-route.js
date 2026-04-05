import express from "express";
import { authorize } from "../middlewares.js";
import {
  getConvId,
  getConvsByUserId,
  getMessagesByConvId,
  startConversation,
  postMessage,
  getUnreadCount,
  markAsRead,
} from "../controllers/conv-controller.js";

const convRouter = express.Router();

convRouter.use(authorize);

convRouter.get("/unread-count", getUnreadCount);

convRouter.route("/").get(getConvsByUserId).post(startConversation);
convRouter.route("/messages").post(postMessage);
convRouter.route("/conv-id/:receiver_id").get(getConvId);
convRouter.route("/read/:id").put(markAsRead);
convRouter.route("/:id").get(getMessagesByConvId);

export default convRouter;
