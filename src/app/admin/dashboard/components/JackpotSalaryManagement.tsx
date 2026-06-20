"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../../lib/api';
import { Gift, DollarSign, RefreshCw, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function JackpotSalaryManagement() {
  const [tab, setTab] = useState<'jackpot' | 'salary'>('jackpot');
  const queryClient = useQueryClient();

  // Jackpot Form states
  const [showJackpotForm, setShowJackpotForm] = useState(false);
  const [jackpotRound, setJackpotRound] = useState("");
  const [jackpotPool, setJackpotPool] = useState("");
  const [jackpotMsg, setJackpotMsg] = useState({ text: "", type: "" });

  // Salary Form states
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [salaryEmail, setSalaryEmail] = useState("");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("USDT");
  const [salaryStatus, setSalaryStatus] = useState("active");
  const [salaryMsg, setSalaryMsg] = useState({ text: "", type: "" });

  // Queries
  const { data: jackpots, isLoading: isLoadingJackpots } = useQuery({
    queryKey: ['admin_jackpots'],
    queryFn: () => apiRequest('/admin/jackpots'),
    enabled: tab === 'jackpot',
  });

  const { data: salaries, isLoading: isLoadingSalaries } = useQuery({
    queryKey: ['admin_salaries'],
    queryFn: () => apiRequest('/admin/salaries'),
    enabled: tab === 'salary',
  });

  // Mutations
  const drawJackpotMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/admin/jackpots/${id}/draw`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_jackpots'] });
    },
  });

  const createJackpotMutation = useMutation({
    mutationFn: (body: any) => apiRequest('/admin/jackpots', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    onSuccess: (data) => {
      setJackpotMsg({ text: "Jackpot round created successfully!", type: "success" });
      setJackpotRound("");
      setJackpotPool("");
      queryClient.invalidateQueries({ queryKey: ['admin_jackpots'] });
      setTimeout(() => {
        setShowJackpotForm(false);
        setJackpotMsg({ text: "", type: "" });
      }, 2000);
    },
    onError: (err: any) => {
      setJackpotMsg({ text: err.message || "Failed to create jackpot round.", type: "error" });
    }
  });

  const paySalaryMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/admin/salaries/${id}/pay`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_salaries'] });
    },
  });

  const saveSalaryMutation = useMutation({
    mutationFn: (body: any) => apiRequest('/admin/salaries', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    onSuccess: (data) => {
      setSalaryMsg({ text: "Salary configured successfully!", type: "success" });
      setSalaryEmail("");
      setSalaryAmount("");
      queryClient.invalidateQueries({ queryKey: ['admin_salaries'] });
      setTimeout(() => {
        setShowSalaryForm(false);
        setSalaryMsg({ text: "", type: "" });
      }, 2000);
    },
    onError: (err: any) => {
      setSalaryMsg({ text: err.message || "Failed to save salary config.", type: "error" });
    }
  });

  // Handlers
  const handleCreateJackpot = (e: React.FormEvent) => {
    e.preventDefault();
    setJackpotMsg({ text: "", type: "" });
    createJackpotMutation.mutate({
      round: jackpotRound ? parseInt(jackpotRound) : undefined,
      poolAmount: jackpotPool ? parseFloat(jackpotPool) : 0,
    });
  };

  const handleSaveSalary = (e: React.FormEvent) => {
    e.preventDefault();
    setSalaryMsg({ text: "", type: "" });
    if (!salaryEmail || !salaryAmount) {
      setSalaryMsg({ text: "Email and monthly amount are required.", type: "error" });
      return;
    }
    saveSalaryMutation.mutate({
      email: salaryEmail,
      monthlyAmount: parseFloat(salaryAmount),
      currency: salaryCurrency,
      status: salaryStatus,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Module Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => setTab('jackpot')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            tab === 'jackpot' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-800/40 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Jackpot Pools</span>
        </button>
        <button
          onClick={() => setTab('salary')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            tab === 'salary' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/40 text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Salary Rewards</span>
        </button>
      </div>

      <div className="glass-panel bg-slate-900/40 border border-slate-800 p-6 space-y-6">
        
        {/* ======================================= */}
        {/* JACKPOTS VIEW */}
        {/* ======================================= */}
        {tab === 'jackpot' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-md font-bold text-slate-200">GMC Jackpot Rounds</h4>
                <p className="text-[10px] text-slate-400">Launch new rounds and pick random winners from participants pool.</p>
              </div>
              <button
                onClick={() => setShowJackpotForm(!showJackpotForm)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-purple-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-purple-400 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Initialize Round</span>
              </button>
            </div>

            {/* Initializer Form */}
            {showJackpotForm && (
              <form onSubmit={handleCreateJackpot} className="p-4 bg-slate-950/40 border border-slate-800 rounded-lg max-w-md space-y-4">
                <h5 className="text-xs font-bold text-slate-300 uppercase">New Jackpot Round Config</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-semibold">Round Number (Optional)</label>
                    <input
                      type="number"
                      placeholder="Auto"
                      value={jackpotRound}
                      onChange={e => setJackpotRound(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded p-1.5 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-semibold">Initial Pool (USDT)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={jackpotPool}
                      onChange={e => setJackpotPool(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded p-1.5 focus:outline-none"
                    />
                  </div>
                </div>

                {jackpotMsg.text && (
                  <p className={`text-[10px] flex items-center ${jackpotMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {jackpotMsg.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <AlertCircle className="w-3.5 h-3.5 mr-1" />}
                    {jackpotMsg.text}
                  </p>
                )}

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowJackpotForm(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createJackpotMutation.isPending}
                    className="px-3 py-1.5 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-slate-950 text-[10px] font-bold rounded"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}

            {isLoadingJackpots ? (
              <div className="text-slate-500 text-xs py-4 animate-pulse">Loading jackpots records...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(jackpots || []).map((jackpot: any) => (
                  <div key={jackpot._id} className="p-4 border border-slate-800/80 rounded-lg flex items-center justify-between bg-slate-950/20 hover:border-slate-700/60 transition-colors">
                    <div>
                      <h5 className="font-bold text-slate-200 text-sm">Round {jackpot.round}</h5>
                      <p className="text-xs text-purple-400 font-mono mt-1">
                        Pool: {parseFloat(jackpot.poolAmount.$numberDecimal || jackpot.poolAmount).toFixed(2)} USDT
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">Participants: {jackpot.participants?.length || 0}</p>
                    </div>
                    <div className="text-right">
                      {jackpot.status === 'open' ? (
                        <button
                          onClick={() => drawJackpotMutation.mutate(jackpot._id)}
                          disabled={drawJackpotMutation.isPending || !jackpot.participants?.length}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 text-xs font-bold rounded-lg disabled:opacity-40 transition-all shadow-lg shadow-purple-500/10"
                        >
                          {drawJackpotMutation.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Draw Winner'}
                        </button>
                      ) : (
                        <div className="text-[10px] text-left">
                          <span className="block text-emerald-400 font-bold mb-0.5">Drawn</span>
                          <span className="text-slate-400 max-w-[150px] truncate block">Winner: {jackpot.winnerId?.email || 'N/A'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* SALARIES VIEW */}
        {/* ======================================= */}
        {tab === 'salary' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-md font-bold text-slate-200">Rank-Based Monthly Salaries</h4>
                <p className="text-[10px] text-slate-400">Configure salary tiers for matching downline ranks and dispatch monthly payouts.</p>
              </div>
              <button
                onClick={() => setShowSalaryForm(!showSalaryForm)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Configure Salary</span>
              </button>
            </div>

            {/* Configure Salary Form */}
            {showSalaryForm && (
              <form onSubmit={handleSaveSalary} className="p-4 bg-slate-950/40 border border-slate-800 rounded-lg max-w-md space-y-4">
                <h5 className="text-xs font-bold text-slate-300 uppercase">Save User Salary Tier</h5>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-semibold">User Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={salaryEmail}
                      onChange={e => setSalaryEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded p-1.5 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase block font-semibold">Monthly Amount</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 500"
                        value={salaryAmount}
                        onChange={e => setSalaryAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded p-1.5 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase block font-semibold">Status</label>
                      <select
                        value={salaryStatus}
                        onChange={e => setSalaryStatus(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded p-1.5 focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {salaryMsg.text && (
                  <p className={`text-[10px] flex items-center ${salaryMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {salaryMsg.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <AlertCircle className="w-3.5 h-3.5 mr-1" />}
                    {salaryMsg.text}
                  </p>
                )}

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSalaryForm(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveSalaryMutation.isPending}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-[10px] font-bold rounded"
                  >
                    Save Config
                  </button>
                </div>
              </form>
            )}

            {isLoadingSalaries ? (
              <div className="text-slate-500 text-xs py-4 animate-pulse">Loading salaries records...</div>
            ) : (
              <div className="overflow-x-auto border border-slate-800/80 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/40 text-slate-300 border-b border-slate-800/80">
                      <th className="px-4 py-3 font-semibold">User</th>
                      <th className="px-4 py-3 font-semibold">Monthly Amount</th>
                      <th className="px-4 py-3 font-semibold">Last Paid</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    {(salaries || []).map((salary: any) => (
                      <tr key={salary._id} className="hover:bg-slate-800/10">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-200">{salary.userId?.firstName} {salary.userId?.lastName}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{salary.userId?.email}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">
                          {parseFloat(salary.monthlyAmount.$numberDecimal || salary.monthlyAmount).toFixed(2)} {salary.currency}
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {salary.lastPaidAt ? new Date(salary.lastPaidAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            salary.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {salary.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => paySalaryMutation.mutate(salary._id)}
                            disabled={paySalaryMutation.isPending || salary.status !== 'active'}
                            className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-[10px] font-bold rounded-lg disabled:opacity-40 transition-all"
                          >
                            Pay Salary
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
