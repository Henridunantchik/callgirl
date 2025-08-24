import React, { useState } from "react";
import { ImageIcon, RefreshCw } from "lucide-react";

const ImageWithFallback = ({
  src,
  alt,
  className = "",
  fallbackSrc = "/placeholder-image.jpg",
  onError,
  onLoad,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = 3;

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);

    // Try fallback image if we haven't exceeded retry limit
    if (retryCount < maxRetries) {
      if (imageSrc !== fallbackSrc) {
        setImageSrc(fallbackSrc);
        setRetryCount((prev) => prev + 1);
        setIsLoading(true);
      } else {
        // Even fallback failed, show error state
        onError?.();
      }
    } else {
      onError?.();
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setHasError(false);
    setIsLoading(true);
    setImageSrc(src); // Reset to original source
  };

  // Update image source when prop changes
  React.useEffect(() => {
    if (src !== imageSrc) {
      setImageSrc(src);
      setRetryCount(0);
      setHasError(false);
      setIsLoading(true);
    }
  }, [src, imageSrc]);

  if (isLoading) {
    return (
      <div
        className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}
        {...props}
      >
        <ImageIcon className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  if (hasError && retryCount >= maxRetries) {
    return (
      <div
        className={`${className} bg-gray-100 flex flex-col items-center justify-center text-center p-4`}
        {...props}
      >
        <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 mb-2">Failed to load image</p>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

export default ImageWithFallback;
