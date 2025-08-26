import React, { useState, useEffect } from "react";
import {
  Image,
  Video,
  Play,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import FirebaseImageDisplay from "./FirebaseImageDisplay";
import { Button } from "./ui/button";

const FirebaseGallery = ({
  images = [],
  videos = [],
  className = "",
  maxDisplay = 6,
  showLightbox = true,
  onImageClick,
  ...props
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allMedia, setAllMedia] = useState([]);

  useEffect(() => {
    // Combiner images et vidéos avec leurs types
    const combined = [
      ...images.map((img, index) => ({
        ...img,
        type: "image",
        originalIndex: index,
      })),
      ...videos.map((vid, index) => ({
        ...vid,
        type: "video",
        originalIndex: index + images.length,
      })),
    ];
    setAllMedia(combined);
  }, [images, videos]);

  const handleImageClick = (index) => {
    if (onImageClick) {
      onImageClick(allMedia[index], index);
    }

    if (showLightbox) {
      setCurrentIndex(index);
      setLightboxOpen(true);
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  const handleKeyDown = (e) => {
    if (!lightboxOpen) return;

    switch (e.key) {
      case "Escape":
        closeLightbox();
        break;
      case "ArrowRight":
        nextImage();
        break;
      case "ArrowLeft":
        prevImage();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (lightboxOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [lightboxOpen]);

  if (allMedia.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <Image className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Aucune photo ou vidéo disponible</p>
      </div>
    );
  }

  const displayMedia = allMedia.slice(0, maxDisplay);
  const remainingCount = allMedia.length - maxDisplay;

  return (
    <>
      <div
        className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 ${className}`}
        {...props}
      >
        {displayMedia.map((media, index) => (
          <div
            key={`${media.type}-${media.originalIndex}`}
            className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg"
            onClick={() => handleImageClick(index)}
          >
            <FirebaseImageDisplay
              src={media.url || media.src}
              alt={media.alt || media.name || `Media ${index + 1}`}
              type={media.type}
              className="w-full h-full"
              showFallbackIcon={false}
            />

            {/* Overlay avec icône de type */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {media.type === "video" && (
                <Play className="w-8 h-8 text-white" />
              )}
              {media.type === "image" && <Eye className="w-6 h-6 text-white" />}
            </div>

            {/* Compteur pour les médias restants */}
            {index === maxDisplay - 1 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  +{remainingCount}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && showLightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          {/* Bouton fermer */}
          <Button
            variant="ghost"
            size="sm"
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navigation */}
          {allMedia.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}

          {/* Média principal */}
          <div className="max-w-4xl max-h-[90vh] p-4">
            <FirebaseImageDisplay
              src={allMedia[currentIndex]?.url || allMedia[currentIndex]?.src}
              alt={
                allMedia[currentIndex]?.alt ||
                allMedia[currentIndex]?.name ||
                `Media ${currentIndex + 1}`
              }
              type={allMedia[currentIndex]?.type}
              className="w-full h-full object-contain"
              showFallbackIcon={false}
            />
          </div>

          {/* Indicateurs */}
          {allMedia.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {allMedia.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Informations */}
          <div className="absolute bottom-4 left-4 text-white text-sm">
            {currentIndex + 1} / {allMedia.length}
          </div>
        </div>
      )}
    </>
  );
};

export default FirebaseGallery;
