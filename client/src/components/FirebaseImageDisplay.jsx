import React, { useState, useEffect } from "react";
import { Image, Video, File } from "lucide-react";
import { getBaseUrl } from "../utils/urlHelper";

const FirebaseImageDisplay = ({
  src,
  alt,
  className = "",
  fallbackSrc = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzVMMTI1IDEwMEgxNzVMMTUwIDc1SDEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAxMjVMMTI1IDEwMEgxNzVMMTUwIDEyNUgxMDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPkltYWdlPC90ZXh0Pgo8L3N2Zz4K",
  type = "image", // "image", "video", "file"
  showFallbackIcon = true,
  onClick,
  children,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setImageSrc(fallbackSrc);
      setLoading(false);
      return;
    }

    setError(false);

    // Handle different URL formats
    let processedSrc = src;

    // For Railway, backend already returns absolute URLs; use as-is
    if (src.startsWith("https://") || src.startsWith("http://")) {
      // Check if it's a localhost URL and we're in production
      if (src.includes("localhost:5000") && !import.meta.env.DEV) {
        // Replace localhost with production URL
        const baseUrl = getBaseUrl();
        processedSrc = src.replace("http://localhost:5000", baseUrl);
        console.log("🔄 Fixed localhost URL for production:", processedSrc);
      } else {
        processedSrc = src;
      }
    } else if (src.startsWith("/")) {
      // Handle relative paths - try to construct full URL
      const baseUrl = getBaseUrl();
      processedSrc = `${baseUrl}${src}`;
    } else {
      // If it's just a filename or path, try to use it directly
      processedSrc = src;
    }

    setImageSrc(processedSrc);
    setLoading(false);
  }, [src, fallbackSrc]);

  const handleImageError = () => {
    console.log("Image failed to load:", imageSrc);
    if (imageSrc !== fallbackSrc) {
      setError(true);
      setImageSrc(fallbackSrc);
    }
  };

  const handleImageLoad = () => {
    console.log("Image loaded successfully:", imageSrc);
    setError(false);
  };

  const handleClick = () => {
    if (onClick) {
      onClick(imageSrc);
    }
  };

  // Affichage selon le type de média
  if (type === "video") {
    return (
      <div className={`relative ${className}`} {...props}>
        {loading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center">
            <Video className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {!loading && imageSrc && (
          <video
            src={imageSrc}
            alt={alt}
            className={`w-full h-full object-cover ${
              onClick ? "cursor-pointer" : ""
            }`}
            onClick={handleClick}
            controls
            onError={handleImageError}
          />
        )}

        {error && showFallbackIcon && (
          <div className="absolute inset-0 bg-gray-200 rounded flex items-center justify-center">
            <Video className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {children}
      </div>
    );
  }

  if (type === "file") {
    return (
      <div className={`relative ${className}`} {...props}>
        {loading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center">
            <File className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {!loading && imageSrc && (
          <a
            href={imageSrc}
            target="_blank"
            rel="noopener noreferrer"
            className={`block w-full h-full ${onClick ? "cursor-pointer" : ""}`}
            onClick={handleClick}
          >
            <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
              <File className="w-8 h-8 text-gray-400" />
              <span className="ml-2 text-sm text-gray-600">Document</span>
            </div>
          </a>
        )}

        {error && showFallbackIcon && (
          <div className="absolute inset-0 bg-gray-200 rounded flex items-center justify-center">
            <File className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {children}
      </div>
    );
  }

  // Par défaut, affichage d'image
  return (
    <div className={`relative ${className}`} {...props}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center">
          <Image className="w-8 h-8 text-gray-400" />
        </div>
      )}

      {!loading && imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover ${
            onClick ? "cursor-pointer" : ""
          }`}
          onClick={handleClick}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}

      {error && showFallbackIcon && (
        <div className="absolute inset-0 bg-gray-200 rounded flex items-center justify-center">
          <Image className="w-8 h-8 text-gray-400" />
        </div>
      )}

      {children}
    </div>
  );
};

export default FirebaseImageDisplay;
