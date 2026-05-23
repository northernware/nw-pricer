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

## Accepted risks (internal tool)

- Link leakage = document exposure (mitigate by not sharing in public channels)
- No expiry on links
- No separate read-only vs sign URLs

## Future options (not implemented)

1. **Signed URLs** — `?token=` HMAC(id, exp, secret); verify in `p/[id]/page.tsx`
2. **Expiring links** — `Project.linkExpiresAt` + reject expired
3. **View vs sign** — `?sign=token` required for `SignatureBlock`; view link omits token
4. **Rate limiting** — middleware or action-level throttle on `approveProjectAction`

**Recommendation:** Implement (1) + (2) before exposing highly sensitive contracts; keep current model for trusted client workflows.
