import express from "express";
import {
  createExperience,
  deleteExperienceById,
  fetchAllExperiences,
  fetchAllExperiencesWithHost,
  getExperiencesByHost,
  updateExperience,
} from "../controllers/experiences-controller.js";
import { allowRoles, authorize } from "../middlewares.js";
import { upload } from "../utils/multer.js";

const experiencesRouter = express.Router();

experiencesRouter.route("/").get(fetchAllExperiences);
experiencesRouter.route("/withHost").get(fetchAllExperiencesWithHost);

experiencesRouter.use(authorize);

experiencesRouter
  .route("/host")
  .get(allowRoles("host"), getExperiencesByHost)
  .post(
    allowRoles("host"),
    upload.fields([{ name: "images", maxCount: 10 }]),
    createExperience,
  );

experiencesRouter
  .route("/host/:id")
  .delete(allowRoles("admin", "host"), deleteExperienceById);

experiencesRouter
  .route("/:id")
  .put(
    allowRoles("admin", "host"),
    upload.fields([{ name: "images", maxCount: 10 }]),
    updateExperience,
  );

export default experiencesRouter;
