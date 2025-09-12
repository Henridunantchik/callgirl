import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import UpgradeRequest from "../models/upgradeRequest.model.js";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";

// Créer une nouvelle demande d'upgrade
const createUpgradeRequest = asyncHandler(async (req, res) => {
  const {
    escortName,
    escortPhone,
    escortEmail,
    requestedPlan,
    contactMethod,
    paymentProof,
    countryCode,
  } = req.body;

  const userId = req.user._id;

  // Vérifier que l'utilisateur est un escort
  const user = await User.findById(userId);
  if (!user || user.role !== "escort") {
    throw new ApiError(
      403,
      "Seuls les escorts peuvent faire des demandes d'upgrade"
    );
  }

  // Vérifier qu'il n'y a pas déjà une demande en attente
  const existingRequest = await UpgradeRequest.findOne({
    escort: userId,
    status: "pending",
  });

  if (existingRequest) {
    throw new ApiError(400, "Vous avez déjà une demande d'upgrade en attente");
  }

  // Calculate amount based on requested plan and period

  let paymentAmount;
  if (requestedPlan === "featured") {
    paymentAmount = 12; // $12 one-time for featured
  } else if (requestedPlan === "premium") {
    const subscriptionPeriod = req.body.subscriptionPeriod || "monthly";
    if (subscriptionPeriod === "annual") {
      paymentAmount = 60; // $60/year for premium annual
    } else {
      paymentAmount = 5; // $5/month for premium monthly
    }
  }

  // Create the request
  const upgradeRequest = await UpgradeRequest.create({
    escort: userId,
    escortName,
    escortPhone,
    escortEmail,
    currentPlan: user.subscriptionTier || "basic",
    requestedPlan,
    contactMethod,
    paymentProof,
    paymentAmount,
    subscriptionPeriod: req.body.subscriptionPeriod || "monthly",
    countryCode,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        upgradeRequest,
        "Upgrade request created successfully"
      )
    );
});

// Obtenir les demandes d'un escort
const getEscortUpgradeRequests = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const requests = await UpgradeRequest.find({ escort: userId })
    .sort({ createdAt: -1 })
    .populate("processedBy", "name email");

  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Demandes d'upgrade récupérées"));
});

// Obtenir toutes les demandes (admin)
const getAllUpgradeRequests = asyncHandler(async (req, res) => {
  const { status, countryCode, page = 1, limit = 20 } = req.query;

  // Vérifier que l'utilisateur est admin
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Accès non autorisé");
  }

  const filter = {};
  if (status) filter.status = status;
  if (countryCode) filter.countryCode = countryCode;

  const skip = (page - 1) * limit;

  const requests = await UpgradeRequest.find(filter)
    .populate("escort", "name alias email phone avatar")
    .populate("processedBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await UpgradeRequest.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        requests,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      "Demandes d'upgrade récupérées"
    )
  );
});

// Send payment instructions (admin)
const sendPaymentInstructions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentInstructions, paymentMethod } = req.body;

  // Vérifier que l'utilisateur est admin
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Accès non autorisé");
  }

  const upgradeRequest = await UpgradeRequest.findById(id);

  if (!upgradeRequest) {
    throw new ApiError(404, "Demande d'upgrade non trouvée");
  }

  if (upgradeRequest.status !== "pending") {
    throw new ApiError(400, "Cette demande a déjà été traitée");
  }

  // Set payment deadline to 48 hours from now
  const paymentDeadline = new Date();
  paymentDeadline.setHours(paymentDeadline.getHours() + 48);

  // Mettre à jour la demande
  upgradeRequest.status = "payment_required";
  upgradeRequest.paymentInstructions = paymentInstructions;
  upgradeRequest.paymentMethod = paymentMethod;
  upgradeRequest.paymentDeadline = paymentDeadline;
  upgradeRequest.processedBy = req.user._id;
  upgradeRequest.processedAt = new Date();

  await upgradeRequest.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, upgradeRequest, "Instructions de paiement envoyées")
    );
});

