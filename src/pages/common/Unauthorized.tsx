import React from 'react';
import { ShieldX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UnauthorizedProps {
  onNavigate: (path: string) => void;
}

export const Unauthorized: React.FC<UnauthorizedProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const handleReturn = () => {
    if (user?.role === 'EMPLOYER') onNavigate('/employer/dashboard');
    else if (user?.role === 'ADMIN') onNavigate('/admin');
    else onNavigate('/employee/jobs');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <ShieldX className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">403 - Access Restricted</h2>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          You do not have permission to view this section. Your account role ({user?.role || 'Guest'}) does not grant authorization.
        </p>
        <button
          onClick={handleReturn}
          className="mt-6 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};
