import {
  getAllExperiences,
  getAllExperiencesWithHost,
  getExperienceById,
  getExperiencesByHostId,
  insertExperience,
  removeExperience,
} from "../models/experiences-model.js";
import { insertTimeslotActivitiesExperience } from "../models/timeslot-activities-model.js";
import { insertTimeslotRule } from "../models/timeslot-rules-model.js";
import { uploadTimeSlotImagesExperience } from "../models/upload-model.js";
import { v4 as uuidv4 } from "uuid";
import pool from "../utils/database.js";

export const fetchAllExperiences = async (req, res, next) => {
  try {
    const experiences = await getAllExperiences();
    res.json(experiences);
  } catch (error) {
    next(error);
  }
};

export const fetchAllExperiencesWithHost = async (req, res, next) => {
  try {
    const experiences = await getAllExperiencesWithHost();
    res.json(experiences);
  } catch (error) {
    next(error);
  }
};

export const getExperiencesByHost = async (req, res, next) => {
  const host_id = req.user.id;

  try {
    const experiences = await getExperiencesByHostId(host_id);
    console.log("experiences:", experiences);

    res.json(experiences);
  } catch (error) {
    next(error);
  }
};

export const createExperience = async (req, res, next) => {
  const host_id = req.user.id;
  const {
    title,
    description,
    type,
    city,
    address,
    latitude_deg,
    longitude_deg,
    start_date,
    end_date,
    start_time,
    end_time,
    weekdays_bitmask,
    max_participants,
    activity_ids,
  } = req.body;

  const imageFiles = req.files?.images || [];
  const parsedActivityIds = activity_ids ? JSON.parse(activity_ids) : [];

  console.log("req.body:", req.body);
  console.log("req.files.images:", imageFiles);

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const result = await insertExperience(
      conn,
      host_id,
      title,
      description,
      type,
      city,
      address,
      latitude_deg,
      longitude_deg,
    );

    if (result.affectedRows === 0)
      return res.status(500).json({ message: "Error creating experience" });

    const experience_id = result.insertId;

    const urls = imageFiles.map((file) => [
      `/uploads/timeslots/${file.filename}`,
      Number(experience_id),
    ]);

    console.log("urls:", urls);

    // Upload images if provided
    const uploadedImages = await uploadTimeSlotImagesExperience(conn, urls);

    if (
      uploadedImages &&
      uploadedImages.affectedRows === 0 &&
      req.files?.images?.length > 0
    ) {
      await conn.rollback();
      return res.status(500).json({ message: "Error uploading images" });
    }

    // Create the timeslot rule for the experience
    const timeslotRuleResult = await insertTimeslotRule(
      conn,
      host_id,
      experience_id,
      start_date,
      end_date,
      start_time,
      end_time,
      weekdays_bitmask,
      max_participants,
    );

    if (timeslotRuleResult.affectedRows === 0) {
      return res
        .status(500)
        .json({ message: "Error creating timeslot rule for experience" });
    }

    const ruleId = timeslotRuleResult.insertId;

    // Create associations with activities if provided
    const timeslotActivitiesResult = await insertTimeslotActivitiesExperience(
      conn,
      experience_id,
      JSON.parse(activity_ids) || [],
    );

    if (
      timeslotActivitiesResult.affectedRows === 0 &&
      (JSON.parse(activity_ids) || []).length > 0
    ) {
      await conn.rollback();
      return res
        .status(500)
        .json({ message: "Error associating activities with experience" });
    }

    let currentDate = new Date(start_date);
    const endDate = new Date(end_date);

    while (currentDate <= endDate) {
      const dayIndex = currentDate.getDay(); // Sunday = 0
      const dayBit = 1 << dayIndex;

      if ((weekdays_bitmask & dayBit) !== 0) {
        const dateStr = currentDate.toISOString().split("T")[0];
        await conn.execute(
          `INSERT INTO timeslot (id, host_id, experience_id, rule_id, start_time, end_time, max_participants) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            host_id,
            experience_id,
            ruleId,
            `${dateStr} ${start_time}`,
            `${dateStr} ${end_time}`,
            max_participants,
          ],
        );
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const [createdExperience] = await conn.query(
      "SELECT * FROM experiences WHERE id = ?",
      [experience_id],
    );

    const createdRule = await conn.query(
      `SELECT e.id, tr.start_date, tr.end_date, tr.start_time, tr.end_time, tr.weekdays_bitmask, tr.max_participants
       FROM timeslot_rules tr
       JOIN experiences e ON e.id = tr.experience_id
       WHERE tr.experience_id = ?`,
      [experience_id],
    );

    await conn.commit();

    res.status(201).json({
      message: "Experience created successfully",
      experience: {
        ...createdExperience,
        rule: createdRule,
      },
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    if (conn) conn.release();
  }
};

export const deleteExperienceById = async (req, res, next) => {
  const host_id = req.user.id;
  const { id } = req.params;

  try {
    const rows = await removeExperience(host_id, id);

    if (rows.affectedRows === 0)
      return res.status(404).json({ message: "Experience not found" });

    res.status(200).json({ message: "Experience deleted" });
  } catch (error) {
    next(error);
  }
};
