-- ====================================================================
-- Andisheh Sari Educational Institute Management System
-- Database Schema (PostgreSQL 14+)
-- سامانه جامع مدیریت مؤسسه فرهنگی آموزشی اندیشه ساری
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. System Settings & Configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    institute_name VARCHAR(255) NOT NULL DEFAULT 'مؤسسه و دبیرستان هوشمند اندیشه ساری',
    online_classes_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    allow_student_registration BOOLEAN NOT NULL DEFAULT TRUE,
    require_registration_approval BOOLEAN NOT NULL DEFAULT FALSE,
    counselor_booking_notice_hours INT NOT NULL DEFAULT 2,
    contact_phone VARCHAR(50) DEFAULT '01133110098',
    contact_email VARCHAR(100) DEFAULT 'info@andishesari.com',
    contact_address TEXT DEFAULT 'مازندران، ساری، خیابان فرهنگ، خیابان سعدی، کوچه اطلسی',
    current_academic_term_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users (Super Admin, Manager, Teacher, Student, Counselor)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(30) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('super_admin', 'manager', 'teacher', 'student', 'counselor')),
    full_name VARCHAR(150) NOT NULL,
    national_id VARCHAR(20),
    student_id VARCHAR(30),
    avatar_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'deactivated')),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- 3. Academic Terms (نیم‌سال‌های تحصیلی)
CREATE TABLE IF NOT EXISTS academic_terms (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Courses (دروس آموزشی)
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    grade_level VARCHAR(50) NOT NULL, -- دهم، یازدهم، دوازدهم، کنکور
    field_of_study VARCHAR(50) NOT NULL, -- ریاضی، تجربی، انسانی
    units INT DEFAULT 3,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Classes & Groups (کلاس‌ها و دوره‌ها)
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    academic_term_id VARCHAR(50) NOT NULL REFERENCES academic_terms(id) ON DELETE RESTRICT,
    room_number VARCHAR(50) DEFAULT 'کلاس ۱۰۱',
    max_capacity INT DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_term ON classes(academic_term_id);

-- 6. Class Enrollments (ثبت‌نام دانش‌آموزان در کلاس‌ها)
CREATE TABLE IF NOT EXISTS class_enrollments (
    id VARCHAR(50) PRIMARY KEY,
    class_id VARCHAR(50) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_class_student UNIQUE (class_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollment_student ON class_enrollments(student_id);

-- 7. Weekly Schedules (برنامه هفتگی کلاس‌ها)
CREATE TABLE IF NOT EXISTS schedules (
    id VARCHAR(50) PRIMARY KEY,
    class_id VARCHAR(50) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0: شنبه, 1: یکشنبه, ..., 5: پنجشنبه, 6: جمعه
    start_time VARCHAR(10) NOT NULL, -- HH:MM e.g. "08:00"
    end_time VARCHAR(10) NOT NULL,   -- HH:MM e.g. "09:30"
    room VARCHAR(50) NOT NULL,
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'rescheduled')),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schedules_class ON schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day ON schedules(day_of_week);

-- 8. Assessments (آزمون‌ها، امتحانات، تکالیف)
CREATE TABLE IF NOT EXISTS assessments (
    id VARCHAR(50) PRIMARY KEY,
    class_id VARCHAR(50) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('quiz', 'midterm', 'final', 'homework', 'project')),
    max_score NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    assessment_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assessments_class ON assessments(class_id);

-- 9. Grades (نمرات دانش‌آموزان)
CREATE TABLE IF NOT EXISTS grades (
    id VARCHAR(50) PRIMARY KEY,
    assessment_id VARCHAR(50) NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0),
    max_score NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    comments TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(50) NOT NULL REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_assessment_student UNIQUE (assessment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_assessment ON grades(assessment_id);

-- 10. Grade History & Audit (تاریخچه تغییرات نمرات)
CREATE TABLE IF NOT EXISTS grade_history (
    id VARCHAR(50) PRIMARY KEY,
    grade_id VARCHAR(50) NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    previous_score NUMERIC(5,2),
    new_score NUMERIC(5,2) NOT NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by VARCHAR(50) NOT NULL REFERENCES users(id),
    reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Online Sessions (کلاس‌های آنلاین با سوئیچ سراسری)
CREATE TABLE IF NOT EXISTS online_sessions (
    id VARCHAR(50) PRIMARY KEY,
    class_id VARCHAR(50) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    session_date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    meeting_url TEXT NOT NULL,
    access_code VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_online_class ON online_sessions(class_id);

-- 12. Counselor Availability (برنامه کاری و ساعات حضور مشاوران)
CREATE TABLE IF NOT EXISTS counselor_availabilities (
    id VARCHAR(50) PRIMARY KEY,
    counselor_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_counselor_avail ON counselor_availabilities(counselor_id);

-- 13. Counseling Requests & Inquiries (درخواست‌های مشاوره دانش‌آموزان)
CREATE TABLE IF NOT EXISTS counseling_requests (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    counselor_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('academic', 'career', 'personal', 'exam_prep')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'cancelled')),
    preferred_time VARCHAR(100),
    private_notes TEXT, -- Strictly restricted to counselors only!
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_counseling_student ON counseling_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_counseling_counselor ON counseling_requests(counselor_id);

-- 14. Counseling Messages (گفتگوهای متنی مشاوره)
CREATE TABLE IF NOT EXISTS counseling_messages (
    id VARCHAR(50) PRIMARY KEY,
    request_id VARCHAR(50) NOT NULL REFERENCES counseling_requests(id) ON DELETE CASCADE,
    sender_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_role VARCHAR(30) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_counseling_msg_request ON counseling_messages(request_id);

-- 15. Announcements (اطلاعیه‌ها و اخبار)
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_audience VARCHAR(30) NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'teachers', 'class')),
    target_class_id VARCHAR(50) REFERENCES classes(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_announcements_audience ON announcements(target_audience);

-- 16. In-App Notifications (اعلان‌های درون‌برنامه‌ای کاربران)
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('announcement', 'grade', 'schedule', 'online_class', 'counseling', 'survey')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- 17. Surveys & Feedback (نظرسنجی‌ها و بازخوردها)
CREATE TABLE IF NOT EXISTS surveys (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    target_audience VARCHAR(30) NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'teachers')),
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS survey_questions (
    id VARCHAR(50) PRIMARY KEY,
    survey_id VARCHAR(50) NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(30) NOT NULL CHECK (question_type IN ('multiple_choice', 'rating', 'text')),
    options JSONB, -- Array of string options for multiple choice
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS survey_responses (
    id VARCHAR(50) PRIMARY KEY,
    survey_id VARCHAR(50) NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL, -- NULL if anonymous
    answers JSONB NOT NULL, -- Map of question_id -> response
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Audit Logs (لاگ‌های امنیتی و رویدادهای مدیریتی)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
