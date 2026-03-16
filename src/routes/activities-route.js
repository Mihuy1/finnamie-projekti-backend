import express from "express";
import {
  createNewActivityByName,
  getActivites,
  removeActivityById,
} from "../controllers/activities-controller.js";
import { allowRoles, authorize } from "../middlewares.js";

const activitiesRouter = express.Router();

activitiesRouter.route("/").get(getActivites);

activitiesRouter.use(authorize);

activitiesRouter.route("/").post(allowRoles("admin"), createNewActivityByName);

activitiesRouter.route("/:id").delete(allowRoles("admin"), removeActivityById);

export default activitiesRouter;
