import path from "path";
import {
  updateUserImage,
  uploadTimeSlotImages,
} from "../models/upload-model.js";
import { deleteImage } from "../utils/multer.js";
import { getUserImageById } from "../models/users-model.js";

export const uploadMultipleImages = async (req, res, next) => {
  const SUBDIR = "timeslots";

  try {
    let files = [];
    if (Array.isArray(req.files)) {
      files = req.files;
    } else if (req.file) {
      files = req.file;
    }

    if (!files.length)
      return res.status(400).json({ error: "No file uploaded" });

    const result = files.map((f) => {
      const filename = path.basename(f.path);
      return {
        filename,
        url: `/uploads/${SUBDIR}/${filename}`,
      };
    });

    const urls = result.map((r) => [r.url, req.params.timeslot_id]);
    await uploadTimeSlotImages(urls);

    res.status(201).json({
      count: result.length,
      files: result,
    });
  } catch (err) {
    next(err);
  }
};

export const uploadImage = (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const filename = path.basename(req.file.path);
    const url = `/uploads/users/${filename}`;
    res.status(201).json({
      filename,
      url,
    });
  } catch (err) {
    next(err);
  }
};

export const updateImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const filename = path.basename(req.file.path);
    const url = `/uploads/users/${filename}`;
    const { image_url } = await getUserImageById(req.user.id);
    console.log(url);
    await deleteImage(image_url);
    await updateUserImage(url, req.user.id);
    res.status(201).json({
      filename,
      url,
    });
  } catch (err) {
    next(err);
  }
};
