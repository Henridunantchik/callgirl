import React, { useState } from "react";
import { Button } from "./ui/button";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/helpers/firebase";
import { RouteIndex } from "@/helpers/RouteName";
import { showToast } from "@/helpers/showToast";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/user/user.slice";
import { storeToken, storeUserData } from "@/helpers/storage";
import { authAPI } from "@/services/api";

const GoogleLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      console.log("🔐 Attempting Google login...");
      
      const googleResponse = await signInWithPopup(auth, provider);
      const user = googleResponse.user;
      
      const bodyData = {
        name: user.displayName,
        email: user.email,
        avatar: user.photoURL,
      };
      
      console.log("📧 Google user data:", bodyData.email);
      
      const response = await authAPI.googleLogin(bodyData);
      const { token, user: apiUser } = response.data;

      console.log("✅ Google login successful for:", apiUser.email);

      // Store user data in localStorage for AuthContext
      storeToken(token);
      storeUserData(apiUser);

      // Update Redux store
      dispatch(setUser(apiUser));
      
      // Navigate to home page
      navigate(RouteIndex);
      showToast("success", "Google login successful! Welcome back.");
    } catch (error) {
      console.error("❌ Google login failed:", error);
      const errorMessage = error.response?.data?.message || "Google login failed. Please try again.";
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
