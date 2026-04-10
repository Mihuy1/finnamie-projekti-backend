import {
  cancelReservationModel,
  confirmReservationModel,
  getReservationInformationModel,
  reserveTimeslotModel,
  getReservationsForHostModel,
  setPaymentCompleted,
} from "../models/reservation-model.js";
import {
  getTimeslotBookingCount,
  increaseBookingCount,
  timeslotById,
} from "../models/timeslot-model.js";
import pool from "../utils/database.js";
import { updateReservationStatusByIdModel } from "../models/reservation-model.js";
import { getUserIsVerifiedById } from "../models/users-model.js";
import { getExperienceById } from "../models/experiences-model.js";
import { sendBookingInformationEmail } from "../services/brevoService.js";

export const reserveTimeslot = async (req, res, next) => {
  const timeslot_id = req.params.timeslot_id;
  const user_id = req.user.id;
  let conn;
  try {
    conn = await pool.getConnection();

    await conn.beginTransaction();

    const is_verified = await getUserIsVerifiedById(user_id);
    const timeslot = await timeslotById(timeslot_id);

    if (!timeslot) {
      await conn.rollback();
      return res.status(404).json({ message: "Timeslot not found." });
    }

    const experience = await getExperienceById(timeslot[0].experience_id);

    if ((!experience, !experience[0])) {
      await conn.rollback();
      return res.status(404).json({ message: "Experience not found." });
    }

    if (!is_verified) {
      await conn.rollback();
      return res
        .status(403)
        .json({ message: "Email not verified. Please verify your email." });
    }

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

    sendBookingInformationEmail(req.user.email, timeslot[0], experience[0]);

    await conn.commit();

    res.status(200).json({
      message: "Timeslot reserved.",
      id: reservation.id,
    });
  } catch (err) {
    next(err);
  } finally {
    if (conn) conn.release();
  }
};
export const cancelReservation = async (req, res, next) => {
  try {
    const { timeslot_id: reservation_id } = req.params;
    const userID = req.user.id;

    if (!reservation_id || reservation_id === "undefined") {
      return res.status(400).json({ message: "ID is missing" });
    }

    await cancelReservationModel(reservation_id, userID);

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
    const userId = req.user.id;
    const userRole = req.user.role;

    let data;

    if (userRole === "host") {
      data = await getReservationsForHostModel(userId);
    } else {
      data = await getReservationInformationModel(userId);
    }

    console.log(`Fetch reservations for ${userRole}:`, data);
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

export const reservationPaid = async (req, res, next) => {
  try {
    const { res_id } = req.body;
    await setPaymentCompleted(res_id);
    res.status(200).json({ message: "Payment completed." });
  } catch (e) {
    next(e);
  }
};
