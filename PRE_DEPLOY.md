# Deploying the PLG / Tariff Tracker release

The release on `release/2026-10-10` (194 commits since `master`, Oct 8 to Oct 20, plus the uncommitted import onboarding from Oct 20): the free Tariff
Calculator rework, the Tariff Tracker with alerts, impact checks, Insights, rate history and
Tariff News, AD/CVD flags, the tariff sources and updates pipeline, the email outbox and lifecycle
emails, the 14-day reverse trial, launch pricing, the Content Studio, and a framework upgrade
(Next 14 → 16, React 18 → 19, Tailwind 3 → 4, ESLint 9, TypeScript 6). Work through the steps in
order; tick items as they land, and add new ones as they come up.

## 1. Before merging

- [x] **Deploy day: Wed, Oct 21, 2026.** `freshStartOn` and `tracker_onboarding.sql`'s backfill are
      both `2026-10-21`. If the deploy slips past today, move both to the real day.
- [x] **The "Coming Oct 2026" label** (`SAVINGS_AUDITS_LABEL`, `libs/tariff-tracker/features.ts`)
      leaves only Oct 22–31: change it now if savings and audits won't ship by Oct 31. _Done
      2026-10-22: savings and audits are live and the label is gone._
- [x] **Node 22 for this release:** `package.json` `engines.node` = `22.x`, which Vercel uses over
      the dashboard setting. `master` keeps its current Node until the merge, and the release
      branch's preview builds on 22 (Next 16 won't build on Node 18). After launch, set the
      dashboard's Node.js Version to 22.x too, so the two agree.
- [ ] **Remove the temporary dev generator** (added 2026-10-21): `DevGenerator` in
      `components/tariff-tracker/onboarding/AddSteps.tsx`, shown only to brendan@htshero.com on the
      import flow's Paste step. Harmless if it ships (email-gated), but it's meant for testing only.
- [ ] **A Vercel preview deploy of the branch first.** Push `release/2026-10-10` and open its
      preview URL: the framework upgrade is the riskiest part of the release, and a preview shows
      build or runtime breakage before `master` does. Click through the home page, a blog post (MDX
      3), /duty-calculator and the Tracker there.
- [x] **Commit everything except** `.vscode/` and every `app/zz-*` folder (`app/zz-tracker/`,
      `app/zz-adcvd/`: local previews without sign-in). They must never be committed or deployed.
- [x] **Set the trial's fresh start to the deploy day**: `REVERSE_TRIAL.freshStartOn` in
      `components/pricing-calculator/lib/pricing.ts` (now `2026-10-21`). Existing accounts get 14 days
      from it; a date before the deploy shortens their trial.
- [ ] **Confirm the launch-pricing deadline**: `LAUNCH_PRICING` (now Fri, Nov 13, 2026). Savings
      detection and auditing are live (2026-10-22) and sold as included.
- [ ] **`tracker_onboarding.sql` is the last migration** (step 2; added 2026-10-20). It adds
      `tracker_onboarding` (sign-up source, first Tracker visit, skip reason, trial start) and the
      trigger on `tracker_catalogs` that starts the 14-day trial at the first real (non-example)
      import. Its backfill finds nothing on prod: `master` keeps imports only in the browser, so no
      account has stored imports yet. An existing user's browser catalog is saved to their account the
      first time they open the new Tracker, and that starts their trial then.
- [x] **Regenerate the auth emails** (their copy changed for the trial): `npm run email:auth`.
- [x] **Run the checks**: `npm run tests`, `npx tsc --noEmit -p .`, and a production build
      (`npm run build`).
