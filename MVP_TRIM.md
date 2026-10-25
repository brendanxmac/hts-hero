# Tracker MVP trim (2026-10-16)

> **2026-10-22: savings and audits are switched back on.** The `SAVINGS_ENABLED` / `AUDITS_ENABLED`
> flags (and `DEMO_SAVINGS_AUDITS`, the `MARKET_*` flags and the "Coming Oct 2026" labels) are
> removed: savings detection and auditing are live everywhere, in the trial and every paid Tracker
> plan (PRICING.md). The rest of this file is history.

The Tariff Tracker ships as tracking only: track imports, alerts, impact checks, Tariff News, rate
history and CSV / Excel export. **Savings** (savings checks, the qualification check, savings
discovery) and **audits** (entry audit, refund check, audit checks) are switched off and come back
soon as their own subscription.

**Rollback point:** commit `3f439dc0` on `release/2026-10-10` is everything before this trim. Every
copy change below can be restored from it with `git show 3f439dc0:<path>`.

## How to bring savings and audits back

1. In `libs/tariff-tracker/features.ts`, set `SAVINGS_ENABLED` and `AUDITS_ENABLED` to `true`.
   Everything gated on them (listed under "Gated in code" below) comes back as it was.
2. Decide the new plan for savings and audits (their own subscription), update PRICING.md first,
   then the copy listed under "Copy changed" below. Old wording is in `3f439dc0`.
3. Set `TRACKER_ANNUAL_ENABLED` to `true` to bring back annual Tracker billing (create the annual
   Stripe prices first).
4. Revisit the price and free-plan constants in `components/pricing-calculator/lib/pricing.ts`
   (see "Prices and allowances").

**Marketing ahead of the Tracker (2026-10-19):** `SAVINGS_AUDITS_MARKETED` in `features.ts`
brings back the homepage's savings and audit pieces (hero H1 and lead, the scan's Savings and
Audits passes, the Discover Savings and Audit blocks) while the Tracker's tabs stay off. Each
carries the "Coming Oct 2026" chip and its self-serve button reads "Coming soon" until
`SAVINGS_ENABLED` / `AUDITS_ENABLED` are on; the chips and disabled buttons then go away by
themselves.

## Prices and allowances

| What | Before | MVP | Where |
|---|---|---|---|
| Tracker tiers (10 / 30 / 100 / 500 imports) | $19 / $49 / $149 / $249 | $12 / $29 / $89 / $149 | `TRACKER_TIERS`, pricing.ts |
| Free tracked imports (alerts and impact checks) | 10 | 5 | `TRIAL_ALLOWANCE.alertImports`, pricing.ts |
| Free savings checks / audit checks | 5 / 10 | Unchanged constants, not shown or usable | `TRIAL_ALLOWANCE` |
| Annual Tracker billing | 15% off | Off (monthly only) | `TRACKER_ANNUAL_ENABLED`; checkout forces monthly |
| PRICING.md | Usage-based trial section was current | New "Tracker MVP" section on top; old sections kept under "Paused until savings and audits return" | PRICING.md |
| Test | Tier prices $19…$249 | $12…$149 | `testing/tariff-tracker-plan.test.ts` |

## Gated in code (flip the flags to restore)

Tracker app (`components/tariff-tracker/`):

