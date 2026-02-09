import { listAllActivities } from "../models/activities-model.js";

export const getActivites = async (req, res, next) => {
  try {
    res.json(await listAllActivities());
  } catch (error) {
    next(error);
  }
};
