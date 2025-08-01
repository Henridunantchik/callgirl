import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "subscription",
        "feature_boost",
        "private_gallery",
        "verification",
        "commission",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "UGX", "BTC", "USDT"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: [
        "stripe",
        "paypal",
        "crypto",
        "mobile_money",
        "bank_transfer",
        "manual",
      ],
      required: true,
    },
    paymentGateway: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    gatewayResponse: {
      type: Object,
    },
    subscriptionPlan: {
      type: String,
      enum: ["standard", "premium", "vip"],
    },
    subscriptionDuration: {
      type: Number, // in days
      default: 30,
    },
    features: [
      {
        type: String,
        enum: [
          "profile_boost",
          "private_gallery",
          "priority_support",
          "analytics",
          "custom_domain",
        ],
      },
    ],
    description: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Object,
    },
    refundReason: {
      type: String,
      trim: true,
    },
    refundedAt: {
      type: Date,
    },
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    nextBillingDate: {
      type: Date,
    },
    failureReason: {
      type: String,
      trim: true,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
paymentSchema.index({ user: 1, status: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ type: 1, status: 1 });

const Payment = mongoose.model("Payment", paymentSchema, "payments");
export default Payment;