- `sections.ts`: `PRODUCT_TABS` drops `savings` and `audit` when off, so `?ptab=savings|audit` opens Duty.
- `product/ProductHeader.tsx`: the import's tab bar shows only `PRODUCT_TABS` (Duty, Compare, History).
- `product/ProductView.tsx`: the calculator's "check savings" opens nothing when savings are off.
- `calculator/TrackerCalculator.tsx`: same, in the Tracker's Calculator tab.
- `plan/PlanCard.tsx` (sidebar): free view is "Free plan" with one meter, "Imports tracked" (tracked imports / 5); savings and audit meters hidden. Paid view says "imports tracked" and "Track more imports" (was "covered" / "Cover more imports").
- `plan/PlanBanner.tsx`: the "You've used your free savings and audit checks" banner never shows.
- `access/TrackerAccessProvider.tsx`: the sign-up toast says "Your free plan is on: alerts and impact checks on 5 imports" (was savings checks, audit checks and alerts on 10).
- `access/UpgradeDialog.tsx`: savings and audit upsells fall back to the plan pitch; headings "Track more imports" / "Track all your imports"; "Priced by how many imports you track" (was "…cover, with unlimited audit checks"); billing toggle hidden and default monthly; footer adds "Billed monthly" and the coming-soon line.
- `access/features.ts`: `PREMIUM_INCLUDES` drops savings and audits and adds impact checks, Tariff News, rate history and export; `tracking` and `plan` benefits mention impact checks; `featureTab` sends savings and audit upsells to Your Imports.
- `overview/TariffHealth.tsx` + `overview/SummaryBoxes.tsx`: **Tariff Health → Tariff Readiness**: score = average of Imports Tracked % and Alerts On (0 or 100); rows Imports Tracked and Alerts On, plus a "Savings and Audits · Coming soon" line. The three-part Tariff Health is intact behind the flags.
- `overview/lib/steps.ts` + `overview/NextStep.tsx`: steps are Add products, Set up alerts, Set import values, **Run an impact check** (new; opens Tariff Impacts). "See potential savings" and "Audit past entries" come back with the flags. The "All set up" text changed.
- `overview/Overview.tsx`: "products to look at" use only the latest increases (no "Could save $X" tiles).
- `overview/ExamplePreview.tsx`: the example's "Potential savings" KPI becomes "Imports tracked".
- `imports/importColumns.tsx`: row badges are only "Not tracked" (was "No alerts" + savings badges); the Savings column is hidden.
- `imports/ImportsTable.tsx`: no Savings filter.
- `ReportSummary.tsx`: the "Could be lower" tile becomes "Lowest rate".
- `app/api/tracker/checks/route.ts`: savings and audit checks return 403 "coming soon".
- `app/api/stripe/create-checkout/route.ts`: Tracker plans always check out monthly.

Not a flag, a new rule for the MVP (keep it when savings and audits return):

- `impact/useUpdateImpact.ts` + `impact/TariffImpact.tsx`: impact checks show detail only for **tracked** imports (5 free, the tier on a plan). Untracked imports it hits show as a count, "It also hits N imports you're not tracking", with "Track more imports" (or create a free account). The action card's "of N imports" counts tracked imports. The Overview's Tariff Impacts box uses the same hook.

Managed (legal wording, not a flag; HTS Hero is not a customs broker):

- `expert-help/ExpertHelp.tsx`: "We Become Your Tariff Team" → "Tariff Experts on Your Team"; "Every Tariff Optimized / lowest-duty position" → "Every Tariff Watched"; "Always Hunting for Savings" → "Savings Options to Explore"; audits and entry-summary reviews "flag … for your broker"; "Every Tariff Change, Handled" → "Briefed"; included list and footnote say HTS Hero finds, flags and explains and the broker decides and files.

## Launch pricing (added 2026-10-16)

- `components/pricing-calculator/lib/pricing.ts`: `LAUNCH_PRICING` (ends Fri, Oct 23, 2026; next prices $19 / $49 / $149 / $249) and `launchPricingActive()`.
- `access/UpgradeDialog.tsx`: the plans dialog rebuilt to convert: an amber deadline bar with a countdown and the price lock, a headline about the user's untracked imports, their last 12 months of tariff changes, launch prices with the coming price struck through, "Lock in $X/mo" buttons, outcome-led benefits, reassurance (cancel anytime, no contract, catalog stays free, Stripe). Everything launch-related hides itself after Oct 23. When savings and audits return, update `LAUNCH_PRICING` (or remove it) and the footer line.
- `access/upgradeStats.ts` + `access/UpgradeStatsBridge.tsx` (new, mounted in `TrackerApp.tsx`): hand the dialog the user's import and change counts.

## Copy changed

Most of these are gated: the old copy is still in the code as the `SAVINGS_ENABLED` /
`AUDITS_ENABLED` branch, so flipping the flags brings it back. **(not gated)** marks plain rewrites;
their old text is in `3f439dc0`. Every "track N imports" reads `TRIAL_ALLOWANCE.alertImports` and
every price reads `TRACKER_TIERS`.

### Free calculator (`components/duty-calculator/`)

- `calculator/PremiumTeasers.tsx`: `CheckSavingsLink` ("Check Possible Savings"), `QualifyHeaderLink`, `QualifyLink` ("See if you qualify") and `RefundsButton` ("Check my entries…") render nothing while off. What each adjustment would change stays free.
- `calculator/CalculatorWorkspace.tsx`: track button "Find ways to save" → "Track this import"; strip "See what you could save… check your past entries…" → "Get an alert the moment a tariff change hits it… see exactly how any tariff action affects it"; `RefundCheckCard` needs `AUDITS_ENABLED`.
- `calculator/ConversionDialog.tsx`: new "impacts" benefit; savings/audit benefits filtered out; trial list → track N imports, alerts before → after, impact checks, News / history / export. **(not gated)** subtitle, eyebrow "Free trial" → "Free", footer, "Back to the trial" → "Back to the Tariff Tracker".
- `landing/TrackImportButton.tsx`: highlight "savings" → "alerts"; note "…5 free savings checks and 10 free entry audits" → "one of N you can track free".
- `landing/LandingEmpty.tsx` **(not gated)**: commented-out card "whether you might be owed a refund" → "and by how much".

