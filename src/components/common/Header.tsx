import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { usePWAInstall } from '../../utils/usePWAInstall';
import {
  GraduationCap,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Sun,
  Moon,
  Download,
  Menu,
  X,
  Users,
  Home,
  Bell,
  Info,
  PhoneCall,
  Scan
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isInstallable, triggerInstall } = usePWAInstall();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleTitle = (role?: string) => {
    switch (role) {
      case 'super_admin': return 'مدیر ارشد';
      case 'manager': return 'معاونت آموزشی';
      case 'teacher': return 'دبیر تخصصی';
      case 'counselor': return 'مشاور تحصیلی';
      case 'student': return 'دانش‌آموز';
      case 'kiosk': return 'کیوسک ورود';
      default: return 'کاربر';
    }
  };

  const navItems = [
    { id: 'home', label: 'صفحه اصلی', icon: Home },
    { id: 'announcements', label: 'اخبار و کادر مدرسه', icon: Bell },
    { id: 'about', label: 'درباره مؤسسه', icon: Info },
    { id: 'contact', label: 'تماس و نشانی', icon: PhoneCall },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-18">
          
          {/* Mobile hamburger button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="باز کردن منو"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* School Emblem & Brand */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-right group cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 dark:shadow-none">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors whitespace-nowrap">
                مدرسه نمونه دولتی شهید منانی
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                سامانه هوشمند مدیریت آموزشی و پرتال نمرات
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                  currentView === item.id ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action Zone: Theme Toggle + Kiosk Shortcut + PWA Install + User/Login */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Attendance Kiosk Shortcut */}
            <button
              onClick={() => onNavigate('kiosk')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/70 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg border border-amber-300 dark:border-amber-700 transition-colors cursor-pointer shadow-2xs"
              title="ورود به کیوسک هوشمند گیت ورودی (اسکنر بارکد و QR)"
            >
              <Scan className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">کیوسک تردد</span>
            </button>

            {/* PWA Install Button */}
            {isInstallable && (
              <button
                onClick={triggerInstall}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                title="نصب اپلیکیشن روی دستگاه"
              >
                <Download className="w-4 h-4 animate-bounce" />
                <span>نصب برنامه</span>
              </button>
            )}

            {/* Dark/Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'حالت روز' : 'حالت شب'}
              aria-label="تغییر تم"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {/* User Profile or Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer text-right"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                      {user.fullName}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {getRoleTitle(user.role)}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 sm:hidden">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.fullName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{getRoleTitle(user.role)}</p>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onNavigate('dashboard');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-right cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      ورود به پنل کاربری
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                        onNavigate('home');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-right cursor-pointer border-t border-slate-100 dark:border-slate-700 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      خروج از حساب
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer"
              >
                ورود به پرتال
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(item.id);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-right font-medium transition-colors cursor-pointer ${
                  currentView === item.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 text-indigo-500" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {isInstallable && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                triggerInstall();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-right font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/60 dark:bg-indigo-950/80 transition-colors cursor-pointer mt-2"
            >
              <Download className="w-4 h-4" />
              <span>نصب اپلیکیشن روی گوشی / تبلت</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
