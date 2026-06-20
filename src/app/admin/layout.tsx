"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '../../store/hooks';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Exclude the login page from authentication checks within the layout
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;

    if (!isAuthenticated) {
      router.push('/admin/login');
    } else if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      // If a regular user tries to access the admin area
      router.push('/admin/login');
    }
  }, [isAuthenticated, user, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'superadmin')) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-rose-500 font-semibold tracking-wider">
        Verifying Secure Admin Session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Admin specific wrapper, no user sidebar */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
