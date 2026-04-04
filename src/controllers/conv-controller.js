import {
  getConversation,
  getConvsByUserIdModel,
  getMessagesByConvIdModel,
  postMessageModel,
  startConversationModel,
} from "../models/conv-model.js";

import { v4 as uuidv4 } from "uuid";

export const getMessagesByConvId = async (req, res, next) => {
  try {
    const data = await getMessagesByConvIdModel(req.params.id);
    res.status(200).json(data);
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

    const data = await postMessageModel({
      id: uuidv4(),
      conv_id,
      sender_id: req.user.id,
      receiver_id,
      content,
      sent_at: new Date()
    });

    res.status(201).json(data);
  } catch (err) {
    next(err);
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
