"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "../../../../components/Navbar";
import { apiRequest } from "../../../../lib/api";
import { Coins, CheckCircle, Clock, ShieldCheck, TrendingUp } from "lucide-react";

interface StakingPlan {
  _id: string;
  currency: string;
  lockedCapital: { $numberDecimal?: string } | string | number;
  totalRewardLimit: { $numberDecimal?: string } | string | number;
  totalRewardEarned: { $numberDecimal?: string } | string | number;
  monthlyRatePct: number;
  status: 'active' | 'completed';
  startedAt: string;
  lastPayoutAt: string;
}

export default function StakingRecords() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["stakingStats"],
    queryFn: async () => {
      return apiRequest("/staking/stats");
    },
  });

  const activePlans: StakingPlan[] = data?.activePlans || [];
  const completedPlans: StakingPlan[] = data?.completedPlans || [];
  const stats = data?.stats || {
    activeCapital: 0,
    totalLockedCapital: 0,
    totalRewardsClaimed: 0,
    remainingRewards: 0,
    estimatedMonthlyRewards: 0,
  };

  const getDecimalString = (val: any) => {
    if (typeof val === 'object' && val !== null && '$numberDecimal' in val) {
      return parseFloat(val.$numberDecimal || '0').toFixed(2);
    }
    return parseFloat(String(val || 0)).toFixed(2);
  };

  const getRewardProgress = (plan: StakingPlan) => {
    const earned = typeof plan.totalRewardEarned === 'object' && plan.totalRewardEarned !== null && '$numberDecimal' in plan.totalRewardEarned
      ? parseFloat(plan.totalRewardEarned.$numberDecimal || '0')
      : parseFloat(String(plan.totalRewardEarned || 0));
    const limit = typeof plan.totalRewardLimit === 'object' && plan.totalRewardLimit !== null && '$numberDecimal' in plan.totalRewardLimit
      ? parseFloat(plan.totalRewardLimit.$numberDecimal || '0')
      : parseFloat(String(plan.totalRewardLimit || 0));
    
    if (limit === 0) return 0;
    return Math.min(100, (earned / limit) * 100);
  };

  return (
    <>
      <Navbar title="Staking Records" />
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Staking Investment History
          </h2>
          <p className="text-xs text-slate-400 mt-1">Track locked assets, reward distribution status, and earnings caps.</p>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-4 bg-slate-900/40 border border-slate-800 flex items-center space-x-4">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Active Capital</p>
              <h3 className="text-lg font-bold text-slate-100">{stats.activeCapital.toFixed(2)} USDT</h3>
            </div>
          </div>
          <div className="glass-panel p-4 bg-slate-900/40 border border-slate-800 flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Total Rewards Earned</p>
              <h3 className="text-lg font-bold text-slate-100">{stats.totalRewardsClaimed.toFixed(2)} USDT</h3>
            </div>
          </div>
          <div className="glass-panel p-4 bg-slate-900/40 border border-slate-800 flex items-center space-x-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Est. Monthly Earnings</p>
              <h3 className="text-lg font-bold text-slate-100">{stats.estimatedMonthlyRewards.toFixed(2)} USDT</h3>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12 glass-panel bg-slate-900/40">
            <span className="text-slate-400 text-sm animate-pulse">Loading investment plans...</span>
          </div>
        ) : error ? (
          <div className="p-6 glass-panel border border-red-500/20 bg-slate-900/40 text-center">
            <p className="text-red-400 font-semibold text-sm">Failed to retrieve staking statistics.</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Active Plans Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center">
                <Clock className="w-4 h-4 text-cyan-400 mr-2" />
                Active Staking Contracts ({activePlans.length})
              </h3>
              {activePlans.length === 0 ? (
                <div className="p-8 glass-panel text-center bg-slate-900/20 text-slate-500 text-xs border border-slate-800/60">
                  No active staking plans found. Lock assets in Staking Plan dashboard to start receiving rewards.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activePlans.map((plan) => (
                    <div key={plan._id} className="glass-panel p-5 bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 transition-all duration-150 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 block">ID: {plan._id}</span>
                          <h4 className="text-md font-bold text-slate-200 mt-0.5">{getDecimalString(plan.lockedCapital)} {plan.currency} locked</h4>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {plan.monthlyRatePct}% Monthly
                        </span>
                      </div>

                      {/* Reward Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Progress to 3x Cap</span>
                          <span>{getDecimalString(plan.totalRewardEarned)} / {getDecimalString(plan.totalRewardLimit)} {plan.currency}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300"
                            style={{ width: `${getRewardProgress(plan)}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-500 block text-right">{getRewardProgress(plan).toFixed(1)}% Completed</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/40 text-[10px] text-slate-400">
                        <div>
                          <span className="block text-slate-500 font-bold uppercase">Staked Date</span>
                          <span className="text-slate-300">{new Date(plan.startedAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500 font-bold uppercase">Last Distribution</span>
                          <span className="text-slate-300">
                            {plan.lastPayoutAt ? new Date(plan.lastPayoutAt).toLocaleDateString() : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Plans Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center">
                <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
                Completed Contracts ({completedPlans.length})
              </h3>
              {completedPlans.length === 0 ? (
                <div className="p-6 glass-panel text-center bg-slate-900/20 text-slate-500 text-xs border border-slate-800/60">
                  No completed staking plans yet.
                </div>
              ) : (
                <div className="glass-panel bg-slate-900/40 border border-slate-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950/40 text-slate-300 border-b border-slate-800/80 font-medium">
                          <th className="px-6 py-3">Staking ID</th>
                          <th className="px-6 py-3">Locked Capital</th>
                          <th className="px-6 py-3">Total Earned</th>
                          <th className="px-6 py-3">Rate</th>
                          <th className="px-6 py-3">Staking Term</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 text-slate-300">
                        {completedPlans.map((plan) => (
                          <tr key={plan._id} className="hover:bg-slate-800/10">
                            <td className="px-6 py-3 font-mono text-slate-400">{plan._id}</td>
                            <td className="px-6 py-3 font-semibold text-slate-200">{getDecimalString(plan.lockedCapital)} {plan.currency}</td>
                            <td className="px-6 py-3 text-emerald-400 font-bold">{getDecimalString(plan.totalRewardEarned)} {plan.currency}</td>
                            <td className="px-6 py-3">{plan.monthlyRatePct}%</td>
                            <td className="px-6 py-3 text-slate-400">
                              {new Date(plan.startedAt).toLocaleDateString()} - {new Date(plan.lastPayoutAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-3">
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium">
                                Completed (3x Reached)
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </>
  );
}
