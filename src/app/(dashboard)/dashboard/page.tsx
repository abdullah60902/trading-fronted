"use client";

import React from 'react';
import Navbar from '../../../components/Navbar';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../lib/api';
import { useAppDispatch } from '../../../store/hooks';
import PriceChart from './components/PriceChart';
import AnnouncementSlider from '../../../components/AnnouncementSlider';
import { setWallets } from '../../../store/walletSlice';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  RefreshCw 
} from 'lucide-react';

export default function Dashboard() {
  const dispatch = useAppDispatch();

  // 1. Fetch Wallets / Balances
  const { data: walletData, isLoading: walletLoading, refetch: refetchWallets } = useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      const res = await apiRequest('/wallets/balances');
      dispatch(setWallets(res.wallets));
      return res.wallets;
    },
  });

  // 2. Fetch Transactions / History
  const { data: txnData, isLoading: txnLoading, refetch: refetchTxns } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await apiRequest('/wallets/transactions');
      return res.transactions;
    },
  });

  const handleRefresh = () => {
    refetchWallets();
    refetchTxns();
  };

  const { data: coinsData } = useQuery({
    queryKey: ['coinsMarkets'],
    queryFn: async () => {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/v1/coins/markets');
      return res.json();
    },
    refetchInterval: 60000, // Refetch real prices every minute
  });

  // Live Rates for USD aggregation
  const [liveRates, setLiveRates] = React.useState<Record<string, number>>({
    'USD': 1,
    'USDT': 1,
    'BTC': 65000,
    'ETH': 3500,
  });

  React.useEffect(() => {
    if (coinsData && Array.isArray(coinsData)) {
      const newRates: Record<string, number> = { 'USD': 1, 'USDT': 1 };
      coinsData.forEach((c: any) => {
        newRates[c.symbol.toUpperCase()] = c.current_price;
      });
      setLiveRates(prev => ({ ...prev, ...newRates }));
    }
  }, [coinsData]);

  // Aggregate stats in USD
  let totalBalance = 0;
  let mainBalanceUSD = 0;
  let depositBalanceUSD = 0;
  let earningsBalanceUSD = 0;
  let withdrawalBalanceUSD = 0;

  if (walletData) {
    walletData.forEach((w: any) => {
      const rate = liveRates[w.currency] || 1;
      const mainVal = Number(w.mainBalance.$numberDecimal || w.mainBalance || 0) * rate;
      const depVal = Number(w.depositBalance.$numberDecimal || w.depositBalance || 0) * rate;
      const earnVal = Number(w.earningsBalance.$numberDecimal || w.earningsBalance || 0) * rate;
      const withdrawVal = Number(w.withdrawalBalance.$numberDecimal || w.withdrawalBalance || 0) * rate;

      mainBalanceUSD += mainVal;
      depositBalanceUSD += depVal;
      earningsBalanceUSD += earnVal;
      withdrawalBalanceUSD += withdrawVal;
      totalBalance += (mainVal + depVal + earnVal + withdrawVal);
    });
  }

  // Aggregate deposits, withdrawals, and earnings from transaction logs
  let totalDepositedUSD = 0;
  let totalWithdrawnUSD = 0;
  let totalEarningsUSD = 0;

  if (txnData) {
    txnData.forEach((tx: any) => {
      const rate = liveRates[tx.currency] || 1;
      const amt = Number(tx.amount.$numberDecimal || tx.amount || 0);

      if (tx.status === 'completed') {
        if (tx.type === 'deposit') {
          totalDepositedUSD += Math.abs(amt) * rate;
        } else if (tx.type === 'withdrawal') {
          totalWithdrawnUSD += Math.abs(amt) * rate;
        } else if (tx.type === 'earnings') {
          totalEarningsUSD += Math.abs(amt) * rate;
        }
      }
    });
  }

  // Mock data for live asset progress graph
  const chartData = [
    { name: 'Jan', Balance: totalBalance * 0.82 },
    { name: 'Feb', Balance: totalBalance * 0.88 },
    { name: 'Mar', Balance: totalBalance * 0.94 },
    { name: 'Apr', Balance: totalBalance * 0.91 },
    { name: 'May', Balance: totalBalance * 0.97 },
    { name: 'Jun', Balance: totalBalance },
  ];

  return (
    <>
      <Navbar title="User Dashboard" />

      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Announcement Slider */}
        <AnnouncementSlider />
        {/* Upper Header Control */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-wide text-slate-100">Welcome Back</h2>
            <p className="text-slate-400 text-xs mt-1">Here is a quick summary of your trading performance.</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-semibold transition-all duration-150"
          >
            <RefreshCw className="h-4 w-4 animate-spin-hover" />
            <span>Sync Balances</span>
          </button>
        </div>

        {/* Aggregate Balance Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: Total Net Worth */}
          <div className="glass-panel p-6 bg-gradient-neon relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="h-20 w-20 text-cyan-400" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">Total Net Worth</p>
            <p className="text-3xl font-extrabold mt-2 glow-text-cyan text-slate-100">
              ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 mt-2">Combined balance across 4 sub-wallets</p>
          </div>

          {/* Card 2: Total Deposits */}
          <div className="glass-panel p-6 bg-slate-900/40">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Total Approved Deposits</p>
            <p className="text-3xl font-extrabold mt-2 text-slate-100">
              ${totalDepositedUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 mt-2">Funded via deposit screenshot verification</p>
          </div>

          {/* Card 3: Total Withdrawals */}
          <div className="glass-panel p-6 bg-slate-900/40">
            <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-400">Total Withdrawals</p>
            <p className="text-3xl font-extrabold mt-2 text-slate-100">
              ${totalWithdrawnUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 mt-2">Processed and approved transactions</p>
          </div>

          {/* Card 4: Total Earnings */}
          <div className="glass-panel p-6 bg-slate-900/40">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-400">Total Yield Earnings</p>
            <p className="text-3xl font-extrabold mt-2 glow-text-purple text-slate-100">
              ${totalEarningsUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 mt-2">Yield from staking and bonuses</p>
          </div>
        </div>

        {/* Sub-Wallet Balances Breakout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/20 border border-slate-800 rounded-lg p-4">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Main Wallet</span>
            <span className="text-lg font-bold text-slate-200 mt-1 block">${mainBalanceUSD.toFixed(2)}</span>
          </div>
          <div className="bg-slate-900/20 border border-slate-800 rounded-lg p-4">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Deposit Wallet</span>
            <span className="text-lg font-bold text-slate-200 mt-1 block">${depositBalanceUSD.toFixed(2)}</span>
          </div>
          <div className="bg-slate-900/20 border border-slate-800 rounded-lg p-4">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Earnings Wallet</span>
            <span className="text-lg font-bold text-slate-200 mt-1 block">${earningsBalanceUSD.toFixed(2)}</span>
          </div>
          <div className="bg-slate-900/20 border border-slate-800 rounded-lg p-4">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Withdrawal Wallet</span>
            <span className="text-lg font-bold text-slate-200 mt-1 block">${withdrawalBalanceUSD.toFixed(2)}</span>
          </div>
        </div>

        {/* Charts & Tickers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="col-span-2">
            <PriceChart liveRates={liveRates} coinsData={coinsData} />
          </div>

          {/* Asset Split Ticker */}
          <div className="glass-panel p-6 bg-slate-900/40 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 tracking-wide mb-4">Currency Holdings</h3>
              <div className="space-y-4">
                {walletLoading ? (
                  <p className="text-xs text-slate-500">Loading wallets...</p>
                ) : (
                  walletData?.map((w: any) => {
                    const balance =
                      Number(w.mainBalance.$numberDecimal || w.mainBalance || 0) +
                      Number(w.depositBalance.$numberDecimal || w.depositBalance || 0) +
                      Number(w.earningsBalance.$numberDecimal || w.earningsBalance || 0) +
                      Number(w.withdrawalBalance.$numberDecimal || w.withdrawalBalance || 0);

                    return (
                      <div key={w._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/25 border border-slate-800">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-cyan-400">
                            {w.currency}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-300 block">{w.currency} Assets</span>
                            <span className="text-[10px] text-emerald-400 block font-medium animate-pulse">
                              Live: ${(liveRates[w.currency] || 1).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-200 block">{balance.toFixed(4)}</span>
                          <span className="text-[10px] text-slate-500 block">
                            ${(balance * (liveRates[w.currency] || 1)).toFixed(2)} USD
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="glass-panel p-6 bg-slate-900/40">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-200 tracking-wide">Recent Transactions</h3>
            <span className="text-xs text-cyan-400 font-semibold">Activity Ledger</span>
          </div>

          <div className="overflow-x-auto">
            {txnLoading ? (
              <p className="text-xs text-slate-500">Loading transactions...</p>
            ) : !txnData || txnData.length === 0 ? (
              <p className="text-xs text-slate-500">No transactions recorded yet.</p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Currency</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {txnData.slice(0, 10).map((tx: any) => {
                    const amt = Number(tx.amount.$numberDecimal || tx.amount || 0);
                    const isPositive = amt > 0;
                    
                    return (
                      <tr key={tx._id} className="border-b border-slate-800/40 text-slate-300 hover:bg-slate-800/10">
                        <td className="py-3 capitalize flex items-center space-x-2">
                          {isPositive ? (
                            <ArrowDownLeft className="h-4 w-4 text-emerald-400 bg-emerald-500/10 rounded" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-rose-400 bg-rose-500/10 rounded" />
                          )}
                          <span>{tx.type}</span>
                        </td>
                        <td className="py-3 font-semibold text-slate-200">{tx.currency}</td>
                        <td className={`py-3 font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? '+' : ''}
                          {amt.toFixed(4)}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.status === 'completed' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : tx.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">
                          {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
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
