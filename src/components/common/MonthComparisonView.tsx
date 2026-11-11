import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MonthlyComparisonReport, MonthComparisonItem } from '../../types';
import { toPersianDigits } from '../../utils/persianDate';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles,
  BarChart2,
  CheckCircle2,
  RefreshCw,
  LayoutGrid,
  Activity,
} from 'lucide-react';

interface MonthComparisonViewProps {
  studentId?: string;
  className?: string;
}

export const MonthComparisonView: React.FC<MonthComparisonViewProps> = ({ studentId, className = '' }) => {
  const { user, apiFetch } = useAuth();
  const [comparison, setComparison] = useState<MonthlyComparisonReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState('دی');
  const [previousMonth, setPreviousMonth] = useState('آذر');
  const [chartViewMode, setChartViewMode] = useState<'both' | 'chart' | 'table'>('both');

  const months = ['مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند', 'فروردین', 'اردیبهشت'];

  const fetchComparison = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        currentMonth,
        previousMonth,
      });
      if (studentId) query.append('studentId', studentId);

      const data = await apiFetch(`/api/report-card/comparison?${query.toString()}`);
      setComparison(data);
    } catch (err) {
      console.error('Failed to load month comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [studentId, currentMonth, previousMonth]);

  if (loading) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
        <span className="text-xs text-slate-500 dark:text-slate-400">در حال پردازش نمودار مقایسه نمرات با ماه قبل...</span>
      </div>
    );
  }

  if (!comparison) {
    return null;
  }

  // Count growth, decline, and stable courses
  const growthCount = comparison.items.filter(i => i.status === 'growth').length;
  const declineCount = comparison.items.filter(i => i.status === 'decline').length;
  const stableCount = comparison.items.filter(i => i.status === 'stable').length;

  return (
    <div className="space-y-6 text-right font-sans">
      {/* Month Selector Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              تحلیل و نمودار مقایسه‌ای رشد ماهانه: {comparison.studentName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {comparison.className} · مقایسه تحلیلی کارنامه {comparison.currentMonth} با کارنامه {comparison.previousMonth}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 font-bold">ماه جاری:</span>
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold outline-none cursor-pointer [&>option]:bg-white dark:[&>option]:bg-slate-800 [&>option]:text-slate-900 dark:[&>option]:text-slate-100"
            >
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 font-bold">ماه مبنا:</span>
            <select
              value={previousMonth}
              onChange={(e) => setPreviousMonth(e.target.value)}
              className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold outline-none cursor-pointer [&>option]:bg-white dark:[&>option]:bg-slate-800 [&>option]:text-slate-900 dark:[&>option]:text-slate-100"
            >
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setChartViewMode('both')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                chartViewMode === 'both' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              نمای ترکیبی
            </button>
            <button
              onClick={() => setChartViewMode('chart')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                chartViewMode === 'chart' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              فقط نمودار
            </button>
            <button
              onClick={() => setChartViewMode('table')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                chartViewMode === 'table' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              فقط جدول
            </button>
          </div>
        </div>
      </div>

      {/* GPA & Rank Delta Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Current GPA */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">معدل ماه جاری ({comparison.currentMonth})</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums block mt-1">
            {toPersianDigits(comparison.currentGpa.toFixed(2))}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">سقف: ۲۰.۰۰</span>
        </div>

        {/* Previous GPA */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">معدل ماه قبل ({comparison.previousMonth})</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-600 dark:text-slate-300 font-mono tabular-nums block mt-1">
            {toPersianDigits(comparison.previousGpa.toFixed(2))}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">مبنای سنجش</span>
        </div>

        {/* GPA Delta */}
        <div className={`p-4 rounded-xl border shadow-xs ${
          comparison.gpaDelta > 0
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
            : comparison.gpaDelta < 0
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
        }`}>
          <span className="text-xs text-slate-500 dark:text-slate-400">تغییر کل معدل</span>
          <div className="flex items-center gap-1.5 mt-1 font-mono tabular-nums">
            {comparison.gpaDelta > 0 ? (
              <ArrowUpRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : comparison.gpaDelta < 0 ? (
              <ArrowDownRight className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : (
              <Minus className="w-5 h-5 text-slate-500 shrink-0" />
            )}
            <span className={`text-xl sm:text-2xl font-black ${
              comparison.gpaDelta > 0 ? 'text-emerald-700 dark:text-emerald-300' : comparison.gpaDelta < 0 ? 'text-rose-700 dark:text-rose-300' : 'text-slate-700 dark:text-slate-300'
            }`}>
              {comparison.gpaDelta > 0 ? '+' : ''}{toPersianDigits(comparison.gpaDelta.toFixed(2))} نمره
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
            {growthCount} درس صعود · {declineCount} افت
          </span>
        </div>

        {/* Overall Rank in Class */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">رتبه کلاسی (ماه جاری / قبل)</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              رتبه {toPersianDigits(comparison.currentOverallRank)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              (قبلی: {toPersianDigits(comparison.previousOverallRank)})
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block font-bold">
            {comparison.previousOverallRank > comparison.currentOverallRank ? `↑ ارتقای ${toPersianDigits(comparison.previousOverallRank - comparison.currentOverallRank)} رتبه` : 'پایدار'}
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VISUAL COMPARATIVE CHART SECTION */}
      {/* ======================================================== */}
      {(chartViewMode === 'both' || chartViewMode === 'chart') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  نمودار ستونی مقایسه نمره هر درس ({comparison.currentMonth} در برابر {comparison.previousMonth})
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ارتفاع ستون‌ها بر مبنای مقیاس ۲۰ نمره‌ای نمایش داده شده است.
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-300 dark:bg-slate-600 inline-block"></span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">ماه مبنا ({comparison.previousMonth})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-indigo-600 inline-block"></span>
                <span className="text-slate-900 dark:text-white font-bold">ماه جاری ({comparison.currentMonth})</span>
              </div>
            </div>
          </div>

          {/* Chart Bars Grid */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3 items-end pt-6 pb-2 min-h-[220px]">
              {comparison.items.map((item) => {
                const prevHeightPercent = Math.min(100, Math.max(10, (item.previousScore / 20) * 100));
                const currHeightPercent = Math.min(100, Math.max(10, (item.currentScore / 20) * 100));

                return (
                  <div key={item.courseId} className="flex flex-col items-center gap-2 group">
                    {/* Score Labels on Hover / Always */}
                    <div className="text-[10px] font-mono font-bold text-center">
                      <span className="text-indigo-700 dark:text-indigo-300 font-extrabold block">
                        {toPersianDigits(item.currentScore.toFixed(1))}
                      </span>
                    </div>

                    {/* Dual Bars Container */}
                    <div className="h-40 w-full flex items-end justify-center gap-1 px-1 bg-slate-50 dark:bg-slate-800/40 rounded-xl py-1 border border-slate-100 dark:border-slate-800">
                      {/* Previous Month Bar */}
                      <div
                        style={{ height: `${prevHeightPercent}%` }}
                        className="w-3 sm:w-3.5 rounded-t-md bg-slate-300 dark:bg-slate-600 transition-all hover:opacity-90"
                        title={`${comparison.previousMonth}: ${item.previousScore}`}
                      ></div>

                      {/* Current Month Bar */}
                      <div
                        style={{ height: `${currHeightPercent}%` }}
                        className={`w-3.5 sm:w-4 rounded-t-md transition-all shadow-xs ${
                          item.delta > 0
                            ? 'bg-emerald-600 hover:bg-emerald-500'
                            : item.delta < 0
                            ? 'bg-rose-500 hover:bg-rose-400'
                            : 'bg-indigo-600 hover:bg-indigo-500'
                        }`}
                        title={`${comparison.currentMonth}: ${item.currentScore}`}
                      ></div>
                    </div>

                    {/* Course Title */}
                    <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 text-center truncate max-w-[75px]" title={item.courseTitle}>
                      {item.courseTitle}
                    </span>

                    {/* Delta Badge */}
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      item.delta > 0
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : item.delta < 0
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {item.delta > 0 ? '+' : ''}{toPersianDigits(item.delta.toFixed(1))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* COURSE-BY-COURSE COMPARISON TABLE */}
      {/* ======================================================== */}
      {(chartViewMode === 'both' || chartViewMode === 'table') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <LayoutGrid className="w-4 h-4 text-indigo-600" />
              <span>جدول ریزنمرات و تحلیل تفکیکی دروس</span>
            </div>
            <span className="text-xs text-slate-400">تعداد دروس: {toPersianDigits(comparison.items.length)}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5 whitespace-nowrap">عنوان درس</th>
                  <th className="p-3.5 whitespace-nowrap text-center">نمره ماه قبل ({comparison.previousMonth})</th>
                  <th className="p-3.5 whitespace-nowrap text-center">نمره ماه جاری ({comparison.currentMonth})</th>
                  <th className="p-3.5 whitespace-nowrap text-center">میزان تغییرات (اختلاف)</th>
                  <th className="p-3.5 whitespace-nowrap text-center">درصد تغییرات</th>
                  <th className="p-3.5 whitespace-nowrap text-center">تغییر رتبه کلاسی</th>
                  <th className="p-3.5 whitespace-nowrap text-center">وضعیت رشد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {comparison.items.map((item) => (
                  <tr key={item.courseId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {item.courseTitle}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-slate-600 dark:text-slate-300">
                      {toPersianDigits(item.previousScore.toFixed(2))}
                    </td>
                    <td className="p-3.5 text-center font-mono font-black text-slate-900 dark:text-white text-sm">
                      {toPersianDigits(item.currentScore.toFixed(2))}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs ${
                        item.delta > 0
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                          : item.delta < 0
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {item.delta > 0 ? '+' : ''}{toPersianDigits(item.delta.toFixed(2))}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono text-xs">
                      <span className={item.deltaPercentage > 0 ? 'text-emerald-600 font-bold' : item.deltaPercentage < 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                        {item.deltaPercentage > 0 ? '↑' : item.deltaPercentage < 0 ? '↓' : ''} {toPersianDigits(Math.abs(item.deltaPercentage))}%
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono text-xs text-slate-600 dark:text-slate-300">
                      {item.rankDelta > 0 ? (
                        <span className="text-emerald-600 font-bold">↑ {toPersianDigits(item.rankDelta)} رتبه صعود</span>
                      ) : item.rankDelta < 0 ? (
                        <span className="text-rose-600 font-bold">↓ {toPersianDigits(Math.abs(item.rankDelta))} رتبه افت</span>
                      ) : (
                        <span className="text-slate-400">ثابت</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {item.status === 'growth' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>رشد تحصیلی</span>
                        </span>
                      ) : item.status === 'decline' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>نیاز به تلاش</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <Minus className="w-3.5 h-3.5" />
                          <span>سطح پایدار</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
