import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Announcement } from '../../types';
import { formatPersianDate } from '../../utils/persianDate';
import { Megaphone, Search, Calendar, User, Filter, Users } from 'lucide-react';
import { StaffDirectory } from './StaffDirectory';

export const AnnouncementsPage: React.FC = () => {
  const { apiFetch } = useAuth();
  const [activeTab, setActiveTab] = useState<'announcements' | 'staff'>('announcements');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filterAudience, setFilterAudience] = useState<'all' | 'students' | 'teachers'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    apiFetch('/api/announcements')
      .then(res => setAnnouncements(res))
      .catch(() => {});
  }, [apiFetch]);

  const filtered = announcements.filter(a => {
    if (filterAudience !== 'all' && a.targetAudience !== 'all' && a.targetAudience !== filterAudience) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-right space-y-8 font-sans">
      
      {/* Page Header and View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-1">
            <Megaphone className="w-4 h-4" />
            <span>پرتال اطلاع‌رسانی و ارتباط با مدرسه</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            مدرسه نمونه دولتی شهید منانی
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            اخبار، اطلاعیه‌های هماهنگ و معرفی کادر آموزشی و معاونین به اولیا
          </p>
        </div>

        {/* Tab switch between Announcements and Staff Directory */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'announcements'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>اطلاعیه‌ها و اخبار</span>
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-500" />
            <span>کادر مدرسه (معرفی به اولیا)</span>
          </button>
        </div>
      </div>

      {activeTab === 'staff' ? (
        <StaffDirectory />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Segmented Filter */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
              <button
                onClick={() => setFilterAudience('all')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  filterAudience === 'all'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                تمام اطلاعیه‌ها
              </button>
              <button
                onClick={() => setFilterAudience('students')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  filterAudience === 'students'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                ویژه دانش‌آموزان
              </button>
              <button
                onClick={() => setFilterAudience('teachers')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  filterAudience === 'teachers'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                ویژه دبیران
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="جستجو در متن اطلاعیه‌ها..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

      {/* Grid of Announcements */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500">اطلاعیه‌ای مطابق با جستجوی شما یافت نشد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <article
              key={item.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatPersianDate(item.publishedAt)}</span>
                  </span>
                  <span className="text-indigo-600 font-semibold">
                    {item.targetAudience === 'all' ? 'عمومی' : item.targetAudience === 'students' ? 'دانش‌آموزان' : 'دبیران'}
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-900 leading-snug">
                  {item.title}
                </h2>

                <p className="text-xs text-slate-600 leading-relaxed text-justify line-clamp-4">
                  {item.content}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.authorName || 'روابط عمومی مؤسسه'}</span>
                </span>
                <button
                  onClick={() => setSelectedAnnouncement(item)}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  مطالعه کامل
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Full Modal Viewer */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 text-right space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-500">{formatPersianDate(selectedAnnouncement.publishedAt)}</span>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                بستن پنجره ✕
              </button>
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {selectedAnnouncement.title}
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line text-justify">
              {selectedAnnouncement.content}
            </p>
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>منتشرکننده: {selectedAnnouncement.authorName || 'دبیرخانه'}</span>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

    </div>
  );
};
