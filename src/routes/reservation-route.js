import express from "express";
import { authorize } from "../middlewares.js";
import {
  cancelReservation,
  confirmTimeslot,
  getReservationInformation,
  reserveTimeslot,
} from "../controllers/reservation-controller.js";

const reservationRouter = express.Router();

reservationRouter.use(authorize);

reservationRouter.route("/").get(getReservationInformation);
reservationRouter
  .route("/:timeslot_id")
  .post(reserveTimeslot)
  .put(confirmTimeslot);
reservationRouter.route("/cancel/:timeslot_id").put(cancelReservation);

export default reservationRouter;