// Submit payment proof (escort)
const submitPaymentProof = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentProof } = req.body;

  const upgradeRequest = await UpgradeRequest.findById(id);

  if (!upgradeRequest) {
    throw new ApiError(404, "Demande d'upgrade non trouvée");
  }

  // Check if user owns this request
  if (upgradeRequest.escort.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Accès non autorisé");
  }

  if (upgradeRequest.status !== "payment_required") {
    throw new ApiError(400, "Paiement non requis pour cette demande");
  }

  // Check if payment deadline has passed
  if (new Date() > upgradeRequest.paymentDeadline) {
    upgradeRequest.status = "expired";
    await upgradeRequest.save();
    throw new ApiError(
      400,
      "Délai de paiement expiré. Veuillez soumettre une nouvelle demande."
    );
  }

  // Mettre à jour la demande
  upgradeRequest.status = "payment_confirmed";
  upgradeRequest.paymentProof = paymentProof;
  upgradeRequest.processedAt = new Date();

  await upgradeRequest.save();

  return res
    .status(200)
    .json(new ApiResponse(200, upgradeRequest, "Preuve de paiement soumise"));
});

// Approuver une demande (admin) - after payment confirmation
const approveUpgradeRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;

  // Vérifier que l'utilisateur est admin
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Accès non autorisé");
  }

  const upgradeRequest = await UpgradeRequest.findById(id).populate(
    "escort",
    "name subscriptionTier"
  );

  if (!upgradeRequest) {
    throw new ApiError(404, "Demande d'upgrade non trouvée");
  }

  if (upgradeRequest.status !== "payment_confirmed") {
    throw new ApiError(
      400,
      "Cette demande n'est pas prête à être approuvée. Le paiement doit d'abord être confirmé."
    );
  }

  // Mettre à jour le profil de l'escort
  const escort = await User.findById(upgradeRequest.escort);
  if (!escort) {
    throw new ApiError(404, "Escort non trouvé");
  }

  // Set subscription dates
  const now = new Date();
  const subscriptionStartDate = now;
  let subscriptionEndDate;

  if (upgradeRequest.requestedPlan === "premium") {
    // Premium is monthly or annual subscription
    if (upgradeRequest.subscriptionPeriod === "annual") {
      subscriptionEndDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
    } else {
      subscriptionEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month
    }

    // Update user subscription details
    escort.subscriptionDetails = {
      period: upgradeRequest.subscriptionPeriod || "monthly",
      startDate: subscriptionStartDate,
      endDate: subscriptionEndDate,
      autoRenew: false, // Default to manual renewal
      lastPaymentDate: now,
      nextPaymentDate: subscriptionEndDate,
    };
  } else {
    // Featured is one-time payment, no expiration
    subscriptionEndDate = null;
  }

  // Mettre à jour le plan
  escort.subscriptionTier = upgradeRequest.requestedPlan;

  // Set featured status based on subscription tier
  if (
    upgradeRequest.requestedPlan === "featured" ||
    upgradeRequest.requestedPlan === "premium"
  ) {
    escort.isFeatured = true;
  }

  // Ajouter le badge verified si c'est premium
  if (upgradeRequest.requestedPlan === "premium") {
    escort.isVerified = true;
  }

  await escort.save();

  // Create Subscription document for Premium users
  if (upgradeRequest.requestedPlan === "premium") {
    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({
      userId: escort._id,
      status: "active",
    });

    if (!existingSubscription) {
      // Create new subscription document
      const subscription = new Subscription({
        userId: escort._id,
        tier: "premium",
        status: "active",
        startDate: subscriptionStartDate,
        endDate: subscriptionEndDate,
        country: "uganda", // Default, can be updated later
        autoRenew: false,
        payment: {
          method: "mtn_uganda", // Default payment method
          amount: upgradeRequest.paymentAmount,
          currency: "USD",
          transactionId: "UPGRADE_" + upgradeRequest._id,
          paymentDate: now,
          nextBillingDate: subscriptionEndDate,
        },
        limits: {
          photos: -1, // Unlimited
          videos: -1, // Unlimited
          featuredPlacement: true,
          prioritySearch: true,
          analytics: true,
          directContact: true,
          customProfile: true,
          marketingSupport: true,
        },
        features: {
          verifiedBadge: true,
          premiumBadge: true,
          homepageFeatured: false,
          priorityBooking: true,
          socialMediaIntegration: false,
          professionalTips: false,
        },
      });

      await subscription.save();
    }
  }

  // Mettre à jour la demande
  upgradeRequest.status = "approved";
  upgradeRequest.adminNotes = adminNotes;
  upgradeRequest.processedBy = req.user._id;
  upgradeRequest.processedAt = new Date();

  await upgradeRequest.save();

  return res
    .status(200)
    .json(new ApiResponse(200, upgradeRequest, "Demande d'upgrade approuvée"));
});

