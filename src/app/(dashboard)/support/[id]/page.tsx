"use client";

import React, { useState } from 'react';
import Navbar from '../../../../components/Navbar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../../lib/api';
import { useParams } from 'next/navigation';
import { ArrowLeft, Send, User, ShieldAlert, Clock } from 'lucide-react';
import Link from 'next/link';

export default function TicketThreadPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [reply, setReply] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      return apiRequest(`/features/support/${id}`);
    },
  });

  const replyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/features/support/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message: reply }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      setReply('');
    },
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (reply.trim()) replyMutation.mutate();
  };

  return (
    <>
      <Navbar title="Support Ticket" />
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Back link */}
        <Link href="/support" className="inline-flex items-center text-sm text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Support
        </Link>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-slate-800 rounded-lg w-1/2"></div>
            <div className="h-48 bg-slate-800 rounded-lg"></div>
          </div>
        ) : !ticket ? (
          <div className="text-center py-12 text-slate-500">Ticket not found.</div>
        ) : (
          <>
            {/* Ticket Header */}
            <div className="glass-panel p-6 bg-slate-900/40">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{ticket.subject}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Ticket #{(ticket._id as string).slice(-6).toUpperCase()} &bull; Opened {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                  ticket.status === 'open' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  ticket.status === 'replied' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}>
                  {ticket.status === 'replied' ? 'Admin Replied' : ticket.status}
                </span>
              </div>
            </div>

            {/* Thread */}
            <div className="space-y-4">
              {ticket.replies?.map((msg: any, idx: number) => {
                const isAdmin = msg.sender === 'admin';
                return (
                  <div key={idx} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] flex items-start space-x-3 ${isAdmin ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center ${
                        isAdmin ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-indigo-500/20 text-indigo-400'
                      }`}>
                        {isAdmin ? <ShieldAlert className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      
                      {/* Bubble */}
                      <div className={`rounded-xl p-4 ${
                        isAdmin
                          ? 'bg-slate-800/80 border border-slate-700/50 text-slate-200'
                          : 'bg-indigo-600/20 border border-indigo-500/20 text-slate-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold ${isAdmin ? 'text-fuchsia-400' : 'text-indigo-400'}`}>
                            {isAdmin ? 'Support Team' : 'You'}
                          </span>
                          <span className="text-[10px] text-slate-500 ml-4 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Box */}
            {ticket.status !== 'closed' && (
              <div className="glass-panel p-6 bg-slate-900/40">
                <form onSubmit={handleSendReply} className="space-y-4">
                  <label className="block text-xs font-medium text-slate-400">Your Reply</label>
                  <textarea
                    rows={3}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your response here..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!reply.trim() || replyMutation.isPending}
                      className="flex items-center px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
