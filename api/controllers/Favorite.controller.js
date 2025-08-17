import Favorite from "../models/favorite.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Add escort to favorites
const addToFavorites = asyncHandler(async (req, res) => {
  const { escortId } = req.body;
  const userId = req.user._id;

  if (!escortId) {
    throw new ApiError(400, "Escort ID is required");
  }

  // Check if already favorited
  const existingFavorite = await Favorite.findOne({
    client: userId,
    escort: escortId,
  });

  if (existingFavorite) {
    throw new ApiError(400, "Escort is already in your favorites");
  }

  const favorite = await Favorite.create({
    client: userId,
    escort: escortId,
  });

  const populatedFavorite = await Favorite.findById(favorite._id)
    .populate("client", "name alias avatar")
    .populate("escort", "name alias avatar age location rates");

  return res.status(201).json(
    new ApiResponse(201, populatedFavorite, "Added to favorites successfully")
  );
});

// Remove escort from favorites
const removeFromFavorites = asyncHandler(async (req, res) => {
  const { escortId } = req.params;
  const userId = req.user._id;

  const favorite = await Favorite.findOneAndDelete({
    client: userId,
    escort: escortId,
  });

  if (!favorite) {
    throw new ApiError(404, "Favorite not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Removed from favorites successfully")
  );
});

// Get user's favorites
const getUserFavorites = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const favorites = await Favorite.find({ client: userId })
    .populate("escort", "name alias avatar age location rates isOnline isVerified")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Favorite.countDocuments({ client: userId });

  return res.status(200).json(
    new ApiResponse(200, {
      favorites,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    }, "Favorites retrieved successfully")
  );
});

// Check if escort is favorited
const isFavorited = asyncHandler(async (req, res) => {
  const { escortId } = req.params;
  const userId = req.user._id;

  const favorite = await Favorite.findOne({
    client: userId,
    escort: escortId,
  });

  return res.status(200).json(
    new ApiResponse(200, { isFavorited: !!favorite }, "Favorite status checked")
  );
});

export {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  isFavorited,
}; 