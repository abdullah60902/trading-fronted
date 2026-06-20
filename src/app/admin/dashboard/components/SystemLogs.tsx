"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../../lib/api';
import { ShieldAlert, Users, Activity, Globe, Smartphone, RefreshCw } from 'lucide-react';

export default function SystemLogs() {
  const [activeTab, setActiveTab] = useState<'admin' | 'user'>('admin');
  const [adminPage, setAdminPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  // Query Admin logs
  const { data: adminData, isLoading: adminLoading, refetch: refetchAdmin } = useQuery({
    queryKey: ['admin_logs', adminPage],
    queryFn: async () => {
      return apiRequest(`/admin/logs?page=${adminPage}&limit=20`);
    },
    enabled: activeTab === 'admin'
  });

  // Query User activity logs
  const { data: userData, isLoading: userLoading, refetch: refetchUser } = useQuery({
    queryKey: ['all_user_logs', userPage],
    queryFn: async () => {
      return apiRequest(`/logs/all-users?page=${userPage}&limit=20`); // returns { logs: [...] }
    },
    enabled: activeTab === 'user'
  });

  const adminLogs = adminData?.logs || [];
  const adminTotalPages = adminData?.totalPages || 1;

  const userLogs = userData?.logs || [];
  const userTotalPages = Math.ceil((userData?.total || userLogs.length || 20) / 20) || 1;

  return (
    <div className="space-y-6">
      
      {/* Tab select toggle */}
      <div className="flex space-x-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'admin' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800/40 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Admin Audit Logs</span>
        </button>
        <button
          onClick={() => setActiveTab('user')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'user' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/40 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Activity Logs</span>
        </button>
      </div>

      {/* Action logs display */}
      <div className="glass-panel overflow-hidden bg-slate-900/40 border border-slate-800 p-4 space-y-4">
        <div className="flex justify-between items-center bg-slate-950/20 p-2.5 rounded-lg border border-slate-800/50">
          <h4 className="text-xs font-bold text-slate-200 flex items-center uppercase tracking-wider">
            <Activity className="w-4 h-4 text-cyan-400 mr-2" />
            {activeTab === 'admin' ? 'Administrative Action Audits' : 'User Security & Activity Feeds'}
          </h4>
          <button
            onClick={() => activeTab === 'admin' ? refetchAdmin() : refetchUser()}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeTab === 'admin' ? (
          adminLoading ? (
            <div className="text-center text-xs text-slate-500 py-12 animate-pulse">Loading administrative audits...</div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-800/60 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/40 text-slate-300 border-b border-slate-800/80">
                      <th className="px-4 py-3">Administrator</th>
                      <th className="px-4 py-3">Action Type</th>
                      <th className="px-4 py-3">Details</th>
                      <th className="px-4 py-3">IP Address</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-400">
                    {adminLogs.map((log: any) => (
                      <tr key={log._id} className="hover:bg-slate-800/10">
                        <td className="px-4 py-3 font-semibold text-slate-300">{log.adminId?.email || 'System'}</td>
                        <td className="px-4 py-3 font-mono text-rose-400 font-bold">{log.action}</td>
                        <td className="px-4 py-3 truncate max-w-xs text-slate-300">{log.details}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{log.ipAddress || '—'}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={adminPage === 1}
                  onClick={() => setAdminPage(p => p - 1)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700/50 disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-xs text-slate-500 font-medium">Page {adminPage} of {adminTotalPages}</span>
                <button
                  disabled={adminPage === adminTotalPages}
                  onClick={() => setAdminPage(p => p + 1)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700/50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )
        ) : (
          userLoading ? (
            <div className="text-center text-xs text-slate-500 py-12 animate-pulse">Loading user activities...</div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-800/60 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/40 text-slate-300 border-b border-slate-800/80">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">IP Address</th>
                      <th className="px-4 py-3">Device Info</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-400">
                    {userLogs.map((log: any) => (
                      <tr key={log._id} className="hover:bg-slate-800/10">
                        <td className="px-4 py-3 font-semibold text-slate-300">
                          <div>{log.userId?.firstName} {log.userId?.lastName}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{log.userId?.email || 'Guest'}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-cyan-400 font-bold">{log.action}</td>
                        <td className="px-4 py-3 font-mono text-slate-500 flex items-center mt-2.5 border-none">
                          <Globe className="w-3.5 h-3.5 mr-1 text-slate-600" />
                          {log.ipAddress}
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          <span className="flex items-center">
                            <Smartphone className="w-3.5 h-3.5 mr-1 text-slate-600" />
                            {log.deviceInfo || 'Desktop'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={userPage === 1}
                  onClick={() => setUserPage(p => p - 1)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700/50 disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-xs text-slate-500 font-medium">Page {userPage} of {userTotalPages}</span>
                <button
                  disabled={userPage === userTotalPages}
                  onClick={() => setUserPage(p => p + 1)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700/50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )
        )}
      </div>

    </div>
  );
}
