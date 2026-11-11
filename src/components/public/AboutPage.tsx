import React from 'react';
import { Award, Users, BookOpen, CheckCircle, GraduationCap, Building2 } from 'lucide-react';
import { toPersianDigits } from '../../utils/persianDate';

export const AboutPage: React.FC = () => {
  const teachers = [
    {
      name: 'استاد سید احمد حسینی',
      role: 'مدرس حسابان، دیفرانسیل و ریاضیات کنکور',
      experience: '۱۵ سال سابقه درخشان در مدارس سمپاد و نمونه دولتی',
      specialty: 'طراح تست‌های شبیه‌ساز کنکور کشوری',
    },
    {
      name: 'استاد مریم فلاحی',
      role: 'مدرس فیزیک پایه و کنکور',
      experience: '۱۲ سال سابقه تدریس تخصصی در مراکز استعداد درخشان',
      specialty: 'مؤلف کتب کمک‌آموزشی فیزیک کنکور',
    },
    {
      name: 'دکتر علیرضا طاهری',
      role: 'مدیر آموزشی و برنامه‌ریزی تحصیلی',
      experience: 'دکترای مدیریت آموزشی با ۲۰ سال پیشینه مدیریتی',
      specialty: 'نظارت بر فرآیندهای ارزشیابی و کیفیت تدریس',
    },
    {
      name: 'دکتر پروانه ساداتی',
      role: 'مشاور ارشد تحصیلی و روانشناس تربیتی',
      experience: 'دکترای روانشناسی، مشاور رتبه‌های تک‌رقمی کنکور',
      specialty: 'مدیریت استرس آزمون، تنظیم برنامه مطالعاتی فردی',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-16 text-right">
      
      {/* Title & Mission */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
          <Building2 className="w-4 h-4" />
          <span>پیشینه و مأموریت آموزشی</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          درباره مدرسه نمونه دولتی شهید منانی
        </h1>
        <p className="text-base text-slate-600 leading-relaxed text-justify">
          مدرسه نمونه دولتی شهید منانی با هدف ایجاد بستری مدرن، علمی و اخلاقی برای دانش‌آموزان کوشا تأسیس شده است. هدف ما پرورش تفکر انتقادی، ارتقای سطح علمی دانش‌آموزان، آمادگی برای امتحانات نهایی و آزمون‌های ورودی مدارس برتر کشور در کنار رشد فردی و اجتماعی است.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">آموزش عمیق و مفهومی</h3>
          <p className="text-xs text-slate-600 leading-relaxed text-justify">
            پرهیز از روش‌های سطحی و تأکید بر پایه‌ریزی مستحکم ریاضیات، علوم تجربی و ادبیات با حل تمرین‌های چالش‌برانگیز.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">سنجش و بازخورد بی‌وقفه</h3>
          <p className="text-xs text-slate-600 leading-relaxed text-justify">
            سامانه ثبت نمرات تحلیلی که نقاط ضعف هر دانش‌آموز را در مباحث خاص شناسایی کرده و به دبیر و مشاور اطلاع می‌دهد.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">مشاوره و هدایت فردی</h3>
          <p className="text-xs text-slate-600 leading-relaxed text-justify">
            هر دانش‌آموز دارای پرونده مشاوره‌ای اختصاصی بوده و مشاور ارشد مسیر تحصیلی و ساعات مطالعه او را پایش می‌کند.
          </p>
        </div>
      </div>

      {/* Faculty and Staff */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">کادر اداری و دبیران تخصصی مدرسه نمونه دولتی شهید منانی</h2>
          <p className="text-xs text-slate-500 mt-1">منتخبی از برترین اساتید و مشاوران متعهد و مجرب</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teachers.map((teacher, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 text-right space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xl flex items-center justify-center mb-2">
                {teacher.name.split(' ')[1]?.charAt(0) || 'ا'}
              </div>
              <h3 className="text-sm font-bold text-slate-900">{teacher.name}</h3>
              <p className="text-xs font-semibold text-indigo-600">{teacher.role}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">{teacher.experience}</p>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-700 font-medium flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{teacher.specialty}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Facilities & Infrastructure */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl space-y-6">
        <h2 className="text-2xl font-bold text-white">امکانات سخت‌افزاری و آزمایشگاهی مجتمع</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-300 text-xs leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <h4 className="text-sm font-bold text-white">کلاس‌های هوشمند چندرسانه‌ای</h4>
            <p>مجهز به نمایشگرهای لمسی هوشمند، پروژکتورهای لیزری و سیستم ضبط جلسات برای مرور درس.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <h4 className="text-sm font-bold text-white">آزمایشگاه مرکزی فیزیک و شیمی</h4>
            <p>دارای ابزارهای دقیق اندازه‌گیری، کیت‌های آزمایشگاهی الکتریسیته، نورشناسی و واکنش‌های شیمیایی.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <h4 className="text-sm font-bold text-white">کتابخانه و سالن مطالعه استاندارد</h4>
            <p>محیطی آرام، با نورپردازی ارگونومیک و میزهای مطالعه تفکیک‌شده ویژه دوران جمع‌بندی کنکور.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
