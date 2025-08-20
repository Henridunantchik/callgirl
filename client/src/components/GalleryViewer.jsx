import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Lock,
  Download,
  Share2,
  X,
} from "lucide-react";

const GalleryViewer = ({ images = [], videos = [], isPrivate = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const allMedia = [...images, ...videos];
  const isVideo = (index) => index >= images.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const nextLightbox = () => {
    setLightboxIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevLightbox = () => {
    setLightboxIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  if (allMedia.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No media available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image/Video */}
        <Card>
          <CardContent className="p-0 relative">
            <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              {isVideo(currentIndex) ? (
                <video
                  src={allMedia[currentIndex]}
                  className="w-full h-full object-cover"
                  controls
                  poster={images[0] || ""}
                />
              ) : (
                <img
                  src={allMedia[currentIndex]}
                  alt={`Gallery image ${currentIndex + 1}`}
                  className="w-full h-full object-contain cursor-pointer bg-gray-50"
                  onClick={() => openLightbox(currentIndex)}
                />
              )}

              {/* Navigation Arrows */}
              {allMedia.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                    onClick={prevSlide}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                    onClick={nextSlide}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Video Play Button */}
              {isVideo(currentIndex) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
              )}

              {/* Private Badge */}
              {isPrivate && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-red-500 text-white">
                    <Lock className="w-3 h-3 mr-1" />
                    Private
                  </Badge>
                </div>
              )}

              {/* Media Counter */}
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {currentIndex + 1} / {allMedia.length}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thumbnails */}
        {allMedia.length > 1 && (
          <div className="grid grid-cols-6 gap-2">
            {allMedia.map((media, index) => (
              <div
                key={index}
                className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 ${
                  index === currentIndex
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                {isVideo(index) ? (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Play className="w-4 h-4 text-gray-600" />
                  </div>
                ) : (
                  <img
                    src={media}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-contain bg-gray-50"
                  />
                )}

                {/* Private Badge on Thumbnail */}
                {isPrivate && (
                  <div className="absolute top-1 right-1">
                    <Lock className="w-3 h-3 text-red-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openLightbox(currentIndex)}
          >
            <Share2 className="w-4 h-4 mr-2" />
            View Full
          </Button>
          {!isPrivate && (
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation Arrows */}
            {allMedia.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                  onClick={prevLightbox}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                  onClick={nextLightbox}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Media Content */}
            <div className="max-w-4xl max-h-full p-4">
              {isVideo(lightboxIndex) ? (
                <video
                  src={allMedia[lightboxIndex]}
                  className="max-w-full max-h-full"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={allMedia[lightboxIndex]}
                  alt={`Lightbox image ${lightboxIndex + 1}`}
                  className="max-w-full max-h-full object-contain bg-gray-50"
                />
              )}
            </div>

            {/* Media Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded">
              {lightboxIndex + 1} / {allMedia.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryViewer;
