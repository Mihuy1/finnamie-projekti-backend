import express from "express";
import { allowRoles, authorize } from "../middlewares.js";
import {
  acceptActivitySuggestion,
  createNewActivitySuggestion,
  getActivitySuggestionsByHostId,
  getActivitySuggestionsById,
  getAllActivitiesSuggestions,
  removeActivitiesSuggestionById,
} from "../controllers/activities-suggestions-controller.js";

const activitiesSuggestionsRoute = express.Router();

activitiesSuggestionsRoute.use(authorize);

activitiesSuggestionsRoute
  .route("/")
  .get(allowRoles("admin"), getAllActivitiesSuggestions)
  .post(allowRoles("host", "admin"), createNewActivitySuggestion);

activitiesSuggestionsRoute
  .route("/accept/:id")
  .post(allowRoles("admin"), acceptActivitySuggestion);

activitiesSuggestionsRoute
  .route("/host")
  .get(allowRoles("host"), getActivitySuggestionsByHostId);

activitiesSuggestionsRoute
  .route("/:id")
  .get(allowRoles("admin", "host"), getActivitySuggestionsById)
  .delete(allowRoles("admin", "host"), removeActivitiesSuggestionById);
export default activitiesSuggestionsRoute;
