import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Shield,
  Lock,
  Mail,
  Loader2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function AdminLogin({ onLoginSuccess, onCancel }) {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both admin email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(email.trim(), password.trim());
      showToast('Admin authenticated successfully! Custom JWT token generated.', 'success');
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@edutech.com');
    setPassword('Admin@123');
    setError('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 animate-slide-up">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
        {/* Top Header Card */}
        <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 p-8 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 backdrop-blur-md mb-4 shadow-inner">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Admin Portal</h2>
          <p className="text-slate-400 text-xs mt-1">
            Sign in to view and manage all student and parent inquiries
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[11px] font-semibold text-indigo-300">
            <Lock className="w-3 h-3 text-indigo-400" />
            <span>Custom JWT Authentication</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="admin@edutech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-60 shadow-md shadow-indigo-600/25 transition-all text-sm cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying JWT Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to CRM</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Demo Credentials Autofill Pill */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Use Evaluator Demo Credentials (Admin@123)</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-2">
              Default account: <code className="font-bold text-slate-600">admin@edutech.com</code>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