// Confirmer le paiement manuellement (admin) - when admin verifies payment proof
const confirmPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;

  console.log("🔍 Confirm Payment Debug:", {
    requestId: id,
    adminNotes: adminNotes,
    adminUser: req.user?.email,
    adminRole: req.user?.role
  });

  // Vérifier que l'utilisateur est admin
  if (req.user.role !== "admin") {
    console.log("❌ Admin check failed:", req.user?.role);
    throw new ApiError(403, "Accès non autorisé");
  }

  console.log("🔍 Looking for upgrade request with ID:", id);
  const upgradeRequest = await UpgradeRequest.findById(id);
  console.log("🔍 Upgrade request found:", !!upgradeRequest);
  
  if (upgradeRequest) {
    console.log("🔍 Upgrade request status:", upgradeRequest.status);
    console.log("🔍 Upgrade request details:", {
      id: upgradeRequest._id,
      status: upgradeRequest.status,
      escort: upgradeRequest.escort,
      requestedPlan: upgradeRequest.requestedPlan
    });
  }

  if (!upgradeRequest) {
    console.log("❌ Upgrade request not found for ID:", id);
    throw new ApiError(404, "Demande d'upgrade non trouvée");
  }

  if (upgradeRequest.status !== "payment_required") {
    console.log("❌ Invalid status for payment confirmation:", upgradeRequest.status);
    throw new ApiError(
      400,
      "Cette demande n'est pas en attente de confirmation de paiement"
    );
  }

  // Mettre à jour la demande pour confirmer le paiement
  upgradeRequest.status = "payment_confirmed";
  upgradeRequest.adminNotes = adminNotes || "Payment confirmed by admin";
  upgradeRequest.processedBy = req.user._id;
  upgradeRequest.processedAt = new Date();

  await upgradeRequest.save();

  return res
    .status(200)
    .json(new ApiResponse(200, upgradeRequest, "Paiement confirmé"));
});

// Rejeter une demande (admin)
const rejectUpgradeRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;

  // Vérifier que l'utilisateur est admin
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Accès non autorisé");
  }

  const upgradeRequest = await UpgradeRequest.findById(id);

  if (!upgradeRequest) {
    throw new ApiError(404, "Demande d'upgrade non trouvée");
  }

  if (
    upgradeRequest.status !== "pending" &&
    upgradeRequest.status !== "payment_required"
  ) {
    throw new ApiError(400, "Cette demande a déjà été traitée");
  }

  // Mettre à jour la demande
  upgradeRequest.status = "rejected";
  upgradeRequest.adminNotes = adminNotes;
  upgradeRequest.processedBy = req.user._id;
  upgradeRequest.processedAt = new Date();

  await upgradeRequest.save();

  return res
    .status(200)
    .json(new ApiResponse(200, upgradeRequest, "Demande d'upgrade rejetée"));
});

// Get upgrade request statistics (admin)
const getUpgradeStats = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  const stats = await UpgradeRequest.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$paymentAmount" },
      },
    },
  ]);

  const totalRequests = await UpgradeRequest.countDocuments();
  const pendingRequests = await UpgradeRequest.countDocuments({
    status: "pending",
  });
  const approvedRequestsCount = await UpgradeRequest.countDocuments({
    status: "approved",
  });
  const rejectedRequests = await UpgradeRequest.countDocuments({
    status: "rejected",
  });

  // Extract values from stats array for easier frontend consumption
  const approvedStats = stats.find((s) => s._id === "approved");
  const rejectedStats = stats.find((s) => s._id === "rejected");
  const pendingStats = stats.find((s) => s._id === "pending");

  // Calculate total revenue from approved requests with correct pricing
  const approvedRequests = await UpgradeRequest.find({ status: "approved" });

  let totalRevenue = 0;
  approvedRequests.forEach((request) => {
    if (request.requestedPlan === "featured") {
      totalRevenue += 12; // $12 for featured
    } else if (request.requestedPlan === "premium") {
      if (request.subscriptionPeriod === "annual") {
        totalRevenue += 60; // $60 for premium annual
      } else {
        totalRevenue += 5; // $5 for premium monthly
      }
    }
  });

  const responseData = {
    stats,
    totalRequests,
    pendingRequests,
    approvedRequests: approvedRequestsCount,
    rejectedRequests,
    totalRevenue,
    // Also include the extracted values for easier frontend consumption
    approvedCount: approvedStats ? approvedStats.count : 0,
    rejectedCount: rejectedStats ? rejectedStats.count : 0,
    approvedAmount: approvedStats ? approvedStats.totalAmount : 0,
    rejectedAmount: rejectedStats ? rejectedStats.totalAmount : 0,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, responseData, "Upgrade request statistics"));
});

