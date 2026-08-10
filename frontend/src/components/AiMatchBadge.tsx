import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, Info, Sparkles, XCircle } from 'lucide-react';
import { AiMatchResult } from '../types';

interface AiMatchBadgeProps {
  score?: number;
  matchResult?: AiMatchResult;
  size?: 'sm' | 'md' | 'lg';
  showDetailsButton?: boolean;
}

export const AiMatchBadge: React.FC<AiMatchBadgeProps> = ({
  score = 75,
  matchResult,
  size = 'md',
  showDetailsButton = true,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
  let badgeLabel = 'Moderate Match';

  if (score >= 85) {
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    badgeLabel = 'High Match';
  } else if (score >= 70) {
    badgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';
    badgeLabel = 'Good Match';
  } else if (score >= 50) {
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
    badgeLabel = 'Fair Match';
  } else {
    badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
    badgeLabel = 'Low Match';
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (showDetailsButton) setShowModal(true);
        }}
        className={`inline-flex items-center space-x-1.5 rounded-full border shadow-2xs font-medium cursor-pointer hover:opacity-90 transition-all ${badgeColor} ${sizeClasses}`}
        title="Click to inspect AI Candidate-Job Match Analysis"
      >
        <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
        <span>{score}% AI Match</span>
        <span className="opacity-75 font-normal">({badgeLabel})</span>
        {showDetailsButton && <ChevronRight className="w-3 h-3 opacity-60" />}
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">AI Candidate Match Breakdown</h3>
                  <p className="text-xs text-slate-500">Automated candidate vs. job requirements fit</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Score Header */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-2xl font-extrabold text-indigo-600">{score}%</span>
                  <span className="text-xs text-slate-500 font-medium ml-2">Overall Match Index</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
                  {badgeLabel}
                </span>
              </div>

              {/* Analysis Text */}
              {matchResult?.analysis && (
                <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed flex items-start space-x-2">
                  <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <p>{matchResult.analysis}</p>
                </div>
              )}

              {/* Matching Skills */}
              {matchResult?.matchingSkills && matchResult.matchingSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Matching Requirements ({matchResult.matchingSkills.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matchingSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-lg border border-emerald-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {matchResult?.missingSkills && matchResult.missingSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <XCircle className="w-4 h-4 text-amber-500" />
                    <span>Missing / Unmentioned Requirements ({matchResult.missingSkills.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missingSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-medium rounded-lg border border-amber-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {matchResult?.strengths && matchResult.strengths.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Key Highlight Strengths
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                    {matchResult.strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
