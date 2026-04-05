import {
  cancelReservationModel,
  confirmReservationModel,
  getReservationInformationModel,
  reserveTimeslotModel,
} from "../models/reservation-model.js";
import {
  getTimeslotBookingCount,
  increaseBookingCount,
} from "../models/timeslot-model.js";
import pool from "../utils/database.js";
import { updateReservationStatusByIdModel } from "../models/reservation-model.js";

export const reserveTimeslot = async (req, res, next) => {
  const timeslot_id = req.params.timeslot_id;
  const user_id = req.user.id;
  let conn;
  try {
    conn = await pool.getConnection();

    await conn.beginTransaction();

    const bookingCount = await getTimeslotBookingCount(timeslot_id, conn);

    if (
      bookingCount.max_participants !== null &&
      bookingCount.current_bookings >= bookingCount.max_participants
    ) {
      await conn.rollback();
      return res.status(400).json({ message: "Overlapping reservation." });
    }

    const reservation = await reserveTimeslotModel(timeslot_id, user_id, conn);

    if (!reservation || !reservation.id) {
      await conn.rollback();
      return res.status(400).json({ message: "Failed to reserve timeslot." });
    }

    if (reservation.affectedRows === 0) {
      await conn.rollback();
      return res.status(400).json({ message: "Failed to reserve timeslot." });
    }

    const increaseBookingResult = await increaseBookingCount(timeslot_id, conn);

    if (increaseBookingResult.affectedRows === 0) {
      await conn.rollback();
      return res
        .status(400)
        .json({ message: "Failed to update booking count." });
    }

    await conn.commit();

    res.status(200).json({
      message: "Timeslot reserved.",
      id: reservation.id
    });
  } catch (err) {
    next(err);
  } finally {
    if (conn) conn.release();
  }
};

export const cancelReservation = async (req, res, next) => {
  try {
    await cancelReservationModel(req.params.timeslot_id, req.user.id);
    res.status(200).json({ message: "Reservation cancelled." });
  } catch (err) {
    next(err);
  }
};

export const confirmTimeslot = async (req, res, next) => {
  try {
    await confirmReservationModel(req.params.timeslot_id, req.user.id);
    res.status(200).json({ message: "Reservation confirmed." });
  } catch (err) {
    next(err);
  }
};

export const getReservationInformation = async (req, res, next) => {
  try {
    const data = await getReservationInformationModel(req.user.id);
    console.log(data);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { booking_status } = req.body;

    console.log("DEBUG: Päivitetään varausta:", id, "tilaan:", booking_status);

    const result = await updateReservationStatusByIdModel(id, booking_status);

    res.status(200).json({ message: "Status updated" });
  } catch (err) {
    console.error("BACKEND ERROR:", err);
    next(err);
  }
};