import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SchoolShiftSetting } from '../../types';
import { toPersianDigits } from '../../utils/persianDate';
import {
  Clock,
  Save,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  PhoneCall,
  Sparkles,
  Info,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';

export const AttendanceShiftsSettingsView: React.FC = () => {
  const { apiFetch } = useAuth();

  const [settings, setSettings] = useState<SchoolShiftSetting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [checkInStartTime, setCheckInStartTime] = useState('06:45');
  const [checkInNormalEndTime, setCheckInNormalEndTime] = useState('07:45');
  const [checkInLateThreshold, setCheckInLateThreshold] = useState('08:30');
  const [checkOutEarlyThreshold, setCheckOutEarlyThreshold] = useState('13:30');
  const [checkOutNormalEndTime, setCheckOutNormalEndTime] = useState('14:45');

  const [smsTemplateEntry, setSmsTemplateEntry] = useState('');
  const [smsTemplateExit, setSmsTemplateExit] = useState('');
  const [voiceTtsTemplate, setVoiceTtsTemplate] = useState('');

  const [isVoiceCallEnabled, setIsVoiceCallEnabled] = useState(true);
  const [isSmsEnabled, setIsSmsEnabled] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiFetch('/api/attendance/shifts')
      .then((data: SchoolShiftSetting) => {
        setSettings(data);
        setCheckInStartTime(data.checkInStartTime || '06:45');
        setCheckInNormalEndTime(data.checkInNormalEndTime || '07:45');
        setCheckInLateThreshold(data.checkInLateThreshold || '08:30');
        setCheckOutEarlyThreshold(data.checkOutEarlyThreshold || '13:30');
        setCheckOutNormalEndTime(data.checkOutNormalEndTime || '14:45');
        setSmsTemplateEntry(data.smsTemplateEntry || '');
        setSmsTemplateExit(data.smsTemplateExit || '');
        setVoiceTtsTemplate(data.voiceTtsTemplate || '');
        setIsVoiceCallEnabled(data.isVoiceCallEnabled !== false);
        setIsSmsEnabled(data.isSmsEnabled !== false);
      })
      .catch((err) => {
        setFeedback({ type: 'error', text: 'خطا در بارگذاری تنظیمات شیفت مدرسه' });
      })
      .finally(() => setIsLoading(false));
  }, [apiFetch]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const updated = await apiFetch('/api/attendance/shifts', {
        method: 'PUT',
        body: JSON.stringify({
          checkInStartTime,
          checkInNormalEndTime,
          checkInLateThreshold,
          checkOutEarlyThreshold,
          checkOutNormalEndTime,
          smsTemplateEntry,
          smsTemplateExit,
          voiceTtsTemplate,
          isVoiceCallEnabled,
          isSmsEnabled,
        }),
      });
      setSettings(updated);
      setFeedback({ type: 'success', text: 'تنظیمات شیفت، بازه‌های تردد و قالب‌های پیام با موفقیت ذخیره گردید.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'خطا در ذخیره تغییرات' });
    } finally {
      setIsSaving(false);
    }
  };

  const insertToken = (setter: React.Dispatch<React.SetStateAction<string>>, current: string, token: string) => {
    setter(current + ` {${token}}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">در حال بارگذاری تنظیمات شیفت و زمان‌بندی تردد...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-1 rounded-md">
            معاونت آموزشی و برنامه‌ریزی · مدرسه نمونه دولتی شهید منانی
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>تنظیمات شیفت، بازه‌های تردد و اطلاع‌رسانی خودکار</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تعیین ساعات ورود، آستانه تاخیر صبحگاه، خروج زودهنگام و ویرایش قالب‌های پیامک و تماس صوتی هوشمند
          </p>
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

      {/* Visual Operational Timeline */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-indigo-950/40 p-5 rounded-2xl border border-indigo-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>نمودار بازه‌های زمانی شیفت آموزشی (تطبیق لحظه‌ای اسکنر)</span>
          </h3>
          <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-mono">
            صبحگاه: {toPersianDigits(checkInStartTime)} الی {toPersianDigits(checkInNormalEndTime)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-[10px] font-bold text-emerald-600 block">ورود به‌موقع (ON_TIME_ENTRY)</span>
            <div className="font-mono text-sm font-black text-slate-900 dark:text-white mt-1">
              {checkInStartTime} — {checkInNormalEndTime}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">ورود عادی دانش‌آموز قبل از صف صبحگاه</p>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-amber-200 dark:border-amber-800/60">
            <span className="text-[10px] font-bold text-amber-600 block">ورود با تاخیر (LATE_ENTRY)</span>
            <div className="font-mono text-sm font-black text-slate-900 dark:text-white mt-1">
              بعد از {checkInNormalEndTime}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">محاسبه خودکار دقیقه تاخیر و درج در پرونده</p>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-rose-200 dark:border-rose-800/60">
            <span className="text-[10px] font-bold text-rose-600 block">خروج زودهنگام (EARLY_EXIT)</span>
            <div className="font-mono text-sm font-black text-slate-900 dark:text-white mt-1">
              قبل از {checkOutEarlyThreshold}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">خروج قبل از پایان ساعات مصوب کلاس‌ها</p>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-blue-200 dark:border-blue-800/60">
            <span className="text-[10px] font-bold text-blue-600 block">خروج به‌موقع (ON_TIME_EXIT)</span>
            <div className="font-mono text-sm font-black text-slate-900 dark:text-white mt-1">
              {checkOutEarlyThreshold} — {checkOutNormalEndTime}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">پایان شیفت و تعطیلی رسمی آموزشگاه</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Check-in & Check-out Window Intervals */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>تنظیم ساعات بازه‌های ورود و خروج (Time Intervals)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ساعت شروع مجاز ورود صبحگاه
              </label>
              <input
                type="time"
                value={checkInStartTime}
                onChange={(e) => setCheckInStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-center"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">پیش‌فرض: ۰۶:۴۵</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ساعت پایان ورود به‌موقع (Cut-off صف صبحگاه)
              </label>
              <input
                type="time"
                value={checkInNormalEndTime}
                onChange={(e) => setCheckInNormalEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-center"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">پیش‌فرض: ۰۷:۴۵ (اسکن‌های بعد از این تاخیر خواهند بود)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                آستانه تاخیر بحرانی صبحگاه
              </label>
              <input
                type="time"
                value={checkInLateThreshold}
                onChange={(e) => setCheckInLateThreshold(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-center"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">پیش‌فرض: ۰۸:۳۰</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                آستانه خروج زودهنگام (قبل از این ساعت: خروج غیرمجاز)
              </label>
              <input
                type="time"
                value={checkOutEarlyThreshold}
                onChange={(e) => setCheckOutEarlyThreshold(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-center"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">پیش‌فرض: ۱۳:۳۰</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ساعت پایان رسمی خروج شیفت
              </label>
              <input
                type="time"
                value={checkOutNormalEndTime}
                onChange={(e) => setCheckOutNormalEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-center"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">پیش‌فرض: ۱۴:۴۵</span>
            </div>
          </div>
        </div>

        {/* Section 2: Real-Time SMS Templates for Entry & Exit */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>قالب‌های پیامک لحظه‌ای ورود و خروج اولیا (SMS Templates)</span>
            </h2>

            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={isSmsEnabled}
                onChange={(e) => setIsSmsEnabled(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">فعال‌بودن سرویس پیامک</span>
            </label>
          </div>

          <div className="space-y-4">
            {/* Entry SMS Template */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  متن پیامک ورود (Check-in)
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">درج متغیر:</span>
                  <button
                    type="button"
                    onClick={() => insertToken(setSmsTemplateEntry, smsTemplateEntry, 'student_name')}
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-indigo-600 rounded cursor-pointer"
                  >
                    نام دانش‌آموز
                  </button>
                  <button
                    type="button"
                    onClick={() => insertToken(setSmsTemplateEntry, smsTemplateEntry, 'time')}
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-indigo-600 rounded cursor-pointer"
                  >
                    ساعت
                  </button>
                  <button
                    type="button"
                    onClick={() => insertToken(setSmsTemplateEntry, smsTemplateEntry, 'date')}
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-indigo-600 rounded cursor-pointer"
                  >
                    تاریخ
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                value={smsTemplateEntry}
                onChange={(e) => setSmsTemplateEntry(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 leading-relaxed font-sans"
                placeholder="فرزند دلبندتان {student_name} در ساعت {time} وارد مدرسه شد"
              />
            </div>

            {/* Exit SMS Template */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  متن پیامک خروج (Check-out)
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">درج متغیر:</span>
                  <button
                    type="button"
                    onClick={() => insertToken(setSmsTemplateExit, smsTemplateExit, 'student_name')}
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-indigo-600 rounded cursor-pointer"
                  >
                    نام دانش‌آموز
                  </button>
                  <button
                    type="button"
                    onClick={() => insertToken(setSmsTemplateExit, smsTemplateExit, 'time')}
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-indigo-600 rounded cursor-pointer"
                  >
                    ساعت
                  </button>
                  <button
                    type="button"
                    onClick={() => insertToken(setSmsTemplateExit, smsTemplateExit, 'date')}
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-indigo-600 rounded cursor-pointer"
                  >
                    تاریخ
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                value={smsTemplateExit}
                onChange={(e) => setSmsTemplateExit(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 leading-relaxed font-sans"
                placeholder="فرزند دلبندتان {student_name} در ساعت {time} از مدرسه خارج شد"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Disciplinary Automated Voice Call TTS Template */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>قالب تماس صوتی هوشمند انضباطی (Text-to-Speech Voice Call)</span>
            </h2>

            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={isVoiceCallEnabled}
                onChange={(e) => setIsVoiceCallEnabled(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">برقراری خودکار تماس صوتی</span>
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                متن دیالوگ صوتی قرائت شونده برای اولیا
              </label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">درج متغیر:</span>
                <button
                  type="button"
                  onClick={() => insertToken(setVoiceTtsTemplate, voiceTtsTemplate, 'student_name')}
                  className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-emerald-600 rounded cursor-pointer"
                >
                  {'{student_name}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertToken(setVoiceTtsTemplate, voiceTtsTemplate, 'infraction_title')}
                  className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-emerald-600 rounded cursor-pointer"
                >
                  {'{infraction_title}'}
                </button>
              </div>
            </div>
            <textarea
              rows={3}
              value={voiceTtsTemplate}
              onChange={(e) => setVoiceTtsTemplate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 leading-relaxed font-sans"
              placeholder="با سلام اولیای محترم دانش اموز {student_name} برای فرزند شما مورد انضباطی {infraction_title} ثبت شده است لطفا پیگیر این موضوع باشید"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>این متن بلافاصله پس از ثبت هر مورد انضباطی، بدون معطلی و در پس‌زمینه توسط موتور هوشمند تبدیل متن به گفتار (TTS) قرائت خواهد شد.</span>
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'در حال ذخیره‌سازی...' : 'ذخیره و اعمال تنظیمات شیفت و اعلان‌ها'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
