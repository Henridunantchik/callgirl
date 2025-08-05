import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["profile", "review", "message", "image", "booking"],
      required: true,
    },
    contentType: {
      type: String,
      enum: [
        "fake_profile",
        "underage",
        "inappropriate_content",
        "harassment",
        "spam",
        "fraud",
        "violence",
        "other",
      ],
      required: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "contentModel",
    },
    contentModel: {
      type: String,
      enum: ["User", "Review", "Message", "Booking"],
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    evidence: [
      {
        type: String, // URLs to screenshots or other evidence
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "investigating", "resolved", "dismissed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin user
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    action: {
      type: String,
      enum: ["warning", "suspension", "ban", "content_removal", "no_action"],
      default: "no_action",
    },
    actionDetails: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
reportSchema.index({ status: 1, priority: 1, createdAt: -1 });
reportSchema.index({ reportedUser: 1, status: 1 });
reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ assignedTo: 1, status: 1 });

const Report = mongoose.model("Report", reportSchema, "reports");
export default Report;
