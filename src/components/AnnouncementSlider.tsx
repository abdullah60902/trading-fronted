"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import { ChevronLeft, ChevronRight, Megaphone } from 'lucide-react';

export default function AnnouncementSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: announcements } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      return apiRequest('/features/announcements');
    },
  });

  const items = announcements || [];

  // Auto-advance
  useEffect(() => {
    if (items.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [items.length]);

  const prev = () => setCurrentSlide((s) => (s - 1 + items.length) % items.length);
  const next = () => setCurrentSlide((s) => (s + 1) % items.length);

  if (!items || items.length === 0) return null;

  const current = items[currentSlide];

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 p-4 flex items-center space-x-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
        <Megaphone className="w-4 h-4 text-indigo-400" />
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mr-2">
          {current.title}
        </span>
        <span className="text-xs text-slate-300 truncate">
          {current.content}
        </span>
      </div>

      {items.length > 1 && (
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button onClick={prev} className="w-6 h-6 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-slate-300" />
          </button>
          <span className="text-xs text-slate-500 w-8 text-center">{currentSlide + 1}/{items.length}</span>
          <button onClick={next} className="w-6 h-6 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      )}
    </div>
  );
}
