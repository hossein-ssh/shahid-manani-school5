import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';
import { HomePage } from './components/public/HomePage';
import { AboutPage } from './components/public/AboutPage';
import { ContactPage } from './components/public/ContactPage';
import { AnnouncementsPage } from './components/public/AnnouncementsPage';
import { LoginPage } from './components/public/LoginPage';
import { RegisterPage } from './components/public/RegisterPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { CounselorDashboard } from './components/counselor/CounselorDashboard';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AttendanceKioskPage } from './components/kiosk/AttendanceKioskPage';

import { ThemeProvider } from './context/ThemeContext';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');
  const [dashboardTab, setDashboardTab] = useState<string>('overview');

  // Handle navigation
  const navigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleSwitched = () => {
    if (user?.role === 'kiosk') {
      setCurrentView('kiosk');
    } else {
      setCurrentView('dashboard');
      setDashboardTab('overview');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-right font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">در حال بارگذاری سامانه مدرسه نمونه دولتی شهید منانی...</p>
        </div>
      </div>
    );
  }

  // Attendance Kiosk Mode (Full-screen for school entrance / barcode scanner)
  if (currentView === 'kiosk' || user?.role === 'kiosk') {
    return (
      <>
        <AttendanceKioskPage onExit={() => navigate(user && user.role !== 'kiosk' ? 'dashboard' : 'home')} />
        <RoleSwitcherBar onRoleSwitched={handleRoleSwitched} />
      </>
    );
  }

  // Dashboard Router
  if (currentView === 'dashboard') {
    if (!user) {
      return (
        <div className="min-h-screen flex flex-col justify-between">
          <Header currentView="login" onNavigate={navigate} />
          <LoginPage onNavigate={navigate} />
          <Footer onNavigate={navigate} />
          <RoleSwitcherBar onRoleSwitched={handleRoleSwitched} />
        </div>
      );
    }

    const renderRoleDashboard = () => {
      switch (user.role) {
        case 'student':
          return <StudentDashboard activeTab={dashboardTab} onTabChange={setDashboardTab} />;
        case 'teacher':
          return <TeacherDashboard activeTab={dashboardTab} onTabChange={setDashboardTab} onLaunchKiosk={() => navigate('kiosk')} />;
        case 'counselor':
          return <CounselorDashboard activeTab={dashboardTab} onTabChange={setDashboardTab} />;
        case 'manager':
          return <ManagerDashboard activeTab={dashboardTab} onTabChange={setDashboardTab} onLaunchKiosk={() => navigate('kiosk')} />;
        case 'super_admin':
        default:
          return <AdminDashboard activeTab={dashboardTab} onTabChange={setDashboardTab} onLaunchKiosk={() => navigate('kiosk')} />;
      }
    };

    return (
      <DashboardLayout
        activeTab={dashboardTab}
        onTabChange={setDashboardTab}
        onNavigateHome={() => navigate('home')}
        onLaunchKiosk={() => navigate('kiosk')}
      >
        {renderRoleDashboard()}
        <RoleSwitcherBar onRoleSwitched={handleRoleSwitched} />
      </DashboardLayout>
    );
  }

  // Public Web Pages
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 font-sans selection:bg-indigo-600 selection:text-white">
      <Header currentView={currentView} onNavigate={navigate} />

      <main className="flex-1">
        {currentView === 'home' && <HomePage onNavigate={navigate} />}
        {currentView === 'about' && <AboutPage />}
        {currentView === 'contact' && <ContactPage />}
        {currentView === 'announcements' && <AnnouncementsPage />}
        {currentView === 'login' && <LoginPage onNavigate={navigate} />}
        {currentView === 'register' && <RegisterPage onNavigate={navigate} />}
      </main>

      <Footer onNavigate={navigate} />
      <RoleSwitcherBar onRoleSwitched={handleRoleSwitched} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
