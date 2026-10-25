# Evidence-Based SaaS Pricing and Packaging for a Small PLG B2B SaaS

Research date: 2026-10-21. Sources were fetched or searched live. Where a figure comes from a secondary blog that cites a primary source I could not open, it is marked "(secondary)". Older sources (before 2023) are marked "(older)".

## Q1. What do the named experts and benchmarks say about tier count, freemium vs trial vs reverse trial, and low-priced entry tiers?

### Takeaway
The best-sourced conversion benchmark (OpenView + Growth Unhinged + Pendo, 1,000+ products, Aug 2023) puts self-serve freemium at 3–5% "good" and 6–8% "great", and free trials at 8–12% good and 15–25% great. Reverse trial evidence is mostly practitioner estimates (Verna: +10–40% over freemium; Airtable reportedly +40%). There is no rigorous study of these. On tier count, 3–4 public tiers is the norm (about 3.2 to 3.5 on average), with freemium products leaning toward 4 because the free plan counts as a tier.

### Cited Findings
**Conversion benchmarks**
- Free-to-paid conversion over the first 6 months, from a survey of 1,000+ products run by OpenView, Growth Unhinged and Pendo (published 2023-08-01):
  - Freemium self-serve: 3–5% good, 6–8% great.
  - Freemium sales-assisted: 5–7% good, 10–15% great.
  - Free trial: 8–12% good, 15–25% great.
  - Source: [Lenny's Newsletter, "What is a good free-to-paid conversion rate"](https://www.lennysnewsletter.com/p/what-is-a-good-free-to-paid-conversion)
- How those rates were spread across products in the same survey:
  - Freemium: 20% of products convert below 2.5%, 33% convert at 2.5–5%, and about 15% convert above 20%.
  - Free trial: 7% convert below 2.5% and 14% reach 20%.
  - Source: [Lenny's Newsletter](https://www.lennysnewsletter.com/p/what-is-a-good-free-to-paid-conversion)
- Elena Verna's figures. They are illustrative, and she gives no sample size. The post was originally published 2022-09-07 (older) and republished 2025-06-03.
  - Opt-in trial without a card: about 15% of trial starts convert to paid.
  - Trial with a card: 70–80% of trial starts convert, but up to 80% of people drop off at the card screen.
  - Freemium: about 5% of free users convert. About 25% of acquired freemium users keep using the product.
  - Reverse trial: she argues it can capture the trial's roughly 15% conversion and also keep the engaged freemium base.
  - Source: [Amplitude blog, Elena Verna, "Reverse trial"](https://amplitude.com/blog/reverse-trial)
- Verna's "10–40% lift from freemium to premium" for reverse trials is anecdotal, not a controlled study — [Userpilot (secondary)](https://userpilot.com/blog/?p=13042); [PLG Handbook](https://plghandbook.com/reverse-trial/)
- Airtable reportedly got 40% more conversions from a 14-day full-feature reverse trial that reverts to the free plan. This is a headline claim; the primary source is Kyle Poyar's June 2022 "Your guide to reverse trials", which is paywalled (older) — [Failory](https://newsletter.failory.com/p/no-freemium); [Growth Unhinged, reverse trials guide](https://kylepoyar.substack.com/p/your-guide-to-reverse-trials)
- A ChartMogul/ProductLed report co-authored with Poyar reportedly lists 4–6% as "good" for reverse trials. The sample was too small to be statistically significant, and I saw this only in a search summary (secondary) — [Growaton (secondary)](https://growaton.com/blog/conversion-product-led-growth/trial-freemium-models/saas-freemium-vs-free-trial-vs-reverse-trial-which-converts-best); [CXL](https://cxl.com/blog/reverse-trial-strategy/)
- No-card trials reportedly convert at 3.0–5.5% versus 18–25% for card-required trials (attributed to OpenView and Recurly, secondary). OpenView product benchmarks reportedly show visitor-to-signup of about 6% for freemium versus 3–4% for trials (secondary) — [Digital Applied (secondary)](https://www.digitalapplied.com/blog/freemium-vs-free-trial-decision-matrix-2026-saas)
- Conflict: the no-card trial range above (3–5.5%) is far below Verna's roughly 15% and the 2023 survey's 8–12% "good". Definitions differ: some measure from signup, others from trial start. Treat it as unreconciled — [Revheat](https://revheat.com/free-trial-vs-freemium-conversion-reconciliation/)
- Patrick Campbell (ProfitWell) treats freemium as an acquisition model, not a revenue model. Only run it if you know the customer well enough to convert free users to paid (secondary summary) — [Antoine Buteau, lessons from Patrick Campbell](https://www.antoinebuteau.com/lessons-from-patrick-campbell/)

**Tier count**
- In 110 SaaS pricing pages, studied April 2026, the average was 3.5 tiers. Free plans are more common on 4-tier pages (67%) than 3-tier pages (48%). Source: [SaaS Research Lab](https://saasresearchlab.com/blog/4-tiers-pricing)

| Tiers | Share of products | Share with a free plan | Average starter price |
|---|---|---|---|
| 2 | 12% | 32% | $39/mo |
| 3 | 38% | 48% | $29/mo |
| 4 | 34% | 67% | $29/mo |
| 5+ | 16% | 58% | $19/mo |

- Other tier-count claims:
  - Average of 3.2 public tiers plus custom/enterprise (vendor study, 100+ companies, methodology unclear) — [Monetizely](https://www.getmonetizely.com/articles/saas-pricing-benchmark-study-2025-key-insights-from-100-companies-analyzed)
  - In a 200-site benchmark, 68% of sites used three tiers, and three-tier sites showed "14% higher conversion" than sites with 4+ tiers. This is correlational and the sample is small — [Lean Experiments](https://leanexperiments.substack.com/p/the-pricing-page-conversion-benchmark)
  - Conflict: SaaS Research Lab calls 4 tiers "the winner", while Lean Experiments favors 3. Neither is causal.
- Kyle Poyar's "PLG pricing 201" (2023-04-12) — [Growth Unhinged](https://www.growthunhinged.com/p/your-guide-to-plg-pricing-201):
  - Notion dropped its individual Personal Pro plan, doubled its entry price from $4 to $8 per user, and made Free better for collaboration.
  - Single-user plans have weaker unit economics: lower retention, worse LTV:CAC and a heavier support burden.
  - Keep features for individual users widely available. Charge for team and org features: SSO, security, invoicing, admin and premium support.
- Poyar's 2026 State of B2B Monetization (230+ companies, surveyed April–May 2026) — [Growth Unhinged 2026 report](https://www.growthunhinged.com/p/the-state-of-b2b-monetization-in-2026):
  - Three in four companies changed pricing or packaging in the past year.
  - 37% of companies under $5M ARR use flat fees.
  - Hybrid pricing rose to 37%, from 25% a year earlier.
  - Poyar estimates premium editions are typically priced 50–100% above the base edition.
- Poyar argues most founders underprice because they project their own price sensitivity onto buyers. He suggests entry packages or pay-as-you-go to lower adoption barriers (podcast summary) — [SaaS Club](https://saasclub.io/podcast/saas-pricing-strategy-mistakes-kyle-poyar/)
- Madhavan Ramanujam and Georg Tacke, *Monetizing Innovation* (Simon-Kucher, 2016, older):
  - Design the product around willingness to pay.
  - Sort features into "leaders" (drive purchase), "fillers" (nice to have) and "killers" (deter purchase if included).
  - Align tier boundaries with willingness-to-pay segments.
  - Sources (secondary summaries): [Antoine Buteau, lessons from Madhavan Ramanujam](https://www.antoinebuteau.com/lessons-from-madhavan-ramanujam/); [echai.ventures](https://echai.ventures/gtm/people/madhavan-ramanujam)

### Inferences
- For a small PLG B2B tool, a reverse trial that reverts to a capable free plan is backed by practitioner consensus, not hard data. Target trial-level conversion (8–15%) measured from trial start, and expect around 3–5% if measured across all free signups.
- Three paid tiers plus free (4 total) plus "contact us" matches the modal structure for freemium products.
- Notion and Poyar point toward raising and simplifying entry pricing, and charging for team and org value, rather than adding a cheap individual tier.

### Gaps
- I found no published Price Intelligently or Simon-Kucher dataset on optimal tier count. Their tier guidance came only through secondary summaries.
- No controlled study of reverse trial versus freemium was found. The Canva and Toggl reverse trial numbers were not found.
- The OpenView 2024–2025 benchmark figures (for example a "14.7% median trial" and a "3.8% freemium median") appear only in secondary blogs. I could not verify them, because OpenView wound down its platform and the primary reports were not accessible.

## Q2. When does a cheap "pro" plan for a free tool (like a $9/mo advanced calculator) work, and when does it anchor low or cannibalize?

### Takeaway
I found no direct quantitative evidence on $9 entry tiers cannibalizing higher plans. The qualitative expert view leans against cheap individual tiers in B2B: they bring weaker unit economics, they invite buy-down, and Notion dropped one. Analogs show cheap tiers working when they are capacity-limited versions of the same value metric (UptimeRobot Solo $9–10, Visualping $10–14, Distill $15), not a separate feature product.

### Cited Findings
- Single-user plans have lower retention and LTV:CAC and a heavier support burden. Notion removed Personal Pro and doubled its entry price to $8 — [Growth Unhinged, PLG pricing 201](https://www.growthunhinged.com/p/your-guide-to-plg-pricing-201)
- Good-better-best can cause buy-down to cheaper tiers. An over-featured lower or middle tier reduces the reason to upgrade — [Steven Forth, Pricing Innovation](https://pricinginnovation.substack.com/p/generative-ai-has-over-indexed-on)
- Poyar lists a low-price entry package as one of the "try before you buy" options alongside freemium, trial and reverse trial — [Growth Unhinged, PLG pricing 201](https://www.growthunhinged.com/p/your-guide-to-plg-pricing-201)
- The median starter price across 110 SaaS pages is $29/mo. Products with 5+ tiers average a $19 starter — [SaaS Research Lab](https://saasresearchlab.com/blog/4-tiers-pricing)
- Low-priced analogs. Each is the same product with fewer units and a slower check frequency:

| Product | Cheapest paid plan | What it includes | Source |
|---|---|---|---|
| UptimeRobot | Solo, $9/mo annual ($10 monthly) | 10 monitors | [UptimeRobot pricing](https://uptimerobot.com/pricing/) |
| Visualping | Personal 1K, $10/mo annual ($14 monthly) | 10 pages | [Visualping pricing](https://visualping.io/pricing) |
| Distill | Starter, $15/mo | 50 monitors | [Distill pricing](https://distill.io/pricing/) |

### Inferences
- A cheap tier works when the next tier is a clear capacity step up on the same metric, gated by real needs like team seats, frequency and integrations. It risks anchoring or cannibalizing when it carries most of the core value for most users, or when it is a separate product (an "advanced calculator") whose buyers would otherwise have bought the main paid plan.
- A $9 plan on a free tool can also undercut the free-to-trial funnel: users who would have started the full trial settle for $9. This is a hypothesis to test, not evidence.

### Gaps
- No A/B or cohort data was found on adding or removing a sub-$10 tier, or on "brand anchoring" effects. ProfitWell's anchoring and decoy research was not found in primary form.

## Q3. What tier step structures work for products priced by number of monitored items?

### Takeaway
Monitoring analogs use 3–4 public paid steps, each roughly 2–4x the price of the last. Units usually grow faster than price, so the per-unit price falls about 50–80% from the first to the last step. Above the top step they switch to "contact sales" (Prisync above 5,000 products, AccuRanker above 25,000 keywords, Visualping "Solutions" from $3,000/yr). Teams, seats and integrations are often the real gate for the business tier, not the unit count.

### Cited Findings
- **Prisync** (price monitoring, URL-based model). Source: [Prisync pricing](https://prisync.com/pricing/)
  - Steps: Professional $99/mo for 100 products, Premium $199 for 1,000, Platinum $399 for 5,000.
  - Above 5,000 products: "chat with us".
  - Trial: 14 days, no card.
  - Other models cost more: Channel-based $199/$399/$599, Hybrid $299/$599/$799.
  - Gated features: dynamic pricing from Premium; price history and MAP monitoring at Platinum.
  - Add-ons: API at +20% of the subscription; extra sales channels at $100–200/mo.
- **Visualping** (web page monitoring). Source: [Visualping pricing](https://visualping.io/pricing)

| Plan | Monthly | Annual | Checks/mo | Pages | Users |
|---|---|---|---|---|---|
| Free | $0 | — | 150 | 5 | 1 |
| Personal 1K | $14 | $120/yr | 1,000 | 10 | 1 |
| Personal 5K | $35 | $300/yr | 5,000 | 20 | 1 |
| Personal 10K | $70 | $600/yr | 10,000 | 40 | 1 |
| Business 20K | $140 | $1,200/yr | 20,000 | 200 | 5 |
| Business 50K | $350 | $3,000/yr | 50,000 | 500 | 11 |

  - Business features require at least $1,200/yr: Slack/Teams alerts, API, bulk import and reports. Extra users cost $60/yr.
  - Enterprise "Solutions" is custom, starting from $3,000/yr.
- **Distill** (web page monitoring). Source: [Distill pricing](https://distill.io/pricing/)
  - Steps: Free with 25 monitors (5 in the cloud, 6-hour checks), Starter $15 for 50, Professional $35 for 150, Flexi $80+ for 500+.
  - Annual billing: 20% off.
  - No team features on any plan; shared watchlists are Enterprise only.
- **UptimeRobot** (uptime monitoring). Source: [UptimeRobot pricing](https://uptimerobot.com/pricing/)
  - Steps: Free with 50 monitors at 5-minute checks, Solo $10/mo ($9 annual) for 10 monitors, Team $41 ($35 annual) for 100 monitors with 3 seats, Scale $77 ($65 annual) for 200 monitors with 5 seats, then Enterprise custom.
  - The annual discount implied by the listed prices is about 10–16%.
  - Note that the free plan has more monitors than Solo. Paid plans are gated on check interval (60s, 30s, 15s), seats and features, not monitor count.
- **SE Ranking** (rank tracker). Source: [SE Ranking pricing](https://seranking.com/subscription.html)
  - Core $129/mo ($103.20 annual) for 2,000 keywords, 10 projects and 1 seat.
  - Growth $279/mo ($223.20 annual) for 5,000 keywords, 30 projects and 3 seats.
  - Enterprise custom. Annual billing saves 20%.
  - Add-ons: Agency Pack +$69/mo, AI Search +$89/mo, API +$45/mo.
- **AccuRanker** (rank tracker). Source: [AccuRanker pricing](https://www.accuranker.com/pricing/)
  - Professional from $224/mo with keyword steps of 2,000 / 3,000 / 5,000.
  - Expert from $764/mo with steps of 10,000 to 25,000.
  - Enterprise above 25,000 keywords. Annual billing is 10% off.
  - The page did not map exact prices to every keyword step.

### Inferences
These per-unit prices and step ratios are my own arithmetic from the listed monthly prices.

**Per-unit price by step:**

| Product | Unit | First step | Middle step | Top step | Fall, first to top |
|---|---|---|---|---|---|
| Prisync | product | $0.99 | $0.20 | $0.08 | about 92% |
| Distill | monitor | $0.30 | $0.23 | $0.16 | about 47% |
| UptimeRobot | monitor | $1.00 | $0.41 | $0.385 | about 61% |
| Visualping Personal | check | $0.014 | $0.007 | $0.007 | about 50% (flat after the first step) |
| SE Ranking | keyword | $0.065 | — | $0.056 | about 14% (two steps only) |

- Visualping's Business tier keeps the same per-check price as Personal and adds seats and integrations.

**Price ratio between adjacent steps:**
- Prisync: 2x then 2x.
- Distill: 2.3x then 2.3x.
- UptimeRobot: 4x then 1.9x.
- Visualping: 2.5x then 2x, then 2x into Business.
- SE Ranking: 2.2x.

**Patterns:**
- The typical pattern is that each step doubles the price and gives 2–10x the units. Steep per-unit decay (Prisync) fits when large accounts are worth much more. Flatter decay fits when cost scales with usage (checks).
- The jump to custom pricing comes at roughly 5–50x the entry tier's units, often with a published "from" price (Visualping: from $3,000/yr) to anchor it.

### Gaps
- I did not fetch exact per-step AccuRanker prices. The 2,000-keyword mapping is assumed.
- Mention's pricing page showed no plan prices in the fetched text. It listed only "Company" and "2 months free" on annual billing — [Mention pricing](https://mention.com/en/pricing/)
- Google Alerts as a free anchor was not fetched or cited.

## Q4. Is there evidence on single-feature starter plans (e.g. alerts-only) as a wedge vs. full-suite plans?

### Takeaway
I found no direct study. The analogs point the other way from an alerts-only wedge. Most monitoring tools include alerts on every tier, including free, and gate the alert channel, frequency, history and team features instead.

### Cited Findings
- Alert channels are gated by tier:
  - Visualping's free plan includes email, webhook, API and MCP alerts. SMS, Slack, Teams and Sheets alerts are paid or Business only. History is 3 months by default and can be extended to 1 year on Business — [Visualping pricing](https://visualping.io/pricing)
  - Distill's free plan has 30 email alerts a month and no SMS. Starter adds 2,000 emails and 100 SMS. Professional gives unlimited email — [Distill pricing](https://distill.io/pricing/)
  - Prisync's daily email notifications start at Premium. Instant email alerts are Platinum on the URL and Hybrid models — [Prisync pricing](https://prisync.com/pricing/)
- Poyar's guidance: keep features for individual users broadly available and charge for team and org features — [Growth Unhinged](https://www.growthunhinged.com/p/your-guide-to-plg-pricing-201)

### Inferences
- In monitoring products, alerts are the core value metric, not an add-on. Analogs ration alerts by volume, speed and channel rather than selling an alerts-only SKU. Making alerts the paid wedge is consistent with Prisync, which gates notifications to higher tiers.

### Gaps
- No case study or data was found comparing single-feature starter plans with full-suite entry plans.

## Q5. Is there evidence on team/agency plans for multi-client users (agencies, accountants, brokers)?

### Takeaway
Three patterns show up:
- **Per client or project:** capacity priced by the number of clients or companies served, with unlimited users. Examples are Pixie and SaaSant.
- **Agency pack add-on:** a bolt-on that raises the project count. Example: SE Ranking's +$69/mo Agency Pack.
- **Seats bundled with higher tiers, with extras sold per seat:** SE Ranking from $16/seat, Visualping $60/yr per user, UptimeRobot $15–19 per login seat.

I found no sourced data on white-label plans.

### Cited Findings
- SE Ranking includes 10 projects with 1 seat on Core and 30 projects with 3 seats on Growth. The Agency Pack is +$69/mo (annual billing only) for 30–100 projects. Extra seats start at $16 — [SE Ranking pricing](https://seranking.com/subscription.html)
- Per-client pricing in accounting tools:
  - Pixie is about $65–69/mo for practices under 50 clients and $129/mo under 250 clients, custom above 1,000, with unlimited users — [ZoftwareHub, Pixie](https://zoftwarehub.com/en-ae/products/pixie/pricing)
  - Per-client models suit firms with fewer, higher-value clients, can get expensive for many low-fee clients, and vendors define "client" differently — [Financial Cents](https://financial-cents.com/resources/articles/cost-of-accounting-practice-management-software/)
- SaaSant has a Premium plan for accountants that is priced by the number of client QuickBooks companies — [ZoftwareHub, SaaSant](https://zoftwarehub.com/products/saasant-transactions/pricing)
- Visualping lets a Business plan hold multiple workspaces, each with its own plan and cost, which effectively means per-client workspaces — [Visualping pricing](https://visualping.io/pricing)
- Packaging context:
  - Multi-user plans have better economics — [Growth Unhinged](https://www.growthunhinged.com/p/your-guide-to-plg-pricing-201)
  - SurveyMonkey requires multiple users on its Team plans — [Growth Unhinged](https://www.growthunhinged.com/p/your-guide-to-plg-pricing-201)

### Inferences
- For customs brokers serving many importers, the analogs suggest two options:
  - Per client or workspace capacity with unlimited or bundled seats, with per-unit decay at volume.
  - Agency add-on on a top self-serve tier, with custom pricing above that.

### Gaps
- No sourced examples or data on white-label or reseller pricing were found.

### Cross-cutting: annual discounts and launch urgency
These topics were requested in the objective but fall outside the five key questions, so they sit here.

**Annual discounts**
- What the analogs offer:
  - 20% off: SE Ranking ([pricing](https://seranking.com/subscription.html)), Distill ([pricing](https://distill.io/pricing/))
  - 10% off: AccuRanker ([pricing](https://www.accuranker.com/pricing/))
  - About 10–16% implied by listed prices: UptimeRobot ([pricing](https://uptimerobot.com/pricing/))
  - About 29% (annual $120 vs monthly $14×12): Visualping ([pricing](https://visualping.io/pricing))
  - "2 months free" (about 17%): Mention ([pricing](https://mention.com/en/pricing/))
- A ProfitWell analysis of 6,000+ companies reportedly found an average annual discount of about 16% (secondary, likely around 2019, older). A ProfitWell study of 941 businesses reportedly found churn of about 9% with no annual billing versus about 5% when 75% of contracts are annual (secondary, older) — [Monetizely (secondary)](https://www.getmonetizely.com/articles/why-annual-billing-discounts-work-better-than-you-think-a-revenue-game-changer-for-saas); [ProfitWell Report, annual vs monthly](https://paddle.com/studios/shows/profitwell-report/annual-vs-monthly)

**Launch urgency**
- No sourced evidence on launch-price or price-lock urgency tactics was found. This is a gap.
