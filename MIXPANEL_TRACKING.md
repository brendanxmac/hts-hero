# Mixpanel tracking plan

What each business event means, how to build the "pulse check" dashboard from it, and what changed
in the audit of 2026-10-23. Events are defined in `libs/mixpanel.ts` (browser) and sent from the
server by `libs/mixpanel-server.ts`.

The rule for every event: its name must be proven by its trigger. "Viewed" means it was on screen,
"Selected"/"Changed" means the user did it, and anything the app does on its own (a page load, a
reload, a sync, an automatic pick) either isn't tracked or says so in a `trigger` property.

## Identity

- A logged-out visitor keeps one anonymous id across page loads. (Until this audit, every logged-out
  page load reset it, which inflated unique visitors and lost pre-sign-up history.)
- On the first page load after sign-in or sign-up, `identify(user.id)` links that browser's
  anonymous history to the account. Check that the project uses **Simplified ID Merge**
  (Project settings → Identity merge).
- `mixpanel.reset()` runs only on an explicit sign-out.
- Super properties on every event:
  - `is_anonymous` for everyone.
  - `tracker_plan` (`trial` | `free` | `paid`) and `is_paying` for signed-in Tracker users.
- Server events (`Sign Up`, `Purchase Completed`, `Subscription Ended`) use the Supabase user id
  and an `$insert_id`, so a retried webhook counts once.

## Pulse dashboard (Insights reports, daily unless noted)

| Card | Event | Measure | Filter / breakdown |
|---|---|---|---|
| New sign-ups | `Sign Up` | Total | — |
| Active people | `$mp_web_page_view` | Unique users | breakdown `is_anonymous` |
| Duty calculator users | `Duty Calculator Results Viewed` | Unique users | `trigger` ≠ `restore`; breakdown `surface` |
| Duty results shown | `Duty Calculator Results Viewed` | Total | same |
| /hts page views | `HTS Code Page Viewed` | Total and Unique users | top codes: breakdown `hts_code`; or `chapter` |
| Classifications attempted | `Classification Started` | Total | breakdown `is_anonymous`, `entry_mode` |
| Classifications completed | `Classification Completed` | Total | — (once per `classification_id`) |
| Attempts blocked by limits | `Classification Blocked` | Total | breakdown `block_reason` |
| Imports added to the Tracker | `Duty Guard Products Added` | **Sum of `added`** | `source` ≠ `savings` |
| People adding imports | `Duty Guard Products Added` | Unique users | `added` > 0 |
| Trials started | `Duty Guard Trial Started` | Total | — |
| Paid checkouts / revenue | `Purchase Completed` | Total; Sum of `amount_usd` | `is_tracker_plan` = true; breakdown `plan` |
| Churn | `Subscription Ended` | Total | breakdown `reason` |
| Savings and audit checks | `Duty Guard Check Spent`, `Duty Guard Entry Audited` | Total | breakdown `kind` |
| AI client usage (MCP) | `MCP Tool Called` | Total | breakdown `client`, `tool` |
| Upgrade intent | `Locked Feature Viewed` → `Locked Feature CTA Clicked` | Funnel | breakdown `feature` |

Funnel report, 30-day window: `$mp_web_page_view` → `Duty Calculator Results Viewed` (trigger ≠
restore) → `Sign Up` → `Duty Guard Products Added` (added > 0) → `Duty Guard Trial Started`
→ `Purchase Completed`.

Retention report: `Sign Up` → coming back to any of `Duty Calculator Results Viewed`,
`Duty Guard Product Opened` or `Classification Started`.

## Key events

### Duty calculator

`useTariffFinder` runs on the calculator pages, in the Tracker's Calculator tab and in a
classification's Duty tab. Every event it sends carries `surface`:

- `calculator`
- `tracker`
- `classification`

The quick estimate on `/hts/[code]` and in the explorer sends `surface` as `hts_code_page`,
`explorer` or `classification`.

