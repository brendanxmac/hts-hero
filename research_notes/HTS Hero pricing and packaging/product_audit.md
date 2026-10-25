# HTS Hero product audit: features, tiers, pricing, funnel (internal, as of 2026-10-21)

Scope: read-only audit of the repo (branch `release/2026-10-10`, HEAD 835b6f65, with many uncommitted changes from other sessions) and the user's saved memory notes. All paths are relative to `/Users/brendanmclaughlin/Projects/HTS Hero/hts-hero/` unless they start with `memory/`, which means `/Users/brendanmclaughlin/.claude/projects/-Users-brendanmclaughlin-Projects-HTS-Hero-hts-hero/memory/`. PRICING.md says it is the source of truth: "If code or copy disagrees with this file, this file wins" ([PRICING.md](PRICING.md)).

## Q1. What can an anonymous visitor, a free account, a trial account and a paid Tracker user do?

### Takeaway
The core rule is "Looking up a tariff is free. Watching, auditing and saving on your own products is paid." Anonymous visitors get the full calculator, Duty over time and Tariff News subscriptions. A free account adds the plain-English "why", legal text, sourcing/Analysis, and an unlimited catalog with rate history and export, but after the 14-day reverse trial it gets **no alerts, impact checks or AD/CVD detail on its own imports** (alertImports = 0). Paid tiers sell alerts, impact checks, AD/CVD and Insights on N tracked imports. Savings and audits are built but switched off.

