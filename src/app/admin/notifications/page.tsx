"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import { apiRequest } from "../../../lib/api";
import { Bell, Check, MailOpen, AlertCircle, Info, ShieldCheck } from "lucide-react";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'security';
  isRead: boolean;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminNotificationsList"],
    queryFn: async () => {
      return apiRequest("/notifications");
    },
  });

  const notifications: NotificationItem[] = data?.notifications || [];

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminNotificationsList"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/notifications/all/read", { method: 'PUT' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminNotificationsList"] });
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

  const getUnreadCount = () => notifications.filter(n => !n.isRead).length;

  return (
    <>
      <Navbar title="Admin Alert Center" />
      <div className="max-w-5xl mx-auto space-y-6 px-4 pt-28 pb-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between glass-panel p-5 bg-slate-900/40 border border-slate-800">
          <div>
            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan-400" />
              Admin Notification Center
            </h2>
            <p className="text-sm text-slate-400 mt-1">Manage admin alerts and mark notifications read from your control panel.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-slate-500 hover:text-slate-100"
            >
              Back to Dashboard
            </Link>
            {getUnreadCount() > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isLoading}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-500 hover:text-cyan-300 disabled:opacity-60"
              >
                <Check className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
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
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                filter === tab.id
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-12 text-center text-slate-500 text-sm">Loading notification feeds…</div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 text-center text-rose-300 text-sm">Failed to load notifications.</div>
        ) : filteredNotifs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-12 text-center text-slate-500 text-sm">
            No notifications match this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifs.map((item) => (
              <div
                key={item._id}
                onClick={() => !item.isRead && markReadMutation.mutate(item._id)}
                className={`group flex cursor-pointer gap-4 rounded-3xl border p-4 transition ${
                  item.isRead
                    ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/80'
                    : 'border-cyan-500/10 bg-cyan-500/5 hover:border-cyan-500/20'
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-950/70 text-slate-200">
                  {getIcon(item.type)}
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className={`text-sm font-semibold ${item.isRead ? 'text-slate-200' : 'text-cyan-300'}`}>{item.title}</h3>
                    <span className="text-[11px] text-slate-500">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400 line-clamp-2">{item.message}</p>
                </div>
                {!item.isRead && <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
