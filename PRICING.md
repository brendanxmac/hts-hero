# HTS Hero Pricing

The source of truth for what HTS Hero charges for and where an account is required. Follow it
for product code, plan copy, landing pages, comparison pages, blog FAQs, `llms.txt` and MCP
tools. If code or copy disagrees with this file, this file wins. Change this file first when
pricing changes.

_Last updated 2026-10-12._

## The rule

**Looking up a tariff is free. Watching, auditing and saving on your own products is paid.**

- The Tariff Calculator is 100% free: unlimited lookups, no account, no sign-up wall on a
  duty result, and available over MCP.
- **Duty over time** (how the duty on an entry changed) is free, with no account.
- A **free account** unlocks Analysis (the product's duty from every country of origin) and the
  **plain-English why** behind every result: why each tariff applies, what each adjustment would
  switch off, why other headings don't apply, and the full summary of the duty (its first
  sentence is free). They stay unlocked for every account, forever, whatever its plan.
- Two calculator tools that work out money for the user are **Tracker features** (trial or
  paid), teased in the calculator: the **qualification check** (which exemptions and trade
  programs the goods could qualify for, and the proof needed) and the **refund check** (what
  was paid on a past entry against the duty in force then: a refund to request through a
  broker, or an underpayment to correct).
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

### Free plan and the 14-day trial

Every account starts on the **free plan**. Any account can start a **14-day trial of the full
Tracker for up to 100 pairs** (everything in the $79 tier), once, whenever it wants. No credit
card. The trial is started by the user, not on sign-up: every premium feature in the Tracker
shows a teaser worked out from the user's own catalog (for example "$4,180 less duty per
shipment across 12 products" or "7 tariff changes hit your catalog since April") and one click
starts the trial there. When the trial ends without a paid plan, the account is back on the
free plan:

| | Free plan | Trial (14 days) | Paid tiers |
|---|---|---|---|
| Pairs tracked | 3 | Up to 100 | 30 / 100 / 500 / quoted |
| Monitoring + alerts | Yes | Yes | Yes |
| Rate history | No | Yes | Yes |
| Entry audit | No | Yes | Yes |
| Savings discovery | No | Yes | Yes |
| Qualification check | No | Yes | Yes |
| Refund check | No | Yes | Yes |

- After the trial, tracking stays on for 3 pairs and stops for the rest. Products stay in the
  catalog (nothing is deleted), so upgrading turns tracking back on.
- The pairs that stay tracked are the first 3 the user added (no picker).
- Every product in the catalog still shows its current duty: that's a lookup, and lookups are
  free. Tracking is what's limited.
- Signed-in users who open `/duty-calculator` go to the Tracker's Calculator tab, with their
  inputs kept: the Tracker is every account's home.
- Copy: "Start free", "Try up to 100 products free for 14 days", "Free for 3 products",
  "Start your 14-day trial". Never say every new account starts on a trial.

### Paid tiers

Priced by the number of **pairs** it watches. A pair is one HTS code from one country of
origin (6110.20.20 from China and from Vietnam is two pairs).

| Pairs | Price / month | Annual (per month) |
|---|---|---|
| Up to 30 | $49 | $44 |
| Up to 100 | $79 | $71 |
| Up to 500 | $149 | $134 |
| 500+ | Quoted ("Let's talk") | Quoted |

Annual prices are rounded down to the dollar (`monthlyRate`).

Included in every tier:

- Catalog: paste or upload products as CSV, with the current duty for each
- Monitoring and alerts when a tariff change hits a tracked product, and by how much
- Rate history for every tracked product
- Entry audit: log entries and flag over- and underpaid duty
- Savings discovery: lower-tariff origins, trade programs and exemptions
- Qualification check: which exemptions and trade programs the goods could qualify for
- Refund check: what was paid on a past entry against the duty in force then
- Reports and exports to share with the team
- Everything in the free Tariff Calculator

## Free tariff audit check (lead magnet)

The self-audit in the Tracker (Entry audit) is trial-or-paid, like every premium section: copy says "Audit free for 14 days". The two free paths on `/tariff-audit` are this one-time check and a requested audit.

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
| Tracker tiers $49 / $79 / $149 / quoted | Unchanged |
| No free Tracker | Free plan: 3 pairs, monitoring + alerts; 14-day reverse trial of 100 pairs |
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
- Tracker Stripe price IDs are placeholders (`STRIPE_TRACKER_*_PRICE_ID` env vars) until the
  prices are created in Stripe.
