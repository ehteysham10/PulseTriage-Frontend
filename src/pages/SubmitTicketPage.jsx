import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, Zap, User, FileText, Hash } from 'lucide-react';
import { api } from '../apiClient';

export default function SubmitTicketPage() {
  const [form, setForm] = useState({ title: '', description: '', customerId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setError('');
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.createTicket(form);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    High: 'text-red-400 bg-red-500/10 border-red-500/30',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  };

  if (result) {
    const pClass = priorityColors[result.aiClassification?.priority] || priorityColors.Low;
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        
        {/* Floating Particles Backdrop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-amber-500 rounded-full blur-[1px] animate-float-1" />
          <div className="absolute top-[60%] left-[25%] w-1.5 h-1.5 bg-yellow-500 rounded-full blur-[1px] animate-float-2" />
          <div className="absolute top-[40%] right-[15%] w-2 h-2 bg-amber-400 rounded-full blur-[1px] animate-float-3" />
          <div className="absolute top-[80%] right-[30%] w-1 h-1 bg-yellow-400 rounded-full blur-[1px] animate-float-1" />
          <div className="absolute top-[10%] right-[45%] w-2.5 h-2.5 bg-amber-600 rounded-full blur-[1.5px] animate-float-2" />
        </div>

        <div className="w-full max-w-lg relative z-10">
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center">
                <CheckCircle2 size={24} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white drop-shadow-sm">Ticket Submitted!</h2>
                <p className="text-amber-100/60 text-xs">Your ticket has been triaged by AI</p>
              </div>
            </div>

            {/* AI Classification Result */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-5 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-amber-400" />
                <span className="text-xs font-semibold text-amber-300/80 uppercase tracking-wider">Gemini AI Classification</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${pClass}`}>
                  {result.aiClassification?.priority} Priority
                </span>
                {result.aiClassification?.tags?.map((tag) => (
                  <span key={tag} className="text-xs text-amber-200/60 bg-black/40 border border-white/10 px-2.5 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Ticket Info */}
            <div className="bg-black/20 border border-white/10 rounded-xl p-4 mb-6 space-y-2 relative z-10">
              <div className="flex justify-between text-xs">
                <span className="text-amber-100/50">Ticket ID</span>
                <span className="text-amber-100/80 font-mono">{result.ticket?._id?.slice(-10)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-amber-100/50">Status</span>
                <span className="text-amber-400 font-medium">{result.ticket?.status}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-amber-100/50">Title</span>
                <span className="text-amber-100/80 max-w-[60%] text-right">{result.ticket?.title}</span>
              </div>
            </div>

            <p className="text-xs text-amber-100/50 mb-6 text-center relative z-10">
              An agent will review your ticket shortly. Keep your Customer ID for reference.
            </p>

            <button
              onClick={() => { setResult(null); setForm({ title: '', description: '', customerId: '' }); }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold py-3.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] relative z-10"
            >
              <Ticket size={16} />
              Submit Another Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[400px] bg-amber-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.1),transparent)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Floating Particles Backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-amber-500 rounded-full blur-[1px] animate-float-1" />
        <div className="absolute top-[60%] left-[25%] w-1.5 h-1.5 bg-yellow-500 rounded-full blur-[1px] animate-float-2" />
        <div className="absolute top-[40%] right-[15%] w-2 h-2 bg-amber-400 rounded-full blur-[1px] animate-float-3" />
        <div className="absolute top-[80%] right-[30%] w-1 h-1 bg-yellow-400 rounded-full blur-[1px] animate-float-1" />
        <div className="absolute top-[10%] right-[45%] w-2.5 h-2.5 bg-amber-600 rounded-full blur-[1.5px] animate-float-2" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Zap size={20} className="text-black" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-[#0a0a0a] animate-pulse" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">PulseTriage</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-amber-100/60 text-sm">
            <Sparkles size={13} className="text-amber-400" />
            <span>AI-powered ticket triage — your request will be classified automatically</span>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent" />

          {/* AI Scanner overlay */}
          {loading && (
            <div className="absolute inset-0 bg-[#0a0a0a]/85 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-3xl overflow-hidden p-6 animate-fade-in">
              {/* Scan Beam */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-scan z-10" />
              <div className="relative flex flex-col items-center justify-center space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse">
                  <Sparkles size={28} className="text-amber-400 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gemini AI Triaging...</h3>
                  <p className="text-xs text-amber-100/50 mt-1 max-w-[240px]">Analyzing context, determining priority, and routing tags</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-8 relative z-10">
            <Ticket size={20} className="text-amber-400" />
            <div>
              <h1 className="text-xl font-bold text-white drop-shadow-sm">Submit a Support Ticket</h1>
              <p className="text-amber-100/60 text-xs mt-0.5">Describe your issue and our AI will prioritize and route it</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3.5">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="ticket-customerid" className="text-[11px] font-semibold text-amber-100/50 uppercase tracking-wider ml-1">Your Customer ID / Email</label>
              <div className="relative group rounded-xl p-[1px] transition-all duration-300 bg-white/10 focus-within:bg-gradient-to-r focus-within:from-amber-500 focus-within:to-yellow-600 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <div className="relative flex items-center bg-[#0d0d0d]/90 rounded-[11px] w-full">
                  <User size={16} className="absolute left-4 text-amber-200/50 pointer-events-none z-10" />
                  <input id="ticket-customerid" name="customerId" type="text" value={form.customerId} onChange={handleChange} placeholder="customer@email.com or your-id" required className="w-full bg-transparent border-none focus:ring-0 rounded-[11px] pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none transition-all duration-300 relative z-10" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="ticket-title" className="text-[11px] font-semibold text-amber-100/50 uppercase tracking-wider ml-1">Issue Title</label>
              <div className="relative group rounded-xl p-[1px] transition-all duration-300 bg-white/10 focus-within:bg-gradient-to-r focus-within:from-amber-500 focus-within:to-yellow-600 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <div className="relative flex items-center bg-[#0d0d0d]/90 rounded-[11px] w-full">
                  <Hash size={16} className="absolute left-4 text-amber-200/50 pointer-events-none z-10" />
                  <input id="ticket-title" name="title" type="text" value={form.title} onChange={handleChange} placeholder="e.g. Login page not loading on Chrome" required className="w-full bg-transparent border-none focus:ring-0 rounded-[11px] pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none transition-all duration-300 relative z-10" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="ticket-description" className="text-[11px] font-semibold text-amber-100/50 uppercase tracking-wider ml-1">Detailed Description</label>
              <div className="relative group rounded-xl p-[1px] transition-all duration-300 bg-white/10 focus-within:bg-gradient-to-r focus-within:from-amber-500 focus-within:to-yellow-600 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <div className="relative flex items-start bg-[#0d0d0d]/90 rounded-[11px] w-full pt-3.5">
                  <FileText size={16} className="absolute left-4 text-amber-200/50 pointer-events-none z-10 mt-1" />
                  <textarea id="ticket-description" name="description" value={form.description} onChange={handleChange} placeholder="Describe the issue in detail — what happened, when, and what you expected..." required rows={5} className="w-full bg-transparent border-none focus:ring-0 rounded-[11px] pl-11 pr-4 py-0 text-sm text-white placeholder-white/30 focus:outline-none transition-all duration-300 relative z-10 resize-none" />
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/15 rounded-xl p-3.5 flex items-center gap-3 relative z-10">
              <Sparkles size={14} className="text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-200/70 leading-relaxed">Our Gemini AI will automatically classify the priority and assign relevant tags to your ticket.</p>
            </div>

            <button id="submit-ticket-btn" type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:opacity-60 text-black font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all duration-300 mt-4 relative z-10">
              <Send size={18} />
              Submit Ticket
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm relative z-10">
            <span className="text-amber-100/60">Are you an agent? </span>
            <Link to="/login" className="text-amber-400 hover:text-white font-medium transition-colors">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
