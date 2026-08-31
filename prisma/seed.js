/**
 * CAPS reference data seed — MY-03 foundation.
 *
 *   npm run db:seed              apply changes
 *   npm run db:seed -- --dry-run report what would change, write nothing
 *   npm run db:seed -- --prune   also delete rows no longer in the workbook
 *
 * IDEMPOTENT. Every row is matched on `sourceId` (the workbook's own id), so
 * this can be run any number of times. When the specialist sends an updated
 * workbook, drop it in and re-run — only changed rows are touched.
 *
 * ONE RULE FOR THE SPECIALIST: ids in the workbook are permanent.
 * Never renumber, never reuse. Renumbering creates duplicates and orphans.
 */
import prisma from '../server/src/lib/prisma.js';
import { loadWorkbook } from './caps-parser.js';

const DRY_RUN = process.argv.includes('--dry-run');
const PRUNE = process.argv.includes('--prune');

const stats = {
  subjects: { created: 0, updated: 0, unchanged: 0, deleted: 0 },
  gradeTerms: { created: 0, updated: 0, unchanged: 0, deleted: 0 },
  requirements: { created: 0, updated: 0, unchanged: 0, deleted: 0 },
};

/** Compare only the fields we manage. Prisma Decimals need special handling. */
function differs(existing, incoming) {
  return Object.keys(incoming).some((k) => {
    const a = existing[k];
    const b = incoming[k];
    if (a === null && b === null) return false;
    if (a && typeof a.toNumber === 'function') {
      return b === null || a.toNumber() !== Number(b);
    }
    return String(a ?? '') !== String(b ?? '');
  });
}

async function sync(model, rows, bucket, label) {
  const existing = await model.findMany();
  const bySource = new Map(existing.map((r) => [r.sourceId, r]));

  for (const row of rows) {
    const { sourceId, ...data } = row;
    const found = bySource.get(sourceId);

    if (!found) {
      if (!DRY_RUN) await model.create({ data: { sourceId, ...data } });
      stats[bucket].created++;
    } else if (differs(found, data)) {
      if (!DRY_RUN) await model.update({ where: { sourceId }, data });
      stats[bucket].updated++;
    } else {
      stats[bucket].unchanged++;
    }
    bySource.delete(sourceId);
  }

  // Anything left is in the database but no longer in the workbook.
  if (bySource.size > 0) {
    if (PRUNE) {
      for (const [sourceId] of bySource) {
        if (!DRY_RUN) await model.delete({ where: { sourceId } });
        stats[bucket].deleted++;
      }
    } else {
      console.warn(
        `  ! ${bySource.size} ${label} rows are in the database but not in the workbook. ` +
          `Run with --prune to remove them.`
      );
    }
  }
}

async function main() {
  console.warn(`\nCAPS seed${DRY_RUN ? ' (DRY RUN — nothing will be written)' : ''}\n`);

  const { subjects, gradeTerms, requirements } = loadWorkbook();
  console.warn(
    `Workbook: ${subjects.length} subjects, ${gradeTerms.length} grade-terms, ` +
      `${requirements.length} requirements\n`
  );

  await sync(prisma.capsSubject, subjects, 'subjects', 'CapsSubject');

  const subjectMap = new Map(
    (await prisma.capsSubject.findMany({ select: { id: true, sourceId: true } })).map((s) => [
      s.sourceId,
      s.id,
    ])
  );

  const resolve = (rows) =>
    rows.map(({ subjectSourceId, ...rest }) => {
      const subjectId = subjectMap.get(subjectSourceId);
      if (!subjectId) throw new Error(`No subject with sourceId ${subjectSourceId}`);
      return { ...rest, subjectId };
    });

  await sync(prisma.capsGradeTerm, resolve(gradeTerms), 'gradeTerms', 'CapsGradeTerm');
  await sync(
    prisma.capsAssessmentRequirement,
    resolve(requirements),
    'requirements',
    'CapsAssessmentRequirement'
  );

  console.warn('RESULT');
  for (const [k, v] of Object.entries(stats)) {
    console.warn(
      `  ${k.padEnd(14)} created ${v.created}  updated ${v.updated}  ` +
        `unchanged ${v.unchanged}  deleted ${v.deleted}`
    );
  }

  if (DRY_RUN) {
    console.warn('\nDry run complete. Nothing was written.\n');
    return;
  }

  const counts = {
    CapsSubject: await prisma.capsSubject.count(),
    CapsGradeTerm: await prisma.capsGradeTerm.count(),
    CapsAssessmentRequirement: await prisma.capsAssessmentRequirement.count(),
  };
  console.warn('\nROWS IN DATABASE');
  for (const [k, v] of Object.entries(counts)) console.warn(`  ${k.padEnd(28)} ${v}`);

  const expected = subjects.length + gradeTerms.length + requirements.length;
  const actual = Object.values(counts).reduce((a, b) => a + b, 0);
  if (actual !== expected) {
    console.error(`\nMISMATCH: expected ${expected} rows, found ${actual}`);
    process.exitCode = 1;
    return;
  }
  console.warn(`\nAll ${actual} rows present. Seed complete.\n`);
}

main()
  .catch((e) => {
    console.error('\nSEED FAILED:', e.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
