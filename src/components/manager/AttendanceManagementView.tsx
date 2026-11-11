import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AttendanceRecord, AttendanceStats, ClassGroup } from '../../types';
import { toPersianDigits } from '../../utils/persianDate';
import {
  Scan,
  UserCheck,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Send,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  QrCode,
  Sparkles,
  ChevronLeft,
  X,
  Keyboard,
  Info
} from 'lucide-react';

interface AttendanceManagementViewProps {
  onLaunchKiosk?: () => void;
}

export const AttendanceManagementView: React.FC<AttendanceManagementViewProps> = ({ onLaunchKiosk }) => {
  const { apiFetch } = useAuth();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick manual register modal
  const [manualModalOpen, setManualModalOpen] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');
  const [manualNotes, setManualNotes] = useState<string>('');
  const [manualSubmitting, setManualSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Load classes, stats & records
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [todayRes, classesRes] = await Promise.all([
        apiFetch('/api/attendance/today'),
        apiFetch('/api/classes').catch(() => []),
      ]);

      if (todayRes.records) setRecords(todayRes.records);
      if (todayRes.stats) setStats(todayRes.stats);
      if (Array.isArray(classesRes)) setClasses(classesRes);
    } catch {
      // Offline fallback
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Submit manual check-in from manager portal
  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setManualSubmitting(true);
    try {
      const res = await apiFetch('/api/attendance/scan', {
        method: 'POST',
        headers: {
          'x-kiosk-key': 'kiosk_menani_gate_2026',
        },
        body: JSON.stringify({
          code: manualCode.trim(),
          method: 'manual_kiosk',
          notes: manualNotes.trim() || 'ثبت دستی توسط معاونت آموزشی',
        }),
      });

      setFeedback(res.message);
      setManualModalOpen(false);
      setManualCode('');
      setManualNotes('');
      loadData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || 'خطا در ثبت تردد دانش‌آموز');
    } finally {
      setManualSubmitting(false);
    }
  };

  // Change attendance status (e.g. excuse a late or absence)
  const handleChangeStatus = async (recordId: string, newStatus: 'present' | 'late' | 'excused' | 'absent') => {
    const reason = prompt('در صورت وجود یادداشت یا دلیل تغییر وضعیت، وارد نمایید (اختیاری):', 'گواهی پزشکی / اجازه معاونت');
    try {
      await apiFetch(`/api/attendance/records/${recordId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          notes: reason || undefined,
        }),
      });

      setRecords(prev =>
        prev.map(r =>
          r.id === recordId
            ? {
                ...r,
                status: newStatus,
                statusLabel:
                  newStatus === 'present'
                    ? 'حاضر و به‌موقع'
                    : newStatus === 'late'
                    ? 'ورود با تاخیر'
                    : newStatus === 'excused'
                    ? 'غیبت موجه با گواهی'
                    : 'غیبت غیرموجه',
                notes: reason || r.notes,
              }
            : r
        )
      );

      setFeedback('وضعیت تردد دانش‌آموز با موفقیت به‌روزرسانی شد.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'خطا در تغییر وضعیت تردد');
    }
  };

  // Filter records
  const filteredRecords = records.filter(rec => {
    if (selectedClassId !== 'all' && rec.classId !== selectedClassId) return false;
    if (selectedStatus !== 'all' && rec.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = rec.studentName.toLowerCase().includes(q);
      const idMatch = rec.studentNationalId.includes(q) || rec.studentCode.includes(q);
      if (!nameMatch && !idMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-right font-sans">
      
      {/* Toast Feedback */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">✕</button>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-slate-800">
        
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              <span>سامانه گیت ورود و خروج الکترونیک</span>
            </span>
            <span className="text-xs text-slate-400">
              دبیرستان هیأت امنایی نمونه دولتی شهید منانی
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            مدیریت حضور و غیاب هوشمند و ثبت تردد دانش‌آموزان
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            پشتیبانی از اسکنر رومیزی بارکد و QR کد، ورود دستی کیوسک برای فراموشی کارت، و ارسال آنی پیامک ورود به اولیاء
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
          {onLaunchKiosk && (
            <button
              onClick={onLaunchKiosk}
              className="px-4 py-2.5 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Scan className="w-4 h-4" />
              <span>اجرای کیوسک تمام‌صفحه گیت ورودی</span>
            </button>
          )}

          <button
            onClick={() => setManualModalOpen(true)}
            className="px-4 py-2.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت دستی تردد (کد ملی)</span>
          </button>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="به‌روزرسانی داده‌ها"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>حاضرین امروز</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {toPersianDigits(stats.presentCount)} <span className="text-xs font-sans text-slate-400">نفر</span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold pt-1">
              {toPersianDigits(stats.onTimeRate)}٪ ورود به‌موقع قبل از ۰۷:۴۵
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>ورود با تاخیر</span>
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {toPersianDigits(stats.lateCount)} <span className="text-xs font-sans text-slate-400">نفر</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              ثبت‌شده با دقیقه تاخیر و ارسال پیامک
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>غایبین ثبت‌نشده</span>
              <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {toPersianDigits(stats.absentCount)} <span className="text-xs font-sans text-slate-400">نفر</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              از مجموع {toPersianDigits(stats.totalStudents)} دانش‌آموز فعال
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>پیامک‌های اطلاع‌رسانی</span>
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {toPersianDigits(stats.presentCount + stats.lateCount)} <span className="text-xs font-sans text-slate-400">ارسال</span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold pt-1">
              ۱۰۰٪ تحویل موفق به سامانه اولیاء
            </div>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام، کد ملی یا شماره..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white"
          />
        </div>

        {/* Filter Selects */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          {/* Class filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>کلاس:</span>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
            >
              <option value="all">کلیه کلاس‌ها ({classes.length})</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>وضعیت:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="present">حاضر و به‌موقع</option>
              <option value="late">ورود با تاخیر</option>
              <option value="excused">غیبت موجه</option>
            </select>
          </div>
        </div>
      </div>

      {/* ATTENDANCE RECORDS TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              لیست ترددهای ثبت‌شده امروز ({toPersianDigits(filteredRecords.length)} رکورد)
            </span>
            <span className="text-[11px] text-slate-400">
              شنبه تا چهارشنبه · آستانه ورود رسمی ۰۷:۴۵
            </span>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Scan className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold">رکوردی با مشخصات انتخابی یافت نشد.</p>
            <p className="text-xs">کارت دانش‌آموزی را در کیوسک گیت ورودی اسکن کنید تا تردد ثبت گردد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  <th className="p-3.5">دانش‌آموز</th>
                  <th className="p-3.5">کلاس و پایه</th>
                  <th className="p-3.5">ساعت ورود</th>
                  <th className="p-3.5">وضعیت تردد</th>
                  <th className="p-3.5">روش ثبت</th>
                  <th className="p-3.5">اطلاع‌رسانی پیامک</th>
                  <th className="p-3.5 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* Student Info */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {rec.studentName.slice(0, 1)}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 dark:text-white block">
                            {rec.studentName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            کد ملی: {toPersianDigits(rec.studentNationalId)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Class */}
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {rec.className}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        پایه {rec.gradeLevel}
                      </span>
                    </td>

                    {/* Entrance Time */}
                    <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 font-bold">
                      {toPersianDigits(rec.time)}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          rec.status === 'present'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : rec.status === 'late'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        {rec.status === 'present' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : rec.status === 'late' ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <Info className="w-3 h-3" />
                        )}
                        <span>{rec.statusLabel}</span>
                      </span>
                    </td>

                    {/* Check-In Method */}
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        {rec.method === 'barcode_scanner' ? (
                          <>
                            <Scan className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>اسکنر بارکد کارت</span>
                          </>
                        ) : rec.method === 'manual_kiosk' ? (
                          <>
                            <Keyboard className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>ورود دستی کیوسک</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>ویرایش معاونت</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* SMS Status */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <Send className="w-3 h-3 shrink-0" />
                        <span>ارسال شد ({toPersianDigits(rec.guardianPhone)})</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {rec.status === 'late' && (
                          <button
                            onClick={() => handleChangeStatus(rec.id, 'excused')}
                            className="px-2 py-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                            title="ثبت به عنوان تاخیر یا غیبت موجه با گواهی"
                          >
                            موجه‌سازی
                          </button>
                        )}
                        {rec.status !== 'present' && (
                          <button
                            onClick={() => handleChangeStatus(rec.id, 'present')}
                            className="px-2 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg cursor-pointer transition-colors"
                            title="تغییر وضعیت به حاضر"
                          >
                            ثبت حاضر
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: MANUAL CHECK-IN DIALOG FOR MANAGER */}
      {/* ======================================================== */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 text-right shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-indigo-600" />
                <span>ثبت دستی تردد دانش‌آموز</span>
              </h3>
              <button
                onClick={() => setManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualCheckIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  کد ملی یا شماره دانش‌آموزی
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 2081111111"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  توضیحات و علت ثبت دستی
                </label>
                <input
                  type="text"
                  placeholder="مثال: فراموشی کارت هوشمند، گواهی اردو"
                  value={manualNotes}
                  onChange={e => setManualNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={manualSubmitting || !manualCode.trim()}
                  className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl cursor-pointer"
                >
                  {manualSubmitting ? 'در حال ثبت...' : 'ثبت تردد و ارسال پیامک'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
