import {
  getConvsByUserIdModel,
  getMessagesByConvIdModel,
} from "../models/conv-model.js";

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
