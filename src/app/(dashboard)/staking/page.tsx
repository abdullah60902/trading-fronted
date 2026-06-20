"use client";

import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../lib/api';
import { Coins, Flame, Percent, RefreshCw, Layers, ShieldAlert } from 'lucide-react';

export default function StakingSystem() {
  const [stakeAmount, setStakeAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'BTC' | 'ETH' | 'USDT'>('USDT');
  const [activeSubTab, setActiveSubTab] = useState<'staking' | 'daily' | 'referral' | 'team' | 'rank' | 'salary' | 'jackpot'>('staking');
  const [stakeSuccess, setStakeSuccess] = useState('');
  const [stakeError, setStakeError] = useState('');
  const [cronRunning, setCronRunning] = useState(false);
  const [cronMessage, setCronMessage] = useState('');

  // Fetch balances (to verify main wallet)
  const { data: balanceData, refetch: refetchBalances } = useQuery({
    queryKey: ['balances_staking'],
    queryFn: async () => {
      const res = await apiRequest('/wallets/balances');
      return res.wallets;
    },
  });

  // Fetch staking stats and active plans
  const { data: stakingData, isLoading: statsLoading, refetch: refetchStaking } = useQuery({
    queryKey: ['staking_stats'],
    queryFn: async () => {
      const res = await apiRequest('/staking/stats');
      return res;
    },
  });

  // Fetch earnings history based on selected sub tab
  const { data: earningsData, isLoading: earningsLoading, refetch: refetchEarnings } = useQuery({
    queryKey: ['earnings', activeSubTab],
    queryFn: async () => {
      const res = await apiRequest(`/staking/earnings?earningType=${activeSubTab}`);
      return res.earnings;
    },
  });

  const currentWallet = balanceData?.find((w: any) => w.currency === currency);
  const availableBalance = Number(currentWallet?.mainBalance?.$numberDecimal || currentWallet?.mainBalance || 0);

  const handleStakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStakeSuccess('');
    setStakeError('');
    try {
      await apiRequest('/staking/stake', {
        method: 'POST',
        body: JSON.stringify({
          currency,
          amount: Number(stakeAmount),
        }),
      });
      setStakeSuccess('Staking plan successfully initialized! Capital locked.');
      setStakeAmount('');
      refetchBalances();
      refetchStaking();
    } catch (err: any) {
      setStakeError(err.message || 'Staking failed.');
    }
  };

  // Run staking yield payout manual trigger
  const handleTriggerPayout = async () => {
    setCronRunning(true);
    setCronMessage('');
    try {
      const res = await apiRequest('/staking/trigger-payout', { method: 'POST' });
      setCronMessage(`Success! Distributed yield. Paid: ${res.result.earningsPaid.toFixed(4)} assets across ${res.result.processedCount} active plans.`);
      refetchBalances();
      refetchStaking();
      refetchEarnings();
    } catch (err: any) {
      setCronMessage(err.message || 'Manual payout run failed.');
    } finally {
      setCronRunning(false);
    }
  };

  return (
    <>
      <Navbar title="Staking & Yield Platform" />

      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Yield Control Panel & Trigger */}
        <div className="glass-panel p-6 bg-purple-950/20 border border-purple-800/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <Flame className="h-10 w-10 text-purple-400 animate-bounce" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">Manual Yield Distribution Payout</h3>
              <p className="text-xs text-slate-400">Trigger the yield calculation cron job immediately to pay out 10%/30 daily staking rewards for testing.</p>
            </div>
          </div>
          <button
            onClick={handleTriggerPayout}
            disabled={cronRunning}
            className="neon-btn-purple px-6 py-3 rounded-lg text-xs font-semibold flex items-center space-x-2 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${cronRunning ? 'animate-spin' : ''}`} />
            <span>{cronRunning ? 'Paying Yield...' : 'Trigger Yield Cron'}</span>
          </button>
        </div>
        {cronMessage && (
          <p className="text-xs font-bold text-purple-400 bg-purple-900/10 border border-purple-800/30 p-3 rounded-lg text-center">
            {cronMessage}
          </p>
        )}

        {/* Dashboard Analytics Counters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Staked Capital</span>
            <span className="text-2xl font-bold text-slate-100 mt-2 block">
              ${Number(stakingData?.stats?.activeCapital || 0).toFixed(2)} USD
            </span>
            <span className="text-[9px] text-slate-500 block mt-1">Generating 10% monthly rewards</span>
          </div>

          <div className="glass-panel p-6 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Rewards Claimed</span>
            <span className="text-2xl font-bold text-slate-100 mt-2 block">
              ${Number(stakingData?.stats?.totalRewardsClaimed || 0).toFixed(2)} USD
            </span>
            <span className="text-[9px] text-slate-500 block mt-1">Accumulated staking payouts</span>
          </div>

          <div className="glass-panel p-6 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Remaining Rewards Pool</span>
            <span className="text-2xl font-bold text-slate-100 mt-2 block text-cyan-400">
              ${Number(stakingData?.stats?.remainingRewards || 0).toFixed(2)} USD
            </span>
            <span className="text-[9px] text-slate-500 block mt-1">Unreleased limit until 3x cap</span>
          </div>

          <div className="glass-panel p-6 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Monthly Rewards</span>
            <span className="text-2xl font-bold text-emerald-400 mt-2 block">
              +${Number(stakingData?.stats?.estimatedMonthlyRewards || 0).toFixed(2)} USD
            </span>
            <span className="text-[9px] text-slate-500 block mt-1">Based on active plans size</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Lock Staking form */}
          <div className="glass-panel p-6 bg-slate-900/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Coins className="h-5 w-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100">Lock Coins in Staking Plan</h3>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg mb-6 text-xs space-y-2">
                <p className="text-slate-400 font-semibold flex items-center space-x-1">
                  <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-amber-500 uppercase">Locking Disclaimers:</span>
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                  <li>Staked coins become permanently locked in the contract.</li>
                  <li>Locked coins can never be withdrawn, unstaked, or returned.</li>
                  <li>Monthly rewards are 10% paid daily (~0.33% daily).</li>
                  <li>Rewards cease and plan closes automatically at 300% (3x) returns.</li>
                </ul>
              </div>

              <form onSubmit={handleStakeSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-2 font-semibold">Staking Asset</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="USD">USD</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-2 font-semibold">Amount to Stake</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 100"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Available in Main Wallet: {availableBalance.toFixed(4)} {currency}
                  </span>
                </div>

                {stakeSuccess && <p className="text-emerald-400 text-xs">{stakeSuccess}</p>}
                {stakeError && <p className="text-rose-400 text-xs">{stakeError}</p>}

                <button type="submit" className="neon-btn-cyan w-full py-3 rounded-lg text-xs font-bold mt-4">
                  Lock & Stake Capital
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Active Plans Tracker */}
          <div className="glass-panel p-6 bg-slate-900/40 col-span-2 space-y-6">
            <h3 className="text-sm font-bold text-slate-200">Active Staking Contracts</h3>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
              {statsLoading ? (
                <p className="text-xs text-slate-500">Loading active plans...</p>
              ) : !stakingData?.activePlans || stakingData.activePlans.length === 0 ? (
                <p className="text-xs text-slate-500">No active staking contracts found.</p>
              ) : (
                stakingData.activePlans.map((plan: any) => {
                  const cap = Number(plan.lockedCapital?.$numberDecimal || plan.lockedCapital || 0);
                  const earned = Number(plan.totalRewardEarned?.$numberDecimal || plan.totalRewardEarned || 0);
                  const limit = Number(plan.totalRewardLimit?.$numberDecimal || plan.totalRewardLimit || (cap * 3));
                  const percent = Math.min((earned / limit) * 100, 100);

                  return (
                    <div key={plan._id} className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <Layers className="h-4 w-4 text-cyan-400" />
                          <span className="font-bold text-slate-200">{cap} {plan.currency} locked</span>
                        </div>
                        <span className="text-slate-500 text-[10px]">{new Date(plan.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">Payout Progress (Limit: {limit} {plan.currency})</span>
                          <span className="text-cyan-400 font-bold">{percent.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500" style={{ width: `${percent}%` }} />
                        </div>
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Paid: {earned.toFixed(4)} {plan.currency}</span>
                        <span>Remaining: {(limit - earned).toFixed(4)} {plan.currency}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Staking History & Earnings Modules breakdown */}
        <div className="glass-panel p-6 bg-slate-900/40">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-4">
            <h3 className="text-sm font-bold text-slate-200">Earnings Distribution Modules</h3>
            
            {/* Earnings Category Selectors */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { id: 'staking', label: 'Staking Yield' },
                { id: 'daily', label: 'Daily Bonus' },
                { id: 'referral', label: 'Referrals' },
                { id: 'team', label: 'Team Bonus' },
                { id: 'rank', label: 'Rank Incentives' },
                { id: 'salary', label: 'Salary Yield' },
                { id: 'jackpot', label: 'Jackpots' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveSubTab(m.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors duration-150 ${
                    activeSubTab === m.id
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Earnings ledger table */}
          <div className="overflow-x-auto">
            {earningsLoading ? (
              <p className="text-xs text-slate-500">Loading earnings history...</p>
            ) : !earningsData || earningsData.length === 0 ? (
              <p className="text-xs text-slate-500">No earnings recorded in this category yet.</p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="pb-3 font-semibold">Transaction ID</th>
                    <th className="pb-3 font-semibold">Module</th>
                    <th className="pb-3 font-semibold">Currency</th>
                    <th className="pb-3 font-semibold">Amount Credited</th>
                    <th className="pb-3 font-semibold">Details / Memo</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {earningsData.map((e: any) => {
                    const amt = Number(e.amount.$numberDecimal || e.amount || 0);
                    return (
                      <tr key={e._id} className="border-b border-slate-800/40 text-slate-300">
                        <td className="py-3 font-mono text-[10px] text-slate-500">{e._id}</td>
                        <td className="py-3 capitalize text-purple-400 font-semibold">{e.metadata?.earningType || 'staking'}</td>
                        <td className="py-3 font-semibold">{e.currency}</td>
                        <td className="py-3 font-extrabold text-emerald-400">+{amt.toFixed(6)}</td>
                        <td className="py-3 text-slate-400">{e.metadata?.description || 'Earnings payout'}</td>
                        <td className="py-3 text-slate-500">
                          {new Date(e.createdAt).toLocaleDateString()} {new Date(e.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
