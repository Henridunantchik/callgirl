import React, { useState, useEffect } from 'react';
import { Image, Video, File, AlertCircle } from 'lucide-react';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../helpers/firebase';

const FirebaseImageDisplay = ({ 
  src, 
  alt, 
  className = "", 
  fallbackSrc = "/placeholder-image.jpg",
  type = "image", // "image", "video", "file"
  showFallbackIcon = true,
  onClick,
  children,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!src) {
        setImageSrc(fallbackSrc);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        // Si c'est déjà une URL Firebase ou une URL externe valide
        if (src.startsWith('https://') || src.startsWith('http://')) {
          setImageSrc(src);
          setLoading(false);
          return;
        }

        // Si c'est un chemin Firebase, essayer de récupérer l'URL
        if (src.startsWith('avatars/') || src.startsWith('gallery/') || src.startsWith('videos/')) {
          try {
            const storageRef = ref(storage, src);
            const url = await getDownloadURL(storageRef);
            setImageSrc(url);
          } catch (firebaseError) {
            console.warn('Firebase URL not found, using fallback:', firebaseError);
            setImageSrc(fallbackSrc);
          }
        } else {
          // Utiliser directement la source
          setImageSrc(src);
        }
      } catch (err) {
        console.error('Error loading image:', err);
        setError(true);
        setImageSrc(fallbackSrc);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [src, fallbackSrc]);

  const handleImageError = () => {
    if (imageSrc !== fallbackSrc) {
      setError(true);
      setImageSrc(fallbackSrc);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(imageSrc);
    }
  };

  // Affichage selon le type de média
  if (type === 'video') {
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
            className={`w-full h-full object-cover ${onClick ? 'cursor-pointer' : ''}`}
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

  if (type === 'file') {
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
            className={`block w-full h-full ${onClick ? 'cursor-pointer' : ''}`}
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
          className={`w-full h-full object-cover ${onClick ? 'cursor-pointer' : ''}`}
          onClick={handleClick}
          onError={handleImageError}
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
