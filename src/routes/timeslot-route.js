import express from "express";
import {
  createNewTimeslot,
  deleteExistingTimeslot,
  getAvailable,
  getTimeslot,
  getTimeslotById,
  getTimeslotHistory,
  getTimeslotsByHostId,
  getTimeslotsWithHost,
  updateExistingTimeslot,
} from "../controllers/timeslot-controller.js";
import { allowRoles, authorize } from "../middlewares.js";

const timeslotRouter = express.Router();

timeslotRouter.route("/available").get(getAvailable); // tarkotuksella ennen .use(authorize)
timeslotRouter.route("/availableWithHost").get(getTimeslotsWithHost);

timeslotRouter.use(authorize);

timeslotRouter
  .route("/")
  .get(getTimeslot)
  .post(allowRoles("host", "admin"), createNewTimeslot);

timeslotRouter.route("/history").get(getTimeslotHistory);
timeslotRouter.route("/host/:id").get(getTimeslotsByHostId);

timeslotRouter
  .route("/:id")
  .get(getTimeslotById)
  .delete(allowRoles("host", "admin"), deleteExistingTimeslot)
  .put(allowRoles("host", "admin"), updateExistingTimeslot);

export default timeslotRouter;
