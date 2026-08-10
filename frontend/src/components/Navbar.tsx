import React, { useState } from 'react';
import { Briefcase, ChevronDown, LogOut, PlusCircle, Search, ShieldAlert, UserCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/employee/jobs?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md">ADMIN</span>;
      case 'EMPLOYER':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-md">HR / EMPLOYER</span>;
      default:
        return <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-md">CANDIDATE</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-2xs">
      {/* Left side: Brand Logo + Search input */}
      <div className="flex items-center gap-6 lg:gap-8">
        <div
          onClick={() => onNavigate(user?.role === 'EMPLOYER' ? '/employer/dashboard' : user?.role === 'ADMIN' ? '/admin' : '/employee/jobs')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800 group-hover:text-indigo-600 transition-colors">
            Connexa
          </span>
        </div>

        {/* Sleek Search Pill */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:block relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs, skills, or people..."
            className="w-60 lg:w-80 h-9 bg-slate-100 border-none rounded-full pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-hidden"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </form>
      </div>

      {/* Center: Sleek Nav links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-500">
        {user?.role === 'EMPLOYEE' && (
          <>
            <button
              onClick={() => onNavigate('/employee/jobs')}
              className={`py-5 mt-1 transition-colors ${
                currentPath === '/employee/jobs' || currentPath === '/'
                  ? 'text-indigo-600 font-bold border-b-2 border-indigo-600'
                  : 'hover:text-slate-800'
              }`}
            >
              Discover & Jobs
            </button>

            <button
              onClick={() => onNavigate('/employee/dashboard')}
              className={`py-5 mt-1 transition-colors ${
                currentPath === '/employee/dashboard'
                  ? 'text-indigo-600 font-bold border-b-2 border-indigo-600'
                  : 'hover:text-slate-800'
              }`}
            >
              My Applications
            </button>

            <button
              onClick={() => onNavigate('/employee/profile')}
              className={`py-5 mt-1 transition-colors ${
                currentPath === '/employee/profile'
                  ? 'text-indigo-600 font-bold border-b-2 border-indigo-600'
                  : 'hover:text-slate-800'
              }`}
            >
              Profile & AI Bio
            </button>
          </>
        )}

        {user?.role === 'EMPLOYER' && (
          <>
            <button
              onClick={() => onNavigate('/employer/dashboard')}
              className={`py-5 mt-1 transition-colors ${
                currentPath === '/employer/dashboard'
                  ? 'text-indigo-600 font-bold border-b-2 border-indigo-600'
                  : 'hover:text-slate-800'
              }`}
            >
              HR Portal
            </button>

            <button
              onClick={() => onNavigate('/employer/post-job')}
              className={`py-5 mt-1 transition-colors flex items-center space-x-1 ${
                currentPath === '/employer/post-job'
                  ? 'text-indigo-600 font-bold border-b-2 border-indigo-600'
                  : 'hover:text-slate-800'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Post Job</span>
            </button>

            <button
              onClick={() => onNavigate('/employer/applicants')}
              className={`py-5 mt-1 transition-colors ${
                currentPath === '/employer/applicants'
                  ? 'text-indigo-600 font-bold border-b-2 border-indigo-600'
                  : 'hover:text-slate-800'
              }`}
            >
              Manage Applicants
            </button>

            <button
              onClick={() => onNavigate('/employee/jobs?tab=candidates')}
              className={`py-5 mt-1 transition-colors ${
                currentPath.includes('tab=candidates')
                  ? 'text-indigo-600 font-bold border-b-2 border-indigo-600'
                  : 'hover:text-slate-800'
              }`}
            >
              Talent Directory
            </button>
          </>
        )}

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => onNavigate('/admin')}
            className={`py-5 mt-1 transition-colors flex items-center space-x-1 ${
              currentPath === '/admin'
                ? 'text-rose-600 font-bold border-b-2 border-rose-600'
                : 'hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Admin Control Panel</span>
          </button>
        )}
      </nav>

      {/* Right Section: Notifications & User Profile */}
      <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
        {user ? (
          <>
            <NotificationBell onNavigate={onNavigate} />

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2.5 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-hidden"
              >
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs border border-slate-300 shadow-2xs">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{user.companyName || user.email}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in duration-100">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1">{getRoleBadge(user.role)}</div>
                  </div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      if (user.role === 'EMPLOYEE') onNavigate('/employee/profile');
                      else if (user.role === 'EMPLOYER') onNavigate('/employer/dashboard');
                      else onNavigate('/admin');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 font-medium"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>Account Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      onNavigate('/login');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 font-medium border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('/login')}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('/register')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

