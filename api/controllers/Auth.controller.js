import { handleError } from "../helpers/handleError.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
export const Register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const checkuser = await User.findOne({ email });
    if (checkuser) {
      // user already registered
      next(handleError(409, "User already registered."));
    }

    const hashedPassword = bcryptjs.hashSync(password);
    // register user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate token for the newly registered user
    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      "88fe387324347ce1cd8213b17241b52c204d4170800170770a305968db3e04ca"
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });

    const newUser = user.toObject({ getters: true });
    delete newUser.password;
    res.status(200).json({
      success: true,
      user: newUser,
      token: token,
      message: "Registration successful.",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

export const Login = async (req, res, next) => {
  try {
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      next(handleError(404, "Invalid login credentials."));
    }
    const hashedPassword = user.password;

    const comparePassword = bcryptjs.compare(password, hashedPassword);
    if (!comparePassword) {
      next(handleError(404, "Invalid login credentials."));
    }

    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      "88fe387324347ce1cd8213b17241b52c204d4170800170770a305968db3e04ca"
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });

    const newUser = user.toObject({ getters: true });
    delete newUser.password;
    res.status(200).json({
      success: true,
      user: newUser,
      token: token,
      message: "Login successful.",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

export const GoogleLogin = async (req, res, next) => {
  try {
    const { name, email, avatar } = req.body;
    let user;
    user = await User.findOne({ email });
    if (!user) {
      //  create new user
      const password = Math.random().toString();
      const hashedPassword = bcryptjs.hashSync(password);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        avatar,
      });

      user = await newUser.save();
    }

    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      "88fe387324347ce1cd8213b17241b52c204d4170800170770a305968db3e04ca"
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });

    const newUser = user.toObject({ getters: true });
    delete newUser.password;
    res.status(200).json({
      success: true,
      user: newUser,
      token: token,
      message: "Login successful.",
    });
  } catch (error) {
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

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
