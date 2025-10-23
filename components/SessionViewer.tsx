'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

interface Session {
  id: string;
  userQuery: string;
  assistantResponse: string;
  images: any[];
  needsImages: boolean;
  imageCount: number;
  messageCount: number;
  createdAt: string;
  location: string;
}

interface SessionViewerProps {
  session: Session | null;
  onClose: () => void;
}

export default function SessionViewer({ session, onClose }: SessionViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!session) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const nextImage = () => {
    if (session.images && session.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % session.images.length);
    }
  };

  const prevImage = () => {
    if (session.images && session.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + session.images.length) % session.images.length);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl max-h-[90vh] flex flex-col"
        >
          <Card className="flex-1 overflow-hidden shadow-2xl border-0 flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-violet-50 to-indigo-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">
                    {session.userQuery}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(session.createdAt)}
                    </span>
                    {session.location && session.location !== 'Unknown' && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {session.location}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full hover:bg-white/80"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-8 space-y-8">
                {/* Response Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="prose prose-slate max-w-none">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                      <h3 className="text-lg font-semibold text-violet-600 mb-4">Answer</h3>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {session.assistantResponse}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Images Section */}
                {session.images && session.images.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold text-violet-600 mb-4">
                      Visual Guide ({session.images.length} {session.images.length === 1 ? 'image' : 'images'})
                    </h3>

                    {/* Main Image */}
                    {session.images[currentImageIndex] && (
                      <div className="relative rounded-2xl overflow-hidden bg-slate-100 shadow-lg group">
                        <div className="relative aspect-video">
                          <Image
                            src={session.images[currentImageIndex].imageUrl || session.images[currentImageIndex]}
                            alt={`Visual guide ${currentImageIndex + 1}`}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>

                        {/* Navigation Arrows */}
                        {session.images.length > 1 && (
                          <>
                            <motion.div
                              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                onClick={prevImage}
                                size="icon"
                                className="rounded-full bg-white/95 hover:bg-white shadow-xl h-12 w-12"
                              >
                                <ChevronLeft className="w-6 h-6 text-violet-600" />
                              </Button>
                            </motion.div>
                            <motion.div
                              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                onClick={nextImage}
                                size="icon"
                                className="rounded-full bg-white/95 hover:bg-white shadow-xl h-12 w-12"
                              >
                                <ChevronRight className="w-6 h-6 text-violet-600" />
                              </Button>
                            </motion.div>

                            {/* Image Counter */}
                            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                              {currentImageIndex + 1} / {session.images.length}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Thumbnail Strip */}
                    {session.images.length > 1 && (
                      <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {session.images.map((img: any, idx: number) => (
                          <motion.button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                              idx === currentImageIndex
                                ? 'border-violet-500 shadow-md'
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Image
                              src={img.imageUrl || img}
                              alt={`Thumbnail ${idx + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

