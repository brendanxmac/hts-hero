> **Rebrand, 2026-11-01:** Tariff Tracker is now **Duty Guard** (`/duty-guard`). Offers: **Duty Guard
> Essentials** (was Tariff Alerts) and **Duty Guard Pro** (was Duty Audits: Essentials plus audits,
> savings and sourcing). Size is a product count (10, 25, 100, 500); Starter, Growth, Pro and Scale are
> gone as size names. Prices are unchanged. Tariff Alerts and Duty Audit stay as product names.
> `/duty-audit` replaces `/duty-audits`. Older wording below describes the same plans.

# HTS Hero Pricing

The source of truth for what HTS Hero charges for and where an account is required. Follow it
for product code, plan copy, landing pages, comparison pages, blog FAQs, `llms.txt` and MCP
tools. If code or copy disagrees with this file, this file wins. Change this file first when
pricing changes.

_Last updated 2026-10-31: the offers below are what the product sells. Older history is in git._

## The value ladder

**The ladder: Free → Tariff Alerts → Duty Audits.** Managed sits beside it for done-for-you
accounts. Each paid offer is the next thing a user wants after the one below it. A visitor looks up a duty and
tracks their products for free. An alert shows how a product was hit. That leads to "was I charged
right, and am I overpaying?", which Duty Audits answers.

### The offers

| | Who | Price | What it is |
|---|---|---|---|
| **Duty Calculator** | Anyone, no account | Free | Unlimited lookups, every tariff itemized with its source |
| **Tariff News** (emails; called Starter until 2026-10-31) | Anyone, just an email | Free | An email on every new US tariff action (CBP, Federal Register, USTR, USITC, White House). Never mentioned on the Tariff Alerts page |
| **Duty Calculator Plus** | Free account | Free | The calculator for signed-in users: the plain-English why, Analysis (duty from every origin), the AD/CVD check, sourcing intelligence, and an unlimited catalog with rate history and export |
| **Tariff Alerts** | Importers | Tiered by imports | "Get alerted when new tariffs affect your imports, and instantly see how you're affected" |
| **Duty Audits** | Importers | Tiered by imports | "Stop overpaying on US imports." Everything in Alerts, plus an audit of every entry and savings detection |
| **Duty Audits for partners** | Brokers, 3PLs, freight forwarders | Demo, from a published "from" price | Duty Audits for every US importer client, from one account |
| **Managed Tariffs** | Importers who want it done for them | Unchanged (see HTS Hero Managed) | We run it for them |

A **product** is one HTS code from one country of origin (internally a "pair" or "import"; customer
copy says **product** since 2026-10-29: "imports" confused buyers). Copy translates it for people
who think in SKUs: "most catalogs have far fewer products than SKUs: 40 SKUs of the same screw from
China is 1 product". Every place a count is sold (cards, FAQs, footnotes) defines it once.

**Import lists (2026-11-06):** a Duty Guard account can keep several named lists of imports (one per
client, for brokers and forwarders). Each list keeps its own copy of an import and its settings, but
the plan counts each HTS code + country **once across all lists**: the same code from China in two
clients' lists is 1 import. Alerts and impact checks cover every list; Duty Guard shows one list at a time.

### What each paid offer includes

