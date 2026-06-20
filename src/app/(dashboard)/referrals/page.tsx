"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../../lib/api';
import { 
  Share2, 
  Copy, 
  Check, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Award,
  Link as LinkIcon,
  ChevronRight,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

interface ReferralStats {
  directReferralsCount: number;
  totalTeamCount: number;
  totalReferralEarnings: number;
  totalTeamEarnings: number;
  totalCombinedEarnings: number;
  activeStakingTeamCount: number;
  totalTeamSales: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  referredBy: string;
  level: number;
  commissionsEarned: number;
  individualSales: number;
}

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralLink, setReferralLink] = useState<string>('');
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const statsRes = await apiRequest('/referral/stats');
      setStats(statsRes.stats);
      setReferralCode(statsRes.referralCode);
      setReferralLink(statsRes.referralLink);

      const teamRes = await apiRequest('/referral/team');
      setTeam(teamRes.team || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch referral data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter direct referrals (Level 1)
  const directReferrals = team.filter(member => member.level === 1);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm animate-pulse">Loading referral analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 text-center max-w-lg mx-auto mt-12 border border-rose-500/20">
        <h3 className="text-rose-400 font-semibold text-lg mb-2">Error Loading Data</h3>
        <p className="text-slate-400 text-sm mb-6">{error}</p>
        <button 
          onClick={fetchData} 
          className="neon-btn-cyan px-6 py-2.5 rounded-lg text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 glow-text-cyan flex items-center gap-2">
          <Share2 className="h-8 w-8 text-cyan-400" />
          Referral Center
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Invite members, grow your multi-level network, and earn direct & team commission.
        </p>
      </div>

      {/* Referral Link Showcase Card */}
      <div className="glass-panel p-6 bg-gradient-neon relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-400 animate-bounce" />
              Build Your Downline
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Earn <strong>5% direct commission</strong> from Level 1, <strong>3% team commission</strong> from Level 2, and <strong>1% team commission</strong> from Level 3. Share your link with friends.
            </p>
          </div>

          {/* Code & Link Box */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto min-w-[320px] sm:min-w-[450px]">
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-3 flex items-center justify-between gap-4 flex-1">
              <div className="truncate">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Your Referral Link</p>
                <p className="text-xs text-cyan-400 font-medium truncate mt-0.5">{referralLink}</p>
              </div>
              <button 
                onClick={handleCopyLink}
                className="text-slate-400 hover:text-cyan-400 transition-colors p-1.5 hover:bg-slate-800/40 rounded-md shrink-0"
                title="Copy Link"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-5 py-3 flex flex-col justify-center items-center shrink-0">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Code</span>
              <span className="text-sm font-bold text-purple-400 tracking-wider mt-0.5">{referralCode}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earned */}
        <div className="glass-panel p-6 glass-panel-hover relative overflow-hidden">
          <div className="absolute top-4 right-4 h-10 w-10 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
            <DollarSign className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Total Earnings</p>
          <p className="text-2xl font-bold text-slate-200 mt-2 glow-text-cyan">
            ${stats?.totalCombinedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>Direct: ${stats?.totalReferralEarnings.toFixed(2)}</span>
            <span>Team: ${stats?.totalTeamEarnings.toFixed(2)}</span>
          </div>
        </div>

        {/* Direct Referrals Count */}
        <div className="glass-panel p-6 glass-panel-hover relative overflow-hidden">
          <div className="absolute top-4 right-4 h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
            <UserCheck className="h-5 w-5 text-purple-400" />
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Direct Referrals</p>
          <p className="text-2xl font-bold text-slate-200 mt-2 glow-text-purple">
            {stats?.directReferralsCount}
          </p>
          <div className="mt-4 pt-4 border-t border-slate-800/60 text-xs text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">Level 1</span>
            <span>immediate downline network size</span>
          </div>
        </div>

        {/* Total Team Size */}
        <div className="glass-panel p-6 glass-panel-hover relative overflow-hidden">
          <div className="absolute top-4 right-4 h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
            <Users className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Total Team Size</p>
          <p className="text-2xl font-bold text-slate-200 mt-2 glow-text-green">
            {stats?.totalTeamCount}
          </p>
          <div className="mt-4 pt-4 border-t border-slate-800/60 text-xs text-slate-400 flex justify-between">
            <span>Active Staking: {stats?.activeStakingTeamCount}</span>
            <Link href="/team" className="text-cyan-400 hover:underline flex items-center">
              Tree View <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Total Team Sales */}
        <div className="glass-panel p-6 glass-panel-hover relative overflow-hidden">
          <div className="absolute top-4 right-4 h-10 w-10 bg-yellow-500/10 rounded-lg flex items-center justify-center border border-yellow-500/20">
            <TrendingUp className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Team Staking Sales</p>
          <p className="text-2xl font-bold text-slate-200 mt-2 text-yellow-500">
            ${stats?.totalTeamSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-4 pt-4 border-t border-slate-800/60 text-xs text-slate-400">
            <span>Total network locked investment value</span>
          </div>
        </div>
      </div>

      {/* Direct Referrals List */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              Direct Referrals List
            </h3>
            <p className="text-xs text-slate-400">Members registered directly with your link (Level 1)</p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 font-semibold">
            {directReferrals.length} direct users
          </span>
        </div>

        {directReferrals.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg">
            <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-slate-400 font-semibold mb-1">No direct referrals yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Your direct referrals will appear here once they sign up with your code.
            </p>
            <button 
              onClick={handleCopyLink} 
              className="px-4 py-2 border border-slate-800 rounded-lg hover:border-slate-700 text-xs text-slate-300 font-medium transition-colors"
            >
              {copied ? 'Copied Link!' : 'Copy Invitation Link'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Locked Staking</th>
                  <th className="py-3 px-4 text-right">Commissions Generated</th>
                  <th className="py-3 px-4 text-right">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {directReferrals.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-900/20 text-slate-300 transition-colors">
                    <td className="py-4 px-4 font-medium text-slate-200">{member.name}</td>
                    <td className="py-4 px-4 text-xs text-slate-400">{member.email}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        member.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : member.status === 'suspended'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-200 text-xs">
                      ${member.individualSales.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right text-emerald-400 font-bold text-xs">
                      +${member.commissionsEarned.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right text-xs text-slate-400">
                      {new Date(member.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
