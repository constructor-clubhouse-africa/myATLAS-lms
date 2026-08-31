# Middleware

Order matters. Every authenticated request runs through these in sequence:

1. `requireAuth` (MY-06) — validates the JWT, rejects with 401 if missing or invalid
2. `injectSchoolId` (MY-05) — reads `schoolId` from the JWT, sets `req.schoolId`

## Critical: the CAPS reference tables are NOT school-scoped

`CapsSubject`, `CapsGradeTerm` and `CapsAssessmentRequirement` are global reference
data shared by every school. They have no `school_id` column.

Do NOT apply `where: { schoolId: req.schoolId }` to queries against those three
tables — it will throw, or silently return nothing, and the ATP Builder will load
empty with no obvious cause.

Everything else school-scoped MUST be filtered by `req.schoolId` on every read.
