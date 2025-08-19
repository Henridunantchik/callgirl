import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a new review
const createReview = asyncHandler(async (req, res) => {
  const { escortId, rating, comment, categories } = req.body;
  const userId = req.user._id;

  if (!escortId || !rating) {
    throw new ApiError(400, "Escort ID and rating are required");
  }

  // Check if user has already reviewed this escort
  const existingReview = await Review.findOne({
    client: userId,
    escort: escortId,
  });

  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this escort");
  }

  const review = await Review.create({
    client: userId,
    escort: escortId,
    rating,
    comment,
    categories: categories || [],
  });

  const populatedReview = await Review.findById(review._id)
    .populate("client", "name alias")
    .populate("escort", "name alias");

  // Update escort stats in real-time
  try {
    // Get updated review count and average rating
    const [reviewCount, ratingStats] = await Promise.all([
      Review.countDocuments({ escort: escortId }),
      Review.aggregate([
        {
          $match: { escort: new mongoose.Types.ObjectId(escortId) },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
          },
        },
      ]),
    ]);

    const averageRating = ratingStats[0]?.averageRating || 0;

    // Update escort stats
    await User.findByIdAndUpdate(escortId, {
      $set: {
        "stats.reviews": reviewCount,
        "stats.rating": Math.round(averageRating * 10) / 10,
        "stats.lastUpdated": new Date(),
      },
    });

    console.log(
      `✅ Updated escort ${escortId} reviews count to ${reviewCount}, rating to ${averageRating}`
    );
  } catch (error) {
    console.error("❌ Failed to update escort stats:", error);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, populatedReview, "Review created successfully"));
});

// Get reviews for an escort
const getEscortReviews = asyncHandler(async (req, res) => {
  const { escortId } = req.params;
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (page - 1) * limit;
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  const reviews = await Review.find({ escort: escortId })
    .populate("client", "name alias avatar")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Review.countDocuments({ escort: escortId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      "Reviews retrieved successfully"
    )
  );
});

// Get user's reviews
const getUserReviews = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const reviews = await Review.find({ client: userId })
    .populate("escort", "name alias avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Review.countDocuments({ client: userId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      "User reviews retrieved successfully"
    )
  );
});

// Update a review
const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment, categories } = req.body;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.client.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only update your own reviews");
  }

  const escortId = review.escort;
  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    {
      rating,
      comment,
      categories,
    },
    { new: true }
  )
    .populate("client", "name alias")
    .populate("escort", "name alias");

  // Update escort stats in real-time
  try {
    // Get updated review count and average rating
    const [reviewCount, ratingStats] = await Promise.all([
      Review.countDocuments({ escort: escortId }),
      Review.aggregate([
        {
          $match: { escort: new mongoose.Types.ObjectId(escortId) },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
          },
        },
      ]),
    ]);

    const averageRating = ratingStats[0]?.averageRating || 0;

    // Update escort stats
    await User.findByIdAndUpdate(escortId, {
      $set: {
        "stats.reviews": reviewCount,
        "stats.rating": Math.round(averageRating * 10) / 10,
        "stats.lastUpdated": new Date(),
      },
    });

    console.log(
      `✅ Updated escort ${escortId} reviews count to ${reviewCount}, rating to ${averageRating}`
    );
  } catch (error) {
    console.error("❌ Failed to update escort stats:", error);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedReview, "Review updated successfully"));
});

// Delete a review
const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.client.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only delete your own reviews");
  }

  const escortId = review.escort;
  await Review.findByIdAndDelete(reviewId);

  // Update escort stats in real-time
  try {
    // Get updated review count and average rating
    const [reviewCount, ratingStats] = await Promise.all([
      Review.countDocuments({ escort: escortId }),
      Review.aggregate([
        {
          $match: { escort: new mongoose.Types.ObjectId(escortId) },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
          },
        },
      ]),
    ]);

    const averageRating = ratingStats[0]?.averageRating || 0;

    // Update escort stats
    await User.findByIdAndUpdate(escortId, {
      $set: {
        "stats.reviews": reviewCount,
        "stats.rating": Math.round(averageRating * 10) / 10,
        "stats.lastUpdated": new Date(),
      },
    });

    console.log(
      `✅ Updated escort ${escortId} reviews count to ${reviewCount}, rating to ${averageRating}`
    );
  } catch (error) {
    console.error("❌ Failed to update escort stats:", error);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Review deleted successfully"));
});

// Report a review
const reportReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { reason, description } = req.body;
  const userId = req.user._id;

  if (!reason) {
    throw new ApiError(400, "Reason is required for reporting");
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Check if user has already reported this review
  const existingReport = review.reports.find(
    (report) => report.user.toString() === userId.toString()
  );

  if (existingReport) {
    throw new ApiError(400, "You have already reported this review");
  }

  review.reports.push({
    user: userId,
    reason,
    description,
  });

  await review.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Review reported successfully"));
});

export {
  createReview,
  getEscortReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  reportReview,
};
