import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "escort", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAgeVerified: {
      type: Boolean,
      default: false,
    },
    subscriptionTier: {
      type: String,
      enum: ["basic", "featured", "premium"],
      default: "basic",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "cancelled", "expired"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User; 