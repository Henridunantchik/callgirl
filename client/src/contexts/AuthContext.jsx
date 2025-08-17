import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ageVerified, setAgeVerified] = useState(false);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check multiple possible key names for token and user
        const token = localStorage.getItem("token") || localStorage.getItem("auth");
        const storedUser = localStorage.getItem("user") || localStorage.getItem("authUser");

        console.log("=== AUTH CONTEXT DEBUG ===");
        console.log("Token:", token ? "Present" : "Missing");
        console.log("Stored user:", storedUser ? "Present" : "Missing");
        console.log("Raw token value:", token);
        console.log("Raw stored user value:", storedUser);
        console.log("All localStorage keys:", Object.keys(localStorage));
        console.log("All sessionStorage keys:", Object.keys(sessionStorage));
        
        // Debug: Check what's in the 'auth' key
        const authKey = localStorage.getItem("auth");
        console.log("🔍 'auth' key content:", authKey);
        if (authKey) {
          try {
            const parsedAuth = JSON.parse(authKey);
            console.log("🔍 Parsed 'auth' content:", parsedAuth);
          } catch (e) {
            console.log("🔍 'auth' is not JSON:", authKey);
          }
        }

        // Check Redux persisted data in sessionStorage
        const reduxData = sessionStorage.getItem("persist:root");
        console.log("🔍 Redux persisted data:", reduxData);
        let reduxUser = null;
        if (reduxData) {
          try {
            const parsedRedux = JSON.parse(reduxData);
            console.log("🔍 Parsed Redux data:", parsedRedux);
            if (parsedRedux.user) {
              const userData = JSON.parse(parsedRedux.user);
              console.log("🔍 Redux user data:", userData);
              if (userData.isLoggedIn && userData.user) {
                reduxUser = userData.user;
              }
            }
          } catch (e) {
            console.log("🔍 Redux data is not JSON:", reduxData);
          }
        }

        // If we have a token but no stored user, try to use Redux user
        if (token && !storedUser && reduxUser) {
          console.log("✅ Using Redux user data since localStorage user is missing");
          setUser(reduxUser);
          // Store the user data in localStorage for consistency
          localStorage.setItem("user", JSON.stringify(reduxUser));
          setLoading(false);
          return;
        }

        if (token && storedUser) {
          try {
            // Parse stored user data first
            const parsedUser = JSON.parse(storedUser);
            console.log("✅ Successfully parsed user data:", parsedUser);
            setUser(parsedUser);
            
            // Try to get fresh user data from server (optional)
            try {
              console.log("Attempting to get fresh user data...");
              const response = await authAPI.getCurrentUser();
              console.log("Fresh user data received:", response.data.user);
              setUser(response.data.user);
              localStorage.setItem("user", JSON.stringify(response.data.user));
            } catch (error) {
              console.error(
                "Server auth check failed, using stored data:",
                error
              );
              // Keep using stored data if server check fails
            }
          } catch (parseError) {
            console.error("❌ Error parsing stored user:", parseError);
            console.error("Raw stored user value:", storedUser);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
          }
        } else if (token && reduxUser) {
          // Use Redux user data if available
          console.log("✅ Using Redux user data");
          setUser(reduxUser);
          localStorage.setItem("user", JSON.stringify(reduxUser));
        } else {
          console.log("❌ No token or stored user found");
          console.log("Token exists:", !!token);
          console.log("Stored user exists:", !!storedUser);
          console.log("Redux user exists:", !!reduxUser);
          setUser(null);
        }
      } catch (error) {
        console.error("❌ Auth check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Check age verification status
  useEffect(() => {
    const verified = localStorage.getItem("ageVerified") === "true";
    setAgeVerified(verified);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  // Helper function to get user ID consistently
  const getUserId = (userObj) => {
    if (!userObj) return null;
    return userObj._id || userObj.id || (userObj.user && (userObj.user._id || userObj.user.id));
  };

  const verifyAge = async () => {
    try {
      await authAPI.verifyAge();
      localStorage.setItem("ageVerified", "true");
      setAgeVerified(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Age verification failed",
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Password reset failed",
      };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await authAPI.resetPassword(token, password);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Password reset failed",
      };
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem("token");
  };

  const isEscort = () => {
    return user?.role === "escort";
  };

  const isClient = () => {
    return user?.role === "client";
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const value = {
    user,
    loading,
    ageVerified,
    login,
    register,
    logout,
    verifyAge,
    forgotPassword,
    resetPassword,
    updateUser,
    isAuthenticated,
    isEscort,
    isClient,
    isAdmin,
    getUserId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
