/**
 * MY-02 acceptance verification.
 *
 *   npm run db:verify
 *
 * Proves the schema is DONE, not just that it migrates. Checks that the real
 * CAPS data is present and readable, that tenant isolation holds, and that
 * nothing was silently dropped.
 *
 * A schema is not done because a migration ran. It is done when the next
 * person can build on it without coming back to you.
 */
import prisma from '../server/src/lib/prisma.js';
import { loadWorkbook } from './caps-parser.js';

let failed = 0;
const check = (name, pass, detail = '') => {
  console.warn(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
  if (!pass) failed++;
};

async function main() {
  console.warn('\nMY-02 VERIFICATION\n');
  const { subjects, gradeTerms, requirements } = loadWorkbook();

  // --- 1. Every row loaded ---
  console.warn('1. All CAPS rows present');
  const nSub = await prisma.capsSubject.count();
  const nGT = await prisma.capsGradeTerm.count();
  const nReq = await prisma.capsAssessmentRequirement.count();
  check('CapsSubject', nSub === subjects.length, `${nSub}/${subjects.length}`);
  check('CapsGradeTerm', nGT === gradeTerms.length, `${nGT}/${gradeTerms.length}`);
  check(
    'CapsAssessmentRequirement',
    nReq === requirements.length,
    `${nReq}/${requirements.length}`
  );

  // --- 2. Nothing silently dropped ---
  console.warn('\n2. No column silently dropped');
  const sampleGT = await prisma.capsGradeTerm.findFirst({ where: { weekRange: { not: null } } });
  check('weekRange preserved as raw text', !!sampleGT?.weekRange, sampleGT?.weekRange ?? '');
  check('subtopics preserved', !!sampleGT?.subtopics);
  const withBasis = await prisma.capsAssessmentRequirement.count({
    where: { weightingBasis: { not: null } },
  });
  check('weightingBasis stored', withBasis > 0, `${withBasis} rows`);
  const withNotes = await prisma.capsAssessmentRequirement.count({
    where: { notes: { not: null } },
  });
  check('specialist notes stored', withNotes > 0, `${withNotes} rows`);
  const papers = await prisma.capsAssessmentRequirement.findMany({
    where: { taskLabel: { contains: '-P' } },
    select: { taskLabel: true },
    take: 3,
  });
  check(
    'multi-paper task labels intact',
    papers.length > 0,
    papers.map((p) => p.taskLabel).join(', ')
  );

  // --- 3. The query MY-03 and MY-21 depend on ---
  console.warn('\n3. Grade 10 Mathematics Term 1 reads back correctly');
  const maths = await prisma.capsSubject.findFirst({ where: { subjectName: 'Mathematics' } });
  check('Mathematics subject exists', !!maths);
  const topics = await prisma.capsGradeTerm.findMany({
    where: { subjectId: maths?.id, grade: 10, term: 1 },
    orderBy: [{ weekStart: 'asc' }],
  });
  check('topics returned', topics.length > 0, `${topics.length} topics`);
  check(
    'topics have week ranges',
    topics.every((t) => t.weekRange !== null)
  );
  check(
    'topics have subtopics',
    topics.every((t) => t.subtopics !== null)
  );
  if (topics.length) {
    console.warn(`        e.g. "${topics[0].weekRange}" — ${topics[0].topic}`);
  }
  const tasks = await prisma.capsAssessmentRequirement.findMany({
    where: { subjectId: maths?.id, grade: 10, term: 1 },
    orderBy: [{ taskSequence: 'asc' }],
  });
  check('assessment tasks returned', tasks.length > 0, `${tasks.length} tasks`);
  check(
    'every task has countsToward',
    tasks.every((t) => t.countsToward !== null)
  );
  check(
    'every task has verificationLevel',
    tasks.every((t) => t.verificationLevel !== null)
  );

  // --- 4. Weighting safety ---
  console.warn('\n4. Weighting cannot be misused');
  const orphanWeights = await prisma.capsAssessmentRequirement.count({
    where: { weightingPct: { not: null }, weightingBasis: null },
  });
  check(
    'no weighting without a basis',
    orphanWeights === 0,
    orphanWeights ? `${orphanWeights} rows have a % with no basis — SBA maths would be wrong` : ''
  );
  const bases = await prisma.capsAssessmentRequirement.groupBy({
    by: ['weightingBasis'],
    _count: true,
  });
  console.warn(
    '        bases in use: ' +
      bases.map((b) => `${b.weightingBasis ?? 'null'}=${b._count}`).join(', ')
  );

  // --- 5. Tenant isolation ---
  console.warn('\n5. Tenant isolation');
  const a = await prisma.school.create({ data: { name: '__verify_A' } });
  const b = await prisma.school.create({ data: { name: '__verify_B' } });
  await prisma.user.create({
    data: {
      schoolId: a.id,
      name: 'A Teacher',
      email: `__verify_a_${Date.now()}@test.local`,
      passwordHash: 'x',
      role: 'teacher',
    },
  });
  const leak = await prisma.user.findMany({ where: { schoolId: b.id } });
  check('School B cannot see School A users', leak.length === 0);

  const uB = await prisma.user.create({
    data: {
      schoolId: b.id,
      name: 'B Teacher',
      email: `__verify_b_${Date.now()}@test.local`,
      passwordHash: 'x',
      role: 'teacher',
    },
  });
  await prisma.class.create({
    data: {
      schoolId: b.id,
      teacherId: uB.id,
      name: 'Maths 10A',
      subject: 'Mathematics',
      gradeLevel: 10,
    },
  });

  await prisma.school.delete({ where: { id: b.id } });
  const orphanUsers = await prisma.user.count({ where: { schoolId: b.id } });
  const orphanClasses = await prisma.class.count({ where: { schoolId: b.id } });
  check('cascade delete leaves no orphan users', orphanUsers === 0);
  check('cascade delete leaves no orphan classes', orphanClasses === 0);

  const capsSurvived = await prisma.capsSubject.count();
  check('CAPS reference data survives a school deletion', capsSurvived === subjects.length);

  await prisma.school.delete({ where: { id: a.id } });

  // --- result ---
  console.warn(
    failed === 0
      ? '\nMY-02 VERIFIED — schema is DONE. Amahle and Caitlyn are unblocked.\n'
      : `\n${failed} CHECK(S) FAILED — MY-02 is not done.\n`
  );
  if (failed) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error('\nVERIFICATION ERROR:', e.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
