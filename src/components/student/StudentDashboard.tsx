import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ScheduleItem,
  Grade,
  CounselorAvailability,
  CounselingRequest,
  CounselingMessage,
  Survey,
  Announcement,
  StudentReportCard,
  Assessment,
} from '../../types';
import { ReportCardView } from './ReportCardView';
import { formatPersianDate, formatPersianDateTime, getWeekdayName, toPersianDigits, formatScore } from '../../utils/persianDate';
import {
  GraduationCap,
  Calendar,
  Award,
  HeartHandshake,
  ClipboardList,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  BookOpen,
  AlertCircle,
  FileText,
  ChevronLeft,
} from 'lucide-react';

interface StudentDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ activeTab, onTabChange }) => {
  const { user, apiFetch } = useAuth();

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [availabilities, setAvailabilities] = useState<CounselorAvailability[]>([]);
  const [counselingRequests, setCounselingRequests] = useState<CounselingRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CounselingRequest | null>(null);
  const [requestMessages, setRequestMessages] = useState<CounselingMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Consultation request modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSubject, setBookingSubject] = useState('');
  const [bookingCategory, setBookingCategory] = useState<'academic' | 'career' | 'personal' | 'exam_prep'>('academic');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Survey answering modal
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, any>>({});
  const [surveySuccess, setSurveySuccess] = useState<string | null>(null);

  const [reportCard, setReportCard] = useState<StudentReportCard | null>(null);
  const [isReportCardLoading, setIsReportCardLoading] = useState(true);

  useEffect(() => {
    // Load student data concurrently
    apiFetch('/api/schedules').then(setSchedules).catch(() => {});
    apiFetch('/api/grades').then(setGrades).catch(() => {});
    apiFetch('/api/assessments').then(setAssessments).catch(() => {});
    apiFetch('/api/report-card')
      .then(res => {
        setReportCard(res);
        setIsReportCardLoading(false);
      })
      .catch(() => {
        setIsReportCardLoading(false);
      });
    apiFetch('/api/counseling/availability').then(setAvailabilities).catch(() => {});
    apiFetch('/api/counseling/requests').then(setCounselingRequests).catch(() => {});
    apiFetch('/api/surveys').then(setSurveys).catch(() => {});
    apiFetch('/api/announcements?audience=students').then(setAnnouncements).catch(() => {});
  }, [apiFetch]);

  // Load messages when request selected
  useEffect(() => {
    if (selectedRequest) {
      apiFetch(`/api/counseling/requests/${selectedRequest.id}/messages`)
        .then(setRequestMessages)
        .catch(() => {});
    }
  }, [selectedRequest, apiFetch]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !newMessageText.trim()) return;

    try {
      const msg = await apiFetch(`/api/counseling/requests/${selectedRequest.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: newMessageText.trim() }),
      });
      setRequestMessages(prev => [...prev, msg]);
      setNewMessageText('');
    } catch {}
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingSubject.trim()) return;

    try {
      const newReq = await apiFetch('/api/counseling/requests', {
        method: 'POST',
        body: JSON.stringify({
          subject: bookingSubject.trim(),
          category: bookingCategory,
          preferredTime: bookingTime.trim(),
          initialMessage: bookingMessage.trim(),
        }),
      });
      setCounselingRequests(prev => [newReq, ...prev]);
      setBookingSuccess('درخواست مشاوره با موفقیت ثبت شد و به مشاور ارشد ارجاع داده شد.');
      setTimeout(() => {
        setBookingModalOpen(false);
        setBookingSuccess(null);
        setBookingSubject('');
        setBookingMessage('');
        setBookingTime('');
      }, 1500);
    } catch {}
  };

  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSurvey) return;

    try {
      await apiFetch(`/api/surveys/${activeSurvey.id}/respond`, {
        method: 'POST',
        body: JSON.stringify({ answers: surveyAnswers }),
      });
      setSurveySuccess('پاسخ‌های شما با موفقیت ثبت شد.');
      apiFetch('/api/surveys').then(setSurveys);
      setTimeout(() => {
        setActiveSurvey(null);
        setSurveySuccess(null);
        setSurveyAnswers({});
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'خطا در ثبت پاسخ');
    }
  };

  // Helper to format days until assessment
  const getExamCountdown = (dateStr: string) => {
    try {
      const examDate = new Date(dateStr);
      const now = new Date();
      examDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      const diffTime = examDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return { label: 'امروز برگزار می‌شود', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200' };
      if (diffDays === 1) return { label: 'فردا برگزار می‌شود', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' };
      if (diffDays > 1) return { label: `${toPersianDigits(diffDays)} روز مانده`, color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200' };
      return { label: 'برگزار شده', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' };
    } catch {
      return { label: 'به زودی', color: 'bg-slate-100 text-slate-600' };
    }
  };

  const getAssessmentTypeLabel = (type: string) => {
    switch (type) {
      case 'quiz': return 'آزمونک کلاسی (کوئیز)';
      case 'midterm': return 'آزمون میان‌ترم';
      case 'final': return 'امتحان پایانی نوبت';
      case 'homework': return 'تکلیف و تمرین هفتگی';
      case 'project': return 'پروژه علمی';
      default: return 'ارزیابی کلاسی';
    }
  };

  const periodTimes = [
    { period: 1, name: 'زنگ اول', time: '۰۸:۰۰ الی ۰۹:۳۰', start: '08:00', end: '09:30' },
    { period: 2, name: 'زنگ دوم', time: '۰۹:۴۵ الی ۱۱:۱۵', start: '09:45', end: '11:15' },
    { period: 3, name: 'زنگ سوم', time: '۱۱:۳۰ الی ۱۳:۰۰', start: '11:30', end: '13:00' },
    { period: 4, name: 'زنگ چهارم', time: '۱۳:۰۰ الی ۱۴:۳۰', start: '13:00', end: '14:30' },
  ];

  return (
    <div className="space-y-6 text-right font-sans">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-800 to-blue-700 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-md font-mono">
              کد دانش‌آموزی: {user?.studentId || user?.nationalId || '901001'}
            </span>
            <span className="text-xs text-indigo-200">نیم‌سال تحصیلی ۱۴۰۴-۱۴۰۵</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold">
            سلام، {user?.fullName} عزیز؛ به سامانه مدرسه نمونه دولتی شهید منانی خوش آمدید
          </h1>
          <p className="text-xs text-indigo-100">
            پایه {user?.gradeLevel || 'نهم'} · کارنامه رسمی نوبت اول، آزمون‌های پیش‌رو و نمودارهای رشد تحصیلی
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onTabChange('upcoming_exams')}
            className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-950/60 hover:bg-indigo-950/80 border border-white/20 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>آزمون‌های پیش‌رو ({toPersianDigits(assessments.length)})</span>
          </button>
          <button
            onClick={() => onTabChange('grades')}
            className="px-4 py-2.5 text-xs font-bold text-indigo-900 bg-white hover:bg-indigo-50 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 flex items-center gap-2"
          >
            <Award className="w-4 h-4 text-indigo-600" />
            <span>مشاهده کارنامه رسمی</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip matching Report Card */}
      {reportCard && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">معدل کل شما</span>
            <span className="text-xl font-bold text-blue-700 dark:text-blue-400 font-mono tabular-nums mt-1 block">
              {toPersianDigits(formatScore(reportCard.overallGpa))} <span className="text-xs text-slate-400 font-sans">از ۲۰</span>
            </span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">رتبه در کلاس</span>
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums mt-1 block">
              #{toPersianDigits(reportCard.overallClassRank)} <span className="text-xs text-slate-400 font-sans">از {toPersianDigits(reportCard.classTotalStudents)} نفر</span>
            </span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">رتبه در پایه تحصیلی</span>
            <span className="text-xl font-bold text-purple-700 dark:text-purple-400 font-mono tabular-nums mt-1 block">
              #{toPersianDigits(reportCard.overallGradeRank)} <span className="text-xs text-slate-400 font-sans">از {toPersianDigits(reportCard.gradeTotalStudents)} نفر</span>
            </span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">وضعیت عملکرد تحصیلی</span>
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400 mt-2 block">
              {reportCard.overallStatus}
            </span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Prominent Upcoming Exams Card on Overview */}
          <div className="lg:col-span-12 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    آزمون‌های پیش‌رو و برنامه‌ریزی امتحانات (تعریف‌شده توسط دبیران و معاونت)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    برای آمادگی در امتحانات و کوئیزهای کلاسی تاریخ‌ها و سرفصل‌های اعلام‌شده را بررسی فرمایید.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onTabChange('upcoming_exams')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer flex items-center gap-1"
              >
                <span>مشاهده کلیه آزمون‌ها</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {assessments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                در حال حاضر آزمون یا ارزیابی جدیدی تعریف نشده است.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {assessments.slice(0, 3).map(ass => {
                  const countdown = getExamCountdown(ass.assessmentDate);
                  return (
                    <div
                      key={ass.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white truncate">{ass.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${countdown.color}`}>
                          {countdown.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>نوع: {getAssessmentTypeLabel(ass.type)}</span>
                        <span className="font-bold text-indigo-700 dark:text-indigo-300">سقف: {toPersianDigits(ass.maxScore)} نمره</span>
                      </div>

                      {ass.description && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                          {ass.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
                        <span>تاریخ برگزاری: {formatPersianDate(ass.assessmentDate)}</span>
                        <span>{ass.className || 'کلاس شما'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Published Grades */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>آخرین نمرات رسمی و بازخورد دبیران</span>
              </h3>
              <button
                onClick={() => onTabChange('grades')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                مشاهده کارنامه کامل
              </button>
            </div>

            {grades.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                هنوز نمره رسمی برای شما منتشر نشده است.
              </div>
            ) : (
              <div className="space-y-3">
                {grades.slice(0, 3).map(g => (
                  <div key={g.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{g.assessmentTitle}</span>
                      <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-400 font-mono tabular-nums">
                        {toPersianDigits(g.score)} / {toPersianDigits(g.maxScore)}
                      </span>
                    </div>
                    {g.comments && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700 leading-relaxed">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">نظر استاد: </span>
                        {g.comments}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Counselor Availability Card */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-500" />
                <span>حضور مشاوران تحصیلی در مدرسه</span>
              </h3>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">پاسخگو</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              ساعات حضور و جلسات انفرادی در دفتر مشاوره دبیرستان شهید منانی:
            </p>

            <div className="space-y-2">
              {availabilities.map(av => (
                <div key={av.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{getWeekdayName(av.dayOfWeek)}</span>
                  <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">{toPersianDigits(av.startTime)} الی {toPersianDigits(av.endTime)}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setBookingModalOpen(true);
                onTabChange('counseling');
              }}
              className="w-full py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
            >
              ثبت درخواست مشاوره و پیام به مشاور
            </button>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: UPCOMING EXAMS (آزمون‌های پیش‌رو) */}
      {/* ======================================================== */}
      {activeTab === 'upcoming_exams' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-indigo-700 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-300 font-bold px-2.5 py-0.5 rounded-md">
                  تقویم و برنامه امتحانات
                </span>
                <span className="text-xs text-slate-400">
                  {toPersianDigits(assessments.length)} ارزیابی ثبت‌شده
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                آزمون‌های پیش‌رو و ارزیابی‌های اعلام‌شده توسط اساتید و کادر آموزشی
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                کلیه کوئیزها، آزمون‌های میان‌ترم، پایانی و ارزیابی‌های هماهنگ دوره اول متوسطه شهید منانی
              </p>
            </div>
          </div>

          {assessments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">در حال حاضر آزمون یا امتحانی برای شما ثبت نشده است.</p>
              <p className="text-xs">به محض ثبت هرگونه آزمونک، کوئیز یا ارزیابی توسط دبیران یا معاونت، اطلاعات آن در این صفحه درج خواهد شد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessments.map(ass => {
                const countdown = getExamCountdown(ass.assessmentDate);
                return (
                  <div
                    key={ass.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                          {getAssessmentTypeLabel(ass.type)}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${countdown.color}`}>
                          {countdown.label}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {ass.title}
                      </h3>

                      <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-3">
                        <span>کلاس: <strong>{ass.className || 'پایه نهم'}</strong></span>
                        <span>سقف نمره: <strong className="font-mono text-indigo-700 dark:text-indigo-300">{toPersianDigits(ass.maxScore)}</strong></span>
                      </div>

                      {ass.description ? (
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 space-y-1">
                          <span className="font-bold text-slate-900 dark:text-white block">سرفصل‌ها و توضیحات دبیر:</span>
                          <p className="leading-relaxed text-justify">{ass.description}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">سرفصل و مباحث به‌زودی اعلام می‌شود.</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <span>تاریخ: {formatPersianDate(ass.assessmentDate)}</span>
                      <span className="font-sans text-indigo-600 dark:text-indigo-400 font-bold">برنامه رسمی مدرسه</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: WEEKLY SCHEDULE (برنامه هفتگی - شنبه تا چهارشنبه، ۴ زنگ) */}
      {/* ======================================================== */}
      {activeTab === 'schedule' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                برنامه هفتگی کلاس‌های شما (شنبه تا چهارشنبه)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تعریف ۴ زنگ کلاسی در روز (هر زنگ ۱.۵ ساعت) با تفکیک زنگ‌های آموزشی و زنگ‌های آزاد
              </p>
            </div>
            <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-lg font-bold">
              دبیرستان نمونه دولتی شهید منانی
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
                    <span className="text-[10px] text-slate-400">۴ زنگ کلاسی</span>
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
                          <div className="text-slate-400 text-[10px] italic">زنگ آزاد / مطالعه</div>
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
      {/* TAB 4: GRADES & REPORT CARD / GROWTH */}
      {/* ======================================================== */}
      {(activeTab === 'grades' || activeTab === 'growth') && (
        <ReportCardView card={reportCard} isLoading={isReportCardLoading} />
      )}

      {/* ======================================================== */}
      {/* TAB 5: COUNSELING & COMMUNICATION */}
      {/* ======================================================== */}
      {activeTab === 'counseling' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Requests & Inquiries List */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">درخواست‌های مشاوره شما</h3>
              <button
                onClick={() => setBookingModalOpen(true)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                + درخواست جدید
              </button>
            </div>

            {counselingRequests.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                هنوز درخواست مشاوره‌ای ثبت نکرده‌اید.
              </div>
            ) : (
              <div className="space-y-2">
                {counselingRequests.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRequest(r)}
                    className={`w-full p-3 rounded-xl border text-right transition-all cursor-pointer block ${
                      selectedRequest?.id === r.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold">{r.category === 'exam_prep' ? 'کنکور و آزمون' : 'هدایت تحصیلی'}</span>
                      <span className="text-slate-500 dark:text-slate-400">{formatPersianDate(r.createdAt)}</span>
                    </div>
                    <h4 className="text-xs font-bold truncate text-slate-900 dark:text-white">{r.subject}</h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                      <span>مشاور: {r.counselorName || 'دکتر ساداتی'}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {r.status === 'in_progress' ? 'در حال گفتگو' : r.status === 'pending' ? 'در انتظار بررسی' : 'پاسخ داده شد'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Conversation Thread */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[420px]">
            {selectedRequest ? (
              <>
                <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedRequest.subject}</h3>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{selectedRequest.counselorName}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    زمان پیشنهادی: {selectedRequest.preferredTime || 'هماهنگی از طریق چت'}
                  </p>
                </div>

                {/* Messages Body */}
                <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-80">
                  {requestMessages.map(m => {
                    const isMe = m.senderRole === 'student';
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs'
                          }`}
                        >
                          <div className={`text-[10px] ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {m.senderName || (isMe ? 'شما' : 'مشاور')} · {formatPersianDateTime(m.sentAt)}
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input box */}
                <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="پیام خود را بنویسید..."
                    value={newMessageText}
                    onChange={e => setNewMessageText(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="submit"
                    className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                <p className="text-xs">یک درخواست مشاوره را از لیست انتخاب نمایید یا درخواست جدیدی ثبت کنید.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: SURVEYS & FEEDBACK */}
      {/* ======================================================== */}
      {activeTab === 'surveys' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">نظرسنجی‌ها و فرم‌های ارزیابی آموزشی</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              دیدگاه‌های شما بدون نام یا شناسایی هویتی به منظور ارتقای کیفیت کلاس‌ها بررسی می‌گردد.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surveys.map(srv => (
              <div key={srv.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                      {srv.isAnonymous ? 'ارزیابی ناشناس (حریم محفوظ)' : 'نظرسنجی عمومی'}
                    </span>
                    <span className="text-slate-400">تا {formatPersianDate(srv.endDate)}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{srv.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{srv.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                  {srv.userHasResponded ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>پاسخ شما ثبت شده است</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveSurvey(srv)}
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
                    >
                      شرکت در نظرسنجی
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: ANNOUNCEMENTS */}
      {/* ======================================================== */}
      {activeTab === 'announcements' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">اطلاعیه‌ها و پیام‌های رسمی دبیرستان شهید منانی</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">پیام‌های رسمی معاونت آموزشی و مدیریت مدرسه</p>
          </div>

          <div className="space-y-3">
            {announcements.map(ann => (
              <div key={ann.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{ann.title}</h3>
                  <span className="text-xs text-slate-400">{formatPersianDate(ann.publishedAt)}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Consultation Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 text-right space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">درخواست وقت مشاوره با دکتر ساداتی</h3>
              <button onClick={() => setBookingModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">✕</button>
            </div>

            {bookingSuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/70 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                {bookingSuccess}
              </div>
            ) : (
              <form onSubmit={handleCreateRequest} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">موضوع مشاوره</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: افت تراز در آزمون آزمایشی فیزیک"
                    value={bookingSubject}
                    onChange={e => setBookingSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">دسته‌بندی</label>
                    <select
                      value={bookingCategory}
                      onChange={e => setBookingCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 [&>option]:bg-white dark:[&>option]:bg-slate-800 [&>option]:text-slate-900 dark:[&>option]:text-slate-100"
                    >
                      <option value="academic">درسی و آموزشی</option>
                      <option value="exam_prep">کنکور و آزمون‌های آزمایشی</option>
                      <option value="personal">انگیزشی و کاهش استرس</option>
                      <option value="career">انتخاب رشته و آینده شغلی</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">زمان یا روز پیشنهادی</label>
                    <input
                      type="text"
                      placeholder="مثال: دوشنبه ساعت ۱۱:۰۰"
                      value={bookingTime}
                      onChange={e => setBookingTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">توضیحات اولیه برای مشاور</label>
                  <textarea
                    rows={3}
                    placeholder="شرح مختصری از چالش یا موضوع مورد نظرتان بنویسید..."
                    value={bookingMessage}
                    onChange={e => setBookingMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
                >
                  ثبت و ارجاع به مشاور
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Survey Answering Modal */}
      {activeSurvey && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 text-right space-y-4 shadow-xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeSurvey.title}</h3>
              <button onClick={() => setActiveSurvey(null)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">✕</button>
            </div>

            {surveySuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/70 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                {surveySuccess}
              </div>
            ) : (
              <form onSubmit={handleSubmitSurvey} className="space-y-4">
                {(activeSurvey.questions || []).map((q, idx) => (
                  <div key={q.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      {toPersianDigits(idx + 1)}. {q.questionText}
                    </label>

                    {q.questionType === 'multiple_choice' && (
                      <div className="space-y-1.5 pt-1">
                        {(q.options || []).map(opt => (
                          <label key={opt} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="radio"
                              name={`q_${q.id}`}
                              required={q.isRequired}
                              checked={surveyAnswers[q.id] === opt}
                              onChange={() => setSurveyAnswers({ ...surveyAnswers, [q.id]: opt })}
                              className="text-indigo-600"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {q.questionType === 'rating' && (
                      <div className="flex items-center gap-4 pt-1">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <label key={rating} className="flex items-center gap-1 text-xs cursor-pointer text-slate-700 dark:text-slate-300">
                            <input
                              type="radio"
                              name={`q_${q.id}`}
                              required={q.isRequired}
                              checked={surveyAnswers[q.id] === rating}
                              onChange={() => setSurveyAnswers({ ...surveyAnswers, [q.id]: rating })}
                              className="text-indigo-600"
                            />
                            <span>{toPersianDigits(rating)} ستاره</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {q.questionType === 'text' && (
                      <textarea
                        rows={2}
                        value={surveyAnswers[q.id] || ''}
                        onChange={e => setSurveyAnswers({ ...surveyAnswers, [q.id]: e.target.value })}
                        placeholder="نظر یا پیشنهاد شما..."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
                >
                  ثبت نهایی پاسخ‌ها
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
