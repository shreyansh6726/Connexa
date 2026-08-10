import React, { useState } from 'react';
import { Building2, DollarSign, MapPin, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Job } from '../types';
import { AiMatchBadge } from './AiMatchBadge';

interface JobCardProps {
  job: Job;
  hasApplied?: boolean;
  onApplySuccess?: () => void;
  onViewDetails?: (job: Job) => void;
  userSkills?: string[];
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  hasApplied = false,
  onApplySuccess,
  onViewDetails,
  userSkills = [],
}) => {
  const { user } = useAuth();
  const [applying, setApplying] = useState<boolean>(false);
  const [appliedState, setAppliedState] = useState<boolean>(hasApplied);
  const [matchScore, setMatchScore] = useState<number>(78);

  // Instant apply action
  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      setApplying(true);
      await api.applyJob(job._id);
      setAppliedState(true);
      if (onApplySuccess) onApplySuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to submit application.');
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
      onClick={() => onViewDetails && onViewDetails(job)}
      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              {job.companyName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors leading-snug">
                {job.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium flex items-center space-x-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.companyName}</span>
              </p>
            </div>
          </div>

          {/* AI Match Badge for Employee */}
          {user?.role === 'EMPLOYEE' && (
            <div onClick={(e) => e.stopPropagation()}>
              <AiMatchBadge score={matchScore} size="sm" />
            </div>
          )}
        </div>

        {/* Location & Salary Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-medium text-slate-600">
          <span className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.location}</span>
          </span>

          <span className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {formatSalary(job.salaryRange?.min)} - {formatSalary(job.salaryRange?.max)} {job.salaryRange?.currency}
            </span>
          </span>

          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-lg">
            {job.jobType.replace('_', ' ')}
          </span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Requirements / Skill Tags */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {(job.requirements || []).slice(0, 5).map((req, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded-md font-medium border border-slate-200/60"
            >
              {req}
            </span>
          ))}
          {(job.requirements || []).length > 5 && (
            <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[11px] rounded-md">
              +{(job.requirements || []).length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Footer / Apply action */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>{job.applicantCount || 0} applicants</span>

        {user?.role === 'EMPLOYEE' && (
          <button
            onClick={handleApply}
            disabled={appliedState || applying}
            className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 transition-all ${
              appliedState
                ? 'bg-emerald-100 text-emerald-800 cursor-default'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs hover:shadow-xs'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{appliedState ? 'Applied' : applying ? 'Submitting...' : 'Apply Now'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
