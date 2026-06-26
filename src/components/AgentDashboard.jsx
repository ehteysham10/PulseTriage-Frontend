import React, { useState } from 'react';
import useSocket from '../hooks/useSocket';
import useAuth from '../hooks/useAuth';
import {
  Lock, Unlock, Send, CheckCircle, User, MessageSquare, Sparkles,
  PlusCircle, Clock, Tag, Search, Filter, LogOut, ChevronDown, Zap,
  RefreshCw, Inbox, Shield
} from 'lucide-react';

const PRIORITY_CLASS = {
  High: 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.2)]',
  Medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  Low: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
};

const STATUS_TABS = ['All', 'Open', 'In-Progress'];

export default function AgentDashboard() {
  const {
    tickets, activeTicketId, activeTicket, activeMessages,
    ticketsLoading, hasMore,
    selectTicket, sendMessage, resolveTicket, unlockTicket,
    generateMockTicket, applyFilters, loadMoreTickets,
  } = useSocket();

  const { user, logout, isAdmin } = useAuth();

  const [messageText, setMessageText] = useState('');
  const [statusTab, setStatusTab] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  const handleFilter = (newStatus, newPriority, newSearch) => {
    const s = newStatus ?? statusTab;
    const p = newPriority ?? priorityFilter;
    const q = newSearch ?? search;
    applyFilters({
      status: s === 'All' ? '' : s,
      priority: p,
      search: q,
    });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeTicketId) return;
    sendMessage(activeTicketId, messageText.trim(), user);
    setMessageText('');
  };

  const handleUnlock = async () => {
    if (activeTicketId) {
      await unlockTicket(activeTicketId);
      selectTicket(null);
    }
  };

  const canResolve = activeTicket && (
    activeTicket.lockedBy?._id === user?._id || isAdmin
  );

  const activeList = tickets.filter((t) => t.status !== 'Resolved');
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/30">
            <Zap size={15} className="text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">PulseTriage</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">Agent</span>
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 ml-1">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-slate-500">Live</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={generateMockTicket} title="Generate mock ticket (dev)" className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-indigo-400 border border-indigo-500/30 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/10 transition-all">
            <PlusCircle size={12} />Dev: New Ticket
          </button>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-full flex items-center justify-center">
              <User size={11} className="text-indigo-400" />
            </div>
            <span className="text-xs text-slate-300 font-medium">{user?.name || user?.username}</span>
          </div>

          <button onClick={logout} title="Sign out" className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all">
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">

        {/* Left: Ticket Queue */}
        <section className="w-80 border-r border-slate-800/60 flex flex-col bg-slate-950/50 flex-shrink-0">

          {/* Filter Bar */}
          <div className="p-3 border-b border-slate-800/60 space-y-2">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); handleFilter(null, null, e.target.value); }}
                placeholder="Search tickets…"
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500/60 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
              />
            </div>
            {/* Status Tabs */}
            <div className="flex gap-1">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setStatusTab(tab); handleFilter(tab, null, null); }}
                  className={`flex-1 text-[11px] font-medium py-1.5 rounded-md transition-all ${statusTab === tab ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Priority Filter */}
            <div className="relative">
              <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <select
                value={priorityFilter}
                onChange={(e) => { setPriorityFilter(e.target.value); handleFilter(null, e.target.value, null); }}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-400 focus:outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="">All Priorities</option>
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>
          </div>

          {/* Queue Header */}
          <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-800/40">
            <span className="text-xs font-semibold text-slate-400">{activeList.length} Active</span>
            <span className="text-[11px] text-slate-600">{resolvedCount} resolved</span>
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {ticketsLoading && tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-600 space-y-2">
                <RefreshCw size={20} className="animate-spin opacity-50" />
                <span className="text-xs">Loading tickets…</span>
              </div>
            ) : activeList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-600 space-y-2">
                <Inbox size={22} className="opacity-40" />
                <span className="text-xs">No tickets in queue</span>
              </div>
            ) : (
              activeList.map((ticket) => {
                const lockedByMe = ticket.lockedBy?._id === user?._id;
                const lockedByOther = !!ticket.lockedBy && !lockedByMe;
                const isActive = ticket._id === activeTicketId;

                return (
                  <div
                    key={ticket._id}
                    onClick={() => !lockedByOther && selectTicket(ticket._id)}
                    className={`relative p-3.5 rounded-xl border transition-all duration-200 group
                      ${lockedByOther ? 'opacity-50 cursor-not-allowed bg-slate-900/20 border-slate-800/40' : 'cursor-pointer bg-slate-900/40 border-slate-800/60 hover:border-slate-700 hover:bg-slate-900/60'}
                      ${isActive ? '!border-indigo-500/70 bg-indigo-950/10 shadow-[0_0_12px_rgba(99,102,241,0.12)]' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-semibold text-xs text-slate-200 line-clamp-1 flex-1">{ticket.title}</h3>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0 ${PRIORITY_CLASS[ticket.priority] || PRIORITY_CLASS.Low}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">{ticket.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock size={10} />
                        <span>{new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {lockedByMe && <span className="flex items-center gap-1 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded"><Unlock size={9} /> You</span>}
                      {lockedByOther && <span className="flex items-center gap-1 text-slate-500 bg-slate-800/80 border border-slate-700 px-1.5 py-0.5 rounded"><Lock size={9} /> {ticket.lockedBy?.name || 'Agent'}</span>}
                      {!ticket.lockedBy && <span className="text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-1.5 py-0.5 rounded">Open</span>}
                    </div>
                    {ticket.assignedTo && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-500">
                        <Shield size={9} className="text-purple-400" />
                        <span>Assigned: <span className="text-purple-300">{ticket.assignedTo.name}</span></span>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {hasMore && (
              <button onClick={loadMoreTickets} disabled={ticketsLoading} className="w-full py-2.5 text-xs text-slate-500 hover:text-indigo-400 border border-slate-800 hover:border-indigo-500/30 rounded-xl transition-all flex items-center justify-center gap-1.5">
                {ticketsLoading ? <RefreshCw size={12} className="animate-spin" /> : <ChevronDown size={12} />}
                {ticketsLoading ? 'Loading…' : 'Load More'}
              </button>
            )}
          </div>
        </section>

        {/* Right: Workspace */}
        <section className="flex-1 flex flex-col bg-slate-950/20 min-w-0">
          {activeTicket ? (
            <div className="flex-1 flex flex-col overflow-hidden">

              {/* Ticket Header */}
              <div className="p-4 border-b border-slate-800/60 bg-slate-900/20 backdrop-blur-sm flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${PRIORITY_CLASS[activeTicket.priority] || PRIORITY_CLASS.Low}`}>
                      {activeTicket.priority} Priority
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">#{activeTicket._id?.slice(-8)}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${activeTicket.status === 'In-Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                      {activeTicket.status}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-100 truncate">{activeTicket.title}</h2>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><User size={10} /> {activeTicket.customerId}</span>
                    {activeTicket.assignedTo && <span className="flex items-center gap-1"><Shield size={10} className="text-purple-400" /><span className="text-purple-300">{activeTicket.assignedTo.name}</span></span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={handleUnlock} className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-slate-200 rounded-lg transition-all">
                    <Unlock size={13} /> Release
                  </button>
                  {canResolve && (
                    <button onClick={() => resolveTicket(activeTicket._id)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg hover:shadow-[0_0_15px_rgba(52,211,153,0.35)] transition-all">
                      <CheckCircle size={13} /> Resolve
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex justify-center">
                  <span className="text-[10px] bg-slate-900 text-slate-500 border border-slate-800 px-3 py-0.5 rounded-full uppercase tracking-wider">Ticket created · Triaged by Gemini AI</span>
                </div>

                {/* Original complaint */}
                <div className="flex items-start gap-3 bg-slate-900/30 border border-slate-800/60 p-4 rounded-xl max-w-2xl">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0"><User size={14} className="text-slate-400" /></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-slate-300">{activeTicket.customerId}</span>
                      <span className="text-[10px] text-slate-600">Customer</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">{activeTicket.description}</p>
                    {activeTicket.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {activeTicket.tags.map((tag, i) => (
                          <span key={i} className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full"><Tag size={9} />{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat thread */}
                {activeMessages.map((msg) => {
                  const isAgent = msg.senderType === 'Agent';
                  const isAI = msg.senderType === 'AI';
                  const isSystem = msg.senderType === 'System';

                  if (isSystem) return (
                    <div key={msg._id} className="flex justify-center">
                      <span className="text-[10px] text-indigo-400 bg-indigo-950/20 px-2 py-0.5 rounded border border-indigo-900/30">{msg.content}</span>
                    </div>
                  );

                  return (
                    <div key={msg._id} className={`flex items-start gap-3 max-w-2xl ${isAgent ? 'ml-auto flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border
                        ${isAgent ? 'bg-indigo-950 text-indigo-400 border-indigo-800' : isAI ? 'bg-purple-950 text-purple-400 border-purple-800' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {isAgent ? <User size={13} /> : isAI ? <Sparkles size={13} /> : <User size={13} />}
                      </div>
                      <div className={`space-y-0.5 ${isAgent ? 'text-right' : ''}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-300">{msg.senderId || msg.senderType}</span>
                          <span className="text-[9px] text-slate-600">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className={`text-xs leading-relaxed p-3 rounded-xl border
                          ${isAgent ? 'bg-indigo-600/10 text-indigo-200 border-indigo-500/20 rounded-tr-none' : isAI ? 'bg-purple-950/20 text-purple-200 border-purple-500/20 rounded-tl-none' : 'bg-slate-900/40 text-slate-300 border-slate-800/60 rounded-tl-none'}`}>
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-800/60 bg-slate-950">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Reply as ${user?.name || 'Agent'}…`}
                    className="flex-1 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500/70 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all"
                  />
                  <button type="submit" disabled={!messageText.trim()} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl px-4 flex items-center justify-center transition-all hover:shadow-[0_0_12px_rgba(99,102,241,0.35)]">
                    <Send size={14} />
                  </button>
                </form>
                <p className="text-[10px] text-slate-600 mt-1.5 flex items-center gap-1">
                  <Unlock size={9} className="text-indigo-400" />
                  Drafting as {user?.name}. Changes broadcast in real-time.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-3">
              <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center">
                <MessageSquare size={22} className="opacity-40 animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-semibold text-slate-400">No Ticket Selected</h3>
                <p className="text-xs text-slate-600 max-w-xs">Select a ticket from the queue to lock it and begin triage</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
