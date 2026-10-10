# HTS Hero Pricing

The source of truth for what HTS Hero charges for and where an account is required. Follow it
for product code, plan copy, landing pages, comparison pages, blog FAQs, `llms.txt` and MCP
tools. If code or copy disagrees with this file, this file wins. Change this file first when
pricing changes.

_Last updated 2026-10-10._

## The rule

**Looking up a tariff is free. Watching, auditing and saving on your own products is paid.**

- The Tariff Calculator is 100% free: unlimited lookups, no account, no sign-up wall, and
  available over MCP.
- An account is required, and money is made, when HTS Hero works on **the user's own
  products**: alerts, monitoring, rate history for their catalog, entry audits and savings
  discovery. All of that is the Tariff Tracker.
- Classification is sold separately and is a secondary offer. Its plans are unchanged.

Prices are monthly list prices in USD. Annual billing takes **10% off** every plan
(`ANNUAL_DISCOUNT`). No contracts and published prices: start self-serve, no demo required.

## Tariff Calculator: free

| | |
|---|---|
| Price | $0, forever |
| Lookups | Unlimited |
| Account | Not required |
| Where | `/duty-calculator`, country pages, HTS code pages, MCP server |

Included:

- Every tariff, exemption and fee for any HTS code and country of origin
- Section 232, 301 and 122 tariffs, itemized with their legal source
- Trade preferences like USMCA and CAFTA-DR, plus MPF and HMF
- Compare countries and see how a duty changed over time (everything on `/duty-calculator`)
- MCP: anonymous calls work; only abuse rate limits per IP / OAuth client
  (see `MCP_DISTRIBUTION_PLAN.md`)

There is no paid Tariff Calculator plan. Never describe a lookup limit or an "unlimited
calculations" upgrade.

## Tariff Tracker: paid, account required

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
- Reports and exports to share with the team
- Everything in the free Tariff Calculator

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

- Does a free account get a small Tracker allowance (a few pairs) so the free-to-paid step is an
  account with a tracked product, as `MCP_DISTRIBUTION_PLAN.md` proposes? Undecided.
- Proposed, not confirmed: the Tracker's Analysis tab (one product's rate from every origin)
  counts as savings discovery and stays paid. `/duty-calculator` deliberately doesn't have it.
