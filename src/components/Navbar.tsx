"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Check, X, Menu } from 'lucide-react';
import { apiRequest } from '../lib/api';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleSidebar } from '../store/uiSlice';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'security';
  isRead: boolean;
  createdAt: string;
}

export default function Navbar({ title }: { title: string }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const currentRole = useAppSelector((state) => state.auth.user?.role);
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await apiRequest('/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // If we're on admin routes, only fetch notifications when the authenticated
    // user actually has an admin role to avoid sending user tokens to admin APIs.
    if (pathname?.startsWith('/admin') && currentRole !== 'admin' && currentRole !== 'superadmin') return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // refresh notifications every 10s
    return () => clearInterval(interval);
  }, [isAuthenticated, pathname, currentRole]);

  const handleMarkRead = async (id: string) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/notifications/all/read', { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const notificationsPath = pathname?.startsWith('/admin') ? '/admin/notifications' : '/notifications';

  return (
    <header className="h-20 bg-slate-900/30 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 fixed top-0 right-0 left-0 lg:left-64 z-20 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button 
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 -ml-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-slate-100 glow-text-cyan capitalize truncate max-w-[50vw] sm:max-w-[70vw] md:max-w-[80vw]">
          {title}
        </h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative p-2 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-all duration-150"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-cyan-500 rounded-full text-[10px] text-slate-950 font-bold flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-80 glass-panel border border-slate-800 shadow-xl z-50 py-2">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-200">Alert Center</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  <Check className="h-3 w-3" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => !item.isRead && handleMarkRead(item._id)}
                    className={`p-3 border-b border-slate-800/50 cursor-pointer transition-colors duration-150 ${
                      item.isRead ? 'hover:bg-slate-800/20' : 'bg-cyan-500/5 hover:bg-cyan-500/10'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <p className={`text-xs font-semibold ${item.isRead ? 'text-slate-300' : 'text-cyan-400'}`}>
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="h-2 w-2 bg-cyan-400 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.message}</p>
                    <span className="text-[9px] text-slate-600 block mt-1">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            <div className="border-t border-slate-800 p-2 text-center bg-slate-900/40">
              <Link
                href={notificationsPath}
                onClick={() => setShowDropdown(false)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition-colors block py-1"
              >
                View All Notifications
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
