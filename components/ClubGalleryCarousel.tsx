'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ClubGalleryCarouselProps = {
  images: string[];
};

export function ClubGalleryCarousel({ images }: ClubGalleryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={images[currentIndex]}
            alt={`Photo du club Pretoria MMA ${currentIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </div>

        <button
          type="button"
          onClick={goToPrevious}
          aria-label="Photo précédente"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-zinc-700 bg-black/60 p-2 text-white transition hover:bg-black/80"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={goToNext}
          aria-label="Photo suivante"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-zinc-700 bg-black/60 p-2 text-white transition hover:bg-black/80"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <p className="text-center text-xs text-zinc-400">
        {currentIndex + 1} / {images.length}
      </p>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((src, index) => {
          const isActive = index === currentIndex;

          return (
            <button
              key={src}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Aller à la photo ${index + 1}`}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition ${
                isActive
                  ? 'border-red-600 ring-1 ring-red-600'
                  : 'border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <Image
                src={src}
                alt={`Miniature ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
