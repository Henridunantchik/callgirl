import mongoose from "mongoose";

const escortSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
      max: 100,
    },
    gender: {
      type: String,
      enum: ["female", "male", "transgender", "other"],
      required: true,
    },
    location: {
      city: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
      },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
    },
    description: {
      type: String,
      required: true,
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
        required: true,
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
    contact: {
      phone: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
      },
      website: {
        type: String,
        trim: true,
      },
    },
    media: {
      photos: [
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
        },
      ],
    },
    verification: {
      isVerified: {
        type: Boolean,
        default: false,
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
    subscription: {
      type: {
        type: String,
        enum: ["basic", "premium", "vip"],
        default: "basic",
      },
      expiresAt: {
        type: Date,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
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
    isActive: {
      type: Boolean,
      default: true,
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
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
escortSchema.index({ "location.coordinates": "2dsphere" });

// Create text index for search functionality
escortSchema.index({
  name: "text",
  description: "text",
  "location.city": "text",
  "location.country": "text",
  services: "text",
});

// Create compound indexes for common queries
escortSchema.index({ isActive: 1, isAvailable: 1 });
escortSchema.index({ "subscription.isActive": 1, isActive: 1 });
// Text search index for searching across multiple fields
escortSchema.index({
  name: "text",
  description: "text",
  services: "text",
  "location.city": "text",
  alias: "text",
  bio: "text"
});

// Other indexes
escortSchema.index({ "location.city": 1, "location.country": 1 });
escortSchema.index({ gender: 1, isActive: 1 });
escortSchema.index({ age: 1, isActive: 1 });

// Virtual for full address
escortSchema.virtual("fullAddress").get(function () {
  return `${this.location.city}, ${this.location.country}`;
});

// Virtual for average rating
escortSchema.virtual("averageRating").get(function () {
  return this.stats.rating;
});

// Pre-save middleware to update lastSeen
escortSchema.pre("save", function (next) {
  this.lastSeen = new Date();
  next();
});

// Static method to find active escorts
escortSchema.statics.findActive = function () {
  return this.find({ isActive: true, isAvailable: true });
};

// Static method to find escorts by location
escortSchema.statics.findByLocation = function (city, country) {
  return this.find({
    "location.city": new RegExp(city, "i"),
    "location.country": new RegExp(country, "i"),
    isActive: true,
  });
};

// Static method to find escorts by gender
escortSchema.statics.findByGender = function (gender) {
  return this.find({ gender, isActive: true });
};

// Static method to find escorts by age range
escortSchema.statics.findByAgeRange = function (minAge, maxAge) {
  return this.find({
    age: { $gte: minAge, $lte: maxAge },
    isActive: true,
  });
};

// Instance method to update stats
escortSchema.methods.updateStats = function () {
  return this.model("Escort").aggregate([
    { $match: { _id: this._id } },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "escort",
        as: "reviews",
      },
    },
    {
      $addFields: {
        "stats.reviews": { $size: "$reviews" },
        "stats.rating": {
          $avg: "$reviews.rating",
        },
      },
    },
  ]);
};

// Instance method to add photo
escortSchema.methods.addPhoto = function (photoData) {
  this.media.photos.push(photoData);
  return this.save();
};

// Instance method to add video
escortSchema.methods.addVideo = function (videoData) {
  this.media.videos.push(videoData);
  return this.save();
};

// Instance method to remove media
escortSchema.methods.removeMedia = function (mediaId, type) {
  if (type === "photo") {
    this.media.photos = this.media.photos.filter(
      (photo) => photo._id.toString() !== mediaId
    );
  } else if (type === "video") {
    this.media.videos = this.media.videos.filter(
      (video) => video._id.toString() !== mediaId
    );
  }
  return this.save();
};

const Escort = mongoose.model("Escort", escortSchema);

export default Escort;
