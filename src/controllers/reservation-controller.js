import {
  cancelReservationModel,
  confirmReservationModel,
  getReservationInformationModel,
  reserveTimeslotModel,
} from "../models/reservation-model.js";

export const reserveTimeslot = async (req, res, next) => {
  try {
    await reserveTimeslotModel(req.params.timeslot_id, req.user.id);
    res.status(200).json({ message: "Timeslot reserved." });
  } catch (err) {
    next(err);
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
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};
