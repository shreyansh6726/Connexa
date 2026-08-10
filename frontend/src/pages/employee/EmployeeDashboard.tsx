import React, { useEffect, useState } from 'react';
import { ArrowRight, Award, Briefcase, CheckCircle2, Clock, Search, Sparkles, UserCheck, XCircle } from 'lucide-react';
import { AiMatchBadge } from '../../components/AiMatchBadge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Application } from '../../types';

interface EmployeeDashboardProps {
  onNavigate: (path: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.getEmployeeApplications();
      setApplications(res.applications);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const totalSubmitted = applications.length;
  const shortlistedCount = applications.filter((a) => a.status === 'SHORTLISTED' || a.status === 'ACCEPTED').length;
  const avgMatchScore =
    applications.length > 0
      ? Math.round(applications.reduce((acc, curr) => acc + (curr.aiMatchScore || 75), 0) / applications.length)
      : 0;

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'ACCEPTED':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center space-x-1"><CheckCircle2 className="w-3.5 h-3.5" /><span>Accepted</span></span>;
      case 'SHORTLISTED':
        return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-lg flex items-center space-x-1"><Award className="w-3.5 h-3.5" /><span>Shortlisted</span></span>;
      case 'REVIEWED':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg flex items-center space-x-1"><UserCheck className="w-3.5 h-3.5" /><span>Reviewed</span></span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-lg flex items-center space-x-1"><XCircle className="w-3.5 h-3.5" /><span>Not Selected</span></span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /><span>Pending Review</span></span>;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Candidate Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">Welcome back, {user?.name}. Monitor your active applications and AI fit metrics.</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('/employee/profile')}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors"
            >
              Update AI Resume & Skills
            </button>
            <button
              onClick={() => onNavigate('/employee/jobs')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center space-x-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Jobs</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted Applications</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalSubmitted}</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shortlisted Roles</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{shortlistedCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average AI Match Score</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">{avgMatchScore}%</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Application History Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Application History</h3>
              <p className="text-xs text-slate-500">Real-time status updates from hiring managers</p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 font-medium">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">No Applications Submitted Yet</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">Start applying to open engineering and AI roles on Connexa.</p>
              <button
                onClick={() => onNavigate('/employee/jobs')}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-2xs hover:bg-indigo-700 transition-colors inline-flex items-center space-x-1"
              >
                <span>Browse Open Positions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3">Job Title & Company</th>
                    <th className="px-5 py-3">AI Fit Index</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Applied Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">{app.jobTitle}</div>
                        <div className="text-xs text-slate-500 font-medium">{app.companyName}</div>
                      </td>
                      <td className="px-5 py-4">
                        <AiMatchBadge score={app.aiMatchScore} size="sm" />
                      </td>
                      <td className="px-5 py-4">{getStatusBadge(app.status)}</td>
                      <td className="px-5 py-4 text-slate-500">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