- **Duty Calculator Results Viewed**: once per code and country actually shown.
  - `trigger` says how the result came about:
    - `user`: the user picked the code or country.
    - `link`: a link opened the calculator on it.
    - `opened`: the host opened it, e.g. a classification's Duty tab.
  - It is not sent for a reload or back/forward. A link opened in a background tab counts when
    the tab is shown.
  - The `/hts` quick estimate counts only a country the user picked, not the default estimate
    from the server.
- **Duty Calculator HTS Code Selected**: only codes the user picked. Use `source` for how
  (`hts_selector`, `example`, `recent_lookup`, `explorer_modal`). A link's code is counted by
  **Deep Link Opened** instead.
- **Duty Calculator Page Loaded**: once per visit to `/duty-calculator` or a country page (`path`),
  not when the calculator is a tab.
- **View Changed**, **Country Changed**, **Compare Countries Changed**: user changes only.
  Compare's automatic starting countries and a link's `?view=` aren't counted.

### HTS pages and explorer

- **HTS Code Page Viewed**: each `/hts/[code]` page shown (`hts_code`, `chapter`, `digit_count`).
- **HTS Code Watch Submitted**: "Watch this code" submitted on an `/hts/[code]` page (`hts_code`, `country_code`, `signed_in`, `digest`: also subscribed to the weekly news). Signed out, the import is saved on the device and the Tracker sends them to sign up, then back to it.
- **Tariff Program Code Checked**: a code checked in the "Is your HTS code on the list?" box on `/tariffs` and `/tariffs/[slug]` (`program`: the page's slug or `all`, `hts_code`, `digit_count`, `listed_here`, `listed_programs`). Its "Calculate Total Duty" link arrives as **Duty Calculator Deep Link Opened** with `link_source` `tariff_program_page`.
- Page views are tracked on client-side navigation too (`track_pageview: "url-with-path"`), so
  moving between `/hts` pages with links counts.
- **Explorer Navigated to Level**: user moves only. Opening the explorer on the calculator's code
  isn't one.
- **Explorer Completed a Code Search**: once per query, after the schedule has loaded.

### Classifications

- **Classification Started**: one per classification created, signed in or not.
  - Always has `classification_id`, `is_anonymous`, `entry_point` and `entry_mode`.
  - `entry_mode` is `product_description` or `hts_code_entry`.
- **Classification Completed**: the first time a classification reaches a final code, once per
  `classification_id`.
  - Confirm-a-code entries (`hts_code_entry`) start out complete and don't send it.
  - So measure the completion rate on `entry_mode` = `product_description`.
- **Classification Blocked**: a limit stopped the attempt.
  - `block_reason` is `anonymous_limit_reached`, `starter_limit_reached`, and so on.
- **Classification Share Opened**: the Share button. Sharing itself is **Public Share Toggled**
  and **Link Copied**.

### Duty Guard

- **Duty Guard Products Added**: the one count of imports added, from every path:
  - the Add dialog
  - the onboarding takeover
  - the calculator's Track button (`source` = `calculator`; signed in, it saves in place)
  - the HTS pages' Get Alerts box (`source` = `hts-watch`)
  - the monitor page
  - the calculator's "Track all" recent searches
  - an origin moved by a saving (`source` = `savings`, not a new import)

  Sum `added`, which excludes duplicates. Events with `added` = 0 are attempts that added nothing.
- **Duty Guard Trial Started**: once per account, when the trial began (its first real
  imports, wherever they came from).
- **Duty Guard Upgrade Opened**: `trigger` is `user` or `auto` (the trial-ending dialog the
  Tracker opens itself).
- **Locked Feature Viewed**: only once the lock box is on screen. It isn't sent when a gate mounts
  below the fold or in a hidden tab.
- **Duty Guard Catalog Synced**: only when imports made on this device before signing in went
  into the account, not on every load.
- **Duty Guard Coverage Changed**: the user picking imports for alerts, not the automatic
  fill.
- **HTS Code Watch Submitted**: the Get Alerts box on an /hts page, before the visitor goes on to
  sign-up (or straight to the import when signed in).
- **Duty Guard Arrival Panel**: the panel on an import's first visit from Get Alerts or the
  calculator's Track button. `action` is `shown`, `add_imports`, `explore` or `dismissed`; `source`
  is `watch` or `track`. Showing it also sends the "You're watching" email, once per import.
- **Duty Guard Onboarding Completed**: `imports` is how many were new to the catalog;
  `submitted` is the rows given.

### Revenue (server, Stripe webhook)

- **Purchase Completed**: per checkout.
  - Properties: `plan`, `is_tracker_plan`, `mode`, `amount_usd`, `currency`.
- **Subscription Ended**: a subscription ended for good.
  - Properties: `plans`, `is_tracker_plan`, `reason`.

## Changed in the 2026-10-23 audit (check existing reports)

- **Removed:**
  - `Anonymous Classification Started` / `Completed`. Use `Classification Started` / `Completed`
    with `is_anonymous` = true.
  - Ten enum values that never fired:
    - Analysis Viewed/Basis/Origin/Countries
    - Sorted
    - Example Used
    - Setup Step Clicked
    - Content Percentage Set
    - Results Copied
    - Explorer Finished Loading
- **Renamed:** `Classification Shared` is now `Classification Share Opened`. It only ever meant
  the button.
- **No longer counted:**
  - Calculator code picks from links and reloads.
  - Results Viewed on reloads.
  - Page Loaded in the Tracker and classification tabs.
  - Automatic view, compare and coverage changes.
  - Catalog Synced on every load.
  - Teams Steps Opened on render.
  - The duplicate Product Opened from the "In your imports" button.
  - Legacy checkout events when no checkout opened.
  - `Classify Pro Upgrade Clicked` on a blocked `/classifications/new` submit (now
    `Classification Blocked`).
- **New:**
  - `Classification Blocked`
  - `HTS Code Page Viewed`
  - `Duty Guard Trial Started`
  - `Purchase Completed`
  - `Subscription Ended`
  - The `surface` and `trigger` properties
  - The `tracker_plan` / `is_paying` super properties

Data before this date has the old behaviour. Compare trends from 2026-10-24 on.

## Changed on 2026-11-03: Duty Guard and the funnel

**Renamed:** every "Tariff Tracker X" event is now "Duty Guard X", and "Tracker Welcome X" is
"Duty Guard Welcome X". The old names keep their history and already show "Duty Guard …" display
names. After the deploy they get merged into the new ones in Lexicon (PRE_DEPLOY.md). "Tariff
Monitor Product Checked" and "Tariff Monitor Track Clicked" never fired, so they were removed.

The north star is paying Duty Guard accounts and their revenue. The leading indicators are
calculator sign-ups and trials started. The "Business Pulse" board (id 11606224) shows them in its
five cards:

| Card | Events |
|---|---|
| North Star: last 7 days vs the week before | Results Viewed (unique), Sign Up, Trial Started, Section Viewed (unique), Purchase Completed (tracker plans; count and sum of `amount_usd`) |
| Revenue & billing, weekly | Checkout Started, Purchase Completed, Subscription Renewed, Plan Changed, Checkout Abandoned, Payment Failed, Subscription Ended, Trial Ended |
| Daily top of funnel | anonymous page views, Results Viewed, HTS Code Page Viewed, Locked Feature CTA Clicked, Sign Up CTA Clicked, Sign Up Started, Sign Up |
| Duty Guard engagement per week | Section Viewed, Products Added (sum `added`), Product Opened, Entry Audit Completed, Savings Review Completed, ADCVD Check Viewed, Alerts Saved, Results Viewed with `surface` = tracker |
| Calculator to paid funnel (30 days) | Results Viewed → Sign Up → Trial Started → Checkout Started → Purchase Completed |

The funnel has only steps every buyer passes through. Sign Up CTA Clicked is optional (some people
go straight to /signup), and Products Added lands at the same moment as Trial Started.

### New events

- **Attribution**
  - On the first identify, the person's profile gets `first_landing_path`,
    `first_referring_domain`, `first_utm_*` and `first_seen_at`, set once. Server events (Sign Up,
    Purchase Completed) can then be broken down by source.
  - `Sign Up` has `method` (the auth provider: google, email).
  - The profile also gets `tracker_plan`, `is_paying` and `paid_plan`.
- **Trial Started** and **Trial Ended** are sent by the server, from the daily lifecycle cron
  (`libs/tariff-tracker/trialEvents.ts`).
  - Each is dated to when it happened, with an `$insert_id`, so they arrive by the next morning.
  - Properties: `trial_days`; on Trial Ended, `converted` and `paid_plan`.
  - The browser no longer sends Trial Started. It used to miss anyone who wasn't in Duty Guard
    within an hour of their first imports.
- **Stripe webhook**
  - **Plan Changed**: `plan`, `from_plan`, `billing`, `amount_usd`, `from_amount_usd`.
  - **Subscription Renewed**: `amount_usd`.
  - **Payment Failed**.
  - **Checkout Abandoned**: the checkout session expired.
- **Duty Guard**
  - **Duty Guard Section Viewed** is sent for each section and view shown. Properties:
    `section`, `view`, and `trigger` (`load` or `user`). Switching sections only changes `?tab=`,
    so the automatic page view never saw it.
  - **Entry Audit Started**: `resuming`, `from`, `audits_left`.
  - **Entry Audit Completed**: `verdict`, `difference_usd`, `rate_paid_pct`, `rate_owed_pct`,
    `adcvd_cases`, `adcvd_covered`, `edited`.
  - **Entry Audit Closed**: `step` (where they stopped, or `results`) and `finished`.
  - **Savings Review Opened** and **Savings Review Completed**. These count reviews on every plan;
    Check Spent only counts free checks.
  - **Upgrade Dismissed**: the plans dialog closed without checkout.
  - **Checkout Started** now also has `max_pairs`, `price_usd` (the tier's monthly list price),
    `recommended` and `plan_kind`.
  - **Billing Portal Opened**.
- **Upgrade dialogs**
  - **Upgrade Opened** now only means the plans dialog is on screen. Its `trigger` is `user`,
    `link` (a `?upgrade=` email link) or `trial_dialog`.
  - **Limit Dialog Shown** replaces Upgrade Opened with `feature` = limit.
  - **Trial Dialog Shown** and **Trial Dialog Dismissed** replace Upgrade Opened with
    `trigger` = auto.
- **Calculator**
  - **Duty Calculator Tab Opened**: `tab` (duty, history, adcvd, news, compare), `from_tab`,
    `source`. Before, only Compare was counted.
  - **Conversion Dialog Dismissed**.
  - The dialog's sign-up buttons now send **Sign Up CTA Clicked** with `section` =
    conversion_dialog and `entry` = calculator_&lt;feature&gt;.
  - **ADCVD Check Viewed**: `cases`, `petitions`; once per code and country, signed in.
  - **ADCVD Case Answered**: `answer`.
- **Signed Out**.

### Still not tracked (lower value, or needs a decision)

- **Plan cards** on /tariff-alerts, /duty-audit and the home pricing overview are plain links. The
  plan picked is lost until sign-up.
- **Country page Duty Guard CTA** isn't an EntryCta, so it has no `entry`.
- **Links into the calculator** from /hts pages and the explorer arrive as `arrival: internal`, and
  their placement isn't known.
- **"Track this import"** (History, News, Compare) doesn't say which tab it was clicked in.
- **Locked "why" lines and premium teasers** in the calculator don't send Locked Feature Viewed.
- **Home cards, Insights drill-downs, Tariff News preferences, Expert Help "Book a call", and the
  Sourcing charts and CSV** send nothing.
- **Sign-up failures** and "email sent" on /signup send nothing.
- **Double counts**
  - An example click sends both Example Selected and HTS Code Selected.
  - The calculator's Track and HTS-page Watch buttons send Products Added together with Sign Up
    CTA Clicked.

## Known gaps, not fixed yet

- MCP tool calls use a hashed anonymous id and aren't linked to web accounts.
- Imports added from the signed-out calculator or the monitor page are counted before sign-up,
  even if the visitor never finishes signing up.
- The Tracker's trial dialog can open behind the import takeover or tour.
- `Onboarding Shown` can fire while the feature tour covers the takeover on a first visit.
- `Let's Talk` clicks send the user's email and name as event properties.
