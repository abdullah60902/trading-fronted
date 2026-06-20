"use client";

import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';
import DashboardStats from './components/DashboardStats';
import UserManagement from './components/UserManagement';
import TransactionManagement from './components/TransactionManagement';
import ContentManagement from './components/ContentManagement';
import JackpotSalaryManagement from './components/JackpotSalaryManagement';
import SystemLogs from './components/SystemLogs';
import StakingManagement from './components/StakingManagement';
import MLMManagement from './components/MLMManagement';
import SupportManagement from './components/SupportManagement';
import { 
  ShieldAlert, 
  Activity, 
  Settings as SettingsIcon, 
  Users, 
  CreditCard, 
  LayoutDashboard,
  Bell,
  Image as ImageIcon,
  Gift,
  Coins,
  Share2,
  LifeBuoy
} from 'lucide-react';

type AdminTab = 
  | 'dashboard' 
  | 'users' 
  | 'transactions' 
  | 'staking'
  | 'mlm'
  | 'content' 
  | 'jackpot' 
  | 'support'
  | 'systemLogs';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'staking', label: 'Staking', icon: Coins },
    { id: 'mlm', label: 'MLM Network', icon: Share2 },
    { id: 'content', label: 'Content & Banners', icon: ImageIcon },
    { id: 'jackpot', label: 'Jackpot & Salaries', icon: Gift },
    { id: 'support', label: 'Support Tickets', icon: LifeBuoy },
    { id: 'systemLogs', label: 'Audit Logs', icon: Activity },
  ] as const;

  return (
    <>
      <Navbar title="Admin Control Panel" />
      <div className="pt-28 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="rounded-4xl border border-slate-800/80 bg-slate-950/80 p-8 shadow-[0_40px_120px_rgba(15,23,42,0.5)] backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.32em] text-rose-500">Admin Dashboard</p>
                <h1 className="text-4xl font-semibold text-slate-100 sm:text-5xl">Platform operations & control</h1>
                <p className="max-w-2xl text-slate-400 text-sm sm:text-base">Manage users, transactions, staking, MLM, jackpots, and system logs from one powerful admin console.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-3xl border border-slate-800/70 bg-slate-900/70 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Live</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-100">Realtime updates</p>
                </div>
                <div className="rounded-3xl border border-slate-800/70 bg-slate-900/70 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Security</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-100">Audit-ready</p>
                </div>
                <div className="rounded-3xl border border-slate-800/70 bg-slate-900/70 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Control</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-100">Full access</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70 p-3 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <div className="flex flex-col gap-3 px-2 py-3 sm:px-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-400">Select admin section</p>
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as AdminTab)}
                  className="block w-full max-w-60 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-500 sm:hidden"
                >
                  {tabs.map((tab) => (
                    <option key={tab.id} value={tab.id}>{tab.label}</option>
                  ))}
                </select>
              </div>

              <div className="hidden sm:flex flex-wrap items-center justify-start gap-3 overflow-x-auto hide-scrollbar">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as AdminTab)}
                      className={`inline-flex min-w-35 items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'border-rose-500/40 bg-rose-500/10 text-rose-300 shadow-[0_0_0_1px_rgba(248,113,113,0.2)]'
                          : 'border-slate-800/70 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:bg-slate-900/95 hover:text-slate-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {activeTab === 'dashboard' && <DashboardStats />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'transactions' && <TransactionManagement />}
            {activeTab === 'staking' && <StakingManagement />}
            {activeTab === 'mlm' && <MLMManagement />}
            {activeTab === 'content' && <ContentManagement />}
            {activeTab === 'jackpot' && <JackpotSalaryManagement />}
            {activeTab === 'support' && <SupportManagement />}
            {activeTab === 'systemLogs' && <SystemLogs />}
          </div>
        </div>
      </div>
    </>
  );
}
