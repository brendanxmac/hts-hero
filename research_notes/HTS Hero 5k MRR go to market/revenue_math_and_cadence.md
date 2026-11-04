# Revenue math and founder operating cadence: HTS Hero to $5k+ MRR by Feb–Mar 2027

Scope: revenue mixes that sum to $5k MRR, the funnel volume each one needs, which is most achievable in 3–4 months (2026-11-03 → Feb/Mar 2027), and an evidence-based founder routine, scorecard and kill/scale rules. Internal facts come from local files: [PRICING.md](file:///Users/brendanmclaughlin/Projects/HTS%20Hero/hts-hero/PRICING.md), [CORE_OFFERS.md](file:///Users/brendanmclaughlin/Projects/HTS%20Hero/hts-hero/CORE_OFFERS.md) and [reports/HTS Hero growth strategy.md](file:///Users/brendanmclaughlin/Projects/HTS%20Hero/hts-hero/reports/HTS%20Hero%20growth%20strategy.md).

**Internal facts used (from local files, not web):**
- Prices: Essentials $9/$19/$39/$79 for 10/25/100/500 products. Pro $49/$79/$149/$299. Partners from $299/mo for 10 clients. Managed $1,200 (25) / $2,500 (50) / $4,500 (200) / $7,500 (500). Annual billing is 15% off (20% on Managed). There is a 30-day money-back guarantee and a "10 Audit Money Back Guarantee" on Pro — [PRICING.md](file:///Users/brendanmclaughlin/Projects/HTS%20Hero/hts-hero/PRICING.md)
- **Conflict to flag:** PRICING.md says partners pay "$25 per client per month" after 10 clients. CORE_OFFERS.md says "$50 per client per month". PRICING.md is the stated source of truth on prices. The math below uses $25 — [PRICING.md](file:///Users/brendanmclaughlin/Projects/HTS%20Hero/hts-hero/PRICING.md); [CORE_OFFERS.md](file:///Users/brendanmclaughlin/Projects/HTS%20Hero/hts-hero/CORE_OFFERS.md)
- Managed prices are marked "placeholders until confirmed" — [PRICING.md](file:///Users/brendanmclaughlin/Projects/HTS%20Hero/hts-hero/PRICING.md)
- Baseline (Oct 25 report): 12 sign-ups and 4 accounts with imports in 60 days, 0 Tracker subscribers. Google sent about 56–66 clicks a week. Sign-ups were about 0.4–1% of real visitors. About 97% of Mixpanel "uniques" are bots — [growth strategy report](file:///Users/brendanmclaughlin/Projects/HTS%20Hero/hts-hero/reports/HTS%20Hero%20growth%20strategy.md)

---

## Q1. Benchmarks: visitor→sign-up, sign-up→paid, reverse/opt-in/opt-out trials, churn, time to $5k MRR

### Takeaway
- **Conversion:** a no-card (opt-in) trial at the median converts roughly 4–8% of trials to paid. That is about 0.36% of website visitors becoming payers.
- **Churn:** SMB SaaS under $100 ARPA churns roughly 3.5–6% a month.
- **Growth pace:** top-decile early SaaS grows 10–17% a month. The best-documented bootstrapped B2B launch (Transistor) took about 12 months to reach $10k MRR. Going from about $0 to $5k in 4 months on PLG compounding alone would be far outside the norm.

### Cited Findings
**Visitor → sign-up**
- Free-trial products have a median sign-up rate of 5%; freemium products have 9% (OpenView/Pendo survey of 1,000+ products) — [Lenny's Newsletter, "What is a good free-to-paid conversion rate"](https://www.lennysnewsletter.com/p/what-is-a-good-free-to-paid-conversion)
- Kyle Poyar's model gives figures per 1,000 visitors:

  | Trial type | Sign-ups | Paying customers | Visitor → paid |
  |---|---|---|---|
  | No-card trial | 45 | 3.6 | ~0.36% |
  | Card-required trial | 35 | 10.5 | ~1.05% |

  — [Userpilot summary of Poyar/ChartMogul/ProductLed Jan 2026 report](https://userpilot.com/blog/free-trial-conversion-rate/)

**Trial → paid**
- "Good" free-trial conversion is 8–12% and "great" is 15–25%. Freemium self-serve: good 3–5%, great 6–8%. Freemium with sales-assist: good 5–7%, great 10–15% — [Lenny's Newsletter](https://www.lennysnewsletter.com/p/what-is-a-good-free-to-paid-conversion)
- Median free-trial conversion is **8%** across 200 B2B products (Poyar with ProductLed and ChartMogul, Jan 2026). The distribution is bimodal: about 20% of products are below 2.5% and 23% are above 25%. The top 20% convert 10x better than the bottom 20% — [Userpilot](https://userpilot.com/blog/free-trial-conversion-rate/)
- ChartMogul 2026 percentiles:

  | Trial type | Median (50th) | 75th percentile |
  |---|---|---|
  | Opt-in (no card) | 4–6% | 10–15% |
  | Opt-out (card required) | 25–35% | 50–60% |

  First Page Sage (its own 50+ B2B clients) reports 18.2% opt-in and 48.8% opt-out — [Userpilot](https://userpilot.com/blog/free-trial-conversion-rate/)
- ChartMogul counts any conversion within 6 months of trial start, and surveys typically use a 3–6 month window. A median "8%" is therefore not all inside a 7-day window — [Userpilot](https://userpilot.com/blog/free-trial-conversion-rate/)
- **Reverse trial:**
  - Only about 4% of software companies run one (Poyar, State of B2B Monetization) — [search summary of Poyar](https://kylepoyar.substack.com/p/your-guide-to-reverse-trials)
  - Poyar's guide gives **no quantified reverse-trial conversion figure** in its public part (it is paywalled). It frames reverse trials as combining freemium acquisition with trial-style loss aversion — [Growth Unhinged, "Your guide to reverse trials"](https://kylepoyar.substack.com/p/your-guide-to-reverse-trials)
  - Vendor blogs cite 7–21% conversion and a "+38% vs freemium" figure attributed to Elena Verna/Amplitude. Neither was verifiable — [Userpilot/vendor roundups via search](https://userpilot.com/blog/saas-conversion-rate/)
- Time to purchase: a median of about 14 days for free-trial companies versus 60–90 days for freemium — [Growth Unhinged](https://kylepoyar.substack.com/p/your-guide-to-reverse-trials)
- 44% of free-trial companies have sales contact more than half of their sign-ups, versus 24% for freemium — [Lenny's Newsletter](https://www.lennysnewsletter.com/p/what-is-a-good-free-to-paid-conversion)

**Bootstrapped-specific (MicroConf 2024 State of Independent SaaS, as discussed on Startups for the Rest of Us ep. 721)**

| Model | Avg MoM growth | Avg MoM churn | Avg LTV |
|---|---|---|---|
| Free trial, card required | ~14% | ~5.5% | ~$3.6k |
| Free trial, no card | ~7.6–8% | ~6.3% | ~$6.5k |
| Freemium | ~10% | ~11% | ~$3k |

- Average MoM growth by target market: SMB-focused about 12%, enterprise about 26%. 71% of companies still require a card for trials — [Startups for the Rest of Us ep. 721](https://www.startupsfortherestofus.com/episodes/episode-721-7-key-takeaways-from-the-2024-state-of-independent-saas-report)
- 17.7% of surveyed independent founders are under $1k MRR, the single largest group. Companies with $1,000+/mo entry plans added about $1,073 new MRR a month, versus about $316 for those priced at $1–9 (469 founders, data from late 2023) — [MicroConf stage pages, via search](https://microconf.com/founders/0-10k-arr)

**Churn**
- ChartMogul rule of thumb: under $100 ARPA, aim for under 3.5% monthly churn; over $100 ARPA, aim for under 2.5% — [ChartMogul churn page](https://chartmogul.com/lp/saas-churn)
- SMB SaaS churn is commonly cited at 3–7% a month. One low-authority table gives 8.6% revenue churn for the $25–50 ARPU band (unverified) — [secondary roundups via search](https://userjot.com/blog/saas-churn-rate-benchmarks)

**Growth rates and time to milestones**
- Top-decile startups grow 10–17% a month when starting out. Top quartile grows 5–7% a month, and the median about 2–2.5%. The median early-stage startup has had flat year-over-year new-business ARR for the past 5 quarters — [ChartMogul SaaS Growth Report](https://chartmogul.com/reports/saas-growth-report/)
- Time to $1M ARR after the first paying customer:
  - Best-in-class takes about 9 months; the median about 2 years 9 months — [ChartMogul SaaS Growth Report](https://chartmogul.com/reports/saas-growth-report/)
  - Only 3.3% get there in under 1 year, 13.4% in under 3 years, and 25.1% within 5 years (6,525 companies) — [Growth Unhinged, "The odds of making it"](https://www.growthunhinged.com/p/the-odds-of-making-it)
- Companies under $300K ARR get 28% of their ARR from plans of 12 months or longer, a proxy for annual-plan uptake — [ChartMogul SaaS Growth Report](https://chartmogul.com/reports/saas-growth-report/)
- Indie Hackers: about 9 months on average to reach $1k MRR. This comes from a small sample of about 30 Stripe-verified products; outliers got there in about 5 months — [Indie Hackers](https://www.indiehackers.com/post/it-takes-5-months-to-reach-1k-in-mrr-491742f806)
- Transistor (B2B-ish, two founders with a large existing audience) had $1,400 MRR in its first month after the August 2018 launch. It grew about 29% a month for 9 months and reached about $10k a month roughly a year after launch, then $20k three months later. These figures are self-reported — [Justin Jackson / Transistor, via search](https://transistor.fm/anniversary/)
- FeedbackPanda (Arvid Kahl, two founders, niche B2B for online teachers) reportedly reached about $20k MRR within 9 months of launch and $55k in about 2 years. Sources are secondary and of mixed quality — [Indie Hackers](https://www.indiehackers.com/post/arvid-kahl-how-this-indie-hacker-bootstrapped-feedbackpanda-to-55k-mrr-and-sold-it-in-just-2-years-06ad0a81bf)

### Inferences
- **The growth required is far outside benchmarks.** Going from about $100 to $5,000 MRR in 4 months means roughly 165% MoM growth. Top-decile is 10–17%, and Transistor's standout run was 29%. Even top-decile compounding from a $500 base reaches only about $1k by March. **Hitting $5k by Feb–Mar 2027 needs step-function revenue (a few high-ACV deals), not PLG compounding.**
- **Plan on a 4–6% trial-to-paid rate, not 8–12%.** HTS Hero's opt-in reverse trial (no card) should be modelled at ChartMogul's opt-in median of 4–6% within the window, with 8% as the stretch case. The 7-day length plus the "no alerts until a tariff hits" dynamic argues for the low end. That 7-day window is an assumption about HTS Hero's own funnel, not a measured fact.
- **Organic search alone is far too small.** At Poyar's 0.36% visitor-to-paid rate, the current ~250 real Google visitors a month yield about 1 payer a month.
- **Use 5–6% monthly churn as a planning buffer** for self-serve accounts at $9–$49. That matches MicroConf's 6.3% average for no-card trials.

### Gaps
- No verified primary benchmark exists for **reverse-trial** conversion. Poyar's guide is paywalled, and the vendor figures (7–21%, +38%) are unverified.
- No reliable time-to-$5k-MRR distribution was found. The Indie Hackers figure (about 9 months to $1k) rests on about 30 samples, and the ChartMogul time data starts at $1M ARR.
- No source isolates churn for ARPA under $50. ProfitWell's churn benchmark PDF exists but was not retrieved.
- The MicroConf 2024 MRR distribution beyond the "17.7% under $1k" figure was not retrieved; the full report is at stateofindiesaas.com.

---

## Q2. Three revenue mixes that sum to $5k MRR, and the funnel each needs

### Takeaway
- **Mix A (pure PLG)** needs about 130 self-serve payers. That means roughly 2,200–3,250 activated trials and about 35k–45k real visitors in 4 months, around 40–50x today's traffic. **Not achievable.**
- **Mix B (hybrid)** needs about 6 sales-assisted deals plus about 25 self-serve payers.
- **Mix C (sales-led)** needs about 8–10 sales-assisted deals.
- **B is the most achievable and resilient. C is the fastest path if Managed delivery can be capped.**

### Planning assumptions (all labelled; not sourced unless cited)

| Assumption | Value | Basis |
|---|---|---|
| Essentials blended ARPA | ~$20 | Assumption: mix of the $9, $19 and $39 plans |
| Pro blended ARPA | ~$85 | Assumption: mostly $49 and $79, some $149 |
| Partner ARPA | ~$330 | Assumption: $299 plus about 1 extra client at $25 (PRICING.md) |
| Managed | $1,200 per account (25-product tier) | PRICING.md; price is a placeholder |
| Trial → paid | 5% base, 8% stretch | ChartMogul opt-in median 4–6%; Poyar median 8% — [Userpilot](https://userpilot.com/blog/free-trial-conversion-rate/) |
| Sign-up → activated (has a real import) | ~33% today, 70% target | Growth strategy report baseline and target |
| Real visitor → sign-up | 1% today, 3–4.5% target | Growth strategy report; Poyar model 4.5% |
| Sales-assisted demo → close | **Assumed 20–30%** for qualified, inbound-booked calls | No verified benchmark found (see Gaps) |
| Monthly churn | ~5% on self-serve | MicroConf: 6.3% for no-card trials; ChartMogul under-$100 ARPA target <3.5% |

### Mix A: "Many small accounts" (pure PLG)

| Line | Count | ARPA | MRR |
|---|---|---|---|
| Pro | 30 | $85 | $2,550 |
| Essentials | 100 | $20 | $2,000 |
| Partner | 1–2 | $330 | ~$450 |
| **Total** | **~132 accounts** | | **~$5,000** |

Funnel volume needed:
- **Paid accounts:** about 130 net. At 5% churn, gross adds are about 140 over 4 months.
- **Activated trials:** at 5% trial-to-paid, about 2,800 (about 1,750 at 8%). That is roughly 440–700 a month, against about 2 a month today.
- **Sign-ups:** at 70% activation, about 2,500–4,000.
- **Real visitors:** at a 4.5% sign-up rate, about 55k–90k over 4 months. Cross-check with Poyar's 0.36% visitor-to-paid: 140 / 0.0036 ≈ 39k visitors. Either way, roughly 35k–90k real visitors, against about 1k a month today.
- **Verdict:** not reachable by March under the ≤$1k/mo paid budget. At about $230 per sign-up on paid search (growth report estimate), the paid budget buys about 4 sign-ups a month.

### Mix B: "Hybrid — a few anchors plus self-serve" (recommended)

| Line | Count | ARPA | MRR |
|---|---|---|---|
| Managed | 2 | $1,200 | $2,400 |
| Partners | 4 | ~$330 | $1,320 |
| Pro | 12 | ~$85 | $1,020 |
| Essentials | 15 | ~$20 | $300 |
| **Total** | **33 accounts** | | **~$5,040** |

Funnel volume needed:
- **Sales-assisted:** 6 closes. At an assumed 20–30% close rate on qualified calls, that is about 20–30 qualified calls over about 14 weeks, or about **2 qualified calls a week**.
- **Self-serve:** about 27 gross payers. At 5% trial-to-paid that is about 540 activated trials (about 340 at 8%), or about **25–40 activated trials a week**. At 70% activation that is about 35–55 sign-ups a week, and at 3–4.5% that is about 1,000–1,800 real visitors a week. Still about 4–7x today, but within range if the HTS-page CTR and capture fixes land and partners refer clients.
- **Partner channel note:** each partner account brings up to 10 importer clients into the product. That is a free distribution channel into the ICP.

### Mix C: "Sales-led anchors"

| Line | Count | ARPA | MRR |
|---|---|---|---|
| Managed | 3 | $1,200 (or 1 at $2,500 + 1 at $1,200) | $3,600 |
| Partners | 4 | ~$330 | $1,320 |
| Self-serve Pro/Essentials | 2–5 | — | ~$100–300 |
| **Total** | **~9–12 accounts** | | **~$5,000** |

Funnel volume and constraints:
- **Sales-assisted:** about 7 closes, so about 25–35 qualified calls, or 2–3 a week.
- **Delivery cost:** Managed includes a weekly check-in call and Slack, and "every entry audited" ([PRICING.md](file:///Users/brendanmclaughlin/Projects/HTS%20Hero/hts-hero/PRICING.md)). Assumption: about 3–5 founder hours per Managed client a week. Three clients would eat about 9–15 hours a week, about a third of the founder's GTM time.
- **Concentration risk:** losing 1 Managed client loses 24% of MRR.

### How much do high-ACV deals change the math? (evidence)
- In the 2024 MicroConf survey, companies with $1,000+/mo entry plans added about 3.4x more new MRR per month (about $1,073 versus about $316 for the $1–9 tier) — [MicroConf, via search](https://microconf.com/founders/0-10k-arr)
- Enterprise-targeted independent SaaS averaged about 26% MoM growth, versus about 12% for SMB-focused companies — [Startups for the Rest of Us ep. 721](https://www.startupsfortherestofus.com/episodes/episode-721-7-key-takeaways-from-the-2024-state-of-independent-saas-report)
- Enterprise SaaS was 40% more likely to reach $1M ARR in 6 months. PLG and consumer SaaS were less likely to grow fast early — [Growth Unhinged, "The odds of making it"](https://www.growthunhinged.com/p/the-odds-of-making-it)
- Rob Walling: "high-touch sales… allows you to charge more", and higher prices tend to grow faster — [Startups for the Rest of Us, listener Q&A episodes](https://www.startupsfortherestofus.com/episodes/episode-831-written-vs-verbal-ad-copy-selling-into-a-low-awareness-market-and-more-listener-questions-rob-solo)
- For ARPA over $1k/mo, about 40% of added revenue comes from expansion, and higher ARPA is linked to higher net retention — [ChartMogul SaaS Growth Report](https://chartmogul.com/reports/saas-growth-report/)
- Sales-assist on product-qualified leads (users who already got value) is the standard hybrid pattern. Not every PQL needs a sales chase — [Pocus interview with Wes Bush](https://www.pocus.com/blog/how-to-layer-sales-on-top-of-self-serve-user-onboarding-with-wes-bush)
- Quantified sales-assist lifts (3.5x conversion; 3% → 18% for sales-engaged PQLs) appear only in vendor glossaries without methodology. They are **unverified** — [GTM Now](https://gtmnow.com/?p=80555); [Saber](https://www.saber.app/glossary/product-led-sales)

### Inferences
- **Each Managed deal is worth about 60 Essentials accounts** ($1,200 ÷ $20) and about 14 Pro accounts. **Each partner deal is worth about 16 Essentials accounts.**
- **Six sales-assisted deals cover about 75% of the target.** That cuts the self-serve volume needed from about 2,800 activated trials to about 340–540, an 80–88% cut.
- **One-time historical audits** (booked from `/tariff-audit`) are not MRR. They are cash plus a source of Managed and Pro leads, and should be counted on a separate line.
- **Annual prepay at 15% off is cash, not MRR.** It lowers churn exposure but does not raise the MRR count; an annual plan counts as 85% of the monthly price in MRR.
- **Partners sit on the PLG/sales boundary.** The "from $299" price is published, and they are sold on a 30-minute demo. They are the cheapest high-ACV line to close because the buyer (broker or forwarder) already reads Chapter 99 codes. That matches the GSC query mix in the growth report.

### Gaps
- No verified demo-to-close benchmark was found for inbound-booked SMB/mid-market calls. The 20–30% figure is an assumption.
- There is no evidence yet that importers will pay $1,200/mo for Managed; the prices are placeholders. Validate on the first 5 calls.
- There is no evidence on broker or forwarder willingness to pay $299+ for multi-client tariff software. The competitor pricing in the existing reports should be consulted.

---

## Q3. Which mix is most achievable in 3–4 months, and why

### Takeaway
**Mix B (hybrid).** It needs only about 2 qualified calls a week and about 25–40 activated trials a week, both within reach of the current funnel once the existing growth-report fixes land.
- It caps Managed delivery at 2 clients.
- It spreads concentration risk across about 33 accounts.
- The self-serve line builds the compounding base that keeps growing after March.

**Fallback:** if self-serve trial-to-paid comes in under 3% by mid-December, shift toward Mix C, adding 1 more Managed and 1–2 more partners.

### Cited Findings
- PLG and consumer SaaS are less likely to grow quickly early; enterprise is 40% more likely to reach $1M ARR in 6 months — [Growth Unhinged](https://www.growthunhinged.com/p/the-odds-of-making-it)
- Top-decile early growth is 10–17% MoM — [ChartMogul](https://chartmogul.com/reports/saas-growth-report/)
- The first 10 B2B customers are typically founder-led and manual. A "meaningful percentage" come from second or third touches (a secondhand summary of a YC Bookface survey; the primary source was not found) — [DEV Community playbook](https://dev.to/baraklabs/how-to-get-your-first-10-paying-users-a-step-by-step-playbook-for-b2b-and-b2c-saas-founders-4a5)
- One practitioner estimate puts 10 paying customers at 8–12 weeks, about $5k MRR, for a simple B2B tool priced $50–500/mo. This comes from a vendor or marketing source and is anecdotal — [Kuverly / earlycustomers search results](https://www.kuverly.com/blog/how-solo-founders-get-their-first-10-b2b-saas-customers/)

### Inferences
- **Why not A:** the traffic gap is 40–90x, and the paid budget cannot close it. At about $230 per paid sign-up, $1k buys about 4 sign-ups a month.
- **Why not pure C:** Managed is placeholder-priced, unproven and time-heavy for a solo founder. Concentration risk is high. Three weekly client calls and full entry audits also compete with the GTM hours that produce the next deals.
- **Why B:** it needs about 6 high-ACV yeses from about 25 conversations in 14 weeks. That is roughly the pace documented in founder-led sales advice, and it is compatible with "no cold calling":
  - Inbound demos come from `/tariff-audit`, the partner page, the Expert-help tab and the trial's high-import accounts.
  - Warm, personalized email and LinkedIn messages to the brokers and forwarders who already search Chapter 99 codes.
  - Asking each partner for client intros.
- **Timeline realism:** Mix B probably lands $3–5k by the end of February and $5k+ by the end of March if the first Managed and 2 partners close by mid-January. It is a stretch target, not a base case. A realistic base case given the benchmarks is $2–3.5k MRR by March.

### Gaps
- There is no HTS Hero-specific data yet on demo-booking rates from `/tariff-audit` or the partner page. Measure them from week 1.

---

## Q4. Tactics to lift conversion quickly on the existing PLG funnel (with lift evidence)

### Takeaway
- **Best supported:**
  - Founder or sales touch on activated (PQL) trial users. The direction is well supported; the size of the lift is not verified.
  - A pre- and post-expiry email sequence.
  - Annual as the default toggle.
- **Every lift figure found came from a vendor**, so run holdouts on HTS Hero's own cohorts.

### Cited Findings
- **Trial-expiry sequences:**
  - A vendor claims 2–5% trial-to-paid without an expiry sequence and 8–15% with one — [Sequenzy](https://sequenzy.com/blog/free-trial-expiring-email-sequence)
  - Another vendor says about 25% of trial conversions happen after the trial ends. Both claims are unverified — [Sequenzy templates](https://www.sequenzy.com/templates/saas-trial-conversion-email-templates)
  - Postmark recommends at least two emails, one before and one after expiry — [Postmark guide](https://postmarkapp.com/guides/trial-expiration-email-best-practices)
  - Counter-evidence: one dataset found the in-app paywall out-converted every email before trial end — [1clickreport](https://www.1clickreport.com/blog/saas-trial-conversion-timing-288-signups)
- **Sales/founder touch on PQLs:**
  - 44% of free-trial companies have sales contact more than half of their sign-ups — [Lenny's Newsletter](https://www.lennysnewsletter.com/p/what-is-a-good-free-to-paid-conversion)
  - Sales-assisted freemium converts 5–7% (good) and 10–15% (great), versus 3–5% and 6–8% self-serve. That is roughly a 1.5–2x lift in the benchmark bands — [Lenny's Newsletter](https://www.lennysnewsletter.com/p/what-is-a-good-free-to-paid-conversion)
  - PQL-driven conversion is about 3x higher (ProductLed survey of 600+ companies; free-to-paid averages 9%) — [Userpilot](https://userpilot.com/blog/free-trial-conversion-rate/)
- **Annual default:**
  - The average annual discount is about 16% (ProfitWell, 6,000+ companies, secondhand). Making annual the default toggle reportedly lifts annual adoption 20–40% (ProfitWell tests, secondhand, unverified) — [Monetizely](https://www.getmonetizely.com/articles/why-annual-billing-discounts-work-better-than-you-think-a-revenue-game-changer-for-saas)
  - A 16.7% discount equals "two months free" — [Recurly](https://recurly.com/research/saas-benchmarks-for-subscription-plans)
  - Companies under $300K ARR get 28% of ARR from plans of 12 months or longer — [ChartMogul](https://chartmogul.com/reports/saas-growth-report/)
- **Card versus no card:** card-required trials converted about 3x more visitors to paid in Poyar's model (10.5 versus 3.6 per 1,000 visitors) — [Userpilot](https://userpilot.com/blog/free-trial-conversion-rate/). MicroConf found no-card trials have higher LTV (about $6.5k versus $3.6k) but slower growth (about 8% versus 14% MoM) — [STFTROU ep. 721](https://www.startupsfortherestofus.com/episodes/episode-721-7-key-takeaways-from-the-2024-state-of-independent-saas-report)
- **Guarantees and case studies:** no citable lift data was found (see Gaps).

### Inferences (ranked for HTS Hero, based on the evidence above plus PRICING.md rules)
1. **Founder concierge for every trial with 20 or more products, or a partner-type sign-up.**
   - Within 24 hours, send a personal email offering a 15-minute "first look": "here's what I found on your imports".
   - Pitch Pro, partners or Managed by fit.
   - This applies the PQL sales-assist pattern; the expected lift is about 1.5–3x on that segment (benchmark bands, not verified).
2. **A trial-expiry sequence on days 5, 7 and 8 (post-expiry)** that shows what the account loses. PRICING.md already plans the "Loss" messaging. Run a 20% holdout to measure lift.
3. **A day-6 or day-7 annual offer** ("2 months free" framing is close to 15%). This is cash, not MRR, but it reduces month-2 churn.
4. **Lead with the guarantee.** The 30-day money-back and 10 Audit guarantee already exist; use them in the trial-end email and on demo calls. Lift is unquantified.
5. **Case studies:** none exist yet (CORE_OFFERS "Proof" is empty). Turn the first 2–3 paying or Managed clients into named or anonymised write-ups by January, and never invent any.

### Gaps
- No primary-source lift data for guarantees, case studies or concierge onboarding at SMB price points.
- No reverse-trial-specific data on expiry-email timing.

---

## Q5. Founder routine, weekly scorecard and kill/scale rules

### Takeaway
- **Founder-led bootstrapped B2B growth runs on daily, non-negotiable outreach and follow-up to warm or high-intent people.** First customers often come on the second or third touch. Founders sell high-touch first and charge more for it.
- **Weekly time split:** about 20 GTM hours a week, roughly 40% conversations and sales, 25% activation and conversion work, 20% content and SEO (additive only, per the never-hurt-SEO rule) and 15% delivery for Managed.
- **The scorecard and kill/scale rules below are built from the cited benchmarks; the hour split and the specific targets are assumptions.**

### Cited Findings
- **Daily outreach:**
  - Practitioner playbooks recommend about 10–15 personalized messages a day and expect a 10–20% response rate. This is anecdotal or vendor material, not a documented founder calendar — [DEV playbook](https://dev.to/baraklabs/how-to-get-your-first-10-paying-users-a-step-by-step-playbook-for-b2b-and-b2c-saas-founders-4a5)
  - "Your first 10 customers are a founder activity, not a marketing activity" — [Kuverly](https://www.kuverly.com/blog/how-solo-founders-get-their-first-10-b2b-saas-customers/)
- **Cold email baseline:** a 5.6% reply rate for personalized messages versus 3.6% for generic ones. Kill rule from the existing growth report: under 1 trial per 150 sends — [Hunter, State of Cold Email](https://hunter.io/the-state-of-cold-email); [growth strategy report](file:///Users/brendanmclaughlin/Projects/HTS%20Hero/hts-hero/reports/HTS%20Hero%20growth%20strategy.md)
- **Embedded-community distribution:** FeedbackPanda's first users came from a single comment in a Facebook group of its target users. That is the "embedded entrepreneur" model of being present where the ICP talks (secondary source) — [Indie Hackers / Arvid Kahl coverage](https://www.indiehackers.com/post/learn-from-arvid-kahl-the-embedded-entrepreneur-123ecb03b4)
- **High-touch pricing:** high-touch sales let you charge more — [Rob Walling, STFTROU](https://www.startupsfortherestofus.com/episodes/episode-831-written-vs-verbal-ad-copy-selling-into-a-low-awareness-market-and-more-listener-questions-rob-solo)
- **Solo founders are normal in this cohort:** solo founders averaged about 17% MoM growth in the MicroConf 2024 survey (an average, skewed by outliers) — [STFTROU ep. 721](https://www.startupsfortherestofus.com/episodes/episode-721-7-key-takeaways-from-the-2024-state-of-independent-saas-report)
- **Paid channels:** Google Ads was the top revenue-driving ad channel for independent SaaS (about 65%), then Meta (about 30%) — [STFTROU ep. 721](https://www.startupsfortherestofus.com/episodes/episode-721-7-key-takeaways-from-the-2024-state-of-independent-saas-report)

### Proposed routine (assumptions built on the findings above)

**Daily (weekdays; roughly 3.5–4 hours of GTM; Bangkok time zone, so overlap with US mornings is the founder's evening)**

| Block | Time | What | Daily target |
|---|---|---|---|
| 1. Pipeline review | 20 min, first thing | `/admin` "Needs You": new sign-ups, trials with imports, trials ending in 48 hours, partner or Managed leads | Every new sign-up triaged |
| 2. Concierge and PQL outreach | 60 min | Personal email (plain text, from the founder) to every trial with 20+ products or a broker/forwarder email domain: "first look" findings plus a 15-minute call link. Follow up on day 2 and day 5 | 100% of PQLs touched within 24 hours; 2–3 follow-ups |
| 3. Warm/permitted outreach (no calls) | 60 min | Personalized email or LinkedIn notes to brokers, forwarders and 3PLs who match the Chapter 99 query pattern, plus partner-referral asks. Answer customs/tariff questions in communities where the ICP already is, linking to an HTS page only when relevant | 10–15 personalized touches |
| 4. Calls | 0–90 min, US-overlap evening | Demos and onboarding calls, booked inbound only | Average 2 qualified calls a week (Mix B) |
| 5. Ship one funnel fix | 60 min | One change from the growth-report leak list, or a test on the trial or expiry flow | 1 change shipped every 1–2 days |

**Weekly**

| Day | Block | What |
|---|---|---|
| Mon | 45 min | Scorecard review (below) and choose the week's 1–2 experiments |
| Tue/Thu | 2 hours | Content and SEO, additive only: HTS-page title and meta tests (growth report), one tariff-event post or update that the alert and teaser emails can link to |
| Wed | 1 hour | Partner pipeline: follow up every open partner and Managed conversation; send one partner a "client intro" ask |
| Fri | 1 hour | Customer calls with existing payers and trials (churn prevention, case-study candidates) |
| Weekly | ≤$250 | Paid test: Google Ads to `/tariff-audit` / the overpayment check only, per the growth report's guidance |

**Monthly**
- MRR bridge (new, expansion, churn), cohort trial-to-paid and churn reasons.
- Decide on scaling or killing each channel (rules below).
- Publish one case study once one exists.
- Revisit Managed pricing after each set of 5 calls.

### Weekly scorecard (leading indicators; targets assume Mix B)

| Metric | Today (approx.) | Week 4 target | Week 10 target | Basis |
|---|---|---|---|---|
| Real visitors (bot-filtered) | ~250–300 Google clicks/week | 600 | 1,200 | Growth report; Mix B math |
| Visitor → sign-up | 0.4–1% | 2.5% | 3–4.5% | Lenny 5% trial median; Poyar 4.5% |
| New sign-ups/week | ~1.5 | 15 | 40 | Mix B math |
| Share with a real import on day 0 (activation) | ~33% | 55% | 70% | Growth report target |
| PQL trials (20+ products or partner-type) | ? | 4 | 10 | Assumption |
| PQLs touched within 24 hours | — | 100% | 100% | Routine rule |
| Qualified calls held | 0 | 1–2 | 2–3 | Mix B math |
| Demo → close (rolling 4 weeks) | — | — | 20–30% | Assumption; validate |
| Trial → paid (cohort, measured at day 30) | 0% | ≥3% | 5–8% | ChartMogul opt-in median 4–6%; Poyar 8% |
| Net new MRR/week | ~$0 | $150 | $500 | $5k ÷ about 14 weeks ≈ $360/week average, back-loaded |
| Logo churn, monthly (self-serve) | — | <6% | <5% | MicroConf 6.3%; ChartMogul <3.5% target |
| Outreach touches/week | — | 50–75 | 50–75 | Routine |
| Reply rate on personalized outreach | — | ≥5% | ≥5% | Hunter 5.6% |

### Kill / scale rules (assumption-based thresholds anchored to the benchmarks above)
- **Paid search:**
  - Kill if cost per activated trial is over $100 after $500 spent, or if there are no demos booked after $750. Under the 2-month ROI rule, one Pro sale at about $85/mo must cover about $170 of acquisition cost.
  - Scale, staying within ≤$1k/mo, if CAC per paid account is $170 or less, or if paid traffic books a Managed or partner demo.
- **Cold/warm email (no calls):** kill a segment under 1 trial or demo per 150 sends (growth report). Scale a segment with a 5% or higher reply rate and 1 or more demos per 100 sends.
- **Concierge calls:** keep them if PQL trial-to-paid is 2x or more the non-touched cohort after about 20 PQLs; this needs a holdout. If there is no lift after 30 PQLs, switch to async video "first look" reports.
- **Managed:**
  - Pause new Managed sales once delivery exceeds 10 hours a week, or after 2 clients.
  - Raise the price, or move to the $2,500 tier, if the first 3 calls accept $1,200 without pushback.
  - If 0 of the first 5 qualified Managed calls close, drop the Managed line from the mix and redirect to partners.
- **Partners:** if 0 of the first 6 demos close, test the price ($199 entry) or packaging before more outreach. If 2 or more close, make partner outreach 50% of block 3.
- **Self-serve trial-to-paid:** if it is under 2% at day 30 on the first 50 activated trials, stop top-of-funnel work and fix activation and expiry first. If it is 8% or higher, shift time to traffic (HTS-page CTR tests).
- **Mix pivot checkpoint, about 2026-12-15:** if MRR is under $800 with fewer than 2 high-ACV deals signed, move to Mix C weighting (more partner and Managed outreach) and treat $5k as an end-of-April target.

### Inferences
- **The constraint is conversations, not product.** Mix B needs about 25 qualified calls in 14 weeks. With no cold calling, they must come from:
  - inbound demo CTAs (`/tariff-audit`, partner page, Expert help);
  - PQL concierge outreach on trials;
  - warm and permission-based email or LinkedIn to the broker and forwarder audience already visible in GSC queries;
  - partner client-intro asks.
- **The trial is 7 days, so PQL triage has to be daily.** A weekly cadence would miss most trials before they expire.
- **Reminder for the caller (from MEMORY):** the onboarding and email TODO is still open and relevant here. The concierge and expiry-email lifts depend on it.

### Gaps
- No primary-source documented daily calendars from B2B solo founders who went from $0 to $5–10k MRR in 3–6 months. The routine is a synthesis of practitioner advice and the benchmarks, not a copied schedule.
- No evidence was found on how to reach customs brokers and forwarders specifically (for example, their LinkedIn reply rates, NCBFAA community norms or trade-association newsletters). This should be checked in an adjacent research thread.
- Tony Dinh, Marc Lou and Pieter Levels were not researched in depth. Their audience-driven B2C/prosumer launches are a poor fit for an importer/broker B2B ICP with no founder audience.
