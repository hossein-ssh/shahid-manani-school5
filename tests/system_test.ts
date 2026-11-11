// Automated Test Suite for Andisheh Sari System
// Minimum 15 acceptance test criteria as specified in section 16

import { DB, generateSeedDatabase } from '../server/db';
import { hashPassword, verifyPassword, createSession, getSession } from '../server/auth';
import { generateCaptcha, verifyCaptcha, normalizeInput } from '../server/captcha';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ TEST FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  }
}

async function runAllTests() {
  console.log('========================================================');
  console.log('🧪 Starting Andisheh Sari System Automated Acceptance Tests');
  console.log('========================================================\n');

  // 1. Student registration and login
  const testStudent = DB.createUser({
    fullName: 'تست دانش‌آموز آزمایشی',
    username: 'test_student_unit',
    phone: '09990000001',
    password: 'Password@123',
    role: 'student',
    status: 'active',
  });
  assert(testStudent.role === 'student', '1. Student registration creates account with student role only');

  const fetchedUser = DB.getUserWithPassword('test_student_unit');
  assert(!!fetchedUser && verifyPassword('Password@123', fetchedUser.passwordHash), '1b. Student login verifies password hash correctly');

  // 2. Administrator login
  const adminUser = DB.getUserWithPassword('admin');
  assert(!!adminUser && adminUser.role === 'super_admin', '2. Super Administrator account exists and has role super_admin');
  assert(verifyPassword('Admin@123456', adminUser!.passwordHash), '2b. Administrator credentials verify successfully');

  // 3. Role-based authorization & session token
  const token = createSession(adminUser!.id, adminUser!.role);
  const session = getSession(token);
  assert(session !== null && session.role === 'super_admin', '3. Session token generates and retrieves correct role');

  // 4. Student isolation between accounts
  const aliGrades = DB.getGrades({ studentId: 'usr_student_ali', onlyPublished: true });
  const otherStudentGrades = DB.getGrades({ studentId: 'usr_student_sara', onlyPublished: true });
  const aliSeesSara = aliGrades.some(g => g.studentId === 'usr_student_sara');
  assert(!aliSeesSara, '4. Student isolation: Ali cannot see Sara\'s private grades');

  // 5. Teacher access to assigned classes only
  const teacherClasses = DB.getClasses({ teacherId: 'usr_teacher_riazi' });
  const teacherOnlyOwnClasses = teacherClasses.every(c => c.teacherId === 'usr_teacher_riazi');
  assert(teacherOnlyOwnClasses && teacherClasses.length > 0, '5. Teacher can only view classes assigned to them');

  // 6. Grade creation and publication
  const newGrade = DB.upsertGrade({
    assessmentId: 'ass_quiz_1',
    studentId: testStudent.id,
    score: 17.5,
    maxScore: 20,
    status: 'draft',
    userId: 'usr_teacher_riazi',
  });
  assert(newGrade.score === 17.5 && newGrade.status === 'draft', '6. Teacher creates draft grade');

  // 7. Students viewing only their published grades
  const studentViewBeforePublish = DB.getGrades({ studentId: testStudent.id, onlyPublished: true });
  assert(!studentViewBeforePublish.some(g => g.id === newGrade.id), '7a. Draft grade is not visible to student');

  // Publish grade
  DB.upsertGrade({
    assessmentId: 'ass_quiz_1',
    studentId: testStudent.id,
    score: 17.5,
    maxScore: 20,
    status: 'published',
    userId: 'usr_teacher_riazi',
  });
  const studentViewAfterPublish = DB.getGrades({ studentId: testStudent.id, onlyPublished: true });
  assert(studentViewAfterPublish.some(g => g.id === newGrade.id), '7b. Published grade is visible to student');

  // 8. Weekly schedule visibility
  const studentSchedules = DB.getSchedules({ studentId: 'usr_student_abolfazl' });
  assert(studentSchedules.length > 0, '8. Enrolled student can view their weekly class schedule');

  // 9. Online classes enabled and disabled without deleting data
  const initialOnlineCount = DB.db.onlineSessions.length;
  DB.updateSettings({ onlineClassesEnabled: false });
  assert(DB.getSettings().onlineClassesEnabled === false, '9a. Global online_classes_enabled switch turned OFF');
  assert(DB.db.onlineSessions.length === initialOnlineCount, '9b. Disabling module preserves all session records and data');
  DB.updateSettings({ onlineClassesEnabled: true });
  assert(DB.getSettings().onlineClassesEnabled === true, '9c. Global online_classes_enabled switch turned ON again');

  // 10. Counselor availability and consultation requests
  const avails = DB.getCounselorAvailabilities('usr_counselor_dr');
  assert(avails.length > 0, '10. Counselor has configured working days and available hours');

  // 11. Student messaging privacy
  const counselorView = DB.getCounselingRequests({ counselorId: 'usr_counselor_dr', isCounselorRole: true });
  const studentView = DB.getCounselingRequests({ studentId: 'usr_student_ali', isCounselorRole: false });
  assert(counselorView.some(r => r.privateNotes && r.privateNotes.length > 0), '11a. Counselor can see confidential counseling notes');
  assert(studentView.every(r => r.privateNotes === undefined), '11b. Confidential notes are strictly stripped for students');

  // 12. Announcement visibility
  const publicAnnouncements = DB.getAnnouncements({ audience: 'all' });
  assert(publicAnnouncements.length > 0, '12. Public announcements are visible to targeted audience');

  // 13. Survey response restrictions (prevent duplicate & support anonymous)
  const surveys = DB.getSurveys('usr_student_ali', 'student');
  assert(surveys.length > 0, '13. Surveys are accessible to student audience');

  // 14. Administrative account management
  const updatedUser = DB.updateUser(testStudent.id, { status: 'suspended' });
  assert(updatedUser?.status === 'suspended', '14. Administrator can suspend user accounts');

  // 15. Input validation: Score cannot exceed maxScore
  let scoreOverflowCaught = false;
  try {
    DB.upsertGrade({
      assessmentId: 'ass_quiz_1',
      studentId: testStudent.id,
      score: 25, // Exceeds maxScore 20
      maxScore: 20,
      status: 'draft',
      userId: 'usr_teacher_riazi',
    });
  } catch (err) {
    scoreOverflowCaught = true;
  }
  assert(scoreOverflowCaught, '15. Score validation: Prevents score exceeding maximum score');

  // 16. Report Card Calculation matching Screenshots (Abolfazl Rezaei)
  const reportCard = DB.calculateStudentReportCard('6addb06b8c9a07b9619db289') || DB.calculateStudentReportCard('usr_student_abolfazl');
  assert(reportCard !== null, '16a. Report card calculated successfully for middle school student');
  assert(reportCard!.overallGpa === 17.2, `16b. Abolfazl overall GPA is 17.20 (actual: ${reportCard?.overallGpa})`);
  assert(reportCard!.classTotalStudents === 18, `16c. Class size is 18 students (actual: ${reportCard?.classTotalStudents})`);
  assert(reportCard!.gradeTotalStudents === 83, `16d. Grade 9 total size is 83 students (actual: ${reportCard?.gradeTotalStudents})`);
  assert(reportCard!.overallClassRank === 8, `16e. Overall class rank is 8 (actual: ${reportCard?.overallClassRank})`);
  assert(reportCard!.overallGradeRank === 42, `16f. Overall grade rank is 42 (actual: ${reportCard?.overallGradeRank})`);
  assert(reportCard!.courses.length === 10, '16g. Report card contains all 10 middle school courses');

  // 17. Individual course ranks in class and in grade
  const mathCourse = reportCard!.courses.find(c => c.courseTitle === 'ریاضی');
  assert(mathCourse !== undefined, '17a. Mathematics course found in report card');
  assert(mathCourse!.classRank === 9, `17b. Math rank in class is 9 of 18 (actual: ${mathCourse?.classRank})`);
  assert(mathCourse!.gradeRank === 45, `17c. Math rank in grade is 45 of 83 (actual: ${mathCourse?.gradeRank})`);
  assert(mathCourse!.classAverage === 12.0, `17d. Math class average is 12.00 (actual: ${mathCourse?.classAverage})`);
  assert(mathCourse!.gradeAverage === 14.65, `17e. Math grade average is 14.65 (actual: ${mathCourse?.gradeAverage})`);

  // 18. Self-registration disabled by system policy
  assert(DB.getSettings().allowStudentRegistration === false, '18. Student self-registration is disabled per institute requirements');

  // 19. Course and Class creation by Manager
  const createdCourse = DB.createCourse({
    code: 'QURAN-08',
    title: 'قرآن و معارف پایه هشتم',
    gradeLevel: 'هشتم',
    units: 2,
  });
  assert(createdCourse.gradeLevel === 'هشتم', '19a. Manager creates course for Grade 8');

  const createdClass = DB.createClass({
    name: 'کلاس ۸۰۱',
    gradeLevel: 'هشتم',
    courseId: createdCourse.id,
    teacherId: 'usr_teacher_riazi',
    academicTermId: 'term_1404_1',
    roomNumber: '۲۰۴',
    maxCapacity: 25,
  });
  assert(createdClass.name === 'کلاس ۸۰۱' && createdClass.gradeLevel === 'هشتم', '19b. Manager creates and controls new class');

  // 20. Dedicated Teachers List and Definition
  const teachersList = DB.getTeachers();
  assert(teachersList.length >= 10, '20a. Dedicated teachers list retrieves all faculty members');
  const ghanbariTeacher = teachersList.find(t => t.username === 'ghanbari');
  const alaviTeacher = teachersList.find(t => t.username === 'alavi');
  assert(!!ghanbariTeacher && ghanbariTeacher.fullName.includes('قنبری'), '20b. Mr. Ghanbari teacher account exists with specialty');
  assert(!!alaviTeacher && alaviTeacher.fullName.includes('علوی'), '20c. Mr. Alavi teacher account exists with specialty');

  const newlyCreatedTeacher = DB.createUser({
    fullName: 'استاد محمد داوودی',
    username: 'davoodi',
    phone: '09110000099',
    password: 'Teacher@123456',
    role: 'teacher',
    specialty: 'دبیر ریاضیات تیزهوشان',
  });
  assert(newlyCreatedTeacher.role === 'teacher' && newlyCreatedTeacher.specialty === 'دبیر ریاضیات تیزهوشان', '20d. Manager creates new teacher account with specialty');

  // 21. Per-Course Teacher Assignment in each Class
  // Specific user prompt: "برای مثال کلاس شماره 901 درس ریاضی معلم اقای قنبری و برای کلاس 902 همان درس ریاضی معلم اقای علوی باشه"
  const class901Math = DB.getClassAssignments({ classId: 'cls_901', courseId: 'crs_riazi' })[0];
  const class902Math = DB.getClassAssignments({ classId: 'cls_902', courseId: 'crs_riazi' })[0];
  assert(!!class901Math && class901Math.teacherId === 'usr_teacher_ghanbari', '21a. In Class 901, math teacher is assigned to Mr. Ghanbari (استاد قنبری)');
  assert(!!class902Math && class902Math.teacherId === 'usr_teacher_alavi', '21b. In Class 902, same math course is assigned to Mr. Alavi (استاد علوی)');

  // 22. Support for Multiple Teachers for a Course (Co-teachers / assistants)
  // Specific user prompt: "و حتی ممکنه برای بعضی درس ها چند معلم باشه"
  const class901Science = DB.getClassAssignments({ classId: 'cls_901', courseId: 'crs_oloom' })[0];
  assert(
    !!class901Science &&
    Array.isArray(class901Science.additionalTeacherIds) &&
    class901Science.additionalTeacherIds.length > 0,
    '22a. A course in a class supports multiple teachers (primary teacher + assistant/co-teachers)'
  );

  // Dynamic reassignment
  const reassigned = DB.assignTeacherToClassCourse({
    classId: createdClass.id,
    courseId: createdCourse.id,
    teacherId: newlyCreatedTeacher.id,
    additionalTeacherIds: ['usr_teacher_ghanbari'],
  });
  assert(
    reassigned.teacherId === newlyCreatedTeacher.id &&
    Boolean(reassigned.additionalTeacherIds?.includes('usr_teacher_ghanbari')),
    '22b. Dynamic teacher reassignment with co-teachers updates successfully'
  );

  // 23. Multi-Counselor Registration and Management
  const counselors = DB.getCounselors();
  assert(counselors.length >= 3, `23a. Multi-counselor system active with at least 3 counselors (actual: ${counselors.length})`);
  const drCounselor = counselors.find(c => c.username === 'counselor_dr');
  assert(!!drCounselor && Array.isArray(drCounselor.attendanceDays), '23b. Counselor has attendance days defined');

  // 24. Month-over-Month Report Card Comparison
  const monthlyComp = DB.calculateMonthlyComparison('usr_student_abolfazl');
  assert(!!monthlyComp && monthlyComp.items.length > 0, '24a. Month-over-month report card comparison calculated');
  assert(monthlyComp !== null && typeof monthlyComp.currentGpa === 'number' && typeof monthlyComp.gpaDelta === 'number', '24b. GPA growth delta computed');

  // 25. Site Update Manager & Principal Control
  const siteUpdates = DB.getSiteUpdates();
  assert(Array.isArray(siteUpdates) && siteUpdates.length > 0, '25. Principal site updates list retrieved');

  // 26. Database Backup & Export
  const backup = DB.exportBackup();
  assert(backup.settings.instituteName === 'مدرسه نمونه دولتی شهید منانی', '26. Full system backup exports correct school branding');

  // 27. Automated Student Attendance System & Kiosk Role
  const kioskUser = DB.getUserWithPassword('kiosk');
  assert(!!kioskUser && kioskUser.role === 'kiosk', '27a. Kiosk dedicated role user exists in database');

  const allStudents = DB.getUsers().filter(u => u.role === 'student');
  const abolfazl = allStudents.find(s => s.id === 'usr_student_abolfazl') || allStudents[0];
  const secondStudent = allStudents.find(s => s.id !== abolfazl.id) || allStudents[1];

  // Ensure clean test slate for the tested students
  DB.db.attendanceRecords = (DB.db.attendanceRecords || []).filter(r => r.studentId !== abolfazl.id && r.studentId !== secondStudent.id);
  DB.saveDatabase();

  // Check-in with national ID
  const scanResult1 = DB.recordAttendance({
    identifier: abolfazl.nationalId || abolfazl.studentId || abolfazl.username,
    method: 'barcode_scanner',
    recordedBy: 'kiosk_gate',
    notes: 'ورود از گیت ۱ اسکنر بارکد',
  });
  assert(scanResult1.student?.id === abolfazl.id, '27b. Automated attendance identifies student by national ID');
  assert(scanResult1.record?.status === 'present' || scanResult1.record?.status === 'late', '27c. Attendance status calculated accurately (present or late)');
  assert(Boolean(scanResult1.smsNotification && scanResult1.smsNotification.sent === true && scanResult1.smsNotification.recipientPhone === scanResult1.student?.phone), '27d. SMS notification dispatched to parent mobile number');

  // Check-in with QR code payload
  const qrPayload = JSON.stringify({ studentId: secondStudent.id, nationalId: secondStudent.nationalId });
  const scanResult2 = DB.recordAttendance({
    identifier: qrPayload,
    method: 'qr_code',
    recordedBy: 'kiosk_gate',
  });
  assert(scanResult2.student?.id === secondStudent.id, '27e. QR code JSON payload successfully parsed and recorded');

  // Stats computation
  const todayStats = DB.getTodayAttendanceStats();
  assert(todayStats.totalStudents > 0 && (todayStats.presentCount + todayStats.lateCount) >= 2, '27f. Today attendance statistics computed with total checked-in count');

  // 28. Anti-Bot Captcha Security System
  const captcha = generateCaptcha();
  assert(!!captcha.captchaId && captcha.svg.includes('<svg') && captcha.solution.length === 5, '28a. Captcha generator produces SVG image, token ID and 5-character solution');

  // Digit normalization for Persian keyboard users
  const normalizedFa = normalizeInput('۱۲۳۴۵');
  assert(normalizedFa === '12345', '28b. Persian digit normalization converts Persian numbers to ASCII successfully');

  // Incorrect answer rejection
  const wrongAttempt = verifyCaptcha(captcha.captchaId, 'WRONG_CODE');
  assert(wrongAttempt.valid === false && wrongAttempt.reason === 'MISMATCH', '28c. Incorrect Captcha entry is strictly rejected');

  // Single-use token invalidation (anti-replay bot attack)
  const reuseAttempt = verifyCaptcha(captcha.captchaId, captcha.solution);
  assert(reuseAttempt.valid === false && reuseAttempt.reason === 'EXPIRED', '28d. Single-use token invalidated immediately to prevent replay bot attacks');

  // Fresh valid captcha verification
  const freshCaptcha = generateCaptcha();
  const validAttempt = verifyCaptcha(freshCaptcha.captchaId, freshCaptcha.solution);
  assert(validAttempt.valid === true, '28e. Correct Captcha response successfully verified');

  // 29. Configurable Attendance Shifts & Cut-off Times Engine
  const shiftSettings = DB.getShiftSettings();
  assert(!!shiftSettings.checkInStartTime && !!shiftSettings.checkInLateThreshold, '29a. School operational shift settings retrieved with check-in/out thresholds');

  // Test custom shift threshold update
  const updatedShifts = DB.updateShiftSettings({
    checkInNormalEndTime: '07:45',
    checkInLateThreshold: '08:00',
    checkOutEarlyThreshold: '13:30',
  });
  assert(updatedShifts.checkInLateThreshold === '08:00' && updatedShifts.checkInNormalEndTime === '07:45', '29b. Operational windows dynamically updated by Admin/Vice-Principal');

  // Verify check-in direction recording and classification
  const thirdStudent = DB.createUser({
    fullName: 'دانش‌آموز شیفت تست',
    username: 'test_student_shift',
    nationalId: '2089999999',
    phone: '09990000003',
    password: 'Password@123',
    role: 'student',
    status: 'active',
    classId: 'cls_701',
  });

  const entryRecord = DB.recordAttendance({
    identifier: thirdStudent.nationalId || '2089999999',
    method: 'barcode_scanner',
    direction: 'entry',
    recordedBy: 'kiosk_gate',
  });
  assert(!!entryRecord.record && entryRecord.record.direction === 'entry' && !!entryRecord.record.flag, '29c. Attendance engine classifies check-in direction with automated threshold flag');

  const exitRecord = DB.recordAttendance({
    identifier: thirdStudent.nationalId || '2089999999',
    method: 'barcode_scanner',
    direction: 'exit',
    recordedBy: 'kiosk_gate',
  });
  assert(!!exitRecord.record && exitRecord.record.direction === 'exit' && (exitRecord.record.flag === 'ON_TIME_EXIT' || exitRecord.record.flag === 'EARLY_EXIT'), '29d. Attendance engine classifies student check-out and supports both directions in same day');

  // 30. Disciplinary Module with Automated Voice Call Trigger
  const discTypes = DB.getDisciplinaryTypes();
  assert(discTypes.length >= 3, '30a. Customizable disciplinary infraction types configured');

  const newDiscType = DB.createDisciplinaryType({
    title: 'تخریب اموال آزمایشگاه',
    description: 'آسیب به تجهیزات و شیشه‌آلات آزمایشگاهی',
    defaultSeverity: 'high',
    demeritPoints: 1.5,
    isActive: true,
  });
  assert(newDiscType.title === 'تخریب اموال آزمایشگاه', '30b. Vice-Principal creates customized disciplinary infraction category');

  // Log student disciplinary record
  const incidentResult = DB.createDisciplinaryRecord({
    studentId: thirdStudent.id,
    infractionTypeId: newDiscType.id,
    severity: 'high',
    notes: 'شکستن لوله آزمایش حین زنگ علوم',
    recordedById: adminUser!.id,
    recordedByName: adminUser!.fullName,
    recordedByRole: 'معاونت انضباطی',
  });
  assert(incidentResult.record.studentId === thirdStudent.id && incidentResult.record.severity === 'high', '30c. Disciplinary incident successfully logged with notes and severity');
  assert(incidentResult.voiceCallQueued === true && !!incidentResult.record.voiceCallStatus, '30d. Non-blocking automated outbound TTS voice call queued immediately upon creation');

  // 31. Shared Online Examination Module & Question Builder
  const createdExam = DB.createExam({
    title: 'آزمون تستی-تشریحی جامع نیم‌سال اول ریاضی',
    courseId: 'crs_math_7',
    courseTitle: 'ریاضیات پایه هفتم',
    gradeLevel: 'هفتم',
    classIds: ['cls_701'],
    classNames: ['کلاس ۷۰۱'],
    authorId: adminUser!.id,
    authorName: adminUser!.fullName,
    authorRole: 'super_admin',
    startDate: '1404/09/01',
    startTime: '08:30',
    endDate: '1404/09/01',
    endTime: '10:00',
    durationMinutes: 90,
    totalScore: 20,
    passingScore: 12,
    instructions: 'استفاده از ماشین‌حساب ممنوع است.',
    status: 'draft',
  });
  assert(createdExam.title.includes('جامع نیم‌سال اول') && createdExam.durationMinutes === 90, '31a. Online examination created with schedule, duration, and score limits');

  // Question 1: Multiple Choice Question (MCQ)
  const mcqQuestion = DB.addExamQuestion(createdExam.id, {
    type: 'multiple_choice',
    statement: 'کدام‌یک از اعداد زیر عدد اول است؟',
    options: ['۲۱', '۲۷', '۲۹', '۳۵'],
    correctAnswer: 3,
    score: 2,
    explanation: '۲۹ تنها بر ۱ و خودش بخش‌پذیر است.',
  });
  assert(mcqQuestion.type === 'multiple_choice' && mcqQuestion.options?.length === 4 && mcqQuestion.correctAnswer === 3, '31b. MCQ Question Builder persists 4 choices and correct answer key');

  // Question 2: Descriptive Essay Question
  const descQuestion = DB.addExamQuestion(createdExam.id, {
    type: 'descriptive',
    statement: 'مسئله زیر را حل کرده و مراحل محاسبه را شرح دهید: حاصل جمع اعداد صحیح از ۵- تا ۸ را به دست آورید.',
    correctAnswer: 'اعداد از ۵- تا ۵ خنثی شده و مجموع ۶ + ۷ + ۸ = ۲۱ می‌شود.',
    score: 3,
  });
  assert(descQuestion.type === 'descriptive' && typeof descQuestion.correctAnswer === 'string', '31c. Descriptive Question Builder stores statement and grading rubric answer');

  // Verify Question Retrieval and Exam Question Count Update
  const examQuestionsList = DB.getExamQuestions(createdExam.id);
  const updatedExam = DB.getExamById(createdExam.id);
  assert(examQuestionsList.length === 2 && updatedExam?.questionCount === 2, '31d. Exam question bank aggregates question count and synchronizes with exam');

  console.log('\n========================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} ACCEPTANCE TESTS PASSED SUCCESSFULLY!`);
  console.log('========================================================');
}

runAllTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
