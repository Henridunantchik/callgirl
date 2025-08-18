// Helper function to extract essential user data for localStorage
export const getEssentialUserData = (user) => {
  if (!user) return null;

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    alias: user.alias,
    age: user.age,
    gender: user.gender,
    phone: user.phone,
    avatar: user.avatar,
    // Only store basic location info, not full location object
    city: user.location?.city,
    subLocation: user.location?.subLocation,
    // Only store basic rates info
    hourlyRate: user.rates?.hourly,
    // Don't store large arrays in localStorage
    // gallery: user.gallery,
    // videos: user.videos,
    // services: user.services,
    // languages: user.languages,
    // Store only essential profile fields
    bio: user.bio,
    bodyType: user.bodyType,
    ethnicity: user.ethnicity,
    height: user.height,
    weight: user.weight,
    hairColor: user.hairColor,
    eyeColor: user.eyeColor,
    experience: user.experience,
    isVerified: user.isVerified,
    isActive: user.isActive,
    subscriptionTier: user.subscriptionTier,
    subscriptionStatus: user.subscriptionStatus,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// Safe localStorage setItem with error handling
export const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to store ${key} in localStorage:`, error);

    // If it's a quota exceeded error, try to clear some space
    if (error.name === "QuotaExceededError") {
      console.warn(
        "localStorage quota exceeded, attempting to clear old data..."
      );

      // Try to clear some non-essential items
      const keysToRemove = ["tempData", "cache", "oldUserData"];
      keysToRemove.forEach((keyToRemove) => {
        try {
          localStorage.removeItem(keyToRemove);
        } catch (e) {
          // Ignore errors when removing items
        }
      });

      // Try again after clearing
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (retryError) {
        console.error("Still failed after clearing space:", retryError);
        return false;
      }
    }

    return false;
  }
};

// Safe localStorage getItem with error handling
export const safeGetItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Failed to retrieve ${key} from localStorage:`, error);
    return null;
  }
};

// Store user data safely
export const storeUserData = (user) => {
  const essentialData = getEssentialUserData(user);
  return safeSetItem("user", essentialData);
};

// Store token safely
export const storeToken = (token) => {
  try {
    localStorage.setItem("token", token);
    return true;
  } catch (error) {
    console.error("Failed to store token in localStorage:", error);
    return false;
  }
};
