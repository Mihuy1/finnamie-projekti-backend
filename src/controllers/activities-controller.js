import {
  createActivity,
  deleteActivity,
  getActivityByName,
  listAllActivities,
  putActivity,
} from "../models/activities-model.js";
import { getActivityUsageCount } from "../models/timeslot-activities-model.js";

import pool from "../utils/database.js";

export const getActivites = async (req, res, next) => {
  try {
    res.json(await listAllActivities());
  } catch (error) {
    next(error);
  }
};

export const createNewActivityByName = async (req, res, next) => {
  const { name } = req.body;

  try {
    const result = await createActivity(name);

    if (result.affectedRows.length === 0)
      return res
        .status(409)
        .json({ message: "Something went wrong during activity creation" });

    res.status(201).json({
      message: "Activity created successfully!",
      id: Number(result.insertId).toString(),
    });
  } catch (error) {
    next(error);
  }
};

export const removeActivityById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const usageCount = await getActivityUsageCount(id);

    if (usageCount > 0)
      return res.status(409).json({
        message: `Cannot delete activity. It is currently linked to ${usageCount} timeslot(s)`,
      });

    const affectedRows = await deleteActivity(id);

    if (affectedRows === 0)
      return res.status(404).json({ message: "Activity not found" });

    res.status(202).json({ message: "Activity deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateExperienceName = async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const previousActivity = await pool.query(
      "SELECT * FROM activities WHERE name = ? AND id != ?",
      [name, id],
    );

    if (previousActivity.length > 0)
      return res.status(409).json({ message: "Activity name already exists" });

    const updateResult = await putActivity(id, name);

    if (updateResult === 0)
      return res.status(404).json({ message: "Activity not found" });

    res.status(201).json({ message: "Activity updated" });
  } catch (error) {
    next(error);
  }
};
