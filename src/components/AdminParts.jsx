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
    <div className={`bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 flex items-center gap-4 ${color} relative overflow-hidden`}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-current/10 border border-current/20 flex-shrink-0">
        <Icon size={20} className="text-current opacity-90" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
        <p className="text-xs text-amber-100/50 mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-amber-100/30 mt-0.5">{sub}</p>}
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
    <div className="flex justify-center py-16"><Loader2 className="text-amber-400 animate-spin" size={24} /></div>
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
            <div key={p} className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className={`text-xs font-bold uppercase tracking-wider ${textColors[p]}`}>{p} Priority</span>
                <span className="text-lg font-bold text-white">{count}</span>
              </div>
              <div className="h-1.5 bg-black/40 rounded-full overflow-hidden relative z-10">
                <div className={`h-full ${colors[p]} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[10px] text-amber-100/40 mt-1 block relative z-10">{pct}% of total</span>
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

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="text-amber-400 animate-spin" size={24} /></div>;

  if (agents.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-3">
      <CheckCircle2 size={36} className="opacity-30" />
      <p className="text-sm">No pending agent requests</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <div key={agent._id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 hover:border-amber-500/30 hover:bg-white/[0.05] transition-all duration-300 relative overflow-hidden gap-4">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <Users size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{agent.name}</p>
              <p className="text-xs text-amber-100/60">{agent.email} · @{agent.username}</p>
              <p className="text-[10px] text-amber-100/40 mt-0.5">{new Date(agent.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-2 relative z-10 w-full sm:w-auto">
            <button
              id={`approve-${agent._id}`}
              onClick={() => handle(agent._id, 'approve')}
              disabled={!!actioning[agent._id]}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-black bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {actioning[agent._id] === 'approve' ? <Loader2 size={12} className="animate-spin text-black" /> : <UserCheck size={12} />}
              Approve
            </button>
            <button
              id={`reject-${agent._id}`}
              onClick={() => handle(agent._id, 'reject')}
              disabled={!!actioning[agent._id]}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-400 border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 rounded-lg transition-all duration-300 disabled:opacity-50"
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
