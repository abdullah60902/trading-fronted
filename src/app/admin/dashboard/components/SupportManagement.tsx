"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../../lib/api';
import { LifeBuoy, Send, Clock, CheckCircle, RefreshCw, MessageSquare } from 'lucide-react';

interface TicketReply {
  sender: 'user' | 'admin';
  message: string;
  createdAt: string;
}

interface SupportTicket {
  _id: string;
  userId: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  subject: string;
  status: 'open' | 'replied' | 'closed';
  replies: TicketReply[];
  createdAt: string;
  updatedAt: string;
}

export default function SupportManagement() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: tickets, isLoading, refetch } = useQuery<SupportTicket[]>({
    queryKey: ['admin_support_tickets'],
    queryFn: async () => {
      return apiRequest('/admin/support');
    },
  });

  const sendReplyMutation = useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => {
      return apiRequest(`/admin/support/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    },
    onSuccess: (updatedTicket) => {
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ['admin_support_tickets'] });
      // Update selected ticket view
      setSelectedTicket(updatedTicket);
    },
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    sendReplyMutation.mutate({
      id: selectedTicket._id,
      message: replyText
    });
  };

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse">Loading support tickets...</div>;

  const ticketsList = tickets || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
      
      {/* Tickets List Pane */}
      <div className="md:col-span-1 glass-panel border border-slate-800 bg-slate-900/40 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
          <h3 className="text-sm font-bold text-slate-100 flex items-center">
            <LifeBuoy className="w-4 h-4 text-cyan-400 mr-2" />
            Inbox ({ticketsList.length})
          </h3>
          <button onClick={() => refetch()} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          {ticketsList.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No support tickets submitted yet.</div>
          ) : (
            ticketsList.map((ticket) => {
              const isSelected = selectedTicket?._id === ticket._id;
              const lastReply = ticket.replies[ticket.replies.length - 1];
              return (
                <div
                  key={ticket._id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 cursor-pointer transition-colors text-left ${
                    isSelected ? 'bg-rose-500/10 border-l-2 border-rose-500' : 'hover:bg-slate-800/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[100px]">
                      {ticket.userId?.email || 'Unknown User'}
                    </span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      ticket.status === 'open' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                      ticket.status === 'replied' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 mt-1.5 truncate">{ticket.subject}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">
                    {lastReply?.message || 'No messages'}
                  </p>
                  <span className="text-[8px] text-slate-600 block mt-2 text-right">
                    {new Date(ticket.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Ticket Details / Thread Pane */}
      <div className="md:col-span-2 glass-panel border border-slate-800 bg-slate-900/40 flex flex-col h-full overflow-hidden">
        {selectedTicket ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/20 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-slate-500 block">Ticket ID: {selectedTicket._id}</span>
                <h3 className="text-xs font-bold text-slate-200 mt-0.5">{selectedTicket.subject}</h3>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  Sender: <span className="font-semibold">{selectedTicket.userId?.firstName} {selectedTicket.userId?.lastName}</span> ({selectedTicket.userId?.email})
                </p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                selectedTicket.status === 'open' ? 'bg-cyan-500/10 text-cyan-400' :
                selectedTicket.status === 'replied' ? 'bg-purple-500/10 text-purple-400' :
                'bg-slate-500/10 text-slate-400'
              }`}>
                {selectedTicket.status}
              </span>
            </div>

            {/* Messages body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {selectedTicket.replies.map((reply, idx) => {
                const isAdmin = reply.sender === 'admin';
                return (
                  <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg p-3 text-xs ${
                      isAdmin 
                        ? 'bg-rose-500/10 border border-rose-500/20 text-slate-200 rounded-tr-none' 
                        : 'bg-slate-950/60 border border-slate-800/80 text-slate-300 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{reply.message}</p>
                      <span className="text-[8px] text-slate-500 block mt-1 text-right">
                        {new Date(reply.createdAt).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input reply form */}
            <form onSubmit={handleReplySubmit} className="p-4 border-t border-slate-800 bg-slate-950/10 flex space-x-2">
              <input
                type="text"
                placeholder="Type your support response here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={sendReplyMutation.isPending}
                className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-4 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={sendReplyMutation.isPending || !replyText.trim()}
                className="p-2.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold transition-colors disabled:opacity-40"
              >
                {sendReplyMutation.isPending ? 'Sending...' : <Send className="w-4 h-4" />}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs p-12">
            <MessageSquare className="w-10 h-10 text-slate-600 mb-2 animate-pulse" />
            <span>Select a support ticket from the side menu to view and reply to the conversation.</span>
          </div>
        )}
      </div>

    </div>
  );
}
