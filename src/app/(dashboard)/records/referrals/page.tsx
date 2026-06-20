"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "../../../../components/Navbar";
import { apiRequest } from "../../../../lib/api";
import { Share2, Users, ArrowDownLeft, Clock, DollarSign } from "lucide-react";

interface EarningTransaction {
  _id: string;
  type: string;
  currency: string;
  amount: { $numberDecimal?: string } | string | number;
  createdAt: string;
  metadata?: {
    earningType: 'referral' | 'team' | 'rank' | 'salary' | 'jackpot' | 'daily';
    description?: string;
    sourceUserId?: string;
    level?: number;
  };
}

export default function ReferralRecords() {
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data, isLoading, error } = useQuery({
    queryKey: ["referralEarnings", page],
    queryFn: async () => {
      // Querying all earnings logs
      const res = await apiRequest("/staking/earnings");
      return res; // Returns { earnings: [...] }
    },
  });

  const earningsList: EarningTransaction[] = data?.earnings || [];

  // Filter MLM commissions only (referral & team)
  const commissionTx = earningsList.filter(
    (tx) => tx.metadata?.earningType === "referral" || tx.metadata?.earningType === "team"
  );

  const getAmountString = (tx: EarningTransaction) => {
    if (typeof tx.amount === 'object' && tx.amount !== null && '$numberDecimal' in tx.amount) {
      return parseFloat(tx.amount.$numberDecimal || '0').toFixed(4);
    }
    return parseFloat(String(tx.amount || 0)).toFixed(4);
  };

  return (
    <>
      <Navbar title="MLM Earnings Ledger" />
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Referral & Team Income Logs
            </h2>
            <p className="text-xs text-slate-400 mt-1">Real-time ledger of multi-level commission payouts (Levels 1, 2, and 3).</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12 glass-panel bg-slate-900/40">
            <span className="text-slate-400 text-sm animate-pulse">Loading referral earnings logs...</span>
          </div>
        ) : error ? (
          <div className="p-6 glass-panel border border-red-500/20 bg-slate-900/40 text-center">
            <p className="text-red-400 font-semibold text-sm">Failed to retrieve MLM commissions ledger.</p>
          </div>
        ) : commissionTx.length === 0 ? (
          <div className="p-12 glass-panel text-center bg-slate-900/40 border border-slate-800">
            <Share2 className="h-10 w-10 text-slate-500 mx-auto mb-3 animate-pulse" />
            <p className="text-slate-300 font-medium">No referral commissions yet</p>
            <p className="text-slate-500 text-xs mt-1">Share your unique referral link to start building your 3-level team.</p>
          </div>
        ) : (
          <div className="glass-panel bg-slate-900/40 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/40 text-slate-300 border-b border-slate-800/80 font-medium">
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">MLM Level</th>
                    <th className="px-6 py-4">Commission</th>
                    <th className="px-6 py-4">Details / Contributor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {commissionTx.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-400">
                        {tx._id}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded font-medium text-[10px] ${
                          tx.metadata?.earningType === 'referral'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}>
                          {tx.metadata?.earningType === 'referral' ? 'Direct Referrals' : 'Team Upline'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-200">
                        L{tx.metadata?.level || 1}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">
                        +{getAmountString(tx)} {tx.currency}
                      </td>
                      <td className="px-6 py-4 text-slate-300 max-w-sm truncate">
                        {tx.metadata?.description || "Referral commission credited"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-800/40 flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 font-medium transition-colors border border-slate-700/50"
              >
                Previous
              </button>
              <span className="text-slate-400 text-xs">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={commissionTx.length < limit}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 font-medium transition-colors border border-slate-700/50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