### /tariff-audit (page kept; request form and `/api/audit-request` untouched)

- `components/tariff-audit/lib/links.ts`: adds `SELF_AUDIT_LIVE` and `SIGN_UP_TO_TRACK`; `SELF_AUDIT_URL` / `SIGN_UP_TO_AUDIT` kept, unlinked.
- `hero/AuditHero.tsx`: "Start free" + "Request an audit" → "Request an audit" (primary) + "Track your imports free"; adds "Self-serve audits in the Tariff Tracker are coming soon."; "10 free audit checks, no card" → "Request an audit free, no obligation".
- `paths/StartPaths.tsx`: "Audit it yourself" and "Try it without an account" show a disabled "Coming soon"; "Have us do it" is featured. **(not gated)** its text now ends "…for your customs broker to act on".
- `cta/ClosingCta.tsx`: "Get 10 free audit checks" → "Track your imports free"; "Request an audit" primary; coming-soon line.
- `lib/copy.ts`: "Is the audit free?" answer → free request, self-serve coming soon. **(not gated, legal wording; keep)** DEFINITION "tariffs you can get refunded" → "potential… may be refundable"; "Does HTS Hero file the refund?" → "finds and flags potential overpaid duty".
- `app/tariff-audit/page.tsx`: meta "10 free audit checks, or request one" → "Request a free audit".
- `request/RequestAudit.tsx` **(not gated, keep)**: "what you can recover" → "what you may be able to recover".

### Emails (`emails/`)

- `kit/parts.tsx`: `PlanStrip` → "tracks N imports: an alert when a tariff change hits one, and impact checks on each"; new `TRACKER_POINTS` checklist (track every rate, alerts before → after, impact checks, export).
- `account/WelcomeEmail.tsx`, `onboarding/MeetTrackerEmail.tsx`: checklist → `TRACKER_POINTS`.
- `onboarding/OnboardingEmail.tsx`: last two items → impact checks, export.
- `onboarding/FounderNoteEmail.tsx`: savings / overpaid-duty paragraph → alerts and impact checks.
- `onboarding/TrackerFindingsEmail.tsx`: preview "easy audits" → "impact checks"; item 1 "lower-duty options" → "Always know your rate"; item 3 "Audit every entry" → "See the impact of any tariff action". (Its Managed lines still mention audits and savings: Managed is done by hand.)
- `account/PurchaseConfirmationEmail.tsx`: "Alerts, savings and audits now cover…" → "Tracking, alerts and impact checks…"; step 3 → run an impact check.
- `auth/AuthEmail.tsx`: confirm / invite bodies drop "possible saving" / "where you could pay less". **Re-run `npm run email:auth` and paste the templates into Supabase (both projects).**
- `leads/AuditRequestReceivedEmail.tsx`: "Check past entries yourself… 10 checks free" → self-serve coming soon, track N imports free; CTA "Check my past entries" (`?tab=entries`) → "Track my imports free" (`?tab=catalog&add=paste`).
- `libs/email/lifecycle.ts`: comment only.

### Pricing (`components/pricing-calculator/`, `app/pricing-calculator/`)

