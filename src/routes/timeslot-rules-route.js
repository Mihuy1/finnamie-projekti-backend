import express from "express";
import { allowRoles, authorize } from "../middlewares.js";
import { createTimeslotRule } from "../controllers/timeslot-rules-controller.js";

const timeslotRulesRouter = express.Router();

timeslotRulesRouter.use(authorize);

timeslotRulesRouter.route("/").post(allowRoles("host"), createTimeslotRule);

export default timeslotRulesRouter;
