import React, { useState } from 'react';
import { ArrowLeft, Building, DollarSign, MapPin, Plus, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface PostJobProps {
  onNavigate: (path: string) => void;
}

export const PostJob: React.FC<PostJobProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState(user?.companyName || user?.name || '');
  const [location, setLocation] = useState('Remote (US)');
  const [jobType, setJobType] = useState('FULL_TIME');
  const [minSalary, setMinSalary] = useState('120000');
  const [maxSalary, setMaxSalary] = useState('160000');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<string[]>(['React', 'TypeScript', 'Node.js', 'REST API']);
  const [newReqInput, setNewReqInput] = useState('');

  const [enhancing, setEnhancing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // AI Enhancer Tool
  const handleEnhanceWithAi = async () => {
    if (!title || !description) {
      alert('Please enter at least a Job Title and a brief draft description to enable AI enhancement.');
      return;
    }

    setEnhancing(true);
    setMessage(null);

    try {
      const res = await api.enhanceJobWithAi({
        title,
        rawDescription: description,
        companyName,
      });

      setDescription(res.result.enhancedDescription);
      if (res.result.extractedRequirements && res.result.extractedRequirements.length > 0) {
        const merged = Array.from(new Set([...requirements, ...res.result.extractedRequirements]));
        setRequirements(merged);
      }
      setMessage('Job description enhanced with corporate structure and key skill tags auto-extracted!');
    } catch (err: any) {
      alert(err.message || 'Error enhancing job description with AI.');
    } finally {
      setEnhancing(false);
    }
  };

  const handleAddRequirement = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newReqInput.trim()) return;
    if (!requirements.includes(newReqInput.trim())) {
      setRequirements([...requirements, newReqInput.trim()]);
    }
    setNewReqInput('');
  };

  const handleRemoveRequirement = (reqToRemove: string) => {
    setRequirements(requirements.filter((r) => r !== reqToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await api.createJob({
        title,
        companyName,
        location,
        jobType: jobType as any,
        salaryRange: {
          min: Number(minSalary) || 100000,
          max: Number(maxSalary) || 150000,
          currency,
        },
        description,
        requirements,
        keywords: requirements.map((r) => r.toLowerCase()),
      });

      onNavigate('/employer/dashboard');
    } catch (err: any) {
      alert(err.message || 'Error posting job.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('/employer/dashboard')}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Post a New Position</h1>
            <p className="text-xs text-slate-500">Create a requisition and polish it using AI description tools.</p>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Opening Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company / Entity Name</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location / Workstyle</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="REMOTE">Remote</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Salary Range (Annual)</label>
            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="number"
                  placeholder="Min (120000)"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="number"
                  placeholder="Max (160000)"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
          </div>

          {/* Description & AI Enhancer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Full Job Description</label>

              <button
                type="button"
                onClick={handleEnhanceWithAi}
                disabled={enhancing}
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 flex items-center space-x-1.5 transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                <span>{enhancing ? 'Polishing Text...' : 'Enhance with AI'}</span>
              </button>
            </div>

            <textarea
              rows={8}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste or write your initial job description draft here. Click 'Enhance with AI' to automatically polish format and extract skill tags."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
            />
          </div>

          {/* Required Skills Tag Manager */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">Required Skills & Key Competencies</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newReqInput}
                onChange={(e) => setNewReqInput(e.target.value)}
                placeholder="Add skill requirement (e.g. React, Docker, Python)..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={() => handleAddRequirement()}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tag</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {requirements.map((req, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold rounded-xl flex items-center space-x-1.5"
                >
                  <span>{req}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(req)}
                    className="text-indigo-400 hover:text-rose-600 font-bold"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => onNavigate('/employer/dashboard')}
              className="px-5 py-2.5 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              {submitting ? 'Publishing Requisition...' : 'Publish Job Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
