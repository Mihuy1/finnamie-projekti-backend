import express from "express";
import { allowRoles, authorize } from "../middlewares.js";
import {
  createNewActivitySuggestion,
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
  .route("/:id")
  .delete(allowRoles("admin"), removeActivitiesSuggestionById);
export default activitiesSuggestionsRoute;
