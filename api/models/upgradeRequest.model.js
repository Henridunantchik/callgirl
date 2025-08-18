import mongoose from "mongoose";

const upgradeRequestSchema = new mongoose.Schema(
  {
    escort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    escortName: {
      type: String,
      required: true,
    },
    escortPhone: {
      type: String,
      required: true,
    },
    escortEmail: {
      type: String,
      required: true,
    },
    currentPlan: {
      type: String,
      enum: ["basic", "featured", "premium"],
      default: "basic",
    },
    requestedPlan: {
      type: String,
      enum: ["featured", "premium"],
      required: true,
    },
    contactMethod: {
      type: String,
      enum: ["whatsapp", "messenger"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "payment_required",
        "payment_confirmed",
        "approved",
        "rejected",
        "expired",
      ],
      default: "pending",
    },
    paymentProof: {
      type: String, // URL de l'image ou texte
    },
    paymentAmount: {
      type: Number,
      required: true,
    },
    subscriptionPeriod: {
      type: String,
      enum: ["monthly", "annual"],
      default: "monthly",
    },
    subscriptionStartDate: {
      type: Date,
    },
    subscriptionEndDate: {
      type: Date,
    },
    paymentInstructions: {
      type: String, // Admin sends payment instructions
    },
    paymentDeadline: {
      type: Date, // 48 hours from when payment is required
    },
    paymentMethod: {
      type: String, // Method provided by admin (bank transfer, mobile money, etc.)
    },
    adminNotes: {
      type: String,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin qui a traité la demande
    },
    processedAt: {
      type: Date,
    },
    countryCode: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances
upgradeRequestSchema.index({ escort: 1, status: 1 });
upgradeRequestSchema.index({ status: 1, createdAt: -1 });
upgradeRequestSchema.index({ countryCode: 1, status: 1 });

const UpgradeRequest = mongoose.model("UpgradeRequest", upgradeRequestSchema);

export default UpgradeRequest;
