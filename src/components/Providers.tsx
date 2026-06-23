"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '../store/store';
import { SocketProvider } from './SocketProvider';
import { useAppDispatch } from '../store/hooks';
import { apiRequest, initializeCsrfToken } from '../lib/api';
import { clearCredentials, setCredentials, setUser } from '../store/authSlice';

const AUTH_STORAGE_KEY = 'authState';

const loadStoredAuth = () => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY) || window.localStorage.getItem('adminAuth');
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (window.localStorage.getItem('adminAuth') && !window.localStorage.getItem(AUTH_STORAGE_KEY)) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, raw);
    }
    return parsed;
  } catch {
    return null;
  }
};

function AuthLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const normalizedPathname = pathname?.split('?')[0] || '/';
    const publicRoutes = new Set([
      '/',
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
      '/verify-email',
      '/admin/login',
    ]);

    const initAuth = async () => {
      // Initialize CSRF token first
      await initializeCsrfToken();
      
      const stored = loadStoredAuth();
      if (stored?.user && stored?.accessToken) {
        dispatch(setCredentials({ user: stored.user, accessToken: stored.accessToken }));
      }

      if (!stored?.accessToken && publicRoutes.has(normalizedPathname)) {
        if (!cancelled) {
          setIsInitializing(false);
        }
        return;
      }

      try {
        const res = await apiRequest('/auth/me');
        if (cancelled) return;

        if (res.user) {
          const accessToken = store.getState().auth.accessToken;
          if (accessToken) {
            dispatch(setCredentials({ user: res.user, accessToken }));
          } else {
            dispatch(setUser(res.user));
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          if (err.status === 401 || err.message === 'Session expired') {
            dispatch(clearCredentials());
          }
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    };

    initAuth();

    return () => {
      cancelled = true;
    };
  }, [dispatch, pathname]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-pulse">Loading Session...</div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5000,
          },
        },
      })
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <AuthLoader>
            {children}
          </AuthLoader>
        </SocketProvider>
      </QueryClientProvider>
    </Provider>
  );
}
