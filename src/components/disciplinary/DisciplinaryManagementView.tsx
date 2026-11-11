import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DisciplinaryRecord, DisciplinaryType, DisciplinarySeverity, User } from '../../types';
import { toPersianDigits, formatPersianDate } from '../../utils/persianDate';
import {
  ShieldAlert,
  AlertTriangle,
  PhoneCall,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User as UserIcon,
  X,
  Sparkles,
  PhoneForwarded,
  Volume2,
  FileText,
  RotateCw,
  Info,
  Calendar,
  Layers,
  Trash2
} from 'lucide-react';

export const DisciplinaryManagementView: React.FC = () => {
  const { apiFetch, user } = useAuth();

  const [records, setRecords] = useState<DisciplinaryRecord[]>([]);
  const [types, setTypes] = useState<DisciplinaryType[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  // Modal: Log new incident
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [severity, setSeverity] = useState<DisciplinarySeverity>('medium');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal: Manage Infraction Categories
  const [manageTypesModalOpen, setManageTypesModalOpen] = useState(false);
  const [newTypeTitle, setNewTypeTitle] = useState('');
  const [newTypeDescription, setNewTypeDescription] = useState('');
  const [newTypeSeverity, setNewTypeSeverity] = useState<DisciplinarySeverity>('medium');
  const [newTypeDemerit, setNewTypeDemerit] = useState('0.5');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [recordsData, typesData, usersData] = await Promise.all([
        apiFetch('/api/disciplinary/records'),
        apiFetch('/api/disciplinary/types'),
        apiFetch('/api/users').catch(() => []),
      ]);
      setRecords(recordsData || []);
      setTypes(typesData || []);
      setStudents((usersData || []).filter((u: User) => u.role === 'student' && u.status === 'active'));

      if (typesData && typesData.length > 0 && !selectedTypeId) {
        setSelectedTypeId(typesData[0].id);
      }
    } catch (err) {
      console.error('Error loading disciplinary data', err);
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch, selectedTypeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Infraction Type Selection to auto-fill severity
  const handleTypeChange = (typeId: string) => {
    setSelectedTypeId(typeId);
    const found = types.find(t => t.id === typeId);
    if (found) {
      setSeverity(found.defaultSeverity);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedTypeId) {
      setFeedback({ type: 'error', text: 'لطفاً دانش‌آموز و مورد انضباطی را انتخاب فرمایید.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await apiFetch('/api/disciplinary/records', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudentId,
          infractionTypeId: selectedTypeId,
          severity,
          notes,
        }),
      });

      setFeedback({
        type: 'success',
        text: res.message || 'مورد انضباطی با موفقیت ثبت شد و تماس صوتی خودکار به ولی در صف ارسال قرار گرفت.',
      });

      setCreateModalOpen(false);
      setNotes('');
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'خطا در ثبت مورد انضباطی' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryCall = async (recordId: string) => {
    try {
      const res = await apiFetch(`/api/disciplinary/records/${recordId}/retry-call`, {
        method: 'POST',
      });
      setFeedback({ type: 'success', text: res.message || 'تماس صوتی مجدد با موفقیت در صف برقراری قرار گرفت.' });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'خطا در برقراری مجدد تماس' });
    }
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeTitle.trim()) return;

    try {
      await apiFetch('/api/disciplinary/types', {
        method: 'POST',
        body: JSON.stringify({
          title: newTypeTitle.trim(),
          description: newTypeDescription.trim(),
          defaultSeverity: newTypeSeverity,
          demeritPoints: Number(newTypeDemerit) || 0.5,
        }),
      });
      setNewTypeTitle('');
      setNewTypeDescription('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'خطا در ثبت دسته انضباطی');
    }
  };

  const handleDeleteType = async (typeId: string) => {
    if (!confirm('آیا از حذف این دسته انضباطی اطمینان دارید؟')) return;
    try {
      await apiFetch(`/api/disciplinary/types/${typeId}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'خطا در حذف');
    }
  };

  // Filtered records
  const filteredRecords = records.filter(r => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentNationalId.includes(searchQuery) ||
      r.infractionTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || r.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  // Selected student & infraction info for live preview
  const currentStudent = students.find(s => s.id === selectedStudentId);
  const currentInfraction = types.find(t => t.id === selectedTypeId);

  const getSeverityBadge = (sev: DisciplinarySeverity) => {
    switch (sev) {
      case 'low':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">کم اهمیت</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300">متوسط</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-orange-50 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300">بالا / تذکر کتبی</span>;
      case 'critical':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">بحرانی / دعوت اولیا</span>;
    }
  };

  const getCallStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>تماس موفق و مکالمه انجام شد</span>
          </span>
        );
      case 'calling':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 animate-pulse">
            <PhoneForwarded className="w-3 h-3 text-indigo-600" />
            <span>در حال برقراری تماس...</span>
          </span>
        );
      case 'queued':
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>در صف شماره‌گیری خودکار</span>
          </span>
        );
      case 'failed':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>عدم پاسخگویی ولی</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/70 px-2.5 py-1 rounded-md">
            امور انضباطی و ارتباط هوشمند با اولیا · دبیرستان نمونه دولتی شهید منانی
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>امور انضباطی و تماس صوتی خودکار اولیا (TTS Voice Call)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ثبت تخلفات انضباطی و برقراری تماس تلفنی مکانیزه با متن صوتی تبدیل‌شده برای ولی دانش‌آموز بدون معطلی
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['super_admin', 'manager'].includes(user?.role || '') && (
            <button
              onClick={() => setManageTypesModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>مدیریت دسته‌بندی‌ها</span>
            </button>
          )}

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ ثبت مورد انضباطی جدید</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 block">کل موارد ثبت‌شده</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {toPersianDigits(records.length)} <span className="text-xs font-normal text-slate-400">مورد</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-emerald-600 block">تماس‌های صوتی موفق</span>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {toPersianDigits(records.filter(r => r.voiceCallStatus === 'completed').length)}
            <span className="text-xs font-normal text-slate-400 mr-1">تماس</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-amber-600 block">موارد با تاخیر مکرر</span>
          <div className="text-xl font-black text-amber-600 mt-1">
            {toPersianDigits(records.filter(r => r.infractionTitle.includes('تاخیر')).length)}
            <span className="text-xs font-normal text-slate-400 mr-1">مورد</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-rose-600 block">موارد با درجه بحرانی</span>
          <div className="text-xl font-black text-rose-600 mt-1">
            {toPersianDigits(records.filter(r => r.severity === 'critical').length)}
            <span className="text-xs font-normal text-slate-400 mr-1">پرونده</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="جستجوی نام دانش‌آموز، کد ملی یا عنوان مورد انضباطی..."
            className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 cursor-pointer"
          >
            <option value="all">همه درجات اهمیت</option>
            <option value="low">کم اهمیت</option>
            <option value="medium">متوسط</option>
            <option value="high">بالا (تذکر کتبی)</option>
            <option value="critical">بحرانی (دعوت اولیا)</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">دانش‌آموز</th>
                <th className="py-3 px-4">کلاس</th>
                <th className="py-3 px-4">عنوان مورد انضباطی</th>
                <th className="py-3 px-4">درجه شدت</th>
                <th className="py-3 px-4">نمره کسر انضباط</th>
                <th className="py-3 px-4">زمان ثبت</th>
                <th className="py-3 px-4">وضعیت تماس صوتی (TTS)</th>
                <th className="py-3 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    موردی یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div>{r.studentName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{r.studentNationalId}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {r.className}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200">
                      <div className="font-semibold">{r.infractionTitle}</div>
                      {r.notes && <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{r.notes}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      {getSeverityBadge(r.severity)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                      -{toPersianDigits(r.demeritPoints)} نمره
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      <div>{toPersianDigits(r.date)}</div>
                      <span className="font-mono text-[10px] text-slate-400">{r.time}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getCallStatusBadge(r.voiceCallStatus)}
                      {r.voiceCallDurationSeconds && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          مدت مکالمه: {toPersianDigits(r.voiceCallDurationSeconds)} ثانیه
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleRetryCall(r.id)}
                        title="برقراری مجدد تماس صوتی خودکار"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>تماس مجدد</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log New Incident */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 text-right space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>ثبت مورد انضباطی جدید و فعال‌سازی تماس صوتی هوشمند</span>
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  انتخاب دانش‌آموز هدف
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 [&>option]:bg-white dark:[&>option]:bg-slate-800"
                >
                  <option value="">-- لطفاً دانش‌آموز را انتخاب کنید --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.nationalId || s.username}) - {s.className || 'پایه نهم'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  مورد انضباطی / نوع تخلف
                </label>
                <select
                  required
                  value={selectedTypeId}
                  onChange={e => handleTypeChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 [&>option]:bg-white dark:[&>option]:bg-slate-800"
                >
                  {types.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title} (کسر {toPersianDigits(t.demeritPoints)} نمره)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    درجه اهمیت و شدت
                  </label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 [&>option]:bg-white dark:[&>option]:bg-slate-800"
                  >
                    <option value="low">کم اهمیت (تذکر شفاهی)</option>
                    <option value="medium">متوسط (ثبت پرونده)</option>
                    <option value="high">بالا (تذکر کتبی)</option>
                    <option value="critical">بحرانی (دعوت به شورا)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    شماره تماس اولیا جهت تماس صوتی
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentStudent?.phone || 'شماره در پرونده دانش‌آموز ثبت نشده'}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-mono text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  شرح ماجرا و توضیحات کادر انضباطی
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="جزئیات واقعه جهت پیگیری‌های بعدی دفتر معاونت..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                ></textarea>
              </div>

              {/* Real-time Voice Call TTS Script Preview */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>پیش‌نمایش زنده صدای تماس صوتی اولیا (TTS Output):</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                    غیرمسدودکننده (Non-blocking)
                  </span>
                </div>
                <p className="text-xs text-emerald-900 dark:text-emerald-100 leading-relaxed font-sans italic bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800/40">
                  «با سلام، اولیای محترم دانش‌آموز <span className="font-bold underline">{currentStudent?.fullName || '{نام دانش‌آموز}'}</span>، برای فرزند شما مورد انضباطی <span className="font-bold underline">{currentInfraction?.title || '{عنوان مورد انضباطی}'}</span> ثبت شده است، لطفاً پیگیر این موضوع باشید.»
                </p>
                <span className="text-[10px] text-slate-500 block">
                  * با فشردن دکمه ثبت، بدون معطلی و در پس‌زمینه، موتور تلفنی خودکار به شماره ولی زنگ زده و متن فوق را قرائت می‌نماید.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md shadow-rose-200 dark:shadow-none cursor-pointer disabled:opacity-50"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isSubmitting ? 'در حال ثبت و ارسال به صف تماس...' : 'ثبت مورد و شلیک تماس صوتی فوری'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manage Infraction Categories */}
      {manageTypesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 text-right space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>تعریف و مدیریت انواع موارد انضباطی</span>
              </h3>
              <button
                onClick={() => setManageTypesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Create new type form */}
            <form onSubmit={handleCreateType} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">افزودن تخلف جدید به لیست</span>
              <div>
                <input
                  type="text"
                  required
                  placeholder="عنوان تخلف (مثال: درگیری لفظی در حیاط مدرسه)"
                  value={newTypeTitle}
                  onChange={e => setNewTypeTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newTypeSeverity}
                  onChange={e => setNewTypeSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="low">کم اهمیت</option>
                  <option value="medium">متوسط</option>
                  <option value="high">بالا</option>
                  <option value="critical">بحرانی</option>
                </select>

                <input
                  type="number"
                  step="0.25"
                  placeholder="کسر نمره (مثلاً 0.5)"
                  value={newTypeDemerit}
                  onChange={e => setNewTypeDemerit(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-center font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                + ثبت در فهرست تخلفات
              </button>
            </form>

            {/* List of existing types */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {types.map(t => (
                <div key={t.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{t.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      کسر نمره: {toPersianDigits(t.demeritPoints)} | شدت: {t.defaultSeverity}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteType(t.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
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
