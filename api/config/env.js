import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env") });

// Environment validation schema
const requiredEnvVars = {
  // Server Configuration
  PORT: {
    required: true,
    type: "number",
    default: 5000,
    description: "Server port number"
  },
  NODE_ENV: {
    required: true,
    type: "string",
    default: "development",
    allowedValues: ["development", "production", "test"],
    description: "Application environment"
  },
  
  // Database Configuration
  MONGODB_CONN: {
    required: true,
    type: "string",
    description: "MongoDB connection string"
  },
  
  // JWT Configuration
  JWT_SECRET: {
    required: true,
    type: "string",
    minLength: 32,
    description: "JWT secret key for token signing"
  },
  
  // Frontend Configuration
  FRONTEND_URL: {
    required: true,
    type: "string",
    description: "Frontend application URL"
  },
  
  // Cloudinary Configuration
  CLOUDINARY_APP_NAME: {
    required: true,
    type: "string",
    description: "Cloudinary cloud name"
  },
  CLOUDINARY_API_KEY: {
    required: true,
    type: "string",
    description: "Cloudinary API key"
  },
  CLOUDINARY_API_SECRET: {
    required: true,
    type: "string",
    description: "Cloudinary API secret"
  },
  
  // Optional Configuration
  CLOUDINARY_URL: {
    required: false,
    type: "string",
    description: "Cloudinary URL (optional)"
  },
  
  // Stripe Configuration (for future use)
  STRIPE_SECRET_KEY: {
    required: false,
    type: "string",
    description: "Stripe secret key"
  },
  STRIPE_WEBHOOK_SECRET: {
    required: false,
    type: "string",
    description: "Stripe webhook secret"
  },
  
  // Twilio Configuration (for future use)
  TWILIO_ACCOUNT_SID: {
    required: false,
    type: "string",
    description: "Twilio account SID"
  },
  TWILIO_AUTH_TOKEN: {
    required: false,
    type: "string",
    description: "Twilio auth token"
  },
  TWILIO_PHONE_NUMBER: {
    required: false,
    type: "string",
    description: "Twilio phone number"
  }
};

// Validation function
const validateEnvironment = () => {
  const errors = [];
  const warnings = [];
  const config = {};

  for (const [key, schema] of Object.entries(requiredEnvVars)) {
    const value = process.env[key];
    
    // Check if required variable is missing
    if (schema.required && !value) {
      errors.push(`Missing required environment variable: ${key} - ${schema.description}`);
      continue;
    }
    
    // If not required and missing, use default or skip
    if (!value) {
      if (schema.default !== undefined) {
        config[key] = schema.default;
      }
      continue;
    }
    
    // Type validation
    if (schema.type === "number") {
      const numValue = parseInt(value);
      if (isNaN(numValue)) {
        errors.push(`Invalid number for ${key}: ${value}`);
        continue;
      }
      config[key] = numValue;
    } else if (schema.type === "string") {
      // Length validation
      if (schema.minLength && value.length < schema.minLength) {
        errors.push(`${key} must be at least ${schema.minLength} characters long`);
        continue;
      }
      
      // Allowed values validation
      if (schema.allowedValues && !schema.allowedValues.includes(value)) {
        errors.push(`${key} must be one of: ${schema.allowedValues.join(", ")}`);
        continue;
      }
      
      config[key] = value;
    }
  }

  // Security warnings
  if (config.NODE_ENV === "production") {
    if (config.JWT_SECRET && config.JWT_SECRET.length < 64) {
      warnings.push("JWT_SECRET should be at least 64 characters long in production");
    }
    
    if (config.MONGODB_CONN && config.MONGODB_CONN.includes("localhost")) {
      warnings.push("Using localhost MongoDB in production is not recommended");
    }
  }

  return { errors, warnings, config };
};

// Validate and export configuration
const { errors, warnings, config } = validateEnvironment();

// Log warnings
if (warnings.length > 0) {
  console.warn("⚠️  Environment Warnings:");
  warnings.forEach(warning => console.warn(`   ${warning}`));
}

// Throw error if validation fails
if (errors.length > 0) {
  console.error("❌ Environment Validation Failed:");
  errors.forEach(error => console.error(`   ${error}`));
  console.error("\nPlease check your .env file and ensure all required variables are set.");
  process.exit(1);
}

// Log successful validation
console.log("✅ Environment validation passed");
console.log(`   Environment: ${config.NODE_ENV}`);
console.log(`   Port: ${config.PORT}`);
console.log(`   Frontend URL: ${config.FRONTEND_URL}`);

export default config; 