- [ ] **Test signed in, in dev** (needs a real account):
  - [ ] A new account from a generic link lands on `/` with the welcome strip; from a calculator
        CTA it stays on the calculator (no redirect to the Tracker any more).
  - [ ] First Tracker visit with no imports: the empty Home and Imports pages sell the Tracker and
        ask; nothing opens by itself (2026-10-21). Their "Add imports" opens the import takeover:
        walk each way in (recent searches, paste, Excel/CSV with odd headers), "I don't have my list
        handy", and Skip (asks why). An email's `?setup=add` link opens it straight to the ways in.
        `?onboardingPreview=1` opens it in development on any account, signed out too.
  - [ ] Before any imports the sidebar shows "Free Trial · 14 days, starts when you add your
        imports"; after the first real ones, "14 days left", alerts cover up to 200 imports,
        Insights opens. The example list doesn't start it.
  - [ ] The trial's last 3 days: banner, countdown in amber, the "Here's what you'll lose" dialog
        once a day. Set the account's `tracker_onboarding.trial_started_at` back 12 days in dev to see it.
  - [ ] After the trial (`trial_started_at` 15+ days back, or `?trialPreview=ended`): free plan, no alerts
        on any import (Tariff News alerts still on), "Insights Was Part of Your Free Trial", the ended
        banner and dialog, "Get it all back" opens the plans.
  - [ ] Checkout of a Tracker plan in the Stripe sandbox, then the plan card and coverage.
  - [ ] The AD/CVD tab on a flagged import (e.g. 7317.00.55.02 from Vietnam) and on a clean one.
  - [ ] The product page: Overview, Duty, AD/CVD, Compare, History, News.

## 2. Production database (Supabase, prod project)

- [x] **Back up prod first** (Database → Backups, or a `pg_dump`). `tariff_tracker_accounts.sql`
      drops `tracker_trials`, which can't be undone.

Paste each migration into the SQL editor, in this order (foreign keys):

- [x] `tariff_sources.sql` (tariff_source_items, tariff_source_runs)
- [x] `tariff_updates.sql`
- [x] `tariff_update_scopes.sql`
- [x] `tariff_update_impacts.sql`
- [x] `email_outbox.sql` (email_batches, email_messages)
- [x] `email_subscribers.sql`
- [x] `lifecycle_emails.sql`
- [x] `tariff_impact_alerts.sql`
- [x] `tariff_tracker_accounts.sql` (tracker_catalogs, tracker_checks, tracker_entries,
      tracker_opportunities, tracker_opportunity_events, tracker_alert_settings; drops tracker_trials)
- [x] `tariff_alert_preferences.sql`
- [x] `slack_app.sql` (the Slack channel and workspace "Add to Slack" connected)
- [x] `tracker_snapshots.sql`
- [x] `adcvd.sql` (AD/CVD cases, events, months, settings, ai_usage)
- [x] `audit_requests.sql`
- [x] `social_ideas.sql`, then `social_ideas_sources.sql`
- [x] `tracker_onboarding.sql` last (needs `tracker_catalogs`): the trial-start trigger and its
      backfill, dated to match `freshStartOn` (see step 1).

