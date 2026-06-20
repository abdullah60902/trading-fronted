"use client";

import React from 'react';
import Navbar from '../../../components/Navbar';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../lib/api';
import { Briefcase, ArrowUpRight, CheckCircle, Clock } from 'lucide-react';

export default function SalaryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my_salary'],
    queryFn: async () => {
      return apiRequest('/features/salaries/me');
    },
  });

  const salary = data?.salary;
  const history = data?.history || [];

  return (
    <>
      <Navbar title="Monthly Salary" />
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-wide text-slate-100 flex items-center">
            <Briefcase className="w-6 h-6 text-emerald-400 mr-2" />
            Salary Rewards
          </h2>
          <p className="text-slate-400 text-xs mt-1">View your rank-based monthly salary and distribution history.</p>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-slate-800 rounded-lg"></div>
            <div className="h-64 bg-slate-800 rounded-lg"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Salary Status */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-panel p-6 bg-slate-900/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Briefcase className="w-32 h-32 text-emerald-400" />
                </div>
                
                <h3 className="text-sm font-bold text-slate-400 tracking-wide uppercase mb-4">Current Status</h3>
                
                {salary ? (
                  <div className="space-y-4 relative z-10">
                    <div>
                      <p className="text-xs text-slate-500">Active Rank</p>
                      <p className="text-xl font-bold text-slate-200 capitalize">{salary.rankName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Monthly Reward</p>
                      <p className="text-3xl font-extrabold text-emerald-400">
                        ${parseFloat(salary.monthlyAmount.$numberDecimal || salary.monthlyAmount).toFixed(2)} <span className="text-sm text-slate-400">{salary.currency}</span>
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-800/50">
                      <p className="text-xs text-slate-500">Last Paid</p>
                      <p className="text-sm font-medium text-slate-300">
                        {salary.lastPaidAt ? new Date(salary.lastPaidAt).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                    <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 mt-0.5" />
                      <p className="text-xs text-emerald-400/80">You are eligible for the next distribution cycle.</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 relative z-10">
                    <Clock className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-300 font-medium">No Active Salary</p>
                    <p className="text-xs text-slate-500 mt-2">Achieve a leadership rank to unlock monthly salary rewards.</p>
                  </div>
                )}
              </div>
            </div>

            {/* History Table */}
            <div className="lg:col-span-2 glass-panel p-6 bg-slate-900/40">
              <h3 className="text-sm font-bold text-slate-200 tracking-wide mb-6">Distribution History</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800/50 text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Description</th>
                      <th className="px-4 py-3 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-slate-500 text-xs">
                          No salary distributions yet.
                        </td>
                      </tr>
                    ) : (
                      history.map((tx: any) => (
                        <tr key={tx._id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            Monthly Salary Distribution
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-400 flex justify-end items-center">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            {parseFloat(tx.amount.$numberDecimal || tx.amount).toFixed(2)} {tx.currency}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
