import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  SystemSettings,
  AcademicTerm,
  Course,
  ClassGroup,
  ScheduleItem,
  AuditLog,
  Survey,
} from '../../types';
import { formatPersianDate, formatPersianDateTime, getWeekdayName, toPersianDigits } from '../../utils/persianDate';
import { SiteUpdateManager } from './SiteUpdateManager';
import { AttendanceManagementView } from '../manager/AttendanceManagementView';
import { AttendanceShiftsSettingsView } from '../attendance/AttendanceShiftsSettingsView';
import { DisciplinaryManagementView } from '../disciplinary/DisciplinaryManagementView';
import { OnlineExamsManagementView } from '../exams/OnlineExamsManagementView';
import {
  Settings,
  Users,
  BookOpen,
  Calendar,
  ShieldAlert,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Building,
  Phone,
  BarChart3,
  Video,
  Sparkles,
  HardDrive,
} from 'lucide-react';

interface AdminDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLaunchKiosk?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab, onTabChange, onLaunchKiosk }) => {
  const { user, apiFetch } = useAuth();

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurveyResults, setSelectedSurveyResults] = useState<any | null>(null);

  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New user modal
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    fullName: '',
    username: '',
    phone: '',
    email: '',
    role: 'student' as any,
    password: '',
    studentId: '',
  });

  // New class modal
  const [createClassOpen, setCreateClassOpen] = useState(false);
  const [newClassData, setNewClassData] = useState({
    name: '',
    courseId: '',
    teacherId: '',
    academicTermId: '',
    roomNumber: 'کلاس ۱۰۱',
    maxCapacity: 30,
  });

  // Enrollment modal
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [targetClass, setTargetClass] = useState<ClassGroup | null>(null);
  const [classEnrolledStudents, setClassEnrolledStudents] = useState<User[]>([]);
  const [studentToEnroll, setStudentToEnroll] = useState('');

  // New schedule slot modal
  const [createScheduleOpen, setCreateScheduleOpen] = useState(false);
  const [newSchData, setNewSchData] = useState({
    classId: '',
    dayOfWeek: 0,
    startTime: '08:00',
    endTime: '09:30',
    room: 'کلاس ۱۰۱',
    isOnline: false,
  });

  // Load initial data
  const loadData = () => {
    apiFetch('/api/settings').then(setSettings).catch(() => {});
    apiFetch('/api/users').then(setUsersList).catch(() => {});
    apiFetch('/api/terms').then(setTerms).catch(() => {});
    apiFetch('/api/courses').then(setCourses).catch(() => {});
    apiFetch('/api/classes').then(setClasses).catch(() => {});
    apiFetch('/api/schedules').then(setSchedules).catch(() => {});
    apiFetch('/api/audit-logs').then(setAuditLogs).catch(() => {});
    apiFetch('/api/surveys').then(setSurveys).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, [apiFetch]);

  // Handle settings toggle
  const handleUpdateSettings = async (updates: Partial<SystemSettings>) => {
    try {
      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setSettings(res);
      setFeedback({ type: 'success', text: 'تنظیمات سراسری سامانه با موفقیت ذخیره شد.' });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'خطا در ثبت تنظیمات' });
    }
  };

  // User actions
  const handleToggleUserStatus = async (targetUser: User) => {
    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    try {
      await apiFetch(`/api/users/${targetUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      setUsersList(prev =>
        prev.map(u => (u.id === targetUser.id ? { ...u, status: nextStatus } : u))
      );
      setFeedback({
        type: 'success',
        text: `وضعیت کاربر ${targetUser.fullName} به ${nextStatus === 'active' ? 'فعال' : 'معلق'} تغییر یافت.`,
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const handleApproveStudent = async (targetUser: User) => {
    try {
      await apiFetch(`/api/users/${targetUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'active' }),
      });
      setUsersList(prev =>
        prev.map(u => (u.id === targetUser.id ? { ...u, status: 'active' } : u))
      );
      setFeedback({ type: 'success', text: `ثبت‌نام دانش‌آموز ${targetUser.fullName} تأیید شد.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch {}
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      });
      setUsersList(prev => [created, ...prev]);
      setCreateUserOpen(false);
      setNewUserData({
        fullName: '',
        username: '',
        phone: '',
        email: '',
        role: 'student',
        password: '',
        studentId: '',
      });
      setFeedback({ type: 'success', text: `کاربر جدید «${created.fullName}» با موفقیت تعریف گردید.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'خطا در ایجاد کاربر');
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await apiFetch('/api/classes', {
        method: 'POST',
        body: JSON.stringify(newClassData),
      });
      setClasses(prev => [created, ...prev]);
      setCreateClassOpen(false);
      setFeedback({ type: 'success', text: `کلاس «${created.name}» با موفقیت ایجاد شد.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEnrollment = async (cls: ClassGroup) => {
    setTargetClass(cls);
    const students = await apiFetch(`/api/classes/${cls.id}/students`);
    setClassEnrolledStudents(students);
    setEnrollModalOpen(true);
  };

  const handleEnrollStudent = async () => {
    if (!targetClass || !studentToEnroll) return;
    try {
      await apiFetch(`/api/classes/${targetClass.id}/enroll`, {
        method: 'POST',
        body: JSON.stringify({ studentId: studentToEnroll }),
      });
      const students = await apiFetch(`/api/classes/${targetClass.id}/students`);
      setClassEnrolledStudents(students);
      setStudentToEnroll('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUnenrollStudent = async (studentId: string) => {
    if (!targetClass) return;
    try {
      await apiFetch(`/api/classes/${targetClass.id}/enroll/${studentId}`, { method: 'DELETE' });
      setClassEnrolledStudents(prev => prev.filter(s => s.id !== studentId));
      loadData();
    } catch {}
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await apiFetch('/api/schedules', {
        method: 'POST',
        body: JSON.stringify(newSchData),
      });
      setSchedules(prev => [created, ...prev]);
      setCreateScheduleOpen(false);
      setFeedback({ type: 'success', text: 'برنامه با موفقیت اضافه شد.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const viewSurveyResults = async (surveyId: string) => {
    try {
      const res = await apiFetch(`/api/surveys/${surveyId}/results`);
      setSelectedSurveyResults(res);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // KPI Calculations
  const totalStudents = usersList.filter(u => u.role === 'student').length;
  const totalTeachers = usersList.filter(u => u.role === 'teacher').length;
  const totalCounselors = usersList.filter(u => u.role === 'counselor').length;
  const pendingRegistrations = usersList.filter(u => u.status === 'pending').length;

  const filteredUsers = usersList.filter(u => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.username.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (activeTab === 'attendance') {
    return <AttendanceManagementView onLaunchKiosk={onLaunchKiosk} />;
  }
  if (activeTab === 'shifts_settings') {
    return <AttendanceShiftsSettingsView />;
  }
  if (activeTab === 'disciplinary') {
    return <DisciplinaryManagementView />;
  }
  if (activeTab === 'exams') {
    return <OnlineExamsManagementView userRole="super_admin" />;
  }

  return (
    <div className="space-y-6 text-right">
      
      {/* Admin Title Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">مرکز فرماندهی و نظارت ارشد</span>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            سامانه مدیریت مدرسه نمونه دولتی شهید منانی
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            کنترل سراسری کاربران، به‌روزرسانی سامانه، نظارت بر کارنامه‌ها، نظرسنجی‌ها و امنیت داده‌ها
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange('site_update')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>به‌روزرسانی سایت</span>
          </button>
          {pendingRegistrations > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>{toPersianDigits(pendingRegistrations)} ثبت‌نام در انتظار</span>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* PRINCIPAL ONLY: SITE UPDATE & BACKUP */}
      {/* ======================================================== */}
      {(activeTab === 'site_update' || activeTab === 'backup') && (
        <SiteUpdateManager />
      )}

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW & STATS */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">دانش‌آموزان ثبت‌شده</span>
              <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums block mt-1">
                {toPersianDigits(totalStudents)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">دبیران و اساتید فعال</span>
              <span className="text-2xl font-extrabold text-indigo-600 font-mono tabular-nums block mt-1">
                {toPersianDigits(totalTeachers)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">مشاوران تحصیلی</span>
              <span className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums block mt-1">
                {toPersianDigits(totalCounselors)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">کلاس‌ها و دوره‌های دایر</span>
              <span className="text-2xl font-extrabold text-amber-600 font-mono tabular-nums block mt-1">
                {toPersianDigits(classes.length)}
              </span>
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">وضعیت کلاس‌های آنلاین</h3>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${settings?.onlineClassesEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {settings?.onlineClassesEnabled ? 'فعال' : 'غیرفعال'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                کلید کنترل سراسری ماژول کلاس‌های آنلاین در سامانه دبیرستان شهید منانی.
              </p>
              <button
                onClick={() => handleUpdateSettings({ onlineClassesEnabled: !settings?.onlineClassesEnabled })}
                className="w-full py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {settings?.onlineClassesEnabled ? 'غیرفعال‌سازی موقت کلاس‌های آنلاین' : 'فعال‌سازی کلاس‌های آنلاین'}
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">سیاست تأیید ثبت‌نام دانش‌آموزان</h3>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${settings?.requireRegistrationApproval ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {settings?.requireRegistrationApproval ? 'نیاز به تأیید مدیریت' : 'تأیید آنی'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                تعیین نیاز به بررسی مدارک پیش از ورود دانش‌آموز به پرتال.
              </p>
              <button
                onClick={() => handleUpdateSettings({ requireRegistrationApproval: !settings?.requireRegistrationApproval })}
                className="w-full py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                تغییر به {settings?.requireRegistrationApproval ? '«تأیید خودکار و ورود سریع»' : '«بررسی دستی توسط مدیریت»'}
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">آخرین رویدادهای ثبت‌شده</h3>
                <button onClick={() => onTabChange('audit_logs')} className="text-xs text-indigo-600 hover:underline">
                  مشاهده همه
                </button>
              </div>
              <div className="space-y-2">
                {auditLogs.slice(0, 3).map(l => (
                  <div key={l.id} className="text-[11px] p-2 bg-slate-50 rounded-lg">
                    <span className="font-semibold text-slate-800 block">{l.action}</span>
                    <span className="text-slate-400 font-mono">{formatPersianDateTime(l.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SYSTEM SETTINGS (SECTION 8 & SECTION 11) */}
      {/* ======================================================== */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">تنظیمات سراسری و کنترل ماژول‌های سامانه</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              تغییرات در این بخش بی‌درنگ در سطح تمامی پرتال‌ها و دیتابیس اعمال می‌شود.
            </p>
          </div>

          <div className="space-y-6 max-w-2xl">
            {/* ONLINE CLASSES SWITCH (SECTION 8 REQUIREMENT) */}
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-600" />
                  <span>ماژول کلاس‌های آنلاین (سوئیچ سراسری)</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  در صورت غیرفعال‌سازی، ورود دانش‌آموزان به کلاس‌های آنلاین مسدود گردیده و پیام توضیحی مؤدبانه به ایشان نمایش داده می‌شود. هیچ رکوردی از جلسات، نمرات و زمان‌بندی‌ها حذف نخواهد شد.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleUpdateSettings({ onlineClassesEnabled: !settings?.onlineClassesEnabled })}
                className="cursor-pointer text-indigo-600 shrink-0"
              >
                {settings?.onlineClassesEnabled ? (
                  <ToggleRight className="w-10 h-10 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-400" />
                )}
              </button>
            </div>

            {/* Registration Policy */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">امکان ثبت‌نام آنلاین دانش‌آموزان</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  فعال بودن فرم ثبت‌نام اینترنتی در صفحه اصلی سایت عمومی.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleUpdateSettings({ allowStudentRegistration: !settings?.allowStudentRegistration })}
                className="cursor-pointer text-indigo-600 shrink-0"
              >
                {settings?.allowStudentRegistration ? (
                  <ToggleRight className="w-10 h-10 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-400" />
                )}
              </button>
            </div>

            {/* Registration Approval Requirement */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">نیاز به تأیید دستی حساب دانش‌آموزان توسط مدیریت</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  در صورت فعال بودن، حساب کاربر تا زمان تأیید توسط مدیریت در وضعیت «در انتظار بررسی» باقی می‌ماند.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleUpdateSettings({ requireRegistrationApproval: !settings?.requireRegistrationApproval })}
                className="cursor-pointer text-indigo-600 shrink-0"
              >
                {settings?.requireRegistrationApproval ? (
                  <ToggleRight className="w-10 h-10 text-amber-600" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-400" />
                )}
              </button>
            </div>

            {/* Institute Identity Info */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-bold text-slate-900">مشخصات و نشانی دبیرخانه مؤسسه</h4>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">نام رسمی مؤسسه</label>
                <input
                  type="text"
                  value={settings?.instituteName || ''}
                  onChange={e => setSettings(prev => prev ? { ...prev, instituteName: e.target.value } : null)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">شماره تلفن دبیرخانه</label>
                  <input
                    type="text"
                    value={settings?.contactPhone || ''}
                    onChange={e => setSettings(prev => prev ? { ...prev, contactPhone: e.target.value } : null)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ایمیل رسمی</label>
                  <input
                    type="text"
                    value={settings?.contactEmail || ''}
                    onChange={e => setSettings(prev => prev ? { ...prev, contactEmail: e.target.value } : null)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">آدرس پستی</label>
                <input
                  type="text"
                  value={settings?.contactAddress || ''}
                  onChange={e => setSettings(prev => prev ? { ...prev, contactAddress: e.target.value } : null)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="button"
                onClick={() => settings && handleUpdateSettings(settings)}
                className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                ذخیره تغییرات مشخصات مؤسسه
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: USER MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">مدیریت کاربران و سطوح دسترسی</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تعریف اساتید، مشاوران، مدیران آموزش، فعال/معلق‌سازی حساب‌ها و تأیید ثبت‌نام دانش‌آموزان
              </p>
            </div>

            <button
              onClick={() => setCreateUserOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن کاربر جدید</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
              {['all', 'student', 'teacher', 'counselor', 'manager', 'super_admin'].map(r => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    userRoleFilter === r ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {r === 'all'
                    ? 'همه'
                    : r === 'student'
                    ? 'دانش‌آموزان'
                    : r === 'teacher'
                    ? 'دبیران'
                    : r === 'counselor'
                    ? 'مشاوران'
                    : r === 'manager'
                    ? 'مدیران آموزش'
                    : 'مدیران ارشد'}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="جستجوی نام یا تلفن..."
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-100/75 text-slate-700 border-b border-slate-200">
                  <th className="p-3 font-semibold">نام و نام خانوادگی</th>
                  <th className="p-3 font-semibold">نقش کاربری</th>
                  <th className="p-3 font-semibold">شماره تماس</th>
                  <th className="p-3 font-semibold">کد ملی / دانش‌آموزی</th>
                  <th className="p-3 font-semibold">وضعیت حساب</th>
                  <th className="p-3 font-semibold text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{u.fullName}</td>
                    <td className="p-3">
                      <span className="font-semibold text-indigo-700">
                        {u.role === 'super_admin'
                          ? 'مدیر ارشد'
                          : u.role === 'manager'
                          ? 'مدیر آموزش'
                          : u.role === 'teacher'
                          ? 'دبیر'
                          : u.role === 'counselor'
                          ? 'مشاور'
                          : 'دانش‌آموز'}
                      </span>
                    </td>
                    <td className="p-3 font-mono tabular-nums text-slate-600">{toPersianDigits(u.phone)}</td>
                    <td className="p-3 font-mono tabular-nums text-slate-500">{u.studentId || u.nationalId || '—'}</td>
                    <td className="p-3">
                      {u.status === 'active' ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[11px] px-2 py-0.5 rounded font-semibold">
                          فعال
                        </span>
                      ) : u.status === 'pending' ? (
                        <span className="text-amber-700 bg-amber-50 border border-amber-200 text-[11px] px-2 py-0.5 rounded font-semibold">
                          در انتظار تأیید
                        </span>
                      ) : (
                        <span className="text-rose-700 bg-rose-50 border border-rose-200 text-[11px] px-2 py-0.5 rounded font-semibold">
                          معلق / مسدود
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {u.status === 'pending' && (
                          <button
                            onClick={() => handleApproveStudent(u)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            تأیید عضویت
                          </button>
                        )}
                        {u.role !== 'super_admin' && (
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                              u.status === 'active'
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status === 'active' ? 'تعلیق' : 'فعال‌سازی'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: ACADEMIC MANAGEMENT (TERMS, COURSES, CLASSES) */}
      {/* ======================================================== */}
      {activeTab === 'academic' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">کلاس‌ها، دوره‌ها و گروه‌بندی دانش‌آموزان</h2>
                <p className="text-xs text-slate-500 mt-0.5">تخصیص دبیران، ثبت‌نام دانش‌آموزان در کلاس و مدیریت ظرفیت</p>
              </div>
              <button
                onClick={() => setCreateClassOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>ایجاد کلاس جدید</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {classes.map(c => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-indigo-700 font-bold">{c.courseTitle}</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{c.name}</h3>
                    <p className="text-xs text-slate-600 mt-1">دبیر: {c.teacherName || 'نامشخص'}</p>
                    <p className="text-xs text-slate-500">محل برگزاری: {c.roomNumber}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      ثبت‌نامی: {toPersianDigits(c.enrolledCount || 0)} از {toPersianDigits(c.maxCapacity)}
                    </span>
                    <button
                      onClick={() => openEnrollment(c)}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      مدیریت اعضا
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: AUDIT LOGS (SECTION 11 & SECTION 13) */}
      {/* ======================================================== */}
      {activeTab === 'audit_logs' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">لاگ‌های امنیتی و رویدادهای مدیریتی سامانه (Audit Trail)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ثبت غیرقابل تغییر تاریخچه ورودها، تغییرات نمرات، به‌روزرسانی سطوح دسترسی و تنظیمات سیستمی
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-100/75 text-slate-700 border-b border-slate-200">
                  <th className="p-3 font-semibold">زمان و تاریخ</th>
                  <th className="p-3 font-semibold">کاربر اقدام‌کننده</th>
                  <th className="p-3 font-semibold">نقش</th>
                  <th className="p-3 font-semibold">رویداد / عملیات</th>
                  <th className="p-3 font-semibold">موجودیت</th>
                  <th className="p-3 font-semibold font-mono">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono tabular-nums text-slate-600">{formatPersianDateTime(l.createdAt)}</td>
                    <td className="p-3 font-bold text-slate-900">{l.userName || 'سامانه خودکار'}</td>
                    <td className="p-3 text-slate-500 font-semibold">{l.userRole || '—'}</td>
                    <td className="p-3 text-indigo-900 font-medium">{l.action}</td>
                    <td className="p-3 font-mono text-slate-500">{l.entity}</td>
                    <td className="p-3 font-mono text-slate-400">{l.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: SURVEYS & AGGREGATED RESULTS */}
      {/* ======================================================== */}
      {activeTab === 'surveys' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">نظرسنجی‌ها و بازخوردها</h2>
              <p className="text-xs text-slate-500 mt-0.5">مشاهده نتایج تحلیلی، میانگین رضایت و نظرات کیفی</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surveys.map(s => (
              <div key={s.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{s.title}</span>
                  <span className="text-indigo-600 font-semibold">{toPersianDigits(s.responseCount || 0)} پاسخ</span>
                </div>
                <p className="text-xs text-slate-600">{s.description}</p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{s.isAnonymous ? 'کاملاً ناشناس' : 'عمومی'}</span>
                  <button
                    onClick={() => viewSurveyResults(s.id)}
                    className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                  >
                    مشاهده تحلیل آماری
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedSurveyResults && (
            <div className="mt-6 p-6 rounded-2xl border border-indigo-200 bg-indigo-50/20 space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  تحلیل آماری نظرسنجی: {selectedSurveyResults.survey?.title}
                </h3>
                <span className="text-xs font-bold text-indigo-700">
                  مجموع مشارکت‌کنندگان: {toPersianDigits(selectedSurveyResults.totalResponses)} نفر
                </span>
              </div>

              <div className="space-y-4">
                {(selectedSurveyResults.analysis || []).map((item: any) => (
                  <div key={item.questionId} className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-800">{item.questionText}</h4>
                    {item.questionType === 'multiple_choice' && (
                      <div className="space-y-1.5 pt-1">
                        {Object.entries(item.counts || {}).map(([opt, count]: any) => (
                          <div key={opt} className="flex items-center justify-between text-xs text-slate-600">
                            <span>{opt}</span>
                            <span className="font-mono tabular-nums font-bold text-indigo-600">
                              {toPersianDigits(count)} رأی
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {item.questionType === 'rating' && (
                      <div className="text-xs font-bold text-emerald-700">
                        میانگین نمره رضایت: {toPersianDigits(item.averageRating)} از ۵ ستاره
                      </div>
                    )}
                    {item.questionType === 'text' && (
                      <div className="space-y-1 pt-1">
                        {(item.textAnswers || []).map((txt: string, idx: number) => (
                          <p key={idx} className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                            «{txt}»
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create User Modal */}
      {createUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-right space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">تعریف کاربر جدید در سامانه</h3>
              <button onClick={() => setCreateUserOpen(false)} className="text-xs text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">نام و نام خانوادگی</label>
                <input
                  type="text"
                  required
                  value={newUserData.fullName}
                  onChange={e => setNewUserData({ ...newUserData, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">نقش کاربری</label>
                  <select
                    value={newUserData.role}
                    onChange={e => setNewUserData({ ...newUserData, role: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  >
                    <option value="student">دانش‌آموز</option>
                    <option value="teacher">دبیر / مدرس</option>
                    <option value="counselor">مشاور تحصیلی</option>
                    <option value="manager">مدیر آموزش</option>
                    <option value="super_admin">مدیر ارشد</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">شماره تماس</label>
                  <input
                    type="tel"
                    required
                    value={newUserData.phone}
                    onChange={e => setNewUserData({ ...newUserData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">کلمه عبور</label>
                <input
                  type="password"
                  required
                  value={newUserData.password}
                  onChange={e => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                ثبت و ایجاد حساب کاربر
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      {createClassOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-right space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">ایجاد کلاس درس جدید</h3>
              <button onClick={() => setCreateClassOpen(false)} className="text-xs text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">نام کلاس و گروه</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حسابان ۲ - گروه ب"
                  value={newClassData.name}
                  onChange={e => setNewClassData({ ...newClassData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">درس آموزشی</label>
                  <select
                    required
                    value={newClassData.courseId}
                    onChange={e => setNewClassData({ ...newClassData, courseId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  >
                    <option value="">انتخاب درس...</option>
                    {courses.map(crs => (
                      <option key={crs.id} value={crs.id}>
                        {crs.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">دبیر مدرس</label>
                  <select
                    required
                    value={newClassData.teacherId}
                    onChange={e => setNewClassData({ ...newClassData, teacherId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  >
                    <option value="">انتخاب دبیر...</option>
                    {usersList.filter(u => u.role === 'teacher').map(t => (
                      <option key={t.id} value={t.id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">نیم‌سال تحصیلی</label>
                <select
                  required
                  value={newClassData.academicTermId}
                  onChange={e => setNewClassData({ ...newClassData, academicTermId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                >
                  <option value="">انتخاب ترم...</option>
                  {terms.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">شماره یا نام اتاق</label>
                  <input
                    type="text"
                    value={newClassData.roomNumber}
                    onChange={e => setNewClassData({ ...newClassData, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">سقف ظرفیت</label>
                  <input
                    type="number"
                    value={newClassData.maxCapacity}
                    onChange={e => setNewClassData({ ...newClassData, maxCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                ایجاد کلاس
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Class Enrollment Modal */}
      {enrollModalOpen && targetClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-right space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">مدیریت اعضای کلاس: {targetClass.name}</h3>
              <button onClick={() => setEnrollModalOpen(false)} className="text-xs text-slate-400">✕</button>
            </div>

            {/* Add student dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={studentToEnroll}
                onChange={e => setStudentToEnroll(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300"
              >
                <option value="">انتخاب دانش‌آموز جهت افزودن...</option>
                {usersList
                  .filter(u => u.role === 'student' && !classEnrolledStudents.some(es => es.id === u.id))
                  .map(st => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.phone})
                    </option>
                  ))}
              </select>
              <button
                onClick={handleEnrollStudent}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                افزودن
              </button>
            </div>

            {/* Current enrolled list */}
            <div className="space-y-2 max-h-60 overflow-y-auto pt-2">
              <span className="text-xs font-bold text-slate-700 block">
                لیست دانش‌آموزان ثبت‌نام‌شده ({toPersianDigits(classEnrolledStudents.length)} نفر):
              </span>
              {classEnrolledStudents.map(st => (
                <div key={st.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{st.fullName}</span>
                    <span className="text-slate-500 mr-2 font-mono">({toPersianDigits(st.phone)})</span>
                  </div>
                  <button
                    onClick={() => handleUnenrollStudent(st.id)}
                    className="text-rose-600 hover:text-rose-800 text-xs font-semibold cursor-pointer"
                  >
                    حذف از کلاس
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
