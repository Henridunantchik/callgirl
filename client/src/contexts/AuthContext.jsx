import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, userAPI } from "../services/api";

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
  const [onlineStatusInterval, setOnlineStatusInterval] = useState(null);

  // Import Redux store to sync with AuthContext
  const reduxStore = window.__REDUX_STORE__;

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check multiple possible key names for token and user
        const token =
          localStorage.getItem("token") || localStorage.getItem("auth");
        const storedUser =
          localStorage.getItem("user") || localStorage.getItem("authUser");

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
          console.log(
            "✅ Using Redux user data since localStorage user is missing"
          );
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

              // Start online status updates for authenticated users
              startOnlineStatusUpdates();
            } catch (error) {
              console.error(
                "Server auth check failed, using stored data:",
                error
              );
              // Keep using stored data if server check fails
              // Still start online status updates
              startOnlineStatusUpdates();
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

          // Check Redux store as final fallback
          if (reduxStore) {
            const reduxState = reduxStore.getState();
            const reduxUser = reduxState.user;
            console.log("🔍 Redux store state:", reduxState);
            console.log("🔍 Redux user:", reduxUser);

            if (reduxUser && reduxUser.isLoggedIn && reduxUser.user) {
              console.log("✅ Using Redux user as fallback");
              setUser(reduxUser.user);
              localStorage.setItem("user", JSON.stringify(reduxUser.user));
              return;
            }
          }

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

  // Function to start online status updates
  const startOnlineStatusUpdates = () => {
    console.log("🚀 Starting online status updates...");
    console.log("Current user:", user);
    console.log("User role:", user?.role);

    // Clear any existing interval
    if (onlineStatusInterval) {
      clearInterval(onlineStatusInterval);
      console.log("🧹 Cleared existing interval");
    }

    // Update online status immediately
    console.log("📡 Updating online status immediately...");
    updateOnlineStatus();

    // Set up interval to update online status every 30 seconds
    const interval = setInterval(() => {
      console.log("⏰ Interval triggered - updating online status...");
      updateOnlineStatus();
    }, 30 * 1000);
    setOnlineStatusInterval(interval);

    console.log(
      "🟢 Online status updates started - interval set to 30 seconds"
    );
  };

  // Function to update online status
  const updateOnlineStatus = async () => {
    console.log("🔄 updateOnlineStatus called");
    try {
      console.log("📡 Calling userAPI.updateOnlineStatus()...");
      const response = await userAPI.updateOnlineStatus();
      console.log("✅ Online status updated successfully:", response);
    } catch (error) {
      console.error("❌ Failed to update online status:", error);
      console.error("Error details:", error.response?.data || error.message);
    }
  };

  // Check age verification status
  useEffect(() => {
    const verified = localStorage.getItem("ageVerified") === "true";
    setAgeVerified(verified);
  }, []);

  // Sync with Redux store changes
  useEffect(() => {
    if (!reduxStore) return;

    const unsubscribe = reduxStore.subscribe(() => {
      const reduxState = reduxStore.getState();
      const reduxUser = reduxState.user;

      if (reduxUser && reduxUser.isLoggedIn && reduxUser.user) {
        // Update AuthContext if Redux has user but AuthContext doesn't
        if (!user || user._id !== reduxUser.user._id) {
          console.log("🔄 Syncing AuthContext with Redux user");
          setUser(reduxUser.user);
          localStorage.setItem("user", JSON.stringify(reduxUser.user));
        }
      } else if (reduxUser && !reduxUser.isLoggedIn && user) {
        // Clear AuthContext if Redux user is logged out
        console.log("🔄 Clearing AuthContext - Redux user logged out");
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    });

    return unsubscribe;
  }, [reduxStore, user]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;

      // Start online status updates after login
      startOnlineStatusUpdates();

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
      // Clear online status interval
      if (onlineStatusInterval) {
        clearInterval(onlineStatusInterval);
        setOnlineStatusInterval(null);
      }

      // Mark user as offline
      try {
        await userAPI.markOffline();
      } catch (error) {
        console.error("Failed to mark user as offline:", error);
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  // Helper function to get user ID consistently
  const getUserId = (userObj) => {
    console.log("=== getUserId DEBUG ===");
    console.log("Input userObj:", userObj);
    console.log("userObj._id:", userObj?._id);
    console.log("userObj.id:", userObj?.id);
    console.log("userObj.user:", userObj?.user);
    console.log("userObj.user._id:", userObj?.user?._id);
    console.log("userObj.user.id:", userObj?.user?.id);

    if (!userObj) return null;
    const userId =
      userObj._id ||
      userObj.id ||
      (userObj.user && (userObj.user._id || userObj.user.id));
    console.log("Final userId:", userId);
    return userId;
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (onlineStatusInterval) {
        clearInterval(onlineStatusInterval);
      }
    };
  }, [onlineStatusInterval]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
