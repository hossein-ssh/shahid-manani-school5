import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationItem } from '../../types';
import { formatPersianDateTime } from '../../utils/persianDate';
import {
  GraduationCap,
  LayoutDashboard,
  Calendar,
  BookOpen,
  Award,
  Video,
  HeartHandshake,
  ClipboardList,
  Users,
  Settings,
  ShieldAlert,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Home,
  CheckCircle2,
  TrendingUp,
  Globe,
  FileSpreadsheet,
  Sun,
  Moon,
  Sparkles,
  HardDrive,
  BookMarked,
  Scan,
} from 'lucide-react';

interface DashboardLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNavigateHome: () => void;
  onLaunchKiosk?: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  onTabChange,
  onNavigateHome,
  onLaunchKiosk,
  children,
}) => {
  const { user, logout, apiFetch } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (user) {
      apiFetch('/api/notifications')
        .then(res => setNotifications(res))
        .catch(() => {});
    }
  }, [user, apiFetch]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {}
  };

  const getRoleTitle = (role?: string) => {
    switch (role) {
      case 'super_admin': return 'مدیر ارشد سامانه';
      case 'manager': return 'مدیر آموزشی مؤسسه';
      case 'teacher': return 'دبیر تخصصی';
      case 'counselor': return 'مشاور تحصیلی و کنکور';
      case 'student': return 'دانش‌آموز';
      default: return 'کاربر';
    }
  };

  // Build menu items based on user role
  const getMenuItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'student':
        return [
          { id: 'overview', label: 'پنل دانش‌آموز (خلاصه امروز)', icon: LayoutDashboard },
          { id: 'upcoming_exams', label: 'آزمون‌های پیش‌رو', icon: Calendar },
          { id: 'grades', label: 'کارنامه (نمرات من)', icon: Award },
          { id: 'growth', label: 'رشد من (پیشرفت تحصیلی)', icon: TrendingUp },
          { id: 'schedule', label: 'برنامه (ساعت کلاس‌های هفته)', icon: Calendar },
          { id: 'counseling', label: 'مشاوره و پشتیبانی', icon: HeartHandshake },
          { id: 'announcements', label: 'اعلان‌ها (پیام‌های مدرسه)', icon: Bell },
          { id: 'surveys', label: 'نظرسنجی و ارزیابی', icon: ClipboardList },
        ];
      case 'teacher':
        return [
          { id: 'overview', label: 'کلاس‌ها و ارزیابی‌ها', icon: BookOpen },
          { id: 'grade_entry', label: 'ورود و ثبت نمرات', icon: Award },
          { id: 'exams', label: 'بانک و آزمون‌های آنلاین', icon: ClipboardList },
          { id: 'attendance', label: 'حضور و غیاب دانش‌آموزان', icon: Scan },
          { id: 'schedule', label: 'برنامه تدریس هفتگی', icon: Calendar },
        ];
      case 'counselor':
        return [
          { id: 'overview', label: 'درخواست‌های مشاوره', icon: HeartHandshake },
          { id: 'availability', label: 'تنظیم برنامه حضور و ساعات', icon: Calendar },
        ];
      case 'manager':
        return [
          { id: 'overview', label: 'نمای کلی معاونت آموزشی', icon: LayoutDashboard },
          { id: 'attendance', label: 'حضور و غیاب و گیت ورود', icon: Scan },
          { id: 'shifts_settings', label: 'تنظیم شیفت‌ها و پیامک', icon: Settings },
          { id: 'disciplinary', label: 'کمیته انضباطی و تماس هوشمند', icon: ShieldAlert },
          { id: 'exams', label: 'بانک و آزمون‌های آنلاین', icon: ClipboardList },
          { id: 'classes', label: 'ثبت و مدیریت کلاس‌ها', icon: BookOpen },
          { id: 'courses', label: 'ثبت و تعریف دروس', icon: BookMarked },
          { id: 'teachers', label: 'ثبت دبیران و دروس تدریسی', icon: GraduationCap },
          { id: 'students', label: 'ثبت دانش‌آموزان و کلاس‌بندی', icon: Users },
          { id: 'counselors', label: 'ثبت مشاوران و روزهای حضور', icon: HeartHandshake },
          { id: 'schedules', label: 'برنامه‌ریزی هفتگی (شنبه تا چهارشنبه)', icon: Calendar },
          { id: 'excel_import', label: 'ثبت گروهی با فایل اکسل', icon: FileSpreadsheet },
          { id: 'report_cards', label: 'کارنامه‌ها و مقایسه ماه قبل', icon: Award },
          { id: 'announcements', label: 'اطلاعیه‌ها و پیام‌های مدرسه', icon: Bell },
        ];
      case 'super_admin':
      default:
        return [
          { id: 'overview', label: 'داشبورد مدیریتی کلان', icon: LayoutDashboard },
          { id: 'attendance', label: 'حضور و غیاب هوشمند (گیت ورود)', icon: Scan },
          { id: 'shifts_settings', label: 'تنظیم شیفت‌ها و پیامک تردد', icon: Settings },
          { id: 'disciplinary', label: 'کمیته انضباطی و تماس هوشمند', icon: ShieldAlert },
          { id: 'exams', label: 'بانک و آزمون‌های آنلاین', icon: ClipboardList },
          { id: 'site_update', label: 'به‌روزرسانی سامانه (آپدیت سایت)', icon: Sparkles },
          { id: 'settings', label: 'تنظیمات سراسری سیستم', icon: Settings },
          { id: 'users', label: 'مدیریت کاربران و نقش‌ها', icon: Users },
          { id: 'academic', label: 'ترم‌ها، دروس و کلاس‌ها', icon: BookOpen },
          { id: 'schedules', label: 'برنامه هفتگی و زمان‌بندی', icon: Calendar },
          { id: 'grades_overview', label: 'نظارت بر کارنامه‌ها و نمرات', icon: Award },
          { id: 'surveys', label: 'نظرسنجی‌ها و ارزیابی', icon: ClipboardList },
          { id: 'audit_logs', label: 'لاگ‌های امنیتی و رویدادها', icon: ShieldAlert },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col text-right transition-colors">
      
      {/* Dashboard Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Right Brand info & Mobile menu toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 text-right cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  مدرسه نمونه دولتی شهید منانی
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">پنل تخصصی {getRoleTitle(user?.role)}</span>
              </div>
            </button>
          </div>

          {/* Left Actions: Theme Toggle, Notifications, Home button, User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Kiosk Mode Shortcut */}
            {onLaunchKiosk && (
              <button
                onClick={onLaunchKiosk}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg border border-amber-300 dark:border-amber-700 transition-colors cursor-pointer"
                title="کیوسک تردد تمام‌صفحه گیت ورودی"
              >
                <Scan className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>کیوسک گیت ورودی</span>
              </button>
            )}

            {/* Dark/Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'حالت روز' : 'حالت شب'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* View Public Site button */}
            <button
              onClick={onNavigateHome}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>مشاهده سایت عمومی</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="اعلان‌ها"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-right">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">اعلان‌های سامانه</span>
                    <span className="text-[11px] text-slate-500">{unreadCount} پیام خوانده نشده</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        پیام جدیدی وجود ندارد.
                      </div>
                    ) : (
                      notifications.slice(0, 10).map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 ${
                            !notif.isRead ? 'bg-indigo-50/50 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                            <span className="text-indigo-600 font-semibold">{notif.title}</span>
                            <span>{formatPersianDateTime(notif.createdAt)}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Info chip & Logout */}
            <div className="flex items-center gap-2 pl-2 border-r border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                {user?.fullName.charAt(0) || 'ک'}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                  {user?.fullName}
                </span>
                <span className="text-[10px] text-slate-500">{getRoleTitle(user?.role)}</span>
              </div>
              <button
                onClick={logout}
                title="خروج از حساب کاربری"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:block w-64 shrink-0">
          {user?.role === 'student' ? (
            /* Student Dark Sidebar matching Screenshot 1 & 2 */
            <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-4 shadow-xl sticky top-22 space-y-4">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/80 flex items-center justify-center text-white">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">شهید منانی</h3>
                    <p className="text-[10px] text-slate-400">منوی من</p>
                  </div>
                </div>
              </div>

              {/* Student Profile Widget */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400">سلام</span>
                <h4 className="text-sm font-bold text-white">{user.fullName}</h4>
                <p className="text-xs text-indigo-300">دانش‌آموز پایه نهم (کلاس ۹۰۱)</p>
              </div>

              {/* View Main Website Action */}
              <button
                onClick={onNavigateHome}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-right"
              >
                <Globe className="w-4 h-4 text-slate-400" />
                <span>مشاهده سایت (صفحه اصلی مدرسه)</span>
              </button>

              {/* Student Navigation Items */}
              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isReportCard = item.id === 'grades';

                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-right ${
                        isActive
                          ? isReportCard
                            ? 'bg-rose-950/60 border border-rose-600/60 text-rose-200 shadow-sm'
                            : 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? (isReportCard ? 'text-rose-400' : 'text-white') : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronLeft className="w-3.5 h-3.5 opacity-70" />}
                    </button>
                  );
                })}
              </div>

              {/* Logout Button */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer text-right"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج از حساب</span>
                </button>
              </div>

            </div>
          ) : (
            /* Staff / Manager Sidebar */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs sticky top-22 space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">
                منوی پرتال
              </div>

              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-right ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronLeft className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex justify-end">
            <div className="w-72 bg-slate-900 text-white h-full p-4 space-y-3 shadow-2xl overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-sm font-bold text-white">مدرسه نمونه دولتی شهید منانی</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-right ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 pb-16 lg:pb-0">
          {children}
        </main>

      </div>

      {/* Student Floating Bottom Dock matching Screenshot 2 */}
      {user?.role === 'student' && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onTabChange('overview')}
            className={`px-2.5 py-1.5 rounded-xl flex flex-col items-center gap-0.5 text-[10px] cursor-pointer transition-colors ${
              activeTab === 'overview' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">داشبورد</span>
          </button>

          <button
            onClick={() => onTabChange('grades')}
            className={`px-2.5 py-1.5 rounded-xl flex flex-col items-center gap-0.5 text-[10px] cursor-pointer transition-colors ${
              activeTab === 'grades' ? 'text-rose-400 font-bold bg-rose-950/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>کارنامه</span>
          </button>

          <button
            onClick={() => onTabChange('growth')}
            className={`px-2.5 py-1.5 rounded-xl flex flex-col items-center gap-0.5 text-[10px] cursor-pointer transition-colors ${
              activeTab === 'growth' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>رشد من</span>
          </button>

          <button
            onClick={() => onTabChange('schedule')}
            className={`px-2.5 py-1.5 rounded-xl flex flex-col items-center gap-0.5 text-[10px] cursor-pointer transition-colors ${
              activeTab === 'schedule' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">برنامه</span>
          </button>

          <button
            onClick={() => onTabChange('online_classes')}
            className={`px-2.5 py-1.5 rounded-xl flex flex-col items-center gap-0.5 text-[10px] cursor-pointer transition-colors ${
              activeTab === 'online_classes' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">کلاس</span>
          </button>

          <button
            onClick={() => onTabChange('counseling')}
            className={`px-2.5 py-1.5 rounded-xl flex flex-col items-center gap-0.5 text-[10px] cursor-pointer transition-colors ${
              activeTab === 'counseling' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span className="hidden sm:inline">مشاوره</span>
          </button>
        </div>
      )}

    </div>
  );
};
