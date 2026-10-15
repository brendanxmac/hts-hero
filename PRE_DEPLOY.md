# Before deploying the PLG / Tariff Tracker release

A running list of what has to be done before this release ships. Tick items off as they land;
add new ones as they come up.

## Must do

- [ ] **Qualification check (guided workflow).** The paid tier of Possible Adjustments: visitors
      see every adjustment and what it could change the total by; free accounts see a plain-English
      line on why each could apply; paying (and trial) users step through a guided workflow that
      works out exactly which adjustments SHOULD apply to their goods, and the proof they'd need.
      The calculator teases it as the third step of the strip atop Possible Adjustments ("Which
      apply to your goods"); trial and paid users see "coming soon". Build the workflow in the
      Tracker.
- [ ] **Refund check (bulk entry audit).** Entry audit v1 is built (one entry line at a time,
      each spending an audit check; the calculator's "Check my entries" opens it). Still to do: bulk
      upload of entries (CSV / ACE ES-003 report), and log in the Tracker's own calculator.
- [ ] **Savings requirements (strategy needed).** A product's Savings tab shows general steps for
      each kind of saving (`components/tariff-tracker/opportunities/requirements.ts`, TODO). Each
      trade program and exemption needs its exact requirements (rules of origin, certification,
      evidence, the SPI / Chapter 99 statement to claim) from its legal source. Agree how to build
      and review that data first.
- [ ] **Test the product page signed in** (2026-10-13): Duty (locked code/origin, saves to the
      product), Savings (check → options → compare → track → secure applies to the catalog and logs
      it; a change of origin adds the new product and marks the old one "moving"), Audit (Beta).
- [ ] **Test the usage-based trial signed in** (2026-10-13): savings checks (5), audit checks
      (10), alerts slots (10), the plans dialog when each runs out, and a paid plan's coverage.
- [ ] **Sourcing.** Compare's heading offers signed-in users "Get Advanced Comparisons" (the
      Tracker's Sourcing, trial or paid). Build it, or drop the link.
- [ ] **Apply the migration** `supabase/migrations/tariff_tracker_accounts.sql` (tracker_catalogs,
      tracker_checks, tracker_entries, tracker_opportunities, tracker_opportunity_events,
      tracker_alert_settings; drops the old tracker_trials).
- [ ] **Stripe prices.** Create the products and set
      `STRIPE_TARIFF_TRACKER_<10|30|100|500>_<MONTHLY|ANNUAL>_PRICE_ID`.
- [ ] **Alert sending job.** Alert settings are saved, but nothing sends alerts yet.
- [ ] **Apply the migration** `supabase/migrations/tariff_sources.sql` (tariff_source_items,
      tariff_source_runs) for the tariff source collectors (/tariff-sources admin view).
- [ ] **Apply the migration** `supabase/migrations/tariff_updates.sql` (tariff_updates, and the
      sorting/grouping columns on tariff_source_items), after tariff_sources.sql.
- [ ] **Apply the migration** `supabase/migrations/email_outbox.sql` (email_batches, email_messages).
- [ ] **Apply the migration** `supabase/migrations/email_subscribers.sql` (tariff news subscriptions
      and every reader's email choices).
- [ ] **Apply the migration** `supabase/migrations/lifecycle_emails.sql` (which onboarding email
      each account has been queued).
- [ ] **Apply the migration** `supabase/migrations/tracker_snapshots.sql` (each account's numbers,
      worked out on the server daily for the onboarding emails).
- [ ] **Apply the migration** `supabase/migrations/tariff_update_impacts.sql` (which of each
      account's imports each tariff update may affect: confirmed, likely, possible).
- [ ] **Apply the migration** `supabase/migrations/tariff_update_scopes.sql` (the full scope of each
      tariff action, read from its PDFs or set in review).
- [ ] **Apply the migration** `supabase/migrations/tariff_impact_alerts.sql` (the impact check
      approval on tariff_updates, and tariff_impact_alerts: which account was alerted about which
      import, so approving again sends only what's new or changed).
- [ ] **Apply the migration** `supabase/migrations/tariff_alert_preferences.sql` (which kinds of
      update alert each account; when each update's impact check was first approved), after
      tariff_impact_alerts.sql.
- [ ] **Supabase redirect URLs allow `/api/auth/callback`** with any `?redirect=` (Authentication →
      URL Configuration), in both projects: sign-in links now come back through it.
- [ ] **Queue "Meet the Tariff Tracker"** for existing accounts after the release is live:
      `npm run email:meet-tracker` against production, then review and approve it in /email-outbox.
- [ ] **Paste the Supabase Auth email templates** from `supabase/email-templates/` (subjects in
      `SUBJECTS.txt`; regenerate with `npm run email:auth`) into Authentication → Email Templates,
      in both projects.
- [ ] **`BASE_URL` is the live site in production.** Email links (confirm, manage, unsubscribe) use
      it, so a dev value would send readers to localhost.
- [ ] **Vercel plan allows the 15-minute crons** `/api/cron/tariff-sources` and
      `/api/cron/tariff-updates` (vercel.json; the second runs up to 5 minutes). Hobby only runs
      crons daily and rejects the deploy; CBP's CSMS feeds keep only ~3 weeks, so the cron has to
      keep up.
- [ ] **Full tariff sources backfill** (added 2026-10-14). Dev starts with a few months
      (`npm run tariff-sources:collect -- --since 2026-07-01`) so Brendan can look at and play with
      it first. Once he's happy, backfill to January 2025 (`--since 2025-01-01`; the CSMS archive
      PDFs and USTR monthly listings cover it) so /tariff-updates launches with the whole history.
- [ ] **Onboarding email sequence** (plan in ONBOARDING_PLAN.md, worktree
      claude/vibrant-maxwell-5fa15d, awaiting answers).

## Should do

- [ ] **Census import data refresh.** `public/data/us-imports/` (which countries ship each HTS code to
      the US, for the Compare tab) comes from `npm run sync-hts-imports`, which needs
      `CENSUS_API_KEY` in `.env.local`. It's 2025 vs 2024 today; rerun when Census publishes a new
      year (or monthly, to switch to a trailing 12 months) and commit the files. Keep the Census
      notice in the footer and next to the figures (their API terms).

- [ ] **Track this Import email** on the calculator: the form shows "Coming soon" and does
      nothing. Wire it to alerts, or hide it.
- [ ] **`view=history` in the Tracker calculator.** The Duty Over Time teaser signs people up
      back to `view=history`; the Tracker should open on the duty history for it.

## Consider

- [ ] **Notify team members about savings opportunities.** Consider adding the ability to
      notify team members about tariff saving opportunities: for example when someone audits
      old imports, or when they toggle certain adjustments on their imports.
- [ ] **Notify the customs broker.** Also, or as an additional option, let users notify their
      customs broker about the same opportunities.
