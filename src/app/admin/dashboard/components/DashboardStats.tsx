"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../../lib/api';
import { Users, CreditCard, DollarSign, Activity, PieChart, Gift, Award, Sparkles } from 'lucide-react';

const formatCurrency = (value: unknown) => {
  const number = Number(value) || 0;
  return `$${number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function DashboardStats() {
  const { data: stats, isLoading, isFetching, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['admin_dashboard_stats'],
    queryFn: async () => apiRequest('/admin/dashboard'),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading dashboard statistics...</div>;
  }

  if (!stats) return null;

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-cyan-400' },
    { title: 'Active Users', value: stats.activeUsers, icon: Activity, color: 'text-emerald-400' },
    { title: 'Total Deposits', value: formatCurrency(stats.totalDeposits), icon: CreditCard, color: 'text-blue-400' },
    { title: 'Total Withdrawals', value: formatCurrency(stats.totalWithdrawals), icon: CreditCard, color: 'text-rose-400' },
    { title: 'Total Earnings Distributed', value: formatCurrency(stats.totalEarnings), icon: DollarSign, color: 'text-yellow-400' },
    { title: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: Sparkles, color: 'text-lime-400' },
  ];

  const mlmStats = [
    { label: 'MLM Network Size', value: stats.mlmNetworkSize, icon: Users },
    { label: 'Referral Network', value: stats.totalNetworkSize ?? stats.mlmNetworkSize, icon: Award },
  ];

  const jackpotStats = [
    { label: 'Open Jackpot Rounds', value: stats.activeJackpotCount, icon: Gift },
    { label: 'Active Jackpot Pool', value: formatCurrency(stats.activeJackpotPool), icon: Gift },
    { label: 'Jackpot Participants', value: stats.activeJackpotParticipants, icon: Activity },
    { label: 'Total Jackpot Rounds', value: stats.totalJackpotRounds, icon: Award },
  ];

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Admin Control Panel</p>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <h3 className="text-3xl font-bold text-slate-100">Live platform metrics</h3>
            <span className="inline-flex items-center rounded-full bg-slate-900/90 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-300 border border-slate-700">Auto-refresh every 15s</span>
          </div>
          <p className="max-w-2xl text-sm text-slate-400">Real-time dashboard view with users, revenue, staking, MLM, and jackpot metrics for immediate admin action.</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center justify-center rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
          >
            Refresh now
          </button>
          <div className="rounded-full border border-slate-800 bg-slate-950/80 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
            Updated: {lastUpdated} {isFetching ? '(Refreshing…)': ''}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-panel p-6 bg-slate-900/50 border border-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.4)] overflow-hidden relative group hover:-translate-y-0.5 transition-transform">
              <div className="absolute -top-6 -right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className={`w-28 h-28 ${card.color}`} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-slate-400">{card.title}</h4>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="text-3xl font-bold text-slate-100">{card.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-panel bg-slate-900/60 border border-slate-800 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">MLM statistics</p>
              <h4 className="mt-2 text-2xl font-semibold text-slate-100">Network growth</h4>
            </div>
            <Award className="w-8 h-8 text-violet-400" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            {mlmStats.map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-800/80 bg-slate-950/40 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-100">{item.value}</p>
                  </div>
                  <item.icon className="w-6 h-6 text-rose-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel bg-slate-900/60 border border-slate-800 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Jackpot statistics</p>
              <h4 className="mt-2 text-2xl font-semibold text-slate-100">Liquidity overview</h4>
            </div>
            <Gift className="w-8 h-8 text-fuchsia-400" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            {jackpotStats.map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-800/80 bg-slate-950/40 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-100">{item.value}</p>
                  </div>
                  <item.icon className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
