import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import UpgradeRequest from "../models/upgradeRequest.model.js";
import User from "../models/user.model.js";

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
    throw new ApiError(403, "Seuls les escorts peuvent faire des demandes d'upgrade");
  }

  // Vérifier qu'il n'y a pas déjà une demande en attente
  const existingRequest = await UpgradeRequest.findOne({
    escort: userId,
    status: "pending",
  });

  if (existingRequest) {
    throw new ApiError(400, "Vous avez déjà une demande d'upgrade en attente");
  }

  // Calculer le montant selon le plan demandé
  const paymentAmount = requestedPlan === "featured" ? 12 : 5;

  // Créer la demande
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
    countryCode,
  });

  return res.status(201).json(
    new ApiResponse(201, upgradeRequest, "Demande d'upgrade créée avec succès")
  );
});

// Obtenir les demandes d'un escort
const getEscortUpgradeRequests = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const requests = await UpgradeRequest.find({ escort: userId })
    .sort({ createdAt: -1 })
    .populate("processedBy", "name email");

  return res.status(200).json(
    new ApiResponse(200, requests, "Demandes d'upgrade récupérées")
  );
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
    .populate("escort", "name alias email phone")
    .populate("processedBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await UpgradeRequest.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      requests,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    }, "Demandes d'upgrade récupérées")
  );
});

// Approuver une demande (admin)
const approveUpgradeRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { adminNotes } = req.body;

  // Vérifier que l'utilisateur est admin
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Accès non autorisé");
  }

  const upgradeRequest = await UpgradeRequest.findById(requestId)
    .populate("escort", "name subscriptionTier");

  if (!upgradeRequest) {
    throw new ApiError(404, "Demande d'upgrade non trouvée");
  }

  if (upgradeRequest.status !== "pending") {
    throw new ApiError(400, "Cette demande a déjà été traitée");
  }

  // Mettre à jour le profil de l'escort
  const escort = await User.findById(upgradeRequest.escort);
  if (!escort) {
    throw new ApiError(404, "Escort non trouvé");
  }

  // Mettre à jour le plan
  escort.subscriptionTier = upgradeRequest.requestedPlan;
  
  // Ajouter le badge verified si c'est premium
  if (upgradeRequest.requestedPlan === "premium") {
    escort.isVerified = true;
  }

  await escort.save();

  // Mettre à jour la demande
  upgradeRequest.status = "approved";
  upgradeRequest.adminNotes = adminNotes;
  upgradeRequest.processedBy = req.user._id;
  upgradeRequest.processedAt = new Date();

  await upgradeRequest.save();

  return res.status(200).json(
    new ApiResponse(200, upgradeRequest, "Demande d'upgrade approuvée")
  );
});

// Rejeter une demande (admin)
const rejectUpgradeRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { adminNotes } = req.body;

  // Vérifier que l'utilisateur est admin
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Accès non autorisé");
  }

  const upgradeRequest = await UpgradeRequest.findById(requestId);

  if (!upgradeRequest) {
    throw new ApiError(404, "Demande d'upgrade non trouvée");
  }

  if (upgradeRequest.status !== "pending") {
    throw new ApiError(400, "Cette demande a déjà été traitée");
  }

  // Mettre à jour la demande
  upgradeRequest.status = "rejected";
  upgradeRequest.adminNotes = adminNotes;
  upgradeRequest.processedBy = req.user._id;
  upgradeRequest.processedAt = new Date();

  await upgradeRequest.save();

  return res.status(200).json(
    new ApiResponse(200, upgradeRequest, "Demande d'upgrade rejetée")
  );
});

// Obtenir les statistiques des demandes (admin)
const getUpgradeStats = asyncHandler(async (req, res) => {
  // Vérifier que l'utilisateur est admin
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Accès non autorisé");
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
  const pendingRequests = await UpgradeRequest.countDocuments({ status: "pending" });

  return res.status(200).json(
    new ApiResponse(200, {
      stats,
      totalRequests,
      pendingRequests,
    }, "Statistiques des demandes d'upgrade")
  );
});

export {
  createUpgradeRequest,
  getEscortUpgradeRequests,
  getAllUpgradeRequests,
  approveUpgradeRequest,
  rejectUpgradeRequest,
  getUpgradeStats,
};
