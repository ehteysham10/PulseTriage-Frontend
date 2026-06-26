import React, { useState } from 'react';
import useSocket from '../hooks/useSocket';
import { AGENTS } from '../context/SocketContext';
import { 
  Lock, 
  Unlock, 
  Send, 
  CheckCircle, 
  User, 
  MessageSquare, 
  Sparkles, 
  UserCheck, 
  PlusCircle, 
  Clock, 
  Tag
} from 'lucide-react';

export default function AgentDashboard() {
  const {
    tickets,
    activeTicketId,
    activeTicket,
    activeMessages,
    currentAgent,
    setCurrentAgent,
    selectTicket,
    sendMessage,
    resolveTicket,
    generateMockTicket
  } = useSocket();

  const [messageText, setMessageText] = useState('');

  // Map Agent ID to readable name
  const getAgentName = (agentId) => {
    const found = AGENTS.find(a => a.id === agentId);
    return found ? found.name : agentId;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeTicketId) return;
    sendMessage(activeTicketId, messageText.trim());
    setMessageText('');
  };

  // Helper for priority badges
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      case 'Low':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
    }
  };

  // Filter out resolved tickets if we only want to show open/in-progress ones, 
  // but let's show all and display their status nicely
  const activeTicketsList = tickets.filter(t => t.status !== 'Resolved');
  const resolvedTicketsCount = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping absolute opacity-75"></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full relative"></div>
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            PulseTriage
          </span>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
            Agent Dashboard
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          
          {/* Dev Mode Mock Generator */}
          <button
            onClick={generateMockTicket}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-400 border border-indigo-500/30 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all duration-200"
          >
            <PlusCircle size={14} />
            <span>Dev Tool: Generate Mock Ticket</span>
          </button>

          {/* Agent Identity Selector */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            <UserCheck size={14} className="text-emerald-400" />
            <span className="text-xs text-slate-400 mr-1">Identity:</span>
            <select
              value={currentAgent.id}
              onChange={(e) => {
                const selected = AGENTS.find(a => a.id === e.target.value);
                if (selected) setCurrentAgent(selected);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none border-none cursor-pointer"
            >
              {AGENTS.map((agent) => (
                <option key={agent.id} value={agent.id} className="bg-slate-900 text-slate-200">
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Ticket Queue */}
        <section className="w-1/3 border-r border-slate-900 flex flex-col bg-slate-950/40">
          <div className="p-4 border-b border-slate-900 flex items-center justify-between bg-slate-950/20">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-300">Ticket Queue</span>
              <span className="bg-slate-900 border border-slate-800 text-xs text-slate-400 px-2 py-0.2 rounded-full">
                {activeTicketsList.length} Active
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {resolvedTicketsCount} resolved
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeTicketsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs space-y-2">
                <MessageSquare size={24} className="opacity-40" />
                <p>No active tickets in queue.</p>
                <p className="text-slate-600">Click 'Generate Mock Ticket' above to add one.</p>
              </div>
            ) : (
              activeTicketsList.map((ticket) => {
                const isLocked = !!ticket.lockedBy;
                const isLockedByMe = ticket.lockedBy === currentAgent.id;
                const isLockedByOther = isLocked && !isLockedByMe;
                const isActive = ticket._id === activeTicketId;

                return (
                  <div
                    key={ticket._id}
                    onClick={() => {
                      if (!isLockedByOther) {
                        selectTicket(ticket._id);
                      }
                    }}
                    className={`
                      relative p-4 rounded-xl border transition-all duration-200 animate-fade-in
                      ${isLockedByOther 
                        ? 'bg-slate-900/20 border-slate-900/60 opacity-50 cursor-not-allowed' 
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 cursor-pointer hover:bg-slate-900/60'
                      }
                      ${isActive ? '!border-indigo-500/80 bg-indigo-950/5 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : ''}
                    `}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm text-slate-200 line-clamp-1">
                        {ticket.title}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getPriorityBadgeClass(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>

                    {/* Description Snippet */}
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      {ticket.description}
                    </p>

                    {/* Metadata & Status */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} />
                        <span>
                          {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      {/* Locking State Indicators */}
                      {isLockedByMe && (
                        <span className="flex items-center gap-1 text-indigo-400 font-medium bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                          <Unlock size={10} /> Active
                        </span>
                      )}
                      {isLockedByOther && (
                        <span className="flex items-center gap-1 text-slate-400 font-medium bg-slate-800/80 border border-slate-700 px-1.5 py-0.5 rounded">
                          <Lock size={10} /> {getAgentName(ticket.lockedBy)}
                        </span>
                      )}
                      {!isLocked && (
                        <span className="text-emerald-400 font-medium bg-emerald-500/5 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                          Open
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Column: Active Workspace */}
        <section className="flex-1 flex flex-col bg-slate-950/20">
          {activeTicket ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Active Ticket Header */}
              <div className="p-4 border-b border-slate-900 bg-slate-900/20 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getPriorityBadgeClass(activeTicket.priority)}`}>
                      {activeTicket.priority} Priority
                    </span>
                    <span className="text-xs text-slate-500">
                      ID: {activeTicket._id.slice(-6)}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-200">
                    {activeTicket.title}
                  </h2>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <User size={12} className="text-slate-500" />
                    <span>Customer: <strong className="text-slate-300">{activeTicket.customerId}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Resolve Button */}
                  <button
                    onClick={() => resolveTicket(activeTicket._id)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg hover:shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all duration-200"
                  >
                    <CheckCircle size={14} />
                    <span>Resolve Ticket</span>
                  </button>
                </div>
              </div>

              {/* Chat & Timeline Panel */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                
                {/* Timeline starting point */}
                <div className="flex justify-center my-2">
                  <span className="text-[10px] bg-slate-900 text-slate-500 border border-slate-800/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Ticket Created & Auto-Triaged by Gemini AI
                  </span>
                </div>

                {/* Initial Complaint / Ticket Details */}
                <div className="flex items-start gap-3 bg-slate-900/30 border border-slate-900 p-4 rounded-xl max-w-3xl">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <User size={16} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-300">{activeTicket.customerId}</span>
                      <span className="text-[10px] text-slate-500">Customer</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                      {activeTicket.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {activeTicket.tags && activeTicket.tags.map((tag, i) => (
                        <span key={i} className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                          <Tag size={10} className="opacity-65" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Conversation Thread */}
                {activeMessages.map((message) => {
                  const isAgent = message.senderType === 'Agent';
                  const isAI = message.senderType === 'AI';
                  const isSystem = message.senderType === 'System';

                  if (isSystem) {
                    return (
                      <div key={message._id} className="flex justify-center my-1">
                        <span className="text-[10px] text-indigo-400 bg-indigo-950/20 px-2 py-0.5 rounded border border-indigo-900/30">
                          {message.content}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={message._id} 
                      className={`flex items-start gap-3 max-w-3xl ${isAgent ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border
                        ${isAgent ? 'bg-indigo-950 text-indigo-400 border-indigo-800' : ''}
                        ${isAI ? 'bg-purple-950 text-purple-400 border-purple-800' : ''}
                        ${message.senderType === 'Customer' ? 'bg-slate-800 text-slate-400 border-slate-700' : ''}
                      `}>
                        {isAgent ? <UserCheck size={14} /> : isAI ? <Sparkles size={14} /> : <User size={14} />}
                      </div>

                      {/* Content */}
                      <div className={`space-y-0.5 ${isAgent ? 'text-right' : ''}`}>
                        <div className="flex items-center gap-2 justify-start">
                          <span className="text-xs font-semibold text-slate-300">
                            {message.senderId || message.senderType}
                          </span>
                          <span className="text-[9px] text-slate-500">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`
                          text-xs leading-relaxed p-3 rounded-xl border
                          ${isAgent 
                            ? 'bg-indigo-600/10 text-indigo-200 border-indigo-500/20 rounded-tr-none text-left' 
                            : isAI 
                              ? 'bg-purple-950/20 text-purple-200 border-purple-500/20 rounded-tl-none' 
                              : 'bg-slate-900/40 text-slate-300 border-slate-900 rounded-tl-none'
                          }
                        `}>
                          {message.content}
                        </p>
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* Message Input Panel */}
              <div className="p-4 border-t border-slate-900 bg-slate-950">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your response to the customer..."
                    className="flex-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition-all duration-150"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded-lg px-4 flex items-center justify-center transition-all duration-150 hover:shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                  >
                    <Send size={14} />
                  </button>
                </form>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2">
                  <Unlock size={10} className="text-indigo-400" />
                  <span>Drafting as {currentAgent.name}. Changes synchronized in real-time.</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-400 shadow-inner">
                <MessageSquare size={24} className="opacity-50 animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-semibold text-slate-300">No Ticket Selected</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Select a ticket from the queue on the left to lock it and begin triage.
                </p>
              </div>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
