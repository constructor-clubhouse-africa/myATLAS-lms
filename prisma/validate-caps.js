/**
 * CAPS data pre-flight validator.
 *
 * Checks the workbook against every constraint in schema.prisma WITHOUT
 * touching a database. Run this before seeding, and after the specialist
 * sends any updated workbook.
 *
 *   npm run caps:validate
 *
 * Exits 1 if any row would be rejected, so CI can gate on it.
 */
import { loadWorkbook, ENUMS, WORKBOOK_PATH } from './caps-parser.js';

const errors = [];
const warnings = [];

const fail = (sheet, id, msg) => errors.push(`  [${sheet} #${id}] ${msg}`);
const warn = (sheet, id, msg) => warnings.push(`  [${sheet} #${id}] ${msg}`);

function checkUnique(rows, keyFn, sheet, label) {
  const seen = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    if (seen.has(k)) {
      fail(sheet, r.sourceId, `duplicate ${label}: ${k} (also on #${seen.get(k)})`);
    }
    seen.set(k, r.sourceId);
  }
}

function main() {
  console.log(`\nValidating ${WORKBOOK_PATH}\n`);

  const { subjects, gradeTerms, requirements } = loadWorkbook();
  const subjectIds = new Set(subjects.map((s) => s.sourceId));

  // ---------- CapsSubject ----------
  checkUnique(subjects, (r) => r.sourceId, 'CapsSubject', 'sourceId');
  for (const s of subjects) {
    if (!Number.isInteger(s.sourceId)) fail('CapsSubject', s.sourceId, 'sourceId not an integer');
    if (!s.subjectName) fail('CapsSubject', s.sourceId, 'subjectName is required');
    if (!s.phase) {
      fail(
        'CapsSubject',
        s.sourceId,
        `phase not recognised (expected ${Object.keys(ENUMS.PHASE)})`
      );
    }
  }
  checkUnique(
    subjects,
    (r) => `${r.subjectName}|${r.phase}|${r.language}`,
    'CapsSubject',
    '[subjectName, phase, language]'
  );

  // ---------- CapsGradeTerm ----------
  checkUnique(gradeTerms, (r) => r.sourceId, 'CapsGradeTerm', 'sourceId');
  for (const g of gradeTerms) {
    if (!subjectIds.has(g.subjectSourceId)) {
      fail('CapsGradeTerm', g.sourceId, `subject ${g.subjectSourceId} does not exist`);
    }
    if (!Number.isInteger(g.grade)) fail('CapsGradeTerm', g.sourceId, 'grade is required');
    if (!Number.isInteger(g.term)) fail('CapsGradeTerm', g.sourceId, 'term is required');
    if (!g.topic) fail('CapsGradeTerm', g.sourceId, 'topic is required');
    if (g.weekRange && g.weekStart === null) {
      warn('CapsGradeTerm', g.sourceId, `weekRange "${g.weekRange}" could not be parsed`);
    }
    if (!g.weekRange) {
      warn('CapsGradeTerm', g.sourceId, 'no week_range — stored as null, displays as unscheduled');
    }
  }

  // ---------- CapsAssessmentRequirement ----------
  checkUnique(requirements, (r) => r.sourceId, 'CapsAssessmentRequirement', 'sourceId');
  checkUnique(
    requirements,
    (r) => `${r.subjectSourceId}|${r.grade}|${r.term}|${r.taskLabel}`,
    'CapsAssessmentRequirement',
    '[subject, grade, term, taskLabel]'
  );
  for (const a of requirements) {
    if (!subjectIds.has(a.subjectSourceId)) {
      fail('CapsAssessmentRequirement', a.sourceId, `subject ${a.subjectSourceId} does not exist`);
    }
    if (!a.taskLabel) fail('CapsAssessmentRequirement', a.sourceId, 'taskLabel is required');
    if (!a.taskName) fail('CapsAssessmentRequirement', a.sourceId, 'taskName is required');
    if (!a.countsToward || !ENUMS.COUNTS_TOWARD.has(a.countsToward)) {
      fail('CapsAssessmentRequirement', a.sourceId, `countsToward invalid: ${a.countsToward}`);
    }
    if (!a.verificationLevel || !ENUMS.VERIFICATION.has(a.verificationLevel)) {
      fail(
        'CapsAssessmentRequirement',
        a.sourceId,
        `verificationLevel invalid: ${a.verificationLevel}`
      );
    }
    if (a.weightingBasis && !ENUMS.WEIGHTING_BASIS.has(a.weightingBasis)) {
      fail('CapsAssessmentRequirement', a.sourceId, `weightingBasis invalid: ${a.weightingBasis}`);
    }
    // The dangerous combination: a number with no stated basis. 20% OF_SBA and
    // 20% OF_FINAL are different numbers. Never assume one.
    if (a.weightingPct !== null && !a.weightingBasis) {
      warn(
        'CapsAssessmentRequirement',
        a.sourceId,
        `weightingPct ${a.weightingPct} has NO weightingBasis — do not use in SBA maths`
      );
    }
    if (a.notes && /⚠|UNRESOLVED|DISCREPANCY/i.test(a.notes)) {
      warn('CapsAssessmentRequirement', a.sourceId, 'notes contain an unresolved discrepancy flag');
    }
  }

  // ---------- report ----------
  const unmapped = requirements.filter((r) => r.assessmentType === null).length;
  const unverified = requirements.filter(
    (r) => !['VERIFIED_CAPS', 'VERIFIED_ATP', 'VERIFIED'].includes(r.verificationLevel)
  ).length;

  console.log('ROW COUNTS');
  console.log(`  CapsSubject                 ${subjects.length}`);
  console.log(`  CapsGradeTerm               ${gradeTerms.length}`);
  console.log(`  CapsAssessmentRequirement   ${requirements.length}`);
  console.log(
    `  TOTAL                       ${subjects.length + gradeTerms.length + requirements.length}`
  );

  console.log('\nDATA CHARACTERISTICS (not errors)');
  console.log(
    `  week ranges parsed          ${gradeTerms.filter((g) => g.weekStart !== null).length}/${gradeTerms.length}`
  );
  console.log(
    `  subtopics captured          ${gradeTerms.reduce((n, g) => n + (g.subtopics ? g.subtopics.split(';').length : 0), 0)}`
  );
  console.log(`  tasks with no FAP bucket    ${unmapped} (expected — language tasks)`);
  console.log(
    `  rows not fully verified     ${unverified} (must not drive teacher-facing warnings)`
  );

  if (warnings.length) {
    console.log(`\nWARNINGS (${warnings.length}) — loadable, but review them`);
    for (const w of warnings.slice(0, 12)) console.log(w);
    if (warnings.length > 12) console.log(`  ... and ${warnings.length - 12} more`);
  }

  if (errors.length) {
    console.log(`\nERRORS (${errors.length}) — these rows WOULD BE REJECTED`);
    for (const e of errors.slice(0, 30)) console.log(e);
    if (errors.length > 30) console.log(`  ... and ${errors.length - 30} more`);
    console.log('\nRESULT: FAIL — fix the workbook or the schema before seeding.\n');
    process.exitCode = 1;
    return;
  }

  console.log('\nRESULT: PASS — every row satisfies every schema constraint.\n');
}

main();
