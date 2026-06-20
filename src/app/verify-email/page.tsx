"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiRequest } from '../../lib/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please check the link in your email.');
      return;
    }

    const verify = async () => {
      try {
        const res = await apiRequest('/auth/verify-email', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });
        setStatus('success');
        setMessage(res.message || 'Email verified successfully!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may be expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/bg-pattern.svg')] bg-cover bg-center">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass-panel w-full max-w-md p-8 relative z-10 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 text-cyan-400 mx-auto mb-6 animate-spin" />
            <h2 className="text-xl font-bold text-slate-100 mb-2">Verifying Your Email</h2>
            <p className="text-sm text-slate-400">Please wait while we verify your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-emerald-300 mb-2">Email Verified! ✅</h2>
            <p className="text-sm text-slate-400 mb-6">{message}</p>
            <Link
              href="/login"
              className="neon-btn-cyan inline-flex items-center justify-center px-8 py-3 rounded-lg text-sm font-bold"
            >
              Go to Login →
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-12 w-12 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-rose-300 mb-2">Verification Failed</h2>
            <p className="text-sm text-slate-400 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="neon-btn-cyan w-full inline-flex items-center justify-center py-3 rounded-lg text-sm font-bold"
              >
                Go to Login (Resend from there)
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
          Verifying...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
