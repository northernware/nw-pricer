# 🧾 NW Pricer — Northernware Pricing Calculator

Internal tool for generating project quotes and estimates.  
Input project scope → output price, hours, and suggested range.

> **This is an internal tool.** Not for client distribution.

---

## Setup

This repo lives inside the main Northernware project as a nested repo.  
The `tools/` directory is git-ignored by northernware — this has its own remote.

### 1. Clone into your local northernware repo

```bash
cd d:\Codes\northernware
mkdir tools
cd tools
git clone https://github.com/northernware/nw-pricer.git
```

Your structure should look like:

```
northernware/
├── src/                  ← main website
├── tools/                ← git-ignored by northernware
│   └── nw-pricer/        ← this repo (separate git)
│       ├── src/
│       └── ...
└── ...
```

### 2. Install & run

```bash
cd nw-pricer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How It Works

### Calculation Flow

```
Pages → Hours    (≤5 = 10h, ≤10 = 20h, >10 = 30h)
Design → Hours   (basic = 5h, custom = 10h, high_end = 15h)
Features → Hours (contact_form +2h, cms_blog +6h, auth +10h, etc.)

baseHours     = pagesHours + designHours + featureHours
adjustedHours = baseHours × complexityMultiplier (1.0 / 1.3 / 1.6)
baseCost      = adjustedHours × hourlyRate
finalPrice    = baseCost × (1 + buffer%)
roundedPrice  = round(finalPrice, nearest 1k or 5k)
priceRange    = [roundedPrice × 0.9, roundedPrice × 1.1]
```

### Defaults

| Setting      | Default  |
|-------------|----------|
| Hourly Rate | ₱700     |
| Buffer      | 30%      |
| Rounding    | Nearest ₱1,000 |
| Complexity  | Medium (×1.3) |

---

## API

### `POST /api/calculate`

**Request:**

```json
{
  "projectType": "business_website",
  "pages": 8,
  "designLevel": "custom",
  "complexity": "medium",
  "features": ["contact_form", "cms_blog", "authentication"],
  "hourlyRate": 700,
  "bufferPercent": 30
}
```

**Response:**

```json
{
  "baseHours": 48,
  "adjustedHours": 62.4,
  "baseCost": 43680,
  "finalPrice": 56784,
  "roundedPrice": 57000,
  "priceRange": [51000, 63000],
  "pagesHours": 20,
  "designHours": 10,
  "featureHours": 18,
  "complexityMultiplier": 1.3
}
```

---

## File Structure

```
src/
├── app/
│   ├── api/calculate/route.ts   ← POST endpoint
│   ├── globals.css              ← NW design system
│   ├── layout.tsx               ← Root layout (NW fonts)
│   └── page.tsx                 ← Entry point
├── components/
│   ├── Calculator.tsx           ← State orchestrator
│   ├── InputPanel.tsx           ← All form controls
│   ├── OutputPanel.tsx          ← Results + breakdown
│   ├── Header.tsx               ← Toolbar
│   └── Footer.tsx               ← Footer
└── lib/
    ├── calculator.ts            ← Core pricing engine
    └── constants.ts             ← Labels & defaults
```

---

## Tech Stack

- **Next.js 16** (App Router + Turbopack)
- **Tailwind CSS v4**
- **TypeScript**
- Same design tokens as [northernware.ph](https://northernware.ph)

---

## Future

- [ ] Export quote as PDF
- [ ] Save/load project templates
- [ ] SEO pricing module (monthly retainer)
- [ ] Client-facing estimator mode
- [ ] Dark mode toggle
