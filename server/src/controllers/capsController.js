/**
 * Read-only controllers for the global CAPS reference tables (MY-45).
 *
 * These tables have NO schoolId. They are shared by every school and seeded
 * once from DBE curriculum data. Never filter them by school.
 */
import prisma from '../lib/prisma.js';
import { QueryParamError } from '../lib/capsQuery.js';

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

export default { getSubjects };
