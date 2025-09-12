/**
 * Utility functions to check escort access levels and permissions
 */

// Check if escort has premium access (Featured or Premium subscription)
export const hasPremiumAccess = (escort) => {
  if (!escort) return false;

  // Check subscription tier - only featured and premium have premium access
  const hasPremiumTier =
    escort.subscriptionTier === "featured" ||
    escort.subscriptionTier === "premium";

  return hasPremiumTier;
};

// Check if escort can show contact information
export const canShowContactInfo = (escort) => {
  // Contact info should be visible for premium escorts only
  return hasPremiumAccess(escort);
};

// Check if escort can show reviews
export const canShowReviews = (escort) => {
  return hasPremiumAccess(escort);
};

// Check if escort can show rates
export const canShowRates = (escort) => {
  return hasPremiumAccess(escort);
};

// Check if escort can show services
export const canShowServices = (escort) => {
  return hasPremiumAccess(escort);
};

// Check if escort can show about section
export const canShowAbout = (escort) => {
  return hasPremiumAccess(escort);
};

// Check if escort photos can be displayed (business strategy: only for premium users)
export const canShowPhotos = (escort) => {
  // Photos should only be visible to premium users to encourage upgrades
  return hasPremiumAccess(escort);
};

// Check if escort basic info can be displayed (name, age, city - always visible)
export const canShowBasicInfo = (escort) => {
  // Basic info should always be visible to attract users
  return true;
};

// Check if escort detailed info can be displayed (services, personal details, etc.)
export const canShowDetailedInfo = (escort) => {
  // Detailed info should only be visible to premium users
  return hasPremiumAccess(escort);
};

// Check if escort can show stats
export const canShowStats = (escort) => {
  return hasPremiumAccess(escort);
};

// Get escort access level for display
export const getEscortAccessLevel = (escort) => {
  if (!escort) return "basic";

  if (escort.subscriptionTier === "premium") return "premium";
  if (escort.subscriptionTier === "featured") return "featured";

  return "basic";
};

// Get access level badge color
export const getAccessLevelBadgeColor = (level) => {
  const colors = {
    premium: "bg-gradient-to-r from-purple-500 to-pink-500",
    featured: "bg-gradient-to-r from-blue-500 to-cyan-500",
    basic: "bg-gradient-to-r from-gray-500 to-gray-600",
  };

  return colors[level] || colors.basic;
};

// Get access level label
export const getAccessLevelLabel = (level) => {
  const labels = {
    premium: "Premium",
    featured: "Featured",
    basic: "Basic",
  };

  return labels[level] || "Basic";
};
