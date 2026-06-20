"use client";

import React from 'react';
import Navbar from '../../../components/Navbar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../lib/api';
import { Gift, Users, Clock, Trophy, AlertCircle } from 'lucide-react';

export default function JackpotPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['jackpots'],
    queryFn: async () => {
      return apiRequest('/features/jackpots');
    },
  });

  const participateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/features/jackpots/participate', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jackpots'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });

  const handleParticipate = () => {
    if (window.confirm("Participating costs 10 USDT from your Main Wallet. Proceed?")) {
      participateMutation.mutate();
    }
  };

  const active = data?.active;
  const history = data?.history || [];

  return (
    <>
      <Navbar title="GMC Jackpot" />
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-wide text-slate-100 flex items-center">
            <Gift className="w-6 h-6 text-fuchsia-400 mr-2" />
            Global Jackpot Pool
          </h2>
          <p className="text-slate-400 text-xs mt-1">Participate in the global jackpot for a chance to win massive rewards.</p>
        </div>

        {isLoading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-800 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-800 rounded"></div>
                <div className="h-4 bg-slate-800 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Active Pool */}
            <div className="lg:col-span-2 space-y-6">
              {active ? (
                <div className="glass-panel p-8 bg-gradient-to-br from-slate-900/80 to-fuchsia-900/20 border border-fuchsia-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
                    <Gift className="w-64 h-64 text-fuchsia-400" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">
                        Round #{active.round} (Live)
                      </span>
                      <div className="flex items-center text-slate-300 text-sm font-medium">
                        <Users className="w-4 h-4 mr-2 text-slate-400" />
                        {active.participants?.length || 0} Participants
                      </div>
                    </div>

                    <p className="text-sm font-bold uppercase tracking-wider text-fuchsia-400">Current Prize Pool</p>
                    <p className="text-5xl font-extrabold mt-2 glow-text-fuchsia text-slate-100">
                      ${parseFloat(active.poolAmount.$numberDecimal || active.poolAmount).toFixed(2)} <span className="text-2xl text-slate-400">USDT</span>
                    </p>

                    <div className="mt-8 flex items-center space-x-4">
                      <button
                        onClick={handleParticipate}
                        disabled={participateMutation.isPending}
                        className="px-6 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 transition-all shadow-lg shadow-fuchsia-900/50 disabled:opacity-50"
                      >
                        {participateMutation.isPending ? 'Processing...' : 'Participate Now (10 USDT)'}
                      </button>
                      <span className="text-xs text-slate-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1 text-amber-400" />
                        Fee deducted from Main Wallet
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-panel p-8 bg-slate-900/40 text-center">
                  <Clock className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-300">No Active Jackpot</h3>
                  <p className="text-slate-500 text-sm mt-2">The next round is being prepared. Please check back later.</p>
                </div>
              )}
              
              {participateMutation.isError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
                  {(participateMutation.error as any).message || 'Failed to join jackpot.'}
                </div>
              )}
            </div>

            {/* History */}
            <div className="glass-panel p-6 bg-slate-900/40">
              <h3 className="text-sm font-bold text-slate-200 tracking-wide mb-6 flex items-center">
                <Trophy className="w-4 h-4 text-amber-400 mr-2" />
                Past Winners
              </h3>
              
              <div className="space-y-4">
                {history.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No past records found.</p>
                ) : (
                  history.map((record: any) => (
                    <div key={record._id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 flex flex-col space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">Round #{record.round}</span>
                        <span className="text-[10px] text-slate-500">{new Date(record.drawnAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Winner</span>
                          <span className="text-sm font-bold text-slate-200">
                            {record.winnerId?.firstName} {record.winnerId?.lastName}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block uppercase">Prize</span>
                          <span className="text-sm font-bold text-emerald-400">
                            ${parseFloat(record.poolAmount.$numberDecimal || record.poolAmount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
