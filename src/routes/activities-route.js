import express from "express";
import { getActivites } from "../controllers/activities-controller.js";

const activitiesRouter = express.Router();

activitiesRouter.route("/").get(getActivites);

export default activitiesRouter;
