# NW Pricer - Social Media Tab Plan

Track progress here when building the **Social Media** tab for NW Pricer.  
Initial product plan created: **2026-05-27**.

**Goal**

Add a Social Media tab to the admin tool where Northernware can prepare social posts with photos and captions for Facebook, Instagram, and LinkedIn.

**How to use this doc**

- Check off items as they are completed: `- [x]`
- Add short implementation notes under a section when context matters for the next session
- Work top-to-bottom within each priority band unless a dependency forces otherwise

---

## Progress summary

| Priority | Total | Done | Remaining |
|----------|------:|-----:|----------:|
| P0 - Core posting workflow | 12 | 12 | 0 |
| P1 - Media & platform polish | 13 | 10 | 3 |
| P2 - Scheduling & publishing | 11 | 0 | 11 |
| P3 - Analytics & nice-to-haves | 8 | 0 | 8 |
| **All** | **44** | **22** | **22** |

_Update the table when checking items off._

---

## P0 - Core posting workflow

### Navigation & layout

- [x] Add a **Social Media** tab to the admin navigation
- [x] Create a dedicated Social Media page or panel under the admin area
- [x] Keep the UI consistent with existing NW Pricer admin tabs and CRM screens
- [x] Add empty, loading, and error states for the tab

### Post composer

- [x] Add a composer for creating a new social post draft
- [x] Support selecting one or more platforms: Facebook, Instagram, LinkedIn
- [x] Add a shared caption field used as the default caption across platforms
- [x] Add optional platform-specific caption overrides
- [x] Show character counts and warnings per platform
- [x] Add save-as-draft behavior
- [x] Add edit existing draft behavior
- [x] Add delete draft behavior with confirmation

### Data model

- [x] Add a `SocialPost` model/table for post drafts and publishing status
- [x] Store selected platforms, caption text, per-platform overrides, and status
- [x] Add created/updated timestamps and optional scheduled publish time
- [x] Add migration and Prisma types

---

## P1 - Media & platform polish

### Photo uploads

- [x] Allow uploading one or more photos for a social post
- [x] Show image previews in the composer
- [x] Support reordering uploaded photos
- [x] Support removing photos before publishing
- [x] Validate file type and file size
- [ ] Decide storage location: local uploads, S3/R2, or another asset store
- [ ] Store image metadata and public URLs needed for publishing

### Platform-specific previews

- [x] Add Facebook preview layout
- [x] Add Instagram preview layout
- [x] Add LinkedIn preview layout
- [x] Let users switch previews by platform
- [x] Show how caption overrides change each platform preview
- [x] Warn when a platform has missing or incompatible media

### Platform rules

- [ ] Document accepted image counts, dimensions, and formats per platform
- [ ] Add lightweight validation for platform-specific image limits
- [ ] Add recommended image size hints in the upload area
- [ ] Add warning for Instagram posts without photos
- [ ] Add warning for LinkedIn/Facebook posts with overly long captions

---

## P2 - Scheduling & publishing

### Publishing options

- [ ] Support draft-only posts first
- [ ] Add a manual "mark as posted" flow if API publishing is not ready
- [ ] Add scheduled publish date/time field
- [ ] Add statuses: draft, scheduled, publishing, posted, failed
- [ ] Show status badges in the social post list

### Social integrations

- [ ] Decide integration approach for Facebook and Instagram via Meta APIs
- [ ] Decide integration approach for LinkedIn via LinkedIn API
- [ ] Add environment variables for social API credentials
- [ ] Add OAuth/account connection flow or document manual token setup
- [ ] Store connected account/page/profile IDs safely
- [ ] Add server actions or API routes for publishing
- [ ] Log publish attempts and failures

### Post list

- [ ] Add list view for drafts, scheduled posts, posted posts, and failed posts
- [ ] Add filters by platform and status
- [ ] Add search by caption text
- [ ] Add quick actions: edit, duplicate, delete, mark as posted

---

## P3 - Analytics & nice-to-haves

### Reuse CRM/project context

- [ ] Allow creating a social post from a saved project
- [ ] Allow attaching a client or project reference to a post
- [ ] Add quick templates for launch announcement, case study, promo, and update posts
- [ ] Add caption variables for client name, project title, and public project link

### Analytics

- [ ] Add fields for manually recording engagement metrics
- [ ] Track likes, comments, shares, clicks, and impressions per platform
- [ ] Show simple performance cards in the Social Media tab
- [ ] Add optional export of social post history

### Quality-of-life

- [ ] Add duplicate post action for reposting with small edits
- [ ] Add simple content calendar view
- [ ] Add "needs review" status before publishing
- [ ] Add optional approval notes for team review

---

## Suggested first implementation slice

1. Add Social Media tab navigation and route
2. Add draft composer with platform checkboxes, shared caption, and image previews
3. Save drafts to Prisma without external API publishing
4. Add list view with draft/edit/delete
5. Add platform previews and validation warnings

This keeps the first version useful even before Facebook, Instagram, or LinkedIn API credentials are connected.

---

## Open decisions

| Topic | Decision needed |
|-------|-----------------|
| Storage | Where should uploaded photos live in production? |
| Publishing | Should v1 post directly through APIs or only prepare/export posts? |
| Accounts | Which Facebook Page, Instagram Business account, and LinkedIn Page should be connected? |
| Scheduling | Should scheduling publish automatically or simply remind/admin-list posts to publish? |
| Permissions | Should all admins be able to publish, or should posting require a stricter role later? |

---

## Session handoff notes

_Use this section when stopping mid-work._

### Current focus

P0 is implemented: the Social tab uses Prisma-backed drafts with captions, platform overrides, image previews, edit/delete, and mark-as-posted.

### Blocked on

- Production image storage decision; v1 stores image data URLs with drafts only
- Whether v1 should directly publish through social APIs or only manage drafts/manual posting
- Social account/API credential availability

### Next session should start with

1. Confirm v1 scope: draft manager vs direct publishing
2. Inspect existing admin navigation and Prisma schema
3. Implement Social Media route and draft composer

---

## Reference - initial feature shape

| Area | Desired behavior |
|------|------------------|
| Purpose | Prepare social media posts from inside NW Pricer |
| Platforms | Facebook, Instagram, LinkedIn |
| Content | Photos plus captions |
| Captions | Shared default caption with optional platform overrides |
| Media | Upload, preview, reorder, remove |
| Workflow | Draft, schedule/mark posted, later direct publish |
| Admin fit | Lives as another tab in the NW Pricer tool |

### Likely files to inspect

| Path | Purpose |
|------|---------|
| `src/app/admin/*` | Admin pages/routes |
| `src/components/*` | Existing admin UI components |
| `src/app/actions/*` | Server actions pattern |
| `prisma/schema.prisma` | Data model |
| `README.md` | Setup and env documentation |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-27 | Initial Social Media tab plan |
