# NW Pricer — Improvement Plan

Track progress here when working in chunks or across sessions.  
Last reviewed from codebase audit: **2026-05-24**.

**How to use this doc**

- Check off items as you complete them: `- [x]`
- Add notes under a section (`<!-- done: ... -->` or a short bullet) if context matters for the next session
- Work top-to-bottom within each priority band unless a dependency forces otherwise

---

## Progress summary

| Priority | Total | Done | Remaining |
|----------|------:|-----:|----------:|
| P0 — Critical | 14 | 13 | 1 |
| P1 — High | 12 | 11 | 1 |
| P2 — Medium | 18 | 0 | 18 |
| P3 — Polish | 8 | 1 | 7 |
| **All** | **52** | **25** | **27** |

_Update the table when checking items off._

---

## P0 — Critical (security & access)

### Server action authentication

- [x] Create `requireAdminSession()` helper in `src/lib/auth.ts` (uses `getSession()`, throws or returns `{ ok: false }`) — #151
- [x] Call `requireAdminSession()` at the start of every **admin** server action in `src/app/actions.ts` — #151
- [x] Document which actions stay **public** (e.g. `approveProjectAction` only) in a comment block at top of `actions.ts` — #151
- [x] Manually verify: unauthenticated `POST` to a server action fails (curl or browser without cookie) — #173 (`docs/SECURITY.md`)

**Admin actions to gate (non-exhaustive — verify full file):**

- [x] `getSavedProjects` — #151
- [x] `getClients` — #151
- [x] `updateProjectStatusAction` — #151
- [x] `updateClientStatusAction` — #151
- [x] `createClientAction` — #151
- [x] `updateClientAction` — #151
- [x] `deleteClientAction` — #151
- [x] `saveProjectAction` — #151
- [x] `deleteProjectAction` — #151
- [x] `unlockProjectAction` — #151
- [x] `getStats` — #151
- [x] `getClientById` — #151
- [x] `getEmailTemplates` — #151
- [x] `saveEmailTemplate` — #151
- [x] `sendIndividualEmailAction` — #151
- [x] `sendBulkEmailAction` — #151
- [x] `createPaymongoLinkAction` — kept **public** for client checkout on `/p/[id]` — #151

**Keep public (if client signing is required):**

- [x] `approveProjectAction` — public — #151; consider hardening (see Public links below)

### Secrets & login hardening

- [x] Remove `JWT_SECRET` fallback in `src/lib/auth.ts`; throw at startup in production if missing — #153
- [x] Remove `CRM_PASSWORD` default `"northernware"` in `src/app/login/actions.ts`; require env in production — #153
- [x] Add `.env.example` with `JWT_SECRET`, `CRM_PASSWORD`, `DATABASE_URL`, `RESEND_API_KEY`, `PAYMONGO_SECRET_KEY` (no real values) — #153
- [x] Confirm production deploy sets all required env vars — #167 README production checklist + #173

### Public project links (`/p/[id]`)

- [x] Replace short `generateId()` IDs with `cuid()` / `nanoid()` (update `saveProjectAction` + `Calculator.tsx`) — #160 (`crypto.randomUUID`)
- [x] Evaluate signed URL or expiring token for client-facing docs (design decision — document choice here) — #173 (`docs/PUBLIC_LINKS.md`)
- [ ] Optional: separate “view” vs “sign” capability (read-only link + sign link with token) — deferred per PUBLIC_LINKS.md
- [ ] Rate-limit or CAPTCHA on `approveProjectAction` if abuse is a concern — deferred per PUBLIC_LINKS.md

### Approval integrity

- [x] On locked/public views, re-hash `project.config` and compare to `snapshotHash`; show tamper warning if mismatch — #157
- [x] `unlockProjectAction`: clear `snapshotHash`, `ipAddress`, `userAgent` (not only `approvedAt` / `signedBy`) — #155
- [x] After unlock, revalidate `/p/[id]` and admin calculator views — #155 (existing revalidatePath calls)

---

## P1 — High (correctness, trust, ops)

### Pricing engine (`src/lib/calculator.ts`)

- [ ] Decide whether `projectType` should affect hours/cost; if yes, implement multipliers or hour tables per type
- [x] Document whether `hostingPrice` is **MRR only** (excluded from `roundedPrice`) — update UI copy if so — #169
- [x] Decide currency behavior: display-only vs FX conversion; implement or document “user sets hourly rate per currency” — #167 README
- [x] Align `README.md` formulas with actual logic (pages, design hours, complexity `simple`/`complex` ×1.0/×1.5) — #167
- [x] Add `currency` default in `POST /api/calculate` if missing — #169

### Tests

- [x] Add Vitest (or project test runner of choice) — #163
- [x] Add `npm run test` script in `package.json` — #163
- [x] Table-driven tests for `calculate()`: pages, design, features, complexity, buffer, discount, rounding — #163
- [x] Edge cases: `pages` clamp 1–100, empty features, `roundingMode: none`, 0% buffer/discount — #170 (calculator tests; API clamp in route)
- [x] CI job: `npm run test` on PR (optional until repo has CI) — #170

### Documentation

- [x] Rewrite `README.md`: CRM, Prisma, auth, public links, email, PayMongo — not “calculator only” — #167
- [x] Move completed “Future” items to “Done” (PDF export, templates, dark mode, etc.) — #167
- [x] Keep honest “Still planned” list (SEO retainer, public estimator, etc.) — #167
- [x] Document setup: `prisma migrate`, env vars, separate git repo under `tools/` — #167, #175

### Database (Prisma)

