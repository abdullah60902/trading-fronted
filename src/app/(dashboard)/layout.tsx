"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { closeSidebar } from '../../store/uiSlice';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen);

  useEffect(() => {
    // If not authenticated, redirect to login page
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-400">
        Authenticating...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden">
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-20 lg:hidden transition-opacity"
          onClick={() => dispatch(closeSidebar())}
        />
      )}

      {/* Navigation Drawer Sidebar */}
      <Sidebar />

      {/* Main Panel */}
      <div className="pl-0 lg:pl-64 min-h-screen flex flex-col transition-all duration-300">
        <div className="flex-1 pt-20 p-4 sm:p-6 lg:p-8 w-full max-w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
