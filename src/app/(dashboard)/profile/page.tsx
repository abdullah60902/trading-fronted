"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "../../../components/Navbar";
import { apiRequest } from "../../../lib/api";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowRight,
  Smartphone,
  Globe,
  Settings,
  Mail,
  Calendar,
  Lock
} from "lucide-react";

interface UserLogItem {
  _id: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo: string;
  location: string;
  createdAt: string;
}

export default function UserProfileHub() {
  // 1. Fetch user detail stats
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await apiRequest("/auth/me");
      return res.user;
    },
  });

  // 2. Fetch user activity logs
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ["myLogs"],
    queryFn: async () => {
      return apiRequest("/logs/user"); // returns { logs: [...] }
    },
  });

  const user = userData || {};
  const logs: UserLogItem[] = logsData?.logs || [];

  const getKycBanner = () => {
    const status = user.kycStatus || "unsubmitted";
    switch (status) {
      case "approved":
        return (
          <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-lg flex items-start space-x-3 text-emerald-400">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">KYC Verification Completed</h4>
              <p className="text-[11px] text-slate-400 mt-1">Your identity verification has been approved. All withdrawal options are unlocked.</p>
            </div>
          </div>
        );
      case "pending":
        return (
          <div className="p-4 border border-amber-500/20 bg-amber-500/5 rounded-lg flex items-start space-x-3 text-amber-400">
            <Clock className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">KYC Verification Under Review</h4>
              <p className="text-[11px] text-slate-400 mt-1">Your documents have been submitted and are waiting for administrative review. We normally review uploads within 24 hours.</p>
            </div>
          </div>
        );
      case "rejected":
        return (
          <div className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-lg flex items-start space-x-3 text-rose-400">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">KYC Verification Rejected</h4>
              <p className="text-[11px] text-slate-400 mt-1">Your documents were rejected. Please check your uploaded files. Click below to submit new ones.</p>
              <Link href="/settings" className="text-xs font-semibold underline text-rose-400 hover:text-rose-300 block mt-2">
                Re-submit Documents &rarr;
              </Link>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 border border-cyan-500/20 bg-cyan-500/5 rounded-lg flex items-start space-x-3 text-cyan-400">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">Identity Verification Required</h4>
              <p className="text-[11px] text-slate-400 mt-1">Please upload your government-issued ID to complete identity validation. KYC is required for account withdrawals.</p>
              <Link href="/settings" className="text-xs font-semibold underline text-cyan-400 hover:text-cyan-300 block mt-2">
                Upload KYC Documents &rarr;
              </Link>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Navbar title="My Profile" />
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Profile Details & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Details Panel */}
          <div className="md:col-span-1 glass-panel p-6 bg-slate-900/40 border border-slate-800 text-center flex flex-col justify-between items-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-slate-950 text-3xl">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.firstName?.[0]?.toUpperCase() || 'U'
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">{user.firstName} {user.lastName}</h3>
              <p className="text-xs text-slate-400 flex items-center justify-center mt-1">
                <Mail className="w-3.5 h-3.5 mr-1" />
                {user.email}
              </p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-3 ${
                user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {user.status || 'active'}
              </span>
            </div>

            <div className="w-full pt-4 border-t border-slate-800/60 text-left space-y-2 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span className="flex items-center text-slate-500">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" /> Date Joined
                </span>
                <span className="text-slate-300 font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center text-slate-500">
                  <Lock className="w-3.5 h-3.5 mr-1.5" /> 2FA Setup
                </span>
                <span className={`font-semibold ${user.twoFactorEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            <Link href="/settings" className="w-full flex items-center justify-center space-x-1.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-lg text-xs font-bold text-slate-300 hover:text-slate-100 transition-colors">
              <Settings className="w-4 h-4" />
              <span>Settings Hub</span>
            </Link>
          </div>

          {/* KYC & User Activity Logs summary */}
          <div className="md:col-span-2 space-y-6 flex flex-col justify-between">
            {/* KYC Status Indicator Banner */}
            {getKycBanner()}

            {/* Login & Security Log center */}
            <div className="glass-panel p-5 bg-slate-900/40 border border-slate-800 flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center">
                  <Smartphone className="w-4 h-4 text-cyan-400 mr-2" />
                  Recent Activity Logs
                </h3>
              </div>

              {logsLoading ? (
                <div className="text-center text-slate-500 text-xs py-8 animate-pulse">Loading login records...</div>
              ) : logs.length === 0 ? (
                <div className="text-center text-slate-500 text-xs py-8">No security activity logs recorded.</div>
              ) : (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {logs.slice(0, 5).map((log) => (
                    <div key={log._id} className="p-3 bg-slate-950/40 rounded border border-slate-800/60 flex justify-between items-center text-[10px]">
                      <div className="space-y-1">
                        <p className="font-mono text-cyan-400/90 font-bold">{log.action}</p>
                        <div className="flex space-x-3 text-slate-500 font-mono">
                          <span className="flex items-center">
                            <Globe className="w-3 h-3 mr-1" /> {log.ipAddress}
                          </span>
                          <span className="flex items-center">
                            <Smartphone className="w-3 h-3 mr-1" /> {log.deviceInfo || "Desktop"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-slate-500">
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          hour: '2-digit', minute:'2-digit',
                          month: 'short', day: 'numeric'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
