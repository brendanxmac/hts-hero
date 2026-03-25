# Classification manual QA checklist

Run in staging or local with real Supabase. Watch Network for `/api/classification/*` and UI toasts.

## Actors

- **Anon** — no session; anonymous cookie from `/classifications/new`
- **Solo** — logged in, no `team_id`
- **TeamUser** — `role: user`, on a team
- **TeamAdmin** — `role: admin`, same team as teammate
- **SuperAdmin** — `role: superAdmin` (if used)

## Scenarios

- [ ] **Anon**: create, edit, refresh, reopen same ID; optional: hit anonymous classification cap
- [ ] **Anon → Solo**: log in (same or other tab); confirm classification links and edits save without errors
- [ ] **Solo**: list, open, edit, delete **draft** only; non-draft delete returns 403
- [ ] **Solo → team**: join team; old rows (null `team_id` on row) still list; **TeamAdmin** can edit teammate’s legacy row (same team); new rows use team `team_id`
- [ ] **TeamUser**: open another member’s work — read-only, no update calls
- [ ] **TeamAdmin**: edit team row with `team_id` set; enable/disable share
- [ ] **TeamAdmin → TeamUser** (demotion): UI read-only; updates 403
- [ ] **SuperAdmin** (if applicable): edit/save another user’s classification succeeds (API aligned with UI)
- [ ] **Shared link** `/c/[shareToken]`: logged out and logged in — read-only, no `classification/update` from share page
- [ ] **401**: on `/classifications` anonymous flows, no forced redirect to login ([`libs/api.ts`](../libs/api.ts))

## Classification count (free tier)

- [ ] **Solo** (logged in, no `team_id`): free-tier gating uses a count of `classifications` rows for that `user_id` (see `canCreateClassification`)
- [ ] **TeamUser / TeamAdmin**: can create new classifications without hitting the solo free limit (`isOnTeam` in `canCreateClassification`)
- [ ] **Anon**: create does not increment (no RPC; count is for authenticated trial gating)
- [ ] Marking complete / saving edits does not increment the count (only create does)
