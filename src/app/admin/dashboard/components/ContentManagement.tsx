"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../../lib/api';
import { Megaphone, Image as ImageIcon, MessageSquare, PlusCircle } from 'lucide-react';

export default function ContentManagement() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'announcements' | 'banners' | 'support'>('announcements');
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementStatus, setAnnouncementStatus] = useState<'active' | 'inactive'>('active');
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerLinkUrl, setBannerLinkUrl] = useState('');
  const [bannerStatus, setBannerStatus] = useState<'active' | 'inactive'>('active');
  const [formError, setFormError] = useState('');

  const { data: announcements, isLoading: isLoadingAnnouncements } = useQuery({
    queryKey: ['admin_announcements'],
    queryFn: () => apiRequest('/admin/announcements'),
    enabled: tab === 'announcements',
  });

  const { data: banners, isLoading: isLoadingBanners } = useQuery({
    queryKey: ['admin_banners'],
    queryFn: () => apiRequest('/admin/banners'),
    enabled: tab === 'banners',
  });

  const { data: tickets, isLoading: isLoadingTickets } = useQuery({
    queryKey: ['admin_tickets'],
    queryFn: () => apiRequest('/admin/support'),
    enabled: tab === 'support',
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/admin/announcements', {
        method: 'POST',
        body: JSON.stringify({
          title: announcementTitle,
          content: announcementContent,
          status: announcementStatus,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_announcements'] });
      setIsAnnouncementModalOpen(false);
      setAnnouncementTitle('');
      setAnnouncementContent('');
      setAnnouncementStatus('active');
      setFormError('');
    },
    onError: (error: any) => {
      setFormError(error?.message || 'Unable to create announcement.');
    },
  });

  const createBannerMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/admin/banners', {
        method: 'POST',
        body: JSON.stringify({
          title: bannerTitle,
          imageUrl: bannerImageUrl,
          linkUrl: bannerLinkUrl,
          status: bannerStatus,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_banners'] });
      setIsBannerModalOpen(false);
      setBannerTitle('');
      setBannerImageUrl('');
      setBannerLinkUrl('');
      setBannerStatus('active');
      setFormError('');
    },
    onError: (error: any) => {
      setFormError(error?.message || 'Unable to upload banner.');
    },
  });

  const handleAnnouncementSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      setFormError('Please enter both title and content.');
      return;
    }
    createAnnouncementMutation.mutate();
  };

  const handleBannerSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bannerTitle.trim() || !bannerImageUrl.trim()) {
      setFormError('Please provide a banner title and image URL.');
      return;
    }
    createBannerMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-sm text-slate-400">Choose section</p>
          <select
            value={tab}
            onChange={(e) => setTab(e.target.value as 'announcements' | 'banners' | 'support')}
            className="block w-full max-w-60 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-500 sm:hidden"
          >
            <option value="announcements">Announcements</option>
            <option value="banners">Banners</option>
            <option value="support">Support Tickets</option>
          </select>
        </div>
        <div className="hidden sm:flex flex-wrap items-center gap-3 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setTab('announcements')}
            className={`flex min-w-32 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'announcements' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Announcements</span>
          </button>
          <button
            onClick={() => setTab('banners')}
            className={`flex min-w-32 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'banners' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Banners</span>
          </button>
          <button
            onClick={() => setTab('support')}
            className={`flex min-w-32 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'support' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Support Tickets</span>
          </button>
        </div>
      </div>

      <div className="glass-panel bg-slate-900/40 p-6">
        {tab === 'announcements' && (
          <div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-slate-200">Announcements</h4>
                <p className="text-sm text-slate-500 mt-1">Publish platform news and updates for all users.</p>
              </div>
              <button
                onClick={() => {
                  setIsAnnouncementModalOpen(true);
                  setFormError('');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                New Announcement
              </button>
            </div>

            {isLoadingAnnouncements ? (
              <p className="text-slate-500">Loading announcements…</p>
            ) : !announcements || announcements.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 p-8 text-center text-slate-500">
                No announcements created yet. Click “New Announcement” to add content.
              </div>
            ) : (
              <div className="space-y-4">
                {(announcements || []).map((ann: any) => (
                  <div key={ann._id} className="p-4 border border-slate-800 rounded-3xl bg-slate-900/70 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <h5 className="text-lg font-semibold text-slate-100">{ann.title}</h5>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500 mt-2">{ann.status}</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${ann.status === 'active' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-700/10 text-slate-400'}`}>
                        {ann.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{ann.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'banners' && (
          <div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-slate-200">Banners</h4>
                <p className="text-sm text-slate-500 mt-1">Upload promotional banners for the homepage and marketing slots.</p>
              </div>
              <button
                onClick={() => {
                  setIsBannerModalOpen(true);
                  setFormError('');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-fuchsia-500 text-white rounded-lg text-sm font-semibold hover:bg-fuchsia-600 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Upload Banner
              </button>
            </div>

            {isLoadingBanners ? (
              <p className="text-slate-500">Loading banners…</p>
            ) : !banners || banners.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 p-8 text-center text-slate-500">
                No banners are available. Upload a new banner to make it live.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {(banners || []).map((banner: any) => (
                  <div key={banner._id} className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-sm">
                    <div className="h-40 bg-slate-950/50">
                      <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h5 className="text-sm font-semibold text-slate-100 truncate">{banner.title}</h5>
                        <span className={`text-xs font-semibold rounded-full px-2 py-1 ${banner.status === 'active' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-700/10 text-slate-400'}`}>
                          {banner.status}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-slate-500 truncate">{banner.linkUrl || 'No link set'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'support' && (
          <div>
            <h4 className="text-lg font-bold text-slate-200 mb-4">Support Tickets</h4>
            {isLoadingTickets ? (
              <p className="text-slate-500">Loading support tickets…</p>
            ) : !tickets || tickets.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 p-8 text-center text-slate-500">
                No support tickets found.
              </div>
            ) : (
              <div className="space-y-3">
                {(tickets || []).map((ticket: any) => (
                  <div key={ticket._id} className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 transition hover:border-slate-700 hover:bg-slate-800/80 cursor-pointer">
                    <div className="flex items-center justify-between gap-3">
                      <h5 className="font-semibold text-slate-100">{ticket.subject}</h5>
                      <span className={`text-xs font-semibold rounded-full px-2 py-1 ${ticket.status === 'open' ? 'bg-rose-500/10 text-rose-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
                        {ticket.status === 'open' ? 'Open' : 'Replied'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">From: {ticket.userId?.email} • {new Date(ticket.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-semibold text-slate-100">Create New Announcement</h3>
                <p className="text-sm text-slate-500 mt-1">Publish a news update or system message to everyone.</p>
              </div>
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="text-slate-400 hover:text-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAnnouncementSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400">Title</label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  placeholder="Announcement headline"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Content</label>
                <textarea
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  rows={5}
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  placeholder="Write the announcement message here"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Status</label>
                  <select
                    value={announcementStatus}
                    onChange={(e) => setAnnouncementStatus(e.target.value as 'active' | 'inactive')}
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {formError && <p className="text-sm text-rose-400">{formError}</p>}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="rounded-2xl border border-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAnnouncementMutation.isPending}
                  className="rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-60"
                >
                  {createAnnouncementMutation.isPending ? 'Saving…' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-semibold text-slate-100">Upload New Banner</h3>
                <p className="text-sm text-slate-500 mt-1">Add a promotional banner by supplying a title, image URL, and optional link.</p>
              </div>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="text-slate-400 hover:text-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBannerSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400">Banner Title</label>
                <input
                  type="text"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
                  placeholder="Marketing headline or promo title"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Image URL</label>
                <input
                  type="url"
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
                  placeholder="https://example.com/banner-image.jpg"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Destination Link</label>
                <input
                  type="url"
                  value={bannerLinkUrl}
                  onChange={(e) => setBannerLinkUrl(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
                  placeholder="Optional click-through URL"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Status</label>
                  <select
                    value={bannerStatus}
                    onChange={(e) => setBannerStatus(e.target.value as 'active' | 'inactive')}
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {formError && <p className="text-sm text-rose-400">{formError}</p>}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="rounded-2xl border border-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createBannerMutation.isPending}
                  className="rounded-2xl bg-fuchsia-500 px-4 py-3 text-sm font-semibold text-white hover:bg-fuchsia-600 disabled:opacity-60"
                >
                  {createBannerMutation.isPending ? 'Uploading…' : 'Upload Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
