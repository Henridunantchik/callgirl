import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env") });

// Environment validation schema with default values
const requiredEnvVars = {
  // Server Configuration
  PORT: {
    required: false,
    type: "number",
    default: 5000,
    description: "Server port number",
  },
  NODE_ENV: {
    required: false,
    type: "string",
    default: "development",
    allowedValues: ["development", "production", "test"],
    description: "Application environment",
  },

  // Database Configuration
  MONGODB_CONN: {
    required: false,
    type: "string",
    default: "mongodb://localhost:27017/callgirls_db",
    description: "MongoDB connection string",
  },

  // JWT Configuration
  JWT_SECRET: {
    required: false,
    type: "string",
    default:
      "your-super-secret-jwt-key-that-is-at-least-64-characters-long-for-security",
    minLength: 32,
    description: "JWT secret key for token signing",
  },

  // Frontend Configuration
  FRONTEND_URL: {
    required: false,
    type: "string",
    default: "http://localhost:5173",
    description: "Frontend application URL",
  },

  // Additional Frontend URLs for CORS
  FRONTEND_URLS: {
    required: false,
    type: "string",
    default:
      "https://epicescorts.live,https://www.epicescorts.live,https://callgirls.vercel.app,http://localhost:5173",
    description: "Comma-separated list of allowed frontend URLs for CORS",
  },

  // File Storage Configuration
  RAILWAY_STORAGE_PATH: {
    required: false,
    type: "string",
    default: "/app/uploads",
    description: "Railway storage path for production",
  },

  // Stripe Configuration (for future use)
  STRIPE_SECRET_KEY: {
    required: false,
    type: "string",
    default: "sk_test_your_stripe_secret_key",
    description: "Stripe secret key",
  },
  STRIPE_WEBHOOK_SECRET: {
    required: false,
    type: "string",
    default: "whsec_your_stripe_webhook_secret",
    description: "Stripe webhook secret",
  },

  // Twilio Configuration (for future use)
  TWILIO_ACCOUNT_SID: {
    required: false,
    type: "string",
    default: "your_twilio_account_sid",
    description: "Twilio account SID",
  },
  TWILIO_AUTH_TOKEN: {
    required: false,
    type: "string",
    default: "your_twilio_auth_token",
    description: "Twilio auth token",
  },
  TWILIO_PHONE_NUMBER: {
    required: false,
    type: "string",
    default: "+1234567890",
    description: "Twilio phone number",
  },
  RAILWAY_EXTERNAL_URL: {
    required: false,
    type: "string",
    default: "https://api.epicescorts.live",
    description: "Railway external URL for file serving",
  },

  // Backend Base URL Configuration
  BASE_URL: {
    required: false,
    type: "string",
    default:
      process.env.NODE_ENV === "production"
        ? "https://api.epicescorts.live"
        : "http://localhost:5000",
    description: "Backend base URL for production",
  },
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
      errors.push(
        `Missing required environment variable: ${key} - ${schema.description}`
      );
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
        errors.push(
          `${key} must be at least ${schema.minLength} characters long`
        );
        continue;
      }

      // Allowed values validation
      if (schema.allowedValues && !schema.allowedValues.includes(value)) {
        errors.push(
          `${key} must be one of: ${schema.allowedValues.join(", ")}`
        );
        continue;
      }

      config[key] = value;
    }
  }

  // Security warnings
  if (config.NODE_ENV === "production") {
    if (config.JWT_SECRET && config.JWT_SECRET.length < 64) {
      warnings.push(
        "JWT_SECRET should be at least 64 characters long in production"
      );
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
  warnings.forEach((warning) => console.warn(`   ${warning}`));
}

// Throw error if validation fails
if (errors.length > 0) {
  console.error("❌ Environment Validation Failed:");
  errors.forEach((error) => console.error(`   ${error}`));
  console.error(
    "\nPlease check your .env file and ensure all required variables are set."
  );
  process.exit(1);
}

// Log successful validation
console.log("✅ Environment validation passed");
console.log(`   Environment: ${config.NODE_ENV}`);
console.log(`   Port: ${config.PORT}`);
console.log(`   Frontend URL: ${config.FRONTEND_URL}`);

export default config;
