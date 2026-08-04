import React, { useState } from 'react';
import { ArrowRight, Building, Lock, Mail, Sparkles, User, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RegisterProps {
  onNavigate: (path: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'EMPLOYEE' | 'EMPLOYER'>('EMPLOYEE');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const newUser = await register({
        name,
        email,
        password,
        role,
        companyName: role === 'EMPLOYER' ? companyName : undefined,
      });

      if (newUser.role === 'EMPLOYER') {
        onNavigate('/employer/dashboard');
      } else {
        onNavigate('/employee/jobs');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create your Connexa Account</h2>
          <p className="text-xs text-slate-500 mt-1">Join the next-generation AI professional network</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Select Account Role</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setRole('EMPLOYEE')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  role === 'EMPLOYEE'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Job Candidate</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('EMPLOYER')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  role === 'EMPLOYER'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Employer / HR</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Smith"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {role === 'EMPLOYER' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization Name</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. TechCorp Innovations"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Work or Personal Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>{submitting ? 'Creating account...' : 'Create Connexa Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <button
            onClick={() => onNavigate('/login')}
            className="font-bold text-indigo-600 hover:underline"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};
