import {
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

export const postMessage = async (message) => {
  try {
    const data = await postMessageModel({
      id: uuidv4(),
      ...message,
    });
    return data;
  } catch (err) {
    next(err);
  }
};

export const startConversation = async (req, res, next) => {
  try {
    console.log(req.body);
    const convID = await startConversationModel(req.user.id, req.body.receiver);
    res.status(200).json({ convesation_id: convID });
  } catch (err) {
    next(err);
  }
};
