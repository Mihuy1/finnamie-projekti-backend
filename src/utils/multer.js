import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const isUser = req.path.includes("/users");
    const subdir = isUser ? "users" : "timeslots";
    const dest = path.resolve(`uploads/${subdir}`);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename(req, file, cb) {
    const isUser = req.path.includes("/users");
    const subdir = isUser ? "users" : "timeslots";

    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");

    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const suffix = `-${unique}${ext}`;

    //`/uploads/${subdir}/${filename}` < 255 chars
    const maxUrlLen = 255;
    const prefixLen = "/uploads/".length + subdir.length + 1; // +1 for '/'
    const baseMaxLen = Math.max(1, maxUrlLen - prefixLen - suffix.length);

    const safeBase = base.slice(0, baseMaxLen);
    cb(null, `${safeBase}${suffix}`);
  },
});

function fileFilter(_req, file, cb) {
  cb(null, !!(file.mimetype && file.mimetype.startsWith("image/")));
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export async function deleteImage(fileUrl) {
  if (!fileUrl) return;

  if (!fileUrl.startsWith("/uploads/")) {
    throw new Error("Invalid file path");
  }

  const absolutePath = path.resolve("." + fileUrl);

  try {
    fs.unlink(absolutePath, (err) => {
      if (err) throw err;
    });
    console.log("Image deleted:", absolutePath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
}
