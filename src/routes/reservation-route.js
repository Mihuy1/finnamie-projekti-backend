import express from "express";
import { authorize } from "../middlewares.js";
import {
  cancelReservation,
  confirmReservation,
  confirmTimeslot,
  getReservationInformation,
  reserveTimeslot,
  updateStatus, //
} from "../controllers/reservation-controller.js";

const reservationRouter = express.Router();

reservationRouter.use(authorize);

reservationRouter.patch("/:id/status", updateStatus);

reservationRouter.route("/").get(getReservationInformation);

reservationRouter
  .route("/:timeslot_id")
  .post(reserveTimeslot)
  .put(confirmTimeslot);

reservationRouter.route("/cancel/:timeslot_id").put(cancelReservation);
reservationRouter.route("/confirm/:reservation_id").put(confirmReservation);

export default reservationRouter;
