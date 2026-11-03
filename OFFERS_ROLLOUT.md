> **Rebrand, 2026-11-01:** Tariff Tracker is now **Duty Guard** (`/duty-guard`). Offers: **Duty Guard
> Essentials** (was Tariff Alerts) and **Duty Guard Pro** (was Duty Audits: Essentials plus audits,
> savings and sourcing). Size is a product count (10, 25, 100, 500); Starter, Growth, Pro and Scale are
> gone as size names. Prices are unchanged. Tariff Alerts and Duty Audit stay as product names.
> `/duty-audit` replaces `/duty-audits`. Older wording below describes the same plans.

# Offers rollout: product, Stripe, calculator and emails

The sales pages (`/`, `/tariff-alerts`, `/duty-audit`) and the sign-up onboarding sell the new
offers. The product behind them doesn't yet. This is the checklist to close that gap, one item at a
time. PRICING.md is the source of truth for the offers (its DRAFT section). Tick items as they land,
and add new ones as they come up.

**What's sold:**
- **Tariff Alerts:** Starter (10 products, $9), Growth (25, $19), Pro (100, $39) and Scale (500, $79).
- **Duty Audits:** Starter $49, Growth $79, Pro $149 and Scale $299. Each includes the alerts plan of
  the same name.
- **Annual billing:** 15% off, rounded down.
- **Alert emails per plan:** Starter 1, Growth 3, Pro 6, Scale 20 (recipients, not logins).
- **Slack and Teams alerts:** on Pro and Scale only.
- **Trial:** 7 days of everything on up to 500 products, no card, starting at the first imports.
  After it, a free account keeps its whole catalog but gets no alerts, only a teaser email.
- **Guarantees:** 30-day money-back on alerts; the 10 Audit Money Back Guarantee on audits.

**What runs today:**
- **Plans:** 4 "Duty Guard" plans (10/30/100/500 at $12/$29/$89/$149) with launch pricing until
  Nov 13 (`TRACKER_TIERS`, `TRACKER_PLANS`, `LAUNCH_PRICING`).
- **Features:** every plan includes everything.
- **Stripe:** has none of the new prices.

## 0. Decide first

All decided by the user on 2026-10-31.

- [x] **What an Alerts plan unlocks vs a Duty Audits plan in Duty Guard:**
  - Alerts plans get alerts, impact checks and upcoming changes.
  - Duty Audits plans add Savings and Audits.
  - On an Alerts plan, those two tabs stay visible with a count of what they'd find, no details, and
    "Upgrade to Duty Audits".
- [x] **"Users / emails" means alert recipients only.** Each plan allows that many email addresses
      for alerts (Starter 1, Growth 3, Pro 6, Scale 20). There are no team logins or seats for now.
      Sales cards change to "Up to N alert emails".
- [x] **Trial end state: 0 products on alerts** (`TRIAL_ALLOWANCE.alertImports = 0`, was 3).
  - The catalog stays unlimited. "Track unlimited" is how we win accounts; alerts and audits are how
    we monetize them.
  - "Track this import" just adds that import to their list. It shows in the catalog with no alerts.
  - Free accounts still get a teaser email when a tariff action hits their imports: no impact check,
    no numbers, no details. Read as one email per tariff action (say if not).
- [x] **No buy-first checkout.** Every plan purchase happens signed in, from Duty Guard. The emails'
      "straight to checkout" button signs them in, then opens checkout. The webhook's account
      creation stays for other products such as Classify.
- [x] **Old plans:** assume no subscribers. Keep the old price → plan mapping as a safety net (anyone
      found keeps their price and full access) and archive the old prices. Nobody is moved.
- [x] **How the guarantees run:**
  - Both are manual: the customer emails and we refund in Stripe.
  - The 10 Audit count covers the 30 days after purchase; trial audits don't count. It shows in
    `/admin`.
- [x] **The free "Starter" is now "Tariff News".**
- [x] **`/tariff-monitor` redirects to `/tariff-alerts`** (301). **`/pricing-calculator` stays and is
      completely redone** in the new cinematic design as an extremely compelling sales page. The
      goal: show the numbers, then get people to start their trial ("try before you buy").

