# Archived maintenance scripts

One-off scripts kept for reference after running in production. **Do not re-run** unless you know what they do.

Run from repo root:

```bash
npx tsx scripts/archive/<name>.ts
```

| Script | Purpose |
|--------|---------|
| `fix-names.ts` | Repair client name fields from project config |
| `fix-client-data.ts` | Client record cleanup |
| `fix-companies.ts` | Normalize company fields |
| `update-bga.ts` | One-off BGA project/config update |

Active scripts live in `scripts/` (`migrate-crm.ts`, `check-projects.ts`).
