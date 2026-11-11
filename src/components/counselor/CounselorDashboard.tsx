import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CounselorAvailability, CounselingRequest, CounselingMessage } from '../../types';
import { formatPersianDate, formatPersianDateTime, getWeekdayName, toPersianDigits } from '../../utils/persianDate';
import {
  HeartHandshake,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Lock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Shield,
  Save,
} from 'lucide-react';

interface CounselorDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const CounselorDashboard: React.FC<CounselorDashboardProps> = ({ activeTab, onTabChange }) => {
  const { user, apiFetch } = useAuth();

  const [availabilities, setAvailabilities] = useState<CounselorAvailability[]>([]);
  const [requests, setRequests] = useState<CounselingRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CounselingRequest | null>(null);
  const [messages, setMessages] = useState<CounselingMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [privateNoteText, setPrivateNoteText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  // New slot form
  const [newDay, setNewDay] = useState<number>(0);
  const [newStart, setNewStart] = useState('10:00');
  const [newEnd, setNewEnd] = useState('14:00');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    apiFetch('/api/counseling/availability').then(setAvailabilities).catch(() => {});
    apiFetch('/api/counseling/requests').then(setRequests).catch(() => {});
  }, [apiFetch]);

  useEffect(() => {
    if (selectedRequest) {
      setPrivateNoteText(selectedRequest.privateNotes || '');
      apiFetch(`/api/counseling/requests/${selectedRequest.id}/messages`)
        .then(setMessages)
        .catch(() => {});
    }
  }, [selectedRequest, apiFetch]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await apiFetch('/api/counseling/availability', {
        method: 'POST',
        body: JSON.stringify({
          dayOfWeek: newDay,
          startTime: newStart,
          endTime: newEnd,
          note: newNote,
          isAvailable: true,
        }),
      });
      setAvailabilities(prev => [...prev, added]);
      setFeedback('ساعت حضور جدید با موفقیت ثبت شد.');
      setTimeout(() => setFeedback(null), 3000);
    } catch {}
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      await apiFetch(`/api/counseling/availability/${id}`, { method: 'DELETE' });
      setAvailabilities(prev => prev.filter(a => a.id !== id));
    } catch {}
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !newMessage.trim()) return;

    try {
      const msg = await apiFetch(`/api/counseling/requests/${selectedRequest.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    } catch {}
  };

  const handleUpdateStatusAndNotes = async (newStatus?: string) => {
    if (!selectedRequest) return;

    try {
      const updated = await apiFetch(`/api/counseling/requests/${selectedRequest.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus || selectedRequest.status,
          privateNotes: privateNoteText,
        }),
      });
      setSelectedRequest(updated);
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      setFeedback('یادداشت محرمانه و وضعیت درخواست با موفقیت به‌روزرسانی شد.');
      setTimeout(() => setFeedback(null), 3000);
    } catch {}
  };

  const filteredRequests = requests.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6 text-right">
      
      {/* Header Profile */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-rose-600 font-semibold">دفتر هدایت تحصیلی و مشاوره دبیرستان شهید منانی</span>
          <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">
            پنل مشاور ارشد: {user?.fullName}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            پایش وضعیت انگیزشی، تنظیم برنامه‌ریزی مطالعاتی و ارتباط محرمانه با دانش‌آموزان
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onTabChange(activeTab === 'availability' ? 'overview' : 'availability')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>{activeTab === 'availability' ? 'بازگشت به صندوق پیام‌ها' : 'تنظیم برنامه حضور در مؤسسه'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 1: REQUESTS & CHAT WORKSPACE */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Requests Inbox (Left/Right depending on RTL) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">درخواست‌های مشاوره دانش‌آموزان</h3>
              <span className="text-xs text-slate-500">{toPersianDigits(filteredRequests.length)} مورد</span>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setStatusFilter('all')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                همه
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'pending' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                در انتظار
              </button>
              <button
                onClick={() => setStatusFilter('in_progress')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'in_progress' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                در جریان
              </button>
              <button
                onClick={() => setStatusFilter('resolved')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'resolved' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                خاتمه یافته
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredRequests.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRequest(r)}
                  className={`w-full p-3 rounded-xl border text-right transition-all cursor-pointer block ${
                    selectedRequest?.id === r.id
                      ? 'bg-indigo-50 border-indigo-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-slate-900">{r.studentName || 'دانش‌آموز'}</span>
                    <span className="text-slate-400 font-mono">{formatPersianDate(r.createdAt)}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-indigo-950 truncate">{r.subject}</h4>
                  <div className="flex items-center justify-between text-[10px] mt-2">
                    <span className="text-slate-500">
                      دسته‌بندی: {r.category === 'academic' ? 'درسی' : r.category === 'exam_prep' ? 'کنکور' : 'انگیزشی'}
                    </span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded ${
                        r.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : r.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {r.status === 'pending' ? 'در انتظار' : r.status === 'in_progress' ? 'در حال گفتگو' : 'انجام شده'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation and Confidential Notes (Right) */}
          <div className="lg:col-span-7 space-y-6">
            {selectedRequest ? (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedRequest.subject}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      دانش‌آموز: {selectedRequest.studentName} · زمان پیشنهادی دانش‌آموز: {selectedRequest.preferredTime || 'هماهنگی چت'}
                    </p>
                  </div>

                  {/* Status Changer */}
                  <select
                    value={selectedRequest.status}
                    onChange={e => handleUpdateStatusAndNotes(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold"
                  >
                    <option value="pending">در انتظار</option>
                    <option value="in_progress">در حال بررسی و گفتگو</option>
                    <option value="resolved">خاتمه یافته و حل شده</option>
                    <option value="cancelled">لغو شده</option>
                  </select>
                </div>

                {/* Messages Feed */}
                <div className="py-2 space-y-3 max-h-72 overflow-y-auto">
                  {messages.map(m => {
                    const isMe = m.senderRole === 'counselor';
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-xs'
                              : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                          }`}
                        >
                          <div className={`text-[10px] ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {m.senderName || (isMe ? 'شما (مشاور)' : 'دانش‌آموز')} · {formatPersianDateTime(m.sentAt)}
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="پاسخ مشاوره‌ای خود را بنویسید..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ارسال</span>
                  </button>
                </form>

                {/* STRICT CONFIDENTIAL COUNSELING NOTES */}
                <div className="pt-4 border-t border-slate-200 bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      <span>یادداشت‌های محرمانه مشاور (کاملاً مخفی از دانش‌آموز)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatusAndNotes()}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      <Save className="w-3 h-3" />
                      <span>ذخیره یادداشت</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="مشاهدات بالینی، روانشناختی یا پرونده تحصیلی محرمانه که تنها مشاور به آن دسترسی دارد..."
                    value={privateNoteText}
                    onChange={e => setPrivateNoteText(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-amber-300 text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  ></textarea>
                </div>

              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs">یک درخواست مشاوره را جهت مشاهده پیام‌ها و پرونده انتخاب نمایید.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: AVAILABILITY SCHEDULE CONFIGURATION */}
      {/* ======================================================== */}
      {activeTab === 'availability' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">ساعات و روزهای کاری تعریف‌شده شما</h2>
            <p className="text-xs text-slate-500">
              این بازه‌ها در پورتال دانش‌آموزان به عنوان زمان حضور شما در اتاق مشاوره نمایش داده می‌شوند.
            </p>

            <div className="space-y-3">
              {availabilities.map(av => (
                <div key={av.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{getWeekdayName(av.dayOfWeek)}</h3>
                    <p className="text-xs text-slate-600 font-mono tabular-nums mt-0.5">
                      ساعت {toPersianDigits(av.startTime)} الی {toPersianDigits(av.endTime)}
                    </p>
                    {av.note && <p className="text-[11px] text-slate-500 mt-1">{av.note}</p>}
                  </div>

                  <button
                    onClick={() => handleDeleteSlot(av.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="حذف بازه"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Slot Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">افزودن زمان حضور جدید</h3>
            
            <form onSubmit={handleAddSlot} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">روز هفته</label>
                <select
                  value={newDay}
                  onChange={e => setNewDay(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                >
                  <option value={0}>شنبه</option>
                  <option value={1}>یکشنبه</option>
                  <option value={2}>دوشنبه</option>
                  <option value={3}>سه‌شنبه</option>
                  <option value={4}>چهارشنبه</option>
                  <option value={5}>پنج‌شنبه</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ساعت شروع</label>
                  <input
                    type="time"
                    value={newStart}
                    onChange={e => setNewStart(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ساعت پایان</label>
                  <input
                    type="time"
                    value={newEnd}
                    onChange={e => setNewEnd(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">یادداشت برای دانش‌آموزان (اختیاری)</label>
                <input
                  type="text"
                  placeholder="مثال: جلسات حضوری در اتاق مشاوره"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                ثبت در تقویم حضور
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};
