import express from "express";
import {
  uploadImage,
  uploadMultipleImages,
  updateImage,
} from "../controllers/upload-controller.js";
import { upload } from "../utils/multer.js";
import { authorize } from "../middlewares.js";

const uploadRouter = express.Router();
uploadRouter.use(authorize);

// frontissa kun luodaan käyttäjä: uploadImage -> paluuarvosta url käyttäjän tietoihin -> addUser
uploadRouter
  .route("/upload/users")
  .post(upload.single("image"), uploadImage)
  .put(upload.single("image"), updateImage);

uploadRouter.post(
  "/upload/timeslots/:timeslot_id",
  upload.array("images", 10),
  uploadMultipleImages,
);

export default uploadRouter;
