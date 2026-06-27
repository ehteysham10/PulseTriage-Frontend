import React, { useState, useEffect, useRef } from 'react';
import useSocket from '../hooks/useSocket';
import useAuth from '../hooks/useAuth';
import {
  Lock, Unlock, Send, CheckCircle, User, MessageSquare, Sparkles,
  PlusCircle, Clock, Tag, Search, Filter, LogOut, ChevronDown, Zap,
  RefreshCw, Inbox, Shield, ChevronLeft
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
  const [mobileShowQueue, setMobileShowQueue] = useState(true);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, activeTicketId]);

  useEffect(() => {
    if (activeTicketId) {
      setMobileShowQueue(false);
    } else {
      setMobileShowQueue(true);
    }
  }, [activeTicketId]);

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
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-slate-100 font-sans overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] bg-yellow-500/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-500/5 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.08] bg-black/40 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-md shadow-amber-500/20">
              <Zap size={15} className="text-black" />
            </div>
          </div>
          <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">PulseTriage</span>
          <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 hidden sm:inline-block">Agent</span>
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 ml-1 hidden sm:flex">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-amber-100/40">Live</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={generateMockTicket} title="Generate mock ticket (dev)" className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-amber-400 border border-amber-500/30 rounded-lg bg-amber-500/5 hover:bg-amber-500/15 transition-all duration-300">
            <PlusCircle size={12} />
            <span className="hidden sm:inline">Dev: New Ticket</span>
          </button>

          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-2 sm:px-3 py-1.5 rounded-lg">
            <div className="w-6 h-6 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-full flex items-center justify-center">
              <User size={11} className="text-amber-400" />
            </div>
            <span className="text-xs text-amber-100/80 font-medium hidden sm:inline">{user?.name || user?.username}</span>
          </div>

          <button onClick={logout} title="Sign out" className="p-2 text-amber-100/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all">
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">

        {/* Left: Ticket Queue */}
        <section className={`${mobileShowQueue ? 'flex' : 'hidden'} md:flex w-full md:w-80 border-r border-white/[0.08] flex-col bg-black/20 backdrop-blur-md flex-shrink-0 relative z-10`}>

          {/* Filter Bar */}
          <div className="p-3 border-b border-white/[0.08] space-y-2">
            {/* Search */}
            <div className="relative group">
              <div className="absolute inset-0 bg-amber-500/5 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-200/50 pointer-events-none z-10" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); handleFilter(null, null, e.target.value); }}
                placeholder="Search tickets…"
                className="w-full bg-black/20 border border-white/10 hover:border-white/20 focus:border-amber-400/50 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all duration-300 backdrop-blur-md relative z-10"
              />
            </div>
            {/* Status Tabs */}
            <div className="flex gap-1">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setStatusTab(tab); handleFilter(tab, null, null); }}
                  className={`flex-1 text-[11px] font-bold py-1.5 rounded-md transition-all duration-300 ${statusTab === tab ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-md shadow-amber-500/20' : 'text-amber-100/50 hover:text-white hover:bg-white/[0.05]'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Priority Filter */}
            <div className="relative group">
              <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-200/50 pointer-events-none z-10" />
              <select
                value={priorityFilter}
                onChange={(e) => { setPriorityFilter(e.target.value); handleFilter(null, e.target.value, null); }}
                className="w-full bg-black/20 border border-white/10 hover:border-white/20 text-amber-100/70 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400/50 transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="">All Priorities</option>
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Queue Header */}
          <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/[0.04]">
            <span className="text-xs font-semibold text-amber-100/60">{activeList.length} Active</span>
            <span className="text-[11px] text-amber-100/40">{resolvedCount} resolved</span>
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 relative z-10">
            {ticketsLoading && tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-amber-100/40 space-y-2">
                <RefreshCw size={20} className="animate-spin opacity-50 text-amber-400" />
                <span className="text-xs">Loading tickets…</span>
              </div>
            ) : activeList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-amber-100/40 space-y-2">
                <Inbox size={22} className="opacity-45 text-amber-400" />
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
                    onClick={() => {
                      if (!lockedByOther) {
                        selectTicket(ticket._id);
                        setMobileShowQueue(false);
                      }
                    }}
                    className={`relative p-3.5 rounded-xl border transition-all duration-300 group overflow-hidden
                      ${lockedByOther ? 'opacity-55 cursor-not-allowed bg-black/10 border-white/[0.04]' : 'cursor-pointer bg-white/[0.02] border-white/[0.06] hover:border-amber-500/35 hover:bg-white/[0.05]'}
                      ${isActive ? '!border-amber-500/60 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.12)]' : ''}
                    `}
                  >
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="flex items-start justify-between gap-2 mb-1.5 relative z-10">
                      <h3 className="font-semibold text-xs text-white line-clamp-1 flex-1">{ticket.title}</h3>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0 ${PRIORITY_CLASS[ticket.priority] || PRIORITY_CLASS.Low}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-100/60 line-clamp-2 mb-2 relative z-10">{ticket.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-amber-100/40 relative z-10">
                      <div className="flex items-center gap-1">
                        <Clock size={10} className="text-amber-200/50" />
                        <span>{new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {lockedByMe && <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded"><Unlock size={9} /> You</span>}
                      {lockedByOther && <span className="flex items-center gap-1 text-amber-100/50 bg-white/[0.05] border border-white/10 px-1.5 py-0.5 rounded"><Lock size={9} /> {ticket.lockedBy?.name || 'Agent'}</span>}
                      {!ticket.lockedBy && <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">Open</span>}
                    </div>
                    {ticket.assignedTo && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-100/50 relative z-10">
                        <Shield size={9} className="text-amber-400/80" />
                        <span>Assigned: <span className="text-amber-400/90">{ticket.assignedTo.name}</span></span>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {hasMore && (
              <button onClick={loadMoreTickets} disabled={ticketsLoading} className="w-full py-2.5 text-xs text-amber-100/50 hover:text-amber-400 border border-white/10 hover:border-amber-500/30 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 bg-white/[0.01] hover:bg-white/[0.03]">
                {ticketsLoading ? <RefreshCw size={12} className="animate-spin text-amber-400" /> : <ChevronDown size={12} />}
                {ticketsLoading ? 'Loading…' : 'Load More'}
              </button>
            )}
          </div>
        </section>

        {/* Right: Workspace */}
        <section className={`${!mobileShowQueue ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-transparent min-w-0 relative z-10`}>
          {activeTicket ? (
            <div className="flex-1 flex flex-col overflow-hidden">

              {/* Ticket Header */}
              <div className="p-4 border-b border-white/[0.08] bg-black/20 backdrop-blur-md flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setMobileShowQueue(true)}
                    className="md:hidden p-2 text-amber-100/60 hover:text-white hover:bg-white/[0.05] rounded-xl border border-white/10 transition-all duration-300 flex-shrink-0"
                    title="Back to queue"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${PRIORITY_CLASS[activeTicket.priority] || PRIORITY_CLASS.Low}`}>
                        {activeTicket.priority} Priority
                      </span>
                      <span className="text-[11px] text-amber-100/40 font-mono">#{activeTicket._id?.slice(-8)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${activeTicket.status === 'In-Progress' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                        {activeTicket.status}
                      </span>
                    </div>
                    <h2 className="text-sm font-bold text-white truncate">{activeTicket.title}</h2>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-amber-100/50">
                      <span className="flex items-center gap-1"><User size={10} className="text-amber-200/50" /> {activeTicket.customerId}</span>
                      {activeTicket.assignedTo && <span className="flex items-center gap-1"><Shield size={10} className="text-amber-400" /><span className="text-amber-400">{activeTicket.assignedTo.name}</span></span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={handleUnlock} className="flex items-center gap-1.5 px-3 py-2 text-xs text-amber-100/60 border border-white/10 rounded-xl hover:bg-white/[0.05] hover:text-white transition-all duration-300">
                    <Unlock size={13} /> Release
                  </button>
                  {canResolve && (
                    <button onClick={() => resolveTicket(activeTicket._id)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all duration-300">
                      <CheckCircle size={13} /> Resolve
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex justify-center">
                  <span className="text-[10px] bg-white/[0.02] text-amber-100/40 border border-white/[0.06] px-3 py-0.5 rounded-full uppercase tracking-wider">Ticket created · Triaged by Gemini AI</span>
                </div>

                {/* Original complaint */}
                <div className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.06] backdrop-blur-md p-4 rounded-2xl max-w-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center flex-shrink-0 relative z-10"><User size={14} className="text-amber-100/60" /></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-white">{activeTicket.customerId}</span>
                      <span className="text-[10px] text-amber-100/40">Customer</span>
                    </div>
                    <p className="text-xs text-amber-100/80 leading-relaxed bg-black/25 p-3 rounded-lg border border-white/[0.04]">{activeTicket.description}</p>
                    {activeTicket.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {activeTicket.tags.map((tag, i) => (
                          <span key={i} className="flex items-center gap-1 text-[10px] text-amber-100/60 bg-white/[0.02] border border-white/[0.08] px-2 py-0.5 rounded-full"><Tag size={9} className="text-amber-400" />{tag}</span>
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
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{msg.content}</span>
                    </div>
                  );

                  return (
                    <div key={msg._id} className={`flex items-start gap-3 max-w-2xl ${isAgent ? 'ml-auto flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-300
                        ${isAgent ? 'bg-amber-950 text-amber-400 border-amber-800/50' : isAI ? 'bg-yellow-950 text-yellow-400 border-yellow-800/50' : 'bg-white/[0.05] text-amber-100/50 border-white/10'}`}>
                        {isAgent ? <User size={13} /> : isAI ? <Sparkles size={13} /> : <User size={13} />}
                      </div>
                      <div className={`space-y-0.5 ${isAgent ? 'text-right' : ''}`}>
                        <div className="flex items-center gap-2 justify-end flex-row-reverse">
                          <span className="text-xs font-semibold text-white">{msg.senderId || msg.senderType}</span>
                          <span className="text-[9px] text-amber-100/40">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className={`text-xs leading-relaxed p-3 rounded-xl border transition-all duration-300
                          ${isAgent ? 'bg-amber-500/10 text-amber-200 border-amber-500/20 rounded-tr-none' : isAI ? 'bg-yellow-500/10 text-yellow-200 border-yellow-500/20 rounded-tl-none' : 'bg-white/[0.02] text-amber-100/80 border-white/[0.06] rounded-tl-none'}`}>
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/[0.08] bg-black/40 backdrop-blur-md">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Reply as ${user?.name || 'Agent'}…`}
                    className="flex-1 bg-black/20 border border-white/10 hover:border-white/20 focus:border-amber-400/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                  />
                  <button type="submit" disabled={!messageText.trim()} className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:opacity-40 text-black font-bold rounded-xl px-4 flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_12px_rgba(245,158,11,0.35)]">
                    <Send size={14} />
                  </button>
                </form>
                <p className="text-[10px] text-amber-100/40 mt-1.5 flex items-center gap-1">
                  <Unlock size={9} className="text-amber-400 animate-pulse" />
                  Drafting as {user?.name}. Changes broadcast in real-time.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-amber-100/30 space-y-3">
              <div className="w-14 h-14 bg-white/[0.02] border border-white/[0.08] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                <MessageSquare size={22} className="opacity-50 animate-pulse text-amber-400" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-semibold text-amber-100/50">No Ticket Selected</h3>
                <p className="text-xs text-amber-100/30 max-w-xs">Select a ticket from the queue to lock it and begin triage</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
