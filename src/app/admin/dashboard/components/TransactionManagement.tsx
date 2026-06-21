"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../../lib/api';
import { Check, X, Eye } from 'lucide-react';

export default function TransactionManagement() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState('deposit'); // 'deposit' or 'withdrawal'
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin_transactions', type],
    queryFn: async () => {
      const endpoint = type === 'deposit' ? '/wallets/deposits' : '/wallets/withdrawals';
      return apiRequest(endpoint);
    },
  });

  const processMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) => {
      const endpoint = type === 'deposit' ? `/wallets/deposits/${id}/action` : `/wallets/withdrawals/${id}/action`;
      return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_transactions'] });
    },
  });

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse">Loading transactions...</div>;

  const transactions = data?.requests || [];
  const totalPages = 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-slate-100">Transaction Approvals</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => { setType('deposit'); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === 'deposit' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Deposits
          </button>
          <button
            onClick={() => { setType('withdrawal'); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === 'withdrawal' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Withdrawals
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-300">User</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Amount</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Date</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              ) : null}
              {transactions.map((tx: any) => (
                <tr key={tx._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-200">{tx.userId?.firstName} {tx.userId?.lastName}</div>
                    <div className="text-xs text-slate-500">{tx.userId?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-200">
                      {parseFloat(tx.amount.$numberDecimal || tx.amount || 0).toFixed(2)} {tx.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      tx.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {tx.status === 'pending' && (
                      <>
                        <button
                          onClick={() => processMutation.mutate({ id: tx._id, action: 'approve' })}
                          disabled={processMutation.isPending}
                          className="p-1 text-emerald-400 hover:bg-emerald-400/10 rounded transition-colors"
                          title="Approve"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => processMutation.mutate({ id: tx._id, action: 'reject' })}
                          disabled={processMutation.isPending}
                          className="p-1 text-rose-400 hover:bg-rose-400/10 rounded transition-colors"
                          title="Reject"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button className="p-1 text-slate-400 hover:bg-slate-800 rounded transition-colors" title="View Details">
                      <Eye className="w-5 h-5" />
                    </button>
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
            Previous
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
