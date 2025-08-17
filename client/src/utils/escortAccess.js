/**
 * Utility functions to check escort access levels and permissions
 */

// Check if escort has premium access (Featured or Premium subscription)
export const hasPremiumAccess = (escort) => {
  if (!escort) return false;

  // Check subscription tier
  const hasPremiumTier =
    escort.subscriptionTier === "premium" ||
    escort.subscriptionTier === "elite";

  // Check if featured
  const isFeatured = escort.isFeatured === true;

  // Only premium/elite tiers or featured escorts have premium access
  // subscriptionStatus "active" alone is not enough (all escorts have this by default)
  return hasPremiumTier || isFeatured;
};

// Check if escort can show contact information
export const canShowContactInfo = (escort) => {
  return hasPremiumAccess(escort);
};

// Check if escort can show detailed information
export const canShowDetailedInfo = (escort) => {
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

// Check if escort can show stats
export const canShowStats = (escort) => {
  return hasPremiumAccess(escort);
};

// Get escort access level for display
export const getEscortAccessLevel = (escort) => {
  if (!escort) return "basic";

  if (escort.subscriptionTier === "elite") return "elite";
  if (escort.subscriptionTier === "premium") return "premium";
  if (escort.isFeatured) return "featured";
  if (escort.subscriptionTier === "verified") return "verified";

  return "basic";
};

// Get access level badge color
export const getAccessLevelBadgeColor = (level) => {
  const colors = {
    elite: "bg-gradient-to-r from-yellow-500 to-orange-500",
    premium: "bg-gradient-to-r from-purple-500 to-pink-500",
    featured: "bg-gradient-to-r from-blue-500 to-cyan-500",
    verified: "bg-gradient-to-r from-green-500 to-emerald-500",
    basic: "bg-gradient-to-r from-gray-500 to-gray-600",
  };

  return colors[level] || colors.basic;
};

// Get access level label
export const getAccessLevelLabel = (level) => {
  const labels = {
    elite: "Elite",
    premium: "Premium",
    featured: "Featured",
    verified: "Verified",
    basic: "Basic",
  };

  return labels[level] || "Basic";
};
