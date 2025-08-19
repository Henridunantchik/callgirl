import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";

/**
 * Get subscription pricing for different countries
 * GET /api/subscription/pricing
 */
export const getSubscriptionPricing = asyncHandler(async (req, res, next) => {
  try {
    const { country = "international" } = req.query;

    const pricing = Subscription.getPricing(country);
    const paymentMethods = Subscription.getPaymentMethods(country);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          pricing,
          paymentMethods,
          country,
          tiers: {
            basic: {
              name: "Basic Tier",
              price: 0,
              features: [
                "Age verification",
                "10 photos",
                "5 videos",
                "Basic profile",
                "Standard search",
              ],
              limits: { photos: 10, videos: 5 },
            },
            verified: {
              name: "Verified Account",
              price: pricing.verified,
              features: [
                "Verified badge",
                "Priority search",
                "Enhanced analytics",
                "Priority support",
                "20 photos",
                "10 videos",
              ],
              limits: { photos: 20, videos: 10 },
            },
            premium: {
              name: "Premium Profile",
              price: pricing.premium,
              features: [
                "Premium badge",
                "Featured placement",
                "Unlimited photos & videos",
                "Direct contact",
                "Profile highlighting",
                "Analytics dashboard",
              ],
              limits: { photos: -1, videos: -1 }, // Unlimited
            },
            elite: {
              name: "Elite Package",
              price: pricing.elite,
              features: [
                "VIP badge",
                "Homepage featured",
                "Priority booking",
                "Custom profile",
                "Social media integration",
                "Professional tips",
                "Marketing support",
              ],
              limits: { photos: -1, videos: -1 }, // Unlimited
            },
          },
        },
        "Subscription pricing retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
});

/**
 * Create a new subscription
 * POST /api/subscription/create
 */
