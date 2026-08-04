import React, { useEffect, useState } from 'react';
import { Building2, Check, CheckCircle2, DollarSign, MapPin, Send, Sparkles, X, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AiMatchResult, Job } from '../../types';

interface JobDetailsProps {
  job: Job;
  hasApplied?: boolean;
  onClose: () => void;
  onApplySuccess?: () => void;
}

export const JobDetails: React.FC<JobDetailsProps> = ({
  job,
  hasApplied = false,
  onClose,
  onApplySuccess,
}) => {
  const { user } = useAuth();
  const [applied, setApplied] = useState(hasApplied);
  const [applying, setApplying] = useState(false);
  const [aiResult, setAiResult] = useState<AiMatchResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const fetchAiMatch = async () => {
      if (!user || user.role !== 'EMPLOYEE') return;
      setLoadingAi(true);
      try {
        const res = await api.calculateAiMatch({ jobId: job._id });
        setAiResult(res.result);
      } catch (err) {
        console.error('Failed to calculate AI match:', err);
      } finally {
        setLoadingAi(false);
      }
    };

    fetchAiMatch();
  }, [job._id, user]);

  const handleApply = async () => {
    if (!user) return;
    try {
      setApplying(true);
      await api.applyJob(job._id);
      setApplied(true);
      if (onApplySuccess) onApplySuccess();
    } catch (err: any) {
      alert(err.message || 'Error submitting application.');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (val?: number) => {
    if (!val) return 'Negotiable';
    return `$${(val / 1000).toFixed(0)}k`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center text-2xl shadow-md shadow-indigo-200 flex-shrink-0">
              {job.companyName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{job.title}</h2>
              <p className="text-xs text-slate-600 font-medium flex items-center space-x-1.5 mt-1">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{job.companyName}</span>
                <span>•</span>
                <span className="text-indigo-600 font-semibold">{job.jobType.replace('_', ' ')}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-5 space-y-6 flex-1 pr-1">
          {/* Key Facts Pills */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>{job.location}</span>
            </span>

            <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>
                {formatSalary(job.salaryRange?.min)} - {formatSalary(job.salaryRange?.max)} {job.salaryRange?.currency}
              </span>
            </span>
          </div>

          {/* AI Match Box for Candidate */}
          {user?.role === 'EMPLOYEE' && (
            <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-xs text-indigo-950">AI Candidate Resume Match</span>
                </div>
                {aiResult && (
                  <span className="px-3 py-1 bg-indigo-600 text-white font-extrabold text-xs rounded-full shadow-2xs">
                    {aiResult.matchScore}% Synergy Score
                  </span>
                )}
              </div>

              {loadingAi ? (
                <p className="text-xs text-slate-500 font-medium">Analyzing profile skill overlap...</p>
              ) : aiResult ? (
                <div className="space-y-2 text-xs">
                  <p className="text-indigo-900 leading-relaxed">{aiResult.analysis}</p>

                  {aiResult.matchingSkills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-bold text-emerald-800 flex items-center space-x-1 mr-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Matched Skills:</span>
                      </span>
                      {aiResult.matchingSkills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded-md text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {aiResult.missingSkills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-amber-800 flex items-center space-x-1 mr-1">
                        <XCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Gap / Unmentioned:</span>
                      </span>
                      {aiResult.missingSkills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-800 font-semibold rounded-md text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Job Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Job Description</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Required Skills */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Key Required Competencies
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.requirements.map((req, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium text-xs rounded-xl"
          >
            Close Window
          </button>

          {user?.role === 'EMPLOYEE' && (
            <button
              onClick={handleApply}
              disabled={applied || applying}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs flex items-center space-x-2 transition-all ${
                applied
                  ? 'bg-emerald-100 text-emerald-800 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md'
              }`}
            >
              {applied ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              <span>{applied ? 'Application Submitted' : applying ? 'Submitting...' : 'One-Click Apply Now'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
