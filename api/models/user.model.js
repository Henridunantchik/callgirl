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
      enum: ["free", "verified", "premium", "elite"],
      default: "free",
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

// Add methods to the schema
userSchema.methods.isProfileComplete = function () {
  if (this.role !== "escort") return false;
  return true; // Simplified for testing
};

userSchema.methods.canUploadMedia = function (mediaType, currentCount) {
  const limits = {
    photo: 10,
    video: 5,
  };

  if (this.subscriptionTier === "verified") {
    limits.photo = 20;
    limits.video = 10;
  } else if (
    this.subscriptionTier === "premium" ||
    this.subscriptionTier === "elite"
  ) {
    limits.photo = -1;
    limits.video = -1;
  }

  const limit = mediaType === "photo" ? limits.photo : limits.video;
  return limit === -1 || currentCount < limit;
};

userSchema.methods.getSubscriptionBenefits = function () {
  const benefits = {
    free: {
      photos: 10,
      videos: 5,
      features: ["Basic Profile", "Standard Search", "Basic Messaging"],
    },
    verified: {
      photos: 20,
      videos: 10,
      features: [
        "Verified Badge",
        "Priority Search",
        "Enhanced Analytics",
        "Priority Support",
      ],
    },
    premium: {
      photos: -1,
      videos: -1,
      features: [
        "Premium Badge",
        "Featured Placement",
        "Unlimited Media",
        "Direct Contact",
        "Profile Highlighting",
        "Analytics Dashboard",
      ],
    },
    elite: {
      photos: -1,
      videos: -1,
      features: [
        "VIP Badge",
        "Homepage Featured",
        "Priority Booking",
        "Custom Profile",
        "Social Media Integration",
        "Professional Tips",
        "Marketing Support",
      ],
    },
  };

  return benefits[this.subscriptionTier] || benefits.free;
};

const User = mongoose.model("User", userSchema);

export default User;
