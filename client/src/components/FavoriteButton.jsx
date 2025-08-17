import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Heart, Loader2 } from "lucide-react";
import { favoriteAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../helpers/showToast";

const FavoriteButton = ({
  escortId,
  size = "sm",
  variant = "ghost",
  className = "",
  onFavoriteToggle,
}) => {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if escort is favorited on mount
  useEffect(() => {
    if (user && escortId) {
      checkFavoriteStatus();
    } else {
      setChecking(false);
    }
  }, [user, escortId]);

  const checkFavoriteStatus = async () => {
    try {
      setChecking(true);
      const response = await favoriteAPI.isFavorited(escortId);
      setIsFavorited(response.data.data.isFavorited);
    } catch (error) {
      console.error("Error checking favorite status:", error);
      setIsFavorited(false);
    } finally {
      setChecking(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      showToast("error", "Please sign in to add favorites");
      return;
    }

    try {
      setLoading(true);
      if (isFavorited) {
        await favoriteAPI.removeFromFavorites(escortId);
        setIsFavorited(false);
        showToast("success", "Removed from favorites");
      } else {
        await favoriteAPI.addToFavorites(escortId);
        setIsFavorited(true);
        showToast("success", "Added to favorites");
      }
      
      // Call the callback to update escort stats
      if (onFavoriteToggle) {
        onFavoriteToggle();
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      showToast(
        "error",
        error.response?.data?.message || "Failed to update favorites"
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Button size={size} variant={variant} className={className} disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      className={`${className} ${
        isFavorited
          ? "text-red-500 hover:text-red-600"
          : "text-gray-500 hover:text-red-500"
      }`}
      onClick={toggleFavorite}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
      )}
    </Button>
  );
};

export default FavoriteButton;
