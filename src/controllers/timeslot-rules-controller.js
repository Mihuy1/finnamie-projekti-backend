import { addTimeSlot } from "../models/timeslot-model.js";
import { insertTimeslotRule } from "../models/timeslot-rules-model.js";

export const createTimeslotRule = async (req, res, next) => {
  const host_id = req.user.id;

  const {
    experience_id,
    start_date,
    end_date,
    start_time,
    end_time,
    weekdays_bitmask,
    max_participants,
  } = req.body;

  try {
    const result = await insertTimeslotRule(
      null, // Use default pool connection
      host_id,
      experience_id,
      start_date,
      end_date,
      start_time,
      end_time,
      weekdays_bitmask,
      max_participants,
    );
    if (result.affectedRows === 0)
      return res.status(500).json({ message: "Error creating timeslot rule" });

    res.status(201).json({ message: "Timeslot rule created!" });
  } catch (error) {
    next(error);
  }
};
