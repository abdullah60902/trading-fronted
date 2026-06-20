"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "../../../../components/Navbar";
import { apiRequest } from "../../../../lib/api";
import { ArrowUpDown, Download, Search, Filter, RefreshCw } from "lucide-react";

interface Transaction {
  _id: string;
  type: string;
  currency: string;
  amount: { $numberDecimal?: string } | string | number;
  fee: { $numberDecimal?: string } | string | number;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
  metadata?: {
    description?: string;
    earningType?: string;
    fromSubWallet?: string;
    toSubWallet?: string;
    isInternal?: boolean;
    txHash?: string;
  };
}

export default function TransactionRecords() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const limit = 10;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["transactions", page, search, typeFilter],
    queryFn: async () => {
      let url = `/wallets/transactions?page=${page}`;
      if (typeFilter !== "all") {
        url += `&type=${typeFilter}`;
      }
      const res = await apiRequest(url);
      return res; // Returns { transactions: [...] }
    },
  });

  const getAmountString = (tx: Transaction) => {
    if (typeof tx.amount === 'object' && tx.amount !== null && '$numberDecimal' in tx.amount) {
      return parseFloat(tx.amount.$numberDecimal || '0').toFixed(4);
    }
    const val = parseFloat(String(tx.amount || 0));
    return val > 0 ? `+${val.toFixed(4)}` : val.toFixed(4);
  };

  const getAmountColor = (tx: Transaction) => {
    const amt = typeof tx.amount === 'object' && tx.amount !== null && '$numberDecimal' in tx.amount
      ? parseFloat(tx.amount.$numberDecimal || '0')
      : parseFloat(String(tx.amount || 0));
    if (tx.type === 'deposit' || tx.type === 'earnings') return 'text-emerald-400';
    if (tx.type === 'withdrawal') return 'text-rose-400';
    return amt >= 0 ? 'text-emerald-400' : 'text-rose-400';
  };

  const transactions: Transaction[] = data?.transactions || [];

  // Filter client-side based on search query (id or metadata descriptions)
  const filteredTx = transactions.filter(tx => {
    if (!search) return true;
    const s = search.toLowerCase();
    const idMatch = tx._id.toLowerCase().includes(s);
    const descMatch = tx.metadata?.description?.toLowerCase().includes(s) || false;
    const typeMatch = tx.type.toLowerCase().includes(s);
    const earnTypeMatch = tx.metadata?.earningType?.toLowerCase().includes(s) || false;
    return idMatch || descMatch || typeMatch || earnTypeMatch;
  });

  // Client-side CSV Export helper
  const exportToCSV = () => {
    if (filteredTx.length === 0) return;
    
    const headers = ["Transaction ID", "Date", "Type", "Sub-Type", "Amount", "Currency", "Fee", "Status", "Details"];
    const rows = filteredTx.map(tx => {
      const amt = typeof tx.amount === 'object' && tx.amount !== null && '$numberDecimal' in tx.amount
        ? tx.amount.$numberDecimal
        : tx.amount;
      const fee = typeof tx.fee === 'object' && tx.fee !== null && '$numberDecimal' in tx.fee
        ? tx.fee.$numberDecimal
        : tx.fee;
      
      const subType = tx.metadata?.earningType || 
                      (tx.metadata?.isInternal ? "Internal Transfer" : "") || 
                      "";
      const details = tx.metadata?.description || 
                      (tx.metadata?.fromSubWallet ? `${tx.metadata.fromSubWallet} -> ${tx.metadata.toSubWallet}` : "") || 
                      tx.metadata?.txHash || 
                      "";
      
      return [
        tx._id,
        new Date(tx.createdAt).toLocaleString(),
        tx.type,
        subType,
        amt,
        tx.currency,
        fee,
        tx.status,
        details.replace(/"/g, '""') // escape double quotes for CSV
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transaction_history_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Navbar title="Transaction Ledger" />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              All Transactions
            </h2>
            <p className="text-xs text-slate-400 mt-1">Unified transaction history ledger for all account wallets.</p>
          </div>
          <button
            onClick={exportToCSV}
            disabled={filteredTx.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold rounded-lg text-xs shadow-lg shadow-cyan-500/10 transition-all duration-150"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 glass-panel bg-slate-900/40 border border-slate-800">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by ID or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/80 focus:border-cyan-500 text-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none transition-colors"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/80 focus:border-cyan-500 text-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none appearance-none transition-colors"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="transfer">Internal Transfers</option>
              <option value="trade">Exchange Trades</option>
              <option value="earnings">Earnings Payouts</option>
            </select>
            <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <div className="flex justify-end items-center">
            <button
              onClick={() => refetch()}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-xs text-slate-300 hover:text-slate-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Ledger</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12 glass-panel bg-slate-900/40">
            <span className="text-slate-400 text-sm animate-pulse">Loading transactions...</span>
          </div>
        ) : error ? (
          <div className="p-6 glass-panel border border-red-500/20 bg-slate-900/40 text-center">
            <p className="text-red-400 font-semibold text-sm">Failed to retrieve transaction ledger.</p>
          </div>
        ) : filteredTx.length === 0 ? (
          <div className="p-12 glass-panel text-center bg-slate-900/40 border border-slate-800">
            <ArrowUpDown className="h-10 w-10 text-slate-500 mx-auto mb-3 animate-pulse" />
            <p className="text-slate-300 font-medium">No transactions match filters</p>
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
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Currency</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {filteredTx.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-400">
                        {tx._id}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 capitalize font-semibold text-slate-200">
                        {tx.type}
                        {tx.metadata?.earningType && (
                          <span className="text-[10px] block font-normal text-cyan-400 capitalize">
                            {tx.metadata.earningType}
                          </span>
                        )}
                      </td>
                      <td className={`px-6 py-4 font-bold ${getAmountColor(tx)}`}>
                        {getAmountString(tx)}
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
                          <span className="capitalize">{tx.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 max-w-sm truncate">
                        {tx.metadata?.description || (
                          tx.metadata?.fromSubWallet ? `Internal: ${tx.metadata.fromSubWallet} to ${tx.metadata.toSubWallet}` : "—"
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
