import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { OnlineExam, ExamQuestion, Course, ClassGroup, QuestionType, GradeLevel } from '../../types';
import { formatPersianDate, toPersianDigits, formatScore } from '../../utils/persianDate';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Eye,
  Trash2,
  Edit3,
  BookOpen,
  GraduationCap,
  Layers,
  Award,
  ChevronLeft,
  X,
  Check,
  FileText,
  Printer,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';

interface OnlineExamsManagementViewProps {
  userRole?: 'super_admin' | 'manager' | 'teacher';
}

export const OnlineExamsManagementView: React.FC<OnlineExamsManagementViewProps> = ({ userRole }) => {
  const { user, apiFetch } = useAuth();
  const currentRole = userRole || user?.role || 'manager';

  // Data State
  const [exams, setExams] = useState<OnlineExam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');

  // Exam Modal State (Create / Edit)
  const [examModalOpen, setExamModalOpen] = useState<boolean>(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examTitle, setExamTitle] = useState<string>('');
  const [examCourseId, setExamCourseId] = useState<string>('');
  const [examGradeLevel, setExamGradeLevel] = useState<GradeLevel>('هفتم');
  const [examClassIds, setExamClassIds] = useState<string[]>([]);
  const [examDate, setExamDate] = useState<string>('');
  const [examStartTime, setExamStartTime] = useState<string>('09:00');
  const [examEndTime, setExamEndTime] = useState<string>('10:30');
  const [examDuration, setExamDuration] = useState<number>(60);
  const [examTotalScore, setExamTotalScore] = useState<number>(20);
  const [examPassingScore, setExamPassingScore] = useState<number>(10);
  const [examInstructions, setExamInstructions] = useState<string>('');
  const [examStatus, setExamStatus] = useState<'draft' | 'published' | 'ongoing' | 'closed' | 'archived'>('draft');

  // Question Builder Modal State
  const [builderModalOpen, setBuilderModalOpen] = useState<boolean>(false);
  const [activeExamForBuilder, setActiveExamForBuilder] = useState<OnlineExam | null>(null);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [builderLoading, setBuilderLoading] = useState<boolean>(false);

  // Question Form State (inside Question Builder)
  const [questionModalOpen, setQuestionModalOpen] = useState<boolean>(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qType, setQType] = useState<QuestionType>('multiple_choice');
  const [qStatement, setQStatement] = useState<string>('');
  const [qOption1, setQOption1] = useState<string>('');
  const [qOption2, setQOption2] = useState<string>('');
  const [qOption3, setQOption3] = useState<string>('');
  const [qOption4, setQOption4] = useState<string>('');
  const [qCorrectAnswer, setQCorrectAnswer] = useState<number>(1);
  const [qDescriptiveAnswer, setQDescriptiveAnswer] = useState<string>('');
  const [qScore, setQScore] = useState<number>(2);
  const [qExplanation, setQExplanation] = useState<string>('');

  // Student Paper Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [previewExam, setPreviewExam] = useState<OnlineExam | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<ExamQuestion[]>([]);

  // Load initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedExams, fetchedCourses, fetchedClasses] = await Promise.all([
        apiFetch('/api/exams'),
        apiFetch('/api/courses').catch(() => []),
        apiFetch('/api/classes').catch(() => []),
      ]);
      setExams(fetchedExams || []);
      setCourses(fetchedCourses || []);
      setClasses(fetchedClasses || []);
    } catch (err: any) {
      console.error('Error fetching exams data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiFetch]);

  // Filtered exams list
  const filteredExams = useMemo(() => {
    return exams.filter(ex => {
      const courseTitle = ex.courseName || ex.courseTitle || '';
      const creatorName = ex.creatorName || ex.authorName || '';
      const matchesSearch =
        ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creatorName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ex.status === statusFilter;
      const matchesGrade = gradeFilter === 'all' || ex.gradeLevel === gradeFilter;
      return matchesSearch && matchesStatus && matchesGrade;
    });
  }, [exams, searchQuery, statusFilter, gradeFilter]);

  // Open Exam Create Modal
  const handleOpenCreateExam = () => {
    setEditingExamId(null);
    setExamTitle('');
    setExamCourseId(courses[0]?.id || '');
    setExamGradeLevel((courses[0]?.gradeLevel as GradeLevel) || 'هفتم');
    setExamClassIds(classes.filter(c => c.gradeLevel === (courses[0]?.gradeLevel || 'هفتم')).map(c => c.id));
    
    // Default date is today formatted in Shamsi
    const now = new Date();
    const todayFormatted = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
    setExamDate(todayFormatted);
    setExamStartTime('08:30');
    setExamEndTime('10:00');
    setExamDuration(60);
    setExamTotalScore(20);
    setExamPassingScore(10);
    setExamInstructions('پاسخگویی به تمام سوالات الزامی است. استفاده از هرگونه جزوه یا ماشین‌حساب ممنوع است.');
    setExamStatus('draft');
    setExamModalOpen(true);
  };

  // Open Exam Edit Modal
  const handleOpenEditExam = (exam: OnlineExam) => {
    setEditingExamId(exam.id);
    setExamTitle(exam.title);
    setExamCourseId(exam.courseId);
    setExamGradeLevel(exam.gradeLevel);
    setExamClassIds(exam.classIds || []);
    setExamDate(exam.startDate.split(' ')[0] || '');
    setExamStartTime(exam.startDate.split(' ')[1] || '08:30');
    setExamEndTime(exam.endDate.split(' ')[1] || '10:00');
    setExamDuration(exam.durationMinutes);
    setExamTotalScore(exam.totalScore);
    setExamPassingScore(exam.passingScore ?? 10);
    setExamInstructions(exam.instructions || exam.description || '');
    setExamStatus((exam.status as any) || 'draft');
    setExamModalOpen(true);
  };

  // Save Exam (Create or Update)
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || !examCourseId) {
      alert('لطفاً عنوان آزمون و درس مربوطه را انتخاب کنید.');
      return;
    }

    const payload = {
      title: examTitle.trim(),
      courseId: examCourseId,
      gradeLevel: examGradeLevel,
      classIds: examClassIds,
      startDate: `${examDate} ${examStartTime}`,
      endDate: `${examDate} ${examEndTime}`,
      durationMinutes: Number(examDuration),
      totalScore: Number(examTotalScore),
      passingScore: Number(examPassingScore),
      instructions: examInstructions.trim(),
      status: examStatus,
    };

    try {
      if (editingExamId) {
        const updated = await apiFetch(`/api/exams/${editingExamId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setExams(prev => prev.map(ex => (ex.id === editingExamId ? updated : ex)));
        setFeedback(`آزمون «${updated.title}» با موفقیت به‌روزرسانی شد.`);
      } else {
        const created = await apiFetch('/api/exams', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setExams(prev => [created, ...prev]);
        setFeedback(`آزمون «${created.title}» با موفقیت ایجاد گردید.`);
      }
      setExamModalOpen(false);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      alert(err.message || 'خطا در ثبت آزمون');
    }
  };

  // Delete Exam
  const handleDeleteExam = async (examId: string, title: string) => {
    if (!window.confirm(`آیا از حذف آزمون «${title}» و تمام سوالات مرتبط با آن اطمینان دارید؟`)) return;
    try {
      await apiFetch(`/api/exams/${examId}`, { method: 'DELETE' });
      setExams(prev => prev.filter(ex => ex.id !== examId));
      setFeedback(`آزمون «${title}» حذف گردید.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'خطا در حذف آزمون');
    }
  };

  // Quick Status Toggle (Draft <-> Published)
  const handleTogglePublish = async (exam: OnlineExam) => {
    const nextStatus = exam.status === 'published' ? 'draft' : 'published';
    try {
      const updated = await apiFetch(`/api/exams/${exam.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      setExams(prev => prev.map(ex => (ex.id === exam.id ? updated : ex)));
      setFeedback(
        nextStatus === 'published'
          ? `آزمون «${exam.title}» منتشر شد و در کارتابل دانش‌آموزان قرار گرفت.`
          : `آزمون «${exam.title}» به حالت پیش‌نویس بازگردانده شد.`
      );
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'خطا در تغییر وضعیت آزمون');
    }
  };

  // Open Question Builder
  const handleOpenQuestionBuilder = async (exam: OnlineExam) => {
    setActiveExamForBuilder(exam);
    setBuilderModalOpen(true);
    setBuilderLoading(true);
    try {
      const qs = await apiFetch(`/api/exams/${exam.id}/questions`);
      setExamQuestions(qs || []);
    } catch (err: any) {
      alert(err.message || 'خطا در بارگذاری سوالات');
    } finally {
      setBuilderLoading(false);
    }
  };

  // Open Add/Edit Question Modal
  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null);
    setQType('multiple_choice');
    setQStatement('');
    setQOption1('');
    setQOption2('');
    setQOption3('');
    setQOption4('');
    setQCorrectAnswer(1);
    setQDescriptiveAnswer('');
    setQScore(2);
    setQExplanation('');
    setQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: ExamQuestion) => {
    setEditingQuestionId(q.id);
    setQType(q.type || q.questionType || 'multiple_choice');
    setQStatement(q.statement || q.prompt || q.text || '');
    if (q.options && q.options.length >= 4) {
      setQOption1(q.options[0]);
      setQOption2(q.options[1]);
      setQOption3(q.options[2]);
      setQOption4(q.options[3]);
    } else {
      setQOption1('');
      setQOption2('');
      setQOption3('');
      setQOption4('');
    }
    setQCorrectAnswer(typeof q.correctAnswer === 'number' ? q.correctAnswer : 1);
    setQDescriptiveAnswer(typeof q.correctAnswer === 'string' ? q.correctAnswer : (q.modelAnswer || ''));
    setQScore(q.score ?? q.points ?? 2);
    setQExplanation(q.explanation || '');
    setQuestionModalOpen(true);
  };

  // Save Question (Create or Edit)
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExamForBuilder) return;
    if (!qStatement.trim()) {
      alert('لطفاً صورت سوال را وارد فرمایید.');
      return;
    }

    let options: string[] | undefined = undefined;
    let correctAnswer: any = undefined;

    if (qType === 'multiple_choice') {
      if (!qOption1.trim() || !qOption2.trim() || !qOption3.trim() || !qOption4.trim()) {
        alert('لطفاً هر ۴ گزینه تستی را تکمیل کنید.');
        return;
      }
      options = [qOption1.trim(), qOption2.trim(), qOption3.trim(), qOption4.trim()];
      correctAnswer = Number(qCorrectAnswer);
    } else {
      correctAnswer = qDescriptiveAnswer.trim();
    }

    const payload = {
      type: qType,
      statement: qStatement.trim(),
      options,
      correctAnswer,
      score: Number(qScore),
      explanation: qExplanation.trim(),
    };

    try {
      if (editingQuestionId) {
        const updated = await apiFetch(`/api/exams/questions/${editingQuestionId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setExamQuestions(prev => prev.map(q => (q.id === editingQuestionId ? updated : q)));
      } else {
        const created = await apiFetch(`/api/exams/${activeExamForBuilder.id}/questions`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setExamQuestions(prev => [...prev, created]);
      }
      setQuestionModalOpen(false);

      // Refresh parent exam in list to update questionCount
      const refreshedExams = await apiFetch('/api/exams');
      setExams(refreshedExams || []);
    } catch (err: any) {
      alert(err.message || 'خطا در ثبت سوال');
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('آیا از حذف این سوال اطمینان دارید؟')) return;
    try {
      await apiFetch(`/api/exams/questions/${questionId}`, { method: 'DELETE' });
      setExamQuestions(prev => prev.filter(q => q.id !== questionId));
      const refreshedExams = await apiFetch('/api/exams');
      setExams(refreshedExams || []);
    } catch (err: any) {
      alert(err.message || 'خطا در حذف سوال');
    }
  };

  // Open Student Exam Paper Preview
  const handleOpenPreview = async (exam: OnlineExam) => {
    setPreviewExam(exam);
    setPreviewModalOpen(true);
    try {
      const qs = await apiFetch(`/api/exams/${exam.id}/questions`);
      setPreviewQuestions(qs || []);
    } catch (err) {
      setPreviewQuestions([]);
    }
  };

  // Calculate sum of question points in builder
  const currentTotalQuestionsScore = useMemo(() => {
    return examQuestions.reduce((acc, q) => acc + (q.score || 0), 0);
  }, [examQuestions]);

  const scoreDifference = activeExamForBuilder
    ? activeExamForBuilder.totalScore - currentTotalQuestionsScore
    : 0;

  return (
    <div className="space-y-6 text-right font-sans">
      {/* Header & Top Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-700 bg-indigo-50 font-bold px-2.5 py-0.5 rounded-md">
              سامانه یکپارچه سنجش و آزمون
            </span>
            <span className="text-xs text-slate-500">مدرسه نمونه دولتی شهید منانی</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            <span>بانک سوالات و مدیریت آزمون‌های آنلاین</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            تعریف آزمون‌های تستی و تشریحی، تعیین زمان و بارم‌بندی، طراح هوشمند سوالات و چاپ برگه امتحانی
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateExam}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>تعریف آزمون جدید</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">کل آزمون‌های تعریف‌شده</span>
          <span className="text-xl font-bold text-slate-900 font-mono tabular-nums block mt-1">
            {toPersianDigits(exams.length)} <span className="text-xs text-slate-400 font-sans">آزمون</span>
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">آزمون‌های منتشر شده (فعال)</span>
          <span className="text-xl font-bold text-emerald-600 font-mono tabular-nums block mt-1">
            {toPersianDigits(exams.filter(e => e.status === 'published' || e.status === 'ongoing').length)}{' '}
            <span className="text-xs text-slate-400 font-sans">مورد</span>
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">پیش‌نویس‌ها در حال طراحی</span>
          <span className="text-xl font-bold text-amber-600 font-mono tabular-nums block mt-1">
            {toPersianDigits(exams.filter(e => e.status === 'draft').length)}{' '}
            <span className="text-xs text-slate-400 font-sans">پیش‌نویس</span>
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">مجموع سوالات بانک آزمون</span>
          <span className="text-xl font-bold text-indigo-600 font-mono tabular-nums block mt-1">
            {toPersianDigits(exams.reduce((acc, e) => acc + (e.questionCount || 0), 0))}{' '}
            <span className="text-xs text-slate-400 font-sans">سوال</span>
          </span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو در عنوان آزمون، نام درس یا دبیر..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Grade filter */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-[11px] text-slate-500 px-2 font-medium">پایه:</span>
            {['all', 'هفتم', 'هشتم', 'نهم'].map(g => (
              <button
                key={g}
                onClick={() => setGradeFilter(g)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  gradeFilter === g
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {g === 'all' ? 'همه' : g}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="draft">پیش‌نویس</option>
            <option value="published">منتشر شده</option>
            <option value="ongoing">در حال برگزاری</option>
            <option value="closed">خاتمه یافته</option>
          </select>
        </div>
      </div>

      {/* Exams Cards Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          در حال دریافت اطلاعات آزمون‌ها...
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">هیچ آزمونی با معیارهای انتخابی یافت نشد</p>
          <p className="text-xs text-slate-500">می‌توانید با زدن دکمه «تعریف آزمون جدید» اولین آزمون را ایجاد کنید.</p>
          <button
            onClick={handleOpenCreateExam}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
          >
            ایجاد آزمون جدید
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map(exam => {
            const isPublished = exam.status === 'published' || exam.status === 'ongoing';
            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-3">
                  {/* Top tags */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        exam.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : exam.status === 'ongoing'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                          : exam.status === 'closed'
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {exam.status === 'published'
                        ? 'منتشر شده'
                        : exam.status === 'ongoing'
                        ? 'در حال برگزاری'
                        : exam.status === 'closed'
                        ? 'خاتمه یافته'
                        : 'پیش‌نویس'}
                    </span>

                    <span className="text-xs font-bold text-slate-500">پایه {exam.gradeLevel}</span>
                  </div>

                  {/* Title & Course */}
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-1">
                      {exam.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold mt-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{exam.courseName}</span>
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{toPersianDigits(exam.startDate.split(' ')[0])}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{toPersianDigits(exam.durationMinutes)} دقیقه</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>بارم: {toPersianDigits(exam.totalScore)} نمره</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>{toPersianDigits(exam.questionCount || 0)} سوال</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>طراح: {exam.creatorName}</span>
                    <span>حد نصاب: {toPersianDigits(exam.passingScore)}</span>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    {/* Question Builder Button */}
                    <button
                      onClick={() => handleOpenQuestionBuilder(exam)}
                      className="px-2.5 py-1.5 font-bold text-indigo-700 bg-indigo-100/70 hover:bg-indigo-100 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      title="مدیریت سوالات آزمون"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>طراحی سوالات ({toPersianDigits(exam.questionCount || 0)})</span>
                    </button>

                    {/* Preview Button */}
                    <button
                      onClick={() => handleOpenPreview(exam)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg cursor-pointer"
                      title="پیش‌نمایش برگه امتحانی"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Toggle publish button */}
                    <button
                      onClick={() => handleTogglePublish(exam)}
                      className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                        isPublished
                          ? 'text-emerald-700 hover:bg-emerald-100/60'
                          : 'text-slate-500 hover:bg-slate-200/60'
                      }`}
                      title={isPublished ? 'تغییر به پیش‌نویس' : 'انتشار برای دانش‌آموزان'}
                    >
                      {isPublished ? <Check className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    {/* Edit Exam */}
                    <button
                      onClick={() => handleOpenEditExam(exam)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg cursor-pointer"
                      title="ویرایش مشخصات آزمون"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Exam */}
                    <button
                      onClick={() => handleDeleteExam(exam.id, exam.title)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="حذف آزمون"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: CREATE / EDIT EXAM META */}
      {/* ======================================================== */}
      {examModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 text-right shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {editingExamId ? 'ویرایش مشخصات آزمون' : 'تعریف آزمون آنلاین جدید'}
                  </h3>
                  <p className="text-[11px] text-slate-400">تنظیم زمان‌بندی، درس و کلاس‌های هدف</p>
                </div>
              </div>
              <button
                onClick={() => setExamModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان آزمون:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: آزمون میان‌ترم دوم درس ریاضیات"
                  value={examTitle}
                  onChange={e => setExamTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">درس مربوطه:</label>
                  <select
                    value={examCourseId}
                    onChange={e => {
                      setExamCourseId(e.target.value);
                      const matched = courses.find(c => c.id === e.target.value);
                      if (matched) {
                        setExamGradeLevel(matched.gradeLevel as GradeLevel);
                        setExamClassIds(classes.filter(c => c.gradeLevel === matched.gradeLevel).map(c => c.id));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title || (c as any).name} (پایه {c.gradeLevel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">پایه تحصیلی:</label>
                  <select
                    value={examGradeLevel}
                    onChange={e => {
                      const g = e.target.value as GradeLevel;
                      setExamGradeLevel(g);
                      setExamClassIds(classes.filter(c => c.gradeLevel === g).map(c => c.id));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="هفتم">پایه هفتم</option>
                    <option value="هشتم">پایه هشتم</option>
                    <option value="نهم">پایه نهم</option>
                  </select>
                </div>
              </div>

              {/* Class selection checkboxes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">کلاس‌های هدف:</label>
                <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  {classes
                    .filter(c => c.gradeLevel === examGradeLevel)
                    .map(cls => {
                      const isSelected = examClassIds.includes(cls.id);
                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setExamClassIds(prev => prev.filter(id => id !== cls.id));
                            } else {
                              setExamClassIds(prev => [...prev, cls.id]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {cls.name}
                        </button>
                      );
                    })}
                  {classes.filter(c => c.gradeLevel === examGradeLevel).length === 0 && (
                    <span className="text-slate-400 text-xs">کلاسی برای این پایه تعریف نشده است.</span>
                  )}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاریخ آزمون:</label>
                  <input
                    type="text"
                    required
                    placeholder="۱۴۰۴/۰۸/۲۵"
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ساعت شروع:</label>
                  <input
                    type="text"
                    required
                    placeholder="08:30"
                    value={examStartTime}
                    onChange={e => setExamStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مدت آزمون (دقیقه):</label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={examDuration}
                    onChange={e => setExamDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-center"
                  />
                </div>
              </div>

              {/* Scores & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نمره کل آزمون:</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={examTotalScore}
                    onChange={e => setExamTotalScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">حد نصاب قبولی:</label>
                  <input
                    type="number"
                    min={1}
                    max={examTotalScore}
                    value={examPassingScore}
                    onChange={e => setExamPassingScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وضعیت انتشار:</label>
                  <select
                    value={examStatus}
                    onChange={e => setExamStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="draft">پیش‌نویس</option>
                    <option value="published">منتشر شده (فعال)</option>
                    <option value="closed">خاتمه یافته</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">توضیحات و راهنمای شرکت در آزمون:</label>
                <textarea
                  rows={2}
                  value={examInstructions}
                  onChange={e => setExamInstructions(e.target.value)}
                  placeholder="دستورالعمل آزمون برای نمایش به دانش‌آموزان..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setExamModalOpen(false)}
                  className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  {editingExamId ? 'ذخیره تغییرات آزمون' : 'ایجاد آزمون و ورود به طراح سوالات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: QUESTION BUILDER (طراح سوالات آزمون) */}
      {/* ======================================================== */}
      {builderModalOpen && activeExamForBuilder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 text-right shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Builder Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      طراح و بانک سوالات: {activeExamForBuilder.title}
                    </h2>
                    <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md border border-indigo-200">
                      {activeExamForBuilder.courseName} · پایه {activeExamForBuilder.gradeLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    طراحی سوالات تستی (۴ گزینه‌ای) و تشریحی همراه با بارم‌بندی و کلید پاسخ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenPreview(activeExamForBuilder)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-slate-600" />
                  <span>پیش‌نمایش برگه امتحانی</span>
                </button>
                <button
                  onClick={() => setBuilderModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Score reconciliation status bar */}
            <div className="py-3 px-4 my-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-700">وضعیت بارم‌بندی آزمون:</span>
                <span className="font-mono text-sm font-extrabold text-indigo-700">
                  {toPersianDigits(currentTotalQuestionsScore)} / {toPersianDigits(activeExamForBuilder.totalScore)} نمره
                </span>
                {scoreDifference === 0 ? (
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>بارم‌بندی دقیقاً منطبق است</span>
                  </span>
                ) : scoreDifference > 0 ? (
                  <span className="text-[11px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{toPersianDigits(scoreDifference)} نمره تا تکمیل نمره کل باقی مانده</span>
                  </span>
                ) : (
                  <span className="text-[11px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>مجموع سوالات {toPersianDigits(Math.abs(scoreDifference))} نمره بیشتر از سقف کل است</span>
                  </span>
                )}
              </div>

              <button
                onClick={handleOpenAddQuestion}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن سوال جدید</span>
              </button>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {builderLoading ? (
                <div className="p-12 text-center text-xs text-slate-500">در حال بارگذاری سوالات...</div>
              ) : examQuestions.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                  <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">هنوز سوالی برای این آزمون ثبت نشده است</p>
                  <p className="text-xs text-slate-400">با کلیک بر روی «افزودن سوال جدید» اولین سوال تستی یا تشریحی را طراحی فرمایید.</p>
                  <button
                    onClick={handleOpenAddQuestion}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
                  >
                    افزودن سوال اول
                  </button>
                </div>
              ) : (
                examQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-200 font-mono">
                          {toPersianDigits(idx + 1)}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                q.type === 'multiple_choice'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}
                            >
                              {q.type === 'multiple_choice' ? 'چهار گزینه‌ای (تستی)' : 'تشریحی'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500">
                              بارم: {toPersianDigits(q.score)} نمره
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                            {q.statement}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditQuestion(q)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="ویرایش سوال"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="حذف سوال"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* MCQ Options Display */}
                    {q.type === 'multiple_choice' && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = Number(q.correctAnswer) === optIdx + 1;
                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-white border flex items-center justify-center font-mono text-[11px]">
                                  {toPersianDigits(optIdx + 1)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isCorrect && (
                                <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-md">
                                  کلید صحیح
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Descriptive Answer Display */}
                    {q.type === 'descriptive' && q.correctAnswer && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                        <span className="font-bold text-slate-900 block text-[11px]">پاسخ کلیدی / راهنمای تصحیح:</span>
                        <p className="leading-relaxed">{String(q.correctAnswer)}</p>
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="text-[11px] text-indigo-700 bg-indigo-50/60 p-2 rounded-lg border border-indigo-100">
                        <span className="font-bold">نکته آموزشی: </span>
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                تعداد کل سوالات ثبت‌شده: {toPersianDigits(examQuestions.length)} مورد
              </span>
              <button
                onClick={() => setBuilderModalOpen(false)}
                className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                تایید و بازگشت به لیست آزمون‌ها
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADD / EDIT SINGLE QUESTION */}
      {/* ======================================================== */}
      {questionModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-right shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                {editingQuestionId ? 'ویرایش سوال' : 'طراحی سوال جدید'}
              </h3>
              <button
                onClick={() => setQuestionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              {/* Question Type Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">نوع سوال:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQType('multiple_choice')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      qType === 'multiple_choice'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>چهار گزینه‌ای (تستی)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQType('descriptive')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      qType === 'descriptive'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>تشریحی / مقاله‌ای</span>
                  </button>
                </div>
              </div>

              {/* Question Statement */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">صورت سوال:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="متن کامل سوال را اینجا وارد نمایید..."
                  value={qStatement}
                  onChange={e => setQStatement(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                ></textarea>
              </div>

              {/* MCQ Options */}
              {qType === 'multiple_choice' ? (
                <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="block font-bold text-slate-700 text-[11px]">
                    گزینه‌ها و انتخاب کلید پاسخ صحیح:
                  </span>

                  {[
                    { label: 'گزینه ۱', val: qOption1, setVal: setQOption1, num: 1 },
                    { label: 'گزینه ۲', val: qOption2, setVal: setQOption2, num: 2 },
                    { label: 'گزینه ۳', val: qOption3, setVal: setQOption3, num: 3 },
                    { label: 'گزینه ۴', val: qOption4, setVal: setQOption4, num: 4 },
                  ].map(opt => (
                    <div key={opt.num} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct_answer"
                        id={`opt_${opt.num}`}
                        checked={qCorrectAnswer === opt.num}
                        onChange={() => setQCorrectAnswer(opt.num)}
                        className="w-4 h-4 text-indigo-600 cursor-pointer"
                      />
                      <label htmlFor={`opt_${opt.num}`} className="font-bold text-slate-700 shrink-0 w-12 text-[11px]">
                        {opt.label}:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={`متن ${opt.label}...`}
                        value={opt.val}
                        onChange={e => opt.setVal(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                /* Descriptive Model Answer */
                <div>
                  <label className="block font-bold text-slate-700 mb-1">پاسخ کلیدی / راهنمای تصحیح:</label>
                  <textarea
                    rows={3}
                    placeholder="پاسخ کامل تشریحی یا نکات کلیدی برای تصحیح..."
                    value={qDescriptiveAnswer}
                    onChange={e => setQDescriptiveAnswer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  ></textarea>
                </div>
              )}

              {/* Score & Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">بارم نمره سوال:</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    max="20"
                    required
                    value={qScore}
                    onChange={e => setQScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نکته آموزشی (اختیاری):</label>
                  <input
                    type="text"
                    placeholder="توضیح کوتاه بعد از آزمون..."
                    value={qExplanation}
                    onChange={e => setQExplanation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuestionModalOpen(false)}
                  className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold cursor-pointer"
                >
                  {editingQuestionId ? 'ذخیره ویرایش سوال' : 'ثبت سوال در آزمون'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: STUDENT EXAM PAPER PREVIEW (پیش‌نمایش برگه آزمون) */}
      {/* ======================================================== */}
      {previewModalOpen && previewExam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 text-right shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:rounded-none">
            
            {/* Print Header */}
            <div className="border-b-2 border-slate-800 pb-4 mb-4 text-center space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <div>
                  <span>جمهوری اسلامی ایران</span>
                  <br />
                  <span className="font-bold text-slate-900">وزارت آموزش و پرورش</span>
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    مدرسه نمونه دولتی شهید منانی
                  </h2>
                  <p className="text-xs font-bold text-indigo-700">
                    برگه رسمی سوالات آزمون آنلاین و حضوری
                  </p>
                </div>
                <div className="text-left font-mono">
                  <span>تاریخ: {toPersianDigits(previewExam.startDate.split(' ')[0])}</span>
                  <br />
                  <span>مدت: {toPersianDigits(previewExam.durationMinutes)} دقیقه</span>
                </div>
              </div>

              {/* Student identification table line */}
              <div className="grid grid-cols-4 gap-2 pt-3 text-xs border-t border-slate-200 font-semibold text-slate-700">
                <div>نام و نام خانوادگی: ........................</div>
                <div>پایه: {previewExam.gradeLevel}</div>
                <div>درس: {previewExam.courseName}</div>
                <div>نمره کل: {toPersianDigits(previewExam.totalScore)} نمره</div>
              </div>
            </div>

            {/* Instructions */}
            {previewExam.instructions && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 mb-4">
                <span className="font-bold text-slate-900">تذکرات مهم: </span>
                <span>{previewExam.instructions}</span>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-6">
              {previewQuestions.length === 0 ? (
                <div className="text-center p-8 text-xs text-slate-400">
                  هنوز سوالی برای این آزمون ثبت نشده است.
                </div>
              ) : (
                previewQuestions.map((q, idx) => (
                  <div key={q.id} className="space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="font-extrabold font-mono text-slate-900 text-sm">
                          {toPersianDigits(idx + 1)}-
                        </span>
                        <p className="font-bold text-slate-900 leading-relaxed text-sm">
                          {q.statement}
                        </p>
                      </div>
                      <span className="font-mono text-slate-500 font-bold shrink-0 text-xs">
                        ({toPersianDigits(q.score)} نمره)
                      </span>
                    </div>

                    {/* MCQ Options */}
                    {q.type === 'multiple_choice' && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className="p-2 rounded-lg border border-slate-200 flex items-center gap-2 hover:bg-slate-50"
                          >
                            <span className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center font-mono text-[10px]">
                              {toPersianDigits(optIdx + 1)}
                            </span>
                            <span className="text-slate-800 font-medium">{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Descriptive empty answer area */}
                    {q.type === 'descriptive' && (
                      <div className="pr-6 pt-1">
                        <div className="h-20 border-b border-dashed border-slate-300 w-full"></div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Bottom Actions (hidden in print) */}
            <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between print:hidden">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>چاپ برگه امتحانی (Print)</span>
              </button>

              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                بستن پیش‌نمایش
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
