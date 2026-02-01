import { v4 as uuidv4 } from "uuid";
import { listAllTimeslot, timeslotById } from "../models/timeslot-model.js";

const getTimeslot = async (req, res, next) => {
  try {
    res.json(await listAllTimeslot());
  } catch (error) {
    next(error);
  }
};

const getTimeslotById = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.json(await timeslotById(id));
  } catch (error) {
    next(error);
  }
};

export { getTimeslot, getTimeslotById };
