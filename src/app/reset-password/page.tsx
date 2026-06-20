"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest } from '../../lib/api';
import Link from 'next/link';
import { Lock, ArrowRight, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Client side validation states
  const hasMinLength = password.length >= 8;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasLowercase && hasUppercase && hasNumber && hasSpecialChar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet the complexity requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel w-full max-w-md p-8 relative z-10 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-100 glow-text-cyan">Reset Password</h2>
        <p className="text-sm text-slate-400 mt-2">Enter your new secure password below.</p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-xs mb-6 text-center animate-fade-in">
          {error}
        </div>
      )}

      {!token && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-3 rounded-lg text-xs mb-6 text-center animate-fade-in">
          Warning: Missing reset token in URL. Make sure you clicked the full link sent to your email.
        </div>
      )}

      {success ? (
        <div className="text-center space-y-4 animate-fade-in">
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm text-center">
            <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold">Password Reset Successful!</p>
            <p className="text-xs text-slate-300 mt-1">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
          </div>
          <Link
            href="/login"
            className="neon-btn-cyan w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 mt-6"
          >
            <span>Log In</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-3 pl-10 pr-10 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="password"
              placeholder="Confirm New Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          {/* Password requirements list */}
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-3.5 space-y-1.5 text-xs text-slate-400 mt-2">
            <p className="font-semibold text-slate-300 mb-1">Password Requirements:</p>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              <span className={hasMinLength ? 'text-emerald-400' : ''}>At least 8 characters</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${hasLowercase && hasUppercase ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              <span className={hasLowercase && hasUppercase ? 'text-emerald-400' : ''}>Uppercase & lowercase letters</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              <span className={hasNumber ? 'text-emerald-400' : ''}>At least one number</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${hasSpecialChar ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              <span className={hasSpecialChar ? 'text-emerald-400' : ''}>At least one special character</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid || password !== confirmPassword}
            className="neon-btn-cyan w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 mt-6 disabled:opacity-50"
          >
            <span>{loading ? 'Resetting Password...' : 'Reset Password'}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>

          <div className="flex justify-center mt-6">
            <Link
              href="/login"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/bg-pattern.svg')] bg-cover bg-center">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