- [x] Create initial migration (or baseline) under `prisma/migrations/` — #175
- [ ] Replace free-form `status` strings with Prisma enums where possible (`Client`, `Project`, `EmailCampaign`)
- [ ] Add `EmailCampaign.templateId` → `EmailTemplate` relation (FK)
- [ ] Define `onDelete` for `Client` → `Project`, `ActivityLog` (Cascade vs Restrict — pick explicitly)
- [ ] Run migrate on staging/prod with backup plan documented in README

---

## P2 — Medium (architecture & product)

### Split `src/app/actions.ts`

- [ ] `src/app/actions/projects.ts`
- [ ] `src/app/actions/clients.ts`
- [ ] `src/app/actions/email.ts`
- [ ] `src/app/actions/billing.ts` (PayMongo)
- [ ] `src/app/actions/stats.ts` or keep small getters in one `queries.ts`
- [ ] Re-export or update imports in components (grep `from "@/app/actions"`)

### Refactor large components

- [ ] `Calculator.tsx` (~636 lines): extract PDF export hook, project save hook, library modal
- [ ] `InputPanel.tsx` (~479 lines): split calculator vs proposal/contract tabs
- [ ] `ClientBoard.tsx`: extract column/card subcomponents
- [ ] Shared types file: `src/types/crm.ts` (Client, Project, StoredProject — no `any`)

### Remove localStorage split-brain

- [ ] Audit uses of `src/lib/storage.ts` vs DB `saveProjectAction`
- [ ] Keep draft autosave (`nw_pricer_draft`) OR remove if DB-only — document behavior
- [ ] Remove dead `STORAGE_KEY` project list if fully on Postgres
- [ ] Migration note in README if old browsers had local-only projects

### Type safety

- [ ] Replace `any` in `CRMView`, `KanbanBoard`, `ClientBoard`, `actions.ts` mappers
- [ ] Type `project.config` as `CalculatorInput` (Prisma `Json` + Zod parse on read/write)

### API `/api/calculate`

- [ ] Decide: internal-only (auth or remove route) vs public estimator
- [ ] If kept: Zod schema for body; return 400 with field errors
- [ ] If removed: ensure calculator uses `calculate()` import only

### Email marketing

- [ ] Confirm-send modal before bulk send (recipient count)
- [ ] Filter recipients by `Client.status` (e.g. exclude `declined`)
- [ ] “Send test to me” before campaign
- [ ] Log per-campaign failures; don’t assume all-or-nothing Resend success
- [ ] Future: opt-in flag on `Client` for marketing (schema + UI)

### Activity log UI

- [ ] Full activity feed page (not only dashboard recent 10)
- [ ] Filter by client / project / type
- [ ] Link from `ClientProfile` to filtered log

---

## P3 — Polish & roadmap

### README / product roadmap (honest backlog)

- [ ] SEO pricing module (monthly retainer) — not started
- [ ] Client-facing **estimator** (anonymous quote) vs current **document** magic links — clarify product
- [ ] Vector/branded PDF export (vs html2canvas raster)
- [ ] Invoice PDF consistency with quote/proposal branding

### DX & CI

- [x] `npm run typecheck` (`tsc --noEmit`) — #170
- [x] GitHub Actions (or monorepo CI): lint + test + build — #170
- [ ] Document one-off `scripts/*.ts` — when safe to run, idempotent or not

### Proxy / admin routes (Next.js 16)

- [ ] Confirm `src/proxy.ts` matcher covers all admin paths needed
- [ ] Optional: protect `/api/calculate` in proxy if route stays

### Scripts cleanup

- [ ] List `scripts/migrate-crm.ts`, `fix-*.ts`, `check-projects.ts` in README with purpose
- [ ] Archive or delete scripts that are one-time and already run in prod

---

## Session handoff notes

_Use this section when stopping mid-work._

### Current focus

P1 remaining: `projectType` pricing; Prisma enums/FK/onDelete

### Blocked on

None

### Completed this session

- #167 README rewrite
- #169 API defaults + hosting MRR UI
- #170 CI + edge tests + typecheck script
- #173 security & public links docs
- #175 Prisma baseline migration

### Next session should start with

1. Prisma enums + `EmailCampaign` FK + `onDelete` cascade (schema migration)
2. Email marketing: confirm-send modal + filter declined clients
3. Split `actions.ts` into domain modules

---

## Reference — findings snapshot

Quick context if this file is opened without chat history.

| Area | Finding |
|------|---------|
| Auth | `getSession()` exists but is **not** used in server actions |
| Defaults | Hardcoded `JWT_SECRET` and `CRM_PASSWORD` fallbacks |
| Public URLs | `/p/[id]` — short IDs, no token; signing is open to link holders |
| Calculator | `projectType` unused in math; `currency` display-only; hosting not in `roundedPrice` |
| README | Describes old tiered hours and `medium` complexity; app is full CRM |
| Tests | None for `calculate()` |
| Prisma | No migrations in repo; string statuses; weak relations on campaigns |
| Files | `actions.ts` ~487 lines; `Calculator.tsx` ~636 lines |
| Storage | `storage.ts` localStorage legacy alongside Postgres |

### Key files

| Path | Purpose |
|------|---------|
| `src/lib/auth.ts` | JWT session |
| `src/proxy.ts` | Admin route guard (Next 16) |
| `src/app/actions.ts` | All server mutations |
| `src/lib/calculator.ts` | Pricing engine |
| `src/app/p/[id]/page.tsx` | Public proposal/contract/invoice |
| `prisma/schema.prisma` | Data model |
| `README.md` | Onboarding (needs update) |

---

## Changelog (this doc)

| Date | Change |
|------|--------|
| 2026-05-24 | Initial improvement plan from codebase audit |
| 2026-05-24 | Progress sync: #151–#163 merged (P0 auth, secrets, integrity, UUID IDs, Vitest) |
| 2026-05-24 | #167–#177: README, API/MRR, CI, docs, Prisma baseline migration |
