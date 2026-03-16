import {
  createActivity,
  deleteActivity,
  listAllActivities,
} from "../models/activities-model.js";

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
    await createActivity(name);

    res.status(201).json({ message: "Activity created successfully!" });
  } catch (error) {
    next(error);
  }
};

export const removeActivityById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const affectedRows = await deleteActivity(id);

    if (affectedRows === 0)
      return res.status(404).json({ message: "Activity not found" });

    res.status(202).json({ message: "Activity deleted successfully" });
  } catch (error) {
    next(error);
  }
};
