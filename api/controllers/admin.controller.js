import User from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Make Lola Lala Premium
const makeLolaPremium = asyncHandler(async (req, res) => {
  try {
    // Find Lola Lala by name (case insensitive)
    const lola = await User.findOne({
      name: { $regex: /lola/i }
    });

    if (!lola) {
      throw new ApiError(404, "Lola Lala not found in database");
    }

    console.log("📋 Before update:");
    console.log(`   Name: ${lola.name}`);
    console.log(`   Current tier: ${lola.subscriptionTier || 'basic'}`);
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
      new ApiResponse(200, {
        message: "Lola Lala is now Premium!",
        user: {
          name: lola.name,
          subscriptionTier: lola.subscriptionTier,
          isVerified: lola.isVerified
        }
      }, "Lola Lala successfully upgraded to Premium")
    );

  } catch (error) {
    throw new ApiError(500, "Error updating Lola Lala: " + error.message);
  }
});

export { makeLolaPremium };



