"use client";

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../../lib/api';
import { ShieldAlert, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../../store/authSlice';

function AdminLoginForm() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest('/admin/login', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      // Save tokens & credentials (store refreshToken for dev fallback)
      const credentials = { user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken };
      dispatch(setCredentials({ user: res.user, accessToken: res.accessToken }));
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('authState', JSON.stringify(credentials));
        if (res.refreshToken) window.localStorage.setItem('refreshToken', res.refreshToken);
      }
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Admin login failed. Invalid credentials or insufficient privileges.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel w-full max-w-md p-8 relative z-10 border border-rose-500/20 shadow-[0_8px_32px_0_rgba(225,29,72,0.15)] animate-fade-in">
      <div className="text-center mb-8">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-slate-100 glow-text-fuchsia">Admin Portal</h2>
        <p className="text-sm text-slate-400 mt-2">Authorized Personnel Only.</p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-xs mb-6 text-center animate-fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="email"
            name="email"
            placeholder="Admin Email Address"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-rose-500/50 transition-colors"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Admin Password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-3 pl-10 pr-10 text-sm text-slate-200 focus:outline-none focus:border-rose-500/50 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-rose-500 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 mt-6 disabled:opacity-50 transition-all text-white bg-gradient-to-r from-rose-600 to-red-500 shadow-[0_0_15px_rgba(225,29,72,0.4)] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(225,29,72,0.75)]"
        >
          <span>{loading ? 'Authenticating...' : 'Secure Log In'}</span>
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/bg-pattern.svg')] bg-cover bg-center">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/20 rounded-full blur-[120px] pointer-events-none" />
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
