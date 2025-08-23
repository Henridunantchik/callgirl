import React, { useState, useRef, useEffect } from "react";
import { Loader2, Image as ImageIcon } from "lucide-react";

const ImageOptimizer = ({
  src,
  alt,
  className = "",
  fallbackSrc = "/placeholder-image.jpg",
  loading = "lazy",
  onLoad,
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // Intersection Observer for lazy loading
    if (loading === "lazy" && imgRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observerRef.current?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      observerRef.current.observe(imgRef.current);
    } else {
      setIsInView(true);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading]);

  useEffect(() => {
    if (src !== imageSrc) {
      setImageSrc(src);
      setIsLoading(true);
      setError(false);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);

    // Try fallback image
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setIsLoading(true);
    }

    onError?.();
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(false);
    setImageSrc(src);
  };

  if (!isInView && loading === "lazy") {
    return (
      <div
        ref={imgRef}
        className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}
        {...props}
      >
        <ImageIcon className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div
          className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}
        >
          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
        </div>
      )}

      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? "hidden" : ""} ${
          error ? "opacity-50" : ""
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
        {...props}
      />

      {error && (
        <div
          className={`${className} absolute inset-0 bg-gray-200 flex flex-col items-center justify-center`}
        >
          <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-xs text-gray-500 text-center">
            Failed to load image
          </p>
          <button
            onClick={handleRetry}
            className="mt-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageOptimizer;
