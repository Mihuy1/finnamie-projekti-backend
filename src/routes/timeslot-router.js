import express from "express";
import {
  getTimeslot,
  getTimeslotById,
} from "../controllers/timeslot-controller.js";

const timeslotRouter = express.Router();

timeslotRouter.route("/").get(getTimeslot);
timeslotRouter.route("/:id").get(getTimeslotById);

export default timeslotRouter;
