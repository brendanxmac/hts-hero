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
| Imports added to the Tracker | `Tariff Tracker Products Added` | **Sum of `added`** | `source` ≠ `savings` |
| People adding imports | `Tariff Tracker Products Added` | Unique users | `added` > 0 |
| Trials started | `Tariff Tracker Trial Started` | Total | — |
| Paid checkouts / revenue | `Purchase Completed` | Total; Sum of `amount_usd` | `is_tracker_plan` = true; breakdown `plan` |
| Churn | `Subscription Ended` | Total | breakdown `reason` |
| Savings and audit checks | `Tariff Tracker Check Spent`, `Tariff Tracker Entry Audited` | Total | breakdown `kind` |
| AI client usage (MCP) | `MCP Tool Called` | Total | breakdown `client`, `tool` |
| Upgrade intent | `Locked Feature Viewed` → `Locked Feature CTA Clicked` | Funnel | breakdown `feature` |

Funnel report, 30-day window: `$mp_web_page_view` → `Duty Calculator Results Viewed` (trigger ≠
restore) → `Sign Up` → `Tariff Tracker Products Added` (added > 0) → `Tariff Tracker Trial Started`
→ `Purchase Completed`.

Retention report: `Sign Up` → coming back to any of `Duty Calculator Results Viewed`,
`Tariff Tracker Product Opened` or `Classification Started`.

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

### Tariff Tracker

- **Tariff Tracker Products Added**: the one count of imports added, from every path:
  - the Add dialog
  - the onboarding takeover
  - the calculator's Track button (`source` = `calculator`; signed in, it saves in place)
  - the HTS pages' Get Alerts box (`source` = `hts-watch`)
  - the monitor page
  - the calculator's "Track all" recent searches
  - an origin moved by a saving (`source` = `savings`, not a new import)

  Sum `added`, which excludes duplicates. Events with `added` = 0 are attempts that added nothing.
- **Tariff Tracker Trial Started**: once per account, when the trial began (its first real
  imports, wherever they came from).
- **Tariff Tracker Upgrade Opened**: `trigger` is `user` or `auto` (the trial-ending dialog the
  Tracker opens itself).
- **Locked Feature Viewed**: only once the lock box is on screen. It isn't sent when a gate mounts
  below the fold or in a hidden tab.
- **Tariff Tracker Catalog Synced**: only when imports made on this device before signing in went
  into the account, not on every load.
- **Tariff Tracker Coverage Changed**: the user picking imports for alerts, not the automatic
  fill.
- **HTS Code Watch Submitted**: the Get Alerts box on an /hts page, before the visitor goes on to
  sign-up (or straight to the import when signed in).
- **Tariff Tracker Arrival Panel**: the panel on an import's first visit from Get Alerts or the
  calculator's Track button. `action` is `shown`, `add_imports`, `explore` or `dismissed`; `source`
  is `watch` or `track`. Showing it also sends the "You're watching" email, once per import.
- **Tariff Tracker Onboarding Completed**: `imports` is how many were new to the catalog;
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
  - `Tariff Tracker Trial Started`
  - `Purchase Completed`
  - `Subscription Ended`
  - The `surface` and `trigger` properties
  - The `tracker_plan` / `is_paying` super properties

Data before this date has the old behaviour. Compare trends from 2026-10-24 on.

## Known gaps, not fixed yet

- MCP tool calls use a hashed anonymous id and aren't linked to web accounts.
- Imports added from the signed-out calculator or the monitor page are counted before sign-up,
  even if the visitor never finishes signing up.
- The Tracker's trial dialog can open behind the import takeover or tour. The limit dialog's
  "See plans" counts a second Upgrade Opened.
- `Onboarding Shown` can fire while the feature tour covers the takeover on a first visit.
- Locked "why" lines and premium teasers in the calculator don't send Locked Feature Viewed.
- Links from `/hts` pages to the calculator (base rates, duty by country, import sources) send no
  click event. The calculator sees them as `arrival: internal`.
- `Let's Talk` clicks send the user's email and name as event properties.
