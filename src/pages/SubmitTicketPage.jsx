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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="w-full max-w-lg relative z-10">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
                <CheckCircle2 size={24} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Ticket Submitted!</h2>
                <p className="text-slate-400 text-xs">Your ticket has been triaged by AI</p>
              </div>
            </div>

            {/* AI Classification Result */}
            <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-purple-400" />
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Gemini AI Classification</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${pClass}`}>
                  {result.aiClassification?.priority} Priority
                </span>
                {result.aiClassification?.tags?.map((tag) => (
                  <span key={tag} className="text-xs text-slate-400 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Ticket Info */}
            <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Ticket ID</span>
                <span className="text-slate-300 font-mono">{result.ticket?._id?.slice(-10)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Status</span>
                <span className="text-emerald-400 font-medium">{result.ticket?.status}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Title</span>
                <span className="text-slate-300 max-w-[60%] text-right">{result.ticket?.title}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-6 text-center">
              An agent will review your ticket shortly. Keep your Customer ID for reference.
            </p>

            <button
              onClick={() => { setResult(null); setForm({ title: '', description: '', customerId: '' }); }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl transition-all duration-200"
            >
              <Ticket size={15} />
              Submit Another Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/6 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">PulseTriage</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
            <Sparkles size={13} className="text-purple-400" />
            <span>AI-powered ticket triage — your request will be classified automatically</span>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Ticket size={18} className="text-indigo-400" />
            <div>
              <h1 className="text-lg font-bold text-slate-100">Submit a Support Ticket</h1>
              <p className="text-slate-400 text-xs">Describe your issue and our AI will prioritize and route it</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3.5">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="ticket-customerid" className="text-xs font-medium text-slate-400 uppercase tracking-wider">Your Customer ID / Email</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input id="ticket-customerid" name="customerId" type="text" value={form.customerId} onChange={handleChange} placeholder="customer@email.com or your-id" required className="w-full bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 focus:border-indigo-500/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ticket-title" className="text-xs font-medium text-slate-400 uppercase tracking-wider">Issue Title</label>
              <div className="relative">
                <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input id="ticket-title" name="title" type="text" value={form.title} onChange={handleChange} placeholder="e.g. Login page not loading on Chrome" required className="w-full bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 focus:border-indigo-500/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ticket-description" className="text-xs font-medium text-slate-400 uppercase tracking-wider">Detailed Description</label>
              <div className="relative">
                <FileText size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                <textarea id="ticket-description" name="description" value={form.description} onChange={handleChange} placeholder="Describe the issue in detail — what happened, when, and what you expected..." required rows={5} className="w-full bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 focus:border-indigo-500/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none" />
              </div>
            </div>

            <div className="bg-purple-950/20 border border-purple-500/15 rounded-xl p-3 flex items-center gap-2.5">
              <Sparkles size={13} className="text-purple-400 flex-shrink-0" />
              <p className="text-xs text-purple-300/80">Our Gemini AI will automatically classify the priority and assign relevant tags to your ticket.</p>
            </div>

            <button id="submit-ticket-btn" type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? 'Submitting & Triaging…' : 'Submit Ticket'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/60 text-center text-sm">
            <span className="text-slate-500">Are you an agent? </span>
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
