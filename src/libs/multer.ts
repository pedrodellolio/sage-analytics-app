import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const isCsv = path.extname(file.originalname) === ".csv";
    cb(null, isCsv);
  },
});
