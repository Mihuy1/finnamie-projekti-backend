import {
  createActivitySuggestion,
  deleteActivitySuggestionById,
  listAllActivitiesSuggestions,
} from "../models/activities-suggestions-model.js";
import { getHostProfileUserId } from "../models/host-profile-model.js";

export const getAllActivitiesSuggestions = async (req, res, next) => {
  try {
    res.json(await listAllActivitiesSuggestions());
  } catch (error) {
    next(error);
  }
};

export const createNewActivitySuggestion = async (req, res, next) => {
  const { name } = req.body;
  const id = req.user.id;

  try {
    const hostProfile = await getHostProfileUserId(id);

    if (!hostProfile)
      return res.status(404).json({ message: "No host profile found" });

    const affectedRows = await createActivitySuggestion(name, id);

    if (affectedRows === 0)
      return res
        .status(400)
        .json({ message: "Activity Suggestion not created" });

    res.status(201).json({ message: "Activity Suggestion Created" });
  } catch (error) {
    next(error);
  }
};

export const removeActivitiesSuggestionById = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const affectedRows = await deleteActivitySuggestionById(id);
    if (affectedRows === 0)
      return res.status(404).json({ message: "Activity Suggestion not found" });
    res.status(200).json({ message: "Activity Suggestion deleted" });
  } catch (error) {
    next(error);
  }
};

// export const acceptActivitySuggestion = async (req, res, next) => {
//   const { name } = req.body;

//   try {
//     const rows = await
//   }
// };
