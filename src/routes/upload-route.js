import express from "express";
import {
  uploadImage,
  uploadMultipleImages,
  updateImage,
  getTimeslotImages,
  deleteTimeslotImageByUrl,
  deleteExperienceImageByUrl,
  uploadMultipleExperienceImages,
} from "../controllers/upload-controller.js";
import { upload } from "../utils/multer.js";
import { authorize } from "../middlewares.js";

const uploadRouter = express.Router();

uploadRouter.get("/upload/timeslots/:timeslot_id", getTimeslotImages);

uploadRouter.use(authorize);

// frontissa luodaan hosti: uploadImage -> paluuarvosta url hostin tietoihin
uploadRouter
  .route("/upload/users")
  .post(upload.single("image"), uploadImage)
  .put(upload.single("image"), updateImage);

uploadRouter.route("/upload/timeslots/:timeslot_id").post(
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "image", maxCount: 10 },
  ]),
  uploadMultipleImages,
);
// .delete(deleteImageByTimeslotId);

uploadRouter.delete(
  "/upload/timeslots/:timeslot_id/",
  deleteTimeslotImageByUrl,
);

uploadRouter
  .route("/upload/experiences/:experience_id/")
  .post(
    upload.fields([
      { name: "images", maxCount: 10 },
      { name: "iamge", maxCount: 10 },
    ]),
    uploadMultipleExperienceImages,
  )
  .delete(deleteExperienceImageByUrl);

export default uploadRouter;
