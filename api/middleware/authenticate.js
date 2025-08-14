import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import config from "../config/env.js";

export const authenticate = async (req, res, next) => {
  try {
    console.log("=== AUTHENTICATION DEBUG ===");
    console.log("Cookies:", req.cookies);
    console.log("Authorization header:", req.headers.authorization);

    // Check for token in cookies first, then Authorization header
    let token = null;

    // Check cookies if they exist
    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    // If no token in cookies, check Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    console.log("Token found:", !!token);
    console.log(
      "Token value:",
      token ? token.substring(0, 50) + "..." : "null"
    );

    if (!token) {
      console.log("No token provided");
      return res.status(403).json({
        success: false,
        message: "Unauthorized - No token provided",
      });
    }

    console.log("Verifying token...");
    try {
      const decodeToken = jwt.verify(token, config.JWT_SECRET);
      console.log("Token verified, user:", decodeToken);

      // If token doesn't have role, fetch it from database
      if (!decodeToken.role) {
        console.log("Token missing role, fetching from database...");
        const userFromDB = await User.findById(decodeToken._id).select("role");
        if (userFromDB) {
          decodeToken.role = userFromDB.role;
          console.log("Role fetched from DB:", userFromDB.role);
        }
      }

      req.user = decodeToken;
      next();
    } catch (jwtError) {
      console.log("JWT verification failed:", jwtError.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    console.log("General authentication error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Authentication error",
    });
  }
};
