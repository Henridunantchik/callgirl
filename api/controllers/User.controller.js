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

    const data = req.body; // Use req.body directly instead of parsing JSON
    const authenticatedUserId = req.user._id;

    const user = await User.findById(authenticatedUserId);

    // Basic fields for all users
    user.name = data.name;
    user.email = data.email;
    user.bio = data.bio;
    user.phone = data.phone;

    // Escort-specific fields
    if (user.role === "escort") {
      user.alias = data.alias;
      user.age = data.age;
      user.gender = data.gender;
      user.height = data.height;
      user.weight = data.weight;
      user.bodyType = data.bodyType;
      user.ethnicity = data.ethnicity;
      user.hairColor = data.hairColor;
      user.eyeColor = data.eyeColor;
      user.experience = data.experience;
      user.services = data.services || [];

      // Location
      if (!user.location) user.location = {};
      user.location.city = data.location?.city;
      user.location.subLocation = data.location?.subLocation;

      // Rates
      if (!user.rates) user.rates = {};
      user.rates.hourly = data.rates?.hourly;
      
      // Pricing type
      user.isStandardPricing = data.isStandardPricing;
    }

    if (data.password && data.password.length >= 8) {
      const hashedPassword = bcryptjs.hashSync(data.password);
      user.password = hashedPassword;
    }

    if (req.file) {
      // Upload an image
      const uploadResult = await cloudinary.uploader
        .upload(req.file.path, {
          folder: "tusiwawasahau",
          resource_type: "auto",
        })
        .catch((error) => {
          next(handleError(500, error.message));
        });

      user.avatar = uploadResult.secure_url;
    }

    await user.save();

    const newUser = user.toObject({ getters: true });
    delete newUser.password;
    res.status(200).json({
      success: true,
      message: "Data updated.",
      user: newUser,
    });
  } catch (error) {
    next(handleError(500, error.message));
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
