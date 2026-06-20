"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { CheckCircle, XCircle, Bell, Gift, Briefcase, MessageCircle, X } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  date: Date;
}

interface SocketContextProps {
  socket: Socket | null;
  connected: boolean;
  notifications: Notification[];
  dismissNotification: (id: string) => void;
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  connected: false,
  notifications: [],
  dismissNotification: () => {},
});

export const useSocket = () => useContext(SocketContext);

const notifIcon = (type: string) => {
  switch (type) {
    case 'transaction_approved': return <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
    case 'transaction_rejected': return <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />;
    case 'jackpot_won':          return <Gift className="w-5 h-5 text-fuchsia-400 flex-shrink-0" />;
    case 'salary_received':      return <Briefcase className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
    case 'ticket_reply':         return <MessageCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />;
    case 'earnings_received':    return <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />;
    default:                     return <Bell className="w-5 h-5 text-slate-400 flex-shrink-0" />;
  }
};

const notifBorder = (type: string) => {
  switch (type) {
    case 'transaction_approved':
    case 'salary_received':
    case 'earnings_received': return 'border-l-emerald-500';
    case 'transaction_rejected': return 'border-l-rose-500';
    case 'jackpot_won':           return 'border-l-fuchsia-500';
    case 'ticket_reply':          return 'border-l-indigo-500';
    case 'announcement':          return 'border-l-amber-500';
    default:                      return 'border-l-slate-500';
  }
};

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? (() => {
      try {
        const raw = window.localStorage.getItem('authState');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.accessToken ?? null;
      } catch {
        return null;
      }
    })() : null;
    if (!token) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => setConnected(true));
    socketInstance.on('disconnect', () => setConnected(false));

    socketInstance.on('notification', (data) => {
      const newNotif: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: data.type,
        title: data.title,
        message: data.message,
        date: new Date(data.date),
      };

      setNotifications((prev) => [newNotif, ...prev]);

      // Auto-dismiss after 6 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== newNotif.id));
      }, 6000);
    });

    setSocket(socketInstance);
    return () => { socketInstance.disconnect(); };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected, notifications, dismissNotification }}>
      {children}

      {/* Toast Notification Stack */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col space-y-3 pointer-events-none max-w-sm w-full">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`
              glass-panel bg-slate-900/95 border border-slate-700/80 border-l-4 ${notifBorder(notif.type)}
              p-4 rounded-xl shadow-2xl shadow-black/40 pointer-events-auto
              animate-slide-in-right flex items-start space-x-3
            `}
          >
            {notifIcon(notif.type)}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-100">{notif.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
            </div>
            <button
              onClick={() => dismissNotification(notif.id)}
              className="flex-shrink-0 ml-2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
}
