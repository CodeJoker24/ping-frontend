import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Shield, Zap, Users, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="max-w-6xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-600/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Ping</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/login')} 
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => navigate('/register')} 
            className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm shadow-indigo-600/20 transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col items-center justify-center">
        <div className="text-center max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/50 border border-slate-800 rounded-full text-xs font-medium text-emerald-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Real-time messaging platform
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.1]">
            Connect instantly with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-500">
              Ping.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-4 text-base md:text-lg text-slate-400 leading-relaxed max-w-xl mx-auto">
            Experience ultra-fast, low-latency messaging designed for communities and teams. Simple, secure, and intuitive.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button 
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 text-sm group"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-medium rounded-xl transition-all text-sm"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 w-full max-w-4xl">
          <div className="bg-slate-900/30 border border-slate-800/50 p-5 rounded-xl hover:border-slate-700 transition-colors group">
            <div className="bg-indigo-600/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm">Real-Time Sync</h3>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed">Instant delivery powered by WebSockets for seamless conversations.</p>
          </div>
          <div className="bg-slate-900/30 border border-slate-800/50 p-5 rounded-xl hover:border-slate-700 transition-colors group">
            <div className="bg-indigo-600/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm">Secure Accounts</h3>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed">Hashed credentials and authenticated sessions keep your data safe.</p>
          </div>
          <div className="bg-slate-900/30 border border-slate-800/50 p-5 rounded-xl hover:border-slate-700 transition-colors group">
            <div className="bg-indigo-600/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm">Group Channels</h3>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed">Create dedicated rooms or private threads with your teammates.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/30 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Ping. Built with React & Tailwind CSS.
      </footer>
    </div>
  );
}