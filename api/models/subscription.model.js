import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    // User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Subscription tier
    tier: {
      type: String,
      enum: ["free", "verified", "premium", "elite"],
      default: "free",
      required: true,
    },

    // Subscription status
    status: {
      type: String,
      enum: ["active", "inactive", "cancelled", "expired", "pending"],
      default: "active",
    },

    // Payment information
    payment: {
      method: {
        type: String,
        enum: [
          // Mobile Money
          "mpesa_kenya",
          "mpesa_uganda",
          "mpesa_tanzania",
          "mpesa_rwanda",
          "mpesa_drc",
          "mpesa_burundi",
          "airtel_kenya",
          "airtel_uganda",
          "airtel_tanzania",
          "airtel_rwanda",
          "airtel_drc",
          "airtel_burundi",
          "mtn_uganda",
          "mtn_rwanda",
          "mtn_drc",
          "tigo_tanzania",
          "tigo_burundi",
          "orange_drc",
          "orange_burundi",
          "lumitel_burundi",
          "ecocash_burundi",
          // Bank Transfer
          "bank_transfer",
          // Cryptocurrency
          "bitcoin",
          "usdt",
          "ethereum",
          // International
          "paypal",
          "stripe",
          "payoneer",
          "western_union",
          "moneygram",
        ],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        enum: ["USD", "UGX", "KES", "TZS", "RWF", "CDF", "BIF"],
        default: "USD",
      },
      transactionId: {
        type: String,
        required: true,
      },
      paymentDate: {
        type: Date,
        default: Date.now,
      },
      nextBillingDate: {
        type: Date,
        required: true,
      },
    },

    // Feature limits based on tier
    limits: {
      photos: {
        type: Number,
        default: 10, // Free tier: 10 photos
      },
      videos: {
        type: Number,
        default: 5, // Free tier: 5 videos
      },
      featuredPlacement: {
        type: Boolean,
        default: false,
      },
      prioritySearch: {
        type: Boolean,
        default: false,
      },
      analytics: {
        type: Boolean,
        default: false,
      },
      directContact: {
        type: Boolean,
        default: false,
      },
      customProfile: {
        type: Boolean,
        default: false,
      },
      marketingSupport: {
        type: Boolean,
        default: false,
      },
    },

    // Subscription period
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },

    // Auto-renewal settings
    autoRenew: {
      type: Boolean,
      default: true,
    },

    // Cancellation information
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },

    // Country information
    country: {
      type: String,
      enum: [
        "kenya",
        "uganda",
        "tanzania",
        "rwanda",
        "drc",
        "burundi",
        "international",
      ],
      required: true,
    },

    // Additional features
    features: {
      verifiedBadge: {
        type: Boolean,
        default: false,
      },
      premiumBadge: {
        type: Boolean,
        default: false,
      },
      eliteBadge: {
        type: Boolean,
        default: false,
      },
      homepageFeatured: {
        type: Boolean,
        default: false,
      },
      priorityBooking: {
        type: Boolean,
        default: false,
      },
      socialMediaIntegration: {
        type: Boolean,
        default: false,
      },
      professionalTips: {
        type: Boolean,
        default: false,
      },
    },

    // Payment history
    paymentHistory: [
      {
        amount: Number,
        currency: String,
        method: String,
        transactionId: String,
        date: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["success", "failed", "pending"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ tier: 1 });
subscriptionSchema.index({ "payment.nextBillingDate": 1 });

// Virtual for subscription status
subscriptionSchema.virtual("isActive").get(function () {
  return this.status === "active" && this.endDate > new Date();
});

// Virtual for days remaining
subscriptionSchema.virtual("daysRemaining").get(function () {
  if (this.status !== "active") return 0;
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Method to check if user can upload more media
subscriptionSchema.methods.canUploadMedia = function (mediaType, currentCount) {
  const limit = mediaType === "photo" ? this.limits.photos : this.limits.videos;
  return currentCount < limit;
};

// Method to get subscription benefits
subscriptionSchema.methods.getBenefits = function () {
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
      photos: -1, // Unlimited
      videos: -1, // Unlimited
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
      photos: -1, // Unlimited
      videos: -1, // Unlimited
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

  return benefits[this.tier] || benefits.free;
};

// Static method to get pricing for different countries
subscriptionSchema.statics.getPricing = function (country = "international") {
  const pricing = {
    kenya: {
      verified: { amount: 1200, currency: "KES" },
      premium: { amount: 3000, currency: "KES" },
      elite: { amount: 6000, currency: "KES" },
    },
    uganda: {
      verified: { amount: 40000, currency: "UGX" },
      premium: { amount: 100000, currency: "UGX" },
      elite: { amount: 200000, currency: "UGX" },
    },
    tanzania: {
      verified: { amount: 30000, currency: "TZS" },
      premium: { amount: 75000, currency: "TZS" },
      elite: { amount: 150000, currency: "TZS" },
    },
    rwanda: {
      verified: { amount: 10000, currency: "RWF" },
      premium: { amount: 25000, currency: "RWF" },
      elite: { amount: 50000, currency: "RWF" },
    },
    drc: {
      verified: { amount: 20000, currency: "CDF" },
      premium: { amount: 50000, currency: "CDF" },
      elite: { amount: 100000, currency: "CDF" },
    },
    burundi: {
      verified: { amount: 25000, currency: "BIF" },
      premium: { amount: 60000, currency: "BIF" },
      elite: { amount: 120000, currency: "BIF" },
    },
    international: {
      verified: { amount: 8, currency: "USD" },
      premium: { amount: 20, currency: "USD" },
      elite: { amount: 40, currency: "USD" },
    },
  };

  return pricing[country] || pricing.international;
};

// Static method to get available payment methods by country
subscriptionSchema.statics.getPaymentMethods = function (country) {
  const methods = {
    kenya: [
      "mpesa_kenya",
      "airtel_kenya",
      "paypal",
      "stripe",
      "bitcoin",
      "usdt",
      "bank_transfer",
    ],
    uganda: [
      "mtn_uganda",
      "airtel_uganda",
      "mpesa_uganda",
      "paypal",
      "stripe",
      "bitcoin",
      "usdt",
      "bank_transfer",
    ],
    tanzania: [
      "mpesa_tanzania",
      "airtel_tanzania",
      "tigo_tanzania",
      "paypal",
      "stripe",
      "bitcoin",
      "usdt",
      "bank_transfer",
    ],
    rwanda: [
      "mtn_rwanda",
      "airtel_rwanda",
      "mpesa_rwanda",
      "paypal",
      "stripe",
      "bitcoin",
      "usdt",
      "bank_transfer",
    ],
    drc: [
      "mpesa_drc",
      "airtel_drc",
      "mtn_drc",
      "orange_drc",
      "paypal",
      "stripe",
      "bitcoin",
      "usdt",
      "bank_transfer",
    ],
    burundi: [
      "ecocash_burundi",
      "airtel_burundi",
      "lumitel_burundi",
      "paypal",
      "stripe",
      "bitcoin",
      "usdt",
      "bank_transfer",
    ],
    international: [
      "paypal",
      "stripe",
      "payoneer",
      "western_union",
      "moneygram",
      "bitcoin",
      "usdt",
      "ethereum",
      "bank_transfer",
    ],
  };

  return methods[country] || methods.international;
};

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