- [ ] `adcvd.sql` again for its **2026-10-23** section (fr_* / ita_* / hts_sources: scope codes from
      ITA's case pages), in dev and prod, **before** deploying the code that writes them: without
      it the scope reader's writes fail. Then `npm run adcvd:golden -- --strict` in dev.
- [ ] After that migration and before the AD/CVD copy below: `adcvd:copy-to-prod` only adds and
      updates cases, so the 8 typo cases removed in dev (2026-10-23) stay in prod. Run
      `npm run adcvd:phantoms` against prod (prod keys in `.env.local`), check the list, then
      `-- --apply`. Then copy, so prod gets dev's ITA codes, merged codes and corrected statuses.

**Dev database too:** re-run `tariff_update_scopes.sql` there (it gained
`scope_conditional_exclusions` on Oct 20; every line is `IF NOT EXISTS`), or `adcvd:copy-to-prod`
and the scope reader fail on the missing column.

## 3. Copy the processed data to prod

- [x] Add `PROD_SUPABASE_URL` and `PROD_SUPABASE_SERVICE_ROLE_KEY` to `.env.local`.
- [x] `npm run adcvd:copy-to-prod` (dry run: counts per table), then
      `npm run adcvd:copy-to-prod -- --apply --skip-usage` (done 2026-10-21: 221 updates, 3,133 items, 976 cases, 3,683 events; dev's AI spend left behind). Then remove the `PROD_` lines from `.env.local`. It copies the tariff sources, tariff updates and
      AD/CVD data; nothing is re-processed or paid for twice.
- [x] **Once only, before deploying.** After launch prod is the source of truth for tariff actions:
      never run the copy again. It would overwrite prod's reviews, approvals and AI budget with dev's.
      More history goes in through the Backfill button instead (step 6).
- [ ] **Sourcing tab: upload the country-to-country files to prod's Storage** (added 2026-10-24).
      The tab's "Where Its Exports Go" panel, "What Other Sources Say" table and supply mismatch
      evidence read `sourcing/bilateral/<hs6>.json` from Supabase Storage (a public bucket the script
      creates). Build them once (`scripts/sourcing/build_bilateral.py`, from the Atlas's CC0
      country-to-country CSV), then point `.env.local` at prod for one run of
      `npm run sourcing:upload-bilateral -- <out dir>`, and back. Without them those panels are
      simply missing; nothing breaks.

## 4. Services and settings

- [ ] **Stripe, live mode.** Create the four products ("Tariff Tracker · 10 imports" … "· 500
      imports") with a monthly price each ($12 / $29 / $89 / $149), lookup keys
      `tracker_<10|30|100|500>_monthly` and metadata `plan` = "Tariff Tracker <10|30|100|500>",
      `billing` = monthly, `version` = 2026-10-mvp. Checkout finds the price by its lookup key and
      the webhook maps any price by its metadata (`libs/tariff-tracker/prices.ts`), so no Tracker
      price env vars are needed. No Stripe trial: the 14 days are the app's own, with no card.
      **Billing portal:** a configuration named "Tariff Tracker" with metadata `app` = `tracker`,
      subscription updates on (price; upgrades `always_invoice`, downgrades at period end) listing
      the four Tracker products, and cancel at period end. Check it all with
      `npm run stripe:check-tracker` using the live key. Also confirm the live Classify prices match
      the site ($39 / $89; the sandbox has $29 / $80).
- [ ] **Resend on Pro ($20/mo: 50,000 emails, no daily limit) before deploying.** The free plan
      stops at 100 emails a day, and the outbox doesn't retry a failed send: the trial-unlocked batch,
      welcome and onboarding emails and Tariff News would be lost past the 100th. If Supabase Auth
      sends through Resend SMTP, sign-in codes share that limit too.
- [ ] **Supabase Auth, both projects:** redirect URLs allow `/api/auth/callback` with any
      `?redirect=`; paste the email templates from `supabase/email-templates/` (subjects in
      `SUBJECTS.txt`) into Authentication → Email Templates.
- [ ] **Vercel env (Production):** new in this release: `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`,
      `CENSUS_API_KEY` (Content Studio's Census check). Confirm these are set: `ANTHROPIC_API_KEY`
      (AD/CVD, tariff updates, Content Studio), `CRON_SECRET`, `BASE_URL` = the live site (email
      links), `RESEND_API_KEY`. Add `DATALAB_API_KEY` too: unused until `TARIFF_SCOPE_READER=datalab`
      switches prod's scope reader to datalab (an env change needs a redeploy to take effect).
      Leave out `HTS_REVISION_TOOL_ENABLED` (the revision checker is local-only). No new Stripe env
      vars: Tracker prices are found by lookup key; check the live webhook endpoint sends
      `checkout.session.completed`, `checkout.session.expired`, `customer.subscription.updated`,
      `customer.subscription.deleted`, `invoice.paid` and `invoice.payment_failed`.
- [ ] **Slack app (HTS Hero):** Redirect URLs include `https://htshero.com/api/slack/callback`,
      public distribution is activated, and the logo is uploaded. Vercel env has
      `SLACK_CLIENT_ID` and `SLACK_CLIENT_SECRET`. Then run Add to Slack once on the live site.
- [ ] **Supabase sign-up webhook (prod):** Database → Webhooks has one on `public.users` INSERT
      calling `https://htshero.com/api/webhook/supabase/user-created` with the `x-supabase-secret`
      header (= Vercel's `SUPABASE_WEBHOOK_SECRET`). It's what sends the welcome email; same path and
      contract as on `master`, so it should already be there. Dev can't reach localhost, so dev
      sign-ups get no welcome email.
- [ ] **Vercel plan allows 15-minute crons** (`tariff-sources`, `tariff-updates`, `adcvd`); Hobby
      only runs daily crons and rejects the deploy.

## 5. Deploy

- [ ] Merge `release/2026-10-10` into `master` and deploy.
- [ ] Every cron in `vercel.json` shows in Vercel: tariff-sources, tariff-updates, adcvd,
      social-ideas, email-outbox, tariff-news, tariff-digest, lifecycle (onboarding and trial
      emails), tracker-snapshots.
- [ ] **If prod breaks:** Vercel → Deployments → the last `master` deploy → Instant Rollback. The
      new tables don't bother the old code, but `tracker_trials` is gone, so fix forward on
      anything Tracker-related rather than rolling back for long.

## 6. After deploying

- [ ] **Smoke test prod:** the home page, /duty-calculator (a lookup signed out, the AD/CVD flag),
      /tariff-monitor, /pricing-calculator, /tariff-updates, sign up with a new account (a generic
      sign-up lands on `/`; the welcome email arrives within a minute; the Tracker's empty pages
      ask for imports and nothing opens by itself; the trial starts at the first real import), one
      Stripe checkout and refund.
- [ ] **The "everything is unlocked" email** (`trial_unlocked`): only for an existing account whose
      browser catalog syncs on `freshStartOn` itself (its trial starting that day), so expect few or
      none. If a batch appears, it's held for review in /email-outbox. It replaces the older "Meet
      the Tariff Tracker" email; don't also run `npm run email:meet-tracker`.
- [ ] **Trial emails from then on** send themselves daily: 3 days before the trial ends, its last
      day, and the day after (`libs/email/lifecycle.ts`). Each trial ends 14 days after that account's
      first real imports, so they arrive a few at a time, not as one batch.
- [ ] **Older tariff history, if you want it:** /tariff-sources → pick a date → **Backfill** (admin
      only, in prod). It collects every source back to that date (the Federal Register a month at a
      time), skips what's stored, and the 15-minute cron processes the rest on prod's AI budget.
      Safe to run again. Anything before `NEWS_ALERTS_FROM` (Oct 21) is history: no alerts, no news
      emails.
- [ ] **Watch the first days:** /adcvd (AI spend per month), /email-outbox, Vercel cron logs.

## What you manage by hand after launch

Everything else runs on its own (collectors, AD/CVD updates, snapshots, onboarding and trial
emails). These need you:

**Every day (about 15 minutes)**

- [ ] **/tariff-sources: approve impact checks.** Alerts to users about a tariff update go out only
      after you approve that update's impact check, so this is the step that keeps alerts timely.
      Updates the pipeline wasn't confident about wait there for review (`needs_review`) before
      they publish. Confident official ones publish, and their Tariff News emails send, on their own.
- [ ] **/email-outbox: a glance.** Onboarding and trial emails (daily, 12:00 UTC), Tariff News and
      impact alerts send on their own; look for failed messages (they aren't retried) and anything
      that reads wrong.
- [ ] **/content-studio: today's post.** New ideas land at 11:00 UTC. Pick one, check its numbers
      against the sources on the post (never post unverified), download, and post to LinkedIn and X
      by hand: nothing posts for you.
- [ ] **Replies and leads.** Every lifecycle email is from you and replies reach you; /tariff-audit
      audit requests arrive as an internal notice; HTS Hero Managed intro calls come through your
      Calendly.
- [ ] **Vercel cron errors.** The 15-minute jobs (tariff-sources, tariff-updates, adcvd,
      tariff-news) and the 5-minute outbox: a run of failures means alerts and news have stopped.

**Every week**

- [ ] **Monday: approve the weekly digest** in /email-outbox. The `tariff-digest` cron builds it at
      13:00 UTC and it's the one regular batch held for your review: it doesn't send until you
      approve it.
- [ ] **New HTS revisions** (several a month this year): when USITC posts one, run it through the
      revision checker and `/apply-revision` (local), and new coverage gaps through the coverage
      checker and `/apply-batch`, as before. Until a revision lands, its rate changes show as news
      only, not as confirmed duty changes.
- [ ] **Stripe:** new subscriptions, failed payments, cancellations.

**Every month**

- [ ] **/adcvd: the AI budget and spend.** Set the monthly budget in prod; when it's reached, the AI
      steps pause until next month (regex linking keeps going). The Problems tab retries itself,
      with nothing to do. If the AD/CVD updates stop running, an internal notice email tells you.
- [ ] **Anthropic spend** for the tariff-updates pipeline and the Content Studio ideas (about 5¢ a
      day).

**On a date**

- [x] **When savings and audits ship (October):** flip `SAVINGS_ENABLED` / `AUDITS_ENABLED`
      (`libs/tariff-tracker/features.ts`), then remove the "Coming Oct 2026" labels
      (search for `SAVINGS_AUDITS_LABEL`). _Done 2026-10-22: the flags and labels are removed;
      `NEXT_PUBLIC_DEMO_SAVINGS_AUDITS` is no longer read and can come out of every env._
- [ ] **Before Nov 13 (`LAUNCH_PRICING.endsAt`).** When it passes, the countdown and the struck-through
      prices disappear on their own, but **prices don't change on their own**: update `TRACKER_TIERS`
      and the Stripe prices when savings and audits ship, or move the date.
- [ ] **Once a year:** refresh the Census import data (below).

**To see the trial screens yourself:** open the Tracker signed in as brendan@htshero.com (or any
account in local dev) with `?trialPreview=trial`, `?trialPreview=ending` or `?trialPreview=ended`.
It changes only what you see (not what your alerts cover), stays on while you move around, and
`?trialPreview=off` (or the "Previewing · Stop" link on the plan card) ends it.

## The day after launch (Oct 22)

- [ ] **The post-import education series.** Today, once someone adds imports, they get one email
      (`first_look`, the morning after) and then nothing until the trial-ending email on day 11.
      Add about three more, counted from the first imports (`tracker_snapshots.first_products_at`):
      e.g. day 3 alerts and where they go (email, Slack, Teams), day 6 Insights and AD/CVD, day 9
      impact checks, rate history and exports. Skip accounts that have paid, like the trial emails.
      The trial starts only at the first real import; no email may say otherwise.

## Within two weeks: savings, audits and the price change

- [x] **Automatic entry auditing**, then switch savings and audits back on
      (`libs/tariff-tracker/features.ts`; `MVP_TRIM.md` lists every change to put back). _Switched
      on 2026-10-22._
- [ ] **New prices** for new subscribers ($19 / $49 / $149 / $249) when `LAUNCH_PRICING` ends;
      launch subscribers keep theirs. Create the new Stripe prices with the same lookup keys
      ("transfer lookup key").
- [ ] **Qualification check (guided workflow)**: works out which adjustments should apply to the
      goods, and the proof needed.
- [ ] **Refund check (bulk entry audit)**: bulk upload of entries (CSV / ACE ES-003 report).
- [ ] **Savings requirements**: each trade program's and exemption's exact requirements from its
      legal source (`components/tariff-tracker/opportunities/requirements.ts`).
- [ ] **One-time offers** (not on offer yet): finding savings on, and auditing, an importer's prior
      entries.

## Should do

- [ ] **AD/CVD in the trial emails' numbers.** The emails count imports losing alerts but not how
      many are AD/CVD-flagged (the in-app dialog does). Add the count to `tracker_snapshots`.
- [ ] **Census import data refresh.** `public/data/us-imports/` comes from
      `npm run sync-hts-imports` (needs `CENSUS_API_KEY`). It's 2025 vs 2024 today; rerun when
      Census publishes a new year and commit the files. Keep the Census notice next to the figures.
- [ ] **Track this Import email** on the calculator: if the form still shows "Coming soon" and does
      nothing, wire it to alerts or hide it.
- [ ] **`view=history` in the Tracker calculator.** The Duty Over Time teaser signs people up back
      to `view=history`; the Tracker should open on the duty history for it.

## Consider

- [ ] **Notify team members about savings opportunities**, e.g. when someone audits old imports or
      turns on adjustments.
- [ ] **Notify the customs broker** about the same opportunities.
