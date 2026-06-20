"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearCredentials } from '../store/authSlice';
import { apiRequest } from '../lib/api';
import { 
  LayoutDashboard, 
  Wallet, 
  Layers, 
  ShieldAlert, 
  Settings, 
  LogOut, 
  Coins,
  Users,
  Share2,
  Gift,
  Briefcase,
  LifeBuoy,
  TrendingUp,
  Bell,
  BarChart3
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      dispatch(clearCredentials());
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('authState');
        window.localStorage.removeItem('adminAuth');
        window.localStorage.removeItem('refreshToken');
      }
      router.push('/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Market Charts', path: '/chart', icon: BarChart3 },
    { name: 'Wallet System', path: '/wallet', icon: Wallet },
    { name: 'Staking Plan', path: '/staking', icon: Coins },
    { name: 'Earnings Hub', path: '/earnings', icon: TrendingUp },
    { name: 'Referrals', path: '/referrals', icon: Share2 },
    { name: 'My Team', path: '/team', icon: Users },
    { name: 'GMC Jackpot', path: '/jackpot', icon: Gift },
    { name: 'My Salary', path: '/salary', icon: Briefcase },
    { name: 'Support', path: '/support', icon: LifeBuoy },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings & 2FA', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-30 backdrop-blur-md">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Layers className="h-8 w-8 text-cyan-400 animate-pulse" />
          <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            CRYPTOPLATFORM
          </span>
        </Link>
      </div>

      {/* Nav Link List */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-400 border-l-2 border-cyan-400'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Session profile / Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-slate-950 font-bold shrink-0">
              {user?.firstName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-200 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 rounded-lg text-slate-400 hover:text-red-400 text-sm font-medium transition-all duration-150"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
