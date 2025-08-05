import { v2 as cloudinary } from 'cloudinary';
import config from './env.js';

// Configure Cloudinary with validated environment variables
cloudinary.config({
    cloud_name: config.CLOUDINARY_APP_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET
});

console.log("✅ Cloudinary configured successfully");
console.log(`   Cloud Name: ${config.CLOUDINARY_APP_NAME}`);
console.log(`   API Key: ${config.CLOUDINARY_API_KEY ? "***" : "undefined"}`);

export default cloudinary;