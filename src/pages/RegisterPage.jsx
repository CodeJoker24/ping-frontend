import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, User, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/register', formData);
      
      // Save token and user info
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Pop success toast notification
      toast.success('Account created successfully! Please sign in.', {
        style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }
      });

      // Redirect user to Login page
      navigate('/login');
    } catch (err) {
      console.error('Registration failed:', err);
      const msg = err.response?.data?.message || 'Failed to create account.';
      setError(msg);
      toast.error(msg, {
        style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Ping</span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-white">Create your account</h2>
          <p className="text-slate-400 text-sm mt-1.5">Join Ping and start chatting in real time</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/30 p-7 rounded-2xl shadow-2xl shadow-black/20">
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative group">
                <User className="w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className="w-full bg-slate-800/60 border border-slate-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full bg-slate-800/60 border border-slate-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/60 border border-slate-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl py-2.5 pl-10 pr-12 text-sm text-slate-100 placeholder-slate-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-700/30"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-700/30 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors hover:underline underline-offset-2">
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-indigo-400/50" />
            <p className="text-[10px] text-slate-500">Secure & encrypted connection</p>
            <Sparkles className="w-3 h-3 text-indigo-400/50" />
          </div>
        </div>
      </div>
    </div>
  );
}