## 1. Stripe (sandbox first, then live)

Sandbox done 2026-10-31 (`npm run stripe:setup-offers`, then `npm run stripe:check-tracker`). The
items below stay open until they're done in live too, with `--live` and the live key.

- [x] **8 products, 16 prices (sandbox redone after the rename and live done 2026-11-03):**
  - The products: Tariff Alerts Starter / Growth / Pro / Scale, and Duty Audits Starter / Growth /
    Pro / Scale.
  - Each has a monthly and an annual price.
  - Lookup keys like `alerts_<10|25|100|500>_<monthly|annual>` and `audits_…`.
  - Metadata: `plan`, `billing`, `version`.
- [x] **Billing portal configuration (sandbox done; live `bpc_1UXZCkGk1gnudBErKy5bwhkj` created 2026-11-03, the default config untouched):**
  - Switch tier within an offer, and switch between Alerts and Duty Audits.
  - Upgrades invoice now; downgrades and cancellations take effect at period end.
  - List all 8 products.
- [x] **Archive the old Duty Guard prices (sandbox done).** Live: decided 2026-11-03 to keep them active, just in case (no open subscriptions; checkout uses the new lookup keys). `stripe:check-tracker` shows ✗ on that line in live, as expected. Keep their mapping as the safety net (see 0).
- [x] **Check live Stripe for active Duty Guard subscriptions** (2026-11-03: none on the 4 `tracker_*` prices). The local key
      is sandbox only, and Mixpanel's empty `Purchase Completed` is weak proof. Anyone found is
      grandfathered.
- [x] **Update `npm run stripe:check-tracker`** to check the new set (products, prices, lookup keys,
      metadata, portal).
- [x] **Live webhook events** (checked 2026-11-03, all enabled on htshero.com/api/webhook/stripe): `checkout.session.completed`, `checkout.session.expired`,
      `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`,
      `invoice.payment_failed`.
- [ ] **Live Classify prices match the site** (decided 2026-11-03: keep live Classify prices as they are for now) ($39 / $89; the sandbox has $29 / $80). Carried over
      from PRE_DEPLOY.md.

## 2. Plans in the code

- [x] **`PricingPlan` entries for the 8 plans**, replacing `TRACKER_PLANS` / `TRACKER_TIERS`.
      `libs/tariff-tracker/plan.ts` reads `ALERT_TIERS` / `AUDIT_TIERS`
      (`components/pricing-calculator/lib/pricing.ts`).
- [x] **`libs/tariff-tracker/prices.ts`:** new lookup keys, and price → plan mapping for both offers
      (`trackerPlanForPriceId`, `isTrackerPlan`).
- [x] **Entitlements per plan:**
  - Product cap: 10 / 25 / 100 / 500. The old plans had 30 where the new ones have 25.
  - Savings and Audits on Duty Audits plans only.
  - Slack and Teams on Pro and Scale only.
  - Alert emails limit: several recipients per account instead of today's one `prefs.email`,
    capped by plan.
- [x] **Free accounts drop to 0 alert products:** `TRIAL_ALLOWANCE.alertImports = 0`, the teaser
      email in `libs/tariff-updates/alerts.ts` (no impact check, numbers or details), and impact
      checks reduced to a count. Old-plan subscribers keep full access.
- [x] **The trial grants Duty Audits on 500 products for 7 days.** `REVERSE_TRIAL.shortFrom` is 2026-11-03 (trials from that day get 7; earlier ones keep 14). Was: set `REVERSE_TRIAL.shortFrom` to the
      deploy day (now `2026-11-01`).
- [x] **Remove launch pricing everywhere:** off and annual billing on (`launchPricingActive` is always
      false, `TRACKER_ANNUAL_ENABLED` is true). `LAUNCH_PRICING`, the countdown and `nextPrices` come
      out of the code with Duty Guard screens (3) and old pages (4).
- [x] **Checkout API** (`app/api/stripe`):
  - Takes the new plan and billing.
  - Refuses Alerts and Duty Audits plans without an account, sending them to sign-in.
  - Success lands back in Duty Guard with the plan applied and a "you're on X" confirmation.
