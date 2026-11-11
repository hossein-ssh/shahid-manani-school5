// Andisheh Sari System Types
export type UserRole = 'super_admin' | 'manager' | 'teacher' | 'student' | 'counselor' | 'kiosk';
export type UserStatus = 'active' | 'pending' | 'suspended' | 'deactivated';

export interface User {
  id: string;
  username: string;
  email?: string;
  phone: string;
  role: UserRole;
  fullName: string;
  nationalId?: string;
  studentId?: string;
  avatarUrl?: string;
  status: UserStatus;
  bio?: string;
  specialty?: string; // رشته/عنوان تخصصی تدریس یا مشاوره
  teachableCourseIds?: string[]; // شناسه دروسی که معلم می‌تواند تدریس کند (تیک‌زدنی)
  attendanceDays?: number[]; // روزهای حضور مشاور در مدرسه (۰=شنبه الی ۴=چهارشنبه)
  canChangePassword?: boolean; // آیا کاربر دسترسی تغییر رمز دارد؟ (برای دانش‌آموز غیرفعال است)
  classId?: string; // برای دانش‌آموز: شناسه کلاسی که دانش‌آموز فقط در آن عضو است
  className?: string; // نام کلاس منتسب شده
  gradeLevel?: GradeLevel | string; // پایه تحصیلی دانش‌آموز
  createdAt: string;
  updatedAt: string;
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

export interface MonthComparisonItem {
  courseId: string;
  courseTitle: string;
  currentScore: number;
  previousScore: number;
  delta: number; // current - previous
  deltaPercentage: number;
  status: 'growth' | 'decline' | 'stable';
  currentRank: number;
  previousRank: number;
  rankDelta: number; // positive means improved rank
}

export interface MonthlyComparisonReport {
  studentId: string;
  studentName: string;
  className: string;
  currentMonth: string;
  previousMonth: string;
  currentGpa: number;
  previousGpa: number;
  gpaDelta: number;
  currentOverallRank: number;
  previousOverallRank: number;
  items: MonthComparisonItem[];
}

export interface SiteUpdatePackage {
  id: string;
  version: string;
  title: string;
  description: string;
  releaseDate: string;
  author: string;
  appliedAt?: string;
  status: 'pending' | 'applied' | 'failed';
  changelog: string[];
  fileSize?: string;
  checksum?: string;
}

export interface SystemSettings {
  id: string;
  instituteName: string;
  onlineClassesEnabled: boolean;
  allowStudentRegistration: boolean;
  requireRegistrationApproval: boolean;
  counselorBookingNoticeHours: number;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  currentAcademicTermId?: string;
  updatedAt: string;
}

export interface AcademicTerm {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export type GradeLevel = 'هفتم' | 'هشتم' | 'نهم';

export interface CourseReportCardItem {
  courseId: string;
  courseTitle: string;
  score: number;
  classAverage: number;
  gradeAverage: number;
  classRank: number;
  classTotalStudents: number;
  gradeRank: number;
  gradeTotalStudents: number;
  performance: 'higher' | 'lower' | 'equal';
}

export interface StudentReportCard {
  student: User;
  className: string;
  gradeLevel: GradeLevel | string;
  overallGpa: number;
  classGpaAverage: number;
  gradeGpaAverage: number;
  overallClassRank: number;
  classTotalStudents: number;
  overallGradeRank: number;
  gradeTotalStudents: number;
  overallStatus: 'خیلی خوب' | 'خوب' | 'قابل قبول' | 'نیاز به تلاش بیشتر';
  courses: CourseReportCardItem[];
}

export interface Course {
  id: string;
  code: string;
  title: string;
  gradeLevel: GradeLevel | string; // هفتم، هشتم، نهم
  fieldOfStudy?: string;
  units?: number;
  description?: string;
}

export interface ClassCourseAssignment {
  id: string;
  classId: string;
  courseId: string;
  teacherId: string;
  additionalTeacherIds?: string[];
  academicTermId?: string;
  weeklyHours?: number;
  courseTitle?: string;
  courseCode?: string;
  teacherName?: string;
  additionalTeacherNames?: string[];
  className?: string;
  gradeLevel?: GradeLevel | string;
}

export interface ClassGroup {
  id: string;
  name: string;
  gradeLevel?: GradeLevel | string;
  courseId: string;
  teacherId: string;
  academicTermId: string;
  roomNumber: string;
  maxCapacity: number;
  courseTitle?: string;
  teacherName?: string;
  termTitle?: string;
  enrolledCount?: number;
  courseAssignments?: ClassCourseAssignment[];
  createdAt: string;
}

export interface TeacherProfile extends User {
  assignedClasses?: {
    assignmentId: string;
    classId: string;
    className: string;
    courseId: string;
    courseTitle: string;
    isPrimary: boolean;
  }[];
  activeClassesCount?: number;
  activeCoursesCount?: number;
}

export interface ClassEnrollment {
  id: string;
  classId: string;
  studentId: string;
  enrolledAt: string;
}

export interface ScheduleItem {
  id: string;
  classId: string;
  dayOfWeek: number; // 0=شنبه, 1=یکشنبه, 2=دوشنبه, 3=سه‌شنبه, 4=چهارشنبه, 5=پنجشنبه
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "09:30"
  room: string;
  isOnline: boolean;
  status: 'scheduled' | 'cancelled' | 'rescheduled';
  note?: string;
  className?: string;
  courseTitle?: string;
  teacherName?: string;
  teacherId?: string;
}

export interface Assessment {
  id: string;
  classId: string;
  title: string;
  type: 'quiz' | 'midterm' | 'final' | 'homework' | 'project';
  maxScore: number;
  assessmentDate: string;
  description?: string;
  className?: string;
  courseTitle?: string;
  teacherId?: string;
  createdAt: string;
}

export interface Grade {
  id: string;
  assessmentId: string;
  studentId: string;
  score: number;
  maxScore: number;
  comments?: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  updatedBy: string;
  updatedAt: string;
  studentName?: string;
  studentCode?: string;
  assessmentTitle?: string;
  assessmentType?: string;
  className?: string;
  courseTitle?: string;
}

export interface GradeHistory {
  id: string;
  gradeId: string;
  previousScore?: number;
  newScore: number;
  previousStatus?: string;
  newStatus: string;
  changedBy: string;
  changedByName?: string;
  reason?: string;
  changedAt: string;
}

export interface OnlineSession {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  description?: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  meetingUrl: string;
  accessCode?: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  className?: string;
  courseTitle?: string;
  teacherName?: string;
  createdAt: string;
}

export interface CounselorAvailability {
  id: string;
  counselorId: string;
  counselorName?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  note?: string;
}

export interface CounselingRequest {
  id: string;
  studentId: string;
  counselorId: string;
  studentName?: string;
  counselorName?: string;
  subject: string;
  category: 'academic' | 'career' | 'personal' | 'exam_prep';
  status: 'pending' | 'in_progress' | 'resolved' | 'cancelled';
  preferredTime?: string;
  privateNotes?: string; // Only accessible by counselor/admin
  messageCount?: number;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CounselingMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderRole: UserRole;
  senderName?: string;
  message: string;
  isRead: boolean;
  sentAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorRole?: string;
  targetAudience: 'all' | 'students' | 'teachers' | 'class';
  targetClassId?: string;
  targetClassName?: string;
  isPublished: boolean;
  publishedAt: string;
  expiresAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'announcement' | 'grade' | 'schedule' | 'online_class' | 'counseling' | 'survey' | 'warning';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface SurveyQuestion {
  id: string;
  surveyId: string;
  questionText: string;
  questionType: 'multiple_choice' | 'rating' | 'text';
  options?: string[];
  isRequired: boolean;
  sortOrder: number;
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  isAnonymous: boolean;
  targetAudience: 'all' | 'students' | 'teachers';
  isPublished: boolean;
  questions?: SurveyQuestion[];
  responseCount?: number;
  userHasResponded?: boolean;
  createdAt: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId?: string | null;
  answers: Record<string, any>;
  submittedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  createdAt: string;
}

// ==========================================
// STUDENT ATTENDANCE SYSTEM TYPES (سیستم حضور و غیاب)
// ==========================================
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';
export type AttendanceMethod = 'barcode_scanner' | 'qr_code' | 'manual_kiosk' | 'staff_override';
export type AttendanceFlag = 'ON_TIME_ENTRY' | 'LATE_ENTRY' | 'ON_TIME_EXIT' | 'EARLY_EXIT';
export type AttendanceDirection = 'entry' | 'exit' | 'auto';

export interface SchoolShiftSetting {
  id: string;
  instituteName: string;
  // Check-in Operational Window
  checkInStartTime: string;      // e.g. "06:45"
  checkInNormalEndTime: string;  // e.g. "07:45" (Cut-off for on-time arrival)
  checkInLateThreshold: string;  // e.g. "08:30"
  // Check-out Operational Window
  checkOutEarlyThreshold: string; // e.g. "13:30" (Exits before this are EARLY_EXIT)
  checkOutNormalEndTime: string;  // e.g. "14:45"
  // Notification Templates (Persian with token replacement)
  smsTemplateEntry: string;      // e.g. "فرزند دلبندتان {student_name} در ساعت {time} وارد مدرسه شد"
  smsTemplateExit: string;       // e.g. "فرزند دلبندتان {student_name} در ساعت {time} از مدرسه خارج شد"
  voiceTtsTemplate: string;      // e.g. "با سلام اولیای محترم دانش اموز {student_name} برای فرزند شما مورد انضباطی {infraction_title} ثبت شده است لطفا پیگیر این موضوع باشید"
  isVoiceCallEnabled: boolean;
  isSmsEnabled: boolean;
  updatedAt: string;
}

export interface AttendanceSmsNotification {
  sent: boolean;
  sentAt: string;
  recipientPhone: string;
  messageText: string;
  deliveryStatus: 'delivered' | 'sent' | 'simulated';
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentNationalId: string;
  studentCode: string;
  className: string;
  classId: string;
  gradeLevel: string;
  avatarUrl?: string;
  date: string; // YYYY-MM-DD
  persianDate: string; // e.g. ۱۴۰۵/۰۸/۱۳
  time: string; // HH:mm:ss
  timestamp: string; // ISO
  status: AttendanceStatus;
  statusLabel: string; // e.g. حاضر و به‌موقع / ورود با تاخیر / خروج زودهنگام
  flag?: AttendanceFlag;
  direction?: 'entry' | 'exit';
  method: AttendanceMethod;
  tardyMinutes: number;
  guardianPhone: string;
  smsNotification: AttendanceSmsNotification;
  notes?: string;
  recordedBy?: string;
}

export interface AttendanceStats {
  date: string;
  persianDate: string;
  totalStudents: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  earlyExitCount?: number;
  onTimeExitCount?: number;
  attendanceRate: number;
  onTimeRate: number;
}

// ==========================================
// DISCIPLINARY MODULE TYPES (امور انضباطی و تماس صوتی هوشمند)
// ==========================================
export type DisciplinarySeverity = 'low' | 'medium' | 'high' | 'critical';
export type VoiceCallStatus = 'pending' | 'queued' | 'calling' | 'completed' | 'failed' | 'simulated';

export interface DisciplinaryType {
  id: string;
  title: string;
  description?: string;
  defaultSeverity: DisciplinarySeverity;
  demeritPoints: number;
  isActive: boolean;
  createdAt: string;
}

export interface DisciplinaryRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentNationalId: string;
  className: string;
  gradeLevel: string;
  infractionTypeId: string;
  infractionTitle: string;
  severity: DisciplinarySeverity;
  demeritPoints: number;
  date: string;
  time: string;
  timestamp: string;
  recordedById: string;
  recordedByName: string;
  recordedByRole: string;
  notes?: string;
  parentPhone: string;
  voiceCallTriggered: boolean;
  voiceCallStatus: VoiceCallStatus;
  voiceCallSid?: string;
  voiceCallMessage?: string;
  voiceCallSentAt?: string;
  voiceCallDurationSeconds?: number;
}

// ==========================================
// SHARED ONLINE EXAMINATION TYPES (ماژول آزمون‌های آنلاین اشتراکی)
// ==========================================
export type QuestionType = 'multiple_choice' | 'descriptive';

export interface ExamQuestion {
  id: string;
  examId: string;
  orderIndex: number;
  type?: QuestionType;
  questionType?: QuestionType;
  statement?: string;
  text?: string;
  title?: string;
  prompt?: string;
  score?: number;
  points?: number;
  options?: string[]; // 4 options for MCQ
  correctAnswer?: any;
  correctOptionIndex?: number; // 0, 1, 2, 3
  modelAnswer?: string; // For descriptive
  explanation?: string;
}

export interface OnlineExam {
  id: string;
  title: string;
  courseId: string;
  courseName?: string;
  courseTitle?: string;
  classIds: string[];
  classNames?: string[];
  gradeLevel: any; // هفتم، هشتم، نهم
  creatorId?: string;
  creatorName?: string;
  authorId?: string;
  authorName?: string;
  authorRole?: 'super_admin' | 'manager' | 'teacher';
  startDate: string;
  startTime?: string;
  endDate: string;
  endTime?: string;
  durationMinutes: number; // e.g. 60
  totalScore: number; // e.g. 20
  passingScore?: number;
  instructions?: string;
  status: 'draft' | 'published' | 'ongoing' | 'closed' | 'completed' | 'archived';
  description?: string;
  questionCount?: number;
  questionsCount?: number;
  questions?: ExamQuestion[];
  createdAt: string;
  updatedAt: string;
}
