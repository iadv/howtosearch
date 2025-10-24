'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Clock, MapPin, Image as ImageIcon, Mail } from 'lucide-react';
import NextImage from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ImageCarousel from '@/components/ImageCarousel';
import ContactModal from '@/components/ContactModal';

interface Session {
  id: string;
  userQuery: string;
  assistantResponse: string;
  images: any[];
  needsImages: boolean;
  imageCount: number;
  messageCount: number;
  score: number;
  createdAt: string;
  location: string;
}

export default function SearchPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions/${params.id}`, {
          cache: 'no-store',
        });
        
        if (response.ok) {
          const data = await response.json();
          setSession(data.session);
        } else if (response.status === 404) {
          setError('Search not found');
        } else {
          setError('Failed to load search');
        }
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to load search');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchSession();
    }
  }, [params.id]);

  const getRelativeTime = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-8 h-8 text-violet-500" />
        </motion.div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {error || 'Search not found'}
          </h1>
          <p className="text-slate-600 mb-6">
            This search might have been removed or doesn't exist.
          </p>
          <Button onClick={() => router.push('/')} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200"
        >
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">Expixi</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Session Meta */}
                <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {getRelativeTime(session.createdAt)}
                  </span>
                  {session.location && session.location !== 'Unknown' && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {session.location}
                    </span>
                  )}
                </div>
                
                <Button
                  onClick={() => setIsContactModalOpen(true)}
                  variant="outline"
                  className="bg-white/90 backdrop-blur-sm border-violet-200 hover:bg-violet-50 shadow-lg"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]"
          >
            {/* Query Section */}
            <div className="space-y-6">
              <Card className="p-4 sm:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                      {session.userQuery}
                    </h2>
                    <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" />
                        {session.imageCount} visual{session.imageCount !== 1 ? 's' : ''}
                      </span>
                      <span>Score: {session.score}</span>
                    </div>
                  </div>
                </div>
                
                <div className="prose prose-slate max-w-none">
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {session.assistantResponse}
                  </p>
                </div>
              </Card>
            </div>

            {/* Visuals Section - Full Height */}
            <div className="h-full">
              {session.images && session.images.length > 0 ? (
                <ImageCarousel images={session.images} isLoading={false} />
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <div className="text-center py-12 text-slate-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No visuals available</p>
                  </div>
                </Card>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
