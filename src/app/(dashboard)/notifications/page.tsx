"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../../../components/Navbar";
import { apiRequest } from "../../../lib/api";
import { Bell, Check, Trash2, MailOpen, AlertCircle, Info, ShieldCheck } from "lucide-react";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'security';
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsCenter() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notificationsCenterList"],
    queryFn: async () => {
      return apiRequest("/notifications"); // returns { notifications: [...] }
    },
  });

  const notifications: NotificationItem[] = data?.notifications || [];

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationsCenterList"] });
      // Also invalidate Navbar query
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/notifications/all/read", { method: 'PUT' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationsCenterList"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const filteredNotifs = notifications.filter(item => {
    if (filter === "all") return true;
    if (filter === "unread") return !item.isRead;
    return item.type === filter;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      case "security":
        return <AlertCircle className="w-5 h-5 text-purple-400" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };

  return (
    <>
      <Navbar title="Alert Center" />
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-5 bg-slate-900/40 border border-slate-800">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center">
              <Bell className="w-5 h-5 mr-2 text-cyan-400" />
              Notification Center
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              You have <span className="text-cyan-400 font-bold">{getUnreadCount()}</span> unread alerts.
            </p>
          </div>
          {getUnreadCount() > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-lg text-xs font-bold text-slate-300 hover:text-slate-100 transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-cyan-400" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Toolbar categories */}
        <div className="flex border-b border-slate-800 pb-2 overflow-x-auto hide-scrollbar">
          <div className="flex space-x-2">
            {[
              { id: "all", label: "All Alerts" },
              { id: "unread", label: "Unread" },
              { id: "success", label: "Financials" },
              { id: "info", label: "Announcements" },
              { id: "warning", label: "Warnings" },
              { id: "security", label: "Security" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filter === tab.id
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of Alerts */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500 text-xs animate-pulse">Loading notification feeds...</div>
        ) : error ? (
          <div className="p-4 text-center text-rose-400 text-xs">Failed to load notifications.</div>
        ) : filteredNotifs.length === 0 ? (
          <div className="p-12 glass-panel text-center bg-slate-900/40 border border-slate-800 text-slate-500">
            <MailOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs">No alerts found matching this filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifs.map((item) => (
              <div
                key={item._id}
                onClick={() => !item.isRead && markReadMutation.mutate(item._id)}
                className={`p-4 glass-panel border border-slate-800 flex items-start justify-between gap-4 cursor-pointer transition-colors duration-150 ${
                  item.isRead ? 'bg-slate-900/20 hover:bg-slate-900/30' : 'bg-cyan-500/5 hover:bg-cyan-500/10'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className="p-2 bg-slate-950/60 rounded-lg shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${item.isRead ? 'text-slate-200' : 'text-cyan-400 glow-text-cyan'}`}>
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{item.message}</p>
                    <span className="text-[10px] text-slate-600 block mt-2">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!item.isRead && (
                  <span className="h-2 w-2 bg-cyan-400 rounded-full shrink-0 animate-pulse mt-2.5"></span>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}
