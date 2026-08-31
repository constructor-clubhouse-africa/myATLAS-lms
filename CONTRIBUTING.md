# Contributing to myATLAS

How we work. Read this once properly — it will save you re-doing a PR.

---

## The loop

```
Pick ticket  →  Branch  →  Build  →  PR  →  Review  →  Merge  →  Close ticket
```

### 1. Pick up a ticket

Move it to **In Progress** in Jira. Maximum **two tickets in progress at a time** — finish something before starting something else.

If you can't start because something else isn't done, say so in `#blockers` the day you discover it. Not three days later.

### 2. Branch

Always from `develop`, never from `main`.

```bash
git checkout develop
git pull
git checkout -b feature/MY-12-jwt-auth
```

**The ticket key must be in the branch name.** Without it, the branch doesn't link to Jira and can't be tracked.

| Prefix     | Use for                       |
| ---------- | ----------------------------- |
| `feature/` | New functionality             |
| `fix/`     | Bug fixes                     |
| `chore/`   | Config, dependencies, tooling |
| `test/`    | Tests only                    |

### 3. Commit

Conventional Commits — `type(scope): description`, present tense:

```
feat(auth): add JWT middleware with schoolId injection
fix(submission): resolve offline sync conflict on reconnection
chore(deps): update Prisma to 7.10.0
test(e2e): add Playwright test for school registration
```

Commit often. Small commits are easier to review and easier to undo.

### 4. Open a pull request

Target **`develop`**. Never open a PR against `main`.

Fill in the template properly. "Fixed the thing" tells a reviewer nothing, and a vague PR gets sent back — which costs you more time than writing it properly would have.

**Your PR description is part of your portfolio.** We squash-merge, so ten commits collapse into one, but the PR conversation stays on your GitHub profile permanently. A recruiter reading your PRs learns more about you than they do from the diff.

### 5. Get it reviewed

Any team member can approve most PRs. Muaaz reviews anything touching:

- `prisma/` — the database schema
- `server/src/middleware/` — auth and tenant isolation
- `server/src/lib/` — shared infrastructure

This is deliberate. Peer review spreads knowledge and stops one person becoming a bottleneck.

**Review within 24 hours, or say you can't.** A PR sitting unreviewed blocks a person.

### 6. Merge

**Squash merge only.** Delete the branch afterward. Move the ticket to **Done**.

---

## Reviewing someone else's code

You are jointly responsible for what merges. If you approve it, you own it too.

- Review the code, never the person
- "Why did you do it this way?" beats "this is wrong"
- **If you don't understand it, ask.** Approving something you don't follow helps nobody
- Praise the good bits out loud. Review that is only criticism is exhausting to receive

---

## Definition of Done

A ticket is Done when **all** of these are true:

- [ ] Acceptance criteria in the ticket are met
- [ ] Code is on a feature branch with the ticket key
- [ ] PR opened with the template completed
- [ ] At least one approving review
- [ ] Tests written for new logic, suite passes
- [ ] CI green
- [ ] No `console.log` (use `console.warn` / `console.error`)
- [ ] No secrets, keys, or `.env` values committed
- [ ] UI changes tested on a **physical** Android device
- [ ] Squash merged to `develop`
- [ ] Jira ticket moved to Done

"It works on my machine" is not Done.

---

## Rules that exist for a reason

### Never commit secrets

This repository is **public**. A committed API key is scraped by bots within minutes, and deleting the file afterward does not remove it from git history.

Before every commit:

```bash
git diff --staged
```

If you have committed a secret: **stop, say so in `#help` immediately.** Do not quietly try to fix it. The key must be rotated, and that only happens if someone knows.

### Never use production data locally

myATLAS holds information about children, protected under POPIA. Use seeded test data. Never export real learner, parent or teacher records to your machine.

### The CAPS reference tables are not school-scoped

`CapsSubject`, `CapsGradeTerm`, `CapsAssessmentRequirement` are global — shared by every school, no `school_id` column.

Do **not** apply `where: { schoolId }` to them. Everything else school-scoped, you must.

### Marks are `Decimal`, never `Float`

Float arithmetic produces `67.99999999` on a mark sheet a school submits to the DBE.

Prisma returns `Decimal` objects. Convert with `.toNumber()` at the API boundary. Never use `+` on the raw value.

---

## Asking for help

Ask in `#help`. Include:

1. What you're trying to do
2. What you tried
3. The actual error message, as text — not a screenshot of text

**There are no stupid questions.** Sitting stuck for four hours out of embarrassment costs the team more than asking would have. Everyone here is learning this stack.

---

## Your studies come first

Always. If this project starts interfering with your academic work, say so and we cut your scope immediately. That is not failing — it is exactly what you should do.

Declare low capacity in advance. Nobody is judged on hours. You're judged on communicating honestly about them.
