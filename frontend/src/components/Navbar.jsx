import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  GraduationCap,
  Shield,
  LogOut,
  Send,
  Database,
  Menu,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function Navbar({ currentView, setCurrentView }) {
  const { admin, isAuthenticated, logout } = useAuth();
  const [dbStatus, setDbStatus] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkDb() {
      try {
        const res = await api.getStatus();
        if (res && res.database) {
          setDbStatus(res.database);
        }
      } catch (e) {
        setDbStatus({ connected: false, provider: 'Connecting...' });
      }
    }
    checkDb();
    const interval = setInterval(checkDb, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => { setCurrentView('inquiry'); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-brand-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">EduSphere</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-indigo-100 text-indigo-700 rounded-md">CRM</span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Inquiry Management System</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {/* Database indicator pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/70 text-xs font-medium text-slate-600 mr-2" title={dbStatus?.provider || 'Database ready'}>
              <span className={`w-2 h-2 rounded-full ${dbStatus?.connected !== false ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>{dbStatus?.provider ? (dbStatus.provider.includes('Supabase') ? 'Supabase Postgres' : 'PostgreSQL Store') : 'Supabase Active'}</span>
            </div>

            <button
              onClick={() => setCurrentView('inquiry')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentView === 'inquiry'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Public Inquiry</span>
            </button>

            <button
              onClick={() => setCurrentView('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentView === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Dashboard</span>
              {isAuthenticated && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {/* Authenticated Admin Badge & Logout */}
            {isAuthenticated && admin && (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 ml-2">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 leading-none">{admin.name}</span>
                  <span className="text-[11px] text-slate-500 leading-tight">{admin.email}</span>
                </div>
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 px-4 pt-3 pb-5 space-y-3 shadow-xl animate-fade-in">
          {/* Database indicator in mobile */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 text-xs font-medium text-slate-600 border border-slate-200">
            <span className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Database Engine:</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {dbStatus?.provider ? (dbStatus.provider.includes('Supabase') ? 'Supabase DB' : 'PostgreSQL') : 'Active'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setCurrentView('inquiry'); setMobileMenuOpen(false); }}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-semibold transition-all ${
                currentView === 'inquiry'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Public Form</span>
            </button>

            <button
              onClick={() => { setCurrentView('admin'); setMobileMenuOpen(false); }}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-semibold transition-all ${
                currentView === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin CRM</span>
            </button>
          </div>

          {isAuthenticated && admin && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">{admin.name}</p>
                <p className="text-xs text-slate-500">{admin.email}</p>
              </div>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
