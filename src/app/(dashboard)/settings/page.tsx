"use client";

import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../lib/api';
import {
  ShieldCheck,
  Lock,
  Smartphone,
  AlertCircle,
  User,
  Camera,
  FileText,
  Bell,
  Eye,
  EyeOff,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

type TabKey = 'security' | 'profile' | 'kyc' | 'notifications';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('profile');

  // ── 2FA State ──
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [twoFaSecret, setTwoFaSecret] = useState('');
  const [twoFaToken, setTwoFaToken] = useState('');
  const [twoFaMsg, setTwoFaMsg] = useState('');

  // ── Change Password State ──
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg] = useState({ text: '', type: '' as 'success' | 'error' | '' });

  // ── Avatar State ──
  const avatarRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // ── KYC State ──
  const kycRef = useRef<HTMLInputElement>(null);
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycFileName, setKycFileName] = useState('');

  // ── Notification Prefs State ──
  const [notifPrefs, setNotifPrefs] = useState({
    deposits: true,
    withdrawals: true,
    staking: true,
    referrals: true,
    salary: true,
    jackpot: true,
    announcements: true,
    security: true,
  });
  const [notifMsg, setNotifMsg] = useState('');

  // ── Queries ──
  const { data: userData, refetch: refetchUser } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await apiRequest('/auth/me');
      return res.user;
    },
  });

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await apiRequest('/profile');
      return res.user;
    },
  });

  const { data: notifData, refetch: refetchNotif } = useQuery({
    queryKey: ['notifPrefs'],
    queryFn: async () => {
      const res = await apiRequest('/profile/notifications');
      return res.preferences;
    },
  });

  // Sync notification prefs when data arrives
  useEffect(() => {
    if (notifData) {
      setNotifPrefs({
        deposits: notifData.deposits ?? true,
        withdrawals: notifData.withdrawals ?? true,
        staking: notifData.staking ?? true,
        referrals: notifData.referrals ?? true,
        salary: notifData.salary ?? true,
        jackpot: notifData.jackpot ?? true,
        announcements: notifData.announcements ?? true,
        security: notifData.security ?? true,
      });
    }
  }, [notifData]);

  // ── 2FA Handlers ──
  const handleSetup2FA = async () => {
    setTwoFaLoading(true);
    setTwoFaMsg('');
    try {
      const res = await apiRequest('/auth/2fa/setup', { method: 'POST' });
      setQrCode(res.qrCodeUrl);
      setTwoFaSecret(res.secret);
    } catch (err: any) {
      setTwoFaMsg(err.message || 'Failed to start 2FA setup');
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFaLoading(true);
    setTwoFaMsg('');
    try {
      await apiRequest('/auth/2fa/confirm', {
        method: 'POST',
        body: JSON.stringify({ token: twoFaToken }),
      });
      setTwoFaMsg('2FA successfully enabled!');
      setQrCode('');
      setTwoFaToken('');
      refetchUser();
    } catch (err: any) {
      setTwoFaMsg(err.message || 'Failed to confirm 2FA');
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFaLoading(true);
    setTwoFaMsg('');
    try {
      await apiRequest('/auth/2fa/disable', {
        method: 'POST',
        body: JSON.stringify({ token: twoFaToken }),
      });
      setTwoFaMsg('2FA successfully disabled.');
      setTwoFaToken('');
      refetchUser();
    } catch (err: any) {
      setTwoFaMsg(err.message || 'Failed to disable 2FA');
    } finally {
      setTwoFaLoading(false);
    }
  };

  // ── Change Password ──
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg({ text: '', type: '' });

    if (pwForm.newPassword.length < 8) {
      setPwMsg({ text: 'New password must be at least 8 characters.', type: 'error' });
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    try {
      await apiRequest('/profile/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword }),
      });
      setPwMsg({ text: 'Password changed successfully!', type: 'success' });
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPwMsg({ text: err.message || 'Failed to change password.', type: 'error' });
    }
  };

  // ── Avatar Upload ──
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatarMutation = useMutation({
    mutationFn: async () => {
      if (!avatarFile) return;
      const form = new FormData();
      form.append('avatar', avatarFile);
      return apiRequest('/profile/avatar', { method: 'POST', body: form });
    },
    onSuccess: () => {
      setAvatarFile(null);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  // ── KYC Upload ──
  const handleKycSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKycFile(file);
      setKycFileName(file.name);
    }
  };

  const uploadKycMutation = useMutation({
    mutationFn: async () => {
      if (!kycFile) return;
      const form = new FormData();
      form.append('kyc', kycFile);
      return apiRequest('/profile/kyc', { method: 'POST', body: form });
    },
    onSuccess: () => {
      setKycFile(null);
      setKycFileName('');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // ── Notification Preferences ──
  const saveNotifPrefsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/profile/notifications', {
        method: 'PUT',
        body: JSON.stringify({ preferences: notifPrefs }),
      });
    },
    onSuccess: () => {
      setNotifMsg('Preferences saved!');
      refetchNotif();
      setTimeout(() => setNotifMsg(''), 3000);
    },
    onError: (err: any) => {
      setNotifMsg(err.message || 'Failed to save.');
    },
  });

  // ── Derived Values ──
  const kycStatus = profileData?.kycStatus || 'none';
  const profilePic = profileData?.profilePicture
    ? profileData.profilePicture.startsWith('http')
      ? profileData.profilePicture
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${profileData.profilePicture}`
    : null;

  const kycStatusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    none: { icon: <FileText className="h-4 w-4" />, color: 'text-slate-400', label: 'Not Submitted' },
    pending: { icon: <Clock className="h-4 w-4" />, color: 'text-amber-400', label: 'Pending Review' },
    approved: { icon: <CheckCircle className="h-4 w-4" />, color: 'text-emerald-400', label: 'Approved' },
    rejected: { icon: <XCircle className="h-4 w-4" />, color: 'text-rose-400', label: 'Rejected' },
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { key: 'security', label: 'Security & 2FA', icon: <ShieldCheck className="h-4 w-4" /> },
    { key: 'kyc', label: 'KYC Verification', icon: <FileText className="h-4 w-4" /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  ];

  return (
    <>
      <Navbar title="Account Settings" />
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ═══ Tab Bar ═══ */}
        <div className="flex overflow-x-auto border-b border-slate-800 mb-6 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-cyan-400 text-cyan-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════
            TAB: PROFILE (Avatar + Change Password)
           ═══════════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* ── Profile Info + Avatar ── */}
            <div className="glass-panel p-8 bg-slate-900/40">
              <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center">
                <User className="h-5 w-5 text-cyan-400 mr-2" />
                Profile Information
              </h3>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                      {avatarPreview || profilePic ? (
                        <img
                          src={avatarPreview || profilePic!}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-slate-500" />
                      )}
                    </div>
                    <button
                      onClick={() => avatarRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-cyan-500/80 hover:bg-cyan-500 rounded-full text-white transition-colors shadow-lg"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <input
                      ref={avatarRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />
                  </div>
                  {avatarFile && (
                    <button
                      onClick={() => uploadAvatarMutation.mutate()}
                      disabled={uploadAvatarMutation.isPending}
                      className="neon-btn-cyan px-4 py-2 rounded-lg text-xs font-bold"
                    >
                      {uploadAvatarMutation.isPending ? 'Uploading...' : 'Save Photo'}
                    </button>
                  )}
                  {uploadAvatarMutation.isSuccess && (
                    <p className="text-xs text-emerald-400 font-bold">✓ Photo updated!</p>
                  )}
                </div>

                {/* Profile Details */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">First Name</label>
                    <input
                      type="text"
                      readOnly
                      value={userData?.firstName || ''}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-sm text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">Last Name</label>
                    <input
                      type="text"
                      readOnly
                      value={userData?.lastName || ''}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-sm text-slate-300"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">Email Address</label>
                    <input
                      type="text"
                      readOnly
                      value={userData?.email || ''}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-sm text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">Account Status</label>
                    <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold capitalize">
                      {userData?.status || 'Active'}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">KYC Status</label>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-bold ${kycStatusConfig[kycStatus].color}`}>
                      {kycStatusConfig[kycStatus].icon}
                      {kycStatusConfig[kycStatus].label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Change Password ── */}
            <div className="glass-panel p-8 bg-slate-900/40">
              <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center">
                <Lock className="h-5 w-5 text-purple-400 mr-2" />
                Change Password
              </h3>
              <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                {/* Current Password */}
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">Current Password</label>
                  <div className="relative">
                    <input
                      type={showOldPw ? 'text' : 'password'}
                      required
                      value={pwForm.oldPassword}
                      onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 pr-10 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPw(!showOldPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showOldPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={pwForm.newPassword}
                      onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                      placeholder="Min 8 characters"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 pr-10 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={pwForm.confirmPassword}
                      onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 pr-10 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {pwMsg.text && (
                  <p className={`text-xs font-bold ${pwMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {pwMsg.text}
                  </p>
                )}

                <button
                  type="submit"
                  className="neon-btn-cyan px-6 py-2.5 rounded-lg text-sm font-bold"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB: SECURITY & 2FA
           ═══════════════════════════════════════════════ */}
        {activeTab === 'security' && (
          <div className="glass-panel p-8 bg-slate-900/40">
            <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center">
              <Smartphone className="h-5 w-5 text-purple-400 mr-2" />
              Two-Factor Authentication (2FA)
            </h3>

            <div className="mb-6">
              {userData?.twoFactorEnabled ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-400 flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      2FA is currently ENABLED
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">Your account is highly secure. You will need your authenticator app to log in.</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-amber-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      2FA is currently DISABLED
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">We strongly recommend enabling Two-Factor Authentication to protect your funds.</p>
                  </div>
                  {!qrCode && (
                    <button
                      onClick={handleSetup2FA}
                      disabled={twoFaLoading}
                      className="neon-btn-cyan px-4 py-2 rounded-lg text-xs font-bold"
                    >
                      Enable 2FA
                    </button>
                  )}
                </div>
              )}
            </div>

            {qrCode && !userData?.twoFactorEnabled && (
              <div className="p-6 border border-slate-800 rounded-lg bg-slate-950/50 mt-4 max-w-sm">
                <h4 className="text-sm font-bold text-slate-200 mb-2">1. Scan QR Code</h4>
                <p className="text-xs text-slate-400 mb-4">Open Google Authenticator or Authy and scan this code:</p>
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 mx-auto rounded bg-white p-2" />
                <p className="text-xs text-slate-500 mt-4 text-center">Secret: <span className="font-mono text-cyan-400">{twoFaSecret}</span></p>

                <h4 className="text-sm font-bold text-slate-200 mt-6 mb-2">2. Verify Token</h4>
                <form onSubmit={handleConfirm2FA} className="flex space-x-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={twoFaToken}
                    onChange={(e) => setTwoFaToken(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-center tracking-widest font-mono text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                  <button type="submit" disabled={twoFaLoading} className="neon-btn-cyan px-4 rounded-lg text-xs font-bold">
                    Confirm
                  </button>
                </form>
              </div>
            )}

            {userData?.twoFactorEnabled && (
              <form onSubmit={handleDisable2FA} className="p-6 border border-slate-800 rounded-lg bg-slate-950/50 mt-4 max-w-sm">
                <h4 className="text-sm font-bold text-rose-400 mb-2">Disable 2FA</h4>
                <p className="text-xs text-slate-400 mb-4">Enter your current 2FA token to disable this security feature.</p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={twoFaToken}
                    onChange={(e) => setTwoFaToken(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-center tracking-widest font-mono text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                  <button type="submit" disabled={twoFaLoading} className="bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 px-4 rounded-lg text-xs font-bold transition-colors">
                    Disable
                  </button>
                </div>
              </form>
            )}

            {twoFaMsg && <p className="mt-4 text-xs font-bold text-cyan-400">{twoFaMsg}</p>}
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB: KYC VERIFICATION
           ═══════════════════════════════════════════════ */}
        {activeTab === 'kyc' && (
          <div className="glass-panel p-8 bg-slate-900/40">
            <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center">
              <FileText className="h-5 w-5 text-amber-400 mr-2" />
              KYC Document Verification
            </h3>

            {/* Current KYC Status */}
            <div className={`p-4 rounded-lg border mb-6 ${
              kycStatus === 'approved'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : kycStatus === 'pending'
                ? 'bg-amber-500/10 border-amber-500/30'
                : kycStatus === 'rejected'
                ? 'bg-rose-500/10 border-rose-500/30'
                : 'bg-slate-800/50 border-slate-700'
            }`}>
              <div className="flex items-center gap-2">
                <span className={kycStatusConfig[kycStatus].color}>{kycStatusConfig[kycStatus].icon}</span>
                <span className={`text-sm font-bold ${kycStatusConfig[kycStatus].color}`}>
                  KYC Status: {kycStatusConfig[kycStatus].label}
                </span>
              </div>
              {kycStatus === 'none' && (
                <p className="text-xs text-slate-400 mt-2">Please upload a government-issued photo ID (Passport, Driver&apos;s License, National ID) to verify your identity.</p>
              )}
              {kycStatus === 'pending' && (
                <p className="text-xs text-slate-400 mt-2">Your document has been submitted and is under review. This usually takes 24-48 hours.</p>
              )}
              {kycStatus === 'approved' && (
                <p className="text-xs text-slate-400 mt-2">Your identity has been verified. You have full platform access.</p>
              )}
              {kycStatus === 'rejected' && (
                <p className="text-xs text-slate-400 mt-2">Your document was rejected. Please submit a clear, valid document.</p>
              )}
            </div>

            {/* Upload Area (show only if not approved and not pending) */}
            {kycStatus !== 'approved' && kycStatus !== 'pending' && (
              <div className="max-w-md">
                <div
                  onClick={() => kycRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-8 text-center cursor-pointer transition-colors group"
                >
                  <Upload className="h-10 w-10 text-slate-500 group-hover:text-cyan-400 mx-auto mb-3 transition-colors" />
                  <p className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                    {kycFileName || 'Click to upload document'}
                  </p>
                  <p className="text-xs text-slate-600 mt-2">Accepts: JPG, PNG, PDF • Max 10 MB</p>
                </div>
                <input
                  ref={kycRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleKycSelect}
                  className="hidden"
                />

                {kycFile && (
                  <button
                    onClick={() => uploadKycMutation.mutate()}
                    disabled={uploadKycMutation.isPending}
                    className="neon-btn-cyan px-6 py-2.5 rounded-lg text-sm font-bold mt-4"
                  >
                    {uploadKycMutation.isPending ? 'Submitting...' : 'Submit for Review'}
                  </button>
                )}

                {uploadKycMutation.isSuccess && (
                  <p className="text-xs text-emerald-400 font-bold mt-3">✓ KYC document submitted for review!</p>
                )}
                {uploadKycMutation.isError && (
                  <p className="text-xs text-rose-400 font-bold mt-3">✗ {(uploadKycMutation.error as any)?.message || 'Upload failed'}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB: NOTIFICATION PREFERENCES
           ═══════════════════════════════════════════════ */}
        {activeTab === 'notifications' && (
          <div className="glass-panel p-8 bg-slate-900/40">
            <h3 className="text-lg font-bold text-slate-100 mb-2 flex items-center">
              <Bell className="h-5 w-5 text-cyan-400 mr-2" />
              Notification Preferences
            </h3>
            <p className="text-xs text-slate-400 mb-6">Control which notifications you receive in real-time.</p>

            <div className="space-y-1 max-w-md">
              {([
                { key: 'deposits' as const, label: 'Deposit Notifications', desc: 'Deposit approved, rejected, or pending updates' },
                { key: 'withdrawals' as const, label: 'Withdrawal Notifications', desc: 'Withdrawal status changes' },
                { key: 'staking' as const, label: 'Staking Notifications', desc: 'Reward distributions and plan updates' },
                { key: 'referrals' as const, label: 'Referral Notifications', desc: 'New referrals and commission earned' },
                { key: 'salary' as const, label: 'Salary Notifications', desc: 'Monthly salary distribution alerts' },
                { key: 'jackpot' as const, label: 'Jackpot Notifications', desc: 'Jackpot wins and participation updates' },
                { key: 'announcements' as const, label: 'Announcements', desc: 'Platform news, promotions, and updates' },
                { key: 'security' as const, label: 'Security Alerts', desc: 'Login attempts, password changes, 2FA events' },
              ]).map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifPrefs({ ...notifPrefs, [item.key]: !notifPrefs[item.key] })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifPrefs[item.key] ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                        notifPrefs[item.key] ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={() => saveNotifPrefsMutation.mutate()}
                disabled={saveNotifPrefsMutation.isPending}
                className="neon-btn-cyan px-6 py-2.5 rounded-lg text-sm font-bold"
              >
                {saveNotifPrefsMutation.isPending ? 'Saving...' : 'Save Preferences'}
              </button>
              {notifMsg && (
                <p className="text-xs font-bold text-emerald-400">{notifMsg}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
