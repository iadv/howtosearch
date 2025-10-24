'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Activity, MessageSquare, Image as ImageIcon, Clock, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

interface Analytics {
  chat: {
    total_chats: string;
    successful_chats: string;
    chats_with_images: string;
    avg_response_time: string;
    avg_image_count: string;
  };
  images: {
    total_generations: string;
    total_images_generated: string;
    total_failures: string;
    avg_generation_time: string;
  };
}

interface ChatLog {
  id: number;
  user_message: string;
  assistant_response: string;
  needs_images: boolean;
  image_count: number;
  model: string;
  response_time_ms: number;
  success: boolean;
  created_at: string;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Analytics | null>(null);
  const [recentChats, setRecentChats] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, chatsRes] = await Promise.all([
          fetch('/api/analytics?type=stats'),
          fetch('/api/analytics?type=recent&limit=10'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (chatsRes.ok) {
          const chatsData = await chatsRes.json();
          setRecentChats(chatsData.chats);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600">Last 7 days performance metrics</p>
        </motion.div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <MessageSquare className="w-8 h-8 text-violet-500" />
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Total Chats</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">{stats.chat.total_chats}</div>
                <div className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {stats.chat.successful_chats} successful
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <ImageIcon className="w-8 h-8 text-indigo-500" />
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Images</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {stats.images.total_images_generated}
                </div>
                <div className="text-sm text-slate-600 mt-2">
                  {stats.images.total_generations} generations
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-purple-500" />
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Avg Response</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {parseFloat(stats.chat.avg_response_time).toFixed(0)}ms
                </div>
                <div className="text-sm text-slate-600 mt-2">Claude API</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-emerald-500" />
                  <span className="text-xs text-slate-500 uppercase tracking-wide">With Images</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {stats.chat.chats_with_images}
                </div>
                <div className="text-sm text-slate-600 mt-2">
                  Avg {parseFloat(stats.chat.avg_image_count).toFixed(1)} per chat
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Recent Chats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-6 h-6 text-violet-600" />
              <h2 className="text-2xl font-bold text-slate-900">Recent Chats</h2>
            </div>

            <div className="space-y-4">
              {recentChats.map((chat, idx) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.05 }}
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 mb-1">
                        {chat.user_message.substring(0, 100)}
                        {chat.user_message.length > 100 && '...'}
                      </p>
                      <p className="text-xs text-slate-600 mb-2">
                        {chat.assistant_response.substring(0, 150)}
                        {chat.assistant_response.length > 150 && '...'}
                      </p>
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-1">
                      {chat.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      {chat.needs_images && (
                        <div className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          <ImageIcon className="w-3 h-3" />
                          {chat.image_count}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{new Date(chat.created_at).toLocaleString()}</span>
                    <span>•</span>
                    <span>{chat.response_time_ms}ms</span>
                    <span>•</span>
                    <span className="text-violet-600">{chat.model}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {recentChats.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No chat logs yet. Start chatting to see analytics!</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

