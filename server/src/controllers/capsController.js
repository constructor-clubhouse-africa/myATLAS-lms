/**
 * Read-only controllers for the global CAPS reference tables (MY-45).
 *
 * These tables have NO schoolId. They are shared by every school and seeded
 * once from DBE curriculum data. Never filter them by school.
 */
import prisma from '../lib/prisma.js';
import { QueryParamError, parseGrade, parseTerm, parseSubjectId } from '../lib/capsQuery.js';

function serializeSubject(subject) {
  return {
    id: subject.id,
    sourceId: subject.sourceId,
    subjectName: subject.subjectName,
    phase: subject.phase,
    language: subject.language,
  };
}

export async function getSubjects(req, res) {
  try {
    const subjects = await prisma.capsSubject.findMany({
      orderBy: [{ phase: 'asc' }, { subjectName: 'asc' }],
    });

    return res.status(200).json({ data: subjects.map(serializeSubject) });
  } catch (err) {
    if (err instanceof QueryParamError) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Error fetching CAPS subjects:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}

function serializeAssessmentRequirement(requirement) {
  return {
    id: requirement.id,
    sourceId: requirement.sourceId,
    subjectId: requirement.subjectId,
    grade: requirement.grade,
    term: requirement.term,
    taskLabel: requirement.taskLabel,
    taskName: requirement.taskName,
    assessmentType: requirement.assessmentType,
    requiredCount: requirement.requiredCount,
    countsToward: requirement.countsToward,
    weightingPct: requirement.weightingPct === null ? null : requirement.weightingPct.toNumber(),
    weightingBasis: requirement.weightingBasis,
    weightingRaw: requirement.weightingRaw,
    verificationLevel: requirement.verificationLevel,
    sourceDocument: requirement.sourceDocument,
  };
}

export async function getAssessmentRequirements(req, res) {
  try {
    const subjectId = parseSubjectId(req.query.subjectId);
    const grade = parseGrade(req.query.grade);
    const term = parseTerm(req.query.term);

    const requirements = await prisma.capsAssessmentRequirement.findMany({
      where: { subjectId, grade, term },
      // taskSequence is null where taskLabel has no leading digits.
      // taskLabel is the tiebreaker so multi-paper tasks ("4-P1", "4-P2") stay in order.
      orderBy: [
        { grade: 'asc' },
        { term: 'asc' },
        { taskSequence: { sort: 'asc', nulls: 'last' } },
        { taskLabel: 'asc' },
      ],
    });

    return res.status(200).json({ data: requirements.map(serializeAssessmentRequirement) });
  } catch (err) {
    if (err instanceof QueryParamError) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Error fetching CAPS assessment requirements:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}

/**
 * weekRange and the raw topic text are what a teacher sees. weekStart and
 * weekEnd exist only for ordering - they are deliberately NOT returned, so no
 * consumer can accidentally render "Week 8" where CAPS says "Weeks 8-10 (Trial)".
 */
function serializeGradeTerm(gradeTerm) {
  return {
    id: gradeTerm.id,
    sourceId: gradeTerm.sourceId,
    subjectId: gradeTerm.subjectId,
    grade: gradeTerm.grade,
    term: gradeTerm.term,
    weekRange: gradeTerm.weekRange,
    topic: gradeTerm.topic,
    subtopics: gradeTerm.subtopics,
  };
}

export async function getGradeTerms(req, res) {
  try {
    const subjectId = parseSubjectId(req.query.subjectId);
    const grade = parseGrade(req.query.grade);
    const term = parseTerm(req.query.term);

    const gradeTerms = await prisma.capsGradeTerm.findMany({
      where: { subjectId, grade, term },
      // weekStart is null on 76 rows. Postgres sorts nulls first on ASC by
      // default, which would put every unscheduled topic above Week 1.
      orderBy: [
        { grade: 'asc' },
        { term: 'asc' },
        { weekStart: { sort: 'asc', nulls: 'last' } },
        { topic: 'asc' },
      ],
    });

    return res.status(200).json({ data: gradeTerms.map(serializeGradeTerm) });
  } catch (err) {
    if (err instanceof QueryParamError) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Error fetching CAPS grade terms:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}

export default { getSubjects, getGradeTerms, getAssessmentRequirements };
