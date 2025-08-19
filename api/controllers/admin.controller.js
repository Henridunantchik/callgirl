import User from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Make Lola Lala Premium
const makeLolaPremium = asyncHandler(async (req, res) => {
  try {
    // Find Lola Lala by name (case insensitive)
    const lola = await User.findOne({
      name: { $regex: /lola/i },
    });

    if (!lola) {
      throw new ApiError(404, "Lola Lala not found in database");
    }

    console.log("📋 Before update:");
    console.log(`   Name: ${lola.name}`);
    console.log(`   Current tier: ${lola.subscriptionTier || "basic"}`);
    console.log(`   Is Verified: ${lola.isVerified || false}`);

    // Update to Premium
    lola.subscriptionTier = "premium";
    lola.isVerified = true;

    await lola.save();

    console.log("\n✅ After update:");
    console.log(`   Name: ${lola.name}`);
    console.log(`   New tier: ${lola.subscriptionTier}`);
    console.log(`   Is Verified: ${lola.isVerified}`);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          message: "Lola Lala is now Premium!",
          user: {
            name: lola.name,
            subscriptionTier: lola.subscriptionTier,
            isVerified: lola.isVerified,
          },
        },
        "Lola Lala successfully upgraded to Premium"
      )
    );
  } catch (error) {
    throw new ApiError(500, "Error updating Lola Lala: " + error.message);
  }
});

// Get all users (admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, status } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const users = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      "Users retrieved successfully"
    )
  );
});

// Update user status (admin)
const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { status },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User status updated successfully"));
});

// Get platform stats (admin)
const getPlatformStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalEscorts = await User.countDocuments({ role: "escort" });
  const totalClients = await User.countDocuments({ role: "client" });
  const premiumUsers = await User.countDocuments({
    subscriptionTier: "premium",
  });
  const featuredUsers = await User.countDocuments({
    subscriptionTier: "featured",
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        totalEscorts,
        totalClients,
        premiumUsers,
        featuredUsers,
      },
      "Platform stats retrieved successfully"
    )
  );
});

// Get analytics (admin)
const getAnalytics = asyncHandler(async (req, res) => {
  const { period = "30d" } = req.query;

  // Simple analytics - can be enhanced later
  const now = new Date();
  const daysAgo = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  const newUsers = await User.countDocuments({
    createdAt: { $gte: startDate },
  });

  const newEscorts = await User.countDocuments({
    role: "escort",
    createdAt: { $gte: startDate },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        period,
        newUsers,
        newEscorts,
        startDate,
        endDate: now,
      },
      "Analytics retrieved successfully"
    )
  );
});

export {
  makeLolaPremium,
  getAllUsers,
  updateUserStatus,
  getPlatformStats,
  getAnalytics,
};
