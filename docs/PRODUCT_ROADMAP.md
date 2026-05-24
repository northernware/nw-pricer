# Product roadmap — NW Pricer

Honest distinction between what the app does today and what is planned.

## Two public-facing modes (planned vs today)

| Mode | Audience | Auth | Purpose | Status |
|------|----------|------|---------|--------|
| **Document link** | Existing client with URL | None (link = access) | View proposal/contract/invoice; sign contract; pay invoice | **Shipped** — `/p/[id]?mode=…` |
| **Public estimator** | Anonymous visitor | None | Self-serve ballpark quote; optional email capture; no CRM project until staff converts | **Not started** |

Today, `/api/calculate` is **admin-only** (session cookie). A public estimator would need a separate route (e.g. `POST /api/estimate`) with stricter validation, rate limits, and no access to saved projects.

**Recommendation:** Keep document links for signed engagements. Add estimator only if you want inbound lead gen without creating draft projects for every visitor.

## SEO pricing module

| Item | Status |
|------|--------|
| Monthly SEO retainer plans in calculator (Essential / Growth / Premium) | **Shipped** — `seoPlan` on project config, MRR separate from one-time dev fee |
| SEO scope in proposal PDF / live preview | **Shipped** — when `seoPlan` is set |
| Dedicated SEO-only project type or content calendar tooling | Backlog |

## PDF & branding

| Item | Status |
|------|--------|
| Raster PDF via html2canvas + jsPDF | Fallback when vector export fails |
| Vector / print-perfect branded PDF | **Shipped** (`@react-pdf/renderer` in admin export) |
| Invoice PDF matching quote/proposal letterhead | Backlog — align `QuoteTemplate` and invoice layout tokens |

## Public link hardening

See [PUBLIC_LINKS.md](./PUBLIC_LINKS.md) for signed URLs, expiry, view vs sign, and rate limits on `approveProjectAction`.
