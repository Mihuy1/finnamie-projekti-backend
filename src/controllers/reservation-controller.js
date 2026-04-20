import {
  cancelReservationModel,
  confirmReservationModel,
  getReservationInformationModel,
  reserveTimeslotModel,
  getReservationsForHostModel,
  setPaymentCompleted,
  getReservationWithTimeslotByIdModel,
  getPriceData,
  setPriceData,
  getAllReservationsModel,
  markReservationsPaidModel,
} from "../models/reservation-model.js";
import {
  getTimeslotBookingCount,
  getTimeslotByIdWithExperience,
  increaseBookingCount,
  timeslotById,
} from "../models/timeslot-model.js";
import pool from "../utils/database.js";
import { updateReservationStatusByIdModel } from "../models/reservation-model.js";
import {
  getUserByIdModel,
  getUserIsVerifiedById,
} from "../models/users-model.js";
import { getExperienceById } from "../models/experiences-model.js";
import {
  sendBookingInformationEmail,
  sendBookingNotificationToHost,
} from "../services/brevoService.js";

export const reserveTimeslot = async (req, res, next) => {
  const timeslot_id = req.params.timeslot_id;
  const user_id = req.user.id;
  let conn;
  try {
    conn = await pool.getConnection();

    await conn.beginTransaction();

    const is_verified = await getUserIsVerifiedById(user_id);
    const timeslot = await timeslotById(timeslot_id);
    const host = await getUserByIdModel(timeslot[0].host_id);

    console.log("req.user.email:", req.user.email);
    console.log("host email:", host.email);

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
    sendBookingNotificationToHost(
      host.email,
      req.user,
      timeslot[0],
      experience[0],
    );

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

    const reservation =
      await getReservationWithTimeslotByIdModel(reservation_id);

    console.log("Reservation:", reservation);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    if (reservation.start_time) {
      const start = new Date(reservation.start_time);

      if (start.getTime() < Date.now())
        return res
          .status(400)
          .json({ message: "Experience has already started!" });
    }

    await cancelReservationModel(reservation_id, userID);

    res.status(200).json({ message: "Reservation cancelled." });
  } catch (err) {
    next(err);
  }
};

export const confirmReservation = async (req, res, next) => {
  const { reservation_id } = req.params;
  const userID = req.user.id;

  console.log(
    "this was called, userID:",
    userID,
    "reservation_id:",
    reservation_id,
  );

  if (!reservation_id || reservation_id === "undefined")
    return res.status(400).status({ message: "reservation_id is missing" });

  const response = await confirmReservationModel(reservation_id, userID);

  if (response.affectedRows === 0)
    return res
      .status(400)
      .json({ message: "Reservation not found, could not confirm" });

  res.status(200).json({ message: "Reservation confirmed." });
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

export const getPrices = async (req, res, next) => {
  try {
    const data = await getPriceData();
    res.status(200).json(data);
  } catch (e) {
    next(e);
  }
};

export const updatePriceIds = async (req, res, next) => {
  try {
    const prices = req.body;
    await setPriceData(prices);
    res.status(200).json({ success: true });
  } catch (e) {
    next(e);
  }
};

export const setReservationPaid = async (resId) => {
  try {
    await setPaymentCompleted(resId);
  } catch (e) {
    next(e);
  }
};

export const getAllReservations = async (req, res, next) => {
  try {
    const data = await getAllReservationsModel();
    res.status(200).json(data);
  } catch (e) {
    next(e);
  }
};

export const markReservationsAsPaid = async (req, res, next) => {
  try {
    await markReservationsPaidModel(req.body.reservation_ids);
    res.status(200).json({ message: "Payment status updated succesfully." });
  } catch (e) {
    next(e);
  }
};
