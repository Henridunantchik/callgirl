import User from "../models/user.model.js";

const onlyEscort = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "escort") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Escort role required.",
      });
    }

    // Check if escort profile is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your profile is currently inactive. Please contact support.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { onlyEscort };
