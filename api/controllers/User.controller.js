import cloudinary from "../config/cloudinary.js";
import { handleError } from "../helpers/handleError.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";

export const getUser = async (req, res, next) => {
  try {
    console.log("=== GET USER DEBUG ===");
    console.log("Request params:", req.params);
    console.log("Authenticated user:", req.user);

    const { userid } = req.params;
    const authenticatedUserId = req.user._id;

    console.log("Requested user ID:", userid);
    console.log("Authenticated user ID:", authenticatedUserId);

    // Check if user is requesting their own data or is admin
    if (userid !== authenticatedUserId && req.user.role !== "admin") {
      console.log("Access denied - user can only access their own data");
      return res.status(403).json({
        success: false,
        message: "Access denied - you can only access your own profile",
      });
    }

    const user = await User.findOne({ _id: userid }).lean().exec();
    if (!user) {
      console.log("User not found:", userid);
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    console.log("User found:", user._id);
    res.status(200).json({
      success: true,
      message: "User data found.",
      user,
    });
  } catch (error) {
    console.error("Error in getUser:", error);
    next(handleError(500, error.message));
  }
};

export const updateUser = async (req, res, next) => {
  try {
    console.log("=== UPDATE USER DEBUG ===");
    console.log("Request body:", req.body);
    console.log("Authenticated user:", req.user);

    const data = req.body;
    const authenticatedUserId = req.user._id;

    const user = await User.findById(authenticatedUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("Updating user:", user._id);
    console.log("User role:", user.role);

    // Basic fields for all users (only update if provided)
    if (data.name !== undefined) user.name = data.name;
    if (data.email !== undefined) user.email = data.email;
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.phone !== undefined) user.phone = data.phone;

    // Escort-specific fields (only update if provided)
    if (user.role === "escort") {
      console.log("Updating escort-specific fields");

      if (data.alias !== undefined) user.alias = data.alias;
      if (data.age !== undefined) user.age = data.age;
      if (data.gender !== undefined) user.gender = data.gender;
      if (data.height !== undefined) user.height = data.height;
      if (data.weight !== undefined) user.weight = data.weight;
      if (data.bodyType !== undefined) user.bodyType = data.bodyType;
      if (data.ethnicity !== undefined) user.ethnicity = data.ethnicity;
      if (data.hairColor !== undefined) user.hairColor = data.hairColor;
      if (data.eyeColor !== undefined) user.eyeColor = data.eyeColor;
      if (data.experience !== undefined) user.experience = data.experience;
      if (data.services !== undefined) user.services = data.services || [];
      if (data.languages !== undefined) user.languages = data.languages || [];

      // Location (only update if provided)
      if (data.location) {
        if (!user.location) user.location = {};
        if (data.location.city !== undefined)
          user.location.city = data.location.city;
        if (data.location.subLocation !== undefined)
          user.location.subLocation = data.location.subLocation;
      }

      // Rates (only update if provided)
      if (data.rates) {
        if (!user.rates) user.rates = {};
        if (data.rates.hourly !== undefined)
          user.rates.hourly = data.rates.hourly;
      }

      // Pricing type
      if (data.isStandardPricing !== undefined)
        user.isStandardPricing = data.isStandardPricing;
    }

    // Password update (only if provided and valid)
    if (data.password && data.password.length >= 8) {
      const hashedPassword = bcryptjs.hashSync(data.password);
      user.password = hashedPassword;
    }

    // Avatar upload (if file provided)
    if (req.file) {
      console.log("Uploading avatar file");
      const uploadResult = await cloudinary.uploader
        .upload(req.file.path, {
          folder: "tusiwawasahau",
          resource_type: "auto",
        })
        .catch((error) => {
          console.error("Avatar upload error:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to upload avatar",
          });
        });

      user.avatar = uploadResult.secure_url;
    }

    console.log("Saving updated user...");
    await user.save();

    const newUser = user.toObject({ getters: true });
    delete newUser.password;

    console.log("User updated successfully");
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

export const getAllUser = async (req, res, next) => {
  try {
    const user = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Data deleted.",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
