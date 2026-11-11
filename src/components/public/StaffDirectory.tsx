import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, TeacherProfile } from '../../types';
import { toPersianDigits, getWeekdayName } from '../../utils/persianDate';
import {
  GraduationCap,
  Users,
  HeartHandshake,
  ShieldCheck,
  Calendar,
  BookOpen,
  Award,
  Phone,
  Mail,
  Search,
  Filter,
} from 'lucide-react';

export const StaffDirectory: React.FC = () => {
  const { apiFetch } = useAuth();
  const [staffData, setStaffData] = useState<{
    managers: User[];
    teachers: TeacherProfile[];
    counselors: User[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'managers' | 'counselors' | 'teachers'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    apiFetch('/api/public/staff')
      .then(res => setStaffData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [apiFetch]);

  if (loading || !staffData) {
    return (
      <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400 font-sans">
        در حال بارگذاری کادر آموزشی و اداری مدرسه نمونه دولتی شهید منانی...
      </div>
    );
  }

  const allStaff = [
    ...staffData.managers.map(m => ({ ...m, category: 'managers', categoryLabel: 'مدیریت و معاونت' })),
    ...staffData.counselors.map(c => ({ ...c, category: 'counselors', categoryLabel: 'مشاوران تحصیلی و تربیتی' })),
    ...staffData.teachers.map(t => ({ ...t, category: 'teachers', categoryLabel: 'اساتید و دبیران تخصصی' })),
  ];

  const filteredStaff = allStaff.filter(person => {
    if (activeCategory !== 'all' && person.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        person.fullName.toLowerCase().includes(q) ||
        (person.specialty && person.specialty.toLowerCase().includes(q)) ||
        (person.bio && person.bio.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 text-right font-sans">
      {/* Intro Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold border border-white/20">
            <Users className="w-4 h-4 text-amber-400" />
            <span>معرفی رسمی کادر مدرسه نمونه دولتی شهید منانی</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            کادر آموزشی، معاونت‌ها و مشاوران دوره اول متوسطه
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed text-justify">
            مدرسه نمونه دولتی شهید منانی مفتخر است با همراهی برجسته‌ترین اساتید، معاونین پرتلاش و مشاوران هدایت تحصیلی، فضایی بالنده و سرشار از شکوفایی علمی و اخلاقی را برای دانش‌آموزان عزیز و اولیای گرامی فراهم آورد.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'تمام اعضای کادر' },
            { id: 'managers', label: 'مدیریت و معاونین' },
            { id: 'counselors', label: 'مشاوران تحصیلی' },
            { id: 'teachers', label: 'دبیران تخصصی' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی نام دبیر، درس یا سمت..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((person) => {
          const isCounselor = person.role === 'counselor';
          const isTeacher = person.role === 'teacher';
          const isManager = person.role === 'manager' || person.role === 'super_admin';

          return (
            <div
              key={person.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-xs ${
                      isManager
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white'
                        : isCounselor
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
                        : 'bg-gradient-to-br from-blue-600 to-cyan-700 text-white'
                    }`}>
                      {person.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{person.fullName}</h4>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mt-0.5">
                        {person.specialty || person.categoryLabel}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isManager
                      ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300'
                      : isCounselor
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    {person.categoryLabel}
                  </span>
                </div>

                {person.bio && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify line-clamp-3">
                    {person.bio}
                  </p>
                )}

                {/* Counselor Attendance Days */}
                {isCounselor && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/80 dark:border-amber-900/60 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>روزهای حضور مشاور در مدرسه:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(person.attendanceDays && person.attendanceDays.length > 0 ? person.attendanceDays : [0, 2, 4]).map(d => (
                        <span
                          key={d}
                          className="px-2 py-0.5 text-[10px] font-bold bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-200 rounded-lg border border-amber-200 dark:border-amber-800"
                        >
                          {getWeekdayName(d)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Teacher Courses List */}
                {isTeacher && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      <span>دروس تحت تدریس:</span>
                    </div>
                    <div className="flex flex-wrap gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                      {(person as any).assignedClasses && (person as any).assignedClasses.length > 0 ? (
                        (person as any).assignedClasses.map((ac: any, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium">
                            {ac.courseTitle} ({ac.className})
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500">ریاضی و دروس تخصصی پایه</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>مدرسه نمونه دولتی شهید منانی</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">عضو رسمی کادر</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
