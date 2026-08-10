import React, { useEffect, useState } from 'react';
import { FooterStatus } from './components/FooterStatus';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Login } from './pages/common/Login';
import { Register } from './pages/common/Register';
import { Unauthorized } from './pages/common/Unauthorized';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { ProfileBuilder } from './pages/employee/ProfileBuilder';
import { SearchJobs } from './pages/employee/SearchJobs';
import { EmployerDashboard } from './pages/employer/EmployerDashboard';
import { ManageApplicants } from './pages/employer/ManageApplicants';
import { PostJob } from './pages/employer/PostJob';

export function MainApp() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname + window.location.search || '/login';
  });

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderRoute = () => {
    const pathOnly = currentPath.split('?')[0];
    const queryParams = new URLSearchParams(currentPath.split('?')[1] || '');

    switch (pathOnly) {
      case '/login':
        return <Login onNavigate={navigate} />;
      case '/register':
        return <Register onNavigate={navigate} />;
      case '/unauthorized':
        return <Unauthorized onNavigate={navigate} />;

      // Candidate / Employee Routes
      case '/employee/jobs':
      case '/':
        return (
          <SearchJobs
            onNavigate={navigate}
            initialTab={queryParams.get('tab') === 'candidates' ? 'candidates' : 'jobs'}
          />
        );

      case '/employee/dashboard':
        return (
          <ProtectedRoute allowedRoles={['EMPLOYEE']} onNavigate={navigate}>
            <EmployeeDashboard onNavigate={navigate} />
          </ProtectedRoute>
        );

      case '/employee/profile':
        return (
          <ProtectedRoute allowedRoles={['EMPLOYEE']} onNavigate={navigate}>
            <ProfileBuilder onNavigate={navigate} />
          </ProtectedRoute>
        );

      // Employer / HR Routes
      case '/employer/dashboard':
        return (
          <ProtectedRoute allowedRoles={['EMPLOYER', 'ADMIN']} onNavigate={navigate}>
            <EmployerDashboard onNavigate={navigate} />
          </ProtectedRoute>
        );

      case '/employer/post-job':
        return (
          <ProtectedRoute allowedRoles={['EMPLOYER', 'ADMIN']} onNavigate={navigate}>
            <PostJob onNavigate={navigate} />
          </ProtectedRoute>
        );

      case '/employer/applicants':
        return (
          <ProtectedRoute allowedRoles={['EMPLOYER', 'ADMIN']} onNavigate={navigate}>
            <ManageApplicants
              onNavigate={navigate}
              initialJobId={queryParams.get('jobId') || undefined}
            />
          </ProtectedRoute>
        );

      // Admin Routes
      case '/admin':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
            <AdminDashboard onNavigate={navigate} />
          </ProtectedRoute>
        );

      default:
        return <SearchJobs onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar currentPath={currentPath} onNavigate={navigate} />
      <main className="flex-1 flex flex-col">{renderRoute()}</main>
      <FooterStatus />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
