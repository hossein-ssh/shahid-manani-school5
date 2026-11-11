import React, { useState } from 'react';
import { StudentReportCard, CourseReportCardItem } from '../../types';
import { toPersianDigits, formatScore } from '../../utils/persianDate';
import { MonthComparisonView } from '../common/MonthComparisonView';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Printer,
  Sparkles,
  BarChart3,
  Table as TableIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  School,
  User,
  Hash,
  BookOpen,
  Calendar,
} from 'lucide-react';

interface ReportCardViewProps {
  card: StudentReportCard | null;
  isLoading?: boolean;
}

export const ReportCardView: React.FC<ReportCardViewProps> = ({ card, isLoading }) => {
  const [viewMode, setViewMode] = useState<'both' | 'chart' | 'table' | 'comparison'>('both');
  const [hoveredCourseIdx, setHoveredCourseIdx] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-700">در حال محاسبه و پردازش کارنامه تحصیلی و رتبه‌بندی...</p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">کارنامه‌ای یافت نشد</h3>
        <p className="text-xs text-slate-500">نمرات این دوره هنوز توسط کادر آموزشی نهایی نشده است.</p>
      </div>
    );
  }

  const courses: CourseReportCardItem[] = card.courses || [];
  const maxScoreScale = 20;

  // Chart calculation parameters
  const chartWidth = 920;
  const chartHeight = 240;
  const paddingX = 60;
  const paddingY = 30;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const getX = (index: number) => {
    if (courses.length <= 1) return paddingX + innerWidth / 2;
    return paddingX + (index / (courses.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(20, val));
    return chartHeight - paddingY - (clamped / 20) * innerHeight;
  };

  // Generate SVG path for a given value key
  const makePath = (key: 'score' | 'classAverage' | 'gradeAverage') => {
    if (courses.length === 0) return '';
    return courses.reduce((acc: string, c: CourseReportCardItem, idx: number) => {
      const x = getX(idx);
      const y = getY(c[key]);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  };

  const studentPath = makePath('score');
  const classAvgPath = makePath('classAverage');
  const gradeAvgPath = makePath('gradeAverage');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-right font-sans">
      
      {/* Top Banner & Official Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-md">
              مدرسه نمونه دولتی شهید منانی
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              سال تحصیلی ۱۴۰۴-۱۴۰۵ · دوره اول متوسطه
            </span>
          </div>
          <h1 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>کارنامه تحصیلی {card.student.fullName}</span>
            <span className="text-xs font-normal text-slate-500 font-mono">({card.student.studentId || card.student.id})</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
            <span>پایه: <strong className="text-slate-800 dark:text-slate-200">{card.gradeLevel}</strong></span>
            <span>·</span>
            <span>کلاس: <strong className="text-slate-800 dark:text-slate-200">{card.className}</strong></span>
            <span>·</span>
            <span>کد ملی: <strong className="text-slate-800 dark:text-slate-200 font-mono">{toPersianDigits(card.student.nationalId || '۲۰۸۰۱۵۴۸۹۱')}</strong></span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto justify-end no-print">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setViewMode('both')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'both' ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              نمای کامل
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'chart' ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>نمودار تحلیلی</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>جدول کارنامه</span>
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'comparison' ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>مقایسه با ماه قبل</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="چاپ کارنامه یا ذخیره به صورت PDF"
          >
            <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>نسخه چاپی / PDF کارنامه</span>
          </button>
        </div>
      </div>

      {viewMode === 'comparison' && (
        <MonthComparisonView studentId={card.student.id} />
      )}

      {/* ======================================================== */}
      {/* SECTION 1: 4 TOP KPI CARDS (Matching Screenshot 2) */}
      {/* ======================================================== */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span>اطلاعات دانش‌آموز</span>
          <span className="text-xs text-slate-400 font-normal">(شاخص‌های کلیدی عملکرد)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: معدل کل (Blue Accent) */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-blue-900">
              <span className="font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600" />
                <span>معدل کل</span>
              </span>
              <span className="text-[11px] text-blue-600 font-medium">از ۱۰ درس</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-blue-700 font-mono tabular-nums">
                {toPersianDigits(formatScore(card.overallGpa))}
              </span>
              <span className="text-xs text-blue-500 font-mono">از ۲۰</span>
            </div>
          </div>

          {/* Card 2: رتبه در کلاس (Green Accent) */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-emerald-900">
              <span className="font-bold flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-emerald-600" />
                <span>رتبه در کلاس</span>
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">از {toPersianDigits(card.classTotalStudents)} نفر</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-emerald-700 font-mono tabular-nums">
                #{toPersianDigits(card.overallClassRank)}
              </span>
              <span className="text-xs text-emerald-600">در کلاس {card.className}</span>
            </div>
          </div>

          {/* Card 3: رتبه در پایه تحصیلی (Purple Accent) */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-purple-900">
              <span className="font-bold flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span>رتبه در پایه تحصیلی</span>
              </span>
              <span className="text-[11px] text-purple-700 font-medium">از {toPersianDigits(card.gradeTotalStudents)} دانش‌آموز</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-purple-700 font-mono tabular-nums">
                #{toPersianDigits(card.overallGradeRank)}
              </span>
              <span className="text-xs text-purple-600">{card.gradeLevel}</span>
            </div>
          </div>

          {/* Card 4: وضعیت کلی عملکرد (Amber Accent) */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-amber-900">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>وضعیت کلی</span>
              </span>
              <span className="text-[11px] text-amber-700 font-medium">عملکرد تحصیلی</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-800">
                {card.overallStatus}
              </span>
              <span className="text-xs text-amber-600 font-semibold">ارزیابی رسمی</span>
            </div>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: MULTI-LINE COMPARISON CHART (Matching Screenshot 2) */}
      {/* ======================================================== */}
      {(viewMode === 'both' || viewMode === 'chart') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">نمودار ریز نمرات</h2>
              <p className="text-xs text-slate-500 mt-0.5">مقایسه نمرات در دروس مختلف با میانگین کلاس و پایه تحصیلی</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-medium">
              دامنه نمرات: ۰ الی ۲۰
            </span>
          </div>

          {/* Legend matching Screenshot 2 */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-center gap-6 text-xs">
            {/* Green: Your Score */}
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-emerald-500 rounded-full inline-block"></span>
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block -mr-3"></span>
              <span className="font-bold text-emerald-800 mr-2">نمره شما</span>
              <span className="text-slate-400 text-[11px]">(نمرات شخصی شما در هر درس)</span>
            </div>

            {/* Blue: Class Average */}
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-blue-500 inline-block"></span>
              <span className="w-2 h-2 rounded-full border-2 border-blue-500 bg-white inline-block -mr-3"></span>
              <span className="font-bold text-blue-800 mr-2">میانگین کلاس</span>
              <span className="text-slate-400 text-[11px]">(میانگین نمرات کلاس شما)</span>
            </div>

            {/* Purple: Grade Average */}
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-purple-500 inline-block"></span>
              <span className="w-2 h-2 rounded-full border-2 border-purple-500 bg-white inline-block -mr-3"></span>
              <span className="font-bold text-purple-800 mr-2">میانگین پایه تحصیلی</span>
              <span className="text-slate-400 text-[11px]">(میانگین کل پایه تحصیلی)</span>
            </div>
          </div>

          {/* SVG Chart Frame */}
          <div className="overflow-x-auto py-2">
            <div className="min-w-[700px]">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-64 select-none">
                
                {/* Y-Axis Horizontal Gridlines & Labels */}
                {[0, 4, 8, 12, 16, 20].map(val => {
                  const y = getY(val);
                  return (
                    <g key={val}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray={val === 0 ? undefined : '4 4'}
                        strokeWidth="1"
                      />
                      <text
                        x={paddingX - 10}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[11px] font-mono fill-slate-400"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Y-Axis Title */}
                <text
                  x={15}
                  y={chartHeight / 2}
                  transform={`rotate(-90 15 ${chartHeight / 2})`}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-medium"
                >
                  نمره (۰-۲۰)
                </text>

                {/* Purple Line: Grade Average */}
                <path
                  d={gradeAvgPath}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.5"
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-90"
                />

                {/* Blue Line: Class Average */}
                <path
                  d={classAvgPath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-90"
                />

                {/* Green Line: Student Score */}
                <path
                  d={studentPath}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points and Interactivity */}
                {courses.map((c, idx) => {
                  const x = getX(idx);
                  const yStudent = getY(c.score);
                  const yClass = getY(c.classAverage);
                  const yGrade = getY(c.gradeAverage);
                  const isHovered = hoveredCourseIdx === idx;

                  return (
                    <g
                      key={c.courseId}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredCourseIdx(idx)}
                      onMouseLeave={() => setHoveredCourseIdx(null)}
                    >
                      {/* Vertical highlight line on hover */}
                      {isHovered && (
                        <line
                          x1={x}
                          y1={paddingY}
                          x2={x}
                          y2={chartHeight - paddingY}
                          stroke="#cbd5e1"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                        />
                      )}

                      {/* Purple dot (Grade Average) */}
                      <circle
                        cx={x}
                        cy={yGrade}
                        r="4"
                        fill="#a855f7"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />

                      {/* Blue dot (Class Average) */}
                      <circle
                        cx={x}
                        cy={yClass}
                        r="4.5"
                        fill="#3b82f6"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />

                      {/* Green dot (Student Score) */}
                      <circle
                        cx={x}
                        cy={yStudent}
                        r={isHovered ? '6.5' : '5'}
                        fill="#22c55e"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all"
                      />

                      {/* Course X-Axis Label */}
                      <text
                        x={x}
                        y={chartHeight - 8}
                        textAnchor="middle"
                        className={`text-[11px] font-medium transition-colors ${
                          isHovered ? 'fill-indigo-700 font-bold' : 'fill-slate-600'
                        }`}
                      >
                        {c.courseTitle}
                      </text>

                      {/* Interactive Tooltip Card over hovered column */}
                      {isHovered && (
                        <g>
                          <rect
                            x={Math.max(10, Math.min(chartWidth - 190, x - 90))}
                            y={Math.max(10, Math.min(yStudent - 75, chartHeight - 95))}
                            width="180"
                            height="65"
                            rx="10"
                            fill="#0f172a"
                            opacity="0.95"
                          />
                          <text
                            x={Math.max(10, Math.min(chartWidth - 190, x - 90)) + 90}
                            y={Math.max(10, Math.min(yStudent - 75, chartHeight - 95)) + 18}
                            textAnchor="middle"
                            fill="#ffffff"
                            className="text-[11px] font-bold"
                          >
                            {c.courseTitle}
                          </text>
                          <text
                            x={Math.max(10, Math.min(chartWidth - 190, x - 90)) + 90}
                            y={Math.max(10, Math.min(yStudent - 75, chartHeight - 95)) + 36}
                            textAnchor="middle"
                            fill="#86efac"
                            className="text-[10px] font-mono"
                          >
                            نمره شما: {c.score} | کلاس: {c.classAverage}
                          </text>
                          <text
                            x={Math.max(10, Math.min(chartWidth - 190, x - 90)) + 90}
                            y={Math.max(10, Math.min(yStudent - 75, chartHeight - 95)) + 52}
                            textAnchor="middle"
                            fill="#d8b4fe"
                            className="text-[10px] font-mono"
                          >
                            میانگین کل پایه: {c.gradeAverage}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

              </svg>
            </div>
          </div>

          {/* Chart footer interpretation box matching Screenshot 2 */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed text-right">
            <span className="font-bold text-slate-800">تفسیر نمودار: </span>
            خط سبز نشان‌دهنده نمرات شما، خط آبی میانگین کلاس، و خط بنفش میانگین پایه تحصیلی است. هرچه خط سبز بالاتر باشد، عملکرد شما بهتر است.
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: COURSE COMPARISON CARDS (Matching Screenshot 2) */}
      {/* ======================================================== */}
      {(viewMode === 'both' || viewMode === 'chart') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>تحلیل نمرات به تفکیک دروس (پایه‌های نهم / دوره اول متوسطه)</span>
            </h2>
            <span className="text-xs text-slate-500">۱۰ درس مصوب آموزش و پرورش</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(c => {
              const isHigher = c.score >= c.classAverage;
              return (
                <div
                  key={c.courseId}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
                >
                  {/* Card Header: Course Title, Score & Ranks */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">{c.courseTitle}</h3>
                      <div className="text-left">
                        <span className="text-xl font-black text-slate-900 font-mono tabular-nums">
                          {toPersianDigits(formatScore(c.score))}
                        </span>
                        <span className="text-[10px] text-slate-400 block -mt-1">نمره شما</span>
                      </div>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                      <span className="text-indigo-600 font-semibold">
                        رتبه در این درس: #{toPersianDigits(c.classRank)} <span className="text-slate-400 font-normal">از {toPersianDigits(c.classTotalStudents)} نفر</span>
                      </span>
                      <span className="text-[11px] text-purple-700 font-medium">
                        پایه: #{toPersianDigits(c.gradeRank)} <span className="text-slate-400 font-normal">از {toPersianDigits(c.gradeTotalStudents)}</span>
                      </span>
                    </div>
                  </div>

                  {/* 3 Progress Bars: You, Class, Grade */}
                  <div className="space-y-2.5">
                    {/* Bar 1: You */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">نمره شما</span>
                        <span className="font-bold text-emerald-700 font-mono tabular-nums">
                          {toPersianDigits(formatScore(c.score))}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (c.score / maxScoreScale) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Bar 2: Class Average */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">میانگین کلاس</span>
                        <span className="font-semibold text-blue-600 font-mono tabular-nums">
                          {toPersianDigits(formatScore(c.classAverage))}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (c.classAverage / maxScoreScale) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Bar 3: Grade Average */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">میانگین پایه</span>
                        <span className="font-semibold text-purple-600 font-mono tabular-nums">
                          {toPersianDigits(formatScore(c.gradeAverage))}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (c.gradeAverage / maxScoreScale) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Badge matching Screenshot 2 */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">عملکرد:</span>
                    {isHigher ? (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 inline-flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>بالاتر از میانگین</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60 inline-flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        <span>پایین‌تر از میانگین</span>
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: OFFICIAL REPORT CARD TABLE (Matching Screenshot 1) */}
      {/* ======================================================== */}
      {(viewMode === 'both' || viewMode === 'table') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">جدول نمرات رسمی کارنامه تحصیلی</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                معدل نمرات، میانگین کلاس و پایه به همراه نشانگر وضعیت رشد (فلش‌های سبز و قرمز)
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              URL: andishesari.ir/student/report-cards/{card.student.studentId || card.student.id}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="p-3.5 text-center w-14">ردیف</th>
                  <th className="p-3.5">نام درس</th>
                  <th className="p-3.5 text-center">نمره شما</th>
                  <th className="p-3.5 text-center">میانگین کلاس</th>
                  <th className="p-3.5 text-center">میانگین پایه تحصیلی</th>
                  <th className="p-3.5 text-center">رتبه در کلاس</th>
                  <th className="p-3.5 text-center">رتبه در پایه</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((c, index) => {
                  const aboveClass = c.score >= c.classAverage;
                  const aboveGrade = c.score >= c.gradeAverage;

                  return (
                    <tr key={c.courseId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 text-center font-mono text-slate-400 font-semibold">
                        {toPersianDigits(index + 1)}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {c.courseTitle}
                      </td>
                      <td className="p-3.5 text-center font-black text-slate-900 font-mono text-sm tabular-nums">
                        {toPersianDigits(formatScore(c.score))}
                      </td>
                      <td className="p-3.5 text-center font-mono tabular-nums">
                        <span className={`inline-flex items-center gap-1 font-bold ${aboveClass ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {aboveClass ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          <span>{toPersianDigits(formatScore(c.classAverage))}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono tabular-nums">
                        <span className={`inline-flex items-center gap-1 font-bold ${aboveGrade ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {aboveGrade ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          <span>{toPersianDigits(formatScore(c.gradeAverage))}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-semibold text-slate-700">
                        #{toPersianDigits(c.classRank)} <span className="text-[11px] text-slate-400 font-normal">از {toPersianDigits(c.classTotalStudents)}</span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-semibold text-slate-700">
                        #{toPersianDigits(c.gradeRank)} <span className="text-[11px] text-slate-400 font-normal">از {toPersianDigits(c.gradeTotalStudents)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Bottom Summary / Overall GPA Row matching Screenshot 1 */}
              <tfoot>
                <tr className="bg-blue-50/80 border-t-2 border-blue-200 text-slate-900 font-bold">
                  <td className="p-4 text-center font-bold text-indigo-700">مجموع</td>
                  <td className="p-4 font-black text-indigo-900 text-sm">معدل کل</td>
                  <td className="p-4 text-center font-black text-indigo-700 font-mono text-base tabular-nums">
                    {toPersianDigits(formatScore(card.overallGpa))}
                  </td>
                  <td className="p-4 text-center font-mono tabular-nums text-sm">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>{toPersianDigits(formatScore(card.classGpaAverage))}</span>
                    </span>
                  </td>
                  <td className="p-4 text-center font-mono tabular-nums text-sm">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>{toPersianDigits(formatScore(card.gradeGpaAverage))}</span>
                    </span>
                  </td>
                  <td className="p-4 text-center text-xs text-indigo-900 font-semibold" colSpan={2}>
                    رتبه #{toPersianDigits(card.overallClassRank)} در کلاس · رتبه #{toPersianDigits(card.overallGradeRank)} در پایه
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
