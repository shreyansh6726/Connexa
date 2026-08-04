import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, ShieldAlert, Sparkles, User, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginProps {
  onNavigate: (path: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const user = await login(email, password);
      if (user.role === 'EMPLOYER') {
        onNavigate('/employer/dashboard');
      } else if (user.role === 'ADMIN') {
        onNavigate('/admin');
      } else {
        onNavigate('/employee/jobs');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, role: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
    setSubmitting(true);

    try {
      const user = await login(demoEmail, 'password123');
      if (user.role === 'EMPLOYER') {
        onNavigate('/employer/dashboard');
      } else if (user.role === 'ADMIN') {
        onNavigate('/admin');
      } else {
        onNavigate('/employee/jobs');
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="inline-flex p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 mb-3">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back to Connexa</h2>
          <p className="text-xs text-slate-500 mt-1">Sign in to access your AI-powered career dashboard</p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl">
          <p className="text-xs font-bold text-indigo-900 mb-2 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Quick One-Click Demo Sign In</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin('john.doe@email.com', 'EMPLOYEE')}
              className="p-2 bg-white hover:bg-indigo-100/50 border border-indigo-200 text-indigo-900 text-[11px] font-semibold rounded-xl text-left transition-colors"
            >
              <div className="font-bold flex items-center space-x-1">
                <User className="w-3 h-3 text-indigo-600" />
                <span>Candidate</span>
              </div>
              <span className="text-[10px] text-slate-500 block truncate">David Chen</span>
            </button>

            <button
              onClick={() => handleDemoLogin('employer1@techcorp.com', 'EMPLOYER')}
              className="p-2 bg-white hover:bg-indigo-100/50 border border-indigo-200 text-indigo-900 text-[11px] font-semibold rounded-xl text-left transition-colors"
            >
              <div className="font-bold flex items-center space-x-1">
                <UserCheck className="w-3 h-3 text-purple-600" />
                <span>HR Employer</span>
              </div>
              <span className="text-[10px] text-slate-500 block truncate">TechCorp Innovations</span>
            </button>

            <button
              onClick={() => handleDemoLogin('admin@connexa.com', 'ADMIN')}
              className="p-2 bg-white hover:bg-rose-100/50 border border-rose-200 text-rose-900 text-[11px] font-semibold rounded-xl text-left transition-colors"
            >
              <div className="font-bold flex items-center space-x-1">
                <ShieldAlert className="w-3 h-3 text-rose-600" />
                <span>Sys Admin</span>
              </div>
              <span className="text-[10px] text-slate-500 block truncate">Alex Rivera</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>{submitting ? 'Signing in...' : 'Sign In to Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <button
            onClick={() => onNavigate('/register')}
            className="font-bold text-indigo-600 hover:underline"
          >
            Register now
          </button>
        </p>
      </div>
    </div>
  );
};
