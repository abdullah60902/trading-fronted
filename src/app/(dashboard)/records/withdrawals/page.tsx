"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "../../../../components/Navbar";
import { apiRequest } from "../../../../lib/api";
import { ArrowUpRight, Clock, CheckCircle, XCircle } from "lucide-react";

interface Transaction {
  _id: string;
  type: string;
  currency: string;
  amount: { $numberDecimal?: string } | string | number;
  fee: { $numberDecimal?: string } | string | number;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
  metadata?: {
    withdrawalAddress?: string;
    adminFeedback?: string;
    description?: string;
  };
}

export default function WithdrawalRecords() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["withdrawals", page],
    queryFn: async () => {
      // Regular user queries their own withdrawals using type=withdrawal
      const res = await apiRequest(`/wallets/transactions?type=withdrawal`);
      return res; // Returns { transactions: [...] }
    },
  });

  const getAmountString = (tx: Transaction) => {
    if (typeof tx.amount === 'object' && tx.amount !== null && '$numberDecimal' in tx.amount) {
      return parseFloat(tx.amount.$numberDecimal || '0').toFixed(4);
    }
    return parseFloat(String(tx.amount || 0)).toFixed(4);
  };

  const getFeeString = (tx: Transaction) => {
    if (typeof tx.fee === 'object' && tx.fee !== null && '$numberDecimal' in tx.fee) {
      return parseFloat(tx.fee.$numberDecimal || '0').toFixed(4);
    }
    return parseFloat(String(tx.fee || 0)).toFixed(4);
  };

  const transactions: Transaction[] = data?.transactions || [];

  return (
    <>
      <Navbar title="Withdrawal Records" />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Withdrawal History
            </h2>
            <p className="text-xs text-slate-400 mt-1">Review all your personal blockchain withdrawal records.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12 glass-panel bg-slate-900/40">
            <span className="text-slate-400 text-sm animate-pulse">Loading withdrawal records...</span>
          </div>
        ) : error ? (
          <div className="p-6 glass-panel border border-red-500/20 bg-slate-900/40 text-center">
            <p className="text-red-400 font-semibold text-sm">Failed to retrieve withdrawal records.</p>
            <p className="text-slate-500 text-xs mt-1">Please try again later.</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 glass-panel text-center bg-slate-900/40 border border-slate-800">
            <ArrowUpRight className="h-10 w-10 text-slate-500 mx-auto mb-3 animate-pulse" />
            <p className="text-slate-300 font-medium">No withdrawals found</p>
            <p className="text-slate-500 text-xs mt-1">Submit a withdrawal request inside the Wallet system.</p>
          </div>
        ) : (
          <div className="glass-panel bg-slate-900/40 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/40 text-slate-300 border-b border-slate-800/80 font-medium">
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Fee</th>
                    <th className="px-6 py-4">Currency</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Dest Address / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-400">
                        {tx._id}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-semibold text-rose-400">
                        -{getAmountString(tx)}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {getFeeString(tx)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-100">
                        {tx.currency}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                          tx.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          tx.status === "rejected" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                          "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {tx.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {tx.status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
                          {tx.status === "pending" && <Clock className="w-3 h-3 mr-1 animate-spin" />}
                          <span className="capitalize">{tx.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 max-w-xs truncate">
                        {tx.metadata?.withdrawalAddress ? (
                          <span className="font-mono">{tx.metadata.withdrawalAddress}</span>
                        ) : tx.metadata?.adminFeedback ? (
                          <span className="text-rose-400/80 italic">{tx.metadata.adminFeedback}</span>
                        ) : (
                          tx.metadata?.description || "—"
                        )}
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
                disabled={transactions.length < limit}
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
