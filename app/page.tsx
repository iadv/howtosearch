'use client';

import { useState, useEffect, useRef } from 'react';
import ChatInterface from '@/components/ChatInterface';
import ImageCarousel from '@/components/ImageCarousel';
import SearchTicker from '@/components/SearchTicker';
import SessionsSidebar from '@/components/SessionsSidebar';
import SessionViewer from '@/components/SessionViewer';
import SubmitSearchModal from '@/components/SubmitSearchModal';
import ContactModal from '@/components/ContactModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export default function Home() {
  const [images, setImages] = useState<any[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const [lastResponse, setLastResponse] = useState('');

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

  const handleNewMessage = (userQuery: string, assistantResponse: string) => {
    // Store for potential submission
    setLastQuery(userQuery);
    setLastResponse(assistantResponse);
  };

  return (
    <>
      {/* Sessions Sidebar */}
      <SessionsSidebar onSessionClick={setSelectedSession} />

      {/* Session Viewer Modal */}
      {selectedSession && (
        <SessionViewer session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}

      {/* Submit Search Modal */}
      <SubmitSearchModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        userQuery={lastQuery}
        assistantResponse={lastResponse}
        images={images}
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* Floating Submit Button */}
      {hasStartedChat && lastQuery && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-24 right-6 z-40"
        >
          <Button
            onClick={() => setIsSubmitModalOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-2xl shadow-emerald-500/30 rounded-full px-6 py-6 text-white font-semibold"
          >
            <Send className="w-5 h-5 mr-2" />
            Submit Your Search
          </Button>
        </motion.div>
      )}

      <main className="w-full min-h-screen max-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 relative overflow-y-auto">
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

      <div className="relative z-10 p-3 sm:p-4 space-y-4">
        {/* Premium Header - Thin and compact */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0"
        >
          <div className="max-w-[1800px] mx-auto">
            <div className="flex items-center justify-between mb-2">
              {/* Contact Button */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={() => setIsContactModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="bg-white/90 backdrop-blur-sm border-violet-200 hover:bg-violet-50 shadow-lg text-xs sm:text-sm"
                >
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Contact
                </Button>
              </motion.div>

              {/* Logo */}
              <motion.div
                className="inline-flex items-center gap-2 sm:gap-3"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
                </motion.div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Expixi
                </h1>
              </motion.div>

              {/* Spacer for balance */}
              <div className="w-16 sm:w-20"></div>
            </div>
            
            <AnimatePresence>
              {!hasStartedChat && (
                <motion.p
                  initial={{ opacity: 1, height: 'auto', marginTop: '0.125rem' }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-slate-600 text-xs sm:text-sm overflow-hidden"
                >
                  Think visually. Turn every question into visual clarity.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

        {/* Main Content Area - Fixed height to prevent excessive scrolling */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[1800px] mx-auto w-full grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 h-[600px]"
        >
          {/* Chat Panel */}
          <div className="lg:col-span-3">
            <ChatInterface 
              onNewImages={handleNewImages} 
              onChatStart={handleChatStart}
              onNewMessage={handleNewMessage}
            />
          </div>

          {/* Visuals Panel */}
          <div className="lg:col-span-2">
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
    </>
  );
}
