import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Loader2, Zap } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, clearError, isAuthenticated, isAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/agent', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      const user = await login(email, password);
      navigate(user.role === 'Admin' || user.isSuperAdmin ? '/admin' : '/agent', { replace: true });
    } catch {
      // error is set in context
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Effects */}
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
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Zap size={20} className="text-black" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-[#0a0a0a] animate-pulse" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              PulseTriage
            </span>
          </div>
          <p className="text-slate-400 text-sm">AI-powered helpdesk command center</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden">
          {/* Glass Glare */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent" />
          
          <div className="mb-8 relative z-10">
            <h1 className="text-2xl font-bold text-white drop-shadow-sm">Welcome back</h1>
            <p className="text-amber-100/60 text-sm mt-1.5">Sign in to your agent dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 animate-shake">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2 relative z-10">
              <label htmlFor="login-email" className="text-[11px] font-semibold text-amber-100/50 uppercase tracking-wider ml-1">
                Email
              </label>
              <div className="relative group rounded-xl p-[1px] transition-all duration-300 bg-white/10 focus-within:bg-gradient-to-r focus-within:from-amber-500 focus-within:to-yellow-600 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <div className="relative flex items-center bg-[#0d0d0d]/90 rounded-[11px] w-full">
                  <Mail size={16} className="absolute left-4 text-amber-200/50 pointer-events-none z-10" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="w-full bg-transparent border-none focus:ring-0 rounded-[11px] pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none transition-all duration-300 relative z-10"
                  />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 relative z-10">
              <label htmlFor="login-password" className="text-[11px] font-semibold text-amber-100/50 uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative group rounded-xl p-[1px] transition-all duration-300 bg-white/10 focus-within:bg-gradient-to-r focus-within:from-amber-500 focus-within:to-yellow-600 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <div className="relative flex items-center bg-[#0d0d0d]/90 rounded-[11px] w-full">
                  <Lock size={16} className="absolute left-4 text-amber-200/50 pointer-events-none z-10" />
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-transparent border-none focus:ring-0 rounded-[11px] pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none transition-all duration-300 relative z-10"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all duration-300 mt-4 relative z-10"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3 text-center text-sm relative z-10">
            <span className="text-amber-100/60">
              New agent?{' '}
              <Link
                to="/register"
                className="text-amber-400 hover:text-white font-medium transition-colors"
              >
                Request Access
              </Link>
            </span>
            <Link
              to="/submit"
              className="text-white/40 hover:text-white/70 text-xs transition-colors"
            >
              Submit a support ticket as a customer →
            </Link>
          </div>
        </div>

        {/* Version badge */}
        <p className="text-center text-[11px] text-slate-700 mt-6">
          PulseTriage v1.0 · Secured with JWT
        </p>
      </div>
    </div>
  );
}