export const createSubscription = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { tier, paymentMethod, country } = req.body;

    // Validate tier
    const validTiers = ["verified", "premium", "elite"];
    if (!validTiers.includes(tier)) {
      throw new ApiError(400, "Invalid subscription tier");
    }

    // Check if user has verified age (required for all paid subscriptions)
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!user.isAgeVerified) {
      throw new ApiError(
        403,
        "Age verification required before subscribing to paid tiers"
      );
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      userId,
      status: "active",
    });

    if (existingSubscription) {
      throw new ApiError(400, "User already has an active subscription");
    }

    // Get pricing for the country
    const pricing = Subscription.getPricing(country);
    const tierPricing = pricing[tier];

    if (!tierPricing) {
      throw new ApiError(400, "Invalid subscription tier for this country");
    }

    // Create subscription
    const subscription = new Subscription({
      userId,
      tier,
      country,
      payment: {
        method: paymentMethod,
        amount: tierPricing.amount,
        currency: tierPricing.currency,
        transactionId: `TXN_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      limits: getLimitsForTier(tier),
      features: getFeaturesForTier(tier),
    });

    await subscription.save();

    // Update user with subscription info
    user.subscriptionTier = tier;
    user.subscriptionStatus = "active";
    await user.save();

    console.log(`Subscription created for user ${userId}: ${tier} tier`);

    return res
      .status(201)
      .json(
        new ApiResponse(201, subscription, "Subscription created successfully")
      );
  } catch (error) {
    next(error);
  }
});

/**
 * Get user's current subscription
 * GET /api/subscription/current
 */
export const getCurrentSubscription = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.user;

    const subscription = await Subscription.findOne({
      userId,
      status: "active",
    }).populate("userId", "name email role");

    if (!subscription) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            tier: "basic",
            status: "active",
            benefits: Subscription.prototype.getBenefits.call({
              tier: "basic",
            }),
            limits: { photos: 10, videos: 5 },
          },
          "User has basic tier subscription"
        )
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          subscription,
          benefits: subscription.getBenefits(),
          daysRemaining: subscription.daysRemaining,
          isActive: subscription.isActive,
        },
        "Current subscription retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
});

/**
 * Cancel subscription
 * PUT /api/subscription/cancel
 */
export const cancelSubscription = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { reason } = req.body;

    const subscription = await Subscription.findOne({
      userId,
      status: "active",
    });

    if (!subscription) {
      throw new ApiError(404, "No active subscription found");
    }

    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = reason || "User cancelled";
    subscription.autoRenew = false;

    await subscription.save();

    // Update user subscription status
    const user = await User.findById(userId);
    if (user) {
      user.subscriptionStatus = "cancelled";
      await user.save();
    }

    console.log(`Subscription cancelled for user ${userId}: ${reason}`);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscription,
          "Subscription cancelled successfully"
        )
      );
  } catch (error) {
    next(error);
  }
});

/**
 * Check if user can upload media based on subscription
 * GET /api/subscription/check-media-limit
 */
export const checkMediaLimit = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { mediaType, currentCount } = req.query;

    if (!mediaType || !currentCount) {
      throw new ApiError(400, "Media type and current count are required");
    }

    const subscription = await Subscription.findOne({
      userId,
      status: "active",
    });

    let canUpload = true;
    let limit = 10; // Default basic tier limit
    let tier = "basic";

    if (subscription && subscription.isActive) {
      tier = subscription.tier;
      limit =
        mediaType === "photo"
          ? subscription.limits.photos
          : subscription.limits.videos;
      canUpload = subscription.canUploadMedia(
        mediaType,
        parseInt(currentCount)
      );
    } else {
      // Basic tier limits
      limit = mediaType === "photo" ? 10 : 5;
      canUpload = parseInt(currentCount) < limit;
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          canUpload,
          currentCount: parseInt(currentCount),
          limit: limit === -1 ? "Unlimited" : limit,
          tier,
          remaining:
            limit === -1
              ? "Unlimited"
              : Math.max(0, limit - parseInt(currentCount)),
        },
        "Media limit check completed"
      )
    );
  } catch (error) {
    next(error);
  }
});

/**
 * Get subscription benefits for user
 * GET /api/subscription/benefits
 */
export const getSubscriptionBenefits = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.user;

    const subscription = await Subscription.findOne({
      userId,
      status: "active",
    });

    const benefits = subscription
      ? subscription.getBenefits()
      : Subscription.prototype.getBenefits.call({ tier: "basic" });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          tier: subscription ? subscription.tier : "basic",
          benefits,
          isActive: subscription ? subscription.isActive : true,
        },
        "Subscription benefits retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
});

/**
 * Admin: Get all subscriptions
 * GET /api/admin/subscriptions
 */
export const getAllSubscriptions = asyncHandler(async (req, res, next) => {
  try {
    // Only admins can access this
    if (req.user.role !== "admin") {
      throw new ApiError(403, "Admin access required");
    }

    const { page = 1, limit = 10, status, tier, country } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (tier) filter.tier = tier;
    if (country) filter.country = country;

    const subscriptions = await Subscription.find(filter)
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Subscription.countDocuments(filter);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          subscriptions,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total,
        },
        "All subscriptions retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
});

// Helper functions
function getLimitsForTier(tier) {
  const limits = {
    verified: { photos: 20, videos: 10 },
    premium: { photos: -1, videos: -1 }, // Unlimited
    elite: { photos: -1, videos: -1 }, // Unlimited
  };
  return limits[tier] || { photos: 10, videos: 5 };
}

function getFeaturesForTier(tier) {
  const features = {
    verified: {
      verifiedBadge: true,
      premiumBadge: false,
      eliteBadge: false,
      homepageFeatured: false,
      priorityBooking: false,
      socialMediaIntegration: false,
      professionalTips: false,
    },
    premium: {
      verifiedBadge: true,
      premiumBadge: true,
      eliteBadge: false,
      homepageFeatured: false,
      priorityBooking: false,
      socialMediaIntegration: false,
      professionalTips: false,
    },
    elite: {
      verifiedBadge: true,
      premiumBadge: true,
      eliteBadge: true,
      homepageFeatured: true,
      priorityBooking: true,
      socialMediaIntegration: true,
      professionalTips: true,
    },
  };
  return (
    features[tier] || {
      verifiedBadge: false,
      premiumBadge: false,
      eliteBadge: false,
      homepageFeatured: false,
      priorityBooking: false,
      socialMediaIntegration: false,
      professionalTips: false,
    }
  );
}
