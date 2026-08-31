# Local development setup

Target: running locally in about 30 minutes. If you get stuck for more than 15 minutes on any step, ask in `#help`.

---

## Prerequisites

| Tool    | Version     | Check           |
| ------- | ----------- | --------------- |
| Node.js | 20 or later | `node -v`       |
| npm     | 10 or later | `npm -v`        |
| Git     | any recent  | `git --version` |

If you use `nvm`: `nvm use` picks up the version from `.nvmrc`.

---

## Step 1 — Set your git email (do this first)

**This one matters more than it looks.**

Your commits only appear on your GitHub profile if the email in your local git config matches a **verified** email on your GitHub account. If it doesn't, ten weeks of your work shows up as an unattributed stranger and your contribution graph stays empty.

```bash
git config user.email
```

Compare that to the emails listed at [github.com/settings/emails](https://github.com/settings/emails). If they don't match:

```bash
git config --global user.email "your-verified-email@example.com"
git config --global user.name "Your Name"
```

Fixing this later means rewriting shared history. Do it now.

---

## Step 2 — Clone and install

```bash
git clone https://github.com/constructor-clubhouse-africa/myatlas-lms.git
cd myatlas-lms
npm install
```

npm workspaces installs both `server` and `client` from the root.

---

## Step 3 — Environment variables

```bash
cp .env.example .env
```

Then confirm `.env` is ignored **before you commit anything**:

```bash
git check-ignore .env
```

That must print `.env`. If it prints nothing, stop and ask in `#help`.

Muaaz will give you the development values. **Never** paste real values into Discord, a PR, or a screenshot.

---

## Step 4 — Database

We use Supabase (managed PostgreSQL).

Supabase gives you **two** connection strings and they are not interchangeable:

| Variable       | Port                          | Used by         |
| -------------- | ----------------------------- | --------------- |
| `DATABASE_URL` | **6543** — transaction pooler | the application |
| `DIRECT_URL`   | **5432** — direct connection  | Prisma Migrate  |

**Migrations fail against the pooler.** If `migrate dev` hangs or throws a prepared-statement error, this is why.

```bash
npm run db:migrate     # apply migrations
npm run db:generate    # generate the Prisma client
npm run db:seed        # load CAPS reference data
```

Inspect the data with:

```bash
npm run db:studio
```

---

## Step 5 — Run it

```bash
npm run dev            # API on http://localhost:3000
npm run dev:client     # frontend on http://localhost:5173
```

Check the API is alive:

```bash
curl http://localhost:3000/health
```

---

## Before every PR

```bash
npm run format         # fix formatting
npm run lint           # must pass
npm test               # must pass
```

CI runs exactly these. Running them locally first saves you a round trip.

---

## Common problems

**`Environment variable not found: DATABASE_URL`**
You haven't created `.env`, or you're running from the wrong directory. Run from the repo root.

**Migration hangs or throws a prepared-statement error**
You're pointing `DIRECT_URL` at the pooler. It must be port **5432**.

**`Cannot find module '@prisma/client'`**
Run `npm run db:generate`. The client is generated, not installed.

**ESLint fails on `console.log`**
That's intentional — Definition of Done says no `console.log` in merged code. Use `console.warn` or `console.error`, or remove it.

**Prisma returns `Decimal` and my maths is wrong**
Marks are `Decimal`, not `Float`. Use `.toNumber()` at the API boundary.

---

## Getting help

`#help` in Discord. Include what you're trying to do, what you tried, and the actual error text.
