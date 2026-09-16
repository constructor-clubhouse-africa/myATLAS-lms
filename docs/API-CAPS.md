# CAPS Reference API (MY-45)

Read-only endpoints serving the three global CAPS reference tables. Consumed by
the ATP Builder (MY-21), FAP Tracker (MY-22) and SBA Mark Sheet (MY-23).

These tables have **no `schoolId`**. They are shared by every school and seeded
once from DBE curriculum data. Never filter them by school.

All endpoints require a valid access token: `Authorization: Bearer <token>`.
All responses are wrapped in a `data` array. An empty result is `{"data": []}`
with status 200, never an error.

Seeded data is **FET phase only, Grades 10-12**: Mathematics, English Home
Language, Life Sciences, Accounting, History. A valid grade outside that range
returns an empty array, not a 400.

## GET /caps/subjects

No query parameters. Ordered by phase, then subject name.

```json
{
  "data": [
    {
      "id": "uuid",
      "sourceId": 1,
      "subjectName": "Mathematics",
      "phase": "fet",
      "language": null
    }
  ]
}
```

`specialistNotes` is deliberately not returned — it holds the CAPS specialist's
working notes, including unresolved discrepancy flags, and is not for teachers.

## GET /caps/grade-terms

Query parameters, all optional: `subjectId`, `grade`, `term`. Omitting one means
no filter on that field.

Ordered by grade, term, then `weekStart` ascending with nulls last. 76 rows have
no week range at all; without nulls-last they would sort above Week 1.

```json
{
  "data": [
    {
      "id": "uuid",
      "sourceId": 1,
      "subjectId": "uuid",
      "grade": 10,
      "term": 1,
      "weekRange": "Weeks 1-3",
      "topic": "Algebraic Expressions",
      "subtopics": "Simplification; Factorisation; Exponents"
    }
  ]
}
```

**`weekRange` is the only week field returned.** The parsed `weekStart` and
`weekEnd` integers exist for ordering and are deliberately withheld — 80 distinct
text formats exist (`"Weeks 8-10 (Trial)"`, `"Weeks 1-1.5 (1.5w)"`), and
rendering "Week 8" where CAPS says "Weeks 8-10 (Trial)" is wrong.

`subtopics` is a semicolon-delimited string, 1 to 36 items. Split at the consumer.

## GET /caps/assessment-requirements

Query parameters, all optional: `subjectId`, `grade`, `term`.

Ordered by grade, term, then `taskSequence` ascending with nulls last, with
`taskLabel` as tiebreaker so multi-paper tasks stay in sequence.

```json
{
  "data": [
    {
      "id": "uuid",
      "sourceId": 1,
      "subjectId": "uuid",
      "grade": 10,
      "term": 1,
      "taskLabel": "4-P1",
      "taskName": "Paper 1: Language in Context (70m, 2hrs)",
      "assessmentType": "exam",
      "requiredCount": 1,
      "countsToward": "SBA",
      "weightingPct": 20,
      "weightingBasis": "OF_SBA",
      "weightingRaw": "20%",
      "verificationLevel": "VERIFIED_CAPS",
      "sourceDocument": "CAPS FET Mathematics"
    }
  ]
}
```

### Three things consumers must get right

**`weightingPct` and `weightingBasis` always travel together.** `20 OF_SBA` and
`20 OF_FINAL` are completely different numbers. Any SBA calculation must branch
on the basis. Bases in use: `OF_SBA`, `OF_TERM_SBA`, `OF_FINAL`,
`MEMBERSHIP_ONLY`, `UNSPECIFIED`. `weightingPct` is null on 64 rows.

**`taskName` is what a teacher sees, not `assessmentType`.** The type is a coarse
bucket for FAP grouping and is null on 48 of 133 tasks — many language tasks
(orals, transactional writing) have no equivalent in the four-value enum. Null is
correct, not missing data.

**`verificationLevel` is returned unfiltered, and filtering is the consumer's
job.** 15 rows are not `VERIFIED_CAPS` / `VERIFIED_ATP` / `VERIFIED`, and 27 carry
unresolved discrepancy flags. The FAP Tracker **must not** raise a compliance
warning from a row that is not verified — telling a teacher they are
non-compliant based on data the specialist flagged as unresolved is worse than
saying nothing. This API returns everything so consumers can make that call
explicitly.

## Errors

| Status | When                                                            |
| ------ | --------------------------------------------------------------- |
| 400    | `grade` outside 1-12, `term` outside 1-4, or either non-integer |
| 401    | Missing, malformed or expired access token                      |
| 500    | Database or unexpected error                                    |

An unknown `subjectId` is not an error — it matches nothing and returns `{"data": []}`.
