import React, { useEffect, useState } from 'react';
import { Award, Briefcase, CheckCircle2, ShieldAlert, Sparkles, UserCheck, Users } from 'lucide-react';
import { AiMatchBadge } from '../../components/AiMatchBadge';
import { api } from '../../services/api';
import { Application, Job, User } from '../../types';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<{
    totalUsers: number;
    employees: number;
    employers: number;
    admins: number;
    totalJobs: number;
    openJobs: number;
    totalApplications: number;
  } | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'users'>('jobs');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, jobsRes, usersRes, appsRes] = await Promise.all([
        api.getAdminStats(),
        api.getJobs({ status: 'OPEN' }),
        api.getAdminUsers(),
        api.getEmployerApplications(),
      ]);

      setStats(statsRes);
      setJobs(jobsRes.jobs);
      setUsersList(usersRes.users);
      setApplications(appsRes.applications);
    } catch (err) {
      console.error('Error loading admin panel:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-6 h-6 text-rose-600" />
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin & System Operations</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Global platform metrics, employer job verification, and application feeds.</p>
          </div>
        </div>

        {/* Global System Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Platform Users</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalUsers || 0}</p>
            <span className="text-[10px] text-slate-500 font-medium">
              {stats?.employees || 0} candidates • {stats?.employers || 0} employers
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Job Postings</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">{stats?.openJobs || 0}</p>
            <span className="text-[10px] text-slate-500 font-medium">Across all employers</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Global Applications</p>
            <p className="text-2xl font-black text-purple-600 mt-1">{stats?.totalApplications || 0}</p>
            <span className="text-[10px] text-slate-500 font-medium">Submitted applications</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Health</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">100% Operational</p>
            <span className="text-[10px] text-emerald-700 font-medium">AI Service Connected</span>
          </div>
        </div>

        {/* Tab Controls & Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                activeTab === 'jobs' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Global Job Requisitions ({jobs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                activeTab === 'applications' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Application Activity Stream</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                activeTab === 'users' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Accounts Directory ({usersList.length})</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 font-medium">Loading admin data...</div>
          ) : activeTab === 'jobs' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3">Position Title</th>
                    <th className="px-5 py-3">Company & Employer</th>
                    <th className="px-5 py-3">Type & Location</th>
                    <th className="px-5 py-3">Applicants</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map((job) => (
                    <tr key={job._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900">{job.title}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{job.companyName}</div>
                        <div className="text-[11px] text-slate-400">{job.postedBy.email}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {job.location} • <span className="font-semibold text-indigo-600">{job.jobType}</span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800">{job.applicantCount || 0}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md">
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'applications' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3">Candidate</th>
                    <th className="px-5 py-3">Target Requisition</th>
                    <th className="px-5 py-3">AI Fit Score</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900">{app.applicantName}</td>
                      <td className="px-5 py-4 text-slate-800">{app.jobTitle} ({app.companyName})</td>
                      <td className="px-5 py-4">
                        <AiMatchBadge score={app.aiMatchScore} size="sm" />
                      </td>
                      <td className="px-5 py-4 font-bold text-indigo-700">{app.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3">User Name</th>
                    <th className="px-5 py-3">Email Address</th>
                    <th className="px-5 py-3">Assigned Role</th>
                    <th className="px-5 py-3">Company / Headline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900">{u.name}</td>
                      <td className="px-5 py-4 text-slate-600">{u.email}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            u.role === 'ADMIN'
                              ? 'bg-rose-100 text-rose-800'
                              : u.role === 'EMPLOYER'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 truncate max-w-xs">
                        {u.companyName || u.profile?.headline || 'Standard Profile'}
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
