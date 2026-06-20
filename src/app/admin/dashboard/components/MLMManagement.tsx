"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../../lib/api';
import { Share2, Users } from 'lucide-react';

export default function MLMManagement() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin_mlm_stats'],
    queryFn: async () => {
      return apiRequest('/admin/mlm-stats');
    },
  });

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse">Loading MLM statistics...</div>;

  const topReferrers = data?.topReferrers || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-100 flex items-center">
          <Share2 className="w-5 h-5 text-cyan-400 mr-2" />
          MLM Network Management
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-panel p-6 bg-slate-900/40 border-l-4 border-cyan-400">
          <h4 className="text-sm font-medium text-slate-400 mb-2">Total Participants in MLM Network</h4>
          <p className="text-4xl font-bold text-slate-100">{data?.totalNetworkSize || 0}</p>
        </div>
        <div className="glass-panel p-6 bg-slate-900/40 border-l-4 border-fuchsia-400">
          <h4 className="text-sm font-medium text-slate-400 mb-2">Total Unlinked Users</h4>
          <p className="text-4xl font-bold text-slate-100">
            {/* Can be derived, or wait for future implementation */}
            --
          </p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden bg-slate-900/40">
        <div className="p-6 border-b border-slate-800/50">
          <h4 className="font-bold text-slate-200">Top Network Leaders (Top 10)</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-300">Leader Name</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Email</th>
                <th className="px-6 py-4 font-semibold text-slate-300 text-right">Direct Referrals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-400">
              {topReferrers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    No top referrers found.
                  </td>
                </tr>
              ) : null}
              {topReferrers.map((referrer: any, index: number) => (
                <tr key={referrer._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-slate-300/20 text-slate-300' :
                        index === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-slate-800 text-cyan-400'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-slate-200">{referrer.firstName} {referrer.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{referrer.email}</td>
                  <td className="px-6 py-4 text-right font-bold text-cyan-400">
                    {referrer.count} Users
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
