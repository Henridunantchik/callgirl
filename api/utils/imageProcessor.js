import sharp from 'sharp';
import fs from 'fs';
import { ApiError } from './ApiError.js';

// Image processing and compression
const processImage = async (filePath, options = {}) => {
  const {
    quality = 80,
    width = 1920,
    height = 1080,
    format = 'jpeg',
    generateThumbnail = true,
  } = options;

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Resize if larger than specified dimensions
    if (metadata.width > width || metadata.height > height) {
      image.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert to specified format and compress
    const processedBuffer = await image
      .toFormat(format, { quality })
      .toBuffer();

    // Generate thumbnail if requested
    let thumbnailBuffer = null;
    if (generateThumbnail) {
      thumbnailBuffer = await sharp(filePath)
        .resize(300, 300, { fit: 'cover' })
        .toFormat('jpeg', { quality: 70 })
        .toBuffer();
    }

    return {
      processed: processedBuffer,
      thumbnail: thumbnailBuffer,
      metadata: {
        originalSize: metadata.size,
        processedSize: processedBuffer.length,
        compressionRatio: ((metadata.size - processedBuffer.length) / metadata.size * 100).toFixed(2),
        dimensions: {
          width: metadata.width,
          height: metadata.height,
        },
      },
    };
  } catch (error) {
    throw new ApiError(500, `Image processing failed: ${error.message}`);
  }
};

// Optimize image for web
const optimizeForWeb = async (filePath) => {
  return processImage(filePath, {
    quality: 85,
    width: 1200,
    height: 800,
    format: 'webp',
    generateThumbnail: true,
  });
};

// Create profile picture
const createProfilePicture = async (filePath) => {
  return processImage(filePath, {
    quality: 90,
    width: 400,
    height: 400,
    format: 'jpeg',
    generateThumbnail: false,
  });
};

// Create gallery image
const createGalleryImage = async (filePath) => {
  return processImage(filePath, {
    quality: 80,
    width: 800,
    height: 600,
    format: 'jpeg',
    generateThumbnail: true,
  });
};

// Batch process images
const batchProcessImages = async (filePaths, options = {}) => {
  const results = [];
  
  for (const filePath of filePaths) {
    try {
      const result = await processImage(filePath, options);
      results.push({
        filePath,
        success: true,
        result,
      });
    } catch (error) {
      results.push({
        filePath,
        success: false,
        error: error.message,
      });
    }
  }
  
  return results;
};

// Get image metadata
const getImageMetadata = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      hasAlpha: metadata.hasAlpha,
      hasProfile: metadata.hasProfile,
      isOpaque: metadata.isOpaque,
    };
  } catch (error) {
    throw new ApiError(500, `Failed to get image metadata: ${error.message}`);
  }
};

// Validate image dimensions
const validateImageDimensions = (width, height, maxWidth = 4000, maxHeight = 4000) => {
  if (width > maxWidth || height > maxHeight) {
    throw new ApiError(400, `Image dimensions too large. Maximum: ${maxWidth}x${maxHeight}`);
  }
  
  if (width < 100 || height < 100) {
    throw new ApiError(400, `Image dimensions too small. Minimum: 100x100`);
  }
  
  return true;
};

export {
  processImage,
  optimizeForWeb,
  createProfilePicture,
  createGalleryImage,
  batchProcessImages,
  getImageMetadata,
  validateImageDimensions,
}; 