- [x] **Webhook:** stores the new plan on the account, and handles upgrade, downgrade, switching offer,
      cancel and failed payment.
- [x] **Record audits on paid plans** (`app/api/tracker/checks/route.ts`,
      `TrackerAccessProvider.tsx` skip it today), and show an account's count for its first 30 days
      after purchase in `/admin`, for the 10 Audit guarantee.
- [x] **Mixpanel:** `Purchase Completed` carries offer, plan, billing, and whether the purchase came
      during the trial or after it.

## 3. In Duty Guard: upgrades and conversion

- [x] **Plans dialog** (`components/tariff-tracker/access/UpgradeDialog.tsx`):
  - The two offers, 4 plans each, with the monthly/annual toggle (same `PlanPricing` cards as the
    sales pages).
  - The plan that fits their product count is preselected.
  - The guarantee shows under the prices.
  - Copy says "products".
- [x] **Plan card** (`components/tariff-tracker/plan/PlanCard.tsx`): new plan names, products used
      vs the limit, and Upgrade.
- [x] **Limit dialog** (`access/LimitDialog.tsx`): adding past the plan's products offers the next
      plan up.
- [x] **Trial screens** (`plan/trial.tsx`):
  - "Free Trial · 7 days, starts when you add your imports".
  - The last days' banner, and the "Here's what you'll lose" dialog listing alerts, impact checks,
    savings and audits.
  - The ended state, with "Get it all back" opening the plans.
- [x] **Alerts-plan gates:** Savings and Audits show what they'd find (a count, no details) with
      "Upgrade to Duty Audits".
- [x] **Slack/Teams gate** on Starter and Growth: the settings show them locked, with "Available on
      Pro".
- [x] **`imports/ImportsTable.tsx`** and anything else reading `TRACKER_TIERS`: move to the new
      plans.

- [x] **Alert emails in Duty Guard's settings:** add and remove addresses up to the plan's limit
      (`extra_emails`). Sending already caps them.
- [x] **Tariff News in Slack/Teams** (`libs/email/news-producer.ts`) stops on plans without them too,
      so the gate is consistent. The Tariff News emails stay free.
- [x] **Free accounts get the same Savings and Audits count teaser as Alerts plans,** and the sidebar
      shows a count, not a dollar figure, on both.

## 4. Pages still selling the old plans

- [x] **`/pricing-calculator`: full redesign** (2026-10-31): staircase hero, real numbers, the free
      calculator and unlimited tracking, Free / Alerts / Audits cards with a slider, classification
      plans, trial timeline, comparison, FAQs and a price calculator at the end (`#calculator`).
      `components/pricing-calculator/sales/`. The old estimator is gone.
- [x] **Classify is monthly only for now** (decided 2026-10-31): Stripe has no annual Classify prices.
- [x] **`/duty-calculator`'s pricing section** uses the homepage's `PricingOverview` instead of the old
      Duty Guard plans.
- [ ] **Search Console check for `/pricing-calculator`:** its copy and title changed, and shared quote
      links (`?...#estimate`) now open the plain page.
- [x] **`/tariff-monitor`:** 301 to `/tariff-alerts` in `next.config`, fix internal links (Footer,
      ToolsDropdown, the rest), and retire `MonitorPricing` and unused components. `monitorFacts`
      is still used by `app/page.tsx`. Check its Search Console data first and carry over anything
      that ranks.
- [x] **Sales cards:** "Up to N users / emails" becomes "Up to N alert emails" (`PlanPricing.tsx` done;
      FAQs to check).
- [x] **Copy that promises free alerts on 3 products** (sales pages, FAQs, emails, trial screens):
      change to the free catalog with no alerts.
- [x] **`app/llms.txt`**, MCP tool descriptions, and **compare pages**
      (`libs/compare/tools/htsHero.ts`, `components/compare/cta/SelfServeCta.tsx`).
- [x] **`components/ui/marketing/comingSoon.ts`** and any FAQ, blog or page copy that still says
      14 days, 200 imports, launch pricing, or "Duty Guard" plans.
