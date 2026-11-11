import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClassGroup, User, Assessment, Grade, ScheduleItem } from '../../types';
import { formatPersianDate, toPersianDigits, getWeekdayName } from '../../utils/persianDate';
import {
  BookOpen,
  Award,
  Users,
  Calendar,
  Plus,
  CheckCircle2,
  AlertCircle,
  Save,
  Clock,
  Sparkles,
  ClipboardList,
  ChevronLeft,
  GraduationCap,
  Scan,
} from 'lucide-react';
import { AttendanceManagementView } from '../manager/AttendanceManagementView';
import { OnlineExamsManagementView } from '../exams/OnlineExamsManagementView';

interface TeacherDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLaunchKiosk?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ activeTab = 'overview', onTabChange, onLaunchKiosk }) => {
  const { user, apiFetch } = useAuth();

  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [classStudents, setClassStudents] = useState<User[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // Grade edit buffers: studentId -> { score, comments, status }
  const [gradeInputs, setGradeInputs] = useState<Record<string, { score: string; comments: string; status: 'draft' | 'published' }>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New assessment modal
  const [createAssessmentOpen, setCreateAssessmentOpen] = useState(false);
  const [newAssTitle, setNewAssTitle] = useState('');
  const [newAssType, setNewAssType] = useState<'quiz' | 'midterm' | 'final' | 'homework' | 'project'>('quiz');
  const [newAssMax, setNewAssMax] = useState('20');
  const [newAssDate, setNewAssDate] = useState('2026-11-15');
  const [newAssDesc, setNewAssDesc] = useState('');

  // Load teacher classes and schedules
  useEffect(() => {
    apiFetch('/api/classes').then(data => {
      setClasses(data);
      if (data.length > 0 && !selectedClassId) {
        setSelectedClassId(data[0].id);
      }
    }).catch(() => {});

    apiFetch('/api/schedules').then(setSchedules).catch(() => {});
  }, [apiFetch]);

  // Load students and assessments when class selected
  useEffect(() => {
    if (selectedClassId) {
      apiFetch(`/api/classes/${selectedClassId}/students`).then(setClassStudents).catch(() => {});
      apiFetch(`/api/assessments?classId=${selectedClassId}`).then(data => {
        setAssessments(data);
        if (data.length > 0) {
          setSelectedAssessmentId(data[0].id);
        } else {
          setSelectedAssessmentId('');
        }
      }).catch(() => {});
    }
  }, [selectedClassId, apiFetch]);

  // Load grades when assessment selected
  useEffect(() => {
    if (selectedAssessmentId) {
      apiFetch(`/api/grades?assessmentId=${selectedAssessmentId}`).then(data => {
        setGrades(data);
        const map: Record<string, { score: string; comments: string; status: 'draft' | 'published' }> = {};
        data.forEach((g: Grade) => {
          map[g.studentId] = {
            score: String(g.score),
            comments: g.comments || '',
            status: g.status,
          };
        });
        setGradeInputs(map);
      }).catch(() => {});
    } else {
      setGrades([]);
      setGradeInputs({});
    }
  }, [selectedAssessmentId, apiFetch]);

  const activeAssessment = assessments.find(a => a.id === selectedAssessmentId);

  const handleScoreChange = (studentId: string, val: string) => {
    setGradeInputs(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { comments: '', status: 'draft' }),
        score: val,
      },
    }));
  };

  const handleCommentsChange = (studentId: string, val: string) => {
    setGradeInputs(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { score: '', status: 'draft' }),
        comments: val,
      },
    }));
  };

  const handleSaveAllGrades = async (publish: boolean) => {
    if (!selectedAssessmentId) return;
    setFeedbackMsg(null);

    const maxScore = activeAssessment?.maxScore || 20;

    // Validate scores
    for (const [studentId, item] of Object.entries(gradeInputs)) {
      if (item.score !== '') {
        const num = parseFloat(item.score);
        if (isNaN(num) || num < 0 || num > maxScore) {
          setFeedbackMsg({
            type: 'error',
            text: `نمره وارد شده برای دانش‌آموز نمی‌تواند منفی یا بیشتر از سقف ${maxScore} باشد.`,
          });
          return;
        }
      }
    }

    const payload = classStudents
      .filter(st => gradeInputs[st.id]?.score !== undefined && gradeInputs[st.id]?.score !== '')
      .map(st => ({
        studentId: st.id,
        score: parseFloat(gradeInputs[st.id].score),
        comments: gradeInputs[st.id].comments,
        status: publish ? ('published' as const) : (gradeInputs[st.id].status || 'draft'),
      }));

    if (payload.length === 0) {
      setFeedbackMsg({ type: 'error', text: 'لطفاً حداقل برای یک دانش‌آموز نمره وارد کنید.' });
      return;
    }

    try {
      await apiFetch('/api/grades/batch', {
        method: 'POST',
        body: JSON.stringify({
          assessmentId: selectedAssessmentId,
          grades: payload,
        }),
      });

      // Update local status
      setGradeInputs(prev => {
        const next = { ...prev };
        payload.forEach(p => {
          if (next[p.studentId]) {
            next[p.studentId].status = p.status;
          }
        });
        return next;
      });

      setFeedbackMsg({
        type: 'success',
        text: publish
          ? 'نمرات با موفقیت ثبت قطعی گردید و در کارنامه دانش‌آموزان منتشر شد.'
          : 'پیش‌نویس نمرات ذخیره شد (هنوز برای دانش‌آموزان منتشر نشده است).',
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'خطا در ذخیره نمرات' });
    }
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssTitle.trim() || !selectedClassId) return;

    try {
      const created = await apiFetch('/api/assessments', {
        method: 'POST',
        body: JSON.stringify({
          classId: selectedClassId,
          title: newAssTitle.trim(),
          type: newAssType,
          maxScore: parseFloat(newAssMax) || 20,
          assessmentDate: newAssDate,
          description: newAssDesc.trim(),
        }),
      });

      setAssessments(prev => [created, ...prev]);
      setSelectedAssessmentId(created.id);
      setCreateAssessmentOpen(false);
      setNewAssTitle('');
      setNewAssDesc('');
      setFeedbackMsg({ type: 'success', text: `ارزیابی «${created.title}» با موفقیت تعریف شد و در بخش آزمون‌های پیش‌رو دانش‌آموزان قرار گرفت.` });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'خطا در تعریف ارزیابی');
    }
  };

  const getAssessmentTypeLabel = (type: string) => {
    switch (type) {
      case 'quiz': return 'آزمونک کلاسی (کوئیز)';
      case 'midterm': return 'آزمون میان‌ترم';
      case 'final': return 'امتحان پایانی نوبت';
      case 'homework': return 'تکلیف و تمرین';
      case 'project': return 'پروژه علمی و پژوهشی';
      default: return 'ارزیابی کلاسی';
    }
  };

  // Schedule periods configuration: 4 periods for open school days
  const periodTimes = [
    { period: 1, name: 'زنگ اول', time: '۰۸:۰۰ الی ۰۹:۳۰', start: '08:00', end: '09:30' },
    { period: 2, name: 'زنگ دوم', time: '۰۹:۴۵ الی ۱۱:۱۵', start: '09:45', end: '11:15' },
    { period: 3, name: 'زنگ سوم', time: '۱۱:۳۰ الی ۱۳:۰۰', start: '11:30', end: '13:00' },
    { period: 4, name: 'زنگ چهارم', time: '۱۳:۰۰ الی ۱۴:۳۰', start: '13:00', end: '14:30' },
  ];

  return (
    <div className="space-y-6 text-right font-sans">
      
      {/* Teacher Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-1 rounded-md">
            پورتال دبیران و کادر آموزشی · مدرسه نمونه دولتی شهید منانی
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            پنل تخصصی دبیر: {user?.fullName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            شما به {toPersianDigits(classes.length)} کلاس در دوره اول متوسطه دسترسی دارید.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateAssessmentOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ تعریف آزمون / کوئیز جدید</span>
          </button>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => onTabChange('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>کلاس‌ها و ارزیابی‌ها</span>
        </button>

        <button
          onClick={() => onTabChange('grade_entry')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'grade_entry'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>ورود و ثبت نمرات</span>
        </button>

        <button
          onClick={() => onTabChange('exams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'exams'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>بانک و آزمون‌های آنلاین</span>
        </button>

        <button
          onClick={() => onTabChange('schedule')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'schedule'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>برنامه تدریس هفتگی (۴ زنگ)</span>
        </button>

        <button
          onClick={() => onTabChange('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Scan className="w-4 h-4" />
          <span>حضور و غیاب دانش‌آموزان</span>
        </button>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW (کلاس‌ها و ارزیابی‌ها) */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Assigned Classes Cards */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>کلاس‌های تخصیص‌یافته به شما در این ترم</span>
              </h2>
              <span className="text-xs text-slate-400">مجموع: {toPersianDigits(classes.length)} کلاس</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map(c => {
                const isSelected = c.id === selectedClassId;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedClassId(c.id);
                      onTabChange('grade_entry');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                          پایه {c.gradeLevel}
                        </span>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5">{c.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">اتاق: {c.roomNumber || 'کلاس ۱۰۱'}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        {toPersianDigits(c.enrolledCount || 24)} دانش‌آموز
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                        <span>ورود به ثبت نمرات این کلاس</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assessments and upcoming tests list */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-emerald-600" />
                  <span>آزمون‌ها و ارزیابی‌های تعریف‌شده (در کارتابل دانش‌آموزان)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  کلیه آزمون‌های زیر به‌صورت خودکار در بخش «آزمون‌های پیش‌رو» دانش‌آموزان به نمایش درمی‌آیند.
                </p>
              </div>

              <button
                onClick={() => setCreateAssessmentOpen(true)}
                className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                + آزمون جدید
              </button>
            </div>

            {assessments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                هنوز ارزیابی یا آزمونی برای این کلاس ثبت نشده است. با زدن دکمه «تعریف آزمون جدید» می‌توانید آزمون پیش‌رو تعریف فرمایید.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assessments.map(a => (
                  <div
                    key={a.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{a.title}</span>
                      <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                        سقف {toPersianDigits(a.maxScore)} نمره
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {a.description || 'بدون توضیحات تکمیلی'}
                    </p>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>نوع: {getAssessmentTypeLabel(a.type)}</span>
                      <span className="font-mono">{formatPersianDate(a.assessmentDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: GRADE ENTRY (ورود و ثبت نمرات) */}
      {/* ======================================================== */}
      {activeTab === 'grade_entry' && (
        <div className="space-y-6">
          {/* Class & Assessment Selector Strip */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                انتخاب کلاس درس تخصیص‌یافته:
              </label>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 [&>option]:bg-white dark:[&>option]:bg-slate-800 [&>option]:text-slate-900 dark:[&>option]:text-slate-100"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.roomNumber || 'کلاس'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                انتخاب آزمون / ارزیابی جهت ثبت یا ویرایش نمره:
              </label>
              <select
                value={selectedAssessmentId}
                onChange={e => setSelectedAssessmentId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 [&>option]:bg-white dark:[&>option]:bg-slate-800 [&>option]:text-slate-900 dark:[&>option]:text-slate-100"
              >
                {assessments.length === 0 ? (
                  <option value="">آزمونی برای این کلاس تعریف نشده است (ابتدا آزمون جدید ایجاد فرمایید)</option>
                ) : (
                  assessments.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.title} (سقف: {toPersianDigits(a.maxScore)} نمره) - {formatPersianDate(a.assessmentDate)}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Grade Entry Table Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  لیست دانش‌آموزان و جدول نمرات: {activeAssessment?.title || 'ارزیابی انتخاب نشده'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  سقف نمره: <strong className="text-slate-800 dark:text-slate-200">{activeAssessment?.maxScore || 20}</strong> · تاریخ ارزیابی: {formatPersianDate(activeAssessment?.assessmentDate)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSaveAllGrades(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>ذخیره پیش‌نویس (بدون انتشار)</span>
                </button>
                <button
                  onClick={() => handleSaveAllGrades(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ثبت و انتشار رسمی نمرات</span>
                </button>
              </div>
            </div>

            {classStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                دانش‌آموزی در این کلاس ثبت‌نام نشده است.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-100/75 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3 font-semibold">ردیف</th>
                      <th className="p-3 font-semibold">نام و نام خانوادگی</th>
                      <th className="p-3 font-semibold">کد دانش‌آموزی</th>
                      <th className="p-3 font-semibold w-28">نمره (از {activeAssessment?.maxScore || 20})</th>
                      <th className="p-3 font-semibold">وضعیت انتشار</th>
                      <th className="p-3 font-semibold">توضیحات و بازخورد دبیر برای دانش‌آموز</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {classStudents.map((st, idx) => {
                      const input = gradeInputs[st.id] || { score: '', comments: '', status: 'draft' };
                      const isPublished = input.status === 'published';

                      return (
                        <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-mono text-slate-400">{toPersianDigits(idx + 1)}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{st.fullName}</td>
                          <td className="p-3 font-mono tabular-nums text-slate-500 dark:text-slate-400">{st.studentId || '—'}</td>
                          <td className="p-3">
                            <input
                              type="number"
                              step="0.25"
                              min="0"
                              max={activeAssessment?.maxScore || 20}
                              placeholder="مثال: ۱۸.۵"
                              value={input.score}
                              onChange={e => handleScoreChange(st.id, e.target.value)}
                              className="w-24 px-2.5 py-1.5 text-xs font-mono font-bold text-indigo-900 dark:text-indigo-200 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-center"
                            />
                          </td>
                          <td className="p-3">
                            {isPublished ? (
                              <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-[11px] px-2 py-0.5 rounded font-semibold">
                                منتشر شده
                              </span>
                            ) : (
                              <span className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-[11px] px-2 py-0.5 rounded font-semibold">
                                پیش‌نویس دبیر
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              placeholder="توصیه آموزشی یا تحلیل پاسخنامه..."
                              value={input.comments}
                              onChange={e => handleCommentsChange(st.id, e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: WEEKLY SCHEDULE (برنامه تدریس هفتگی - ۴ زنگ) */}
      {/* ======================================================== */}
      {activeTab === 'schedule' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                برنامه تدریس هفتگی شما در مدرسه نمونه دولتی شهید منانی
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                شنبه تا چهارشنبه · ۴ زنگ در روز (هر زنگ ۱.۵ ساعت) با امکان زنگ آزاد / بدون کلاس
              </p>
            </div>
            <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-lg font-bold">
              سال تحصیلی ۱۴۰۴-۱۴۰۵
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { day: 0, title: 'شنبه' },
              { day: 1, title: 'یکشنبه' },
              { day: 2, title: 'دوشنبه' },
              { day: 3, title: 'سه‌شنبه' },
              { day: 4, title: 'چهارشنبه' },
            ].map(col => {
              const daySchedules = schedules.filter(s => s.dayOfWeek === col.day);

              return (
                <div key={col.day} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs block">{col.title}</span>
                    <span className="text-[10px] text-slate-400">۴ زنگ آموزشی</span>
                  </div>

                  <div className="space-y-2">
                    {periodTimes.map(p => {
                      const matched = daySchedules.find(s => {
                        const sStart = s.startTime?.slice(0, 5);
                        return sStart === p.start || s.note?.includes(`زنگ ${p.period}`);
                      });

                      if (matched) {
                        return (
                          <div key={p.period} className="p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-[11px] space-y-1">
                            <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300 font-bold">
                              <span>{p.name}</span>
                              <span className="font-mono text-[10px]">{p.time}</span>
                            </div>
                            <div className="text-slate-900 dark:text-white font-extrabold">{matched.className || 'کلاس'}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex justify-between">
                              <span>مکان: {matched.room}</span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{matched.note || 'تدریس'}</span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={p.period} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 text-[11px] space-y-0.5 opacity-75">
                          <div className="flex items-center justify-between text-slate-400 font-medium">
                            <span>{p.name}</span>
                            <span className="font-mono text-[10px]">{p.time}</span>
                          </div>
                          <div className="text-slate-400 text-[10px] italic">زنگ آزاد / خالی</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: ATTENDANCE (حضور و غیاب دانش‌آموزان) */}
      {/* ======================================================== */}
      {activeTab === 'attendance' && (
        <AttendanceManagementView onLaunchKiosk={onLaunchKiosk} />
      )}

      {/* ======================================================== */}
      {/* TAB 5: ONLINE EXAMS & QUESTION BUILDER */}
      {/* ======================================================== */}
      {activeTab === 'exams' && (
        <OnlineExamsManagementView userRole="teacher" />
      )}

      {/* Create Assessment Modal */}
      {createAssessmentOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 text-right space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">تعریف آزمون / ارزیابی کلاسی جدید</h3>
              <button onClick={() => setCreateAssessmentOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">عنوان آزمون</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: آزمونک هفتگی مشتق و هندسه"
                  value={newAssTitle}
                  onChange={e => setNewAssTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">کلاس هدف</label>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 [&>option]:bg-white dark:[&>option]:bg-slate-800 [&>option]:text-slate-900 dark:[&>option]:text-slate-100"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">نوع ارزیابی</label>
                  <select
                    value={newAssType}
                    onChange={e => setNewAssType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 [&>option]:bg-white dark:[&>option]:bg-slate-800 [&>option]:text-slate-900 dark:[&>option]:text-slate-100"
                  >
                    <option value="quiz">آزمونک کلاسی (کوئیز)</option>
                    <option value="midterm">آزمون میان‌ترم</option>
                    <option value="final">امتحان پایانی نوبت</option>
                    <option value="homework">تکلیف و تمرین هفتگی</option>
                    <option value="project">پروژه علمی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">سقف نمره</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newAssMax}
                    onChange={e => setNewAssMax(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">تاریخ برگزاری</label>
                <input
                  type="date"
                  value={newAssDate}
                  onChange={e => setNewAssDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">توضیحات تکمیلی و سرفصل‌ها</label>
                <textarea
                  rows={2}
                  placeholder="مباحث مورد آزمون جهت اطلاع دانش‌آموزان..."
                  value={newAssDesc}
                  onChange={e => setNewAssDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                ثبت ارزیابی و ابلاغ به دانش‌آموزان
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