**Tariff Alerts** ("Get alerted when new tariffs affect your imports, and instantly see how
you're affected"):
- Alerts when a tariff action hits a tracked import, with the rate before → after (+X%) and the
  official source, AD/CVD alerts and updates included
- Alerts by email, in Duty Guard, and in Slack or Microsoft Teams
- **Impact checks:** any tariff action, and exactly how it hits each import. This is the one thing
  held back from free users: the answer to "how am I affected by new tariffs?" Free accounts see
  only a count ("this may affect 12 of your imports")
- The upcoming changes already announced for their imports
- Everything free: Duty Calculator Plus (Insights and the AD/CVD check included) and the Tariff
  News emails

**Duty Audits** ("Stop overpaying on US imports"):
- Everything in Tariff Alerts
- **Entry audit:** check every entry on the tracked imports against the duty in force on its date,
  flagging possible over- and underpayments. Entries are keyed in today; ES-003 and 7501 upload are
  **coming soon** (copy may say "coming soon", never that it's live)
- **Savings detection:** trade programs, exemptions and lower-duty origins each import may qualify
  for, with the qualification check and the proof needed
- **Hand-off:** a findings report to send their team or broker, or let them use the tool directly.
  HTS Hero finds, flags and explains; the importer's licensed broker decides and files
- **Keep 100% of what you find.** No contingency fee, unlike recovery firms that typically keep
  15–30%. (Always "could", "may", "up to": never a promised saving.)

**Duty Audits for partners** (brokers, 3PLs, freight forwarders):
- One account with a workspace per US importer client, Duty Audits on each client's imports, and
  alerts the partner can pass on to the client
- Sold through a short demo, booked straight away on Calendly (`config.bookCallUrl`). The page
  shows a "from" price so it doesn't feel like a black box
- A flat licence by client count. Never paid per transaction, and never anything tied to filings

### Prices (confirmed 2026-10-27)

| Imports | Tariff Alerts | Annual (per month) | Duty Audits | Annual (per month) |
|---|---|---|---|---|
| Up to 10 | $9 (Starter) | $7 | $49 (Starter) | $41 |
| Up to 25 | $19 (Growth) | $16 | $79 (Growth) | $67 |
| Up to 100 | $39 (Pro) | $33 | $149 (Pro) | $126 |
| Up to 500 | $79 (Scale) | $67 | $299 (Scale) | $254 |
| 500+ | Quoted | Quoted | Quoted | Quoted |

**The one-week reverse trial.** Every new account gets Tariff Alerts and Duty Audits, everything the
Duty Guard sells, free for **7 days** on up to 500 products, with no card, from its first imports. Then
a plan to keep it; without one, the catalog stays free and alerts, audits and savings stop
(`TRIAL_ALLOWANCE.alertImports` is 0). Trials that started before `REVERSE_TRIAL.shortFrom` keep
their 14 days. Every button on `/`, `/tariff-alerts`, `/duty-audit` and `/pricing-calculator` starts
it: sign-up, then the onboarding, then Duty Guard's import flow. The plan cards' buttons say "Start
Free Trial" ("Free for 7 days · No credit card required" under them; the 500-product cap stays out of the copy).

**Plans.** Each Tariff Alerts plan is **Tariff Alerts [plan]**: Starter, Growth, Pro, Scale
(`ALERT_TIERS`). **Alert emails per plan:** Starter 1, Growth 3, Pro 6, Scale 20 (recipients, not
logins). **Slack & Microsoft Teams alerts are on Pro and Scale only**; a plan lists only what it has.
30-day money-back guarantee.

**Duty Audits mirror the alerts plans (2026-10-28).** Duty Audits Starter, Growth, Pro and
Scale (`AUDIT_TIERS`): the same products and alert emails as the alerts plan of the same name, each
including that alerts plan, Slack & Teams on Pro and Scale. Same cards and logic as
`/tariff-alerts` (shared `PlanPricing`), and the **10 Audit Money Back Guarantee** under the prices: "If you do 10 audits on your imports within 30 days and are
not satisfied with the results, we'll give you a full refund." "One audit can pay for your whole
year" (one flagged entry vs a year of Starter) sits right above the plans.

Annual is **15% off** (`ANNUAL_DISCOUNT`), rounded down to the dollar (`monthlyRate`), on both
offers. Classification is monthly only for now.

**Struck-through prices stay** on the pricing pages, for the savings effect, but only against a
price we really charge (FTC Guides Against Deceptive Pricing, 16 CFR 233: a crossed-out "former"
price must be one actually offered for a reasonable time). The new prices have never been charged
at anything higher, so:
- **On the Annual toggle:** strike through the monthly price and show the annual price per month,
  plus "Save 15%" (e.g. ~~$39~~ $33/mo, billed yearly).
  `/tariff-alerts` doesn't (2026-10-28): it shows the annual price per month with "Save 15%" on the
  toggle and a quiet "$X billed yearly" under the per-import price.
- **Everywhere:** never invent a higher "list" or "regular" price to cross out. A real time-limited
  discount later (e.g. a refund-event offer) may strike through the normal price while it runs.

**Partners:** from $299/mo with up to 10 importer clients (Duty Audits on up to 100 imports
each), then $25 per client per month. Larger books are quoted on the demo.

### Decided 2026-10-27

1. **Savings detection** is in Duty Audits.
2. **The AD/CVD check** is in Duty Calculator Plus (free account). **Impact checks**
   are in Alerts: the only thing held back from free users is the answer to "how am I affected by
   new tariffs?"
3. **The trial:** see above (one week since 2026-10-30).
4. **Annual billing** is on for both offers, 15% off.
5. Struck-through prices stay, within the rule above.
6. **Team features:** Slack/Teams alerts are in Tariff Alerts Pro and Scale (100+ imports) (moved from Audits 2026-10-28: they're how alerts arrive). Duty Audits plans have the same users / emails as the alerts plan of their name (2026-10-28; seats are no longer an Audits-only extra).
7. **`/tariff-audit`** stays as it is for now; the whole page gets overhauled soon.
8. **Partner demos** use the existing 30-minute Calendly (`config.bookCallUrl`).
9. **Copy:** ES-003/7501 upload is "coming soon" until it's live. The Audits headline is "Stop
   overpaying on US imports", never "Never overpay".
10. **One-time audits** (historical audits of past entries) are booked on a call from the `/tariff-audit` hero and closing buttons; the row under the plans is off for now (2026-10-28). Before that, they were left out for now. They come later as custom landing pages and one-off
    offers around big tariff refund events.

### Decided 2026-10-31 (these win over anything above or below)

1. **Alerts vs Duty Audits in Duty Guard:** Alerts plans get alerts, impact checks and upcoming
   changes. Duty Audits plans add Savings and Audits. On an Alerts plan those tabs stay visible with
   a count of what they'd find, no details, and "Upgrade to Duty Audits".
2. **"Users / emails" means alert recipients.** Starter 1, Growth 3, Pro 6, Scale 20 email addresses
   for alerts. No team logins or seats for now. Copy says "alert emails", never "users".
3. **After the trial, free accounts get alerts on 0 products** (was 3). The catalog stays unlimited:
   tracking is free and wins the account, and alerts and audits are the upsell. "Track this import"
   adds the import to their list, with no alerts after the trial. When a tariff action hits their
   imports they still get a teaser email (one per tariff action), with no impact check, numbers or
   details.
4. **No buy-first checkout.** Plans are bought signed in, from Duty Guard.
5. **Old Duty Guard plans:** none assumed. The price mapping stays as a safety net, and anyone
   found keeps their price and full access.
6. **Guarantees are manual:** the customer emails and we refund in Stripe. The 10 Audit Money Back
   Guarantee counts audits in the 30 days after purchase, not the trial's.
7. **The free "Starter" is renamed Tariff News.**
8. **`/tariff-monitor` redirects to `/tariff-alerts`. `/pricing-calculator` is redone** as a cinematic
   sales page: show the numbers, then start the trial ("try before you buy").

## The rule

**Looking up a tariff and tracking your products are free. Alerts, audits and savings on them are paid.**

- The Tariff Calculator is 100% free: unlimited lookups, no account, no sign-up wall on a
  duty result, and available over MCP.
- **History, Compare and News** in the calculator take a free account (2026-10-31): each tab shows a
  teaser with its own numbers, and sign-up runs through the onboarding back to the same spot.
- A **free account** unlocks Analysis (the product's duty from every country of origin), the
  **AD/CVD check** on any import (the antidumping and countervailing duty cases and new petitions
  that may cover it, their rates and suppliers; decided 2026-10-22) and the
  **plain-English why** behind every result: why each tariff applies, why other headings don't
  apply, and the full summary of the duty. What each possible adjustment would change is free
  for everyone; working out which adjustments the goods qualify for is Duty Guard's
  qualification check. They stay unlocked for every account, forever, whatever its plan.
- Two calculator tools that work out money for the user are **Duty Guard features**, teased in the
  calculator and free to try in every account's trial: the **qualification check**
  (which exemptions and trade programs the goods could qualify for, and the proof needed; part
  of a product's **savings check**) and the **refund check** (what was paid on a past entry
  against the duty in force then: a refund to request through a broker, or an underpayment to
  correct; each one is an **audit check**).
- An account is required, and money is made, when HTS Hero works on **the user's own
  products**, beyond tracking them: alerts, impact checks, entry audits and savings discovery. The
  Duty Guard is the app they all run in; tracking any number of products in it is free.
- Classification is sold separately and is a secondary offer. Its plans are unchanged.

Prices are monthly list prices in USD. Annual billing takes **15% off** every Tariff Alerts and Duty
Audits plan (`ANNUAL_DISCOUNT`). No contracts and published prices: start self-serve, no demo required.

## Tariff Calculator: free

| | |
|---|---|
| Price | $0 |
| Lookups | Unlimited |
| Account | Not required for duty results; a free account unlocks History, Compare, News, Analysis and the plain-English why |
| Where | `/duty-calculator`, country pages, HTS code pages, MCP server |

Included:

- Every tariff, exemption and fee for any HTS code and country of origin
- Section 232, 301 and 122 tariffs, itemized with their legal source
- Trade preferences like USMCA and CAFTA-DR, plus MPF and HMF
- With a free account: Duty over time, compare countries side by side, News, Analysis (duty from every origin) and the plain-English why
- Teased, in Duty Audits: the qualification check and the refund check
- MCP: anonymous calls work; only abuse rate limits per IP / OAuth client
  (see `MCP_DISTRIBUTION_PLAN.md`)

There is no paid Tariff Calculator plan. Never describe a lookup limit or an "unlimited
calculations" upgrade.

## Who gets what in Duty Guard

| | Visitor (no account) | Free account | 7-day trial | Tariff Alerts | Duty Audits |
|---|---|---|---|---|---|
| Tariff Calculator | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |
| History (Duty over time), Compare | Teased | Yes | Yes | Yes | Yes |
| Calculator extras (the why, Overview, News) | Teased | Yes | Yes | Yes | Yes |
| AD/CVD check on any product | Teased: the real check blurred when a case may cover it (no company rates) | Yes | Yes | Yes | Yes |
| Sourcing intelligence, Find a Source | Teased | Yes | Yes | Yes | Yes |
| Catalog, current duty, rate history, export | n/a | Unlimited | Unlimited | Unlimited | Unlimited |
| Tariff News emails | Yes (subscribe) | Yes | Yes | Yes | Yes |
| Alerts, AD/CVD updates, impact checks | n/a | Teaser email and a count | 500 products | The plan's products | The plan's products |
| Insights across the catalog | n/a | Locked | Yes | Yes | Yes |
| Savings detection, entry audits | n/a | A count | Yes | A count | Yes |
| Slack and Microsoft Teams | n/a | No | Yes | Pro, Scale | Pro, Scale |
| Alert emails | n/a | 1 | 20 | 1 / 3 / 6 / 20 | 1 / 3 / 6 / 20 |

- **Trial start:** `tracker_onboarding.trial_started_at`, set once by a database trigger the first time
  the account's catalog holds a real (non-example) product. The example list doesn't start it.
- **Teaser email:** when a tariff action hits a free account's products, one email per action says so
  and how many, with no impact check, rates or details.
- **Loss:** in the trial's last days and after it, Duty Guard and emails show what the account loses.
- **Old plans:** any "Duty Guard" subscriber keeps their price and everything (`LEGACY_TRACKER_PLANS`).
- **Guarantees are manual:** the customer emails and we refund in Stripe. `/admin` shows the audit count
  for the 30 days after purchase; trial audits don't count.
- **Copy:** savings are always "could", "up to", "may qualify". The product is counted in "products".
- **Coming later, not on offer yet:** one-time offers around big tariff refund events. Don't mention
  them in copy.

## HTS Hero Managed: premium service

_Added 2026-10-15; prices are placeholders until confirmed._

Sold from Duty Guard's **Expert help** tab. HTS Hero is onboarded to the client's company and
manages every tariff on their imports: a shared Slack channel with their team, a weekly check-in
call, every import kept in the lowest-duty position it can claim, new savings strategies explored
continually, and every entry, entry summary and delivery report audited. Priced by the imports
managed (`MANAGED_TIERS` in `components/pricing-calculator/lib/pricing.ts`), and includes the
Duty Guard on every managed import. Sold through an intro call (`config.bookCallUrl`), not
self-serve.

| Imports managed | Price / month |
|---|---|
| Up to 25 | $1,200 |
| Up to 50 | $2,500 |
| Up to 200 | $4,500 |
| Up to 500 | $7,500 |
| 500+ | Quoted |

Annual billing takes **20% off** (`MANAGED_ANNUAL_DISCOUNT`): $960, $2,000, $3,600 and $6,000 a month,
billed yearly. The page has a Monthly / Annual toggle.

As with audits, HTS Hero finds and documents; corrections, protests and refunds are filed by the
client's licensed customs broker or counsel, and we work with them directly.

## Free tariff audit check (lead magnet)

The self-audit in Duty Guard (Entry audit) uses audit checks: unlimited during the trial and on Duty Audits, none otherwise.

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

## Open questions

- Insights: the value ladder placed it in the free account, but Duty Guard locks it after the trial and
  sells it as a loss. It's treated as paid here until decided.
