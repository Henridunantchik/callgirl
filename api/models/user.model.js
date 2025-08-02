import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic Authentication
    role: {
      type: String,
      default: "client",
      enum: ["escort", "client", "admin", "agency"],
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    alias: {
      type: String,
      trim: true,
      required: function () {
        return this.role === "escort";
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },

    // Physical Attributes (for escorts)
    age: {
      type: Number,
      min: 18,
      max: 99,
      required: function () {
        return this.role === "escort";
      },
    },
    height: {
      type: Number, // in cm
      min: 100,
      max: 250,
    },
    weight: {
      type: Number, // in kg
      min: 30,
      max: 200,
    },
    bodyType: {
      type: String,
      enum: ["Slim", "Athletic", "Average", "Curvy", "Plus Size", "BBW"],
    },
    measurements: {
      bust: Number,
      waist: Number,
      hips: Number,
      cupSize: String,
    },

    // Personal Details
    languages: [
      {
        type: String,
        trim: true,
      },
    ],
    ethnicity: {
      type: String,
      trim: true,
    },
    nationality: {
      type: String,
      trim: true,
    },
    religion: {
      type: String,
      trim: true,
    },
    hairColor: {
      type: String,
      trim: true,
    },
    eyeColor: {
      type: String,
      trim: true,
    },
    tattoos: {
      type: Boolean,
      default: false,
    },
    piercings: {
      type: Boolean,
      default: false,
    },
    smoking: {
      type: Boolean,
      default: false,
    },
    drinking: {
      type: Boolean,
      default: false,
    },

    // Location
    location: {
      country: {
        type: String,
        required: function () {
          return this.role === "escort";
        },
        enum: ["ug", "ke", "tz", "rw", "bi", "cd"],
        trim: true,
      },
      city: {
        type: String,
        required: function () {
          return this.role === "escort";
        },
        trim: true,
      },
      area: {
        type: String,
        trim: true,
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },

    // Status & Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Subscription & Monetization
    subscriptionPlan: {
      type: String,
      enum: ["free", "standard", "premium", "vip"],
      default: "free",
    },
    subscriptionExpiry: {
      type: Date,
    },

    // Profile Content
    avatar: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    preferredClients: [
      {
        type: String,
        enum: ["men", "women", "couples", "locals", "tourists"],
      },
    ],
    services: [
      {
        type: String,
        trim: true,
      },
    ],

    // Rates
    rates: {
      hourly: {
        type: Number,
        min: 0,
      },
      halfDay: {
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
      travel: {
        type: Number,
        min: 0,
      },
    },

    // Availability
    availability: {
      schedule: {
        monday: { start: String, end: String, available: Boolean },
        tuesday: { start: String, end: String, available: Boolean },
        wednesday: { start: String, end: String, available: Boolean },
        thursday: { start: String, end: String, available: Boolean },
        friday: { start: String, end: String, available: Boolean },
        saturday: { start: String, end: String, available: Boolean },
        sunday: { start: String, end: String, available: Boolean },
      },
      nextAvailable: {
        type: Date,
      },
      isAvailableNow: {
        type: Boolean,
        default: false,
      },
    },

    // Gallery & Media
    gallery: [
      {
        url: {
          type: String,
          required: true,
        },
        isPrivate: {
          type: Boolean,
          default: false,
        },
        isWatermarked: {
          type: Boolean,
          default: true,
        },
        order: {
          type: Number,
          default: 0,
        },
        isApproved: {
          type: Boolean,
          default: false,
        },
      },
    ],

    videos: [
      {
        url: {
          type: String,
          required: true,
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
        isApproved: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Verification
    verification: {
      idVerified: {
        type: Boolean,
        default: false,
      },
      idDocument: {
        type: String,
      },
      selfieVerified: {
        type: Boolean,
        default: false,
      },
      videoVerified: {
        type: Boolean,
        default: false,
      },
      ageVerified: {
        type: Boolean,
        default: false,
      },
    },

    // Contact Options
    contactOptions: {
      whatsapp: {
        type: String,
        trim: true,
      },
      telegram: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },

    // Privacy Settings
    settings: {
      allowMessages: {
        type: Boolean,
        default: true,
      },
      requireVerification: {
        type: Boolean,
        default: false,
      },
      showOnlineStatus: {
        type: Boolean,
        default: true,
      },
      allowReviews: {
        type: Boolean,
        default: true,
      },
      showPrivateGallery: {
        type: Boolean,
        default: false,
      },
    },

    // Agency Information (if applicable)
    agency: {
      agencyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agency",
      },
      isAgencyVerified: {
        type: Boolean,
        default: false,
      },
    },

    // Statistics
    stats: {
      profileViews: {
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
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
    },

    // Security & Safety
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },

    // Tour Schedule (for traveling escorts)
    tourSchedule: [
      {
        city: String,
        startDate: Date,
        endDate: Date,
        isActive: Boolean,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return this.role === "escort" ? this.alias : this.name;
});

// Virtual for age verification
userSchema.virtual("isAgeVerified").get(function () {
  return this.age >= 18;
});

// Index for search optimization
userSchema.index({
  role: 1,
  isActive: 1,
  isVerified: 1,
  "location.city": 1,
  age: 1,
  services: 1,
});

// Index for location-based search
userSchema.index({
  "location.coordinates": "2dsphere",
});

const User = mongoose.model("User", userSchema, "users");
export default User;
