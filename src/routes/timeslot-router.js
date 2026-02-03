import express from "express";
import {
  createNewTimeslot,
  deleteExistingTimeslot,
  getTimeslot,
  getTimeslotById,
  getTimeslotHistory,
  updateExistingTimeslot,
} from "../controllers/timeslot-controller.js";
import { allowRoles, authorize } from "../middlewares.js";

const timeslotRouter = express.Router();
timeslotRouter.use(authorize);

timeslotRouter
  .route("/")
  .get(getTimeslot)
  .post(allowRoles("host", "admin"), createNewTimeslot);

timeslotRouter.route("/history").get(getTimeslotHistory);

timeslotRouter
  .route("/:id")
  .get(getTimeslotById)
  .delete(allowRoles("host", "admin"), deleteExistingTimeslot)
  .put(allowRoles("host", "admin"), updateExistingTimeslot);

export default timeslotRouter;
