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

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="text-indigo-400 animate-spin" size={24} /></div>;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/60">
      <table className="w-full text-sm">
        <thead className="bg-slate-900/80 border-b border-slate-800/60">
          <tr>
            {['Agent', 'Email', 'Role', 'Status', 'Joined', isSuperAdmin && 'Actions'].filter(Boolean).map((h) => (
              <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40">
          {agents.map((agent) => (
            <tr key={agent._id} className="hover:bg-slate-800/20 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <Users size={12} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{agent.name}</p>
                    <p className="text-[10px] text-slate-600">@{agent.username}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-slate-400">{agent.email}</td>
              <td className="px-4 py-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${agent.role === 'Admin' ? 'text-purple-400 bg-purple-500/10 border-purple-500/30' : 'text-slate-400 bg-slate-800/50 border-slate-700'}`}>
                  {agent.role}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColors[agent.approvalStatus] || statusColors.Pending}`}>
                  {agent.approvalStatus}
                </span>
              </td>
              <td className="px-4 py-3 text-[11px] text-slate-600">{new Date(agent.createdAt).toLocaleDateString()}</td>
              {isSuperAdmin && (
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {agent.role === 'Agent' && (
                      <button
                        id={`promote-${agent._id}`}
                        onClick={() => handle(agent._id, 'promote')}
                        disabled={!!actioning[agent._id]}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-purple-400 border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/15 rounded-lg transition-all disabled:opacity-50"
                      >
                        {actioning[agent._id] ? <Loader2 size={10} className="animate-spin" /> : <Shield size={10} />}
                        Promote
                      </button>
                    )}
                    {agent.role === 'Admin' && (
                      <button
                        id={`demote-${agent._id}`}
                        onClick={() => handle(agent._id, 'demote')}
                        disabled={!!actioning[agent._id]}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-slate-400 border border-slate-700 bg-slate-800/30 hover:bg-slate-700/40 rounded-lg transition-all disabled:opacity-50"
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
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => applyFilter(statusFilter, priorityFilter, e.target.value)} placeholder="Search…" className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-all" />
        </div>
        <select value={statusFilter} onChange={(e) => applyFilter(e.target.value, priorityFilter, search)} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none">
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        <select value={priorityFilter} onChange={(e) => applyFilter(statusFilter, e.target.value, search)} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none">
          <option value="">All Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800/60">
        <table className="w-full text-xs">
          <thead className="bg-slate-900/80 border-b border-slate-800/60">
            <tr>
              {['Title', 'Status', 'Priority', 'Assigned To', 'Created', 'Actions'].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {tickets.map((t) => (
              <tr key={t._id} className="hover:bg-slate-800/20 transition-colors">
                <td className="px-4 py-3 max-w-xs">
                  <p className="font-medium text-slate-200 truncate">{t.title}</p>
                  <p className="text-[10px] text-slate-600 truncate">{t.customerId}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${t.status === 'Open' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : t.status === 'In-Progress' ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_CLASS[t.priority] || PRIORITY_CLASS.Low}`}>{t.priority}</span>
                </td>
                <td className="px-4 py-3 text-slate-400">{t.assignedTo?.name || <span className="text-slate-700">Unassigned</span>}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {t.status !== 'Resolved' && (
                    <button
                      id={`assign-btn-${t._id}`}
                      onClick={() => { setAssignModal(t._id); setSelectedAgent(''); }}
                      className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-indigo-400 border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/15 rounded-lg transition-all"
                    >
                      <UserCheck size={10} /> Assign
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="flex justify-center py-6"><Loader2 className="text-indigo-400 animate-spin" size={18} /></div>}
      </div>

      {hasMore && (
        <button onClick={() => loadTickets(false)} disabled={loading} className="w-full py-2.5 text-xs text-slate-500 hover:text-indigo-400 border border-slate-800 hover:border-indigo-500/30 rounded-xl transition-all flex items-center justify-center gap-1.5">
          <ChevronDown size={12} /> Load More
        </button>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-100 text-sm">Assign Ticket</h3>
              <button onClick={() => setAssignModal(null)} className="text-slate-500 hover:text-slate-300 transition-colors"><X size={16} /></button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Select an agent to handle this ticket. Status will change to In-Progress.</p>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60 mb-4"
            >
              <option value="">— Select Agent —</option>
              {agents.map((a) => <option key={a._id} value={a._id}>{a.name} (@{a.username})</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setAssignModal(null)} className="flex-1 py-2 text-xs text-slate-400 border border-slate-700 rounded-xl hover:border-slate-600 transition-all">Cancel</button>
              <button
                id="confirm-assign-btn"
                onClick={handleAssign}
                disabled={!selectedAgent || assigning}
                className="flex-1 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                {assigning ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
                {assigning ? 'Assigning…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
