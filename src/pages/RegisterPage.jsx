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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[400px] bg-amber-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.1),transparent)]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>
        <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-10 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative z-10 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent" />
          
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-5 relative z-10">
            <CheckCircle2 size={28} className="text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 relative z-10 drop-shadow-sm">Registration Submitted!</h2>
          <p className="text-amber-100/60 text-sm leading-relaxed mb-6 relative z-10">{success}</p>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 text-left relative z-10">
            <p className="text-xs text-amber-300/80 leading-relaxed">
              🕒 An administrator will review your request. You will be able to log in once approved.
            </p>
          </div>
          <Link to="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold px-6 py-2.5 rounded-xl text-sm transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] relative z-10">
            Back to Login
          </Link>
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

      <div className="w-full max-w-md relative z-10">
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
          <p className="text-amber-100/60 text-sm">Request agent access to the helpdesk</p>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent" />
          <div className="mb-8 relative z-10">
            <h1 className="text-2xl font-bold text-white drop-shadow-sm">Create Account</h1>
            <p className="text-amber-100/60 text-sm mt-1.5">Admin will approve your access after review</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3.5">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="reg-name" className="text-[11px] font-semibold text-amber-100/50 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative group rounded-xl p-[1px] transition-all duration-300 bg-white/10 focus-within:bg-gradient-to-r focus-within:from-amber-500 focus-within:to-yellow-600 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <div className="relative flex items-center bg-[#0d0d0d]/90 rounded-[11px] w-full">
                  <User size={16} className="absolute left-4 text-amber-200/50 pointer-events-none z-10" />
                  <input id="reg-name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" required className="w-full bg-transparent border-none focus:ring-0 rounded-[11px] pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none transition-all duration-300 relative z-10" />
                </div>
              </div>
            </div>
            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="reg-username" className="text-[11px] font-semibold text-amber-100/50 uppercase tracking-wider ml-1">Username</label>
              <div className="relative group rounded-xl p-[1px] transition-all duration-300 bg-white/10 focus-within:bg-gradient-to-r focus-within:from-amber-500 focus-within:to-yellow-600 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <div className="relative flex items-center bg-[#0d0d0d]/90 rounded-[11px] w-full">
                  <AtSign size={16} className="absolute left-4 text-amber-200/50 pointer-events-none z-10" />
                  <input id="reg-username" name="username" type="text" value={form.username} onChange={handleChange} placeholder="john_agent" required className="w-full bg-transparent border-none focus:ring-0 rounded-[11px] pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none transition-all duration-300 relative z-10" />
                </div>
              </div>
            </div>
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="reg-email" className="text-[11px] font-semibold text-amber-100/50 uppercase tracking-wider ml-1">Email</label>
              <div className="relative group rounded-xl p-[1px] transition-all duration-300 bg-white/10 focus-within:bg-gradient-to-r focus-within:from-amber-500 focus-within:to-yellow-600 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <div className="relative flex items-center bg-[#0d0d0d]/90 rounded-[11px] w-full">
                  <Mail size={16} className="absolute left-4 text-amber-200/50 pointer-events-none z-10" />
                  <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required className="w-full bg-transparent border-none focus:ring-0 rounded-[11px] pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none transition-all duration-300 relative z-10" />
                </div>
              </div>
            </div>
            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="reg-password" className="text-[11px] font-semibold text-amber-100/50 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group rounded-xl p-[1px] transition-all duration-300 bg-white/10 focus-within:bg-gradient-to-r focus-within:from-amber-500 focus-within:to-yellow-600 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <div className="relative flex items-center bg-[#0d0d0d]/90 rounded-[11px] w-full">
                  <Lock size={16} className="absolute left-4 text-amber-200/50 pointer-events-none z-10" />
                  <input id="reg-password" name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="••••••••" required className="w-full bg-transparent border-none focus:ring-0 rounded-[11px] pl-11 pr-11 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none transition-all duration-300 relative z-10" />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 text-amber-200/50 hover:text-white transition-colors z-20">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {form.password.length > 0 && (
                <div className="space-y-1.5 mt-2 bg-white/[0.01] border border-white/[0.05] rounded-xl p-3">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
                    <span className="text-amber-100/50">Password Strength</span>
                    <span className={`font-bold ${
                      pwRules.filter(r => r.test(form.password)).length === 4 ? 'text-amber-400' :
                      pwRules.filter(r => r.test(form.password)).length >= 2 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {
                        pwRules.filter(r => r.test(form.password)).length === 4 ? 'Strong' :
                        pwRules.filter(r => r.test(form.password)).length === 3 ? 'Medium' :
                        pwRules.filter(r => r.test(form.password)).length === 2 ? 'Fair' : 'Weak'
                      }
                    </span>
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        pwRules.filter(r => r.test(form.password)).length === 4 ? 'w-full bg-gradient-to-r from-amber-500 to-yellow-600' :
                        pwRules.filter(r => r.test(form.password)).length === 3 ? 'w-3/4 bg-yellow-500' :
                        pwRules.filter(r => r.test(form.password)).length === 2 ? 'w-1/2 bg-yellow-600' :
                        pwRules.filter(r => r.test(form.password)).length === 1 ? 'w-1/4 bg-red-500' : 'w-0'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 border-t border-white/[0.04] pt-2">
                    {pwRules.map((r) => (
                      <div key={r.label} className={`flex items-center gap-1.5 text-[9px] ${r.test(form.password) ? 'text-amber-400/80' : 'text-amber-100/30'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${r.test(form.password) ? 'bg-amber-400' : 'bg-white/20'}`} />
                        {r.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button id="register-submit-btn" type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:opacity-60 text-black font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all duration-300 mt-4 relative z-10">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              {loading ? 'Submitting…' : 'Request Access'}
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm relative z-10">
            <span className="text-amber-100/60">Already have access? </span>
            <Link to="/login" className="text-amber-400 hover:text-white font-medium transition-colors">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
