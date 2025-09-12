import React from "react";
import { Button } from "./ui/button";
import { Camera, Video, Plus, Lock } from "lucide-react";
import {
  canUploadMorePhotos,
  canUploadMoreVideos,
  isAtUploadLimit,
} from "../utils/uploadLimits";

const UploadButton = ({
  type = "photos", // "photos" or "videos"
  escort,
  onUpload,
  className = "",
  size = "default",
}) => {
  if (!escort) return null;

  const canUpload =
    type === "photos"
      ? canUploadMorePhotos(escort)
      : canUploadMoreVideos(escort);

  const isAtLimit = isAtUploadLimit(escort, type);

  const Icon = type === "photos" ? Camera : Video;
  const label = type === "photos" ? "Add Photo" : "Add Video";

  if (isAtLimit) {
    return (
      <Button
        disabled
        variant="outline"
        size={size}
        className={`${className} opacity-50 cursor-not-allowed`}
      >
        <Lock className="h-4 w-4 mr-2" />
        {label} (Limit Reached)
      </Button>
    );
  }

  return (
    <Button
      onClick={onUpload}
      variant="outline"
      size={size}
      className={`${className} hover:bg-blue-50 hover:border-blue-300`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};

export default UploadButton;
