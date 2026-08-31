/**
 * CAPS workbook parser — shared by the validator and the seed script.
 *
 * Reads prisma/caps-data/CAPS_DATA.xlsx and converts each sheet into rows
 * shaped for the Prisma schema.
 *
 * Two rules this file exists to enforce:
 *
 *  1. `sourceId` is the workbook's own id column. It is the natural key.
 *     Never renumber the spreadsheet — ids are permanent.
 *
 *  2. Raw text is preserved. `weekRange` and `taskName` go into the database
 *     exactly as the specialist wrote them. The parsed integers derived from
 *     weekRange are for ordering only and must never be displayed.
 */
import XLSX from 'xlsx';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const WORKBOOK_PATH = path.join(__dirname, 'caps-data', 'CAPS_DATA.xlsx');

const PHASE = {
  FOUNDATION: 'foundation',
  INTERMEDIATE: 'intermediate',
  SENIOR: 'senior',
  FET: 'fet',
};

const COUNTS_TOWARD = new Set(['SBA', 'EXAM', 'ORAL_EXAM', 'SBA_AND_EXAM', 'NOT_IN_CAPS']);
const WEIGHTING_BASIS = new Set([
  'OF_SBA',
  'OF_TERM_SBA',
  'OF_FINAL',
  'MEMBERSHIP_ONLY',
  'UNSPECIFIED',
]);
const VERIFICATION = new Set([
  'VERIFIED_CAPS',
  'VERIFIED_ATP',
  'VERIFIED',
  'DERIVED',
  'NEEDS_REVIEW',
  'NOT_IN_CAPS',
]);

/**
 * Parse a free-text week allocation into start/end integers.
 *
 * Handles: "Weeks 1-3", "Weeks 1–2" (en-dash), "Week 9 (1w)",
 *          "Weeks 8–10 (Trial)", "Weeks 1–1.5 (1.5w)".
 *
 * Returns { start: null, end: null } when unparseable — that is expected and
 * fine. The raw string is what gets shown to teachers.
 */
export function parseWeekRange(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === '') {
    return { start: null, end: null };
  }
  const s = String(raw).replace(/[\u2013\u2014]/g, '-');
  const range = s.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if (range) {
    return { start: Math.floor(Number(range[1])), end: Math.ceil(Number(range[2])) };
  }
  const single = s.match(/(\d+(?:\.\d+)?)/);
  if (single) {
    const n = Math.floor(Number(single[1]));
    return { start: n, end: n };
  }
  return { start: null, end: null };
}

/**
 * Coarse bucket for the FAP Tracker only.
 *
 * Returns null where a task has no sensible equivalent — many language tasks
 * (orals, transactional writing, multi-paper exams) genuinely do not map to
 * test/assignment/exam/project. Null is a correct answer, not a failure.
 *
 * NEVER show this to a teacher. Show taskName.
 */
export function bucketAssessmentType(taskName) {
  const n = String(taskName ?? '').toLowerCase();
  if (/\bexam|\bnsc\b|preliminary|trial/.test(n)) return 'exam';
  if (/\btest\b|controlled test/.test(n)) return 'test';
  if (/project|investigation|research/.test(n)) return 'project';
  if (/assignment|case study/.test(n)) return 'assignment';
  return null;
}

/**
 * Leading digits of a task label, for ordering only.
 * "4-P1" -> 4, "Task 10" -> 10, "NSC-P2" -> null.
 * Never display this. Display taskLabel.
 */
export function taskSequenceOf(label) {
  const m = String(label ?? '').match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

/** required_count is embedded in the notes text as "|| required_count: N". */
export function extractRequiredCount(notes) {
  const m = String(notes ?? '').match(/required_count:\s*(\d+)/i);
  return m ? Number(m[1]) : 1;
}

function sheetRows(wb, name) {
  const ws = wb.Sheets[name];
  if (!ws) throw new Error(`Sheet "${name}" not found. Found: ${wb.SheetNames.join(', ')}`);
  // Row 1 is a banner, row 2 is the header. Data starts at row 3.
  return XLSX.utils.sheet_to_json(ws, { range: 1, defval: null });
}

const clean = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' || s === 'None' ? null : s;
};

export function loadWorkbook(filePath = WORKBOOK_PATH) {
  const wb = XLSX.readFile(filePath);

  const subjects = sheetRows(wb, 'CapsSubject')
    .filter((r) => r.subject_id !== null && r.subject_name !== null)
    .map((r) => ({
      sourceId: Number(r.subject_id),
      subjectName: String(r.subject_name).trim(),
      phase: PHASE[String(r.phase).trim().toUpperCase()] ?? null,
      language: clean(r.language),
      specialistNotes: clean(r.specialist_notes),
    }));

  const gradeTerms = sheetRows(wb, 'CapsGradeTerm')
    // 78 pre-numbered blank rows exist (ids 287-364). They have an id and
    // nothing else. Filtering on subject_id is what excludes them.
    .filter((r) => r.subject_id !== null && r.topic_name !== null)
    .map((r) => {
      const { start, end } = parseWeekRange(r.week_range);
      return {
        sourceId: Number(r.caps_grade_term_id),
        subjectSourceId: Number(r.subject_id),
        grade: Number(r.grade),
        term: Number(r.term),
        weekRange: clean(r.week_range),
        weekStart: start,
        weekEnd: end,
        topic: String(r.topic_name).trim(),
        subtopics: clean(r.subtopics),
      };
    });

  const requirements = sheetRows(wb, 'CapsAssessmentRequiremnts')
    .filter((r) => r.subject_id !== null && r.task_name !== null)
    .map((r) => ({
      sourceId: Number(r.ass_req_id),
      subjectSourceId: Number(r.subject_id),
      grade: Number(r.grade),
      term: Number(r.term),
      taskLabel: String(r.task_number ?? '').trim(),
      taskSequence: taskSequenceOf(r.task_number),
      taskName: String(r.task_name).trim(),
      assessmentType: bucketAssessmentType(r.task_name),
      requiredCount: extractRequiredCount(r.notes),
      countsToward: clean(r.counts_toward),
      weightingPct: r.weighting_pct === null ? null : Number(r.weighting_pct),
      weightingBasis: clean(r.weighting_basis),
      weightingRaw: clean(r.weighting_raw),
      notes: clean(r.notes),
      sourceDocument: clean(r.source_document),
      verificationLevel: clean(r.verification_level),
    }));

  return { subjects, gradeTerms, requirements };
}

export const ENUMS = { PHASE, COUNTS_TOWARD, WEIGHTING_BASIS, VERIFICATION };
