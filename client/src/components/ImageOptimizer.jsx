import React, { useState, useRef, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";

// High-performance image optimizer with unlimited scalability
const ImageOptimizer = ({
  src,
  alt = "",
  className = "",
  width = "auto",
  height = "auto",
  quality = 80,
  format = "auto",
  lazy = true,
  placeholder = "/placeholder-image.jpg",
  fallback = "/placeholder-image.jpg",
  onLoad,
  onError,
  priority = false,
  sizes = "100vw",
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const imgRef = useRef(null);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: "50px",
  });

  // Optimize image URL with CDN parameters
  const optimizeImageUrl = useCallback((url, options = {}) => {
    if (!url || url === placeholder || url === fallback) {
      return url;
    }

    try {
      const imageUrl = new URL(url);

      // Add optimization parameters
      if (options.quality) {
        imageUrl.searchParams.set("q", options.quality);
      }

      if (options.width) {
        imageUrl.searchParams.set("w", options.width);
      }

      if (options.height) {
        imageUrl.searchParams.set("h", options.height);
      }

      if (options.format && options.format !== "auto") {
        imageUrl.searchParams.set("f", options.format);
      }

      // Add WebP support for modern browsers
      if (options.format === "auto") {
        imageUrl.searchParams.set("fm", "webp");
      }

      // Add compression
      imageUrl.searchParams.set("compress", "true");

      return imageUrl.toString();
    } catch (error) {
      console.warn("Failed to optimize image URL:", error);
      return url;
    }
  }, []);

  // Load image with optimization
  const loadImage = useCallback(
    async (imageUrl) => {
      if (!imageUrl || imageUrl === placeholder) {
        return;
      }

      setIsLoading(true);
      setHasError(false);

      try {
        // Create optimized URL
        const optimizedUrl = optimizeImageUrl(imageUrl, {
          quality,
          width: width !== "auto" ? width : undefined,
          height: height !== "auto" ? height : undefined,
          format,
        });

        // Preload image
        const img = new Image();

        img.onload = () => {
          setImageSrc(optimizedUrl);
          setIsLoading(false);
          setIsLoaded(true);
          onLoad?.(img);
        };

        img.onerror = () => {
          console.warn(`Failed to load image: ${imageUrl}`);
          setHasError(true);
          setIsLoading(false);

          // Try fallback
          if (fallback && fallback !== imageUrl) {
            setImageSrc(fallback);
          }

          onError?.(new Error(`Failed to load image: ${imageUrl}`));
        };

        img.src = optimizedUrl;
      } catch (error) {
        console.error("Error loading image:", error);
        setHasError(true);
        setIsLoading(false);
        onError?.(error);
      }
    },
    [
      src,
      quality,
      width,
      height,
      format,
      fallback,
      onLoad,
      onError,
      optimizeImageUrl,
    ]
  );

  // Load image when in view or priority
  useEffect(() => {
    if ((inView || priority) && src && !isLoaded) {
      loadImage(src);
    }
  }, [inView, priority, src, isLoaded, loadImage]);

  // Handle src changes
  useEffect(() => {
    if (src && src !== imageSrc) {
      setIsLoaded(false);
      loadImage(src);
    }
  }, [src, loadImage]);

  // Combine refs
  const setRefs = useCallback(
    (node) => {
      imgRef.current = node;
      inViewRef(node);
    },
    [inViewRef]
  );

  // Generate responsive sizes
  const generateSrcSet = useCallback(() => {
    if (!src || src === placeholder) return "";

    const sizes = [320, 640, 768, 1024, 1280, 1920];
    return sizes
      .map((size) => {
        const optimizedUrl = optimizeImageUrl(src, {
          quality,
          width: size,
          format,
        });
        return `${optimizedUrl} ${size}w`;
      })
      .join(", ");
  }, [src, quality, format, optimizeImageUrl]);

  // Handle retry
  const handleRetry = useCallback(() => {
    if (src) {
      setIsLoaded(false);
      setHasError(false);
      loadImage(src);
    }
  }, [src, loadImage]);

  // Loading skeleton
  if (isLoading && !isLoaded) {
    return (
      <div
        className={`image-skeleton ${className}`}
        style={{
          width: width !== "auto" ? width : "100%",
          height: height !== "auto" ? height : "200px",
          backgroundColor: "#f0f0f0",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        {...props}
      >
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (hasError && !isLoaded) {
    return (
      <div
        className={`image-error ${className}`}
        style={{
          width: width !== "auto" ? width : "100%",
          height: height !== "auto" ? height : "200px",
          backgroundColor: "#fef2f2",
          border: "2px dashed #ef4444",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
        {...props}
      >
        <span style={{ color: "#ef4444", fontSize: "14px" }}>
          Failed to load image
        </span>
        <button
          onClick={handleRetry}
          style={{
            padding: "4px 8px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <img
      ref={setRefs}
      src={imageSrc}
      alt={alt}
      className={`optimized-image ${className}`}
      style={{
        width: width !== "auto" ? width : "100%",
        height: height !== "auto" ? height : "auto",
        objectFit: "cover",
        transition: "opacity 0.3s ease-in-out",
        opacity: isLoaded ? 1 : 0.7,
      }}
      loading={lazy && !priority ? "lazy" : "eager"}
      sizes={sizes}
      srcSet={generateSrcSet()}
      onLoad={() => setIsLoaded(true)}
      onError={() => {
        setHasError(true);
        setIsLoading(false);
        onError?.(new Error(`Failed to load image: ${imageSrc}`));
      }}
      {...props}
    />
  );
};

// HOC for lazy loading
export const withLazyLoading = (WrappedComponent) => {
  return React.forwardRef((props, ref) => {
    const { ref: inViewRef, inView } = useInView({
      threshold: 0.1,
      triggerOnce: true,
      rootMargin: "50px",
    });

    return (
      <div ref={inViewRef}>
        {inView && <WrappedComponent {...props} ref={ref} />}
      </div>
    );
  });
};

// Lazy image component
export const LazyImage = withLazyLoading(ImageOptimizer);

// Progressive image component
export const ProgressiveImage = ({ src, ...props }) => {
  const [currentSrc, setCurrentSrc] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (src) {
      // Load low quality first
      const lowQualityUrl = optimizeImageUrl(src, { quality: 20, width: 100 });
      setCurrentSrc(lowQualityUrl);

      // Then load high quality
      const highQualityUrl = optimizeImageUrl(src, { quality: 80 });
      const img = new Image();
      img.onload = () => {
        setCurrentSrc(highQualityUrl);
        setIsLoading(false);
      };
      img.src = highQualityUrl;
    }
  }, [src]);

  return (
    <ImageOptimizer
      src={currentSrc}
      {...props}
      style={{
        ...props.style,
        filter: isLoading ? "blur(5px)" : "none",
        transition: "filter 0.3s ease-out",
      }}
    />
  );
};

// Helper function to optimize image URL
const optimizeImageUrl = (url, options = {}) => {
  if (!url) return url;

  try {
    const imageUrl = new URL(url);

    if (options.quality) {
      imageUrl.searchParams.set("q", options.quality);
    }

    if (options.width) {
      imageUrl.searchParams.set("w", options.width);
    }

    if (options.height) {
      imageUrl.searchParams.set("h", options.height);
    }

    if (options.format) {
      imageUrl.searchParams.set("f", options.format);
    }

    return imageUrl.toString();
  } catch (error) {
    return url;
  }
};

export default ImageOptimizer;

