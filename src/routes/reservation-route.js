import express from "express";
import { allowRoles, authorize } from "../middlewares.js";
import {
  cancelReservation,
  confirmReservation,
  confirmTimeslot,
  getPrices,
  getReservationInformation,
  reserveTimeslot,
  updatePriceIds,
  updateStatus, //
} from "../controllers/reservation-controller.js";

const reservationRouter = express.Router();

reservationRouter.use(authorize);

reservationRouter.patch("/:id/status", updateStatus);

reservationRouter.route("/").get(getReservationInformation);
reservationRouter
  .route("/prices")
  .all(allowRoles("admin"))
  .get(getPrices)
  .put(updatePriceIds);

reservationRouter
  .route("/:timeslot_id")
  .post(reserveTimeslot)
  .put(confirmTimeslot);

reservationRouter.route("/cancel/:timeslot_id").put(cancelReservation);
reservationRouter.route("/confirm/:reservation_id").put(confirmReservation);

export default reservationRouter;
