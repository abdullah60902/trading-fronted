"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../../lib/api';
import { Coins, Layers } from 'lucide-react';

export default function StakingManagement() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin_staking_plans', page],
    queryFn: async () => {
      return apiRequest(`/admin/staking-plans?page=${page}&limit=10`);
    },
  });

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse">Loading staking plans...</div>;

  const plans = data?.plans || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-100 flex items-center">
          <Coins className="w-5 h-5 text-purple-400 mr-2" />
          Staking Plan Management
        </h3>
      </div>

      <div className="glass-panel overflow-hidden bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-300">User</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Capital Locked</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Total Rewards Generated</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-300 text-right">Start Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-400">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No active staking plans found.
                  </td>
                </tr>
              ) : null}
              {plans.map((plan: any) => (
                <tr key={plan._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-200">{plan.userId?.firstName} {plan.userId?.lastName}</div>
                    <div className="text-xs text-slate-500">{plan.userId?.email}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-purple-400">
                    {parseFloat(plan.amount.$numberDecimal || plan.amount).toFixed(2)} {plan.currency}
                  </td>
                  <td className="px-6 py-4 font-mono text-emerald-400">
                    {parseFloat(plan.totalRewards.$numberDecimal || plan.totalRewards).toFixed(2)} {plan.currency}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      plan.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-800/50 flex items-center justify-between">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
