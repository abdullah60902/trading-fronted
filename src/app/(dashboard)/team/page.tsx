"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../../lib/api';
import { 
  Users, 
  ChevronRight, 
  GitFork, 
  DollarSign, 
  UserPlus, 
  Calendar, 
  Network,
  RotateCcw,
  Search,
  Filter
} from 'lucide-react';

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

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interactive filtering states
  const [selectedL1, setSelectedL1] = useState<string | null>(null);
  const [selectedL2, setSelectedL2] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    setLoading(true);
    setError('');
    try {
      const statsRes = await apiRequest('/referral/stats');
      setStats(statsRes.stats);

      const teamRes = await apiRequest('/referral/team');
      setTeam(teamRes.team || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch team details');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedL1(null);
    setSelectedL2(null);
    setSearchQuery('');
  };

  const handleSelectL1 = (id: string) => {
    if (selectedL1 === id) {
      setSelectedL1(null); // deselect
      setSelectedL2(null);
    } else {
      setSelectedL1(id);
      setSelectedL2(null); // reset L2 selection when L1 changes
    }
  };

  const handleSelectL2 = (id: string) => {
    if (selectedL2 === id) {
      setSelectedL2(null);
    } else {
      setSelectedL2(id);
    }
  };

  // Helper to resolve sponsor name
  const resolveSponsorName = (sponsorId: string) => {
    const found = team.find(member => member.id === sponsorId);
    return found ? found.name : "You (Direct)";
  };

  // Filter team members based on level and interactive selections
  const l1Members = team.filter(m => m.level === 1 && m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const l2Members = team.filter(m => {
    const matchesLevel = m.level === 2;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesL1Selection = selectedL1 ? m.referredBy === selectedL1 : true;
    return matchesLevel && matchesSearch && matchesL1Selection;
  });

  const l3Members = team.filter(m => {
    const matchesLevel = m.level === 3;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // If L2 selected, must match L2 sponsor. If only L1 selected, must match one of the L2 members referred by that L1
    let matchesParentSelection = true;
    if (selectedL2) {
      matchesParentSelection = m.referredBy === selectedL2;
    } else if (selectedL1) {
      const allowedL2s = team.filter(l2 => l2.level === 2 && l2.referredBy === selectedL1).map(l2 => l2.id);
      matchesParentSelection = allowedL2s.includes(m.referredBy);
    }
    
    return matchesLevel && matchesSearch && matchesParentSelection;
  });

  // Calculate totals for currently visible team
  const totalCommissionsEarned = team.reduce((sum, m) => sum + m.commissionsEarned, 0);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm animate-pulse">Loading team structure...</p>
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
          onClick={fetchTeamData} 
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 glow-text-cyan flex items-center gap-2">
            <Network className="h-8 w-8 text-cyan-400 animate-pulse" />
            My Team Downline
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Monitor downline growth, track multi-level sales, and browse downline hierarchy.
          </p>
        </div>

        {/* Search & Reset */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search team member..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 w-[200px] sm:w-[250px] transition-colors"
            />
          </div>
          {(selectedL1 || selectedL2 || searchQuery) && (
            <button 
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400 hover:text-cyan-400 transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Network Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="h-10 w-10 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20 shrink-0">
            <Users className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Network Size</p>
            <p className="text-lg font-bold text-slate-200 mt-0.5">{team.length} Members</p>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20 shrink-0">
            <DollarSign className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Network Sales</p>
            <p className="text-lg font-bold text-slate-200 mt-0.5">
              ${stats?.totalTeamSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 shrink-0">
            <UserPlus className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Your MLM Commissions</p>
            <p className="text-lg font-bold text-slate-200 mt-0.5">
              ${totalCommissionsEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Tree Visualization (Three Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEVEL 1 COLUMN */}
        <div className="glass-panel p-5 flex flex-col h-[600px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs flex items-center justify-center font-bold">1</span>
              <h3 className="font-bold text-sm text-slate-300">Level 1 (Directs)</h3>
            </div>
            <span className="text-xs text-slate-500 bg-slate-900 border border-slate-800/60 rounded-full px-2.5 py-0.5">
              {l1Members.length} count
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pt-4 space-y-3 pr-1">
            {l1Members.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-8">No Level 1 members found.</p>
            ) : (
              l1Members.map((member) => {
                const isSelected = selectedL1 === member.id;
                const hasDownline = team.some(m => m.level === 2 && m.referredBy === member.id);
                
                return (
                  <div 
                    key={member.id}
                    onClick={() => handleSelectL1(member.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-cyan-500/10 border-cyan-400/50 shadow-md shadow-cyan-500/5' 
                        : 'bg-slate-900/30 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="truncate pr-2">
                        <h4 className="font-bold text-xs text-slate-200 truncate">{member.name}</h4>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{member.email}</p>
                      </div>
                      {hasDownline && (
                        <GitFork className={`h-4.5 w-4.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-800/60 text-[10px] text-slate-400">
                      <div>
                        <span className="block text-[8px] text-slate-500 uppercase font-semibold">Sales Locked</span>
                        <span className="font-bold text-slate-300">${member.individualSales.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-500 uppercase font-semibold">Earnings Gen</span>
                        <span className="font-bold text-emerald-400">+${member.commissionsEarned.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-850 text-[9px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(member.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="capitalize font-semibold text-slate-400">{member.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* LEVEL 2 COLUMN */}
        <div className="glass-panel p-5 flex flex-col h-[600px] relative">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs flex items-center justify-center font-bold">2</span>
              <h3 className="font-bold text-sm text-slate-300">Level 2 (Indirects)</h3>
            </div>
            <span className="text-xs text-slate-500 bg-slate-900 border border-slate-800/60 rounded-full px-2.5 py-0.5">
              {l2Members.length} count
            </span>
          </div>

          {selectedL1 && (
            <div className="bg-cyan-500/5 border-b border-slate-800 py-2 px-3 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Showing downline for selected L1 member</span>
              <button 
                onClick={() => setSelectedL1(null)} 
                className="text-cyan-400 font-semibold hover:underline"
              >
                Clear
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto pt-4 space-y-3 pr-1">
            {l2Members.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-8">
                {selectedL1 ? 'No direct downline referrals found for this member.' : 'No Level 2 members found.'}
              </p>
            ) : (
              l2Members.map((member) => {
                const isSelected = selectedL2 === member.id;
                const hasDownline = team.some(m => m.level === 3 && m.referredBy === member.id);

                return (
                  <div 
                    key={member.id}
                    onClick={() => handleSelectL2(member.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-purple-500/10 border-purple-400/50 shadow-md shadow-purple-500/5' 
                        : 'bg-slate-900/30 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="truncate pr-2">
                        <h4 className="font-bold text-xs text-slate-200 truncate">{member.name}</h4>
                        <p className="text-[9px] text-slate-400 mt-0.5">Sponsor: <span className="text-cyan-400 font-medium">{resolveSponsorName(member.referredBy)}</span></p>
                      </div>
                      {hasDownline && (
                        <ChevronRight className={`h-4 w-4 shrink-0 ${isSelected ? 'text-purple-400' : 'text-slate-500'}`} />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-800/60 text-[10px] text-slate-400">
                      <div>
                        <span className="block text-[8px] text-slate-500 uppercase font-semibold">Sales Locked</span>
                        <span className="font-bold text-slate-300">${member.individualSales.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-500 uppercase font-semibold">Earnings Gen</span>
                        <span className="font-bold text-emerald-400">+${member.commissionsEarned.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-850 text-[9px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(member.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="capitalize font-semibold text-slate-400">{member.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* LEVEL 3 COLUMN */}
        <div className="glass-panel p-5 flex flex-col h-[600px] relative">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-center font-bold">3</span>
              <h3 className="font-bold text-sm text-slate-300">Level 3 (Sub-Indirects)</h3>
            </div>
            <span className="text-xs text-slate-500 bg-slate-900 border border-slate-800/60 rounded-full px-2.5 py-0.5">
              {l3Members.length} count
            </span>
          </div>

          {selectedL2 && (
            <div className="bg-purple-500/5 border-b border-slate-800 py-2 px-3 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Showing downline for selected L2 member</span>
              <button 
                onClick={() => setSelectedL2(null)} 
                className="text-purple-400 font-semibold hover:underline"
              >
                Clear
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto pt-4 space-y-3 pr-1">
            {l3Members.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-8">
                {selectedL2 ? 'No direct downline referrals found for this member.' : 'No Level 3 members found.'}
              </p>
            ) : (
              l3Members.map((member) => {
                return (
                  <div 
                    key={member.id}
                    className="p-4 border border-slate-800 bg-slate-900/30 rounded-lg hover:border-slate-700 hover:bg-slate-900/50 transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-200 truncate">{member.name}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Sponsor: <span className="text-purple-400 font-medium">{resolveSponsorName(member.referredBy)}</span></p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-800/60 text-[10px] text-slate-400">
                      <div>
                        <span className="block text-[8px] text-slate-500 uppercase font-semibold">Sales Locked</span>
                        <span className="font-bold text-slate-300">${member.individualSales.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-500 uppercase font-semibold">Earnings Gen</span>
                        <span className="font-bold text-emerald-400">+${member.commissionsEarned.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-850 text-[9px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(member.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="capitalize font-semibold text-slate-400">{member.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
