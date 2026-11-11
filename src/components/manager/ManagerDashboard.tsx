import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClassGroup, User, ScheduleItem, Announcement, Course, GradeLevel, StudentReportCard, ClassCourseAssignment, TeacherProfile } from '../../types';
import { formatPersianDate, toPersianDigits, getWeekdayName, formatScore } from '../../utils/persianDate';
import { ReportCardView } from '../student/ReportCardView';
import { ExcelImportModal } from './ExcelImportModal';
import { MonthComparisonView } from '../common/MonthComparisonView';
import { AttendanceManagementView } from './AttendanceManagementView';
import { AttendanceShiftsSettingsView } from '../attendance/AttendanceShiftsSettingsView';
import { DisciplinaryManagementView } from '../disciplinary/DisciplinaryManagementView';
import { OnlineExamsManagementView } from '../exams/OnlineExamsManagementView';
import {
  Users,
  BookOpen,
  Calendar,
  Bell,
  Plus,
  Send,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Trash2,
  KeyRound,
  Award,
  Copy,
  Check,
  Eye,
  UserPlus,
  Filter,
  Hash,
  School,
  X,
  GraduationCap,
  Briefcase,
  Layers,
  Settings2,
  Sparkles,
  BookMarked,
  Search,
  FileSpreadsheet,
  HeartHandshake,
  Clock,
} from 'lucide-react';

interface ManagerDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLaunchKiosk?: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ activeTab, onTabChange, onLaunchKiosk }) => {
  const { user, apiFetch } = useAuth();

  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [teacherProfiles, setTeacherProfiles] = useState<TeacherProfile[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Filter by grade (هفتم، هشتم، نهم)
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');

  // Teacher Management & Modal
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherPhone, setNewTeacherPhone] = useState('');
  const [newTeacherNationalId, setNewTeacherNationalId] = useState('');
  const [newTeacherSpecialty, setNewTeacherSpecialty] = useState('دبیر ریاضیات و هندسه');
  const [newTeacherTeachableCourseIds, setNewTeacherTeachableCourseIds] = useState<string[]>([]);
  const [generatedTeacherCreds, setGeneratedTeacherCreds] = useState<{ username: string; rawPassword: string; fullName: string; specialty?: string } | null>(null);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [teacherSpecialtyFilter, setTeacherSpecialtyFilter] = useState('all');

  // Excel Bulk Import Modal
  const [excelModalOpen, setExcelModalOpen] = useState(false);

  // Counselor Management & Modal (Multi-Counselors)
  const [counselors, setCounselors] = useState<User[]>([]);
  const [counselorModalOpen, setCounselorModalOpen] = useState(false);
  const [newCounselorName, setNewCounselorName] = useState('');
  const [newCounselorNationalId, setNewCounselorNationalId] = useState('');
  const [newCounselorPhone, setNewCounselorPhone] = useState('');
  const [newCounselorSpecialty, setNewCounselorSpecialty] = useState('مشاور تحصیلی و برنامه‌ریزی');
  const [newCounselorDays, setNewCounselorDays] = useState<number[]>([0, 2, 4]); // شنبه، دوشنبه، چهارشنبه

  // Weekly Schedule Modal & Class Selection
  const [selectedScheduleClassId, setSelectedScheduleClassId] = useState<string>('');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [newSchClassId, setNewSchClassId] = useState('');
  const [newSchDayOfWeek, setNewSchDayOfWeek] = useState(0);
  const [newSchPeriod, setNewSchPeriod] = useState(1);
  const [newSchCourseId, setNewSchCourseId] = useState('');
  const [newSchNote, setNewSchNote] = useState('');

  // Class Course Teacher Assignments Modal
  const [assignmentsModalOpen, setAssignmentsModalOpen] = useState(false);
  const [selectedClassForAssignments, setSelectedClassForAssignments] = useState<ClassGroup | null>(null);
  const [classAssignmentsList, setClassAssignmentsList] = useState<ClassCourseAssignment[]>([]);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [editPrimaryTeacherId, setEditPrimaryTeacherId] = useState<string>('');
  const [editAdditionalTeacherIds, setEditAdditionalTeacherIds] = useState<string[]>([]);
  const [newCourseToClassId, setNewCourseToClassId] = useState<string>('');
  const [newCoursePrimaryTeacherId, setNewCoursePrimaryTeacherId] = useState<string>('');

