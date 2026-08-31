# myATLAS

**South Africa's first CAPS-native school management platform.**

Built in Johannesburg by [Constructor Clubhouse Africa](https://github.com/constructor-clubhouse-africa).

Every other LMS available to South African schools was built for a different country and adapted. myATLAS was built for CAPS first: Annual Teaching Plans, Formal Assessment Programme tracking, and School-Based Assessment marks — the three things that actually consume a South African teacher's week.

---

## New here? Start with this

```bash
git clone https://github.com/constructor-clubhouse-africa/myatlas-lms.git
cd myatlas-lms
```

Then read, in order:

1. **[docs/SETUP.md](docs/SETUP.md)** — get it running locally (30 minutes)
2. **[CONTRIBUTING.md](CONTRIBUTING.md)** — how we work: branches, PRs, review
3. **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — how the system fits together

Then pick up your first ticket in Jira.

---

## The stack

| Layer    | Technology                                        |
| -------- | ------------------------------------------------- |
| Frontend | React 18 · Vite · Tailwind CSS                    |
| Offline  | Workbox service worker · IndexedDB · PWA manifest |
| Backend  | Node.js 20 · Express · JWT                        |
| Database | PostgreSQL (Supabase) · Prisma ORM                |
| Files    | Cloudinary                                        |
| Email    | Resend                                            |
| Hosting  | Vercel (frontend) · Railway (backend)             |
| CI       | GitHub Actions                                    |

---

## Repository layout

```
myatlas-lms/
├── .github/
│   ├── workflows/ci.yml       CI — runs on every PR
│   ├── pull_request_template.md
│   └── CODEOWNERS             who reviews what
├── docs/
│   ├── SETUP.md               local development
│   ├── ARCHITECTURE.md        how it fits together
│   └── WORKFLOW.md            sprints, standups, ceremonies
├── prisma/
│   ├── schema.prisma          15 tables — 9 core + 6 CAPS
│   └── seed.js                CAPS reference data (MY-03)
├── server/                    Express API
│   └── src/
│       ├── routes/
│       ├── middleware/        auth + tenant isolation
│       └── lib/
├── client/                    React PWA
└── .env.example               copy to .env, never commit .env
```

---

## The three things that make this different

**CAPS-native.** The curriculum structure is in the database, not bolted on. An ATP Builder that opens pre-loaded with the correct Grade 10 Mathematics topics for Term 2 is not something an international LMS can retrofit.

**Offline-capable.** Load shedding is a design constraint, not an edge case. The app installs from Chrome, caches its shell, and keeps working when the power goes.

**Built for a 375px Android phone on 3G.** Not a desktop app that shrinks. Every screen is tested on a real mid-range handset before it ships.

---

## Non-negotiables

Three rules that no ticket, deadline, or shortcut overrides.

**1. Tenant isolation.** Every school-scoped query filters by `schoolId`. A request authenticated for School A must never be able to read School B's data, at any layer, ever. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

**2. No secrets in the repo.** Not in code, not in tests, not in a commit you plan to amend later. **This repository is public** — a committed key is harvested by bots within minutes. If you think you've committed one, say so in `#help` immediately. Nobody gets in trouble for reporting it; people get in trouble for hiding it.

**3. Learner data is treated as if it were your own child's.** This platform holds information about minors, protected under POPIA. Never copy production data to your machine. Use test data for development.

---

## Contributors

myATLAS was built by a team of final-year student developers. See [CONTRIBUTORS.md](CONTRIBUTORS.md).

---

## Licence

Source-available, not open source. See [LICENSE](LICENSE). Contributors may showcase and reference their own work freely.
