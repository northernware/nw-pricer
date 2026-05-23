# NW Pricer — Northernware Internal CRM & Pricing Tool

Internal tool for **project pricing**, **proposals/contracts**, **client CRM**, and **client-facing document links**.

> **Internal only.** Admin UI requires login. Public `/p/[id]` links share documents with clients who have the URL.

---

## Features

| Area | Description |
|------|-------------|
| **Calculator** | Hours-based pricing with buffer, discount, rounding |
| **Documents** | Auto-generated proposal, contract, quote, invoice |
| **CRM** | Clients, projects, Kanban pipelines, activity log |
| **Public links** | `/p/[id]` for client view/sign (UUID project IDs) |
| **Email** | Templates and bulk campaigns (Resend) |
| **Payments** | PayMongo checkout links on invoices |
| **PDF** | Export from calculator preview |

---

## Setup

This repo lives under the main Northernware monorepo path but is a **separate git repository** (`tools/` is git-ignored by northernware).

### 1. Clone

```bash
cd d:\Codes\northernware
mkdir -p tools
cd tools
git clone https://github.com/northernware/nw-pricer.git
cd nw-pricer
```

### 2. Environment

```bash
cp .env.example .env
```

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | PostgreSQL for Prisma |
| `JWT_SECRET` | Production | Session signing; dev fallback if unset |
| `CRM_PASSWORD` | Production | Admin login password |
| `RESEND_API_KEY` | Optional | Email sending |
| `PAYMONGO_SECRET_KEY` | Optional | Payment links on public invoices |

### 3. Database

```bash
npm install
npx prisma generate
npx prisma migrate deploy   # production / fresh DB
# npx prisma migrate dev    # local development (creates DB + applies migrations)
```

### 4. Run

```bash
npm run dev
```

**Draft autosave:** The calculator stores an in-progress config in browser `localStorage` (`nw_pricer_draft`) for crash recovery. Saved projects live in PostgreSQL via the admin UI.

- App: [http://localhost:3000](http://localhost:3000) (redirects to `/admin`)
- Login: [http://localhost:3000/login](http://localhost:3000/login)

### Scripts

```bash
npm run dev      # development
npm run build    # prisma generate + next build
npm run test     # Vitest (pricing calculator)
npm run lint     # ESLint
```

---

## Pricing engine

Logic lives in `src/lib/calculator.ts`.

```
pagesHours    = 10 + (pages × 6)
designHours   = basic 12 | custom 18 | high_end 24
featureHours  = sum of selected features
baseHours     = pagesHours + designHours + featureHours
adjustedHours = baseHours × projectType × complexity
projectType   = business_website ×1.0 | ecommerce ×1.2 | redesign ×0.85 | custom_system ×1.35
complexity    = simple ×1.0 | complex ×1.5
baseCost      = adjustedHours × hourlyRate
finalPrice    = baseCost × (1 + buffer%) − discount%
roundedPrice  = round(finalPrice) — nearest 1k, 5k, or exact
priceRange    = [rounded × 0.9, rounded × 1.1] (same rounding mode)
```

**Not included in `roundedPrice`:** managed hosting (shown separately as **monthly recurring**).  
**Display-only today:** `currency` (set hourly rate appropriately per currency).  
**Project type** affects hours via multipliers (see formulas above).

Defaults are in `src/lib/constants.ts` (`DEFAULTS`).

---

## API

### `POST /api/calculate`

Internal JSON API — requires admin session cookie (`nw_session`). Unauthenticated requests receive `401`.

**Request** (minimal):

```json
{
  "projectType": "business_website",
  "pages": 8,
  "designLevel": "custom",
  "complexity": "simple",
  "features": ["contact_form"],
  "hourlyRate": 600,
  "bufferPercent": 10,
  "currency": "PHP"
}
```

**Response:** `CalculatorOutput` (hours breakdown, costs, `hostingPrice`, etc.)

`pages` is clamped to 1–100 on the server.

---

## Architecture

```
src/
├── app/
│   ├── actions/            # Server actions (clients, projects, email, …)
│   ├── admin/              # CRM dashboard, calculator, activity, clients
│   ├── api/calculate/      # Pricing API
│   ├── login/              # Password login
│   └── p/[id]/             # Public proposal/contract/invoice links
├── components/             # Calculator, CRM boards, document templates
├── lib/
│   ├── calculator.ts       # Pricing engine
│   ├── auth.ts             # JWT session
│   └── prisma.ts           # DB client
├── proxy.ts                # Admin route guard (Next.js 16)
prisma/schema.prisma        # Client, Project, ActivityLog, Email*
```

**Auth:** `proxy.ts` protects `/admin/*` and `POST /api/calculate`. Server actions use `requireAdminSession()` except `approveProjectAction` and `createPaymongoLinkAction` (client flows on `/p/[id]`).

---

## Maintenance scripts (`scripts/`)

One-off Node scripts — run manually with `npx tsx scripts/<name>.ts` after setting `DATABASE_URL` in `.env`. **Not** part of `npm run dev` or CI.

| Script | Purpose | Safe to re-run? |
|--------|---------|-----------------|
| `migrate-crm.ts` | Backfill `clientId` on legacy projects | Skips already-migrated rows |
| `check-projects.ts` | Print project ↔ client names (read-only) | Yes |
| `fix-names.ts` | Repair client name fields from project config | Idempotent with care |
| `fix-client-data.ts` | Data cleanup for client records | Review before prod |
| `fix-companies.ts` | Normalize company fields | Review before prod |
| `update-bga.ts` | One-off project/config update | **Do not** re-run unless intended |

---

## Production checklist

- [ ] Set `JWT_SECRET`, `CRM_PASSWORD`, `DATABASE_URL` (no dev fallbacks in production)
- [ ] Optional: `RESEND_API_KEY`, `PAYMONGO_SECRET_KEY`
- [ ] **Back up the database**, then run `npx prisma migrate deploy` before deploy
- [ ] Use HTTPS so session cookies are `secure`

---

## Roadmap

### Done

- [x] PDF export (html2canvas + jsPDF)
- [x] Save/load projects (Postgres)
- [x] Proposal & contract generation
- [x] CRM (clients, Kanban, activity log)
- [x] Email templates & campaigns
- [x] Dark mode toggle
- [x] Public magic links & digital signing
- [x] PayMongo payment links

### Planned

- [ ] SEO pricing module (monthly retainer)
- [ ] Anonymous public **estimator** (vs current document-only links)
- [ ] Signed/expiring public URLs
- [ ] Prisma enums & checked-in migrations
Track detailed tasks in [IMPROVEMENTS.md](./IMPROVEMENTS.md).

---

## Tech stack

- **Next.js 16** (App Router, `proxy.ts` for routing guard)
- **React 19**, **TypeScript**, **Tailwind CSS v4**
- **Prisma 7** + PostgreSQL
- **Vitest** for calculator tests
- Design tokens aligned with [northernware.ph](https://northernware.ph)
