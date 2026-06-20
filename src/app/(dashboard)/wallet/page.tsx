"use client";

import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../lib/api';
import { useAppSelector } from '../../../store/hooks';
import { 
  ArrowRight, 
  Download, 
  Upload, 
  RefreshCw, 
  ArrowLeftRight, 
  QrCode, 
  ShieldCheck 
} from 'lucide-react';

export default function WalletSystem() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'transfer' | 'history'>('deposit');
  const user = useAppSelector((state) => state.auth.user);

  // Forms states
  const [currency, setCurrency] = useState<'USD' | 'BTC' | 'ETH' | 'USDT'>('USDT');
  
  // Deposit state
  const [depAmount, setDepAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Crypto Transfer');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [depSuccess, setDepSuccess] = useState('');
  const [depError, setDepError] = useState('');

  // Withdrawal state
  const [withAmount, setWithAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [withSuccess, setWithSuccess] = useState('');
  const [withError, setWithError] = useState('');

  // Internal Transfer state
  const [fromWallet, setFromWallet] = useState('deposit');
  const [toWallet, setToWallet] = useState('main');
  const [transAmount, setTransAmount] = useState('');
  const [transSuccess, setTransSuccess] = useState('');
  const [transError, setTransError] = useState('');

  // Fetch balances
  const { data: balanceData, refetch: refetchBalances } = useQuery({
    queryKey: ['balances'],
    queryFn: async () => {
      const res = await apiRequest('/wallets/balances');
      return res.wallets;
    },
  });

  // Fetch histories
  const { data: txnData, refetch: refetchTxns } = useQuery({
    queryKey: ['history_transactions'],
    queryFn: async () => {
      const res = await apiRequest('/wallets/transactions');
      return res.transactions;
    },
  });

  // Find active wallet address based on currency selection
  const currentWallet = balanceData?.find((w: any) => w.currency === currency);
  const currentAddress = currentWallet?.depositAddress || 'loading...';

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepSuccess('');
    setDepError('');
    try {
      await apiRequest('/wallets/deposit-request', {
        method: 'POST',
        body: JSON.stringify({
          currency,
          amount: Number(depAmount),
          paymentMethod,
          screenshotUrl,
        }),
      });
      setDepSuccess('Deposit request submitted! Please wait for admin verification.');
      setDepAmount('');
      setScreenshotUrl('');
      refetchTxns();
    } catch (err: any) {
      setDepError(err.message || 'Deposit submission failed.');
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithSuccess('');
    setWithError('');
    try {
      await apiRequest('/wallets/withdraw', {
        method: 'POST',
        body: JSON.stringify({
          currency,
          amount: Number(withAmount),
          recipientAddress,
          twoFactorToken: user?.twoFactorEnabled ? twoFactorToken : undefined,
        }),
      });
      setWithSuccess('Withdrawal request submitted for approval!');
      setWithAmount('');
      setRecipientAddress('');
      setTwoFactorToken('');
      refetchBalances();
      refetchTxns();
    } catch (err: any) {
      setWithError(err.message || 'Withdrawal request failed.');
    }
  };

  const handleInternalTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransSuccess('');
    setTransError('');
    try {
      await apiRequest('/wallets/transfer-internal', {
        method: 'POST',
        body: JSON.stringify({
          currency,
          amount: Number(transAmount),
          fromWallet,
          toWallet,
        }),
      });
      setTransSuccess(`Transferred ${transAmount} ${currency} from ${fromWallet} to ${toWallet} Wallet!`);
      setTransAmount('');
      refetchBalances();
      refetchTxns();
    } catch (err: any) {
      setTransError(err.message || 'Internal transfer failed.');
    }
  };

  return (
    <>
      <Navbar title="Wallet & Funds Manager" />

      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Balances Display Board */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {['USD', 'BTC', 'ETH', 'USDT'].map((curr) => {
            const wallet = balanceData?.find((w: any) => w.currency === curr);
            const main = Number(wallet?.mainBalance?.$numberDecimal || wallet?.mainBalance || 0);
            const dep = Number(wallet?.depositBalance?.$numberDecimal || wallet?.depositBalance || 0);
            const earn = Number(wallet?.earningsBalance?.$numberDecimal || wallet?.earningsBalance || 0);
            const withDr = Number(wallet?.withdrawalBalance?.$numberDecimal || wallet?.withdrawalBalance || 0);
            const total = main + dep + earn + withDr;

            return (
              <div key={curr} className="glass-panel p-6 bg-slate-900/40 relative overflow-hidden border border-slate-800">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-slate-100">{curr} System</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
                    Total: {total.toFixed(4)}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Main Balance:</span>
                    <span className="font-bold text-slate-200">{main.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Deposit Balance:</span>
                    <span className="font-bold text-slate-200">{dep.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Earnings Balance:</span>
                    <span className="font-bold text-slate-200">{earn.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Withdrawal Balance:</span>
                    <span className="font-bold text-slate-200">{withDr.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 space-x-6 text-sm font-semibold">
          {[
            { id: 'deposit', label: 'Deposit System', icon: Download },
            { id: 'withdraw', label: 'Withdrawal System', icon: Upload },
            { id: 'transfer', label: 'Internal Transfer', icon: ArrowLeftRight },
            { id: 'history', label: 'Wallet History', icon: RefreshCw }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 pb-4 transition-all duration-150 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-cyan-400 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Panels */}
        <div className="glass-panel p-8 bg-slate-900/40">
          
          {/* Tab 1: Deposit System */}
          {activeTab === 'deposit' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">Fund Deposit Wallet</h3>
                <p className="text-slate-400 text-xs mb-6">Select a currency, transfer to the address below, and upload payment screenshots.</p>
                
                <form onSubmit={handleDepositSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-2 font-semibold">Asset Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="USDT">USDT (Tether USD)</option>
                      <option value="BTC">BTC (Bitcoin)</option>
                      <option value="ETH">ETH (Ethereum)</option>
                      <option value="USD">USD (Bank Deposit)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-2 font-semibold">Amount to Deposit</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 500"
                      value={depAmount}
                      onChange={(e) => setDepAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-2 font-semibold">Payment Method</label>
                    <input
                      type="text"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-2 font-semibold">Screenshot Proof URL</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. https://imgur.com/image.png"
                      value={screenshotUrl}
                      onChange={(e) => setScreenshotUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {depSuccess && <p className="text-emerald-400 text-xs">{depSuccess}</p>}
                  {depError && <p className="text-rose-400 text-xs">{depError}</p>}

                  <button type="submit" className="neon-btn-cyan w-full py-3 rounded-lg text-xs font-bold mt-4">
                    Submit Deposit Request
                  </button>
                </form>
              </div>

              {/* Deposit Address Box */}
              <div className="flex flex-col justify-center items-center p-8 bg-slate-950/40 border border-slate-800 rounded-xl">
                <QrCode className="h-28 w-28 text-cyan-400 mb-4 animate-pulse" />
                <span className="text-xs font-bold text-slate-300 block mb-2">Deposit Destination Address</span>
                <code className="text-[11px] text-cyan-400 select-all p-3 bg-slate-900 border border-slate-800 rounded-lg text-center break-all max-w-full">
                  {currentAddress}
                </code>
                <p className="text-[10px] text-slate-500 mt-4 text-center">
                  Only transfer {currency} to this address. Credits are posted after admin verifies screenshot proof.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Withdrawal System */}
          {activeTab === 'withdraw' && (
            <div className="max-w-xl">
              <h3 className="text-lg font-bold text-slate-100 mb-2">Request Funds Withdrawal</h3>
              <p className="text-slate-400 text-xs mb-6">Withdraw from your Withdrawal Wallet. Withdrawals are verified by administration.</p>

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-2 font-semibold">Asset Currency</label>
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
                  <label className="text-xs text-slate-400 block mb-2 font-semibold">Amount to Withdraw</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150"
                    value={withAmount}
                    onChange={(e) => setWithAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Available in Withdrawal Wallet: {Number(currentWallet?.withdrawalBalance?.$numberDecimal || currentWallet?.withdrawalBalance || 0).toFixed(4)} {currency}
                  </span>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-2 font-semibold">Destination Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter external address details"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                {user?.twoFactorEnabled && (
                  <div>
                    <label className="text-xs text-slate-400 block mb-2 font-semibold flex items-center space-x-1">
                      <ShieldCheck className="h-4 w-4 text-purple-400" />
                      <span>2FA Authenticator Token</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="6 digit TOTP"
                      value={twoFactorToken}
                      onChange={(e) => setTwoFactorToken(e.target.value)}
                      className="w-full bg-slate-950 border border-purple-800/60 rounded-lg p-3 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                )}

                {withSuccess && <p className="text-emerald-400 text-xs">{withSuccess}</p>}
                {withError && <p className="text-rose-400 text-xs">{withError}</p>}

                <button type="submit" className="neon-btn-purple w-full py-3 rounded-lg text-xs font-bold mt-4">
                  Request Withdrawal
                </button>
              </form>
            </div>
          )}

          {/* Tab 3: Internal Transfer */}
          {activeTab === 'transfer' && (
            <div className="max-w-xl">
              <h3 className="text-lg font-bold text-slate-100 mb-2">Internal Sub-Wallet Transfer</h3>
              <p className="text-slate-400 text-xs mb-6">Move funds within your account between Main, Deposit, Earnings, and Withdrawal wallets.</p>

              <form onSubmit={handleInternalTransferSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-2 font-semibold">Asset Currency</label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-2 font-semibold">Source Sub-Wallet</label>
                    <select
                      value={fromWallet}
                      onChange={(e) => setFromWallet(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="deposit">Deposit Wallet</option>
                      <option value="main">Main Wallet</option>
                      <option value="earnings">Earnings Wallet</option>
                      <option value="withdrawal">Withdrawal Wallet</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-2 font-semibold">Destination Sub-Wallet</label>
                    <select
                      value={toWallet}
                      onChange={(e) => setToWallet(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="main">Main Wallet</option>
                      <option value="deposit">Deposit Wallet</option>
                      <option value="earnings">Earnings Wallet</option>
                      <option value="withdrawal">Withdrawal Wallet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-2 font-semibold">Amount to Transfer</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50"
                    value={transAmount}
                    onChange={(e) => setTransAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block capitalize">
                    Available in Source: {Number(currentWallet?.[`${fromWallet}Balance` as keyof typeof currentWallet] || 0).toFixed(4)} {currency}
                  </span>
                </div>

                {transSuccess && <p className="text-emerald-400 text-xs">{transSuccess}</p>}
                {transError && <p className="text-rose-400 text-xs">{transError}</p>}

                <button type="submit" className="neon-btn-cyan w-full py-3 rounded-lg text-xs font-bold mt-4 flex items-center justify-center space-x-2">
                  <span>Confirm Transfer</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {/* Tab 4: Wallet History */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-200">Activity History</h3>
                <button
                  onClick={() => refetchTxns()}
                  className="p-2 bg-slate-850 hover:bg-slate-850/60 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                {!txnData || txnData.length === 0 ? (
                  <p className="text-xs text-slate-500">No logs found.</p>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500">
                        <th className="pb-3 font-semibold">Type</th>
                        <th className="pb-3 font-semibold">Currency</th>
                        <th className="pb-3 font-semibold">Amount</th>
                        <th className="pb-3 font-semibold">Sub-Wallet Info</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {txnData.map((tx: any) => {
                        const amt = Number(tx.amount.$numberDecimal || tx.amount || 0);
                        const isInternal = tx.metadata?.isInternal;
                        
                        return (
                          <tr key={tx._id} className="border-b border-slate-800/40 text-slate-300">
                            <td className="py-3 capitalize font-semibold">{tx.type}</td>
                            <td className="py-3">{tx.currency}</td>
                            <td className={`py-3 font-bold ${amt >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {amt >= 0 ? '+' : ''}{amt.toFixed(4)}
                            </td>
                            <td className="py-3 text-slate-400 capitalize">
                              {isInternal 
                                ? `${tx.metadata.fromSubWallet} → ${tx.metadata.toSubWallet}` 
                                : tx.type === 'deposit' 
                                ? `To: ${tx.metadata?.paymentMethod || 'Deposit Wallet'}` 
                                : tx.type === 'withdrawal'
                                ? `To: ${tx.recipientAddress?.substring(0, 15)}...`
                                : '-'
                              }
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
          )}

        </div>

      </div>
    </>
  );
}
