import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

// Get global platform statistics
const getGlobalStats = asyncHandler(async (req, res) => {
  try {
    const { countryCode } = req.params || req.query;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Return demo data if database is not connected
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            stats: {
              totalEscorts: 0,
              verifiedEscorts: 0,
              onlineEscorts: 0,
              featuredEscorts: 0,
              premiumEscorts: 0,
              citiesCovered: 0,
              topCities: [],
              countryCode: countryCode || "ug",
            },
          },
          "Demo statistics (database not connected)"
        )
      );
    }

    // Map country codes to country names
    const countryMapping = {
      ug: "Uganda",
      ke: "Kenya",
      tz: "Tanzania",
      rw: "Rwanda",
      bi: "Burundi",
      cd: "DR Congo",
    };

    const countryName = countryMapping[countryCode] || "Uganda"; // Default to Uganda

    // Get current date for online status (users active in last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Calculate statistics
    const [
      totalEscorts,
      verifiedEscorts,
      onlineEscorts,
      featuredEscorts,
      premiumEscorts,
      citiesCovered,
    ] = await Promise.all([
      // Total active escort profiles
      User.countDocuments({
        role: "escort",
        isActive: true,
        isDeleted: { $ne: true },
        "location.country": { $in: [countryName, countryCode] },
      }),

      // Verified escorts (all escorts are verified by default)
      User.countDocuments({
        role: "escort",
        isActive: true,
        isDeleted: { $ne: true },
        "location.country": { $in: [countryName, countryCode] },
      }),

      // Online escorts (active in last 30 minutes)
      User.countDocuments({
        role: "escort",
        isActive: true,
        isDeleted: { $ne: true },
        "location.country": { $in: [countryName, countryCode] },
        lastActive: { $gte: thirtyMinutesAgo },
      }),

      // Featured escorts
      User.countDocuments({
        role: "escort",
        isActive: true,
        isDeleted: { $ne: true },
        "location.country": { $in: [countryName, countryCode] },
        $or: [{ isFeatured: true }, { subscriptionTier: "featured" }],
      }),

      // Premium escorts
      User.countDocuments({
        role: "escort",
        isActive: true,
        isDeleted: { $ne: true },
        "location.country": { $in: [countryName, countryCode] },
        subscriptionTier: "premium",
      }),

      // Cities covered (unique cities where escorts are located)
      User.aggregate([
        {
          $match: {
            role: "escort",
            isActive: true,
            isDeleted: { $ne: true },
            "location.country": { $in: [countryName, countryCode] },
            location: { $exists: true, $ne: null, $ne: "" },
          },
        },
        {
          $group: {
            _id: "$location.city",
          },
        },
        {
          $count: "totalCities",
        },
      ]),
    ]);

    // Extract cities count from aggregation result
    const citiesCount = citiesCovered[0]?.totalCities || 0;

    // Debug statistics
    console.log("📊 Global Stats Debug:", {
      totalEscorts,
      verifiedEscorts,
      onlineEscorts,
      featuredEscorts,
      premiumEscorts,
      citiesCount,
      countryCode,
      countryName,
      thirtyMinutesAgo,
    });

    // Debug: Check a few escorts' lastActive times
    const sampleEscorts = await User.find({
      role: "escort",
      isActive: true,
      isDeleted: { $ne: true },
      "location.country": { $in: [countryName, countryCode] },
    })
    .select("name lastActive isOnline")
    .limit(5);

    console.log("🔍 Sample Escorts Debug:", sampleEscorts.map(escort => ({
      name: escort.name,
      lastActive: escort.lastActive,
      isOnline: escort.isOnline,
      isOnlineCalculated: escort.lastActive && escort.lastActive >= thirtyMinutesAgo
    })));

    // Get cities list for the specific country
    const citiesList = await User.aggregate([
      {
        $match: {
          role: "escort",
          isActive: true,
          isDeleted: { $ne: true },
          "location.country": { $in: [countryName, countryCode] },
          location: { $exists: true, $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$location.city",
          escortCount: { $sum: 1 },
        },
      },
      {
        $sort: { escortCount: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    const stats = {
      totalEscorts,
      verifiedEscorts,
      onlineEscorts,
      featuredEscorts,
      premiumEscorts,
      citiesCovered: citiesCount,
      topCities: citiesList,
      countryCode,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { stats },
          "Global statistics retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error fetching global stats:", error);
    next(error);
  }
});

export { getGlobalStats };
