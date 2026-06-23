"use client";
// Deployment: 2026-06-23 - Updated environment variables for production

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest } from '../../lib/api';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, ShieldCheck, UserCheck, RefreshCw, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCredentials, setTempCredentials } from '../../store/authSlice';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const urlMessage = searchParams.get('message');

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Email verification state
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  // 2FA state
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [tempTokenVal, setTempTokenVal] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailNotVerified(false);
    setResendMsg('');
    setLoading(true);
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.twoFactorRequired) {
        setIs2FARequired(true);
        setTempTokenVal(res.tempToken);
        dispatch(setTempCredentials({ tempToken: res.tempToken }));
        setLoading(false);
        return;
      }

      const credentials = { user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken };
      dispatch(setCredentials({ user: res.user, accessToken: res.accessToken }));
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('authState', JSON.stringify(credentials));
        if (res.refreshToken) window.localStorage.setItem('refreshToken', res.refreshToken);
      }
      router.replace('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      if (msg.toLowerCase().includes('verify your email')) {
        setEmailNotVerified(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setResendMsg('❌ Please enter your email address above first.');
      return;
    }
    setResendLoading(true);
    setResendMsg('');
    try {
      await apiRequest('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: formData.email }),
      });
      setResendMsg('✅ Verification email sent! Please check your inbox and spam folder.');
    } catch {
      setResendMsg('❌ Could not resend. Make sure your email is correct.');
    } finally {
      setResendLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest('/auth/login-2fa', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tempTokenVal}` },
        body: JSON.stringify({ token: twoFactorToken }),
      });
      const credentials = { user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken };
      dispatch(setCredentials({ user: res.user, accessToken: res.accessToken }));
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('authState', JSON.stringify(credentials));
        if (res.refreshToken) window.localStorage.setItem('refreshToken', res.refreshToken);
      }
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || '2FA verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel w-full max-w-md p-8 relative z-10">
      <div className="text-center mb-8">
        <UserCheck className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-100 glow-text-cyan">Welcome Back</h2>
        <p className="text-sm text-slate-400 mt-2">Log in to manage your crypto assets.</p>
      </div>

      {urlMessage && !error && !emailNotVerified && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-lg text-xs mb-6 text-center">
          {urlMessage}
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-xs mb-6 text-center">
          {error}
        </div>
      )}

      {/* Email Not Verified Banner */}
      {emailNotVerified && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-300 font-semibold text-sm">Email Verification Required</p>
              <p className="text-amber-400/80 text-xs mt-1 leading-relaxed">
                Your account is not yet verified. Please follow these steps:
              </p>
            </div>
          </div>
          <ol className="text-xs text-slate-300 space-y-1.5 pl-2 list-none">
            <li className="flex items-start gap-2">
              <span className="bg-cyan-500/20 text-cyan-400 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
              <span>Open your email inbox for <span className="text-cyan-400 font-medium">{formData.email || 'your email'}</span></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-cyan-500/20 text-cyan-400 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
              <span>Look for an email from <span className="text-cyan-400 font-medium">CryptoPlatform</span> (check spam too)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-cyan-500/20 text-cyan-400 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
              <span>Click the <span className="text-cyan-400 font-medium">"Verify Email"</span> button in the email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-cyan-500/20 text-cyan-400 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">4</span>
              <span>Come back here and log in</span>
            </li>
          </ol>
          {resendMsg ? (
            <p className="text-xs text-center font-medium" style={{ color: resendMsg.startsWith('✅') ? '#34d399' : '#f87171' }}>
              {resendMsg}
            </p>
          ) : (
            <button
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          )}
        </div>
      )}

      {!is2FARequired ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-3 pl-10 pr-10 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex justify-end mt-2">
            <Link href="/forgot-password" className="text-xs text-slate-400 hover:text-cyan-400 transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="neon-btn-cyan w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 mt-6 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Log In'}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      ) : (
        <form onSubmit={handle2FASubmit} className="space-y-4">
          <p className="text-xs text-slate-400 text-center mb-4">
            Enter the 6-digit code from your authenticator app.
          </p>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="000000"
              required
              maxLength={6}
              value={twoFactorToken}
              onChange={(e) => setTwoFactorToken(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-center tracking-widest text-lg font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="neon-btn-cyan w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 mt-6 disabled:opacity-50"
          >
            <span>{loading ? 'Verifying...' : 'Verify 2FA'}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-slate-400 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold">
          Sign Up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen px-4 flex items-center justify-center bg-[url('/bg-pattern.svg')] bg-cover bg-center">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