- [x] **PRICING.md:**
  - Move the DRAFT section into "The rule" once built.
  - Remove the stale lines (14 days / 200 imports, "no trial").

## 5. Duty calculator: upsells and conversion

- [x] **One button: "Track all your recent searches."**
  - Signed out: sign-up, then the onboarding, then Duty Guard with the recents already added (the
    trial starts).
  - Signed in: adds them straight in.
  - Today `RecentLookupsTable` has "Track all N free". Rework it, and put the button where recent
    searches show in the calculator workspace too.
- [x] **"Track this import"** (`CalculatorWorkspace.tsx`, `ComparePanel.tsx`): through sign-up, and
      that import lands in their list. It's free and unlimited, with no alerts after the trial.
- [x] **`ConversionDialog.tsx`:** the new offer and trial (7 days, alerts + audits, products).
- [x] **Country hubs** (`countries/HubCtas.tsx`): "Track all your products" and the `TRY_IT_FREE`
      button.
- [x] **`/hts` code pages:** the Watch / track button, same path.
- [x] **Every calculator CTA goes through `EntryCta`** with its own entry point (`from=calculator…`),
      so the onboarding routes it and Mixpanel can tell them apart.
- [x] **Check against "calculator CTAs aim for accounts":** the button asks for an account, and the
      trial starts by itself when the searches land as imports.

## 6. Email sequences (new offers and the 7-day trial)

The rules for every email:
- Value first.
- One CTA into the product.
- Rates in % (never $).
- "Products" in sales copy.
- Savings "could / may".
- Everything goes through the `/email-outbox`.
- The trial starts at the first imports, never at sign-up.

Code: `libs/email/lifecycle.ts`, `emails/`.

- [x] **Per-entry welcome after sign-up:** hero / audit / alerts / savings / closing / sales pages /
      calculator / classify. Each points back to what they came for.
- [x] **Signed up, no imports yet:** rewrite `tracker_no_imports_1/2/3` for the new import flow
      (`?setup=add` links, the spreadsheet upload).
- [x] **Trial started** (first imports): what's now on (alerts, impact checks, savings, audits), and
      `first_look` with their numbers.
- [x] **During the trial:** an education series retimed for 7 days (e.g. day 2, 4, 6).
- [x] **Trial ending:** retime `trial_ending_3` / `trial_ending_1` for a 7-day trial.
  - What they'll lose, and the plan that fits their product count.
  - A button straight to checkout.
- [x] **Trial ended:** `trial_ended`, then win-back about day 7 and day 14 after.
- [x] **After purchase:** welcome to the plan and the guarantee. Alerts subscribers then get a
      Duty Audits upsell series.
- [x] **Classification onboarding sequence** (the `classify` entry): first classification, report,
      free classifications left.
- [x] **Free teaser alert email:** a tariff action hit your imports, with no numbers or details, and
      one CTA to upgrade.
- [x] **`emails/kit/parts.tsx` `PlanStrip`:** the new plans and trial instead of the old tiers.

## 7. Before release

- [ ] **First real send check:** watch `/email-outbox` on the first days after deploy. The new lifecycle
      emails are autosent batches, like the existing ones.
- [ ] **Run `supabase/migrations/tracker_alert_emails.sql` in prod** (dev done 2026-10-31) before this deploys:
      impact alerts read `extra_emails` and fail without it.
- [x] **`/duty-guard` launch check for the plan flow:** `scripts/stripe/test-plan-flow.ts` runs a
      real sandbox checkout, switches and cancel. Run it again on the final code.

- [ ] **Sandbox end to end** (dev done 2026-10-31; repeat a quick pass on the Vercel preview):
  - Sign up from each entry, add imports, and the trial starts.
  - Upgrade to each offer, monthly and annual.
  - Switch Alerts → Duty Audits, cancel, refund.
- [ ] **Run the checks:** `npm run tests`, `npx tsc --noEmit -p .`, `npm run build`. Then a Vercel
      preview click-through.
- [x] **PRE_DEPLOY.md:** replace its old Stripe item (four Duty Guard products, $12–$149) with section 1
      here.
