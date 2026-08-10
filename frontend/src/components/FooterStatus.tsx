import React from 'react';

export const FooterStatus: React.FC = () => {
  return (
    <footer className="h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0 text-slate-400">
      <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
        <span>Backend: Online</span>
        <span>DB: Connected</span>
        <span>Socket: Active</span>
      </div>
      <div className="flex items-center gap-2 text-xs font-medium">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
        <span>AI Engine: v4.2.0-Production</span>
      </div>
    </footer>
  );
};
