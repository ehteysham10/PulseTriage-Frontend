import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { api } from '../apiClient';
import { StatsTab, PendingTab } from '../components/AdminParts';
import { AgentsTab, AdminTicketsTab } from '../components/AdminParts2';
import {
  Zap, LogOut, BarChart3, Users, Clock, Ticket,
  ShieldCheck, Bell, User
} from 'lucide-react';

const TABS = [
  { id: 'stats',    label: 'Overview',     icon: BarChart3   },
  { id: 'pending',  label: 'Approvals',    icon: Bell        },
  { id: 'agents',   label: 'All Agents',   icon: Users       },
  { id: 'tickets',  label: 'All Tickets',  icon: Ticket      },
];

export default function AdminDashboard() {
  const { user, logout, isSuperAdmin, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [pendingCount, setPendingCount] = useState(0);

  // Badge: fetch pending count for the Approvals tab
  useEffect(() => {
    if (isAdmin) {
      api.getPendingAgents()
        .then((d) => setPendingCount(d.count || 0))
        .catch(() => {});
    }
  }, [isAdmin]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/30">
            <Zap size={15} className="text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">PulseTriage</span>
          <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck size={10} /> {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-full flex items-center justify-center">
              <User size={11} className="text-purple-400" />
            </div>
            <span className="text-xs text-slate-300 font-medium">{user?.name || user?.username}</span>
          </div>
          <button onClick={handleLogout} title="Sign out" className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all">
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-6 py-6 gap-6">

        {/* Page Title */}
        <div>
          <h1 className="text-xl font-bold text-slate-100">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage agents, tickets, and system health</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900/60 border border-slate-800/60 rounded-xl p-1 w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`admin-tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={`relative flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200
                ${activeTab === id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}
            >
              <Icon size={13} />
              {label}
              {id === 'pending' && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === 'stats'   && <StatsTab />}
          {activeTab === 'pending' && <PendingTab />}
          {activeTab === 'agents'  && <AgentsTab isSuperAdmin={isSuperAdmin} />}
          {activeTab === 'tickets' && <AdminTicketsTab />}
        </div>
      </div>
    </div>
  );
}