### Cited Findings
**The rule and the calculator (free)**
- Rule: "Looking up a tariff is free. Watching, auditing and saving on your own products is paid." The Tariff Calculator is "100% free: unlimited lookups, no account, no sign-up wall on a duty result, and available over MCP". Duty over time is free with no account. — [PRICING.md](PRICING.md)
- Calculator includes every tariff, exemption and fee for any HTS code + country; Section 232, 301 and 122 tariffs itemized with their legal source; USMCA/CAFTA-DR preferences plus MPF and HMF; side-by-side country compare; Duty over time; MCP (anonymous calls allowed, rate limits per IP/OAuth client for abuse only). "There is no paid Tariff Calculator plan. Never describe a lookup limit." — [PRICING.md](PRICING.md)
- What a free account unlocks in the calculator (code list `ACCOUNT_BENEFITS`): the plain-English "why" behind every tariff; the legal text with the notes it cites; why other tariffs don't apply; any import's full duty on any past date, line by line; sourcing intelligence (duty from every origin as insights, globe, table, chart); AD/CVD checks free for 14 days; the Tracker free for 14 days on up to 200 imports, "then Tariff News alerts on every new US tariff action, free forever"; impact checks on tracked imports. Savings ("what you could save on 5 imports") and audits ("10 past entries checked") lines exist but are filtered out while the flags are off. — [components/duty-calculator/calculator/ConversionDialog.tsx](components/duty-calculator/calculator/ConversionDialog.tsx)
- Analysis (one product's duty from every origin) requires a free account, not a paid plan (decided 2026-10-11). Locked data isn't sent to signed-out visitors. — [PRICING.md](PRICING.md); [memory/plg-funnel-rework.md](memory/plg-funnel-rework.md)

**Access matrix (decided 2026-10-18), verbatim structure from PRICING.md**

| | Visitor | Free account | 14-day trial | Paid tiers |
|---|---|---|---|---|
| Tariff Calculator, Duty over time | Unlimited | Unlimited | Unlimited | Unlimited |
| Calculator extras (the why, Overview, News) | Teased | Yes | Yes | Yes |
| AD/CVD check (cases, rates, suppliers) | Teased: whether a case may apply | Teased | Yes | Yes |
| Sourcing intelligence (Compare: Insights, Globe, Table, Chart) | Side by side only | Yes | Yes | Yes |
| Catalog, current duty, rate history, export | n/a | Unlimited | Unlimited | Unlimited |
| Tariff News alerts (every new US tariff action) | Yes (subscribe) | Yes | Yes | Yes |
| Tracked imports (alerts, AD/CVD updates, impact checks) | n/a | None | 200 | The tier's imports |
| Automatic savings detection / auditing (Coming Oct 2026) | n/a | No | Yes, when live | Yes, when live |
| Insights across the catalog | n/a | No (locked, shown as lost) | Yes | Yes |
| Impact checks on untracked imports | n/a | A count only | A count only | A count only |

— [PRICING.md](PRICING.md)
- `/api/adcvd/match` answers a free account with HTTP 402 and only the summary ("a case may apply"). — [PRICING.md](PRICING.md)
- Code mirrors this: plan kinds are `anonymous | trial | free | paid`; `hasFullAccess` = paid or trial; free plan `pairLimit` = `TRIAL_ALLOWANCE.alertImports` = 0; trial `pairLimit` = `REVERSE_TRIAL.imports` = 200; paid plan = tier `maxPairs`; anonymous pairLimit 0. Before the trial starts (no real imports yet) the account has trial access with no countdown. — [libs/tariff-tracker/plan.ts](libs/tariff-tracker/plan.ts); [components/pricing-calculator/lib/pricing.ts](components/pricing-calculator/lib/pricing.ts)
- An "import" is one HTS code from one country of origin (a "pair"); repeat shipments, quantities and values don't add to the count. — [PRICING.md](PRICING.md); home FAQ in commit 401448ef `components/home/lib/copy.ts`

**What the paid Tracker sells now (MVP, live since 2026-10-16/18)**
- Track your imports (paste or upload whole catalog, every tariff on each import); Alerts when a tariff change hits a tracked import (before → after, +X%), AD/CVD alerts included; Impact checks (pick any tariff action, see how it affects each import); Insights across the catalog; Tariff News (CBP, Federal Register, USTR, USITC, White House); Rate history; Export every tariff to CSV or Excel. — [PRICING.md](PRICING.md)
- Plans-dialog include list (`PREMIUM_INCLUDES`): alerts on any tracked import; impact checks; Insights; Tariff News; rate history; "Export every tariff on every import to CSV or Excel, or share reports with your team or broker". — [components/tariff-tracker/access/features.ts](components/tariff-tracker/access/features.ts)
- Alert channels: email, in-app, Slack, Microsoft Teams. Impact alerts send since 2026-10-15 but only after the admin approves an update's impact check in /tariff-sources (no fully automatic trigger yet). Alerts are on by default the moment an account adds an import; users choose alert kinds; imports added after an update's first approval are never alerted about it. — [memory/alert-delivery-todo.md](memory/alert-delivery-todo.md); [memory/tariff-landing-pages.md](memory/tariff-landing-pages.md)
- Tracker nav (2026-10-19): Home, Your Imports (Insights is a tab inside), Calculator, Tariff Changes (merges Alerts, Tariff News, Tariff Impacts, Rate History), Savings (Soon), Audits (Soon), Expert Help at the foot. Product promise stated as "Tariff Alerts, Savings and Audits for all your imports". — [memory/tracker-restructure.md](memory/tracker-restructure.md)
- Impact checks show detail only for tracked imports; untracked imports hit show as a count ("It also hits N imports you're not tracking") with "Track more imports". This is a permanent rule, not a flag. — [MVP_TRIM.md](MVP_TRIM.md)
- A full-screen feature tour (Add Imports, Alerts, Your Imports, AD/CVD, Savings (soon), Audits (soon)) auto-opens on first Tracker visit and once after first imports (built 2026-10-21). — [memory/feature-tour.md](memory/feature-tour.md)

**Built but switched off (savings and audits)**
- `SAVINGS_ENABLED = false`, `AUDITS_ENABLED = false`; `SAVINGS_AUDITS_MARKETED = true` (marketing shows them with the "Coming Oct 2026" chip and "Coming soon" buttons). `/api/tracker/checks` returns 403 "coming soon" for savings and audit checks. — [libs/tariff-tracker/features.ts](libs/tariff-tracker/features.ts); [MVP_TRIM.md](MVP_TRIM.md)
- Savings = savings checks (trade programs, lower-duty origins, exemptions, qualification check). Audits = entry audit and refund check (what was paid on a past entry vs. duty in force that date, flagging over/underpayment). Constants kept: 5 savings checks, 10 audit checks per free account (unused while off). — [PRICING.md](PRICING.md); [components/pricing-calculator/lib/pricing.ts](components/pricing-calculator/lib/pricing.ts)
- Rollback point for the MVP trim: commit `3f439dc0`. — [MVP_TRIM.md](MVP_TRIM.md)

### Inferences
- The free account's durable value after the trial is research (why, legal text, sourcing, past-date duty, catalog + rate history + export) plus generic Tariff News; all monitoring of the user's own imports is paid. The paywall line is "monitoring my imports", not "data access".
- Because catalog, rate history and export are unlimited on free, a free user can bulk-export current duty for their whole catalog without paying; the paid hook is change detection (alerts/impact) and Insights.

### Gaps
- I did not verify in the browser what exactly blurs for anonymous users on /duty-calculator today (Overview, News, Analysis); only docs/code constants were read.
- Whether Slack/Teams delivery is restricted to paid tiers is not stated anywhere; it appears available to any account with tracked imports.

## Q2. All plans and prices, launch vs. next prices, trial, and what's paused or coming

### Takeaway
Live Tracker prices are launch prices $12 / $29 / $89 / $149 per month for 10 / 30 / 100 / 500 imports (500+ quoted), monthly only, locked for life for anyone who subscribes before Fri Nov 13, 2026; new subscribers then pay $19 / $49 / $149 / $249, when savings and audits are supposed to be included. Every account gets a 14-day, 200-import, no-card reverse trial starting at its first real import. Classification ($39 / $89 / $429 + $60 licenses) is unchanged and secondary. Managed runs $1,200 to $7,500/mo (placeholder prices). Legacy Tariff Impact plans ($0/$19/$39) remain in config.

### Cited Findings
**Tariff Tracker (live)**
- `TRACKER_TIERS`: up to 10 imports $12; 30 $29; 100 $89; 500 $149; 500+ quoted ("Let's talk"). Before the MVP trim these were $19 / $49 / $149 / $249. — [components/pricing-calculator/lib/pricing.ts](components/pricing-calculator/lib/pricing.ts); [MVP_TRIM.md](MVP_TRIM.md)
- Per-import price is surfaced everywhere: $12/10 = $1.20, $29/30 = $0.97, $89/100 = $0.89, $149/500 = $0.30 ("as low as $0.30 per import"). — [components/pricing-calculator/lib/pricing.ts](components/pricing-calculator/lib/pricing.ts) (`perImportPrice`, `LOWEST_PER_IMPORT`)
- `LAUNCH_PRICING`: ends `2026-11-13T23:59:59-05:00` ("Fri, Nov 13"; moved from Oct 23 on 2026-10-18); `nextPrices` {10: $19, 30: $49, 100: $149, 500: $249}. Subscribers before then keep their price while subscribed; old Stripe prices keep working (`libs/tariff-tracker/prices.ts`). The plans dialog shows a deadline bar, countdown, struck-through coming prices and "Lock in $X/mo" buttons, all hidden automatically after the deadline. — [PRICING.md](PRICING.md); [MVP_TRIM.md](MVP_TRIM.md)
- "Prices don't change on their own": after Nov 13 the countdown disappears but `TRACKER_TIERS` and Stripe prices must be updated by hand. — [PRE_DEPLOY.md](PRE_DEPLOY.md)
- Monthly only: `TRACKER_ANNUAL_ENABLED = false`; checkout forces monthly. Classification and Managed keep annual billing. `ANNUAL_DISCOUNT` = 15% (Classify; Tracker when re-enabled). — [libs/tariff-tracker/features.ts](libs/tariff-tracker/features.ts); [components/pricing-calculator/lib/pricing.ts](components/pricing-calculator/lib/pricing.ts)
- Stripe: Tracker prices created with lookup keys, metadata `billing = monthly`, `version = 2026-10-mvp`; no Stripe trial (the 14 days are the app's own, no card); upgrades `always_invoice`, downgrades at period end. — [PRE_DEPLOY.md](PRE_DEPLOY.md)

**Reverse trial**
- `REVERSE_TRIAL = { days: 14, imports: 200, freshStartOn: "2026-10-21" }`. Starts automatically via a DB trigger when the catalog first holds a real (non-example) import (`tracker_onboarding.trial_started_at`; decided 2026-10-20, previously at sign-up). Existing accounts with imports get a fresh 14 days from the deploy day. — [components/pricing-calculator/lib/pricing.ts](components/pricing-calculator/lib/pricing.ts); [PRICING.md](PRICING.md); [memory/import-onboarding-takeover.md](memory/import-onboarding-takeover.md)
- After it ends without a plan: free plan, no alerts/impact checks/AD/CVD updates on own imports (changed from 5 imports on 2026-10-18; was 10 before the MVP). Keeps Tariff News alerts, sourcing intelligence, the whole catalog; nothing deleted. — [PRICING.md](PRICING.md); [components/pricing-calculator/lib/pricing.ts](components/pricing-calculator/lib/pricing.ts)
- "Lean into loss": sidebar countdown, trial-ending dialog, emails 3 days and 1 day before end and the day after (`libs/email/lifecycle.ts`); show lost alerts, impact checks, AD/CVD, Insights, and savings/audits labeled "Coming Oct 2026". Required copy: "Free for 14 days", "Starts when you add your imports", "Everything, on up to 200 imports", "No credit card"; never "no time limit"/"never expires". — [PRICING.md](PRICING.md); [memory/reverse-trial.md](memory/reverse-trial.md)

**Free plan allowance history (for context)**
- 2026-10-10: removed the old free plan of 20 duty calculations/month and the $14.99/mo Tariff Calculator plan; old Tracker tiers were $49 / $79 / $149 / quoted. — [PRICING.md](PRICING.md)
- 2026-10-13: usage-based trial (5 savings checks, 10 audit checks, alerts on 10 imports, never resets; tiers $19/$49/$149/$249) replaced a 14-day trial. 2026-10-16: MVP trim cut prices to $12/$29/$89/$149 and free tracked imports to 5. 2026-10-18: 14-day/200-import reverse trial, free plan to 0 tracked imports. — [PRICING.md](PRICING.md); [MVP_TRIM.md](MVP_TRIM.md); [memory/reverse-trial.md](memory/reverse-trial.md)

**Classification (secondary, unchanged)**
- Starter $39/mo (10 classifications/mo, CROSS rulings validation); Pro $89/mo (up to 100/mo, audit existing classifications, one-click reports); Team $429/mo (shared workspace, review/approve, onboarding; for teams classifying 30+ products/mo; "Set up with our team"); Licenses $60/person (separate Pro accounts; from 8 people Team costs less). 15% off annually. — [components/pricing-calculator/lib/pricing.ts](components/pricing-calculator/lib/pricing.ts); [PRICING.md](PRICING.md)
- config.ts also carries anchor prices: Starter $39 (anchor $50), Pro $89 (anchor $129), Team $429 (anchor $499); legacy Pro and Teams "bundle" plans list "Tariff Impact Checker" as a feature. — [config.ts](config.ts)
- Business focus moved away from classification on 2026-10-10 because it is a customs-business gray area (CBP HQ H350722). — [memory/pricing-model.md](memory/pricing-model.md); [memory/tariff-landing-pages.md](memory/tariff-landing-pages.md)

**HTS Hero Managed (Expert help)**
- Placeholder prices (added 2026-10-15): up to 25 imports $1,200/mo; 50 $2,500; 200 $4,500; 500 $7,500; 500+ quoted. Annual 20% off (`MANAGED_ANNUAL_DISCOUNT`): $960 / $2,000 / $3,600 / $6,000. Sold via intro call (`config.bookCallUrl`), not self-serve; includes the Tracker on every managed import; shared Slack channel, weekly check-in, savings options explored, entries/entry summaries audited and flagged for the client's broker. — [PRICING.md](PRICING.md); [components/pricing-calculator/lib/pricing.ts](components/pricing-calculator/lib/pricing.ts)
- Managed copy was rewritten for legal reasons: "Tariff Experts on Your Team", "Every Tariff Watched", "Savings Options to Explore", "Briefed"; HTS Hero finds, flags, explains; the broker decides and files. — [MVP_TRIM.md](MVP_TRIM.md)

**Tariff Impact (legacy)**
- Config still defines Tariff Impact Starter $0 (unlimited impact checks, product catalog), Standard $19 (anchor $40; adds monitoring/notifications), Pro $39 (anchor $90; adds Duty Simulator), wired to `components/TariffImpactPricing.tsx` and still referenced by `app/about/tariff-impact-checker/page.tsx` and `app/about/tariffs/page.tsx`. — [config.ts](config.ts); [types/config.ts](types/config.ts)
- Tariff Impact Checker is "being sunset starting Oct 2026" (removed from nav, footer, homepage, HTS page CTAs); Tariff Tracker replaces it and Tariff Watcher. — [memory/tariff-tracker-vision.md](memory/tariff-tracker-vision.md)

**Free audit lead magnet**
- /tariff-audit offers a free, one-time overpayment check / requested audit (form to `/api/audit-request`, Supabase `audit_requests`, email to the founder); no price published; it is a lead, not a plan. Self-serve audits "coming soon". — [PRICING.md](PRICING.md); [MVP_TRIM.md](MVP_TRIM.md)

**Coming / planned**
- Savings and audits: marketed as "Coming Oct 2026" (`SAVINGS_AUDITS_LABEL`); PRE_DEPLOY warns the label "leaves only Oct 22–31: change it now if savings and audits won't ship by Oct 31". Within two weeks of launch: automatic entry auditing, then flags on; new prices for new subscribers when launch pricing ends. — [PRE_DEPLOY.md](PRE_DEPLOY.md); [libs/tariff-tracker/features.ts](libs/tariff-tracker/features.ts)
- Also planned: bulk refund check (CSV / ACE ES-003 upload); exact savings requirements per program; one-time offers to find savings and audit prior entries ("not on offer yet. Don't mention them in copy"); annual Tracker billing back (create annual Stripe prices first); team notifications on savings opportunities. — [PRE_DEPLOY.md](PRE_DEPLOY.md); [PRICING.md](PRICING.md); [MVP_TRIM.md](MVP_TRIM.md)
- MCP: decided 2026-10-06 to "build the capabilities now and define and enforce plan limits later"; only line is identity (sign-in when touching the user's own data); v0 built on branch `feature/mcp-server`. — [MCP_DISTRIBUTION_PLAN.md](MCP_DISTRIBUTION_PLAN.md)
- Possible future: PGA (FDA/APHIS/CPSC) flags with a country layer; nothing decided or built. Full HTS→flag map needs a CBP data extract ($500/yr). — [memory/pga-flags-research.md](memory/pga-flags-research.md)

**Conflicts found between docs and code / copy**
1. **Are savings and audits included or a separate subscription?** MVP_TRIM.md and the header comment of `features.ts` say they "come back soon as their own subscription" (commit 401448ef message: "coming soon as their own plan"). But PRICING.md, `SAVINGS_AUDITS_SOON` ("included in every Tracker plan") and `SAVINGS_AUDITS_COMING` ("included in the trial and every paid Tracker plan at no extra cost when they launch") say included. Marketing is promising inclusion. — [MVP_TRIM.md](MVP_TRIM.md); [libs/tariff-tracker/features.ts](libs/tariff-tracker/features.ts); [components/ui/marketing/comingSoon.ts](components/ui/marketing/comingSoon.ts); [PRICING.md](PRICING.md)
2. **Homepage FAQ regressed to pre-MVP copy.** Committed `components/home/lib/copy.ts` at HEAD (last touched by 45a02d46) says HTS Hero "audits past entries for duty you can get back" (certain wording and not live), keeps "Can HTS Hero find duty I overpaid? Yes…", and the cost answer cites "check 5 imports for savings, run 10 audit checks… 15% off with annual billing". The MVP commit 401448ef had replaced these with tracking/impact-check copy and "billed monthly". This contradicts PRICING.md, the legal rules, and MVP_TRIM.md. The same file renders "Alerts are free on ${TRIAL_ALLOWANCE.alertImports} imports", which now evaluates to "free on 0 imports" (also present in the 401448ef version). This feeds the FAQPage JSON-LD on `/`. Also typo "entires". — [components/home/lib/copy.ts](components/home/lib/copy.ts); git `401448ef`, `45a02d46`
3. **Launch deadline**: MVP_TRIM.md still says `LAUNCH_PRICING` ends Fri Oct 23, 2026; code and PRICING.md say Nov 13. — [MVP_TRIM.md](MVP_TRIM.md); [components/pricing-calculator/lib/pricing.ts](components/pricing-calculator/lib/pricing.ts)
4. **Free tracked imports**: MVP_TRIM.md says 5; code and PRICING.md say 0 after the trial. — same sources
5. **Paused section of PRICING.md** still says "Annual billing takes 15% off every plan" and lists annual Tracker prices ($16/$41/$126/$211); not live. Its "Code and copy that still state the old pricing (as of 2026-10-10)" list may be stale. — [PRICING.md](PRICING.md)
6. **Comparison page "checkedAt"**: HTS Hero's own compare entry says `checkedAt: "2026-10-06"` but its prices read live constants, so the date is not meaningful for HTS Hero. — [libs/compare/tools/htsHero.ts](libs/compare/tools/htsHero.ts)
7. **Tariff Impact plans** ($0/$19/$39) still exist in config and on /about/tariff-impact-checker while the product is described as sunset. — [config.ts](config.ts)
8. **Managed annual discount** is 20% while plan annual discount is 15%; Managed prices are explicitly "placeholders until confirmed". — [PRICING.md](PRICING.md)

### Inferences
- Pricing has moved five times in 11 days (Oct 10, 13, 16, 18, 20), a sign it is unvalidated by customer data; the report should treat current numbers as hypotheses.
- The launch-to-next jump is +58% to +67% per tier ($12→$19, $29→$49, $89→$149, $149→$249), justified only by savings/audits that are not yet shipped and whose inclusion is internally contested (conflict 1).
- There is a large gap between the top self-serve tier ($149/mo for 500 imports) and Managed ($1,200/mo for 25 imports), with nothing in between (no team/seat tier, no annual).

### Gaps
- No confirmed Managed prices, and no evidence any Managed or Tracker customer exists yet.
- Whether savings/audits will get their own price is undecided in the docs (conflict 1).

## Q3. ICPs, personas, landing pages and funnel decisions

### Takeaway
The stated audience is US importers, customs brokers, freight forwarders and compliance teams; ~99% of traffic is desktop (B2B). The funnel is: free calculator (SEO + MCP) → free account (email) → upload imports (activation; starts the trial) → reverse trial with loss-aversion → paid tier by import count → Managed. Calculator CTAs aim for free accounts, not the trial.

### Cited Findings
**ICP / positioning**
- Homepage definition: "US tariff software for importers, customs brokers and freight forwarders". — [components/home/lib/copy.ts](components/home/lib/copy.ts)
- Compare page `bestFor`: "Importers, brokers and compliance teams who need exact, auditable US duty". Positioning summary: every Chapter 99 tariff stacked line by line with its legal source, duty on any past entry date, duty over time, tracking with alerts and impact checks, API and MCP. Limitations: US imports only; verified historical rates start April 2026 (2026HTSRev5, 2026-04-08). — [libs/compare/tools/htsHero.ts](libs/compare/tools/htsHero.ts); [memory/blog-comparison-seo-plan.md](memory/blog-comparison-seo-plan.md)
- Social proof allowed: "Trusted by hundreds of customs brokers, freight forwarders and manufacturers" (on /tariff-monitor hero). — [components/tariff-monitor/hero/MonitorHero.tsx](components/tariff-monitor/hero/MonitorHero.tsx); [memory/tariff-landing-pages.md](memory/tariff-landing-pages.md)
- Positioning point from the user: self-serve, published pricing, start now, no demo, no sales package, no contract. — [memory/blog-comparison-seo-plan.md](memory/blog-comparison-seo-plan.md); [PRICING.md](PRICING.md)
- Tracker vision: "Bloomberg Terminal for tariffs"; calculator is the lightweight entry product. — [memory/tariff-tracker-vision.md](memory/tariff-tracker-vision.md)
- Desktop: "the user said 99% of HTS Hero traffic is desktop"; GSC shows 89% of impressions desktop, 62% US. — [memory/desktop-first-layouts.md](memory/desktop-first-layouts.md); [SEO_AUDIT_duty-calculator.md](SEO_AUDIT_duty-calculator.md)
- MCP plan's buyer channels: brokers and procurement "live in spreadsheets", so a Sheets/Excel add-in is the "strongest paid bridge"; Shopify SMB importers are a candidate channel; M365 Copilot later for enterprise. — [MCP_DISTRIBUTION_PLAN.md](MCP_DISTRIBUTION_PLAN.md)
- No formal persona or ICP document found (no persona/ICP terms in DESIGN_SYSTEM.md, PRE_DEPLOY.md or MCP plan beyond "our buyer").

**Landing pages**
- `/` : tariff-first summary of all offers; generic sign-ups land here. — [memory/tariff-landing-pages.md](memory/tariff-landing-pages.md); [memory/import-onboarding-takeover.md](memory/import-onboarding-takeover.md)
- `/duty-calculator`: landing page + tool in one (URL kept). Signed-in users who open it go to the Tracker's Calculator tab with inputs kept. — [memory/tariff-landing-pages.md](memory/tariff-landing-pages.md); [memory/plg-funnel-rework.md](memory/plg-funnel-rework.md)
- `/tariff-monitor`: marketing page for the Tariff Tracker; title targets "tariff tracking software" (the "tariff tracker" SERP is news/law-firm trackers; FiscalNote sells a product named Tariff Tracker). Features listed: Tariff Alerts by HTS Code, Early Warning on Announcements, Rate History, Impact Checks, AD/CVD Alerts, Insights, Sourcing Intelligence, Export, Built for Teams, plus Savings Detection and Auto Auditing (coming). `/tariff-tracker` app is noindexed. — [memory/tariff-landing-pages.md](memory/tariff-landing-pages.md); [components/tariff-monitor/lib/copy.ts](components/tariff-monitor/lib/copy.ts)
- `/tariff-audit`: overpayment audit page; now "Request an audit" (primary) + "Track your imports free"; self-serve audit "coming soon"; refund groups (IEEPA, Section 122 etc.) as cards. — [MVP_TRIM.md](MVP_TRIM.md); [memory/tariff-landing-pages.md](memory/tariff-landing-pages.md)
- `/tariff-updates`: public feed of tariff actions (White House, Federal Register, CSMS, USTR, USITC), auto-published official items, per-update pages, RSS, email subscriptions (instant or weekly digest, double opt-in); non-users with imports are pushed to Tracker sign-up. — [memory/tariff-updates-feed.md](memory/tariff-updates-feed.md)
- `/compare/[slug]`: HTS Hero vs Flexport, GingerControl, Gateway Lines, TariffsAPI, AMZ Prep, Avalara/Zonos and more; alternatives and roundup formats; must favor HTS Hero but keep competitor claims verifiable and dated. — [memory/blog-comparison-seo-plan.md](memory/blog-comparison-seo-plan.md); [libs/compare/tools/](libs/compare/tools/)
- `/pricing-calculator` (pricing page with estimator), `/classify`, blog (23 MDX articles, mostly HTS revision posts), `/adcvd` admin. — [app/](app/); [content/blog/](content/blog/)

**Funnel decisions**
- Funnel: anonymous /duty-calculator → free account → /tariff-tracker → trial → paid tier → higher tier. — [memory/plg-funnel-rework.md](memory/plg-funnel-rework.md)
- Calculator CTAs open the free-account pop-up, not the trial; upsell happens inside the Tracker and in emails. "The free calculator… has two jobs: accurate tariff data, and turning visitors into accounts (their email)." — [memory/calculator-ctas-aim-for-accounts.md](memory/calculator-ctas-aim-for-accounts.md)
- Activation event = uploading imports (HTS + COO pairs); first Tracker visit with zero imports shows an import takeover only when asked (auto-open dropped 2026-10-21); ways in: recent calculator searches, paste, CSV/Excel; example list last. Email cadences for never-opened, opened-no-imports (day 1, personal founder note ~day 3, day 10, Managed secondary). — [memory/import-onboarding-takeover.md](memory/import-onboarding-takeover.md)
- Reverse trial rationale: "lets users feel the full product, then loss of it drives conversion." — [memory/reverse-trial.md](memory/reverse-trial.md)
- Upgrade dialog recommends the tier that fits the catalog, headlines the user's untracked imports and last 12 months of tariff changes. — [PRICING.md](PRICING.md); [MVP_TRIM.md](MVP_TRIM.md)
- MCP funnel: the conversion inside an AI client is "a free HTS Hero account with a tracked product, never a purchase"; never put pricing in a tool result; UTM-tagged links for Mixpanel. — [MCP_DISTRIBUTION_PLAN.md](MCP_DISTRIBUTION_PLAN.md)
- Email principles: value first, drive to site, always a path to sign-up/upgrade; non-transactional emails go through an /email-outbox approval. — [MEMORY.md index](memory/MEMORY.md); [memory/tariff-updates-feed.md](memory/tariff-updates-feed.md)

### Inferences
- The ICP is broad (importers, brokers, forwarders, manufacturers, compliance teams) and pricing is per import pair, not per seat or per client; brokers/forwarders managing many clients' imports may hit the 500-pair ceiling fast or need multi-client structure that no tier offers.
- Several onboarding/funnel choices (trial start, auto-open, free allowance) were changed within days, again suggesting no conversion data yet.

### Gaps
- No documented ICP prioritization (which segment pays first), company-size targets, or willingness-to-pay research.
- No funnel conversion numbers (sign-up rate, activation rate, trial-to-paid) anywhere in the repo.

## Q4. Most differentiated vs. commodity features

### Takeaway
Free calculators are commodity (AMZ Prep, Easyship, Airlift, Flexport, Gateway Lines, TariffsAPI, GingerControl all have free ones). HTS Hero's documented differentiators are legal-source line-by-line Chapter 99 stacking, verified historical/past-entry-date duty, catalog alerts with before→after impact, AD/CVD case matching, and (planned) savings/audits and a PGA country layer. Most paid competitors with watch lists/alerts hide prices or start at $99/mo.

### Cited Findings
- Competitor pricing captured 2026-10-06: AMZ Prep free; Easyship free; Airlift free, no account, no limits; Flexport free (5 free searches then free sign-up; Pro for Flexport clients, no price); Gateway Lines free (5/week anonymous, unlimited with free account; alerts and API unpriced); GingerControl free calculator, paid unpublished; TariffsAPI free calculator, Importer $99/mo ($74 annual) with watch lists, alerts, CSV import, Developer $199/mo, 14-day trial with card; SimplyDuty from £9.99/mo; Descartes CustomsInfo ~US$750 per user; Avalara and Zonos unpublished. — [libs/compare/tools/](libs/compare/tools/) (flexport.ts, gatewayLines.ts, gingerControl.ts, tariffsApi.ts, amzPrep.ts, globalLandedCost.ts)
- Gateway Lines MCP: free tier 10 requests/week behind email signup; HTS Hero MCP plans no limits beyond abuse rate limits. — [MCP_DISTRIBUTION_PLAN.md](MCP_DISTRIBUTION_PLAN.md)
- HTS Hero strengths listed on compare pages: every Chapter 99 tariff as its own line with heading and U.S. note; duty on a past entry date from the revision in force; Duty Over Time; alerts and impact checks with before/after; CSV/Excel export; 14-day no-card trial; published monthly prices; API and MCP ("onRequest"). — [libs/compare/tools/htsHero.ts](libs/compare/tools/htsHero.ts)
- AD/CVD matching (built 2026-10-17): case registry of 974 cases (919 live, 909 with HTS codes, 2,205 distinct codes, 71 countries) backfilled for $9.07 of AI spend; levels likely/possible; rates shown as a range in %, never added to duty totals, every flag links to primary sources, never "guaranteed". Gated: teaser for free/anonymous, full for trial/paid. — [memory/adcvd-matching-plan.md](memory/adcvd-matching-plan.md); [PRICING.md](PRICING.md)
- PGA research: "Country layer (the differentiator; competitors show HTS flags only)"; Flexport gates PGA behind Pro; Customs City/KYG show flags. Not built. — [memory/pga-flags-research.md](memory/pga-flags-research.md)
- Tariff updates pipeline: collectors every 15 min, AI sort/read/group (~$8 for Jul–Oct 2026), stage timeline per action (Announced → Signed → FR → CSMS → HTS → calculator). — [memory/tariff-updates-feed.md](memory/tariff-updates-feed.md)
- HTS notes win over proclamation/EO text when they disagree (data-quality principle). — [MEMORY.md index](memory/MEMORY.md)

### Inferences
- At $12/mo for 10 imports and $0.30/import at 500, HTS Hero's tracked-import price undercuts the only published comparable (TariffsAPI Importer $99/mo) by a wide margin; that leaves room to raise prices if value is proven.
- The free calculator, Duty over time and sourcing are giveaways that match or beat competitors' free tiers; they drive acquisition, not revenue.
- Savings detection and entry auditing are the features most tied to money outcomes (potential refunds/savings), which supports value-based pricing, but they are unshipped and legally constrained to "potential" wording.

### Gaps
- No usage data shows which features users engage with or would pay for.
- Competitor data is dated 2026-10-06 and was not re-verified here.

## Q5. Analytics and usage evidence in the repo

### Takeaway
Evidence is thin: one GSC export (Oct 4, 2026: 76 clicks / 918 impressions over 3 months, almost all branded, calculator at position ~61) and Mixpanel instrumentation with no exported results. No conversion, revenue or customer-count data exists in the repo.

### Cited Findings
- GSC (3 months to 2026-10-04): 76 clicks, 918 impressions; 89% of impressions desktop; US 62%; "hts hero" = 45 of 76 clicks; homepage 71 of 76 clicks; non-brand organic "effectively zero"; /duty-calculator 157 impressions, 0 clicks, avg position 60.9; Google knew ~43 URLs, 17–18 indexed; 0 sitemaps submitted; ~29 crawl requests/day. — [SEO_AUDIT_duty-calculator.md](SEO_AUDIT_duty-calculator.md); raw exports in [seo-data/](seo-data/)
- Mixpanel events instrumented (counts of call sites): TARIFF_TRACKER_ONBOARDING_HELP_USED, TARIFF_TRACKER_ONBOARDING_STEP, LOCKED_FEATURE_CTA_CLICKED, LOCKED_FEATURE_VIEWED, TARIFF_TRACKER_UPGRADE_OPENED, TARIFF_TRACKER_PRODUCTS_ADDED, CLICKED_TARIFF_TEAM_LETS_TALK, DUTY_CALCULATOR_RESULTS_VIEWED, CLASSIFICATION_STARTED, ANONYMOUS_CLASSIFICATION_STARTED, TARIFF_UPDATES_SUBSCRIBED, TARIFF_UPDATES_TRACKER_UPSELL_CLICKED, CLICKED_CLASSIFY_PRO_UPGRADE and more. — grep of `MixpanelEvent.*` across `components/`, `app/`, `libs/`
- Claimed: "Trusted by hundreds of customs brokers, freight forwarders and manufacturers" (approved social-proof line; no supporting user count found in the repo). — [memory/tariff-landing-pages.md](memory/tariff-landing-pages.md)
- MCP plan flags traffic risk: AI directory traffic may be small (developers report 0–5 tool calls/day on ChatGPT apps); 60-day review point. — [MCP_DISTRIBUTION_PLAN.md](MCP_DISTRIBUTION_PLAN.md)
- Customer pain/value research on refunds legality exists at `reports/Customs brokerage limits for refunds.md` (not read in full). — [reports/](reports/)

### Inferences
- Pricing/packaging decisions are being made pre-revenue and pre-traffic; the most valuable near-term data would come from the Mixpanel locked-feature and upgrade events after the Oct 21–22 launch.

### Gaps
- No Mixpanel results, Stripe revenue, active-subscriber counts, Classification revenue, or trial conversion figures in the repo. Stripe MCP tools were available but not used (out of the read-only repo scope).
- GSC data is 17 days old and predates the new landing pages.

## Legal and wording constraints the product operates under

### Takeaway
HTS Hero is not a licensed customs broker. It finds, flags and explains; the importer's broker decides and files. All savings and refunds must be phrased as potential, rate changes as %, and AD/CVD/PGA as "may apply".

### Cited Findings
- Allowed: rate lookups, monitoring/alerts, entry audits flagging potential over/underpayment on the code as entered (HQ H175280), general eligibility info, deadlines, discrepancy reports for the broker, flat fees paid by the importer, unpaid referrals. Never: prepare/file drawback, PSCs, CAPE files (HQ 114199); reclassify past entries; give 10-digit codes for goods being imported (H350722); decide a shipment qualifies; broker referral fees/revenue share (19 CFR 111.36(b)); success fees on broker-filed refunds; filing protests (left out by choice). "Audit" wording is fine. — [memory/unlicensed-find-flag-explain.md](memory/unlicensed-find-flag-explain.md)
- Implication for pricing: no success-fee / contingency pricing on refunds; only flat fees. — [memory/unlicensed-find-flag-explain.md](memory/unlicensed-find-flag-explain.md)
- Savings always "could save / up to / may qualify", never certain. — [memory/savings-are-potential.md](memory/savings-are-potential.md)
- Tariff changes shown as rates before→after and +X%, never $ amounts; never "pts". — [MEMORY.md index](memory/MEMORY.md)
- AD/CVD: never "guaranteed"; scope is legally set by product description, not HTS code. — [memory/adcvd-matching-plan.md](memory/adcvd-matching-plan.md)
- Verified historical rates only start 2026-04-08; never claim audits of IEEPA-period entries until backfill lands. — [memory/blog-comparison-seo-plan.md](memory/blog-comparison-seo-plan.md)
- Home FAQ "Is HTS Hero a customs broker?": "No… We NEVER process entires, corrections, or refunds." (typo in live copy). — [components/home/lib/copy.ts](components/home/lib/copy.ts)

### Inferences
- The legal line rules out the most obvious high-value monetization of audits (contingency on recovered duty), pushing the business toward subscription and flat-fee service pricing.

### Gaps
- No legal opinion on whether Managed's "every entry audited" service is fully within the line; it relies on the founder's own research report.
