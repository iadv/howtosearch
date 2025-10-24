'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  onNewImages: (images: any[]) => void;
  onChatStart?: () => void;
  onNewMessage?: (userQuery: string, assistantResponse: string) => void;
}

const EXAMPLE_PROMPTS = [
  'How to tie a perfect Windsor knot',
  'What to do when food sticks to a pan',
  'Why do plants need sunlight',
  'How to change a flat tire safely',
  'What causes rust on metal',
  'How to fold an origami crane',
  'Why does bread rise when baking',
  'How to jumpstart a car battery',
  'What to do if your phone gets wet',
  'Why do onions make you cry',
  'How to remove red wine stains',
  'What causes hiccups and how to stop them',
  'How to sharpen kitchen knives properly',
  'Why does ice float on water',
  'How to fix a running toilet',
  'What to do during a power outage',
  'Why do leaves change color in fall',
  'How to unclog a drain naturally',
  'What causes muscle cramps',
  'How to pack a suitcase efficiently',
  'Why does coffee keep you awake',
  'How to parallel park perfectly',
  'What to do if you lock keys in car',
  'Why do cats purr',
  'How to stop a nosebleed quickly',
  'What causes brain freeze',
  'How to remove gum from clothes',
  'Why does metal feel colder than wood',
  'How to treat a minor burn',
  'What to do when smoke alarm won\'t stop'
];

export default function ChatInterface({ onNewImages, onChatStart, onNewMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    // Small delay to prevent layout shift
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Notify parent that chat has started
    if (messages.length === 0 && onChatStart) {
      onChatStart();
    }
    
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          userMessage,
        }),
      });

      if (!chatResponse.ok) {
        throw new Error('Failed to get response from Claude');
      }

      const data = await chatResponse.json();
      const responseText = data.response || 'Sorry, I received an empty response.';
      
      setMessages([...newMessages, {
        role: 'assistant',
        content: responseText,
      }]);

      // Notify parent about the new message exchange
      if (onNewMessage) {
        onNewMessage(userMessage, responseText);
      }

      if (data.needsImages && data.imagePrompts && data.imagePrompts.length > 0) {
        const { getImageEndpoint } = await import('@/lib/config');
        const imageEndpoint = getImageEndpoint();
        
        if (imageEndpoint) {
          try {
            const imageResponse = await fetch(imageEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompts: data.imagePrompts,
              }),
            });

            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              const validImages = imageData.images.filter((img: any) => img.success && img.imageUrl);
              if (validImages.length > 0) {
                onNewImages(validImages);
              }
            }
          } catch (error) {
            console.log('Image generation not available:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden glass-effect shadow-2xl border-0 min-h-[600px] h-[600px]">
      {/* Messages with proper scrolling */}
      <ScrollArea className="flex-1 px-6">
        <div className="py-6 space-y-6 min-h-full flex flex-col">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-12"
            >
              <motion.div
                className="w-20 h-20 mb-8 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 text-slate-900">What would you like to understand?</h3>
              <p className="text-slate-600 mb-6 sm:mb-8 max-w-md text-sm sm:text-base">Ask me anything and get visual, step-by-step explanations</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl w-full">
                {EXAMPLE_PROMPTS.slice(0, 8).map((prompt, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setInput(prompt)}
                    className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-left rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 transition-all shadow-sm"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          
          <AnimatePresence mode="popLayout">
            {messages.map((message, idx) => (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Avatar className={`${message.role === 'user' ? 'bg-gradient-to-br from-violet-500 to-violet-600' : 'bg-gradient-to-br from-slate-700 to-slate-900'} shadow-lg`}>
                    <AvatarFallback className="bg-transparent text-white">
                      {message.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <motion.div
                  className={`flex-1 rounded-2xl px-5 py-4 max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-xl shadow-violet-500/20 ml-auto'
                      : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                  }`}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <Avatar className="bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg">
                <AvatarFallback className="bg-transparent text-white">
                  <Sparkles className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
                <div className="flex gap-1.5">
                  <motion.div
                    className="w-2 h-2 bg-violet-400 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-violet-400 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-violet-400 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 sm:p-6 border-t border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 border-slate-200 focus-visible:ring-violet-500 bg-white shadow-sm rounded-xl h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4 touch-manipulation"
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/30 rounded-xl px-4 sm:px-6 md:px-8 h-10 sm:h-12 touch-manipulation"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </Card>
  );
}
