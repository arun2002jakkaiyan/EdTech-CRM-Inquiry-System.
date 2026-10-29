import React, { useState } from 'react';
import Navbar from './components/Navbar';
import InquiryForm from './components/InquiryForm';
import AdminDashboard from './components/AdminDashboard';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  GraduationCap,
  ShieldCheck,
  Database,
  Lock,
  Heart,
  Github,
  CheckCircle2,
  Cpu
} from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState('inquiry'); // 'inquiry' or 'admin'
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'inquiry' ? (
          <InquiryForm onNavigateToAdmin={() => setCurrentView('admin')} />
        ) : (
          <AdminDashboard onNavigateToInquiry={() => setCurrentView('inquiry')} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">EduSphere CRM</span>
            <span>&copy; 2026 Full-Stack Assessment Task</span>
          </div>

          {/* Tech Stack Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">
              <Cpu className="w-3 h-3 text-indigo-500" />
              <span>React + Vite + Tailwind</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">
              <Lock className="w-3 h-3 text-emerald-500" />
              <span>Custom JWT Auth (Scratch)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">
              <Database className="w-3 h-3 text-blue-500" />
              <span>Supabase PostgreSQL</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView(currentView === 'inquiry' ? 'admin' : 'inquiry')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Switch to {currentView === 'inquiry' ? 'Admin CRM' : 'Public Inquiry Form'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
