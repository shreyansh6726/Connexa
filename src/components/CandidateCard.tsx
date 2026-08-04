import React from 'react';
import { ExternalLink, Github, Linkedin, Mail, MapPin, UserCheck } from 'lucide-react';
import { User } from '../types';

interface CandidateCardProps {
  candidate: User;
  onContact?: (candidate: User) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onContact }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-lg shadow-2xs">
              {candidate.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{candidate.name}</h3>
              <p className="text-xs text-indigo-600 font-medium">{candidate.profile?.headline || 'Professional Candidate'}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-semibold rounded-full border border-indigo-100">
            Verified Candidate
          </span>
        </div>

        {candidate.contactDetails?.location && (
          <div className="flex items-center space-x-1 text-xs text-slate-500 mt-2.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{candidate.contactDetails.location}</span>
          </div>
        )}

        {candidate.profile?.bio && (
          <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
            {candidate.profile.bio}
          </p>
        )}

        {candidate.profile?.skills && candidate.profile.skills.length > 0 && (
          <div className="mt-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
              Skills & Expertise
            </span>
            <div className="flex flex-wrap gap-1">
              {candidate.profile.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-400">
          {candidate.contactDetails?.linkedinUrl && (
            <a
              href={candidate.contactDetails.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-600 transition-colors"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {candidate.contactDetails?.githubUrl && (
            <a
              href={candidate.contactDetails.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 transition-colors"
              title="GitHub Profile"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          <a
            href={`mailto:${candidate.email}`}
            className="hover:text-indigo-600 transition-colors"
            title="Email Candidate"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>

        <a
          href={`mailto:${candidate.email}?subject=Opportunity%20via%20Connexa`}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl flex items-center space-x-1 transition-colors"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Contact</span>
        </a>
      </div>
    </div>
  );
};
