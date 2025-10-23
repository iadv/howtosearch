'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Clock, MapPin, Image as ImageIcon, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import NextImage from 'next/image';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

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

interface SessionsSidebarProps {
  onSessionClick: (session: Session) => void;
}

export default function SessionsSidebar({ onSessionClick }: SessionsSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});

  useEffect(() => {
    fetchSessions();
    // Load user votes from localStorage
    const savedVotes = localStorage.getItem('userVotes');
    if (savedVotes) {
      setUserVotes(JSON.parse(savedVotes));
    }
    // Refresh every 30 seconds
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions/recent', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched sessions:', data.sessions.length);
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (sessionId: string, vote: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    const currentVote = userVotes[sessionId];
    let actualVote: 'up' | 'down' | null = null;
    let scoreChange = 0;

    // Determine the vote action
    if (currentVote === vote) {
      // Clicking same button - remove vote
      actualVote = null;
      scoreChange = vote === 'up' ? -1 : 1; // Undo previous vote
    } else if (currentVote) {
      // Switching vote - need to undo old and apply new
      scoreChange = vote === 'up' ? 2 : -2; // +1 for new, -1 for removing old
      actualVote = vote;
    } else {
      // First time voting
      scoreChange = vote === 'up' ? 1 : -1;
      actualVote = vote;
    }

    try {
      // Send the calculated score change to backend
      const response = await fetch('/api/sessions/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, scoreChange }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state with server-confirmed score
        setSessions(prev => prev.map(s => 
          s.id === sessionId ? { ...s, score: data.newScore } : s
        ));

        // Update user votes
        const newVotes = { ...userVotes };
        if (actualVote) {
          newVotes[sessionId] = actualVote;
        } else {
          delete newVotes[sessionId];
        }
        setUserVotes(newVotes);
        localStorage.setItem('userVotes', JSON.stringify(newVotes));
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const getRelativeTime = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <>
      {/* Toggle Button - Always visible */}
      <motion.div
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50"
        initial={{ x: -10 }}
        animate={{ x: 0 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-l-none rounded-r-xl bg-white/90 backdrop-blur-sm border-l-0 border-violet-200 hover:bg-violet-50 shadow-lg h-16 px-2"
          variant="outline"
        >
          <div className="flex flex-col items-center gap-1">
            {isOpen ? (
              <ChevronLeft className="w-5 h-5 text-violet-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-violet-600" />
            )}
            {!isOpen && (
              <span className="text-[10px] text-violet-600 font-medium writing-mode-vertical">
                Recent
              </span>
            )}
          </div>
        </Button>
      </motion.div>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-96 bg-white/95 backdrop-blur-md border-r border-slate-200 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex-shrink-0 p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                    Recent Searches
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full hover:bg-slate-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-slate-500">
                  See what others are exploring
                </p>
              </div>

              {/* Sessions List */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-8 h-8 text-violet-500" />
                      </motion.div>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <p>No recent searches yet</p>
                    </div>
                  ) : (
                    sessions.map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card
                          className="relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 hover:border-violet-400 group border-0 bg-gradient-to-br from-white to-slate-50"
                          onClick={() => {
                            onSessionClick(session);
                            setIsOpen(false);
                          }}
                        >
                          {/* Gradient Overlay on Hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-indigo-500/0 group-hover:from-violet-500/5 group-hover:to-indigo-500/5 transition-all duration-300" />
                          
                          <div className="relative p-4">
                            {/* Query with Icon */}
                            <div className="flex items-start gap-2 mb-2">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-white" />
                              </div>
                              <h3 className="flex-1 font-semibold text-sm text-slate-900 line-clamp-2 group-hover:text-violet-600 transition-colors">
                                {session.userQuery}
                              </h3>
                            </div>

                            {/* Image Preview Grid - if images exist */}
                            {session.images && session.images.length > 0 && (
                              <div className="mb-3 grid grid-cols-3 gap-1.5 rounded-lg overflow-hidden">
                                {session.images.slice(0, 3).map((img: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="relative aspect-square bg-slate-100 rounded-md overflow-hidden"
                                  >
                                    {img.imageUrl && (
                                      <NextImage
                                        src={img.imageUrl}
                                        alt={img.prompt || 'Visual'}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        unoptimized
                                      />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Response Preview */}
                            <p className="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                              {session.assistantResponse.substring(0, 120)}...
                            </p>

                            {/* Meta Info Bar */}
                            <div className="flex items-center justify-between text-xs mb-2">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 text-slate-400">
                                  <Clock className="w-3 h-3" />
                                  {getRelativeTime(session.createdAt)}
                                </span>
                                {session.imageCount > 0 && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 font-medium">
                                    <ImageIcon className="w-3 h-3" />
                                    {session.imageCount}
                                  </span>
                                )}
                              </div>
                              {session.location && session.location !== 'Unknown' && session.location !== 'Unknown Location' && (
                                <span className="flex items-center gap-1 text-slate-400">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate max-w-[100px]">{session.location}</span>
                                </span>
                              )}
                            </div>

                            {/* Voting Bar */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <div className="flex items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => handleVote(session.id, 'up', e)}
                                  className={`p-1 rounded-full transition-colors ${
                                    userVotes[session.id] === 'up' 
                                      ? 'bg-green-100 shadow-sm' 
                                      : 'hover:bg-green-50'
                                  }`}
                                >
                                  <ThumbsUp className={`w-4 h-4 ${
                                    userVotes[session.id] === 'up' 
                                      ? 'text-green-700 fill-green-700' 
                                      : 'text-green-600'
                                  }`} />
                                </motion.button>
                                <span className="font-semibold text-slate-700 min-w-[2.5rem] text-center">
                                  {session.score}
                                </span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => handleVote(session.id, 'down', e)}
                                  className={`p-1 rounded-full transition-colors ${
                                    userVotes[session.id] === 'down' 
                                      ? 'bg-red-100 shadow-sm' 
                                      : 'hover:bg-red-50'
                                  }`}
                                >
                                  <ThumbsDown className={`w-4 h-4 ${
                                    userVotes[session.id] === 'down' 
                                      ? 'text-red-700 fill-red-700' 
                                      : 'text-red-600'
                                  }`} />
                                </motion.button>
                              </div>
                              <span className="text-xs text-slate-400">
                                {session.score >= 400 ? '🔥 Hot' : session.score >= 300 ? '👍 Good' : session.score >= 200 ? '✨ New' : '💡 Growing'}
                              </span>
                            </div>
                          </div>

                          {/* Shine Effect on Hover */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="flex-shrink-0 p-4 border-t border-slate-200 bg-slate-50/50">
                <p className="text-xs text-slate-500 text-center">
                  Showing {sessions.length} recent {sessions.length === 1 ? 'search' : 'searches'}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

