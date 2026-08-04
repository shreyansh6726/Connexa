import React, { useEffect, useState } from 'react';
import { Award, Briefcase, PlusCircle, Search, Sparkles, UserCheck, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Application, Job } from '../../types';

interface EmployerDashboardProps {
  onNavigate: (path: string) => void;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.getJobs({ postedBy: user._id, status: 'OPEN' }),
        api.getEmployerApplications(),
      ]);

      setMyJobs(jobsRes.jobs);
      setApplications(appsRes.applications);
    } catch (err) {
      console.error('Error fetching employer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const totalPosted = myJobs.length;
  const totalApplicants = applications.length;
  const shortlistedCount = applications.filter((a) => a.status === 'SHORTLISTED' || a.status === 'ACCEPTED').length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">HR & Employer Portal</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Managing hiring pipelines for <span className="font-bold text-slate-800">{user?.companyName || user?.name}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('/employee/jobs?tab=candidates')}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center space-x-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Search Talent</span>
            </button>
            <button
              onClick={() => onNavigate('/employer/post-job')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Job (AI Enhancer)</span>
            </button>
          </div>
        </div>

        {/* HR Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Posted Listings</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalPosted}</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Candidate Applications</p>
              <p className="text-2xl font-black text-purple-600 mt-1">{totalApplicants}</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shortlisted Candidates</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{shortlistedCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Posted Jobs Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Your Active Posted Roles</h3>
              <p className="text-xs text-slate-500">Overview of active requisitions and applicant volume</p>
            </div>
            <button
              onClick={() => onNavigate('/employer/applicants')}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors"
            >
              Review All Applicants ({totalApplicants})
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500 font-medium">Loading requisition list...</div>
          ) : myJobs.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">No Active Jobs Posted</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">Post your first position using Connexa's AI Job Description Enhancer.</p>
              <button
                onClick={() => onNavigate('/employer/post-job')}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-2xs hover:bg-indigo-700 transition-colors inline-flex items-center space-x-1"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Job Listing</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myJobs.map((job) => (
                <div key={job._id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{job.title}</h4>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md">
                        {job.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{job.location} • {job.jobType.replace('_', ' ')}</p>

                    <div className="mt-3 flex items-center space-x-2 text-xs font-semibold text-indigo-700">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{job.applicantCount || 0} candidate applications</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <button
                      onClick={() => onNavigate(`/employer/applicants?jobId=${job._id}`)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      View Applicants &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
