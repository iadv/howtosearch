'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import ImageCarousel from '@/components/ImageCarousel';
import SearchTicker from '@/components/SearchTicker';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [images, setImages] = useState<any[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const handleNewImages = (newImages: any[]) => {
    setIsLoadingImages(true);
    // Add new images at the BEGINNING
    setImages((prev) => [...newImages, ...prev]);
    setTimeout(() => setIsLoadingImages(false), 500);
  };

  const handleChatStart = () => {
    if (!hasStartedChat) {
      setHasStartedChat(true);
    }
  };

  return (
    <main className="h-screen w-full bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 relative overflow-hidden flex flex-col">
      {/* Enhanced Background Effects */}
      <motion.div
        className="absolute top-0 left-0 w-[600px] h-[600px] bg-violet-300/30 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none"
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none"
        animate={{
          x: [-100, 100, -100],
          y: [-50, 50, -50],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex flex-col h-full p-6 gap-4">
        {/* Premium Header - Fixed height */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0"
        >
          <div className="max-w-[1800px] mx-auto text-center">
            <motion.div
              className="inline-flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-7 h-7 text-violet-600" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Expixi
              </h1>
            </motion.div>
            
            <AnimatePresence>
              {!hasStartedChat && (
                <motion.p
                  initial={{ opacity: 1, height: 'auto', marginTop: '0.25rem' }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-slate-600 text-base overflow-hidden"
                >
                  Think visually. Turn every question into visual clarity.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

        {/* Main Content Area - Flex grow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 max-w-[1800px] mx-auto w-full grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0"
        >
          {/* Chat Panel */}
          <div className="lg:col-span-3 h-full min-h-0">
            <ChatInterface onNewImages={handleNewImages} onChatStart={handleChatStart} />
          </div>

          {/* Visuals Panel */}
          <div className="lg:col-span-2 h-full min-h-0">
            <ImageCarousel images={images} isLoading={isLoadingImages} />
          </div>
        </motion.div>

        {/* Search Ticker at the bottom - Fixed height */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex-shrink-0"
        >
          <SearchTicker />
        </motion.div>
      </div>
    </main>
  );
}
