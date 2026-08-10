import React, { useEffect, useState } from 'react';
import { Briefcase, Filter, MapPin, RefreshCw, Search, Sparkles, UserCheck, Users } from 'lucide-react';
import { CandidateCard } from '../../components/CandidateCard';
import { JobCard } from '../../components/JobCard';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Job, User } from '../../types';
import { JobDetails } from './JobDetails';

interface SearchJobsProps {
  onNavigate: (path: string) => void;
  initialTab?: 'jobs' | 'candidates';
}

export const SearchJobs: React.FC<SearchJobsProps> = ({ onNavigate, initialTab = 'jobs' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates'>(initialTab);

  // Job Search Filters
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('ALL');

  // Candidate Search Filter
  const [candidateSearch, setCandidateSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  // Results
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<User[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.getJobs({
        keyword: keyword || undefined,
        location: location || undefined,
        jobType: jobType !== 'ALL' ? jobType : undefined,
      });
      setJobs(res.jobs);

      // Fetch user's applied jobs if candidate
      if (user?.role === 'EMPLOYEE') {
        const appRes = await api.getEmployeeApplications();
        const appliedSet = new Set<string>();
        appRes.applications.forEach((a) => {
          if (a.jobId) appliedSet.add(a.jobId);
        });
        setAppliedJobIds(appliedSet);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await api.getCandidates({
        keyword: candidateSearch || undefined,
        skill: skillFilter || undefined,
      });
      setCandidates(res.candidates);
    } catch (err) {
      console.error('Error searching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'jobs') {
      fetchJobs();
    } else {
      fetchCandidates();
    }
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'jobs') fetchJobs();
    else fetchCandidates();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-semibold text-indigo-300 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI-Powered Talent Matching Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Discover High-Impact Career Opportunities & Talent
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Matching candidates to job requirements using vector skill analysis, AI resume scoring, and real-time employer alerts.
            </p>
          </div>
        </div>

        {/* Tab Selector & Search Form */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                activeTab === 'jobs'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Explore Open Jobs</span>
            </button>

            <button
              onClick={() => setActiveTab('candidates')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                activeTab === 'candidates'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Candidate Directory</span>
            </button>
          </div>

          {/* Search Inputs */}
          <form onSubmit={handleSearchSubmit}>
            {activeTab === 'jobs' ? (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search by job title, skill (React, Python), or company..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-3 relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location (Remote, SF, NY)..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
                  >
                    <option value="ALL">All Job Types</option>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="REMOTE">Remote</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center space-x-1"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter Jobs</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                    placeholder="Search candidate name, headline, or bio keywords..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-4 relative">
                  <Sparkles className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    placeholder="Filter by specific skill (e.g. PyTorch, React)..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center space-x-1"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Find Talent</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500">Querying Connexa database...</p>
          </div>
        ) : activeTab === 'jobs' ? (
          jobs.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">No Matching Jobs Found</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search keywords or location filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((j) => (
                <JobCard
                  key={j._id}
                  job={j}
                  hasApplied={appliedJobIds.has(j._id)}
                  onViewDetails={(jobToView) => setSelectedJob(jobToView)}
                  onApplySuccess={fetchJobs}
                  userSkills={user?.profile?.skills}
                />
              ))}
            </div>
          )
        ) : candidates.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No Candidate Profiles Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try searching for other tech keywords or skills.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((c) => (
              <CandidateCard key={c._id} candidate={c} />
            ))}
          </div>
        )}
      </div>

      {/* Selected Job Details Modal */}
      {selectedJob && (
        <JobDetails
          job={selectedJob}
          hasApplied={appliedJobIds.has(selectedJob._id)}
          onClose={() => setSelectedJob(null)}
          onApplySuccess={() => {
            fetchJobs();
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
};
