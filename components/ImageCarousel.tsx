'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface GeneratedImage {
  prompt: string;
  imageUrl: string | null;
  success: boolean;
  error?: string;
}

interface ImageCarouselProps {
  images: GeneratedImage[];
  isLoading?: boolean;
}

export default function ImageCarousel({ images, isLoading }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    // Always show the first image (most recent since we prepend new images)
    if (images.length > 0) {
      setCurrentIndex(0);
    }
  }, [images.length]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0 && !isLoading) {
    return (
      <Card className="h-full flex items-center justify-center glass-effect shadow-2xl border-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-12"
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <ImageIcon className="w-12 h-12 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            Visuals
          </h3>
          <p className="text-sm text-slate-600 max-w-xs leading-relaxed">
            Visual guides will appear here as you learn
          </p>
        </motion.div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden glass-effect shadow-2xl border-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Visuals</h3>
            <p className="text-xs text-slate-500 mt-1">
              {images.length} {images.length === 1 ? 'guide' : 'guides'}
            </p>
          </div>
          {images.length > 1 && (
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevImage}
                  className="h-9 w-9 rounded-xl hover:bg-violet-100"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-700" />
                </Button>
              </motion.div>
              <span className="text-sm font-semibold text-slate-700 min-w-[3rem] text-center">
                {currentIndex + 1} / {images.length}
              </span>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextImage}
                  className="h-9 w-9 rounded-xl hover:bg-violet-100"
                >
                  <ChevronRight className="h-5 w-5 text-slate-700" />
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Image Display with ScrollArea */}
      <ScrollArea className="flex-1 relative">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-16 w-16 text-violet-500 mx-auto mb-6" />
              </motion.div>
              <p className="text-base text-slate-700 font-medium">Generating visuals...</p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {images.length > 0 && images[currentIndex] && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="p-6 flex flex-col gap-4 min-h-full relative"
              >
                <motion.div
                  className="relative rounded-3xl overflow-hidden bg-slate-100 shadow-2xl min-h-[400px] flex items-center justify-center group"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{ aspectRatio: '4/3' }}
                >
                  {images[currentIndex].success && images[currentIndex].imageUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={images[currentIndex].imageUrl!}
                        alt={images[currentIndex].prompt}
                        fill
                        className="object-contain p-4"
                        unoptimized
                        onError={(e) => {
                          console.error('Image failed to load:', images[currentIndex].imageUrl);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-12">
                      <div className="text-center">
                        <ImageIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-sm text-slate-500">
                          {images[currentIndex].error || 'Image not available'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Large Navigation Buttons on Image */}
                  {images.length > 1 && (
                    <>
                      <motion.div
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          onClick={prevImage}
                          size="icon"
                          className="h-14 w-14 rounded-full bg-white/95 hover:bg-white shadow-2xl border-2 border-violet-200"
                        >
                          <ChevronLeft className="h-7 w-7 text-violet-600" />
                        </Button>
                      </motion.div>
                      <motion.div
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          onClick={nextImage}
                          size="icon"
                          className="h-14 w-14 rounded-full bg-white/95 hover:bg-white shadow-2xl border-2 border-violet-200"
                        >
                          <ChevronRight className="h-7 w-7 text-violet-600" />
                        </Button>
                      </motion.div>
                    </>
                  )}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="px-4 py-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm"
                >
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {images[currentIndex].prompt}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </ScrollArea>

      {/* Thumbnail Strip with ScrollArea */}
      {images.length > 1 && !isLoading && (
        <div className="p-4 border-t border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-2">
              {images.map((img, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                    idx === currentIndex
                      ? 'border-violet-500 ring-4 ring-violet-200 shadow-lg'
                      : 'border-slate-200 hover:border-violet-300'
                  }`}
                  whileHover={{ scale: 1.1, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {img.success && img.imageUrl ? (
                    <Image
                      src={img.imageUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </Card>
  );
}
