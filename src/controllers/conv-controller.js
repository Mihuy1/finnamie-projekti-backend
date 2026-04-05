import {
  getConversation,
  getConvsByUserIdModel,
  getMessagesByConvIdModel,
  postMessageModel,
  startConversationModel,
  markMessagesAsReadModel,
} from "../models/conv-model.js";

import { v4 as uuidv4 } from "uuid";
import db from "../utils/database.js";

export const getMessagesByConvId = async (req, res, next) => {
  try {
    const convId = req.params.id;
    const userId = req.user.id;

    await markMessagesAsReadModel(convId, userId);

    const data = await getMessagesByConvIdModel(convId);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      "SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0",
      [userId]
    );

    const count = Number(result[0].count);

    res.json({ count });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    await markMessagesAsReadModel(req.params.id, req.user.id);
    res.status(200).json({ message: "Messages marked as read" });
  } catch (err) {
    next(err);
  }
};

export const getConvsByUserId = async (req, res, next) => {
  try {
    const data = await getConvsByUserIdModel(req.user.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

export const postMessage = async (req, res, next) => {
  try {
    const { conv_id, receiver_id, content } = req.body;
    const sender_id = req.user.id;

    const data = await postMessageModel({
      id: uuidv4(),
      conv_id,
      sender_id,
      receiver_id,
      content
    });

    if (res) {
      return res.status(201).json(data);
    }

    return data;

  } catch (err) {
    if (next) return next(err);
    console.error("Controller error:", err);
    throw err;
  }
};

export const startConversation = async (req, res, next) => {
  try {
    const convID = await startConversationModel(req.user.id, req.body.receiver);
    res.status(200).json({ convesation_id: convID });
  } catch (err) {
    next(err);
  }
};

export const getConvId = async (req, res, next) => {
  try {
    const convID = await getConversation(req.user.id, req.params.receiver_id);
    console.log(convID);
    if (!convID) res.status(404).json({ message: "No conversation found." });
    res.status(200).json(convID);
  } catch (err) {
    next(err);
  }
};
