import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists for dev static serving, even though we use memory storage
const uploadsDir = join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Use memory storage so downstream services receive file.buffer
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  console.log(
    "Processing file:",
    file.originalname,
    "MIME type:",
    file.mimetype
  );

  // Accept all files for now to debug the issue
  console.log("File accepted:", file.originalname);
  cb(null, true);
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
});

export default upload;
