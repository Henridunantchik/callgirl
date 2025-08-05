import express from "express";
import {
  GoogleLogin,
  Login,
  Logout,
  Register,
  getCurrentUser,
} from "../controllers/Auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const AuthRoute = express.Router();

AuthRoute.post("/register", Register);
AuthRoute.post("/login", Login);
AuthRoute.post("/google-login", GoogleLogin);
AuthRoute.get("/logout", Logout);
AuthRoute.get("/me", authenticate, getCurrentUser);

export default AuthRoute;
