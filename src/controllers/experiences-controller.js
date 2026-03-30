import {
  getAllExperiences,
  getAllExperiencesWithHost,
  getExperienceById,
  getExperiencesByHostId,
  insertExperience,
  putExperience,
  removeExperience,
} from "../models/experiences-model.js";
import {
  getActivitiesByExperienceId,
  insertTimeslotActivitiesExperience,
} from "../models/timeslot-activities-model.js";
import {
  insertTimeslotRule,
  getRuleByExperienceId,
  putTimeslotRule,
} from "../models/timeslot-rules-model.js";
import {
  getExperienceImageURLs,
  uploadTimeSlotImagesExperience,
} from "../models/upload-model.js";
import { updateTimeslotsByExperienceId } from "../models/timeslot-model.js";
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

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Insert the experience first (everything else depends on experience_id)
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

    // 2. Run images, rule, and activities inserts concurrently — they're independent
    const urls = imageFiles.map((file) => [
      `/uploads/timeslots/${file.filename}`,
      Number(experience_id),
    ]);

    const [uploadedImages, timeslotRuleResult, timeslotActivitiesResult] =
      await Promise.all([
        uploadTimeSlotImagesExperience(conn, urls),
        insertTimeslotRule(
          conn,
          host_id,
          experience_id,
          start_date,
          end_date,
          start_time,
          end_time,
          weekdays_bitmask,
          max_participants,
        ),
        insertTimeslotActivitiesExperience(
          conn,
          experience_id,
          parsedActivityIds,
        ),
      ]);

    if (uploadedImages?.affectedRows === 0 && imageFiles.length > 0) {
      await conn.rollback();
      return res.status(500).json({ message: "Error uploading images" });
    }

    if (timeslotRuleResult.affectedRows === 0) {
      await conn.rollback();
      return res
        .status(500)
        .json({ message: "Error creating timeslot rule for experience" });
    }

    if (
      timeslotActivitiesResult.affectedRows === 0 &&
      parsedActivityIds.length > 0
    ) {
      await conn.rollback();
      return res
        .status(500)
        .json({ message: "Error associating activities with experience" });
    }

    // 3. Batch-insert all timeslots in a single query
    const ruleId = Number(timeslotRuleResult.insertId);
    const bitmask = Number(weekdays_bitmask);
    const timeslotRows = [];
    const timeslotParams = [];

    let currentDate = new Date(start_date);
    const endDate = new Date(end_date);

    while (currentDate <= endDate) {
      const dayBit = 1 << currentDate.getDay();

      if ((bitmask & dayBit) !== 0) {
        const dateStr = currentDate.toISOString().split("T")[0];
        timeslotRows.push("(?, ?, ?, ?, ?, ?, ?)");
        timeslotParams.push(
          uuidv4(),
          host_id,
          experience_id,
          ruleId,
          `${dateStr} ${start_time}`,
          `${dateStr} ${end_time}`,
          max_participants,
        );
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (timeslotRows.length > 0) {
      await conn.execute(
        `INSERT INTO timeslot (id, host_id, experience_id, rule_id, start_time, end_time, max_participants)
         VALUES ${timeslotRows.join(", ")}`,
        timeslotParams,
      );
    }

    await conn.commit();

    const [createdExperience] = await conn.query(
      "SELECT * FROM experiences WHERE id = ?",
      [experience_id],
    );

    const images = await getExperienceImageURLs(experience_id);

    res.status(201).json({
      message: "Experience created successfully",
      experience: {
        ...createdExperience,
        rule: {
          id: ruleId,
          start_date,
          end_date,
          start_time,
          end_time,
          weekdays_bitmask,
          max_participants,
        },
        images,
      },
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    if (conn) conn.release();
  }
};

export const updateExperience = async (req, res, next) => {
  const host_id = req.user.id;
  const { activity_ids, ...experienceData } = req.body;
  const { id } = req.params;

  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const dataForPutExperience = {
      ...experienceData,
    };

    delete dataForPutExperience.rule;

    const experienceRes = await putExperience(
      conn,
      id,
      dataForPutExperience,
      host_id,
    );

    if (experienceRes === null) {
      await conn.rollback();
      return res.status(404).json({ message: "Failed to update experience" });
    }

    if (activity_ids !== undefined) {
      const parsedIds = Array.isArray(activity_ids)
        ? activity_ids
        : JSON.parse(activity_ids);

      const activityIdsRes = await insertTimeslotActivitiesExperience(
        conn,
        id,
        parsedIds,
      );

      if (parsedIds.length > 0 && activityIdsRes?.affectedRows === 0) {
        await conn.rollback();
        return res
          .status(500)
          .json({ message: "Failed to update Activity Ids" });
      }
    }

    const updatedActivities = await getActivitiesByExperienceId(id, conn);

    const parsedRule = JSON.parse(experienceData.rule);

    const timeslotRulePut = await putTimeslotRule(conn, id, parsedRule);

    if (timeslotRulePut) {
      await updateTimeslotsByExperienceId(conn, id, {
        type: dataForPutExperience.type,
        description: dataForPutExperience.description,
        city: dataForPutExperience.city,
        latitude_deg: dataForPutExperience.latitude_deg,
        longitude_deg: dataForPutExperience.longitude_deg,
        address: dataForPutExperience.address,
        start_date: parsedRule.start_date,
        end_date: parsedRule.end_date,
        start_time: parsedRule?.start_time,
        end_time: parsedRule?.end_time,
        max_participants: parsedRule?.max_participants,
      });
    }

    const images = await getExperienceImageURLs(id);

    await conn.commit();

    return res.status(200).json({
      experience: {
        ...experienceRes,
        activities: updatedActivities,
        rule: timeslotRulePut,
        images,
      },
    });
  } catch (error) {
    if (conn) await conn.rollback();
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
