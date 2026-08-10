import React, { useState } from 'react';
import { Briefcase, FileText, Github, Linkedin, MapPin, Plus, Save, Sparkles, Trash2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Experience } from '../../types';

interface ProfileBuilderProps {
  onNavigate: (path: string) => void;
}

export const ProfileBuilder: React.FC<ProfileBuilderProps> = ({ onNavigate }) => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.profile?.headline || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [skills, setSkills] = useState<string[]>(user?.profile?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [resumeText, setResumeText] = useState(user?.profile?.resumeText || '');

  // Contact Details
  const [phone, setPhone] = useState(user?.contactDetails?.phone || '');
  const [location, setLocation] = useState(user?.contactDetails?.location || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.contactDetails?.linkedinUrl || '');
  const [githubUrl, setGithubUrl] = useState(user?.contactDetails?.githubUrl || '');
  const [website, setWebsite] = useState(user?.contactDetails?.website || '');

  // Experience Entries
  const [experience, setExperience] = useState<Experience[]>(user?.profile?.experience || []);

  // AI Generator state
  const [generatingBio, setGeneratingBio] = useState(false);
  const [targetRole, setTargetRole] = useState(user?.profile?.headline || 'Full Stack Engineer');
  const [yearsExp, setYearsExp] = useState('5');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // AI Generator
  const handleGenerateAiBio = async () => {
    setGeneratingBio(true);
    setMessage(null);
    try {
      const res = await api.generateAiBio({
        name,
        targetRole,
        currentSkills: skills,
        yearsOfExperience: yearsExp,
      });

      setHeadline(res.result.headline);
      setBio(res.result.bio);
      if (res.result.suggestedSkills && res.result.suggestedSkills.length > 0) {
        const combined = Array.from(new Set([...skills, ...res.result.suggestedSkills]));
        setSkills(combined);
      }
      setMessage('AI profile bio, headline, and skill tags successfully generated!');
    } catch (err: any) {
      alert(err.message || 'Error generating AI bio.');
    } finally {
      setGeneratingBio(false);
    }
  };

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSkillInput.trim()) return;
    if (!skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddExperience = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      company: 'Company Name',
      title: 'Job Title',
      startDate: new Date().toISOString().slice(0, 7),
      current: true,
      description: 'Key accomplishments, tech stack, and responsibilities.',
    };
    setExperience([...experience, newExp]);
  };

  const handleRemoveExperience = (id: string) => {
    setExperience(experience.filter((e) => e.id !== id));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await api.updateProfile({
        name,
        contactDetails: {
          phone,
          location,
          linkedinUrl,
          githubUrl,
          website,
        },
        profile: {
          headline,
          bio,
          skills,
          experience,
          resumeText,
        },
      });

      updateUser(res.user);
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Profile & AI Resume Builder</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage your credentials, skills, and AI-assisted professional bio.</p>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>

        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800">
            {message}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* AI Generator Box */}
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/30">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">AI Bio & Headline Generator</h3>
                  <p className="text-xs text-indigo-200">Automatically crafts a tailored, high-converting LinkedIn-style bio</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiBio}
                disabled={generatingBio}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>{generatingBio ? 'Generating Bio...' : 'Generate with AI'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-indigo-200 mb-1">Target Professional Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-indigo-400/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-200 mb-1">Years of Industry Experience</label>
                <input
                  type="text"
                  value={yearsExp}
                  onChange={(e) => setYearsExp(e.target.value)}
                  placeholder="e.g. 6"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-indigo-400/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* Basic & Contact Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Basic Information & Links</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile URL</label>
                <div className="relative">
                  <Linkedin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Profile URL</label>
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Professional Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer | React, Node.js, TypeScript"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bio Summary</label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a summary of your professional expertise..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Skills Tag Manager */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Key Technical Competencies & Skills</span>
            </h3>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Add a new skill (e.g. React, PyTorch, Docker)..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tag</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold text-xs rounded-xl flex items-center space-x-2"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-indigo-400 hover:text-rose-600 font-bold"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Experience History Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Work Experience Timeline</span>
              </h3>
              <button
                type="button"
                onClick={handleAddExperience}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Role</span>
              </button>
            </div>

            <div className="space-y-4 divide-y divide-slate-100">
              {experience.map((exp, index) => (
                <div key={exp.id || index} className="pt-4 first:pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600">Experience #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="text-slate-400 hover:text-rose-600 text-xs font-medium flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={exp.company}
                      onChange={(e) => {
                        const copy = [...experience];
                        copy[index].company = e.target.value;
                        setExperience(copy);
                      }}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={exp.title}
                      onChange={(e) => {
                        const copy = [...experience];
                        copy[index].title = e.target.value;
                        setExperience(copy);
                      }}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Role responsibilities and achievements..."
                    value={exp.description}
                    onChange={(e) => {
                      const copy = [...experience];
                      copy[index].description = e.target.value;
                      setExperience(copy);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Raw Resume Text for AI Engine */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Raw Resume Text (for AI Match Algorithm)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Paste your plain-text resume content below. Connexa's AI engine parses this content to generate accurate match scores when applying for jobs.
            </p>
            <textarea
              rows={6}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 leading-relaxed"
            />
          </div>
        </form>
      </div>
    </div>
  );
};
