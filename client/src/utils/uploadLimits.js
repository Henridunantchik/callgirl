/**
 * Upload limits and subscription tier utilities
 */

// Define upload limits for each subscription tier
export const UPLOAD_LIMITS = {
  basic: {
    photos: 0,
    videos: 0,
    label: "Basic",
    color: "bg-gray-500",
    badgeColor: "bg-gray-100 text-gray-800",
  },
  featured: {
    photos: 10,
    videos: 5,
    label: "Featured",
    color: "bg-blue-500",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  premium: {
    photos: 30,
    videos: 15,
    label: "Premium",
    color: "bg-purple-500",
    badgeColor: "bg-purple-100 text-purple-800",
  },
  elite: {
    photos: 50,
    videos: 25,
    label: "Elite",
    color: "bg-yellow-500",
    badgeColor: "bg-yellow-100 text-yellow-800",
  },
};

// Get upload limits for a subscription tier
export const getUploadLimits = (subscriptionTier) => {
  return UPLOAD_LIMITS[subscriptionTier] || UPLOAD_LIMITS.basic;
};

// Check if escort can upload more photos
export const canUploadMorePhotos = (escort) => {
  if (!escort) return false;
  const limits = getUploadLimits(escort.subscriptionTier);
  const currentPhotos = escort.gallery?.length || 0;
  return currentPhotos < limits.photos;
};

// Check if escort can upload more videos
export const canUploadMoreVideos = (escort) => {
  if (!escort) return false;
  const limits = getUploadLimits(escort.subscriptionTier);
  const currentVideos = escort.videos?.length || 0;
  return currentVideos < limits.videos;
};

// Get remaining photo uploads
export const getRemainingPhotos = (escort) => {
  if (!escort) return 0;
  const limits = getUploadLimits(escort.subscriptionTier);
  const currentPhotos = escort.gallery?.length || 0;
  return Math.max(0, limits.photos - currentPhotos);
};

// Get remaining video uploads
export const getRemainingVideos = (escort) => {
  if (!escort) return 0;
  const limits = getUploadLimits(escort.subscriptionTier);
  const currentVideos = escort.videos?.length || 0;
  return Math.max(0, limits.videos - currentVideos);
};

// Get next tier upgrade info
export const getNextTierUpgrade = (currentTier) => {
  const tiers = ["basic", "featured", "premium", "elite"];
  const currentIndex = tiers.indexOf(currentTier);

  if (currentIndex === -1 || currentIndex === tiers.length - 1) {
    return null; // Already at highest tier or invalid tier
  }

  const nextTier = tiers[currentIndex + 1];
  return {
    current: UPLOAD_LIMITS[currentTier],
    next: UPLOAD_LIMITS[nextTier],
    nextTier,
  };
};

// Check if escort is at upload limit
export const isAtUploadLimit = (escort, type = "photos") => {
  if (!escort) return true;

  if (type === "photos") {
    return !canUploadMorePhotos(escort);
  } else if (type === "videos") {
    return !canUploadMoreVideos(escort);
  }

  return true;
};

// Get upgrade benefits text
export const getUpgradeBenefits = (currentTier) => {
  const upgrade = getNextTierUpgrade(currentTier);
  if (!upgrade) return null;

  const benefits = [];

  if (upgrade.next.photos > upgrade.current.photos) {
    benefits.push(
      `${upgrade.next.photos - upgrade.current.photos} more photos`
    );
  }

  if (upgrade.next.videos > upgrade.current.videos) {
    benefits.push(
      `${upgrade.next.videos - upgrade.current.videos} more videos`
    );
  }

  return {
    nextTier: upgrade.nextTier,
    benefits,
    current: upgrade.current,
    next: upgrade.next,
  };
};
