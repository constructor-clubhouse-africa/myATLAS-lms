# Architecture

Read this before writing a query.

---

## Multi-tenancy — the non-negotiable

One database serves every school. A request authenticated for School A must **never** be able to read School B's data.

Three independent layers enforce this. All three must hold.

### Layer 1 — Schema

Every school-scoped table has `school_id`, `NOT NULL`, indexed, with a foreign key to `school`. Defined in `prisma/schema.prisma`.

### Layer 2 — Middleware (MY-05)

Every authenticated request passes through middleware that reads the validated JWT, extracts `schoolId`, and attaches it to `req.schoolId`. No route handler runs before this.

### Layer 3 — Query

Every query against a school-scoped table filters on `req.schoolId`:

```js
// correct
const classes = await prisma.class.findMany({
  where: { schoolId: req.schoolId, teacherId: req.user.id },
});

// WRONG — returns every school's data
const classes = await prisma.class.findMany({
  where: { teacherId: req.user.id },
});
```

---

## The two data layers

This is the thing people get wrong in their first week.

### Global CAPS reference — NO `schoolId`

| Table                       | What it holds                                                 |
| --------------------------- | ------------------------------------------------------------- |
| `CapsSubject`               | Every CAPS subject, by phase                                  |
| `CapsGradeTerm`             | Official term structure: which topic, which week, which grade |
| `CapsAssessmentRequirement` | FAP counts and SBA weightings                                 |

Seeded once from DBE curriculum data, verified by the CAPS specialist. Shared by every school. Read-only to schools.

**Do not apply `where: { schoolId }` to these three tables.** They have no such column. Doing so throws, or silently returns nothing, and the ATP Builder loads empty with no obvious cause.

Why global? Copying CAPS rows per school would mean thousands of duplicated rows per tenant, and a curriculum correction would require updating every school separately.

### School-scoped — `schoolId` REQUIRED

Everything else: `School`, `User`, `Class`, `ClassEnrollment`, `Resource`, `Assignment`, `Submission`, `Announcement`, `Timetable`, `SchoolAtp`, `SchoolFapTracking`, `SbaMarksheet`.

All cascade-delete from `School`, so deleting one school removes all its data with no orphans. That is what makes POPIA deletion possible.

---

## Conventions that will bite you

### Marks are `Decimal`

```js
// WRONG
const total = marks.reduce((a, m) => a + m.mark, 0);

// correct
const total = marks.reduce((a, m) => a + m.mark.toNumber(), 0);
```

Float gives `67.99999999` on a document a school submits to the DBE.

### `weightedContribution` is per row, not a running total

Each `SbaMarksheet` row stores **that row's** contribution to the SBA total. Sum them at read time.

Storing a cumulative total on every row means every row is wrong the moment one mark changes.

The weighting is **always recalculated server-side** from `CapsAssessmentRequirement`. Never trust a weighted value sent by the client.

### Unique constraints make offline sync safe

`Submission` is unique on `(assignmentId, studentId)`. `SbaMarksheet` is unique on `(schoolId, studentId, subjectId, term, year, assessmentType)`.

When an offline write replays twice, these are what prevent duplicate rows. Design sync as an **upsert** against them, not an insert.

### Never leak errors to the client

No stack traces, no SQL, no technical messages. The global error handler in `server/src/index.js` logs the detail and returns a generic response.

---

## Request lifecycle

```
Request
  → helmet, cors, json parsing
  → requireAuth        (MY-06) validate JWT, else 401
  → injectSchoolId     (MY-05) set req.schoolId
  → route handler      every query filters by req.schoolId
  → error handler      log detail, return generic error
```

---

## POPIA

myATLAS processes personal information about minors. These are build requirements, not launch tasks.

| Requirement                            | Where                          |
| -------------------------------------- | ------------------------------ |
| DPA accepted before a school activates | `School.dpaAcceptedAt` (MY-10) |
| Parental consent per student           | `User.popiaConsentAt` (MY-11)  |
| Deletion leaves no orphans             | cascade rules in schema        |
| Plain-language privacy policy          | MY-34                          |

**Never copy production data to a local machine.**
