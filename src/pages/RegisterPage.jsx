import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, AtSign, AlertCircle, CheckCircle2, Loader2, Zap, Eye, EyeOff } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const pwRules = [
  { label: 'Min 8 characters', test: (v) => v.length >= 8 },
  { label: '1 letter', test: (v) => /[a-zA-Z]/.test(v) },
  { label: '1 number', test: (v) => /[0-9]/.test(v) },
  { label: '1 special char', test: (v) => /[!@#$%^&*]/.test(v) },
];

export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuth();
  const [form, setForm] = useState({ username: '', name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    clearError();
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const msg = await register(form);
      setSuccess(msg);
    } catch { /* error shown from context */ }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-10 text-center shadow-2xl relative z-10">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Registration Submitted!</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">{success}</p>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-amber-300/80 leading-relaxed">
              🕒 An administrator will review your request. You will be able to log in once approved.
            </p>
          </div>
          <Link to="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all duration-200">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">PulseTriage</span>
          </div>
          <p className="text-slate-400 text-sm">Request agent access to the helpdesk</p>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-slate-100 mb-1">Create Account</h1>
          <p className="text-slate-400 text-sm mb-6">Admin will approve your access after review</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3.5">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="reg-name" className="text-xs font-medium text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input id="reg-name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" required className="w-full bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 focus:border-indigo-500/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
              </div>
            </div>
            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="reg-username" className="text-xs font-medium text-slate-400 uppercase tracking-wider">Username</label>
              <div className="relative">
                <AtSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input id="reg-username" name="username" type="text" value={form.username} onChange={handleChange} placeholder="john_agent" required className="w-full bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 focus:border-indigo-500/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
              </div>
            </div>
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required className="w-full bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 focus:border-indigo-500/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
              </div>
            </div>
            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input id="reg-password" name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="••••••••" required className="w-full bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 focus:border-indigo-500/80 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {pwRules.map((r) => (
                    <div key={r.label} className={`flex items-center gap-1.5 text-[10px] ${r.test(form.password) ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${r.test(form.password) ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      {r.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button id="register-submit-btn" type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all mt-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              {loading ? 'Submitting…' : 'Request Access'}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-slate-800/60 text-center text-sm">
            <span className="text-slate-500">Already have access? </span>
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
