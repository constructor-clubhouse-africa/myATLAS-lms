/**
 * Query-parameter parsing for the CAPS reference endpoints (MY-45).
 * Each parser returns undefined when the param is absent, so callers can
 * spread the result into a Prisma `where` and have omission mean "no filter".
 */

export class QueryParamError extends Error {
  constructor(message) {
    super(message);
    this.name = 'QueryParamError';
  }
}

export function parseGrade(raw) {
  if (raw === undefined || raw === '') return undefined;

  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 12) {
    throw new QueryParamError(
      `Invalid grade: "${raw}". Grade must be a whole number between 1 and 12.`
    );
  }
  return value;
}

export function parseTerm(raw) {
  if (raw === undefined || raw === '') return undefined;

  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 4) {
    throw new QueryParamError(`Invalid term: "${raw}". Term must be 1, 2, 3 or 4.`);
  }
  return value;
}

/**
 * subjectId is a uuid from CapsSubject.id. An unknown id is not an error -
 * it simply matches nothing and returns an empty array.
 */
export function parseSubjectId(raw) {
  if (raw === undefined || raw === '') return undefined;

  if (typeof raw !== 'string') {
    throw new QueryParamError('Invalid subjectId: expected a single value.');
  }
  return raw;
}
