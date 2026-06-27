import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../apiClient';
import {
  Users, Loader2, Shield, UserCheck, UserX,
  RefreshCw, ChevronDown, Search, Filter,
  Lock, Unlock, CheckCircle, Tag, Clock, X
} from 'lucide-react';

// ── Agents Tab ────────────────────────────────────────────

export function AgentsTab({ isSuperAdmin }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    api.getAllAgents()
      .then((d) => setAgents(d.agents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handle = async (userId, action) => {
    setActioning((p) => ({ ...p, [userId]: action }));
    try {
      if (action === 'promote') await api.promoteAgent(userId);
      else await api.demoteAgent(userId);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActioning((p) => ({ ...p, [userId]: null }));
    }
  };

  const statusColors = {
    Approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    Pending: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    Rejected: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="text-amber-400 animate-spin" size={24} /></div>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.04] border-b border-white/[0.08]">
          <tr>
            {['Agent', 'Email', 'Role', 'Status', 'Joined', isSuperAdmin && 'Actions'].filter(Boolean).map((h) => (
              <th key={h} className="text-left text-[11px] font-semibold text-amber-100/50 uppercase tracking-wider px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {agents.map((agent) => (
            <tr key={agent._id} className="hover:bg-white/[0.02] transition-colors duration-300">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Users size={12} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{agent.name}</p>
                    <p className="text-[10px] text-amber-100/40">@{agent.username}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-amber-100/70">{agent.email}</td>
              <td className="px-4 py-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${agent.role === 'Admin' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-amber-100/60 bg-white/[0.02] border-white/[0.08]'}`}>
                  {agent.role}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColors[agent.approvalStatus] || statusColors.Pending}`}>
                  {agent.approvalStatus}
                </span>
              </td>
              <td className="px-4 py-3 text-[11px] text-amber-100/40">{new Date(agent.createdAt).toLocaleDateString()}</td>
              {isSuperAdmin && (
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {agent.role === 'Agent' && (
                      <button
                        id={`promote-${agent._id}`}
                        onClick={() => handle(agent._id, 'promote')}
                        disabled={!!actioning[agent._id]}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-amber-400 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 rounded-lg transition-all duration-300 disabled:opacity-50"
                      >
                        {actioning[agent._id] ? <Loader2 size={10} className="animate-spin text-amber-400" /> : <Shield size={10} />}
                        Promote
                      </button>
                    )}
                    {agent.role === 'Admin' && (
                      <button
                        id={`demote-${agent._id}`}
                        onClick={() => handle(agent._id, 'demote')}
                        disabled={!!actioning[agent._id]}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-amber-100/50 border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] rounded-lg transition-all duration-300 disabled:opacity-50"
                      >
                        {actioning[agent._id] ? <Loader2 size={10} className="animate-spin" /> : <UserX size={10} />}
                        Demote
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Admin Tickets Tab ─────────────────────────────────────

const PRIORITY_CLASS = {
  High: 'text-red-400 bg-red-500/10 border-red-500/30',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

export function AdminTicketsTab() {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assignModal, setAssignModal] = useState(null); // ticketId
  const [selectedAgent, setSelectedAgent] = useState('');
  const [assigning, setAssigning] = useState(false);

  const loadTickets = useCallback(async (reset = false, overrides = {}) => {
    setLoading(true);
    try {
      const params = {
        limit: 20,
        status: overrides.status ?? statusFilter,
        priority: overrides.priority ?? priorityFilter,
        search: overrides.search ?? search,
      };
      if (!reset && cursor) params.cursor = cursor;
      const data = await api.getTickets(params);
      setTickets(reset ? data.tickets : (prev) => {
        const ids = new Set(prev.map((t) => t._id));
        return [...prev, ...data.tickets.filter((t) => !ids.has(t._id))];
      });
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [cursor, statusFilter, priorityFilter, search]);

  useEffect(() => {
    loadTickets(true);
    api.getAllAgents().then((d) => setAgents((d.agents || []).filter((a) => a.approvalStatus === 'Approved')));
  }, []); // eslint-disable-line

  const applyFilter = (s, p, q) => {
    setStatusFilter(s); setPriorityFilter(p); setSearch(q); setCursor(null);
    loadTickets(true, { status: s, priority: p, search: q });
  };

  const handleAssign = async () => {
    if (!selectedAgent || !assignModal) return;
    setAssigning(true);
    try {
      await api.assignTicket(assignModal, selectedAgent);
      setTickets((prev) => prev.map((t) => t._id === assignModal
        ? { ...t, status: 'In-Progress', assignedTo: agents.find((a) => a._id === selectedAgent) }
        : t));
      setAssignModal(null);
      setSelectedAgent('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign');
    } finally { setAssigning(false); }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:flex gap-2 w-full">
        <div className="relative flex-1 min-w-0 sm:min-w-40 group">
          <div className="absolute inset-0 bg-amber-500/5 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-200/50 pointer-events-none z-10" />
          <input value={search} onChange={(e) => applyFilter(statusFilter, priorityFilter, e.target.value)} placeholder="Search…" className="w-full bg-black/20 border border-white/10 hover:border-white/20 focus:border-amber-400/50 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all duration-300 backdrop-blur-md relative z-10" />
        </div>
        <select value={statusFilter} onChange={(e) => applyFilter(e.target.value, priorityFilter, search)} className="w-full sm:w-auto bg-black/20 border border-white/10 hover:border-white/20 text-amber-100/70 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400/50 transition-all duration-300">
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        <select value={priorityFilter} onChange={(e) => applyFilter(statusFilter, e.target.value, search)} className="w-full sm:w-auto bg-black/20 border border-white/10 hover:border-white/20 text-amber-100/70 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400/50 transition-all duration-300">
          <option value="">All Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md">
        <table className="w-full text-xs">
          <thead className="bg-white/[0.04] border-b border-white/[0.08]">
            <tr>
              {['Title', 'Status', 'Priority', 'Assigned To', 'Created', 'Actions'].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold text-amber-100/50 uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {tickets.map((t) => (
              <tr key={t._id} className="hover:bg-white/[0.02] transition-colors duration-300">
                <td className="px-4 py-3 max-w-xs">
                  <p className="font-semibold text-white truncate">{t.title}</p>
                  <p className="text-[10px] text-amber-100/40 truncate">{t.customerId}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${t.status === 'Open' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : t.status === 'In-Progress' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' : 'text-amber-300 bg-amber-500/20 border-amber-500/40'}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_CLASS[t.priority] || PRIORITY_CLASS.Low}`}>{t.priority}</span>
                </td>
                <td className="px-4 py-3 text-amber-100/70">{t.assignedTo?.name || <span className="text-amber-100/30">Unassigned</span>}</td>
                <td className="px-4 py-3 text-amber-100/40">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {t.status !== 'Resolved' && (
                    <button
                      id={`assign-btn-${t._id}`}
                      onClick={() => { setAssignModal(t._id); setSelectedAgent(''); }}
                      className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-amber-400 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 rounded-lg transition-all duration-300"
                    >
                      <UserCheck size={10} /> Assign
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="flex justify-center py-6"><Loader2 className="text-amber-400 animate-spin" size={18} /></div>}
      </div>

      {hasMore && (
        <button onClick={() => loadTickets(false)} disabled={loading} className="w-full py-2.5 text-xs text-amber-100/50 hover:text-amber-400 border border-white/10 hover:border-amber-500/30 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 bg-white/[0.01] hover:bg-white/[0.03]">
          <ChevronDown size={12} /> Load More
        </button>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="font-bold text-white text-sm">Assign Ticket</h3>
              <button onClick={() => setAssignModal(null)} className="text-amber-100/40 hover:text-white transition-colors"><X size={16} /></button>
            </div>
            <p className="text-xs text-amber-100/60 mb-4 relative z-10">Select an agent to handle this ticket. Status will change to In-Progress.</p>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full bg-black/45 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50 mb-4 relative z-10 transition-all duration-300"
            >
              <option value="">— Select Agent —</option>
              {agents.map((a) => <option key={a._id} value={a._id} className="bg-black text-white">{a.name} (@{a.username})</option>)}
            </select>
            <div className="flex gap-2 relative z-10">
              <button onClick={() => setAssignModal(null)} className="flex-1 py-2 text-xs text-amber-100/60 border border-white/10 rounded-xl hover:bg-white/[0.05] transition-all duration-300">Cancel</button>
              <button
                id="confirm-assign-btn"
                onClick={handleAssign}
                disabled={!selectedAgent || assigning}
                className="flex-1 py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:opacity-50 text-black rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                {assigning ? <Loader2 size={12} className="animate-spin text-black" /> : <UserCheck size={12} />}
                {assigning ? 'Assigning…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