// Auto-expire payment required requests after 48 hours
const expirePaymentRequests = asyncHandler(async () => {
  const expiredRequests = await UpgradeRequest.find({
    status: "payment_required",
    paymentDeadline: { $lt: new Date() },
  });

  for (const request of expiredRequests) {
    request.status = "expired";
    request.adminNotes = "Request expired - payment deadline passed (48 hours)";
    await request.save();
  }

  console.log(`Expired ${expiredRequests.length} payment requests`);
});

// Check and handle expired premium subscriptions
const checkExpiredSubscriptions = asyncHandler(async () => {
  const now = new Date();

  // Find users with expired premium subscriptions
  const expiredUsers = await User.find({
    subscriptionTier: "premium",
    "subscriptionDetails.endDate": { $lt: now },
    subscriptionStatus: "active",
  });

  for (const user of expiredUsers) {
    // Downgrade to featured
    user.subscriptionTier = "featured";
    user.subscriptionStatus = "expired";
    user.subscriptionDetails.endDate = null; // Featured doesn't expire

    // Remove premium benefits
    if (user.isVerified) {
      user.isVerified = false;
    }

    await user.save();

    console.log(
      `User ${user._id} premium subscription expired, downgraded to featured`
    );
  }

  console.log(`Processed ${expiredUsers.length} expired premium subscriptions`);
});

// Get subscription status (alias for getUserSubscriptionStatus)
const getSubscriptionStatus = asyncHandler(async (req, res) => {
  return getUserSubscriptionStatus(req, res);
});

// Get user subscription status and remaining time
const getUserSubscriptionStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select(
    "subscriptionTier subscriptionDetails subscriptionStatus"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let subscriptionInfo = {
    tier: user.subscriptionTier,
    status: user.subscriptionStatus,
    isActive: user.subscriptionStatus === "active",
    remainingDays: null,
    endDate: null,
    period: null,
  };

  // First check if there's a separate Subscription document
  const subscription = await Subscription.findOne({
    userId: userId,
    status: "active"
  });

  if (subscription) {
    // Use data from Subscription document
    subscriptionInfo.remainingDays = subscription.daysRemaining;
    subscriptionInfo.endDate = subscription.endDate;
    subscriptionInfo.period = subscription.tier === "premium" ? "monthly" : null;
    subscriptionInfo.isExpired = subscription.daysRemaining <= 0;
  } else if (
    user.subscriptionTier === "premium" &&
    user.subscriptionDetails?.endDate
  ) {
    // Fallback to User model data
    const now = new Date();
    const endDate = new Date(user.subscriptionDetails.endDate);
    const remainingMs = endDate.getTime() - now.getTime();
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

    subscriptionInfo.remainingDays = remainingDays > 0 ? remainingDays : 0;
    subscriptionInfo.endDate = user.subscriptionDetails.endDate;
    subscriptionInfo.period = user.subscriptionDetails.period;
    subscriptionInfo.isExpired = remainingDays <= 0;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscriptionInfo, "Subscription status retrieved")
    );
});

export {
  createUpgradeRequest,
  getEscortUpgradeRequests,
  getAllUpgradeRequests,
  sendPaymentInstructions,
  submitPaymentProof,
  approveUpgradeRequest,
  confirmPayment,
  rejectUpgradeRequest,
  getUpgradeStats,
  expirePaymentRequests,
  checkExpiredSubscriptions,
  getUserSubscriptionStatus,
  getSubscriptionStatus,
};
