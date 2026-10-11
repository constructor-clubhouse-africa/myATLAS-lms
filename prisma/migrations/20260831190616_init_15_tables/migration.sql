-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('super_admin', 'school_admin', 'teacher', 'student');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('trial', 'starter', 'basic', 'standard', 'premium');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('trial_active', 'trial_expired', 'active', 'past_due', 'cancelled', 'suspended');

-- CreateEnum
CREATE TYPE "CapsPhase" AS ENUM ('foundation', 'intermediate', 'senior', 'fet');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('test', 'assignment', 'exam', 'project');

-- CreateEnum
CREATE TYPE "AtpStatus" AS ENUM ('draft', 'submitted', 'approved', 'returned');

-- CreateEnum
CREATE TYPE "CapsCountsToward" AS ENUM ('SBA', 'EXAM', 'ORAL_EXAM', 'SBA_AND_EXAM', 'NOT_IN_CAPS');

-- CreateEnum
CREATE TYPE "CapsWeightingBasis" AS ENUM ('OF_SBA', 'OF_TERM_SBA', 'OF_FINAL', 'MEMBERSHIP_ONLY', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "CapsVerificationLevel" AS ENUM ('VERIFIED_CAPS', 'VERIFIED_ATP', 'VERIFIED', 'DERIVED', 'NEEDS_REVIEW', 'NOT_IN_CAPS');

-- CreateEnum
CREATE TYPE "AnnouncementTarget" AS ENUM ('school', 'class');

-- CreateTable
CREATE TABLE "caps_subject" (
    "id" TEXT NOT NULL,
    "source_id" INTEGER NOT NULL,
    "subject_name" TEXT NOT NULL,
    "phase" "CapsPhase" NOT NULL,
    "language" TEXT,
    "specialist_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caps_subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caps_grade_term" (
    "id" TEXT NOT NULL,
    "source_id" INTEGER NOT NULL,
    "subject_id" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    "week_range" TEXT,
    "week_start" INTEGER,
    "week_end" INTEGER,
    "topic" TEXT NOT NULL,
    "subtopics" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caps_grade_term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caps_assessment_requirement" (
    "id" TEXT NOT NULL,
    "source_id" INTEGER NOT NULL,
    "subject_id" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    "task_label" TEXT NOT NULL,
    "task_sequence" INTEGER,
    "task_name" TEXT NOT NULL,
    "assessment_type" "AssessmentType",
    "required_count" INTEGER NOT NULL DEFAULT 1,
    "counts_toward" "CapsCountsToward" NOT NULL,
    "weighting_pct" DECIMAL(6,3),
    "weighting_basis" "CapsWeightingBasis",
    "weighting_raw" TEXT,
    "notes" TEXT,
    "source_document" TEXT,
    "verification_level" "CapsVerificationLevel" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caps_assessment_requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subscription_tier" "SubscriptionTier" NOT NULL DEFAULT 'trial',
    "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'trial_active',
    "trial_expires_at" TIMESTAMP(3),
    "billing_expires_at" TIMESTAMP(3),
    "dpa_accepted_at" TIMESTAMP(3),
    "dpa_accepted_by" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "school_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "force_pw_change" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "grade_level" INTEGER,
    "parent_email" TEXT,
    "popia_consent_at" TIMESTAMP(3),
    "popia_consent_token" TEXT,
    "popia_consent_sent_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade_level" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_enrollment" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "file_url" TEXT,
    "link_url" TEXT,
    "file_public_id" TEXT,
    "file_size_bytes" INTEGER,
    "caps_grade_term_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMP(3) NOT NULL,
    "assessment_type" "AssessmentType" NOT NULL,
    "max_mark" DECIMAL(6,2) NOT NULL DEFAULT 100,
    "file_url" TEXT,
    "file_public_id" TEXT,
    "caps_grade_term_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "text_content" TEXT,
    "file_url" TEXT,
    "file_public_id" TEXT,
    "grade" DECIMAL(6,2),
    "feedback" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "graded_at" TIMESTAMP(3),
    "graded_by_id" TEXT,
    "synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "posted_by" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "target_type" "AnnouncementTarget" NOT NULL,
    "target_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_public_id" TEXT,
    "term" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timetable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_atp" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "content_coverage" TEXT,
    "methodology" TEXT,
    "resource_notes" TEXT,
    "status" "AtpStatus" NOT NULL DEFAULT 'draft',
    "submitted_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "approved_by_id" TEXT,
    "admin_comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_atp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_fap_tracking" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "assessment_type" "AssessmentType" NOT NULL,
    "required_count" INTEGER NOT NULL,
    "completed_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_fap_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sba_marksheet" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "assessment_type" "AssessmentType" NOT NULL,
    "mark" DECIMAL(6,2),
    "max_mark" DECIMAL(6,2) NOT NULL DEFAULT 100,
    "weighted_contribution" DECIMAL(6,2),
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sba_marksheet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "caps_subject_source_id_key" ON "caps_subject"("source_id");

-- CreateIndex
CREATE INDEX "caps_subject_phase_idx" ON "caps_subject"("phase");

-- CreateIndex
CREATE UNIQUE INDEX "caps_subject_subject_name_phase_language_key" ON "caps_subject"("subject_name", "phase", "language");

-- CreateIndex
CREATE UNIQUE INDEX "caps_grade_term_source_id_key" ON "caps_grade_term"("source_id");

-- CreateIndex
CREATE INDEX "caps_grade_term_subject_id_grade_term_idx" ON "caps_grade_term"("subject_id", "grade", "term");

-- CreateIndex
CREATE INDEX "caps_grade_term_subject_id_grade_term_week_start_idx" ON "caps_grade_term"("subject_id", "grade", "term", "week_start");

-- CreateIndex
CREATE UNIQUE INDEX "caps_assessment_requirement_source_id_key" ON "caps_assessment_requirement"("source_id");

-- CreateIndex
CREATE INDEX "caps_assessment_requirement_subject_id_grade_term_idx" ON "caps_assessment_requirement"("subject_id", "grade", "term");

-- CreateIndex
CREATE INDEX "caps_assessment_requirement_verification_level_idx" ON "caps_assessment_requirement"("verification_level");

-- CreateIndex
CREATE UNIQUE INDEX "caps_assessment_requirement_subject_id_grade_term_task_labe_key" ON "caps_assessment_requirement"("subject_id", "grade", "term", "task_label");

-- CreateIndex
CREATE INDEX "school_subscription_status_idx" ON "school"("subscription_status");

-- CreateIndex
CREATE INDEX "school_trial_expires_at_idx" ON "school"("trial_expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_popia_consent_token_key" ON "user"("popia_consent_token");

-- CreateIndex
CREATE INDEX "user_school_id_idx" ON "user"("school_id");

-- CreateIndex
CREATE INDEX "user_school_id_role_idx" ON "user"("school_id", "role");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "class_school_id_idx" ON "class"("school_id");

-- CreateIndex
CREATE INDEX "class_school_id_teacher_id_idx" ON "class"("school_id", "teacher_id");

-- CreateIndex
CREATE INDEX "class_enrollment_school_id_idx" ON "class_enrollment"("school_id");

-- CreateIndex
CREATE INDEX "class_enrollment_school_id_class_id_idx" ON "class_enrollment"("school_id", "class_id");

-- CreateIndex
CREATE INDEX "class_enrollment_school_id_student_id_idx" ON "class_enrollment"("school_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "class_enrollment_class_id_student_id_key" ON "class_enrollment"("class_id", "student_id");

-- CreateIndex
CREATE INDEX "resource_school_id_idx" ON "resource"("school_id");

-- CreateIndex
CREATE INDEX "resource_school_id_class_id_idx" ON "resource"("school_id", "class_id");

-- CreateIndex
CREATE INDEX "resource_caps_grade_term_id_idx" ON "resource"("caps_grade_term_id");

-- CreateIndex
CREATE INDEX "assignment_school_id_idx" ON "assignment"("school_id");

-- CreateIndex
CREATE INDEX "assignment_school_id_class_id_idx" ON "assignment"("school_id", "class_id");

-- CreateIndex
CREATE INDEX "assignment_school_id_due_date_idx" ON "assignment"("school_id", "due_date");

-- CreateIndex
CREATE INDEX "submission_school_id_idx" ON "submission"("school_id");

-- CreateIndex
CREATE INDEX "submission_school_id_assignment_id_idx" ON "submission"("school_id", "assignment_id");

-- CreateIndex
CREATE INDEX "submission_school_id_student_id_idx" ON "submission"("school_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "submission_assignment_id_student_id_key" ON "submission"("assignment_id", "student_id");

-- CreateIndex
CREATE INDEX "announcement_school_id_idx" ON "announcement"("school_id");

-- CreateIndex
CREATE INDEX "announcement_school_id_target_type_target_id_idx" ON "announcement"("school_id", "target_type", "target_id");

-- CreateIndex
CREATE INDEX "timetable_school_id_idx" ON "timetable"("school_id");

-- CreateIndex
CREATE INDEX "timetable_school_id_year_term_idx" ON "timetable"("school_id", "year", "term");

-- CreateIndex
CREATE INDEX "school_atp_school_id_idx" ON "school_atp"("school_id");

-- CreateIndex
CREATE INDEX "school_atp_school_id_status_idx" ON "school_atp"("school_id", "status");

-- CreateIndex
CREATE INDEX "school_atp_school_id_teacher_id_idx" ON "school_atp"("school_id", "teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_atp_school_id_teacher_id_subject_id_grade_term_year_key" ON "school_atp"("school_id", "teacher_id", "subject_id", "grade", "term", "year");

-- CreateIndex
CREATE INDEX "school_fap_tracking_school_id_idx" ON "school_fap_tracking"("school_id");

-- CreateIndex
CREATE INDEX "school_fap_tracking_school_id_teacher_id_idx" ON "school_fap_tracking"("school_id", "teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_fap_tracking_school_id_teacher_id_subject_id_grade_t_key" ON "school_fap_tracking"("school_id", "teacher_id", "subject_id", "grade", "term", "year", "assessment_type");

-- CreateIndex
CREATE INDEX "sba_marksheet_school_id_idx" ON "sba_marksheet"("school_id");

-- CreateIndex
CREATE INDEX "sba_marksheet_school_id_class_id_idx" ON "sba_marksheet"("school_id", "class_id");

-- CreateIndex
CREATE INDEX "sba_marksheet_school_id_student_id_idx" ON "sba_marksheet"("school_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "sba_marksheet_school_id_student_id_subject_id_term_year_ass_key" ON "sba_marksheet"("school_id", "student_id", "subject_id", "term", "year", "assessment_type");

-- AddForeignKey
ALTER TABLE "caps_grade_term" ADD CONSTRAINT "caps_grade_term_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "caps_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caps_assessment_requirement" ADD CONSTRAINT "caps_assessment_requirement_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "caps_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "school"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class" ADD CONSTRAINT "class_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "school"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class" ADD CONSTRAINT "class_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_enrollment" ADD CONSTRAINT "class_enrollment_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "school"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_enrollment" ADD CONSTRAINT "class_enrollment_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_enrollment" ADD CONSTRAINT "class_enrollment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource" ADD CONSTRAINT "resource_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "school"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource" ADD CONSTRAINT "resource_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource" ADD CONSTRAINT "resource_caps_grade_term_id_fkey" FOREIGN KEY ("caps_grade_term_id") REFERENCES "caps_grade_term"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "school"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_caps_grade_term_id_fkey" FOREIGN KEY ("caps_grade_term_id") REFERENCES "caps_grade_term"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "school"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "school"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_posted_by_fkey" FOREIGN KEY ("posted_by") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable" ADD CONSTRAINT "timetable_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "school"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable" ADD CONSTRAINT "timetable_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_atp" ADD CONSTRAINT "school_atp_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "school"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_atp" ADD CONSTRAINT "school_atp_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_atp" ADD CONSTRAINT "school_atp_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_atp" ADD CONSTRAINT "school_atp_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "caps_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_fap_tracking" ADD CONSTRAINT "school_fap_tracking_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "school"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_fap_tracking" ADD CONSTRAINT "school_fap_tracking_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_fap_tracking" ADD CONSTRAINT "school_fap_tracking_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "caps_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sba_marksheet" ADD CONSTRAINT "sba_marksheet_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "school"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sba_marksheet" ADD CONSTRAINT "sba_marksheet_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sba_marksheet" ADD CONSTRAINT "sba_marksheet_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sba_marksheet" ADD CONSTRAINT "sba_marksheet_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "caps_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