- `lib/pricing.ts`: new `trackerBilling()` (monthly while `TRACKER_ANNUAL_ENABLED` is off); `estimate()` never gives the Tracker the annual discount.
- `tariff-pricing/plans.ts`: `TRACKER_TRIAL_FEATURES` and `TRACKER_FEATURES` rewritten around tracking, alerts, impact checks, News, history, export ("Share reports" dropped).
- `plans/TariffPlans.tsx`: title "Monitor your imports and unlock savings." → "Track every tariff on your imports."; intro and card copy; monthly price, "billed monthly"; renders the new `TrackerCore`.
- `plans/TrackerCore.tsx` (**new**): "Impact Checks, Tariff News and Alerts in One Place" block, export strip ("Export every tariff on every import to CSV or Excel, and see each import's rate history…"), coming-soon footer.
- `plans/TrackerTierTable.tsx`: monthly prices; footnote "5 savings checks, 10 audit checks…" → "track N imports… Billed monthly".
- `plans/ManagedTeaser.tsx`: legal wording ("We watch… audit every entry… Your broker files.").
- `hero/PricingHero.tsx`: Tracker row "Alerts, audits and savings · 10 free audit checks" → "Alerts and impact checks… track N free"; lead; annual note now Classify only.
- `estimator/Estimator.tsx`, `estimator/TrackerControls.tsx`, `estimator/EstimateSummary.tsx`: monthly Tracker prices; savings/audit allowances removed; the billing switch shows only when Classify is in the estimate.
- `guide/faqs.ts` (also FAQ JSON-LD): free-trial FAQ → "How do I start the Tariff Tracker free?"; "What's free" rewritten; annual answer says Classify only.
- `tariff-pricing/TariffPricing.tsx` (/duty-calculator band): "Unlock savings, alerts, and audits" → "Track your imports when you're ready"; billing switch hidden; "billed monthly".
- `app/pricing-calculator/page.tsx`: meta built from the constants ("track N imports with alerts and impact checks, then from $12/mo").

### /tariff-monitor (`components/tariff-monitor/`)

- `hero/MonitorHero.tsx`: "Check 5 imports for savings free" → "Track N imports free / Alerts and impact checks on each".
- `hero/ExposureDashboard.tsx`: KPI "Refundable found $212K" → "Impact checks run 57" (illustrative).
- `features/FeatureGrid.tsx`: intro and icons.
- `lib/copy.ts`: "Entry audit" feature → "Impact checks"; "Savings discovery" → "Export to CSV or Excel"; "what it costs" → "the change in %"; comparison row; cost FAQ.
- `pricing/MonitorPricing.tsx`: "watched, audited and optimized" → "tracked"; "save 15% annual" → "billed monthly" + coming-soon line.
- `cta/ClosingCta.tsx`: "track N imports free, with alerts and impact checks".

### Homepage (`components/home/`, `app/page.tsx`)

- `hero/HeroTicker.tsx`: H1 "Monitor & Audit your US Tariffs on Autopilot" → "Monitor Every Tariff on Your Imports"; lead.
- `command/CommandCenter.tsx`: only the monitoring pass renders (`ALL_LAYERS` filtered by the flags); savings/audit cells kept.
- `tools/ToolShowcase.tsx`: "Discover savings" and "Audit" sections gated; alert points and button "Get Alerts" → "Track N imports free".
- `pricing/PricingOverview.tsx`: Monthly / Annual switch hidden while `TRACKER_ANNUAL_ENABLED` is off (classification shows monthly); tier picker prices monthly; free and Tracker lists; "watched, audited and optimized" → "tracked"; "Check 5 imports for savings free" → "Track N imports free"; annual button gated; Managed blurb.
- `managed/ManagedSection.tsx`: legal wording throughout (watched, briefed, flagged for your broker; chat example "Worth asking your broker"); typo "Headcout" fixed.
- `lib/copy.ts` (also JSON-LD and llms.txt): DEFINITION; FAQ "Can HTS Hero find duty I overpaid?" → "How do I see how a new tariff affects my imports?"; cost FAQ; broker FAQ.
- `lib/offer.ts`: OFFER.note → "track N imports free, with alerts and impact checks".
- `app/page.tsx`: title "…Tariff Monitoring & Duty Audits" → "…Tariff Tracking for Your Imports"; description; audit/savings example fetches skipped while off.

### Compare, llms.txt, tariff updates, blog

- `libs/compare/tools/htsHero.ts`: "calculator and auditor" → "calculator and tariff tracker"; allowances, strengths and notes; export strength added.
- `libs/compare/features.ts`: row "Audit past entries by date" → "Duty on a past entry date" (shared by every tool).
- `app/llms.txt/route.ts`: Tracker, Tariff audit and Pricing lines.
- `components/tariff-updates/SubscribeForm.tsx`: "Find potential savings and audit what you paid" → impact checks.
- `components/tariff-updates/TrackerCta.tsx`: "Potential savings and entry audits" → "Impact checks"; "Alerts on up to 10 imports" → "Track up to N imports".
- `components/blog/cta/ctaContent.ts`: history CTA "Audit a past entry" → "See duty on a past date"; tracker CTA points and button "Track your imports free".

### Hardcoded "billed monthly" to revisit with annual

The home FAQ (`components/home/lib/copy.ts`), `libs/compare/tools/htsHero.ts` and `app/llms.txt/route.ts`.
