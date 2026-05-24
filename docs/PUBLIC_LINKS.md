# Public project links (`/p/[id]`)

## Current model (2026-05)

| Aspect | Behavior |
|--------|----------|
| **URL** | `/p/{projectId}?mode=proposal\|contract\|invoice\|quote` |
| **ID** | UUID v4 (`crypto.randomUUID`) |
| **Auth** | None — anyone with the link can view |
| **Signing** | `approveProjectAction` is public; typed name + snapshot hash stored |
| **Payments** | `createPaymongoLinkAction` is public on invoice mode |
| **Integrity** | After approval, config hash mismatch shows `ConfigTamperBanner` |

## Hardening (shipped)

When `PUBLIC_LINK_SIGNING` is enabled (default **on** in production, **off** in development unless set):

| Link type | Query params | Capability |
|-----------|--------------|------------|
| **View** | `?token=` (optional on bare URL) | Read proposal, contract, invoice |
| **Sign** | `?sign=` (required to sign in prod) | Contract `SignatureBlock` + `approveProjectAction` |

Admin **Magic Link** / **View Link** buttons call `createPublicLinksAction` (server-signed JWTs using `JWT_SECRET`). Contract tab also exposes **Sign Link**.

Bare `/p/{id}?mode=contract` URLs remain **view-only** in production — clients need the sign link to approve.

Set `PUBLIC_LINK_SIGNING=false` to restore legacy behavior (any link holder can sign).

### Rate limiting

`approveProjectAction` is throttled to **10 attempts per 15 minutes** per IP + project ID (in-memory, per server instance).

## Accepted risks (internal tool)

- Link leakage = document exposure (mitigate by not sharing in public channels)
- No expiry on links beyond JWT `exp` (default 90 days for signed admin links)
- In-memory rate limits reset on cold starts (serverless)

## Future options

1. **Expiring links** — `Project.linkExpiresAt` + reject expired bare URLs
2. **CAPTCHA** — on signing if abuse increases

**Recommendation:** Use view + sign links for contracts; keep proposal/invoice view links for trusted client workflows.
