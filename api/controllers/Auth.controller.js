import { handleError } from "../helpers/handleError.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/env.js";
import {
  validateEmail,
  validatePassword,
  hashPassword,
  comparePassword,
  generateToken,
} from "../utils/security.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fixUrlsInObject } from "../utils/urlHelper.js";
export const Register = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Enhanced validation
    if (!name || !email || !password) {
      throw new ApiError(400, "All fields are required");
    }

    // Validate email format
    if (!validateEmail(email)) {
      throw new ApiError(400, "Invalid email format");
    }

    // Validate password strength
    if (!validatePassword(password)) {
      throw new ApiError(
        400,
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "User already registered");
    }

    // Hash password using enhanced security
    const hashedPassword = await hashPassword(password);

    // Create user with enhanced security
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "client", // Default role
      isActive: true,
      isVerified: false,
    });

    await user.save();

    // Generate secure token
    const token = generateToken({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Set secure cookie
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: config.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Log successful registration
    console.log(`New user registered: ${user.email} (${user._id})`);

    // Return user data without password
    const userResponse = user.toObject({ getters: true });
    delete userResponse.password;

    // Fix URLs for media files
    const userWithFixedUrls = fixUrlsInObject(userResponse);

    return res.status(201).json({
      success: true,
      user: userWithFixedUrls,
      token: token,
      message: "Registration successful",
    });
  } catch (error) {
    // Log registration errors
    console.error(`Registration failed: ${error.message}`, {
      email: req.body.email,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    });

    next(error);
  }
});

export const Login = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Enhanced validation
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    // Validate email format
    if (!validateEmail(email)) {
      throw new ApiError(400, "Invalid email format");
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new ApiError(401, "Invalid login credentials");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(
        403,
        "Account is deactivated. Please contact support."
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      // Log failed login attempt
      console.warn(`Failed login attempt for email: ${email}`, {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        timestamp: new Date().toISOString(),
      });

      throw new ApiError(401, "Invalid login credentials");
    }

    // Generate secure tokens - NO EXPIRY (valid until logout)
    const accessToken = generateToken(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
      // No expiry = token valid forever until logout
    );

    // Set secure cookie - NO EXPIRY
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: config.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
      // No maxAge = cookie valid until browser closes
    });

    // Log successful login
    console.log(`User logged in: ${user.email} (${user._id})`);

    // Return user data without password
    const userResponse = user.toObject({ getters: true });
    delete userResponse.password;

    // Return token only (no expiry)
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: userResponse,
      token: accessToken,
    });
  } catch (error) {
    // Log login errors
    console.error(`Login failed: ${error.message}`, {
      email: req.body.email,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    });

    next(error);
  }
});

// RefreshToken function removed - no longer needed with permanent tokens

export const GoogleLogin = async (req, res, next) => {
  try {
    const { name, email, avatar } = req.body;

    // Validate required fields
    if (!name || !email) {
      throw new ApiError(400, "Name and email are required");
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      const password = Math.random().toString(36).slice(-12);
      const hashedPassword = await bcryptjs.hash(password, 12);

      const newUser = new User({
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        avatar,
        role: "client", // Default role
        isActive: true,
        isAgeVerified: true, // Google users are pre-verified
        profileCompletion: 80, // Basic profile completion
      });

      user = await newUser.save();
      console.log(`✅ New Google user created: ${email}`);
    } else {
      console.log(`✅ Existing Google user logged in: ${email}`);
    }

    // Generate JWT token using config - NO EXPIRY (valid until logout)
    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      config.JWT_SECRET
      // No expiresIn = token valid forever until logout
    );

    // Set secure cookie with proper CORS settings - NO EXPIRY
    res.cookie("access_token", token, {
      httpOnly: false, // Allow JavaScript access
      secure: config.NODE_ENV === "production",
      sameSite: "lax", // Better CORS compatibility
      path: "/",
      // No maxAge = cookie valid until browser closes
      domain: config.NODE_ENV === "production" ? ".onrender.com" : undefined,
    });

    // Prepare user response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isAgeVerified: user.isAgeVerified,
      profileCompletion: user.profileCompletion,
      isActive: user.isActive,
    };

    // Fix URLs for media files
    const userWithFixedUrls = fixUrlsInObject(userResponse);

    console.log(`✅ Google login successful for: ${email}`);

    return res.status(200).json({
      success: true,
      user: userWithFixedUrls,
      token: token,
      message: "Google login successful",
    });
  } catch (error) {
    console.error("❌ Google login error:", error);
    next(handleError(500, error.message));
  }
};

export const Logout = async (req, res, next) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    console.log("getCurrentUser called with user:", req.user);

    // req.user is set by the authenticate middleware
    const userId = req.user._id;

    // If it's a test user, return a mock response
    if (userId === "test_user_id") {
      console.log("Returning test user response");
      return res.status(200).json({
        success: true,
        user: {
          _id: "test_user_id",
          name: "Test User",
          email: "test@example.com",
          role: "client",
        },
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fix URLs for media files
    const userWithFixedUrls = fixUrlsInObject(user.toObject());

    res.status(200).json({
      success: true,
      user: userWithFixedUrls,
    });
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
