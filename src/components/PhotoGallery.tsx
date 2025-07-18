import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface Photo {
  url: string;
  caption: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  className?: string;
}

export function PhotoGallery({ photos, className = '' }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const showNext = () => {
    setCurrentIndex((current) => (current + 1) % photos.length);
  };

  const showPrevious = () => {
    setCurrentIndex((current) => (current - 1 + photos.length) % photos.length);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isLightboxOpen) {
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrevious();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  return (
    <div className={className}>
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="relative group cursor-pointer"
            onClick={() => {
              setCurrentIndex(index);
              setIsLightboxOpen(true);
            }}
          >
            <img
              src={photo.url}
              alt={photo.caption}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={showPrevious}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={showNext}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="max-w-4xl mx-auto px-4">
            <img
              src={photos[currentIndex].url}
              alt={photos[currentIndex].caption}
              className="max-h-[80vh] w-auto mx-auto"
            />
            <p className="text-white text-center mt-4">
              {photos[currentIndex].caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}