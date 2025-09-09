import React, { useState } from "react";
import { Crown, Shield, Star, User } from "lucide-react";
import FirebaseImageDisplay from "./FirebaseImageDisplay";
import { Badge } from "./ui/badge";

const FirebasePremiumAvatar = ({
  src,
  alt,
  size = "w-16 h-16",
  showBadge = true,
  subscriptionTier = "basic",
  isVerified = false,
  className = "",
  onClick,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);

  const getSubscriptionIcon = (tier) => {
    switch (tier?.toLowerCase()) {
      case "premium":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "featured":
        return <Star className="w-4 h-4 text-blue-500" />;
      case "vip":
        return <Shield className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getSubscriptionColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case "premium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "featured":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "vip":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSubscriptionLabel = (tier) => {
    switch (tier?.toLowerCase()) {
      case "premium":
        return "Premium";
      case "featured":
        return "Featured";
      case "vip":
        return "VIP";
      default:
        return "Basic";
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`relative ${className}`} {...props}>
      {/* Avatar principal */}
      <div
        className={`${size} rounded-full overflow-hidden border-2 border-gray-200 ${
          onClick ? "cursor-pointer" : ""
        }`}
      >
        {!imageError && src ? (
          <FirebaseImageDisplay
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            fallbackSrc="/default-avatar.jpg"
            onError={handleImageError}
            onClick={onClick}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <User className="w-1/2 h-1/2 text-gray-400" />
          </div>
        )}
      </div>

      {/* Badge de vérification */}
      {isVerified && (
        <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
          <Shield className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Badge de subscription */}
      {showBadge && subscriptionTier && subscriptionTier !== "basic" && (
        <div className="absolute -bottom-1 -right-1">
          <Badge
            variant="outline"
            className={`text-xs px-2 py-1 border-2 ${getSubscriptionColor(
              subscriptionTier
            )}`}
          >
            <div className="flex items-center gap-1">
              {getSubscriptionIcon(subscriptionTier)}
              <span className="text-xs font-medium">
                {getSubscriptionLabel(subscriptionTier)}
              </span>
            </div>
          </Badge>
        </div>
      )}

      {/* Badge de niveau (optionnel) */}
      {subscriptionTier && (
        <div className="absolute -top-1 -left-1">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              subscriptionTier === "premium"
                ? "bg-yellow-500"
                : subscriptionTier === "featured"
                ? "bg-blue-500"
                : subscriptionTier === "vip"
                ? "bg-purple-500"
                : "bg-gray-500"
            }`}
          >
            {(subscriptionTier?.[0] || "B").toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
};

export default FirebasePremiumAvatar;
