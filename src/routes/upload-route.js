import express from "express";
import {
  uploadImage,
  uploadMultipleImages,
  updateImage,
  deleteImageByTimeslotId,
  getTimeslotImages,
} from "../controllers/upload-controller.js";
import { upload } from "../utils/multer.js";
import { authorize } from "../middlewares.js";

const uploadRouter = express.Router();
uploadRouter.use(authorize);

// frontissa luodaan hosti: uploadImage -> paluuarvosta url hostin tietoihin
uploadRouter
  .route("/upload/users")
  .post(upload.single("image"), uploadImage)
  .put(upload.single("image"), updateImage);

uploadRouter
  .route("/upload/timeslots/:timeslot_id")
  .get(getTimeslotImages)
  .post(upload.array("images", 10), uploadMultipleImages)
  .delete(deleteImageByTimeslotId);

export default uploadRouter;
