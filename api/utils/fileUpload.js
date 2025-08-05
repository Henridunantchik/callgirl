import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { ApiError } from './ApiError.js';

// File type validation
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  document: 5 * 1024 * 1024, // 5MB
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${file.fieldname}-${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  const fileType = file.mimetype;
  
  if (ALLOWED_IMAGE_TYPES.includes(fileType)) {
    file.fileCategory = 'image';
    cb(null, true);
  } else if (ALLOWED_VIDEO_TYPES.includes(fileType)) {
    file.fileCategory = 'video';
    cb(null, true);
  } else if (ALLOWED_DOCUMENT_TYPES.includes(fileType)) {
    file.fileCategory = 'document';
    cb(null, true);
  } else {
    cb(new ApiError(400, `Unsupported file type: ${fileType}`), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Math.max(...Object.values(FILE_SIZE_LIMITS)),
    files: 10,
  },
});

// Validate file size
const validateFileSize = (file, category) => {
  const maxSize = FILE_SIZE_LIMITS[category] || FILE_SIZE_LIMITS.image;
  if (file.size > maxSize) {
    throw new ApiError(400, `File size exceeds limit. Maximum allowed: ${maxSize / (1024 * 1024)}MB`);
  }
};

// Get file info
const getFileInfo = (file) => {
  return {
    originalName: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    category: file.fileCategory,
    path: file.path,
  };
};

export {
  upload,
  validateFileSize,
  getFileInfo,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  FILE_SIZE_LIMITS,
}; 