import path from "path";
import {
  deleteImageByTimeslotIdAndURL,
  deleteTimeslotImages,
  getTimeslotImageURLs,
  updateUserImage,
  uploadTimeSlotImages,
} from "../models/upload-model.js";
import { deleteImages } from "../utils/multer.js";
import { getUserImageById } from "../models/users-model.js";
import { getOwnedTimeslots } from "../models/timeslot-model.js";

const collectFiles = (req) => {
  const files = [];
  if (Array.isArray(req.files)) files.push(...req.files);
  if (req.files?.images) files.push(...req.files.images);
  if (req.files?.image) files.push(...req.files.image);
  if (req.file) files.push(req.file);
  return files;
};

export const uploadMultipleImages = async (req, res, next) => {
  const SUBDIR = "timeslots";

  try {
    const files = collectFiles(req);
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
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const filename = path.basename(req.file.path);
    const url = `/uploads/users/${filename}`;
    const t = await updateUserImage(url, req.user.id);

    console.log("uploaded image to url:", url);

    console.log("timeslot image:", t);
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
    await deleteImages(image_url);
    await updateUserImage(url, req.user.id);
    res.status(201).json({
      filename,
      url,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteImageByTimeslotId = async (req, res, next) => {
  try {
    const { timeslot_id } = req.params;
    const r = await getOwnedTimeslots(req.user.id);
    const ownedTimeslots = r.map((t) => t.id);

    if (!ownedTimeslots.includes(timeslot_id) && req.user.role !== "admin") {
      res.status(403).json({
        message:
          "You do not have the required permission to delete this timeslot.",
      });
      return;
    }

    const urls = await getTimeslotImageURLs(timeslot_id);
    await deleteImages(urls.map((u) => u.url));
    const deleteCount = await deleteTimeslotImages(timeslot_id);
    const s = deleteCount === 1 ? "image" : "images";
    res.status(200).json({ message: `${deleteCount} ${s} deleted.` });
  } catch (err) {
    next(err);
  }
};

export const deleteTimeslotImageByUrl = async (req, res, next) => {
  try {
    const { timeslot_id } = req.params;
    const { image_url } = req.body;

    const r = await getOwnedTimeslots(req.user.id);
    const ownedTimeslots = r.map((t) => t.id);

    const isOwner = ownedTimeslots.some(
      (ownedId) => String(ownedId) === String(timeslot_id),
    );

    if (!isOwner && req.user.role !== "admin") {
      res.status(403).json({
        message:
          "You do not have the required permission to delete this timeslot.",
      });
      return;
    }

    console.log("url;", image_url);
    console.log("timeslot_id:", timeslot_id);

    const deletedCount = await deleteImageByTimeslotIdAndURL(
      timeslot_id,
      image_url,
    );

    if (deletedCount === 0) {
      res.status(404).json({ message: "Image not found." });
      return;
    }

    await deleteImages(image_url);
    res.status(200).json({ message: "Image(s) deleted." });
  } catch (err) {
    next(err);
  }
};

export const getTimeslotImages = async (req, res, next) => {
  try {
    const urls = await getTimeslotImageURLs(req.params.timeslot_id);
    res.status(200).json(urls);
  } catch (err) {
    next(err);
  }
};
