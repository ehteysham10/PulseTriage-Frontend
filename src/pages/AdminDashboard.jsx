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
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 font-sans flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] bg-yellow-500/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-500/5 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.08] bg-black/40 backdrop-blur-md relative">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-md shadow-amber-500/20">
              <Zap size={15} className="text-black" />
            </div>
          </div>
          <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">PulseTriage</span>
          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck size={10} /> <span className="hidden sm:inline">{isSuperAdmin ? 'Super Admin' : 'Admin'}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-2 sm:px-3 py-1.5 rounded-lg">
            <div className="w-6 h-6 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-full flex items-center justify-center">
              <User size={11} className="text-amber-400" />
            </div>
            <span className="text-xs text-amber-100/80 font-medium hidden sm:inline">{user?.name || user?.username}</span>
          </div>
          <button onClick={handleLogout} title="Sign out" className="p-2 text-amber-100/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all">
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 gap-6 relative z-10">

        {/* Page Title */}
        <div>
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-amber-100/50 text-sm mt-0.5">Manage agents, tickets, and system health</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.08] rounded-xl p-1 w-full sm:w-fit overflow-x-auto backdrop-blur-md no-scrollbar">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`admin-tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={`relative flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300
                ${activeTab === id
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/20 font-bold'
                  : 'text-amber-100/50 hover:text-white hover:bg-white/[0.05]'}`}
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
