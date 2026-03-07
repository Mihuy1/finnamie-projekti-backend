import express from "express";
import {
  uploadImage,
  uploadMultipleImages,
  updateImage,
  getTimeslotImages,
  deleteTimeslotImageByUrl,
} from "../controllers/upload-controller.js";
import { upload } from "../utils/multer.js";
import { authorize } from "../middlewares.js";
import { deleteImageByTimeslotIdAndURL } from "../models/upload-model.js";

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

export default uploadRouter;
