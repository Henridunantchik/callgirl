import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    alias: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    telegram: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "client", "escort", "admin"],
      default: "client",
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
      default: true, // Default to true for escorts
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
    subscriptionDetails: {
      period: {
        type: String,
        enum: ["monthly", "annual"],
        default: "monthly",
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
      autoRenew: {
        type: Boolean,
        default: false,
      },
      lastPaymentDate: {
        type: Date,
      },
      nextPaymentDate: {
        type: Date,
      },
    },
    // Escort-specific fields
    age: {
      type: Number,
      min: 18,
      max: 100,
    },
    gender: {
      type: String,
      enum: ["female", "male", "transgender", "non-binary", "other"],
    },
    // Personal Details
    bodyType: {
      type: String,
      trim: true,
    },
    ethnicity: {
      type: String,
      trim: true,
    },
    height: {
      type: Number,
      min: 100,
      max: 250,
    },
    weight: {
      type: Number,
      min: 30,
      max: 200,
    },
    hairColor: {
      type: String,
      trim: true,
    },
    eyeColor: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      maxlength: 1000,
    },
    languages: [
      {
        type: String,
        trim: true,
      },
    ],
    location: {
      country: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      subLocation: {
        type: String,
        trim: true,
      },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
        },
        coordinates: {
          type: [Number],
          required: false,
        },
      },
    },
    bio: {
      type: String,
      maxlength: 2000,
    },
    services: [
      {
        type: String,
        trim: true,
      },
    ],
    rates: {
      hourly: {
        type: Number,
        min: 0,
      },
      overnight: {
        type: Number,
        min: 0,
      },
      weekend: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
        enum: ["USD", "EUR", "GBP", "CAD", "AUD"],
      },
      isStandardPricing: {
        type: Boolean,
        default: true,
      },
    },
    availability: {
      type: [String],
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      default: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
    },
    workingHours: {
      start: {
        type: String,
        default: "09:00",
      },
      end: {
        type: String,
        default: "23:00",
      },
    },
    gallery: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        caption: {
          type: String,
          trim: true,
        },
        isPrivate: {
          type: Boolean,
          default: false,
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    videos: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        caption: {
          type: String,
          trim: true,
        },
        type: {
          type: String,
          enum: ["intro", "gallery"],
          default: "gallery",
        },
        isPrivate: {
          type: Boolean,
          default: false,
        },
      },
    ],
    idDocument: {
      type: String,
    },
    verification: {
      isVerified: {
        type: Boolean,
        default: true, // Default to true for escorts
      },
      documents: [
        {
          type: {
            type: String,
            enum: ["id", "passport", "drivers_license"],
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
          publicId: {
            type: String,
            required: true,
          },
          verified: {
            type: Boolean,
            default: false,
          },
          verifiedAt: {
            type: Date,
          },
        },
      ],
    },
    stats: {
      views: {
        type: Number,
        default: 0,
      },
      favorites: {
        type: Number,
        default: 0,
      },
      reviews: {
        type: Number,
        default: 0,
      },
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries (only if coordinates exist)
userSchema.index({ "location.coordinates": "2dsphere" }, { sparse: true });

// Create text index for search functionality
userSchema.index({
  name: "text",
  alias: "text",
  bio: "text",
  "location.city": "text",
  "location.country": "text",
  services: "text",
});

// Create compound indexes for common queries
userSchema.index({ isActive: 1, isAvailable: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ "location.city": 1, "location.country": 1 });
userSchema.index({ gender: 1, isActive: 1 });
userSchema.index({ age: 1, isActive: 1 });

// Add methods to the schema
userSchema.methods.isProfileComplete = function () {
  if (this.role !== "escort") return false;

  const requiredFields = [
    "name",
    "alias",
    "email",
    "phone",
    "age",
    "gender",
    "location.city",
    "location.country",
    "services",
    "rates.hourly",
    "gallery",
  ];

  const completedFields = requiredFields.filter((field) => {
    const value = this.get(field);
    return value && (Array.isArray(value) ? value.length > 0 : value);
  });

  return completedFields.length === requiredFields.length;
};

userSchema.methods.getProfileCompletionPercentage = function () {
  if (this.role !== "escort") return 0;

  const requiredFields = [
    "name",
    "alias",
    "email",
    "phone",
    "age",
    "gender",
    "location.city",
    "location.country",
    "services",
    "rates.hourly",
    "gallery",
  ];

  const completedFields = requiredFields.filter((field) => {
    const value = this.get(field);
    return value && (Array.isArray(value) ? value.length > 0 : value);
  });

  return Math.round((completedFields.length / requiredFields.length) * 100);
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
    basic: {
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

  return benefits[this.subscriptionTier] || benefits.basic;
};

// Pre-save middleware to update lastSeen, lastActive and profile completion
userSchema.pre("save", function (next) {
  if (this.role === "escort") {
    this.lastSeen = new Date();
    this.lastActive = new Date();
    this.profileCompletion = this.getProfileCompletionPercentage();

    // Set default values for escorts
    if (this.isNew || this.isModified("role")) {
      this.isAgeVerified = true;
      this.isAvailable = true;

      // Set verification defaults for escorts
      if (!this.verification) {
        this.verification = {};
      }
      this.verification.isVerified = true;
    }
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
