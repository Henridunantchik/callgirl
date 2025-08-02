import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv'
dotenv.config()

// Configuration with fallback values for development
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_APP_NAME || "test-cloud",
    api_key: process.env.CLOUDINARY_API_KEY || "test-key",
    api_secret: process.env.CLOUDINARY_API_SECRET || "test-secret"
});

console.log("Cloudinary config:", {
    cloud_name: process.env.CLOUDINARY_APP_NAME || "test-cloud",
    api_key: process.env.CLOUDINARY_API_KEY ? "***" : "test-key",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "***" : "test-secret"
});

export default cloudinary