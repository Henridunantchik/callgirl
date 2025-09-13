/**
 * Chat permissions based on subscription tier
 * Business strategy: Only Premium users can send/receive photos with other users
 * Basic/Featured can only send/receive photos with Admin
 */

// Check if user can send photos in chat
export const canSendPhotos = (user, recipient) => {
  if (!user) return false;

  // Admin can always send photos
  if (user.role === "admin") return true;

  // Premium users can send photos to anyone
  if (user.subscriptionTier === "premium") return true;

  // Basic/Featured escorts can only send photos to Admin
  if (
    user.subscriptionTier === "basic" ||
    user.subscriptionTier === "featured"
  ) {
    // Check if recipient is admin by role, email, or specific admin ID
    const isAdmin =
      recipient?.role === "admin" ||
      recipient?.email === "congogenocidememorial@gmail.com" ||
      recipient?._id === "67bb7464ac51a7a6674dca42" ||
      recipient?.name === "Admin";
    return isAdmin;
  }

  // Clients (no subscriptionTier or role === "client") can only send photos to Premium escorts and Admin
  if (user.role === "client" || !user.subscriptionTier) {
    const isAdmin =
      recipient?.role === "admin" ||
      recipient?.email === "congogenocidememorial@gmail.com" ||
      recipient?._id === "67bb7464ac51a7a6674dca42" ||
      recipient?.name === "Admin";
    return isAdmin || recipient?.subscriptionTier === "premium";
  }

  return false;
};

// Check if user can receive photos in chat
export const canReceivePhotos = (user, sender) => {
  if (!user) return false;

  // Admin can always receive photos
  if (user.role === "admin") return true;

  // Premium users can receive photos from anyone
  if (user.subscriptionTier === "premium") return true;

  // Basic/Featured escorts can only receive photos from Admin
  if (
    user.subscriptionTier === "basic" ||
    user.subscriptionTier === "featured"
  ) {
    // Check if sender is admin by role, email, or specific admin ID
    const isAdmin =
      sender?.role === "admin" ||
      sender?.email === "congogenocidememorial@gmail.com" ||
      sender?._id === "67bb7464ac51a7a6674dca42" ||
      sender?.name === "Admin";
    return isAdmin;
  }

  // Clients (no subscriptionTier or role === "client") can only receive photos from Premium escorts and Admin
  if (user.role === "client" || !user.subscriptionTier) {
    const isAdmin =
      sender?.role === "admin" ||
      sender?.email === "congogenocidememorial@gmail.com" ||
      sender?._id === "67bb7464ac51a7a6674dca42" ||
      sender?.name === "Admin";
    return isAdmin || sender?.subscriptionTier === "premium";
  }

  return false;
};

// Check if user can see photo upload button
export const canShowPhotoUpload = (user, recipient) => {
  return canSendPhotos(user, recipient);
};

// Check if user can display photos in chat
export const canDisplayPhotos = (user, sender) => {
  return canReceivePhotos(user, sender);
};

// Get photo restriction message
export const getPhotoRestrictionMessage = (user, recipient) => {
  if (!user) return "You need to be logged in to send photos";

  // Admin can always send photos
  if (user.role === "admin") return null;

  // Premium users can send photos to anyone
  if (user.subscriptionTier === "premium") return null;

  // Basic/Featured escorts
  if (
    user.subscriptionTier === "basic" ||
    user.subscriptionTier === "featured"
  ) {
    if (recipient?.role === "admin") {
      return null; // Can send to admin
    }

    return "Upgrade to Premium to send photos to other users";
  }

  // Clients (no subscriptionTier or role === "client")
  if (user.role === "client" || !user.subscriptionTier) {
    if (
      recipient?.role === "admin" ||
      recipient?.subscriptionTier === "premium"
    ) {
      return null; // Can send to admin or premium escorts
    }

    return "You can only send photos to Premium escorts";
  }

  return "You need a subscription to send photos";
};

// Check if user can send photos to specific recipient
export const canSendPhotosTo = (user, recipient) => {
  if (!user || !recipient) return false;

  // Admin can always send photos
  if (user.role === "admin") return true;

  // Premium users can send photos to anyone
  if (user.subscriptionTier === "premium") return true;

  // Basic/Featured escorts can only send photos to Admin
  if (
    user.subscriptionTier === "basic" ||
    user.subscriptionTier === "featured"
  ) {
    // Check if recipient is admin by role, email, or specific admin ID
    const isAdmin =
      recipient.role === "admin" ||
      recipient.email === "congogenocidememorial@gmail.com" ||
      recipient._id === "67bb7464ac51a7a6674dca42" ||
      recipient.name === "Admin";
    return isAdmin;
  }

  // Clients (no subscriptionTier or role === "client") can only send photos to Premium escorts and Admin
  if (user.role === "client" || !user.subscriptionTier) {
    const isAdmin =
      recipient.role === "admin" ||
      recipient.email === "congogenocidememorial@gmail.com" ||
      recipient._id === "67bb7464ac51a7a6674dca42" ||
      recipient.name === "Admin";
    return isAdmin || recipient.subscriptionTier === "premium";
  }

  return false;
};

// Get upgrade prompt for photo restrictions
export const getPhotoUpgradePrompt = (user) => {
  if (!user)
    return {
      title: "Login Required",
      message: "Please log in to send photos",
      showUpgrade: false,
    };

  if (user.role === "admin") return null;

  if (user.subscriptionTier === "premium") return null;

  if (
    user.subscriptionTier === "basic" ||
    user.subscriptionTier === "featured"
  ) {
    return {
      title: "Upgrade to Premium",
      message: "Send and receive photos with all users",
      showUpgrade: true,
      benefits: [
        "Send photos to any user",
        "Receive photos from any user",
        "Full chat functionality",
        "Premium features",
      ],
    };
  }

  return {
    title: "Subscription Required",
    message: "You need a subscription to send photos",
    showUpgrade: true,
  };
};
