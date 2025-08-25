import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { FcGoogle } from "react-icons/fc";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth, provider } from "@/helpers/firebase";
import { RouteIndex } from "@/helpers/RouteName";
import { showToast } from "@/helpers/showToast";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/user/user.slice";
import { storeToken, storeUserData } from "@/helpers/storage";
import { authAPI } from "@/services/api";
import { store } from "@/store";

const GoogleLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Handle redirect result on component mount
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("🔄 Handling Google redirect result...");
          await processGoogleUser(result.user);
        }
      } catch (error) {
        console.error("❌ Error handling redirect result:", error);
        showToast("error", "Google login failed. Please try again.");
      }
    };

    handleRedirectResult();
  }, []);

  // Process Google user data
  const processGoogleUser = async (googleUser) => {
    try {
      const bodyData = {
        name: googleUser.displayName || googleUser.email.split("@")[0],
        email: googleUser.email,
        avatar: googleUser.photoURL || "",
      };

      console.log("📧 Processing Google user data:", bodyData.email);

      const response = await authAPI.googleLogin(bodyData);
      console.log("📦 Raw Google API response:", response);
      console.log("📦 Response data:", response.data);

      const { token, user: apiUser } = response.data;

      console.log("✅ Google login successful for:", apiUser.email);
      console.log("🔑 Token received:", token ? "Present" : "Missing");
      console.log("👤 User data:", apiUser);

      // Store user data in localStorage for AuthContext
      const tokenStored = storeToken(token);
      const userStored = storeUserData(apiUser);

      console.log("💾 Token stored:", tokenStored);
      console.log("💾 User stored:", userStored);
      console.log("🔍 localStorage after storage:");
      console.log("  - token:", localStorage.getItem("token"));
      console.log("  - user:", localStorage.getItem("user"));

      // Update Redux store
      dispatch(setUser(apiUser));

      // Force Redux to persist to sessionStorage
      console.log("🔄 Redux state after dispatch:", store.getState());

      // Navigate to home page
      navigate(RouteIndex);
      showToast("success", "Google login successful! Welcome back.");
    } catch (error) {
      console.error("❌ Error processing Google user:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Google login failed. Please try again.";
      showToast("error", errorMessage);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      console.log("🔐 Attempting Google login...");
      console.log("🔧 Firebase config check:", {
        apiKey: !!import.meta.env.VITE_FIREBASE_API,
        authDomain: "tusiwawasahau.firebaseapp.com",
        projectId: "tusiwawasahau",
      });

      // Try popup first, fallback to redirect if popup fails
      let googleResponse;
      try {
        console.log("🔄 Trying popup authentication...");
        googleResponse = await signInWithPopup(auth, provider);
        console.log("✅ Popup authentication successful");
      } catch (popupError) {
        console.log("⚠️ Popup failed, error details:", {
          code: popupError.code,
          message: popupError.message,
          email: popupError.email,
        });

        if (
          popupError.code === "auth/popup-blocked" ||
          popupError.code === "auth/popup-closed-by-user" ||
          popupError.code === "auth/internal-error"
        ) {
          console.log("🔄 Fallback to redirect authentication...");
          // Fallback to redirect
          await signInWithRedirect(auth, provider);
          return; // Redirect will handle the rest
        }
        throw popupError;
      }

      const user = googleResponse.user;
      console.log("✅ Google authentication successful:", user.email);

      await processGoogleUser(user);
    } catch (error) {
      console.error("❌ Google login failed:", error);

      let errorMessage = "Google login failed. Please try again.";

      if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup blocked. Please allow popups and try again.";
      } else if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Login cancelled. Please try again.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.code === "auth/internal-error") {
        errorMessage = "Firebase configuration error. Please contact support.";
        console.error("🚨 Firebase config error - check domain settings");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showToast("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleLogin}
      disabled={isLoading}
    >
      <FcGoogle />
      {isLoading ? "Signing In..." : "Continue With Google"}
    </Button>
  );
};

export default GoogleLogin;
