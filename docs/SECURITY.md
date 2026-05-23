# Security checklist

## Production environment

Required (no dev fallbacks):

- `JWT_SECRET`
- `CRM_PASSWORD`
- `DATABASE_URL`

Optional:

- `RESEND_API_KEY`
- `PAYMONGO_SECRET_KEY`

See `.env.example`.

## Admin routes

`src/proxy.ts` redirects unauthenticated users from `/admin/*` to `/login`.

## Server actions

Admin actions call `requireAdminSession()` in `src/app/actions.ts`.

**Public actions** (intentional):

- `approveProjectAction` — client signing
- `createPaymongoLinkAction` — client PayMongo checkout

### Manual verification (unauthenticated)

With the dev server running and **no** `nw_session` cookie:

1. Open an incognito window → `/admin` should redirect to `/login`.
2. Call an admin action without a session (browser devtools or script). Example: triggering save from a forged request should not persist data; gated actions return empty data or `{ success: false, error: "Unauthorized" }`.

Server Actions use POST to Next.js internal endpoints; the practical check is: logged-out admin UI cannot load projects/clients (empty) and mutations fail.

## Public links

See [PUBLIC_LINKS.md](./PUBLIC_LINKS.md).
