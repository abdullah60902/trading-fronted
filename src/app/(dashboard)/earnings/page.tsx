"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "../../../components/Navbar";
import { apiRequest } from "../../../lib/api";
import {
  TrendingUp,
  Coins,
  Share2,
  Users,
  Briefcase,
  Gift,
  ArrowDownLeft,
  Calendar,
  Wallet
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface EarningItem {
  _id: string;
  type: string;
  currency: string;
  amount: { $numberDecimal?: string } | string | number;
  createdAt: string;
  metadata?: {
    earningType: 'referral' | 'team' | 'rank' | 'salary' | 'jackpot' | 'daily' | 'staking';
    description?: string;
  };
}

export default function EarningsHub() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const { data: earningsData, isLoading, error } = useQuery({
    queryKey: ["earningsHubData"],
    queryFn: async () => {
      // Fetch all user earnings logs from backend
      return apiRequest("/staking/earnings"); // returns { earnings: [...] }
    },
  });

  const rawEarnings: EarningItem[] = earningsData?.earnings || [];

  const getAmountNumber = (item: EarningItem) => {
    if (typeof item.amount === 'object' && item.amount !== null && '$numberDecimal' in item.amount) {
      return parseFloat(item.amount.$numberDecimal || '0');
    }
    return parseFloat(String(item.amount || 0));
  };

  // Group and calculate totals for each type
  let totalStaking = 0;
  let totalReferral = 0;
  let totalTeam = 0;
  let totalSalary = 0;
  let totalJackpot = 0;
  let totalDaily = 0;

  rawEarnings.forEach((item) => {
    const amt = getAmountNumber(item);
    const type = item.metadata?.earningType || 'staking'; // default to staking if not specified
    if (type === 'staking' || type === 'daily') totalStaking += amt;
    else if (type === 'referral') totalReferral += amt;
    else if (type === 'team') totalTeam += amt;
    else if (type === 'salary') totalSalary += amt;
    else if (type === 'jackpot') totalJackpot += amt;
  });

  const grandTotal = totalStaking + totalReferral + totalTeam + totalSalary + totalJackpot;

  // Data for Pie Chart
  const pieData = [
    { name: "Staking Rewards", value: totalStaking, color: "#22d3ee" }, // cyan
    { name: "Direct Referrals", value: totalReferral, color: "#a855f7" }, // purple
    { name: "Team Uplines", value: totalTeam, color: "#3b82f6" }, // blue
    { name: "Rank Salaries", value: totalSalary, color: "#f43f5e" }, // rose
    { name: "Jackpot Wins", value: totalJackpot, color: "#eab308" }, // yellow
  ].filter(item => item.value > 0);

  // Fallback if no values yet
  const displayPieData = pieData.length > 0 ? pieData : [
    { name: "No Earnings", value: 1, color: "#475569" }
  ];

  // Group by date for line chart (last 7 payments)
  const chartData = rawEarnings.slice(0, 15).reverse().map((item) => ({
    date: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    amount: getAmountNumber(item),
    type: item.metadata?.earningType || 'staking'
  }));

  const filteredEarnings = rawEarnings.filter((item) => {
    if (activeTab === "all") return true;
    const type = item.metadata?.earningType || 'staking';
    if (activeTab === "staking") return type === "staking" || type === "daily";
    return type === activeTab;
  });

  return (
    <>
      <Navbar title="Earnings Hub" />
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="glass-panel p-6 bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-cyan-400" />
              Earnings Hub
            </h2>
            <p className="text-xs text-slate-400 mt-1">Analyze and review your accumulated interest rewards, MLM levels commissions, and bonuses.</p>
          </div>
          <div className="bg-slate-950/60 px-5 py-3 rounded-lg border border-slate-800 flex items-center space-x-3">
            <Wallet className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Grand Earnings Total</p>
              <h4 className="text-xl font-black text-cyan-400">{grandTotal.toFixed(4)} USDT</h4>
            </div>
          </div>
        </div>

        {/* Analytics Section (Pie Chart & Trend Chart) */}
        {rawEarnings.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Area Chart - Growth Trend */}
            <div className="lg:col-span-2 glass-panel p-5 bg-slate-900/40 border border-slate-800 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Earnings Growth Flow</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                      labelClassName="text-slate-400 text-[10px]"
                    />
                    <Area type="monotone" dataKey="amount" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" name="Earned" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart - Distribution Breakdown */}
            <div className="glass-panel p-5 bg-slate-900/40 border border-slate-800 flex flex-col justify-between space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Rewards Distribution</h3>
              <div className="h-48 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {displayPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                      labelStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend details */}
              <div className="space-y-1 text-[10px] text-slate-400">
                {displayPieData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="flex items-center">
                      <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-semibold text-slate-200">
                      {item.name === "No Earnings" ? "—" : `${item.value.toFixed(2)} USDT`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Earning Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          
          <div className="glass-panel p-4 bg-slate-900/40 border border-slate-800 space-y-2 hover:border-slate-700/80 transition-colors">
            <Coins className="w-5 h-5 text-cyan-400" />
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Staking Plan</p>
            <h3 className="text-md font-bold text-slate-100">{totalStaking.toFixed(2)} USDT</h3>
          </div>

          <div className="glass-panel p-4 bg-slate-900/40 border border-slate-800 space-y-2 hover:border-slate-700/80 transition-colors">
            <Share2 className="w-5 h-5 text-purple-400" />
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Direct MLM</p>
            <h3 className="text-md font-bold text-slate-100">{totalReferral.toFixed(2)} USDT</h3>
          </div>

          <div className="glass-panel p-4 bg-slate-900/40 border border-slate-800 space-y-2 hover:border-slate-700/80 transition-colors">
            <Users className="w-5 h-5 text-blue-400" />
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Team Network</p>
            <h3 className="text-md font-bold text-slate-100">{totalTeam.toFixed(2)} USDT</h3>
          </div>

          <div className="glass-panel p-4 bg-slate-900/40 border border-slate-800 space-y-2 hover:border-slate-700/80 transition-colors">
            <Briefcase className="w-5 h-5 text-rose-400" />
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Monthly Salary</p>
            <h3 className="text-md font-bold text-slate-100">{totalSalary.toFixed(2)} USDT</h3>
          </div>

          <div className="glass-panel p-4 bg-slate-900/40 border border-slate-800 space-y-2 hover:border-slate-700/80 transition-colors col-span-2 md:col-span-1">
            <Gift className="w-5 h-5 text-yellow-400" />
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Jackpot Pool</p>
            <h3 className="text-md font-bold text-slate-100">{totalJackpot.toFixed(2)} USDT</h3>
          </div>

        </div>

        {/* Tab Filters & Records Table */}
        <div className="space-y-4">
          <div className="flex border-b border-slate-800 pb-2 overflow-x-auto hide-scrollbar">
            <div className="flex space-x-2">
              {[
                { id: "all", label: "All Rewards" },
                { id: "staking", label: "Staking" },
                { id: "referral", label: "Direct Referral" },
                { id: "team", label: "Team Network" },
                { id: "salary", label: "Salary" },
                { id: "jackpot", label: "Jackpot" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-500 text-xs">Loading ledger logs...</div>
          ) : error ? (
            <div className="p-4 text-center text-rose-400 text-xs">Failed to load ledger records.</div>
          ) : filteredEarnings.length === 0 ? (
            <div className="p-12 glass-panel text-center bg-slate-900/40 border border-slate-800">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No payout logs available under this category.</p>
            </div>
          ) : (
            <div className="glass-panel bg-slate-900/40 border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/40 text-slate-300 border-b border-slate-800/80 font-medium">
                      <th className="px-6 py-4">Reference ID</th>
                      <th className="px-6 py-4">Payout Date</th>
                      <th className="px-6 py-4">Reward Type</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Currency</th>
                      <th className="px-6 py-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {filteredEarnings.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="px-6 py-4 font-mono text-slate-400">{item._id}</td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 capitalize font-semibold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            item.metadata?.earningType === 'referral' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            item.metadata?.earningType === 'team' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            item.metadata?.earningType === 'salary' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            item.metadata?.earningType === 'jackpot' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                            'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}>
                            {item.metadata?.earningType || 'Staking'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-emerald-400">
                          +{getAmountNumber(item).toFixed(4)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-100">{item.currency}</td>
                        <td className="px-6 py-4 text-slate-400 max-w-xs truncate">
                          {item.metadata?.description || "Weekly staking reward payout"}
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
    </>
  );
}
