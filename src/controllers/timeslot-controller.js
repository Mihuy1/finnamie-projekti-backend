import { v4 as uuidv4 } from "uuid";
import {
  addTimeSlot,
  deleteTimeslot,
  getAvailableTimeslots,
  getOwnedTimeslots,
  listAllTimeslot,
  timeslotById,
  timeslotHistory,
  updateTimeslot,
} from "../models/timeslot-model.js";

import { getTimeslotImageURLs } from "../models/upload-model.js";
import { deleteImages } from "../utils/multer.js";

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

const createNewTimeslot = async (req, res, next) => {
  try {
    const {
      type, // halfday/fullday
      start_time,
      end_time,
      description,
      city,
      latitude_deg,
      longitude_deg,
      activity_type, // indoor/outdoor
    } = req.body;

    const timeslot = {
      id: uuidv4(),
      host_id: req.user.id,
      type,
      start_time,
      end_time,
      description,
      city,
      latitude_deg,
      longitude_deg,
      activity_type,
    };

    const missing = checkMissingFields(Object.entries(timeslot));
    if (missing.length)
      return res
        .status(400)
        .json({ message: "Missing fields found.", missing });

    const addedTimeslot = await addTimeSlot(timeslot);
    res.status(201).json({
      message: "Timeslot added succesfully.",
      timeslot: addedTimeslot,
    });
  } catch (err) {
    next(err);
  }
};

const updateExistingTimeslot = async (req, res, next) => {
  try {
    res.json(await updateTimeslot(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
};

const deleteExistingTimeslot = async (req, res, next) => {
  try {
    await deleteTimeslot(req.params.id, req.user.id);
    const urls = await getTimeslotImageURLs(req.params.id);
    await deleteImages(urls.map((u) => u.url));
    res
      .status(200)
      .json({ message: "Timeslot deleted successfully. ID: " + req.params.id });
  } catch (err) {
    next(err);
  }
};

const getTimeslotHistory = async (req, res, next) => {
  console.log("Getting history for: ");
  console.log(req.user);
  try {
    res.json(await timeslotHistory(req.user.id));
  } catch (err) {
    next(err);
  }
};

const getTimeslotsByHostId = async (req, res, next) => {
  try {
    res.json(await getOwnedTimeslots(req.user.id));
  } catch (err) {
    next(err);
  }
};

const getAvailable = async (req, res, next) => {
  try {
    res.json(await getAvailableTimeslots());
  } catch (err) {
    next(err);
  }
};

const checkMissingFields = (object) => {
  return Object.entries(object)
    .filter(([k, v]) => v === undefined || v === null || v === "")
    .map(([k]) => k);
};

export {
  getTimeslot,
  getTimeslotById,
  createNewTimeslot,
  updateExistingTimeslot,
  deleteExistingTimeslot,
  getTimeslotHistory,
  getTimeslotsByHostId,
  getAvailable,
};
