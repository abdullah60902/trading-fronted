"use client";

import React, { useState } from 'react';
import { apiRequest } from '../../lib/api';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/bg-pattern.svg')] bg-cover bg-center">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="glass-panel w-full max-w-md p-8 relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-100 glow-text-cyan">Forgot Password</h2>
          <p className="text-sm text-slate-400 mt-2">Enter your email address to receive a reset link.</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-xs mb-6 text-center animate-fade-in">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm text-center">
              <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-semibold">Reset Link Sent!</p>
              <p className="text-xs text-slate-300 mt-1">
                If the email is registered, we have sent a password reset link to <span className="text-cyan-400 font-medium">{email}</span>. Please check your inbox and spam folders.
              </p>
            </div>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors pt-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neon-btn-cyan w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 mt-6 disabled:opacity-50"
            >
              <span>{loading ? 'Sending Request...' : 'Send Reset Link'}</span>
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
    </div>
  );
}
