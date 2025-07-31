import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    escort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    categories: [
      {
        type: String,
        enum: [
          "appearance",
          "service",
          "attitude",
          "punctuality",
          "cleanliness",
          "value",
        ],
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportReason: {
      type: String,
      enum: ["fake", "inappropriate", "spam", "harassment", "other"],
    },
    helpful: {
      type: Number,
      default: 0,
    },
    notHelpful: {
      type: Number,
      default: 0,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    visitDate: {
      type: Date,
    },
    serviceType: {
      type: String,
      enum: ["hourly", "halfDay", "overnight", "weekend", "travel"],
    },
    price: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
reviewSchema.index({ escort: 1, createdAt: -1 });
reviewSchema.index({ client: 1, createdAt: -1 });
reviewSchema.index({ isApproved: 1, isReported: 1 });

// Prevent multiple reviews from same client to same escort
reviewSchema.index({ escort: 1, client: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema, "reviews");
export default Review;
