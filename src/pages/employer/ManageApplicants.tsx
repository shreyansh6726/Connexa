import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, ChevronRight, Mail, Search, Sparkles, UserCheck, XCircle } from 'lucide-react';
import { AiMatchBadge } from '../../components/AiMatchBadge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Application, Job, User } from '../../types';

interface ManageApplicantsProps {
  onNavigate: (path: string) => void;
  initialJobId?: string;
}

export const ManageApplicants: React.FC<ManageApplicantsProps> = ({ onNavigate, initialJobId }) => {
  const { user } = useAuth();
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || 'ALL');
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<(Application & { applicantDetails: User | null })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedApp, setSelectedApp] = useState<(Application & { applicantDetails: User | null }) | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.getJobs({ postedBy: user?._id }),
        api.getEmployerApplications(selectedJobId !== 'ALL' ? selectedJobId : undefined),
      ]);

      setMyJobs(jobsRes.jobs);

      // Sort applicants by AI Match Score descending
      const sorted = appsRes.applications.sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0));
      setApplications(sorted);
    } catch (err) {
      console.error('Error fetching applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedJobId, user]);

  const handleUpdateStatus = async (appId: string, newStatus: Application['status']) => {
    try {
      await api.updateApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
      if (selectedApp && selectedApp._id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (err: any) {
      alert(err.message || 'Error updating status.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Applicant Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">Rank candidates by AI match score, inspect resumes, and manage hiring pipeline status.</p>
          </div>

          {/* Job Requisition Filter Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter Job:</span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            >
              <option value="ALL">All Requisitions ({myJobs.length})</option>
              {myJobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title} ({j.applicantCount || 0} candidates)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Applicants Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 font-medium">Loading applicant records...</div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center">
              <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">No Applicants Received Yet</h3>
              <p className="text-xs text-slate-500 mt-1">Share job openings or search candidates directly in the talent directory.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3">Candidate</th>
                    <th className="px-5 py-3">Target Requisition</th>
                    <th className="px-5 py-3">AI Fit Index</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">{app.applicantName}</div>
                        <div className="text-xs text-slate-500 font-medium">{app.applicantEmail}</div>
                        {app.applicantSkills && app.applicantSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {app.applicantSkills.slice(0, 3).map((s, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-md font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{app.jobTitle}</div>
                        <div className="text-[11px] text-slate-400">{app.companyName}</div>
                      </td>

                      <td className="px-5 py-4">
                        <AiMatchBadge score={app.aiMatchScore} size="sm" />
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app._id, e.target.value as Application['status'])}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border focus:outline-hidden ${
                            app.status === 'SHORTLISTED' || app.status === 'ACCEPTED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : app.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="REVIEWED">REVIEWED</option>
                          <option value="SHORTLISTED">SHORTLISTED</option>
                          <option value="ACCEPTED">ACCEPTED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
                        >
                          <span>Inspect Candidate</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Profile Inspector Modal */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 flex-shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{selectedApp.applicantName}</h3>
                <p className="text-xs text-indigo-600 font-semibold">{selectedApp.applicantEmail}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl p-1"
              >
                &times;
              </button>
            </div>

            <div className="overflow-y-auto py-5 space-y-4 flex-1 pr-1">
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-indigo-950 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>AI Match Score & Analysis</span>
                  </span>
                  <span className="px-2.5 py-0.5 bg-indigo-600 text-white font-extrabold text-xs rounded-full">
                    {selectedApp.aiMatchScore}% Match
                  </span>
                </div>
                <p className="text-xs text-indigo-900 leading-relaxed">{selectedApp.aiMatchAnalysis}</p>
              </div>

              {selectedApp.applicantDetails?.profile?.bio && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bio Summary</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{selectedApp.applicantDetails.profile.bio}</p>
                </div>
              )}

              {selectedApp.applicantDetails?.profile?.skills && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Skills & Expertise</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedApp.applicantDetails.profile.skills.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedApp.applicantDetails?.profile?.resumeText && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Resume Plain Text</h4>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 max-h-40 overflow-y-auto">
                    {selectedApp.applicantDetails.profile.resumeText}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
              <a
                href={`mailto:${selectedApp.applicantEmail}?subject=Interview%20Invitation%20for%20${encodeURIComponent(selectedApp.jobTitle || 'Role')}`}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Candidate</span>
              </a>

              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
