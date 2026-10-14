# HTS Hero Pricing

The source of truth for what HTS Hero charges for and where an account is required. Follow it
for product code, plan copy, landing pages, comparison pages, blog FAQs, `llms.txt` and MCP
tools. If code or copy disagrees with this file, this file wins. Change this file first when
pricing changes.

_Last updated 2026-10-13._

## The rule

**Looking up a tariff is free. Watching, auditing and saving on your own products is paid.**

- The Tariff Calculator is 100% free: unlimited lookups, no account, no sign-up wall on a
  duty result, and available over MCP.
- **Duty over time** (how the duty on an entry changed) is free, with no account.
- A **free account** unlocks Analysis (the product's duty from every country of origin) and the
  **plain-English why** behind every result: why each tariff applies, why other headings don't
  apply, and the full summary of the duty. What each possible adjustment would change is free
  for everyone; working out which adjustments the goods qualify for is the Tracker's
  qualification check. They stay unlocked for every account, forever, whatever its plan.
- Two calculator tools that work out money for the user are **Tracker features**, teased in the
  calculator and free to try with every account's usage allowance: the **qualification check**
  (which exemptions and trade programs the goods could qualify for, and the proof needed; part
  of a product's **savings check**) and the **refund check** (what was paid on a past entry
  against the duty in force then: a refund to request through a broker, or an underpayment to
  correct; each one is an **audit check**).
- An account is required, and money is made, when HTS Hero works on **the user's own
  products**: alerts, monitoring, rate history for their catalog, entry audits and savings
  discovery. All of that is the Tariff Tracker.
- Classification is sold separately and is a secondary offer. Its plans are unchanged.

Prices are monthly list prices in USD. Annual billing takes **15% off** every plan
(`ANNUAL_DISCOUNT`). No contracts and published prices: start self-serve, no demo required.

## Tariff Calculator: free

| | |
|---|---|
| Price | $0 |
| Lookups | Unlimited |
| Account | Not required for duty results or Duty over time; a free account unlocks Analysis and the plain-English why |
| Where | `/duty-calculator`, country pages, HTS code pages, MCP server |

Included:

- Every tariff, exemption and fee for any HTS code and country of origin
- Section 232, 301 and 122 tariffs, itemized with their legal source
- Trade preferences like USMCA and CAFTA-DR, plus MPF and HMF
- Compare countries side by side
- Duty over time
- With a free account: Analysis (duty from every origin) and the plain-English why
- Teased, in the Tracker's plans: the qualification check and the refund check
- MCP: anonymous calls work; only abuse rate limits per IP / OAuth client
  (see `MCP_DISTRIBUTION_PLAN.md`)

There is no paid Tariff Calculator plan. Never describe a lookup limit or an "unlimited
calculations" upgrade.

## Tariff Tracker: account required

### Usage-based trial: every account, no time limit

There is **no time-limited trial**. Every account is on the trial from the moment it signs up
(nothing to start, no credit card) and keeps it until it pays. The trial is a **usage
allowance** that never resets (`TRIAL_ALLOWANCE` in `components/pricing-calculator/lib/pricing.ts`):

| | Trial (every account) | Paid tiers |
|---|---|---|
| Catalog (upload the whole thing) | Unlimited | Unlimited |
| Overview insights across the whole catalog | Yes | Yes |
| Rate history, Sourcing | Yes, whole catalog | Yes, whole catalog |
| Alerts | On up to 10 imports | On every covered import |
| Savings checks (incl. the qualification check) | 5 imports | Every covered import |
| Audit checks (entry audit, refund check) | 10 entries | Unlimited |

- **An import** is one HTS code from one country of origin (a "pair": 6110.20.20 from China and
  from Vietnam is two imports).
- **A savings check** reveals every way to save on one import: trade programs, lower-duty
  origins, exemptions worth checking and the qualification check. A check, once spent, stays
  unlocked for that import; it can't be moved to another one.
- **An audit check** checks what was paid on one past entry against the duty in force on its
  entry date (the entry audit and the calculator's refund check are the same check). Checking the
  same entry again is free.
- **Alerts** cover up to 10 imports on the trial (the user's picks in the catalog's Alerts column,
  else the highest-duty); those slots can be moved at any time.
- When an allowance runs out, that feature needs a paid plan. Users can upgrade at any time.
- **The whole catalog, always.** Any account can add its entire product catalog (paste or CSV)
  at any time, with no cap. Every product shows its current duty (a lookup), its rate history and
  sourcing, and the Overview works across all of it.
- **Tease the rest, constantly**: the Tracker works out potential savings across the whole
  catalog and shows what checking the rest could find ("Savings found" on unchecked products;
  "potential savings found on N products you haven't checked").
- Signed-in users who open `/duty-calculator` go to the Tracker's Calculator tab, with their
  inputs kept: the Tracker is every account's home.
- Copy: "Start free", "Check 5 imports for savings free", "10 free audit checks", "Free alerts
  on 10 imports", "No credit card". Never mention a 14-day (or any time-limited) trial.

### Paid tiers

Priced by the number of **imports** (pairs) a plan covers: alerts and savings on each one, and
unlimited audit checks.

| Imports | Price / month | Annual (per month) |
|---|---|---|
| Up to 10 | $19 | $16 |
| Up to 30 | $49 | $41 |
| Up to 100 | $149 | $126 |
| Up to 500 | $249 | $211 |
| 500+ | Quoted ("Let's talk") | Quoted |

Annual prices are rounded down to the dollar (`monthlyRate`). The $19 plan is for smaller
importers with fewer than 10 imports.

Included in every tier:

- Catalog: paste or upload products as CSV, with the current duty for each
- Monitoring and alerts when a tariff change hits a covered import, and by how much
- Rate history and Sourcing for the whole catalog
- Savings discovery on every covered import: lower-tariff origins, trade programs and exemptions,
  with the qualification check
- Entry audit and refund checks: unlimited audit checks, flagging over- and underpaid duty
- Reports and exports to share with the team
- Everything in the free Tariff Calculator

## Free tariff audit check (lead magnet)

The self-audit in the Tracker (Entry audit) uses audit checks: 10 free with every account, unlimited on a paid plan. Copy says "10 free audit checks". The two free paths on `/tariff-audit` are this one-time check and a requested audit.

The audit landing page offers a free, one-time overpayment check: the importer shares entry data
and gets a report of likely over- and underpaid duty. It is a lead, not a plan: no price is
published. HTS Hero finds and documents; filing corrections, protests or refunds goes through the
importer's licensed customs broker or counsel (that filing is customs business).

## Classification: unchanged, secondary

| Plan | Price / month | Includes |
|---|---|---|
| Starter | $39 | 10 classifications / month; legally defensible classifications; validate with CROSS rulings; reduce audit exposure |
| Pro | $89 | Up to 100 classifications / month; everything in Starter; audit existing classifications; one-click classification reports; catch tariff changes before they cost you |
| Team | $429 | One shared workspace; review & approve each other's work; find issues in your current catalog; onboarding & training. For teams classifying 30+ products / month. Set up with our team. |
| Licenses | $60 / person | Separate Pro accounts per person, without the shared workspace. From 8 people, Team costs less. |

## What changed from `/pricing-calculator` (2026-10-10)

| Before | Now |
|---|---|
| Free plan: 20 duty calculations / month | Unlimited, no account |
| Tariff Calculator plan: $14.99/mo for unlimited calculations | Removed; the calculator is free |
| "Compare countries and duty over time" sold with the $14.99 plan | Free in the calculator |
| Tariff Tracker "includes the Tariff Calculator" as a perk | The calculator is free for everyone; drop the perk |
| Tracker tiers $49 / $79 / $149 / quoted | $19 (10) / $49 (30) / $149 (100) / $249 (500) / quoted (2026-10-13) |
| No free Tracker | Usage-based trial for every account (2026-10-13): 5 savings checks, 10 audit checks, alerts on 10 imports |
| Classification plans | Unchanged |

Code and copy that still state the old pricing (as of 2026-10-10):

- `components/pricing-calculator/lib/pricing.ts`: `TARIFF_CALCULATOR_PRICE`,
  `FREE_MONTHLY_CALCULATIONS`, the calculator line in `lineItems`
- `components/pricing-calculator/tariff-pricing/TariffPricing.tsx` and `plans.ts`: Free and
  Starter cards
- `components/pricing-calculator/plans/TariffPlans.tsx`, `hero/PricingHero.tsx`,
  `estimator/Estimator.tsx`
- `components/pricing-calculator/guide/faqs.ts`: "Is the Tariff Calculator included with
  Tariff Tracker?"
- `app/pricing-calculator/page.tsx`: meta description ("Tariff Calculator from $14.99/mo")
- `components/compare/cta/SelfServeCta.tsx` and `libs/compare/tools/htsHero.ts`: compare pages
- `content/blog/how-us-tariffs-are-calculated.mdx` and `content/blog/what-are-tariffs.mdx`:
  FAQ answers saying "free for up to 20 lookups a month"
- Any calculator usage limit or sign-in gate (check `libs/anonymous-token.ts`)

## Open questions

- Decided 2026-10-11: Analysis (one product's rate from every origin) needs a free account,
  not a paid plan, in the calculator and the Tracker alike. Savings (opportunities across the
  whole catalog) is the paid feature.
- Tracker Stripe price IDs are placeholders (`STRIPE_TARIFF_TRACKER_<10|30|100|500>_<MONTHLY|ANNUAL>_PRICE_ID`
  env vars) until the prices are created in Stripe.
- Decided 2026-10-13: the 14-day trial and the 3-pair free plan are gone. Every account gets a
  lifetime usage allowance instead (above). Rate history and Sourcing are free for every account.
- Allowances are enforced by `/api/tracker/checks` (it records each spent check in
  `tracker_checks`), but the results are worked out in the browser, as the teasers are.
