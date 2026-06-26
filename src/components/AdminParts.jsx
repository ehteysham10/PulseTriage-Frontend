import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { api } from '../apiClient';
import {
  Zap, LogOut, BarChart3, Users, Clock, Ticket,
  CheckCircle2, AlertCircle, Loader2, RefreshCw,
  UserCheck, UserX, Shield, TrendingUp, Activity
} from 'lucide-react';

// ── Sub-components ────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className={`bg-slate-900/60 border rounded-xl p-5 flex items-center gap-4 ${color}`}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-current/10 border border-current/20 flex-shrink-0">
        <Icon size={20} className="text-current opacity-80" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-100">{value ?? '—'}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Stats Tab ─────────────────────────────────────────────

function StatsTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTicketStats()
      .then((d) => setStats(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-16"><Loader2 className="text-indigo-400 animate-spin" size={24} /></div>
  );

  const total = (stats?.byStatus?.Open || 0) + (stats?.byStatus?.['In-Progress'] || 0) + (stats?.byStatus?.Resolved || 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Open Tickets" value={stats?.byStatus?.Open} color="text-amber-400" />
        <StatCard icon={Loader2} label="In Progress" value={stats?.byStatus?.['In-Progress']} color="text-blue-400" />
        <StatCard icon={CheckCircle2} label="Resolved" value={stats?.byStatus?.Resolved} color="text-emerald-400" />
        <StatCard icon={Clock} label="Avg Resolution" value={stats?.avgResolutionHours != null ? `${stats.avgResolutionHours.toFixed(1)}h` : '—'} color="text-purple-400" sub="average time" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {['High', 'Medium', 'Low'].map((p) => {
          const count = stats?.byPriority?.[p] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const colors = { High: 'bg-red-500', Medium: 'bg-amber-500', Low: 'bg-emerald-500' };
          const textColors = { High: 'text-red-400', Medium: 'text-amber-400', Low: 'text-emerald-400' };
          return (
            <div key={p} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${textColors[p]}`}>{p} Priority</span>
                <span className="text-lg font-bold text-slate-100">{count}</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${colors[p]} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[10px] text-slate-600 mt-1 block">{pct}% of total</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Pending Approvals Tab ─────────────────────────────────

function PendingTab() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    api.getPendingAgents()
      .then((d) => setAgents(d.agents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handle = async (userId, action) => {
    setActioning((p) => ({ ...p, [userId]: action }));
    try {
      if (action === 'approve') await api.approveAgent(userId);
      else await api.rejectAgent(userId);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActioning((p) => ({ ...p, [userId]: null }));
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="text-indigo-400 animate-spin" size={24} /></div>;

  if (agents.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-3">
      <CheckCircle2 size={36} className="opacity-30" />
      <p className="text-sm">No pending agent requests</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <div key={agent._id} className="flex items-center justify-between bg-slate-900/50 border border-slate-800/60 rounded-xl px-5 py-4 hover:border-slate-700 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
              <Users size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">{agent.name}</p>
              <p className="text-xs text-slate-500">{agent.email} · @{agent.username}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{new Date(agent.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              id={`approve-${agent._id}`}
              onClick={() => handle(agent._id, 'approve')}
              disabled={!!actioning[agent._id]}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 rounded-lg transition-all disabled:opacity-50"
            >
              {actioning[agent._id] === 'approve' ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
              Approve
            </button>
            <button
              id={`reject-${agent._id}`}
              onClick={() => handle(agent._id, 'reject')}
              disabled={!!actioning[agent._id]}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 rounded-lg transition-all disabled:opacity-50"
            >
              {actioning[agent._id] === 'reject' ? <Loader2 size={12} className="animate-spin" /> : <UserX size={12} />}
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export { StatsTab, PendingTab };
