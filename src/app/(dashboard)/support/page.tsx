"use client";

import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../lib/api';
import { LifeBuoy, Plus, MessageCircle, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['my_tickets'],
    queryFn: async () => {
      return apiRequest('/features/support');
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/features/support', {
        method: 'POST',
        body: JSON.stringify({ subject, message }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_tickets'] });
      setIsModalOpen(false);
      setSubject('');
      setMessage('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject && message) {
      createMutation.mutate();
    }
  };

  return (
    <>
      <Navbar title="Support Center" />
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-wide text-slate-100 flex items-center">
              <LifeBuoy className="w-6 h-6 text-indigo-400 mr-2" />
              Help & Support
            </h2>
            <p className="text-slate-400 text-xs mt-1">Submit inquiries or report issues to our support team.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </button>
        </div>

        {/* Ticket List */}
        <div className="glass-panel p-6 bg-slate-900/40">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-slate-800 rounded-lg"></div>
              <div className="h-16 bg-slate-800 rounded-lg"></div>
            </div>
          ) : !tickets || tickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300">No support tickets</h3>
              <p className="text-sm text-slate-500 mt-1">You haven't submitted any inquiries yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket: any) => (
                <Link key={ticket._id} href={`/support/${ticket._id}`} className="block">
                  <div className="p-4 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-slate-200">{ticket.subject}</h4>
                      <div className="flex items-center text-xs text-slate-500 mt-2 space-x-4">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(ticket.updatedAt).toLocaleDateString()}
                        </span>
                        <span>Ticket #{ticket._id.substring(ticket._id.length - 6).toUpperCase()}</span>
                      </div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        ticket.status === 'open' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        ticket.status === 'replied' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {ticket.status === 'replied' ? 'Admin Replied' : ticket.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* New Ticket Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-100">Create New Ticket</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="Provide details about your inquiry..."
                  ></textarea>
                </div>
                
                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {createMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </div>
                {createMutation.isError && (
                  <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center text-rose-400 text-xs">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {(createMutation.error as any).message || 'Failed to submit ticket.'}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