  // Course definition modal & form
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseGrade, setNewCourseGrade] = useState<GradeLevel>('نهم');
  const [newCourseUnits, setNewCourseUnits] = useState(2);
  const [newCourseDesc, setNewCourseDesc] = useState('');

  // Class definition modal & form
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState<GradeLevel>('نهم');
  const [newClassCourseId, setNewClassCourseId] = useState('');
  const [newClassTeacherId, setNewClassTeacherId] = useState('');
  const [newClassRoom, setNewClassRoom] = useState('۱۰۱');
  const [newClassCapacity, setNewClassCapacity] = useState(30);

  // Student Credential Generation Modal & Form (No self-registration)
  const [credentialModalOpen, setCredentialModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNationalId, setNewStudentNationalId] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState<GradeLevel>('نهم');
  const [newStudentClassId, setNewStudentClassId] = useState('');
  const [generatedCredentials, setGeneratedCredentials] = useState<{ username: string; rawPassword: string; fullName: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Grade Entry Modal
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [gradeCourseId, setGradeCourseId] = useState('');
  const [gradeStudentId, setGradeStudentId] = useState('');
  const [gradeAssessmentTitle, setGradeAssessmentTitle] = useState('ارزیابی مستمر نوبت اول');
  const [gradeType, setGradeType] = useState<'quiz' | 'midterm' | 'final'>('final');
  const [gradeScore, setGradeScore] = useState<number>(18);
  const [gradeComments, setGradeComments] = useState('');

  // Report Card Preview Modal
  const [previewStudentCard, setPreviewStudentCard] = useState<StudentReportCard | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Announcement modal
  const [annModalOpen, setAnnModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annAudience, setAnnAudience] = useState<'all' | 'students' | 'teachers'>('all');

  const loadData = () => {
    apiFetch('/api/classes').then((clsData: ClassGroup[]) => {
      setClasses(clsData);
      if (clsData.length > 0) {
        setSelectedScheduleClassId(prev => prev || clsData[0].id);
      }
    }).catch(() => {});
    apiFetch('/api/courses').then(setCourses).catch(() => {});
    apiFetch('/api/users?role=student').then(setStudents).catch(() => {});
    apiFetch('/api/teachers').then((data: TeacherProfile[]) => {
      setTeacherProfiles(data);
      setTeachers(data);
    }).catch(() => {
      apiFetch('/api/users?role=teacher').then(setTeachers).catch(() => {});
    });
    apiFetch('/api/schedules').then(setSchedules).catch(() => {});
    apiFetch('/api/announcements').then(setAnnouncements).catch(() => {});
    apiFetch('/api/counselors').then(setCounselors).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, [apiFetch]);

  // Handle Course Creation (Only: Code, Title, Grade)
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode.trim() || !newCourseTitle.trim()) {
      alert('لطفاً کد درس و نام درس را وارد نمایید.');
      return;
    }

    try {
      const created = await apiFetch('/api/manager/courses', {
        method: 'POST',
        body: JSON.stringify({
          code: newCourseCode.trim(),
          title: newCourseTitle.trim(),
          gradeLevel: newCourseGrade,
        }),
      });
      setCourses(prev => [...prev, created]);
      setCourseModalOpen(false);
      setNewCourseCode('');
      setNewCourseTitle('');
      setFeedback(`درس «${created.title}» برای پایه ${created.gradeLevel} با موفقیت ثبت شد.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'خطا در ثبت درس');
    }
  };

  // Handle Course Deletion
  const handleDeleteCourse = async (id: string, title: string) => {
    if (!window.confirm(`آیا از حذف درس «${title}» اطمینان دارید؟`)) return;
    try {
      await apiFetch(`/api/courses/${id}`, { method: 'DELETE' });
      setCourses(prev => prev.filter(c => c.id !== id));
      setFeedback(`درس «${title}» حذف گردید.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'خطا در حذف درس');
    }
  };

  // Handle Schedule Slot Deletion (reverts period to free/empty)
  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('آیا مایلید این زنگ کلاسی را حذف کرده و این ساعت را به عنوان «زنگ آزاد / خالی» تنظیم نمایید؟')) return;
    try {
      await apiFetch(`/api/schedules/${id}`, { method: 'DELETE' });
      setSchedules(prev => prev.filter(s => s.id !== id));
      setFeedback('زنگ کلاسی حذف شد و ساعت مورد نظر به عنوان «زنگ آزاد / خالی» تنظیم گردید.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'خطا در حذف زنگ کلاسی');
    }
  };

  // Handle Class Creation (Only: Class Name and Grade Level)
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      alert('لطفاً نام کلاس را وارد نمایید.');
      return;
    }

    try {
      const created = await apiFetch('/api/manager/classes', {
        method: 'POST',
        body: JSON.stringify({
          name: newClassName.trim(),
          gradeLevel: newClassGrade,
        }),
      });
      setClasses(prev => [...prev, created]);
      setClassModalOpen(false);
      setNewClassName('');
      setFeedback(`کلاس «${created.name}» (پایه ${created.gradeLevel}) با موفقیت ایجاد شد.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'خطا در ایجاد کلاس');
    }
  };

  // Handle Class Deletion
  const handleDeleteClass = async (id: string, name: string) => {
    if (!window.confirm(`آیا از حذف کلاس «${name}» اطمینان دارید؟`)) return;
    try {
      await apiFetch(`/api/classes/${id}`, { method: 'DELETE' });
      setClasses(prev => prev.filter(c => c.id !== id));
      setFeedback(`کلاس «${name}» حذف گردید.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'خطا در حذف کلاس');
    }
  };

  // Handle Teacher Creation (Name, National ID, Phone, Multi-Course Checkboxes)
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !newTeacherNationalId.trim() || !newTeacherPhone.trim()) {
      alert('لطفاً نام و نام خانوادگی، کد ملی و شماره موبایل دبیر را وارد فرمایید.');
      return;
    }

    try {
      const created = await apiFetch('/api/manager/teachers', {
        method: 'POST',
        body: JSON.stringify({
          fullName: newTeacherName.trim(),
          nationalId: newTeacherNationalId.trim(),
          phone: newTeacherPhone.trim(),
          teachableCourseIds: newTeacherTeachableCourseIds,
          specialty: newTeacherSpecialty.trim(),
        }),
      });

      setGeneratedTeacherCreds({
        fullName: created.fullName,
        username: created.nationalId,
        rawPassword: created.phone,
        specialty: created.specialty,
      });

      setTeachers(prev => [created, ...prev]);
      setTeacherProfiles(prev => [created, ...prev]);
      setFeedback(`دبیر گرامی «${created.fullName}» با موفقیت تعریف گردید.`);
      setTimeout(() => setFeedback(null), 3500);

      setNewTeacherName('');
      setNewTeacherPhone('');
      setNewTeacherNationalId('');
      setNewTeacherTeachableCourseIds([]);
    } catch (err: any) {
      alert(err.message || 'خطا در ثبت اطلاعات دبیر');
    }
  };

  // Handle Counselor Creation (Name, National ID, Phone, Attendance Days)
  const handleCreateCounselor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounselorName.trim() || !newCounselorNationalId.trim() || !newCounselorPhone.trim()) {
      alert('لطفاً نام و نام خانوادگی، کد ملی و شماره موبایل مشاور را وارد فرمایید.');
      return;
    }

    try {
      const created = await apiFetch('/api/manager/counselors', {
        method: 'POST',
        body: JSON.stringify({
          fullName: newCounselorName.trim(),
          nationalId: newCounselorNationalId.trim(),
          phone: newCounselorPhone.trim(),
          attendanceDays: newCounselorDays,
          specialty: newCounselorSpecialty.trim(),
        }),
      });

      setCounselors(prev => [created, ...prev]);
      setCounselorModalOpen(false);
      setFeedback(`مشاور گرامی «${created.fullName}» با موفقیت ثبت گردید.`);
      setTimeout(() => setFeedback(null), 3500);

      setNewCounselorName('');
      setNewCounselorNationalId('');
      setNewCounselorPhone('');
      setNewCounselorDays([0, 2, 4]);
    } catch (err: any) {
      alert(err.message || 'خطا در ثبت مشاور');
    }
  };

  // Handle Weekly Schedule (Saturday to Wednesday, 8:00 to 14:00, 1.5h slots)
  const handleCreateScheduleSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetClassId = newSchClassId || selectedScheduleClassId;
    if (!targetClassId) {
      alert('لطفاً کلاس را انتخاب نمایید.');
      return;
    }

    if (!newSchCourseId) {
      alert('لطفاً عنوان درسی را از بین دروس تعریف‌شده مدرسه انتخاب نمایید.');
      return;
    }

    const periodTimes: Record<number, { start: string; end: string }> = {
      1: { start: '08:00', end: '09:30' },
      2: { start: '09:45', end: '11:15' },
      3: { start: '11:30', end: '13:00' },
      4: { start: '13:00', end: '14:30' },
    };

    const slot = periodTimes[newSchPeriod] || { start: '08:00', end: '09:30' };

    // Resolve course title strictly from defined courses
    let courseTitle = '';
    if (newSchCourseId === 'free') {
      courseTitle = 'زنگ آزاد / مطالعه و خودآموزی';
    } else if (newSchCourseId === 'parvareshi') {
      courseTitle = 'امور پرورشی، فرهنگی و قرآن';
    } else if (newSchCourseId === 'counseling') {
      courseTitle = 'کارگاه هدایت تحصیلی و مشاوره';
    } else {
      const found = courses.find(c => c.id === newSchCourseId);
      if (found) {
        courseTitle = `${found.title} (پایه ${found.gradeLevel} - کد: ${found.code})`;
      } else {
        courseTitle = newSchCourseId;
      }
    }

    const targetClass = classes.find(c => c.id === targetClassId);
    const room = targetClass?.roomNumber || 'کلاس درس';

    try {
      const created = await apiFetch('/api/manager/schedule', {
        method: 'POST',
        body: JSON.stringify({
          classId: targetClassId,
          dayOfWeek: Number(newSchDayOfWeek),
          startTime: slot.start,
          endTime: slot.end,
          room,
          note: courseTitle,
        }),
      });

      // Update state without duplicate slots for same class/day/time
      setSchedules(prev => {
        const filtered = prev.filter(
          s => !(s.classId === targetClassId && s.dayOfWeek === Number(newSchDayOfWeek) && (s.startTime?.slice(0, 5) === slot.start))
        );
        return [...filtered, created];
      });

      setScheduleModalOpen(false);
      setNewSchCourseId('');
      setNewSchNote('');
      setFeedback(`زنگ با موفقیت برای «${targetClass?.name || 'کلاس'}» ثبت شد.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'خطا در ثبت برنامه کلاسی');
    }
  };

  // Handle Student Credential Creation (Strictly ONE class)
  const handleIssueStudentCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentNationalId.trim() || !newStudentPhone.trim() || !newStudentClassId) {
      alert('لطفاً نام و نام خانوادگی، کد ملی، شماره موبایل و کلاس دانش‌آموز را تکمیل نمایید.');
      return;
    }

    try {
      const created = await apiFetch('/api/manager/students', {
        method: 'POST',
        body: JSON.stringify({
          fullName: newStudentName.trim(),
          nationalId: newStudentNationalId.trim(),
          phone: newStudentPhone.trim(),
          classId: newStudentClassId,
        }),
      });

      setGeneratedCredentials({
        fullName: created.fullName,
        username: created.nationalId,
        rawPassword: created.phone,
      });

      setStudents(prev => [created, ...prev]);
      setFeedback(`دانش‌آموز «${created.fullName}» با موفقیت در کلاس ثبت شد.`);
      setTimeout(() => setFeedback(null), 3500);

      setNewStudentName('');
      setNewStudentNationalId('');
      setNewStudentPhone('');
      setNewStudentClassId('');
    } catch (err: any) {
      alert(err.message || 'خطا در ثبت دانش‌آموز');
    }
  };

  // Open class assignments modal
  const handleOpenClassAssignments = async (cls: ClassGroup) => {
    setSelectedClassForAssignments(cls);
    setAssignmentsModalOpen(true);
    setEditingAssignmentId(null);
    try {
      const assignments = await apiFetch(`/api/class-assignments?classId=${cls.id}`);
      setClassAssignmentsList(assignments);
    } catch {
      setClassAssignmentsList(cls.courseAssignments || []);
    }
  };

  // Save/Update teacher assignment for a course in a class
  const handleSaveCourseTeacher = async (courseId: string, teacherId: string, additionalTeacherIds: string[] = []) => {
    if (!selectedClassForAssignments) return;
    try {
      const saved = await apiFetch('/api/class-assignments', {
        method: 'POST',
        body: JSON.stringify({
          classId: selectedClassForAssignments.id,
          courseId,
          teacherId,
          additionalTeacherIds,
        }),
      });

      setClassAssignmentsList(prev => {
        const idx = prev.findIndex(a => a.courseId === courseId);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [...prev, saved];
      });

      setEditingAssignmentId(null);
      setFeedback(`دبیر درس «${saved.courseTitle}» با موفقیت انتصاب یافت.`);
      setTimeout(() => setFeedback(null), 3000);

      // Refresh classes & teacher profiles
      apiFetch('/api/classes').then(setClasses).catch(() => {});
      apiFetch('/api/teachers').then(setTeacherProfiles).catch(() => {});
    } catch (err: any) {
      alert(err.message || 'خطا در انتصاب دبیر به درس');
    }
  };

  // Delete course assignment from a class
  const handleDeleteCourseAssignment = async (assignmentId: string, courseTitle?: string) => {
    if (!window.confirm(`آیا از حذف این درس از برنامه این کلاس اطمینان دارید؟`)) return;
    try {
      await apiFetch(`/api/class-assignments/${assignmentId}`, { method: 'DELETE' });
      setClassAssignmentsList(prev => prev.filter(a => a.id !== assignmentId));
      setFeedback(`درس «${courseTitle || ''}» از برنامه این کلاس حذف گردید.`);
      setTimeout(() => setFeedback(null), 3000);
      apiFetch('/api/classes').then(setClasses).catch(() => {});
      apiFetch('/api/teachers').then(setTeacherProfiles).catch(() => {});
    } catch (err: any) {
      alert(err.message || 'خطا در حذف درس از کلاس');
    }
  };

  // Add new course to this class
  const handleAddNewCourseToClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForAssignments || !newCourseToClassId || !newCoursePrimaryTeacherId) {
      alert('لطفاً درس و دبیر را انتخاب فرمایید.');
      return;
    }
    await handleSaveCourseTeacher(newCourseToClassId, newCoursePrimaryTeacherId, []);
    setNewCourseToClassId('');
    setNewCoursePrimaryTeacherId('');
  };


  // Handle Grade Entry
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeCourseId || !gradeStudentId) {
      alert('لطفاً درس و دانش‌آموز را مشخص نمایید.');
      return;
    }

    try {
      await apiFetch('/api/grades', {
        method: 'POST',
        body: JSON.stringify({
          studentId: gradeStudentId,
          courseId: gradeCourseId,
          assessmentTitle: gradeAssessmentTitle,
          assessmentType: gradeType,
          score: Number(gradeScore),
          maxScore: 20,
          comments: gradeComments,
        }),
      });
      setGradeModalOpen(false);
      setFeedback('نمره با موفقیت در پرونده تحصیلی دانش‌آموز ثبت و میانگین‌ها به‌روزرسانی شدند.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'خطا در ثبت نمره');
    }
  };

  // View Student Report Card
  const handleInspectStudentCard = async (studentId: string) => {
    setPreviewLoading(true);
    try {
      const card = await apiFetch(`/api/report-card?studentId=${studentId}`);
      setPreviewStudentCard(card);
    } catch (err: any) {
      alert('خطا در دریافت کارنامه دانش‌آموز');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Handle Announcement
  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    try {
      const created = await apiFetch('/api/announcements', {
        method: 'POST',
        body: JSON.stringify({
          title: annTitle.trim(),
          content: annContent.trim(),
          targetAudience: annAudience,
        }),
      });
      setAnnouncements(prev => [created, ...prev]);
      setAnnModalOpen(false);
      setAnnTitle('');
      setAnnContent('');
      setFeedback('اطلاعیه جدید با موفقیت منتشر و به کارتابل کاربران ارسال شد.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'خطا در انتشار اطلاعیه');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered courses and classes
  const filteredCourses = selectedGradeFilter === 'all'
    ? courses
    : courses.filter(c => c.gradeLevel === selectedGradeFilter);

  const filteredClasses = selectedGradeFilter === 'all'
    ? classes
    : classes.filter(c => c.gradeLevel === selectedGradeFilter);

  if (activeTab === 'attendance') {
    return <AttendanceManagementView onLaunchKiosk={onLaunchKiosk} />;
  }
  if (activeTab === 'shifts_settings') {
    return <AttendanceShiftsSettingsView />;
  }
  if (activeTab === 'disciplinary') {
    return <DisciplinaryManagementView />;
  }
  if (activeTab === 'exams') {
    return <OnlineExamsManagementView userRole="manager" />;
  }

  return (
    <div className="space-y-6 text-right font-sans">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-700 bg-indigo-50 font-bold px-2.5 py-0.5 rounded-md">
              معاونت آموزشی دوره اول متوسطه
            </span>
            <span className="text-xs text-slate-500">پایه‌های هفتم، هشتم و نهم</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            پنل معاونت آموزشی · {user?.fullName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            تعریف دروس و کلاس‌ها، صدور اختصاصی نام کاربری و رمز دانش‌آموزان، تخصیص معلمان و نظارت بر نمرات
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setExcelModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl cursor-pointer shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>ثبت با اکسل</span>
          </button>

          <button
            onClick={() => setTeacherModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl cursor-pointer shadow-xs transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span>ثبت معلم جدید</span>
          </button>

          <button
            onClick={() => setCredentialModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>ثبت دانش‌آموز</span>
          </button>

          <button
            onClick={() => setCounselorModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl cursor-pointer transition-colors"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
            <span>ثبت مشاور جدید</span>
          </button>

          <button
            onClick={() => setScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl cursor-pointer transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>ثبت برنامه هفتگی</span>
          </button>

          <button
            onClick={() => setCourseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تعریف درس</span>
          </button>

          <button
            onClick={() => setClassModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تعریف کلاس</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">دانش‌آموزان ثبت‌شده (بدون خود‌ثبت‌نامی)</span>
          <span className="text-xl font-bold text-slate-900 font-mono tabular-nums block mt-1">
            {toPersianDigits(students.length)} <span className="text-xs text-slate-400 font-sans">نفر</span>
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">دروس مصوب دوره اول متوسطه</span>
          <span className="text-xl font-bold text-indigo-600 font-mono tabular-nums block mt-1">
            {toPersianDigits(courses.length)} <span className="text-xs text-slate-400 font-sans">عنوان</span>
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">کلاس‌های تحت کنترل معاونت</span>
          <span className="text-xl font-bold text-emerald-600 font-mono tabular-nums block mt-1">
            {toPersianDigits(classes.length)} <span className="text-xs text-slate-400 font-sans">کلاس</span>
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">کادر دبیران تخصصی</span>
          <span className="text-xl font-bold text-amber-600 font-mono tabular-nums block mt-1">
            {toPersianDigits(teachers.length)} <span className="text-xs text-slate-400 font-sans">معلم</span>
          </span>
        </div>
      </div>

      {/* Grade Level Filter Bar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">فیلتر پایه تحصیلی:</span>
        </div>
        <div className="flex items-center gap-1">
          {['all', 'هفتم', 'هشتم', 'نهم'].map(g => (
            <button
              key={g}
              onClick={() => setSelectedGradeFilter(g)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
                selectedGradeFilter === g
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {g === 'all' ? 'همه پایه‌ها' : `پایه ${g}`}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: COURSES (ثبت و تعریف دروس توسط معاونت آموزشی) */}
      {/* ======================================================== */}
      {(activeTab === 'courses' || activeTab === 'overview') && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 font-bold px-2.5 py-0.5 rounded-md">
                  سرفصل و عناوین دروس دوره اول متوسطه
                </span>
                <span className="text-xs text-slate-400">
                  {toPersianDigits(filteredCourses.length)} عنوان درس مصوب
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>ثبت و تعریف دروس (کد درس، نام و پایه تحصیلی)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تعریف دروس جهت انتصاب به کلاس‌ها، تخصیص به معلمان و ثبت در کارنامه تحصیلی
              </p>
            </div>
            <button
              onClick={() => setCourseModalOpen(true)}
              className="px-4 py-2 text-xs text-white bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ تعریف درس جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCourses.map(c => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{c.title}</h4>
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded font-bold">
                      پایه {c.gradeLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    کد درس: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{c.code}</span> · {toPersianDigits(c.units || 2)} واحد
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setGradeCourseId(c.id);
                      setGradeModalOpen(true);
                    }}
                    className="px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 rounded-lg cursor-pointer"
                  >
                    ثبت نمره
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(c.id, c.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="حذف درس"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: CLASSES (ثبت و مدیریت کلاس‌ها توسط معاونت آموزشی) */}
      {/* ======================================================== */}
      {(activeTab === 'classes' || activeTab === 'overview') && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 font-bold px-2.5 py-0.5 rounded-md">
                  کلاس‌بندی و گروه‌های آموزشی
                </span>
                <span className="text-xs text-slate-400">
                  {toPersianDigits(filteredClasses.length)} کلاس دایر
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                <School className="w-5 h-5 text-emerald-600" />
                <span>ثبت و مدیریت کلاس‌ها (اسم کلاس، پایه و انتصاب معلمان)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تعریف کلاس‌ها و تخصیص اساتید به تک‌تک دروس هر کلاس به‌صورت مستقل
              </p>
            </div>
            <button
              onClick={() => setClassModalOpen(true)}
              className="px-4 py-2 text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ کلاس جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClasses.map(cls => {
              const assignments = cls.courseAssignments || [];
              return (
                <div
                  key={cls.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700 space-y-3 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{cls.name}</h4>
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                          پایه {cls.gradeLevel || 'نهم'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        اتاق: {cls.roomNumber} · ظرفیت مجاز: {toPersianDigits(cls.maxCapacity)} نفر
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                        {toPersianDigits(cls.enrolledCount || 18)} دانش‌آموز
                      </span>
                      <button
                        onClick={() => handleDeleteClass(cls.id, cls.name)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="حذف کلاس"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Teacher Assignment Summary for this Class */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        <span>معلمان منتصب دروس این کلاس:</span>
                      </span>
                      <button
                        onClick={() => handleOpenClassAssignments(cls)}
                        className="text-xs text-indigo-700 dark:text-indigo-300 hover:underline font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                        <span>انتصاب و مدیریت ({toPersianDigits(assignments.length || 12)} درس)</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {assignments.slice(0, 6).map(a => (
                        <div
                          key={a.id}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
                        >
                          <span className="font-bold text-slate-900 dark:text-white">{a.courseTitle}:</span>
                          <span className="text-indigo-700 dark:text-indigo-300 font-semibold">{a.teacherName || 'استاد'}</span>
                          {a.additionalTeacherNames && a.additionalTeacherNames.length > 0 && (
                            <span className="text-emerald-700 dark:text-emerald-300 text-[9px] bg-emerald-50 dark:bg-emerald-950 px-1 rounded">
                              +{a.additionalTeacherNames.join('، ')}
                            </span>
                          )}
                        </div>
                      ))}
                      {assignments.length > 6 && (
                        <button
                          onClick={() => handleOpenClassAssignments(cls)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold cursor-pointer"
                        >
                          +{toPersianDigits(assignments.length - 6)} درس دیگر...
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: TEACHERS & FACULTY (لیست معلمین و انتصابات) */}
      {/* ======================================================== */}
      {(activeTab === 'teachers' || activeTab === 'overview') && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-700 bg-emerald-50 font-bold px-2.5 py-0.5 rounded-md">
                  کادر علمی و دبیران دوره اول متوسطه
                </span>
                <span className="text-xs text-slate-400">
                  {toPersianDigits(teacherProfiles.length || teachers.length)} دبیر مجرب
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mt-1">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>فهرست معلمان و تخصیص دروس</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تعریف معلمان، تخصیص به دروس کلاس‌های ۹۰۱، ۹۰۲ و ... با امکان انتخاب چند معلم برای یک درس
              </p>
            </div>

            <button
              onClick={() => setTeacherModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ تعریف معلم جدید</span>
            </button>
          </div>

          {/* Search & Specialty Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="جستجو بر اساس نام معلم، شماره همراه یا کد ملی..."
                value={teacherSearchQuery}
                onChange={e => setTeacherSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 shrink-0">فیلتر رشته:</span>
              <select
                value={teacherSpecialtyFilter}
                onChange={e => setTeacherSpecialtyFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="all">همه تخصص‌ها و رشته‌ها</option>
                <option value="ریاضی">ریاضیات و هندسه</option>
                <option value="علوم">علوم تجربی و آزمایشگاه</option>
                <option value="فارسی">ادبیات فارسی و نگارش</option>
                <option value="عربی">زبان عربی</option>
                <option value="معارف">معارف و قرآن</option>
                <option value="انگلیسی">زبان انگلیسی</option>
                <option value="اجتماعی">مطالعات اجتماعی</option>
              </select>
            </div>
          </div>

          {/* Teachers Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="p-3">نام و مشخصات معلم</th>
                  <th className="p-3">رشته و تخصص تدریس</th>
                  <th className="p-3">نام کاربری سامانه</th>
                  <th className="p-3">شماره تماس / کد ملی</th>
                  <th className="p-3">دروس و کلاس‌های منتصب</th>
                  <th className="p-3 text-center">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teacherProfiles
                  .filter(t => {
                    if (teacherSearchQuery) {
                      const q = teacherSearchQuery.toLowerCase();
                      const matchName = t.fullName.toLowerCase().includes(q);
                      const matchPhone = t.phone.includes(q);
                      const matchNational = t.nationalId ? t.nationalId.includes(q) : false;
                      const matchUser = t.username.toLowerCase().includes(q);
                      if (!matchName && !matchPhone && !matchNational && !matchUser) return false;
                    }
                    if (teacherSpecialtyFilter !== 'all') {
                      if (!t.specialty || !t.specialty.includes(teacherSpecialtyFilter)) return false;
                    }
                    return true;
                  })
                  .map(teacher => (
                    <tr key={teacher.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {teacher.fullName.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">{teacher.fullName}</div>
                            {teacher.bio && (
                              <div className="text-[10px] text-slate-400 line-clamp-1">{teacher.bio}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Briefcase className="w-3 h-3 text-emerald-600" />
                          <span>{teacher.specialty || 'دبیر تخصصی'}</span>
                        </span>
                      </td>

                      <td className="p-3 font-mono text-indigo-700 font-semibold">
                        {teacher.username}
                      </td>

                      <td className="p-3">
                        <div className="font-mono text-slate-700">{toPersianDigits(teacher.phone)}</div>
                        {teacher.nationalId && (
                          <div className="text-[10px] font-mono text-slate-400">کد ملی: {toPersianDigits(teacher.nationalId)}</div>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {teacher.assignedClasses && teacher.assignedClasses.length > 0 ? (
                            teacher.assignedClasses.map((ac, idx) => (
                              <span
                                key={idx}
                                className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                                  ac.isPrimary
                                    ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                                title={ac.isPrimary ? 'دبیر اصلی' : 'دبیر همکار / کمکی'}
                              >
                                {ac.className}: {ac.courseTitle}
                                {!ac.isPrimary && ' (همکار)'}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">هنوز کلاسی تخصیص داده نشده</span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          فعال
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: USERS & CREDENTIALS (صدور نام کاربری و رمز عبور) */}
      {/* ======================================================== */}
      {(activeTab === 'users' || activeTab === 'overview') && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>دانش‌آموزان ثبت‌شده و کارنامه‌ها</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ثبت‌نام مستقیم توسط دانش‌آموز مسدود است؛ کلیه حساب‌ها با رمز معتبر توسط معاونت آموزشی صادر می‌شوند.
              </p>
            </div>

            <button
              onClick={() => setCredentialModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>صدور حساب دانش‌آموز جدید</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="p-3">نام و نام خانوادگی</th>
                  <th className="p-3">نام کاربری سامانه</th>
                  <th className="p-3">کد دانش‌آموزی</th>
                  <th className="p-3">شماره تماس</th>
                  <th className="p-3">کلاس</th>
                  <th className="p-3 text-center">عملیات کارنامه</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.slice(0, 10).map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{s.fullName}</td>
                    <td className="p-3 font-mono text-indigo-700 font-semibold">{s.username}</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">{s.studentId || s.id}</td>
                    <td className="p-3 font-mono text-slate-600">{toPersianDigits(s.phone)}</td>
                    <td className="p-3 text-slate-700">کلاس ۹۰۱ (پایه نهم)</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleInspectStudentCard(s.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>مشاهده کارنامه و رتبه‌ها</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: ANNOUNCEMENTS & NOTICES */}
      {/* ======================================================== */}
      {(activeTab === 'announcements' || activeTab === 'overview') && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>اطلاعیه‌های معاونت آموزشی مؤسسه</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">ارسال اعلان رسمی به کارتابل دانش‌آموزان و دبیران</p>
            </div>
            <button
              onClick={() => setAnnModalOpen(true)}
              className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>ارسال اطلاعیه جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.slice(0, 4).map(ann => (
              <div key={ann.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{formatPersianDate(ann.publishedAt)}</span>
                  <span className="text-indigo-600 font-semibold">
                    {ann.targetAudience === 'all' ? 'عمومی' : ann.targetAudience === 'students' ? 'ویژه دانش‌آموزان' : 'ویژه دبیران'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{ann.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: COUNSELORS (ثبت و مدیریت مشاوران و روزهای حضور) */}
      {/* ======================================================== */}
      {(activeTab === 'counselors' || activeTab === 'overview') && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-700 bg-rose-50 font-bold px-2.5 py-0.5 rounded-md">
                  مرکز مشاوره و هدایت تحصیلی مدرسه
                </span>
                <span className="text-xs text-slate-400">
                  {toPersianDigits(counselors.length)} مشاور فعال
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mt-1">
                <HeartHandshake className="w-4 h-4 text-rose-600" />
                <span>لیست مشاوران و روزهای حضور در مدرسه</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تعریف مشاوران با کد ملی و شماره همراه با تعیین دقیق روزهای حضور (شنبه تا چهارشنبه)
              </p>
            </div>

            <button
              onClick={() => setCounselorModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ ثبت مشاور جدید</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="p-3">نام و مشخصات مشاور</th>
                  <th className="p-3">نام کاربری (کد ملی)</th>
                  <th className="p-3">شماره تماس (رمز ورود اولیه)</th>
                  <th className="p-3">حوزه و تخصص مشاوره</th>
                  <th className="p-3">روزهای حضور در مدرسه</th>
                  <th className="p-3 text-center">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {counselors.map(c => {
                  const dayNames: Record<number, string> = {
                    0: 'شنبه',
                    1: 'یکشنبه',
                    2: 'دوشنبه',
                    3: 'سه‌شنبه',
                    4: 'چهارشنبه',
                  };
                  const attDays = c.attendanceDays || [0, 2, 4];

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {c.fullName.slice(0, 2)}
                          </div>
                          <span className="font-extrabold text-slate-900">{c.fullName}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-indigo-700 font-bold">
                        {c.nationalId || c.username}
                      </td>
                      <td className="p-3 font-mono text-slate-700">
                        {toPersianDigits(c.phone)}
                      </td>
                      <td className="p-3">
                        <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          {c.specialty || 'مشاور تحصیلی و برنامه‌ریزی'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {[0, 1, 2, 3, 4].map(dayIdx => {
                            const isPresent = attDays.includes(dayIdx);
                            return (
                              <span
                                key={dayIdx}
                                className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                                  isPresent
                                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {dayNames[dayIdx]}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          فعال
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: WEEKLY SCHEDULE (برنامه هفتگی شنبه تا چهارشنبه) */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* SECTION: WEEKLY SCHEDULE (برنامه هفتگی شنبه تا چهارشنبه) */}
      {/* ======================================================== */}
      {(activeTab === 'schedules' || activeTab === 'overview') && (() => {
        const activeClassId = selectedScheduleClassId || (classes[0]?.id || '');
        const currentSelectedClass = classes.find(c => c.id === activeClassId);

        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-700 bg-amber-50 font-bold px-2.5 py-0.5 rounded-md">
                    سامانه زمان‌بندی آموزشی مصوب
                  </span>
                  <span className="text-xs text-slate-400">شنبه تا چهارشنبه · ۸:۰۰ الی ۱۴:۰۰ (۴ زنگ مصوب)</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>برنامه هفتگی کلاس‌های مدرسه نمونه دولتی شهید منانی</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تنظیم و مشاهده برنامه هفتگی به تفکیک کلاس با دروس مصوب ثبت‌شده در سامانه
                </p>
              </div>

              <button
                onClick={() => {
                  setNewSchClassId(activeClassId);
                  setScheduleModalOpen(true);
                }}
                className="px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ ثبت زنگ در برنامه کلاس</span>
              </button>
            </div>

            {/* CLASS SELECTOR BAR (انتخاب کلاس برای برنامه هفتگی) */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    انتخاب کلاس جهت تنظیم و مشاهده برنامه هفتگی:
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={activeClassId}
                      onChange={e => {
                        setSelectedScheduleClassId(e.target.value);
                        setNewSchClassId(e.target.value);
                      }}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-amber-500 shadow-2xs"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} — پایه {c.gradeLevel} (اتاق {c.roomNumber || 'عمومی'})
                        </option>
                      ))}
                    </select>
                    {currentSelectedClass && (
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg">
                        پایه {currentSelectedClass.gradeLevel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Class Switching Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-medium ml-1">دسترسی سریع به کلاس‌ها:</span>
                {classes.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedScheduleClassId(c.id);
                      setNewSchClassId(c.id);
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                      activeClassId === c.id
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {c.name.split(' ')[1] || c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 5-DAY WEEKLY SCHEDULE GRID (SATURDAY TO WEDNESDAY) FOR THE SELECTED CLASS */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                { day: 0, title: 'شنبه' },
                { day: 1, title: 'یکشنبه' },
                { day: 2, title: 'دوشنبه' },
                { day: 3, title: 'سه‌شنبه' },
                { day: 4, title: 'چهارشنبه' },
              ].map(col => {
                // FILTER STRICTLY BY SELECTED CLASS AND DAY
                const daySchedules = schedules.filter(
                  s => s.classId === activeClassId && s.dayOfWeek === col.day
                );

                const periodSlots = [
                  { period: 1, name: 'زنگ اول', start: '08:00', end: '09:30', time: '۰۸:۰۰ - ۰۹:۳۰' },
                  { period: 2, name: 'زنگ دوم', start: '09:45', end: '11:15', time: '۰۹:۴۵ - ۱۱:۱۵' },
                  { period: 3, name: 'زنگ سوم', start: '11:30', end: '13:00', time: '۱۱:۳۰ - ۱۳:۰۰' },
                  { period: 4, name: 'زنگ چهارم', start: '13:00', end: '14:30', time: '۱۳:۰۰ - ۱۴:۳۰' },
                ];

                return (
                  <div key={col.day} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                      <span className="font-extrabold text-slate-900 dark:text-white text-xs block">{col.title}</span>
                      <span className="text-[10px] text-slate-400">۴ زنگ مصوب (۱.۵ ساعته)</span>
                    </div>

                    <div className="space-y-2">
                      {periodSlots.map(p => {
                        const matched = daySchedules.find(s => {
                          const sStart = s.startTime?.slice(0, 5);
                          return sStart === p.start || s.note?.includes(`زنگ ${p.period}`);
                        });

                        if (matched) {
                          return (
                            <div key={p.period} className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1.5 shadow-2xs">
                              <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300 font-bold">
                                <span>{p.name}</span>
                                <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{p.time}</span>
                              </div>
                              <div className="text-slate-900 dark:text-white font-extrabold flex items-start justify-between gap-1">
                                <div className="flex items-center gap-1.5 truncate">
                                  <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span className="truncate">{matched.note || 'تدریس رسمی'}</span>
                                </div>
                                <button
                                  onClick={() => handleDeleteSchedule(matched.id)}
                                  className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer shrink-0 transition-colors"
                                  title="خالی کردن این زنگ (تبدیل به زنگ آزاد)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60">
                                <span>مکان: {matched.room || currentSelectedClass?.roomNumber || 'کلاس درس'}</span>
                                <button
                                  onClick={() => {
                                    setNewSchClassId(activeClassId);
                                    setNewSchDayOfWeek(col.day);
                                    setNewSchPeriod(p.period);
                                    setScheduleModalOpen(true);
                                  }}
                                  className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer font-bold"
                                >
                                  تغییر درس
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={p.period} className="p-2.5 rounded-lg bg-slate-100/60 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 text-[11px] space-y-1">
                            <div className="flex items-center justify-between text-slate-400 font-medium">
                              <span>{p.name}</span>
                              <span className="font-mono text-[10px]">{p.time}</span>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-slate-400 text-[10px] italic">زنگ آزاد / خالی</span>
                              <button
                                onClick={() => {
                                  setNewSchClassId(activeClassId);
                                  setNewSchDayOfWeek(col.day);
                                  setNewSchPeriod(p.period);
                                  setScheduleModalOpen(true);
                                }}
                                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:underline cursor-pointer flex items-center gap-0.5"
                              >
                                <Plus className="w-3 h-3" />
                                <span>تخصیص درس</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* SECTION: EXCEL IMPORT TAB */}
      {/* ======================================================== */}
      {activeTab === 'excel_import' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>ثبت گروهی اطلاعات با فایل اکسل (معلمان، کلاس‌ها، دانش‌آموزان)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                بارگذاری یکپارچه اطلاعات از طریق فایل اکسل با بررسی خودکار و اعتبارسنجی پیش از ثبت
              </p>
            </div>
            <button
              onClick={() => setExcelModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer shadow-xs flex items-center gap-2 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>باز کردن پنل آپلود اکسل</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-900 block">۱. ثبت گروهی معلمان</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                شامل ستون‌های: نام و نام خانوادگی، کد ملی، شماره موبایل، تخصص تدریس. نام کاربری برابر کد ملی و رمز اولیه شماره موبایل خواهد بود.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-900 block">۲. ثبت گروهی کلاس‌ها</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                شامل ستون‌های: نام کلاس (مثلاً کلاس ۹۰۱) و پایه تحصیلی (هفتم، هشتم یا نهم).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-900 block">۳. ثبت گروهی دانش‌آموزان</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                شامل ستون‌های: نام و نام خانوادگی، کد ملی، شماره تماس ولی/دانش‌آموز و نام کلاس. رمز عبور دانش‌آموزان توسط خودشان غیرقابل تغییر است.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: REPORT CARDS & MONTH COMPARISON */}
      {/* ======================================================== */}
      {activeTab === 'report_cards' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>کارنامه‌ها و مقایسه جامع با ماه قبل</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ارزیابی روند رشد تحصیلی، رتبه‌بندی در کلاس و پایه، و مقایسه نمرات تک‌تک دروس نسبت به ارزیابی ماه گذشته
                </p>
              </div>
            </div>

            <MonthComparisonView />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-900">مشاهده کارنامه رسمی و ریزنمرات به تفکیک دانش‌آموز:</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="p-3">نام و نام خانوادگی</th>
                    <th className="p-3">کد ملی</th>
                    <th className="p-3">شماره تماس</th>
                    <th className="p-3">کلاس</th>
                    <th className="p-3 text-center">مشاهده و چاپ کارنامه PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{s.fullName}</td>
                      <td className="p-3 font-mono text-indigo-700 font-bold">{s.nationalId || s.username}</td>
                      <td className="p-3 font-mono text-slate-600">{toPersianDigits(s.phone)}</td>
                      <td className="p-3 text-slate-700">کلاس ۹۰۱ (پایه نهم)</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleInspectStudentCard(s.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>مشاهده و چاپ کارنامه</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: DEFINE NEW COURSE (ثبت درس: کد درس، نام و پایه درس) */}
      {/* ======================================================== */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-right space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>ثبت درس جدید (کد درس، نام و پایه)</span>
              </h3>
              <button onClick={() => setCourseModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">کد درس</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: MATH-09، SCI-08، FA-07"
                  value={newCourseCode}
                  onChange={e => setNewCourseCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">نام درس</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ریاضیات، علوم تجربی، زبان انگلیسی"
                  value={newCourseTitle}
                  onChange={e => setNewCourseTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">پایه تحصیلی درس</label>
                <select
                  value={newCourseGrade}
                  onChange={e => setNewCourseGrade(e.target.value as GradeLevel)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                >
                  <option value="هفتم">پایه هفتم</option>
                  <option value="هشتم">پایه هشتم</option>
                  <option value="نهم">پایه نهم</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                ثبت درس
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: DEFINE NEW CLASS (ثبت کلاس: اسم کلاس و پایه) */}
      {/* ======================================================== */}
      {classModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-right space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <School className="w-4 h-4 text-emerald-600" />
                <span>ثبت کلاس جدید (اسم کلاس و پایه)</span>
              </h3>
              <button onClick={() => setClassModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">اسم کلاس</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: کلاس ۹۰۱، کلاس ۹۰۲، کلاس ۸۰۱، کلاس ۷۰۳"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">پایه تحصیلی</label>
                <select
                  value={newClassGrade}
                  onChange={e => setNewClassGrade(e.target.value as GradeLevel)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                >
                  <option value="هفتم">پایه هفتم</option>
                  <option value="هشتم">پایه هشتم</option>
                  <option value="نهم">پایه نهم</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer"
              >
                ثبت و تأسیس کلاس
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ISSUE STUDENT CREDENTIAL (صدور کاربری توسط مدرسه) */}
      {/* ======================================================== */}
      {credentialModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-right space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span>صدور نام کاربری و رمز عبور دانش‌آموز</span>
              </h3>
              <button
                onClick={() => {
                  setCredentialModalOpen(false);
                  setGeneratedCredentials(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {generatedCredentials ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>حساب کاربری دانش‌آموز با موفقیت صادر شد!</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    این اطلاعات را پرینت نموده یا تحویل دانش‌آموز <strong>{generatedCredentials.fullName}</strong> دهید:
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">نام و نام خانوادگی:</span>
                    <strong className="text-slate-900 font-sans text-xs">{generatedCredentials.fullName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">نام کاربری (کد ملی):</span>
                    <strong className="text-indigo-700 text-sm select-all">{generatedCredentials.username}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">رمز ورود (شماره موبایل):</span>
                    <strong className="text-rose-700 text-sm select-all">{generatedCredentials.rawPassword}</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-[11px] font-sans text-amber-800 bg-amber-50 p-2 rounded-lg">
                    توجه: رمز عبور دانش‌آموز فقط توسط مدیر و معاون مدرسه قابل ویرایش یا ریست می‌باشد.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(`نام دانش‌آموز: ${generatedCredentials.fullName}\nنام کاربری (کد ملی): ${generatedCredentials.username}\nرمز ورود: ${generatedCredentials.rawPassword}\nمدرسه نمونه دولتی شهید منانی`)}
                    className="flex-1 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'کپی شد' : 'کپی مشخصات ورود'}</span>
                  </button>

                  <button
                    onClick={() => setGeneratedCredentials(null)}
                    className="py-2 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                  >
                    ثبت بعدی
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleIssueStudentCredential} className="space-y-3.5">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-amber-900 text-[11px] leading-relaxed">
                  <strong>توجه:</strong> نام کاربری برابر با کد ملی و رمز اولیه برابر با شماره موبایل است. امکان تغییر رمز دانش‌آموز صرفاً در اختیار مدیر و معاون است. دانش‌آموز فقط می‌تواند در یک کلاس عضو باشد.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">نام و نام خانوادگی دانش‌آموز</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: محمدحسین تقوی"
                    value={newStudentName}
                    onChange={e => setNewStudentName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">کد ملی (نام کاربری ورود)</label>
                    <input
                      type="text"
                      required
                      placeholder="۱۰ رقم کد ملی"
                      value={newStudentNationalId}
                      onChange={e => setNewStudentNationalId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">شماره موبایل (رمز ورود)</label>
                    <input
                      type="text"
                      required
                      placeholder="۰۹۱۱..."
                      value={newStudentPhone}
                      onChange={e => setNewStudentPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    انتخاب کلاس (هر دانش‌آموز فقط در یک کلاس می‌تواند باشد)
                  </label>
                  <select
                    required
                    value={newStudentClassId}
                    onChange={e => setNewStudentClassId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                  >
                    <option value="">-- لطفاً یک کلاس را انتخاب نمایید --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (پایه {c.gradeLevel})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
                >
                  ثبت قطعی دانش‌آموز و فعال‌سازی حساب
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: GRADE ENTRY (ثبت نمره برای درس و دانش‌آموز) */}
      {/* ======================================================== */}
      {gradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-right space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>ثبت نمره در کارنامه دانش‌آموز</span>
              </h3>
              <button onClick={() => setGradeModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">درس مورد نظر</label>
                <select
                  required
                  value={gradeCourseId}
                  onChange={e => setGradeCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                >
                  <option value="">-- انتخاب درس --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title} (پایه {c.gradeLevel})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">انتخاب دانش‌آموز</label>
                <select
                  required
                  value={gradeStudentId}
                  onChange={e => setGradeStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                >
                  <option value="">-- انتخاب دانش‌آموز --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.username})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">نمره کسب‌شده (از ۲۰)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="20"
                    required
                    value={gradeScore}
                    onChange={e => setGradeScore(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono font-bold text-indigo-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">نوع ارزیابی</label>
                  <select
                    value={gradeType}
                    onChange={e => setGradeType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  >
                    <option value="final">پایان‌ترم / کارنامه</option>
                    <option value="midterm">میان‌ترم</option>
                    <option value="quiz">آزمونک کلاسی</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">توضیحات و بازخورد</label>
                <input
                  type="text"
                  placeholder="مثال: تسلط خوب بر فصل هندسه"
                  value={gradeComments}
                  onChange={e => setGradeComments(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                ثبت نمره در کارنامه
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: REPORT CARD PREVIEW (مشاهده کارنامه توسط معاون) */}
      {/* ======================================================== */}
      {(previewStudentCard || previewLoading) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-50 rounded-3xl max-w-5xl w-full p-6 text-right space-y-4 shadow-2xl border border-slate-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <span>بررسی کارنامه رسمی و ریزنمرات مقایسه‌ای دانش‌آموز</span>
              </h3>
              <button
                onClick={() => setPreviewStudentCard(null)}
                className="p-1 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ReportCardView card={previewStudentCard} isLoading={previewLoading} />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: ANNOUNCEMENT MODAL */}
      {/* ======================================================== */}
      {annModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-right space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">انتشار اطلاعیه رسمی دبیرستان شهید منانی</h3>
              <button onClick={() => setAnnModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handlePublishAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">موضوع و تیتر اطلاعیه</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: زمان تحویل کارنامه‌های نوبت اول پایه‌های هفتم، هشتم و نهم"
                  value={annTitle}
                  onChange={e => setAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">مخاطبان هدف</label>
                <select
                  value={annAudience}
                  onChange={e => setAnnAudience(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                >
                  <option value="all">کلیه کاربران (عمومی)</option>
                  <option value="students">فقط دانش‌آموزان</option>
                  <option value="teachers">فقط دبیران و کادر علمی</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">متن کامل اطلاعیه</label>
                <textarea
                  required
                  rows={4}
                  placeholder="متن اطلاعیه..."
                  value={annContent}
                  onChange={e => setAnnContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                انتشار و ارسال اعلان به کاربران
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 7: DEFINE NEW TEACHER (تعریف معلم جدید) */}
      {/* ======================================================== */}
      {teacherModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-right space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>تعریف معلم جدید و صدور دسترسی به سامانه</span>
              </h3>
              <button
                onClick={() => {
                  setTeacherModalOpen(false);
                  setGeneratedTeacherCreds(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {generatedTeacherCreds ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>دبیر با موفقیت ثبت و دسترسی صادر گردید:</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-emerald-200/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">نام و نام خانوادگی:</span>
                    <strong className="text-slate-900">{generatedTeacherCreds.fullName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">نام کاربری (کد ملی):</span>
                    <strong className="font-mono text-indigo-700 font-bold">{generatedTeacherCreds.username}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">رمز اولیه (شماره موبایل):</span>
                    <strong className="font-mono text-slate-900 font-bold">{generatedTeacherCreds.rawPassword}</strong>
                  </div>
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg">
                    توجه: این رمز عبور اولیه است و توسط خود معلم در بخش پروفایل شخصی قابل تغییر است.
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => copyToClipboard(`دبیر: ${generatedTeacherCreds.fullName}\nنام کاربری (کد ملی): ${generatedTeacherCreds.username}\nرمز عبور: ${generatedTeacherCreds.rawPassword}\nمدرسه نمونه دولتی شهید منانی`)}
                    className="flex-1 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'کپی شد' : 'کپی مشخصات ورود'}</span>
                  </button>
                  <button
                    onClick={() => setGeneratedTeacherCreds(null)}
                    className="py-2 px-3 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg cursor-pointer"
                  >
                    تعریف دبیر دیگر
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateTeacher} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">نام و نام خانوادگی معلم</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: استاد مجید قنبری"
                    value={newTeacherName}
                    onChange={e => setNewTeacherName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">کد ملی معلم (نام کاربری ورود)</label>
                    <input
                      type="text"
                      required
                      placeholder="۱۰ رقم کد ملی"
                      value={newTeacherNationalId}
                      onChange={e => setNewTeacherNationalId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">شماره همراه (رمز ورود اولیه)</label>
                    <input
                      type="text"
                      required
                      placeholder="۰۹۱۱..."
                      value={newTeacherPhone}
                      onChange={e => setNewTeacherPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      رمز اولیه بوده و توسط خود کاربر قابل تغییر است.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    دروس قابل تدریس (انتخاب تیک‌زدنی - امکان انتخاب چند درس):
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2.5 bg-slate-50 space-y-1.5">
                    {courses.map(course => {
                      const isChecked = newTeacherTeachableCourseIds.includes(course.id);
                      return (
                        <label
                          key={course.id}
                          className="flex items-center gap-2 text-xs p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              if (e.target.checked) {
                                setNewTeacherTeachableCourseIds(prev => [...prev, course.id]);
                              } else {
                                setNewTeacherTeachableCourseIds(prev => prev.filter(id => id !== course.id));
                              }
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="font-semibold text-slate-800">{course.title}</span>
                          <span className="text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded font-mono">
                            پایه {course.gradeLevel} · {course.code}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">تخصص یا رشته تدریس (اختیاری)</label>
                  <input
                    type="text"
                    placeholder="مثال: دبیر ریاضیات و هندسه"
                    value={newTeacherSpecialty}
                    onChange={e => setNewTeacherSpecialty(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  ثبت مشخصات معلم و صدور دسترسی
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 8: CLASS COURSE TEACHER ASSIGNMENTS (انتصاب معلمان دروس کلاس) */}
      {/* ======================================================== */}
      {assignmentsModalOpen && selectedClassForAssignments && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-6 text-right space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-indigo-700 bg-indigo-50 font-bold px-2.5 py-0.5 rounded-md">
                    پایه {selectedClassForAssignments.gradeLevel || 'نهم'}
                  </span>
                  <span className="text-xs text-slate-500">اتاق {selectedClassForAssignments.roomNumber}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mt-1">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <span>مدیریت دروس و انتصاب معلمان · {selectedClassForAssignments.name}</span>
                </h3>
              </div>
              <button
                onClick={() => setAssignmentsModalOpen(false)}
                className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informative Guidance Banner */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>راهنمای تخصیص دروس به اساتید:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-indigo-900/80">
                برای هر درس در این کلاس، می‌توانید معلم مورد نظر را از فهرست معلمان انتخاب فرمایید.
                همچنین در صورتی که یک درس دارای چند معلم (دبیر همکار یا کمک‌آموزشی) باشد، می‌توانید معلمان اضافی را نیز علامت بزنید.
                <br />
                <strong className="text-indigo-950">نمونه:</strong> در کلاس ۹۰۱ درس ریاضی به <strong>آقای قنبری</strong> و در کلاس ۹۰۲ همان درس ریاضی به <strong>آقای علوی</strong> تخصیص می‌یابد.
              </p>
            </div>

            {/* Assignments Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">نام درس</th>
                    <th className="p-3">کد درس</th>
                    <th className="p-3">ساعت هفتگی</th>
                    <th className="p-3">دبیر اصلی درس</th>
                    <th className="p-3">دبیران همکار / کمکی</th>
                    <th className="p-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classAssignmentsList.map((assignment, idx) => {
                    const isEditing = editingAssignmentId === assignment.id;

                    return (
                      <tr key={assignment.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">
                          {assignment.courseTitle || 'درس'}
                        </td>
                        <td className="p-3 font-mono text-slate-500 text-[11px]">
                          {assignment.courseCode || '-'}
                        </td>
                        <td className="p-3 font-mono text-slate-600">
                          {toPersianDigits(assignment.weeklyHours || 2)} ساعت
                        </td>

                        {/* Primary Teacher Cell */}
                        <td className="p-3">
                          {isEditing ? (
                            <select
                              value={editPrimaryTeacherId}
                              onChange={e => setEditPrimaryTeacherId(e.target.value)}
                              className="w-full px-2 py-1 text-xs rounded-lg border border-indigo-300 bg-white"
                            >
                              {teachers.map(t => (
                                <option key={t.id} value={t.id}>
                                  {t.fullName} {t.specialty ? `(${t.specialty})` : ''}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 inline-block">
                              {assignment.teacherName || 'مشخص نشده'}
                            </span>
                          )}
                        </td>

                        {/* Additional Teachers (Support multiple teachers per course) */}
                        <td className="p-3">
                          {isEditing ? (
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-400 block">انتخاب همکاران (اختیاری):</span>
                              <div className="max-h-24 overflow-y-auto space-y-1 p-1 bg-white border border-slate-200 rounded-lg">
                                {teachers
                                  .filter(t => t.id !== editPrimaryTeacherId)
                                  .map(t => {
                                    const checked = editAdditionalTeacherIds.includes(t.id);
                                    return (
                                      <label key={t.id} className="flex items-center gap-1.5 text-[11px] cursor-pointer hover:bg-slate-50 px-1 py-0.5 rounded">
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={e => {
                                            if (e.target.checked) {
                                              setEditAdditionalTeacherIds(prev => [...prev, t.id]);
                                            } else {
                                              setEditAdditionalTeacherIds(prev => prev.filter(id => id !== t.id));
                                            }
                                          }}
                                          className="rounded text-indigo-600"
                                        />
                                        <span>{t.fullName}</span>
                                      </label>
                                    );
                                  })}
                              </div>
                            </div>
                          ) : (
                            <div>
                              {assignment.additionalTeacherNames && assignment.additionalTeacherNames.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {assignment.additionalTeacherNames.map((name, i) => (
                                    <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      {name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[11px] italic">بدون همکار</span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleSaveCourseTeacher(assignment.courseId, editPrimaryTeacherId, editAdditionalTeacherIds)}
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                              >
                                ذخیره
                              </button>
                              <button
                                onClick={() => setEditingAssignmentId(null)}
                                className="px-2 py-1 text-[11px] text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                              >
                                لغو
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingAssignmentId(assignment.id);
                                  setEditPrimaryTeacherId(assignment.teacherId);
                                  setEditAdditionalTeacherIds(assignment.additionalTeacherIds || []);
                                }}
                                className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer"
                              >
                                تغییر دبیر
                              </button>
                              <button
                                onClick={() => handleDeleteCourseAssignment(assignment.id, assignment.courseTitle)}
                                className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="حذف درس از این کلاس"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick Add Another Course to this class */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>افزودن درس جدید به برنامه درسی این کلاس:</span>
              </h4>

              <form onSubmit={handleAddNewCourseToClass} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">انتخاب درس</label>
                  <select
                    value={newCourseToClassId}
                    onChange={e => setNewCourseToClassId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="">-- انتخاب از سرفصل‌ها --</option>
                    {courses.map(crs => (
                      <option key={crs.id} value={crs.id}>
                        {crs.title} (پایه {crs.gradeLevel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">انتخاب دبیر اصلی</label>
                  <select
                    value={newCoursePrimaryTeacherId}
                    onChange={e => setNewCoursePrimaryTeacherId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="">-- انتخاب معلم --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} {t.specialty ? `(${t.specialty})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full py-1.5 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                  >
                    ثبت درس و تخصیص دبیر
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 9: DEFINE NEW COUNSELOR (ثبت مشاور و روزهای حضور) */}
      {/* ======================================================== */}
      {counselorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-right space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-600" />
                <span>ثبت مشاور جدید و روزهای حضور در مدرسه</span>
              </h3>
              <button onClick={() => setCounselorModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateCounselor} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">نام و نام خانوادگی مشاور</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: دکتر علیرضا سلیمانی"
                  value={newCounselorName}
                  onChange={e => setNewCounselorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">کد ملی (نام کاربری)</label>
                  <input
                    type="text"
                    required
                    placeholder="۱۰ رقم کد ملی"
                    value={newCounselorNationalId}
                    onChange={e => setNewCounselorNationalId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">شماره همراه (رمز ورود)</label>
                  <input
                    type="text"
                    required
                    placeholder="۰۹۱۱..."
                    value={newCounselorPhone}
                    onChange={e => setNewCounselorPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>
              <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                توجه: شماره همراه به عنوان رمز اولیه است و توسط خود مشاور در پنل شخصی قابل تغییر می‌باشد.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  روزهای حضور در مدرسه (شنبه تا چهارشنبه):
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {[
                    { id: 0, label: 'شنبه' },
                    { id: 1, label: 'یکشنبه' },
                    { id: 2, label: 'دوشنبه' },
                    { id: 3, label: 'سه‌شنبه' },
                    { id: 4, label: 'چهارشنبه' },
                  ].map(day => (
                    <label key={day.id} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newCounselorDays.includes(day.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setNewCounselorDays(prev => [...prev, day.id]);
                          } else {
                            setNewCounselorDays(prev => prev.filter(d => d !== day.id));
                          }
                        }}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span className="font-medium text-slate-800">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">حوزه / تخصص مشاوره (اختیاری)</label>
                <input
                  type="text"
                  placeholder="مثال: مشاور تحصیلی، برنامه‌ریزی درسی و انگیزشی"
                  value={newCounselorSpecialty}
                  onChange={e => setNewCounselorSpecialty(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer"
              >
                ثبت مشاور و فعال‌سازی دسترسی
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 10: WEEKLY SCHEDULE SLOT (ثبت زنگ در برنامه هفتگی) */}
      {/* ======================================================== */}
      {scheduleModalOpen && (() => {
        const modalTargetClass = classes.find(c => c.id === (newSchClassId || selectedScheduleClassId || classes[0]?.id));
        const gradeCourses = modalTargetClass ? courses.filter(c => c.gradeLevel === modalTargetClass.gradeLevel) : [];
        const otherCourses = modalTargetClass ? courses.filter(c => c.gradeLevel !== modalTargetClass.gradeLevel) : courses;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 text-right space-y-4 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>ثبت و تنظیم زنگ در برنامه هفتگی</span>
                </h3>
                <button onClick={() => setScheduleModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleCreateScheduleSlot} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">انتخاب کلاس</label>
                  <select
                    required
                    value={newSchClassId || selectedScheduleClassId || (classes[0]?.id || '')}
                    onChange={e => {
                      setNewSchClassId(e.target.value);
                      setSelectedScheduleClassId(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium bg-white text-slate-900"
                  >
                    <option value="">-- لطفاً کلاس را انتخاب فرمایید --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (پایه {c.gradeLevel} - اتاق {c.roomNumber || 'عمومی'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">روز هفته (شنبه تا چهارشنبه)</label>
                  <select
                    value={newSchDayOfWeek}
                    onChange={e => setNewSchDayOfWeek(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium bg-white text-slate-900"
                  >
                    <option value={0}>شنبه (۰۸:۰۰ الی ۱۴:۰۰)</option>
                    <option value={1}>یکشنبه (۰۸:۰۰ الی ۱۴:۰۰)</option>
                    <option value={2}>دوشنبه (۰۸:۰۰ الی ۱۲:۳۰ - سه زنگ)</option>
                    <option value={3}>سه‌شنبه (۰۸:۰۰ الی ۱۴:۰۰)</option>
                    <option value={4}>چهارشنبه (۰۸:۰۰ الی ۱۲:۳۰ - سه زنگ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">زنگ کلاسی (هر زنگ ۱.۵ ساعت)</label>
                  <select
                    value={newSchPeriod}
                    onChange={e => setNewSchPeriod(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium bg-white text-slate-900"
                  >
                    <option value={1}>زنگ اول: ۰۸:۰۰ الی ۰۹:۳۰ (۱.۵ ساعت)</option>
                    <option value={2}>زنگ دوم: ۰۹:۴۵ الی ۱۱:۱۵ (۱.۵ ساعت)</option>
                    <option value={3}>زنگ سوم: ۱۱:۳۰ الی ۱۳:۰۰ (۱.۵ ساعت)</option>
                    <option value={4}>زنگ چهارم: ۱۳:۰۰ الی ۱۴:۳۰ (۱.۵ ساعت)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    انتخاب عنوان درسی (از بین دروس تعریف‌شده مدرسه)
                  </label>
                  <select
                    required
                    value={newSchCourseId}
                    onChange={e => setNewSchCourseId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium bg-white text-slate-900"
                  >
                    <option value="">-- لطفاً عنوان درس را انتخاب فرمایید --</option>
                    
                    {gradeCourses.length > 0 && (
                      <optgroup label={`دروس مصوب پایه ${modalTargetClass?.gradeLevel}`}>
                        {gradeCourses.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.title} (کد: {c.code})
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {otherCourses.length > 0 && (
                      <optgroup label="سایر دروس تعریف‌شده در سامانه">
                        {otherCourses.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.title} (پایه {c.gradeLevel} - کد: {c.code})
                          </option>
                        ))}
                      </optgroup>
                    )}

                    <optgroup label="سایر فعالیت‌های کلاسی و رسمی">
                      <option value="free">زنگ آزاد / مطالعه و خودآموزی</option>
                      <option value="parvareshi">امور پرورشی، فرهنگی و قرآن</option>
                      <option value="counseling">کارگاه هدایت تحصیلی و مشاوره</option>
                    </optgroup>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    * عنوان درس منحصراً از دروس ثبت‌شده در سامانه انتخاب می‌شود (غیر خودنویس).
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  ثبت زنگ در برنامه هفتگی کلاس
                </button>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* MODAL 11: EXCEL BULK IMPORT MODAL */}
      {/* ======================================================== */}
      <ExcelImportModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        onSuccess={loadData}
      />

    </div>
  );
};
