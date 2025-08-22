import React from "react";
import { Shield } from "lucide-react";
import { fixUrl } from "../utils/urlHelper";

const PremiumAvatar = ({
  src,
  alt,
  size = "w-32 h-32",
  showBadge = true,
  className = "",
  user = null,
  subscriptionTier = "basic",
  isVerified = false,
}) => {
  const isPremium =
    (user?.subscriptionTier === "premium" && user?.isVerified) ||
    (subscriptionTier === "premium" && isVerified);

  return (
    <div className={`relative ${className}`}>
      <img
        src={fixUrl(src) || "/default-escort.jpg"}
        alt={alt || "Avatar"}
        className={`${size} rounded-full object-cover border-4 border-white shadow-lg`}
        style={
          isPremium
            ? {
                border: "4px solid white",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                background: "linear-gradient(45deg, #8b5cf6, #a855f7, #c084fc)",
                padding: "4px",
                borderRadius: "50%",
                backgroundClip: "padding-box",
              }
            : {}
        }
      />

      {/* Verified badge for Premium users */}
      {isPremium && showBadge && (
        <div className="absolute bottom-4 -right-1">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <Shield className="h-6 w-6 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumAvatar;
