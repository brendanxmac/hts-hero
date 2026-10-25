# Win one niche, give away the snapshot, sell the watching: the self-serve playbook

_Researched 2026-10-25, building on `reports/HTS Hero growth strategy.md`. Sources: web research on niches, guarantees, free-tool funnels, monetization and founder go-to-market (listed at the end); Search Console exports to 2026-10-23; and the codebase. [V] means checked against a cited source; [I] means inference._

## The answer in one page

**The product rule:** give away any answer about **one code or one moment in time**. Charge for **watching your whole catalog over time** and for **line-by-line audit detail**. Everything below follows from that.

1. **What has to change in the product:**
   - Get the importer's data in within 5 minutes. That means 7501/ES-003 upload, which today is "Coming soon" and the entry audit is a manual form.
   - Make every alert and audit end in something they can forward to their broker.
   - Show what's **coming** (announced or proposed changes and their dates), not only what changed.
   - Measure and publish alert speed, so a guarantee can rest on it.
   - Get the classification offers off the tariff pages.
2. **What to do every day:** about 2.5 hours on a fixed loop.
   - Approve impact alerts and write one sourced explainer per real tariff action.
   - Post it from your own LinkedIn, wired to "check your codes".
   - Improve one page or tool using Search Console data.
   - Answer importers' questions where they already ask.
   - Personally reply to every new trial account.
3. **What scales in this industry:** the TaxJar playbook. Be the fastest, most trusted **interpreter** of a rule set that keeps changing, and turn every explainer into "check your imports".
   - Programmatic HTS pages carrying unique data, plus free tools, plus an owned email list.
   - Founder-led LinkedIn, AI-assistant distribution, and a non-broker affiliate channel.
   - Cold calls, SDRs, agencies, trade-show booths and broad paid social don't pay at $12–149/mo [V/I].
4. **Where to niche down:**
   - **#1: importers and distributors of Section 232 metal derivatives** (fasteners, tools, hardware, valves, machinery parts). Rolling inclusions keep changing, and they gather in one place (STAFDA, about 2,000 members).
   - **#2: furniture and cabinet importers**, with a hard deadline: the 232 wood rates rise on Jan 1, 2027.
   - Your own Search Console data agrees with #1: the metal chapters are your biggest product cluster.
5. **What to monetize:**
   - A flat-fee prior-entry audit report.
   - Annual plans with that audit included.
   - A multi-client plan for forwarders and 3PLs.
   - Later: an API, a Sheets add-in, and Slack/Teams and seats as tier gates.
6. **What to give away:**
   - Watch up to 3 codes by email, forever.
   - A Tariff Exposure Report for a pasted catalog (headline free).
   - The overpayment check headline.
   - Niche tools: a 232 derivative checker and a Jan 1, 2027 wood-tariff calculator.
   - A price-increase letter generator.
   - Weekly digests per HS chapter.
7. **What to guarantee:**
   - *"Alerted within 1 business day of an official change to your tracked imports, or your next month is free."*
   - A full refund for 30 days after the first payment.
   - On the paid audit report: *"If we don't flag anything worth reviewing with your broker, we refund the report."*
   - Never guarantee savings, refunds, accuracy or penalties. That reads as customs business or insurance, and it breaks the FTC rules on guarantees [V].

## 1. What needs to change about the product

The Tracker already does a lot: catalog, impact alerts by email, Slack and Teams, impact checks, rate history, Insights, savings detection, entry audit, AD/CVD, sourcing. Its weak points are getting data in, what the user does with an alert, and what happens next. In order:

**1.1 Get data in within 5 minutes.**
- The entry audit is a manual form (`components/tariff-tracker/entries/AuditForm.tsx`). 7501 upload is "Coming soon" (`Upload7501Card.tsx`).
- Every competitor running an audit or refund funnel takes an **ACE ES-003 upload** [V: Flexport, Wove, Gateway, UNIS, Reform]. ES-003 is a CSV the importer pulls from ACE: one file, every line, both HTS code and origin.
- **Build ES-003 import first, then 7501 PDF parsing.** It does two jobs at once:
  - it fills the catalog (unique HTS × origin pairs become tracked imports);
  - it fills the entry audit (every line checked against the duty in force on its date).
- **Also accept** a Shopify product export (its HS code and country-of-origin fields) and a broker's catalog sheet.
- **Remember the limit:** verified rate history starts Nov 17, 2025, so audits cover entries from then on. Say so on the upload screen.

**1.2 End every alert and audit in a "send to my broker" report.**
- The importer can't act on a flag; their broker files. The product's last step should therefore be a clean PDF or email: entry, line, code, rate applied vs. rate in force, the source, "please review".
- That's the moment the user feels the value. It also spreads the product, because brokers see HTS Hero on every report.
- Wording stays "possible overpayment, worth reviewing" [`unlicensed-find-flag-explain`].

**1.3 Add forward-looking alerts ("Coming up for your imports").**
- Importers plan around dates. Examples on the calendar now [V]:
  - 178 China 301 exclusions expire **Nov 10, 2026**;
  - the 232 rates on upholstered furniture, cabinets and vanities rise **Jan 1, 2027**;
  - BIS proposed **14 new 232 derivative categories** on Aug 6, 2026;
  - auto-parts 232 inclusion windows open each January, April, July and October.
- The tariff-updates feed already tracks the stages from announced to signed. Show each account a calendar of pending changes that may hit its imports, with before → after rates.
- This also fixes the trial's "dead air": something is always coming even when nothing changed this week.

**1.4 Measure alert speed, then publish it.**
- Impact alerts need your manual approval before they send (`libs/tariff-updates/alerts.ts`). Sources poll hourly.
- **Log the official publication time and the time each alert is sent**, and show the median on `/tariff-monitor` ("median 6 hours from Federal Register to your inbox").
- Speed is how Gateway and Flexport built their name [V], and the guarantee in section 7 depends on that log.
- Note that engine-v2 revisions are applied by hand (`/apply-revision`). The guarantee should cover the **announcement alert** ("this may affect 12 of your imports"), not the full engine update.

**1.5 Make the paid tiers obviously different.**
- Today every tier differs only by import count.
- Keep imports as the value metric, but gate **Slack/Teams, more than 1 seat, the broker report PDF and annual audits** at $49+ (post-launch prices) [I; standard practice, V for comparables].
- That gives a $19 buyer a reason to move up besides adding more imports.

**1.6 Clean up the surface.**
- Take the Classify band and the Playbook off the HTS and tariff pages. Classification stays sold at `/classify`, but on tariff pages it competes with the Tracker (6 offers on an HTS page today).
- Fix the leaks from the first report: sign-up mode, redirects, "Watch {code}", the bot filter.

**1.7 Later: multi-client workspaces** for forwarders and 3PLs (section 5).

## 2. What to do every single day

The rhythm comes from TaxJar (became the interpreter of sales-tax changes and got "a huge amount of inbound interest"), Gateway (updates "within 24 to 48 hours of official publication", top 3 with no ads), Gymdesk (organic content brought most of its leads; trial-to-paid rose from 20% to 35%) and Bannerbear (50% of time on marketing, a weekly public log) [V]. **Budget about 2.5 hours a day and protect it like a meeting.**

| Time | Block | What exactly |
|---|---|---|
| 30 min | **Alerts and news** | Clear the `/tariff-sources` review queue. Approve impact alerts (they don't send without you). Check the overnight Federal Register public-inspection list, CSMS, USTR and White House feeds. |
| 30 min | **One explainer per real action** | What changed, which headings, effective date, before → after % on real examples, the primary source, then "Check your codes" into Watch or the Tracker. Link it from the affected `/hts/` pages. No real action today? Write about something coming (section 1.3) or a niche page. |
| 20 min | **Distribute from your own profile** | One first-person LinkedIn post with a table or chart, an X post, a Social Studio reel when it's worth it. Founder profiles get about 2× the reach of company pages; company pages reach about 1.6% of followers [V]. |
| 30 min | **One SEO or tool improvement** | Pick a query or page at positions 5–20 in Search Console and improve it: a title test, unique data, a FAQ answer, a niche page. Every change has to point to Search Console evidence (your standing rule). |
| 20 min | **Answer importers' questions** | r/FulfillmentByAmazon, r/ecommerce, r/smallbusiness, r/supplychain, the Amazon Seller Forums' tariff threads, and LinkedIn comments under trade lawyers' and brokers' posts. Give the number and the source; link only when it directly helps. This also feeds AI citations, since Reddit is the top source for Perplexity and AI Overviews [V]. |
| 20 min | **Every new account, personally** | Reply to every sign-up and trial user from your own address: "Saw you track 40 imports from Vietnam; the Nov 10 exclusion expiry may affect these 3. Want me to load the rest?" You allowed human touch for $149+; at this volume it is worth doing for everyone. |

**Weekly**
- **Mon:** The digest goes out (cron at 13:00 UTC Monday). Add your own note at the top.
- **Wed:** One evergreen niche page or free-tool improvement.
- **Thu:** One email batch to partners (3PLs, sourcing agents, Amazon agencies) offering the affiliate program. Email only.
- **Fri:** Metrics review: sign-ups by source, day-0 activation, trial-to-paid, alert latency. Pitch one data story to the trade press (FreightWaves, Supply Chain Dive, Sourcing Journal, Global Fastener News, Furniture Today).

**Monthly:** a "Tariff Index" data report; a 30-minute live "What changed this month" session, recorded and cut into clips (Flexport runs a recurring tariff webinar series [V]); one directory or marketplace listing (Claude and ChatGPT MCP directories, G2, Capterra).

**Be realistic about timing.** Fewer than 3% of tracked indie products pass $10k MRR, and organic content compounds over months [V]. Judge the first 2 months on accounts with imports and first paying users, not MRR.

## 3. The marketing and sales strategy that scales here

**What works in this category** [V unless marked]:

1. **Be the interpreter.**
   - TaxJar grew to 9k+ customers on very little capital this way.
   - Gateway credits its rank to updates within 24–48 hours with sources.
   - You already have the feed, the AI summaries and the engine. The missing piece is wiring every explainer to "check your codes" [I].
2. **Programmatic pages with unique data, plus free tools.**
   - ImportYeti built about 478k visits a month on free public trade data.
   - TariffsAPI gets 100% of its traffic from organic search on HTS and Chapter 99 pages.
   - Your HTS pages already rank 6–8. The work now is click-through rate and conversion.
3. **An owned email list.**
   - Discover and social traffic swing; the list doesn't [V for Discover volatility].
   - Every free tool and Watch adds to it.
4. **Founder-led LinkedIn.** Importers, brokers and trade lawyers are there, and founder profiles beat company pages.
5. **AI-assistant distribution.**
   - Gateway ships an MCP server and a ChatGPT app.
   - You have the MCP server. Keep the listings current, but don't count on them for traffic.
6. **Affiliates who aren't brokers.**
   - 3PLs, forwarders, Amazon and Shopify agencies, sourcing agents, ecommerce accountants, at 20–30% recurring.
   - Logistics referral norms are $150–3,000 bounties or 5–20% revenue share [V].
   - Never pay brokers or take money from them (19 CFR 111.36).
7. **Marketplaces, once the core converts.**
   - Shopify tariff apps all have 0 reviews, so the category is empty. One case moved from #42 to #11 on reviews [V].
   - A Shopify app that reads HS code and country of origin from products is a credible second channel, but demand isn't proven yet.

**What doesn't work at this price:** cold calls, SDRs and demo-first funnels; agencies (Gymdesk said several failed); broad paid social; a company page as the only social presence; trade-show booths; thin mass-generated pages (scaled-content policy); a plain calculator with no hook (the category is crowded); expecting news traffic to convert on its own.

**Sales without selling:**
- Self-serve by default.
- Personal emails from you to every activated account.
- A "we'll load your catalog" offer for 100+ imports.
- A booked 15-minute call only for $149+ and forwarder plans.

## 4. Niche down

**Why niche.** "US importers" is too broad to reach on $1k a month. A niche gives you one association, two shows, two newsletters, a shared vocabulary and word of mouth. It doesn't need a rebrand: add an industry page, niche free tools, niche digests and niche explainers on top of the same product.

**Your own data** (Search Console, `/hts/` page impressions by chapter, last 3 months) [V]:

| Chapter | Impressions | What it is |
|---|---|---|
| 39 | 2,007 | Plastics, mostly catch-all 3926.90.99 (broad, no single community) |
| 99 | 1,538 | Chapter 99 tariff headings (brokers and compliance staff) |
| 85 / 84 | 1,197 / 914 | Electrical / machinery |
| 61 / 62 / 64 | 1,005 / 392 / 512 | Apparel and footwear |
| 94 | 821 | Furniture |
| **72 + 73 + 76 + 82 + 83** | **~2,100 combined** | **Iron/steel, steel articles (fasteners 7318), aluminum, tools, hardware. All Section 232 metal territory.** |

**Beachhead #1: importers and industrial distributors of Section 232 metal derivatives.**
- **Pain** [V]:
  - The derivative list keeps moving: 407 codes added Aug 2025.
  - It was restructured on Apr 2, 2026: 50% for Annex I-A, 25% for I-B, applied to the **full value**, with rolling additions.
  - In June 2026 the US-metal content threshold dropped from 95% to 85%.
  - On Aug 6, 2026, BIS proposed 14 more categories.
  - Goods under 232 skip the new Section 301, so being a derivative changes the whole stack.
  - AD/CVD hits nails and aluminum extrusions too (new petition: 15 countries, 28–257%).
- **Why it fits:** "Is my code a derivative, at which annex rate, and what happens to my 301?" is exactly what your engine answers.
  - Catalogs of 40–300 pairs fit the $49–149 tiers [I].
  - Buyers gather in one place: STAFDA (about 2,000 members; convention Nov 15–17, 2026), Fastener Fair USA (May 2027), Global Fastener News, Fastener World [V].
  - No self-serve tool targets them [I].
- **Positioning:** *"Know the day one of your codes becomes a 232 derivative, at which rate, and what it does to your 301 stack."*
- **Build:**
  - a free **232 Derivative Checker** (one page per key heading: 7318, 8481, 8482, 8205–8207, 7326, 7616);
  - a "Derivative Watch" email after every BIS or proclamation action, with comment deadlines;
  - `/industries/metals-fasteners-tools` with a sample impact check;
  - guest explainers for the fastener trade press.

**Beachhead #2 (time-boxed campaign): furniture, cabinet and vanity importers.**
- **Pain** [V]:
  - The Section 232 wood rates (25% now) go to **30% on upholstered and 50% on cabinets and vanities on Jan 1, 2027**, unless a country has an agreement.
  - The AD/CVD scope on Chinese cabinets now reaches cabinets finished in Malaysia or Vietnam.
  - Vietnam pays 12.5% under the new 301 on goods outside 232.
  - HS 94 imports were $61.1B in 2025.
  - The trade association (HFA) is telling members to "audit their import pipeline".
- **Why now:** the deadline gives you a 9-week countdown campaign. Las Vegas Market (Jan 24–28) and High Point (Apr 10–14) follow [V].
- **Build:**
  - a free **"Jan 1, 2027 wood tariff" calculator** (per SKU: today vs. Jan 1, with caveats about country agreements);
  - a cabinet and vanity AD/CVD scope checker;
  - furniture country comparisons (Vietnam / Malaysia / Mexico / India);
  - pitches to Furniture Today and Home News Now.
- **Check first:** whether any country agreements on wood were signed after January 2026. The research couldn't confirm.

**Third, if one of the first two works:** auto-parts aftermarket (232 inclusion windows every quarter, AAPEX Nov 3–5) [V].

**Not beachheads:**
- Amazon/FBA private label: many ship DDP and aren't the importer of record; low willingness to pay. Good top-of-funnel traffic, weak payers.
- Apparel: bigger brands have brokers.
- Toys, wine, cosmetics: less change, fewer lines.
- Brokers: a partner channel later, not a beachhead.

## 5. What to monetize that you aren't

| Offer | Price idea | Why and how | Status |
|---|---|---|---|
| **Flat-fee prior-entry audit report** | $299–499 by entry volume | The SMB demand that refund firms serve at 15–25% contingency [V], at a flat fee the importer pays you. Legal: you flag, their broker files. Comes with the "find-it-or-free" guarantee. Credit it toward an annual plan. | `/tariff-audit` already collects requests |
| **Annual plans with an audit included** | List price × 12 − 15% (exists) | Annual cash, less churn. Including a yearly audit report gives a reason to pay annually beyond the discount. | Discount exists; add the audit |
| **Multi-client plan for forwarders and 3PLs** | $299–999/mo | Pooled imports across client workspaces, co-branded alerts. Wove gives tariff data to forwarders [V]; nobody sells forwarders an alerting tool for their clients [I]. Flat licence only, never per-transaction pay from a broker. | Teams exist for classification (`app/api/importers`); build after the core converts |
| **Tier gates** | Within $49–249 | Slack/Teams, seats, the broker report PDF, the forward calendar. | Slack/Teams built, not gated |
| **API / Google Sheets add-in** | $99–299/mo | TariffsAPI charges $199/mo for 100k calls [V]. A Sheets function like `=HTSHERO_DUTY()` suits brokers and procurement teams. | MCP exists; REST API doesn't |
| **Training: "Tariff basics for importers"** | $49–199 | NCBFAA certificate courses cost $715–1,450 [V]. Low priority; good as a lead magnet if free. | — |
| **Sponsorship in the digest** (non-broker vendors: trade finance, freight, FX) | Later | Only once the list is big; disclose it (FTC). | — |
| **Classification** | As is | Keep it at `/classify`, off the tariff pages. | Live |

**Don't:** take referral fees from refund-claim buyers (claims trade at about 20–40¢ on the dollar [V]). It works against importer-first trust and looks like steering claims. The same goes for any per-transaction pay from brokers.

## 6. What to give away to build the funnel

**What made the big free tools work** (HubSpot Website Grader: 2M sites graded; Ahrefs' free tools; Wise's rate-alert pages; Flexport's and Wove's tariff tools) [V]:
1. one input the user already has;
2. a personal result worth forwarding to a boss;
3. a free headline with detail behind an account;
4. a reason to come back.

Your calculator has 1 and 2. Add 3 and 4.

| # | Free tool | Gate | Funnel value |
|---|---|---|---|
| 1 | **Watch up to 3 codes, forever** (email when the duty on a code changes) | Email / Google one-tap | Wise's rate-alert mechanic. Recurring touchpoints, and each alert says "this may also hit N imports you don't watch". **This changes PRICING.md (free plan = 0 alerts today); your call.** |
| 2 | **Tariff Exposure Report** (paste or upload a catalog CSV → every import's current stack, what's coming, possible savings) | Headline free; per-line report needs an account | The upload is the Tracker's own data, so going paid is one click. A PDF the user forwards to the CFO. |
| 3 | **Overpayment check** (ES-003 upload) | Headline free; line detail needs an account; ongoing audits paid | The audit front door; refund firms prove demand [V]. |
| 4 | **232 Derivative Checker** (niche #1) | None; "watch this heading" CTA | High-intent professional searches; feeds Watch. |
| 5 | **Jan 1, 2027 wood tariff calculator** (niche #2) | None; per-SKU report needs an account | Deadline urgency. |
| 6 | **Price-increase and supplier letter generator** (enter code, origin, cost → per-unit impact plus a ready letter to the supplier asking to share costs, or to customers announcing a price change) | Email | Shared inside companies and between them; cheap to build; plain business correspondence, nothing to do with customs. |
| 7 | **Weekly digest by HS chapter** | Email | Uses the existing Tariff News pipeline; grows the list by niche. |
| 8 | **"Coming up" tariff calendar** (public version of 1.3) | None; "for your imports" needs an account | Linkable, quotable, fresh every week. |
| 9 | Calculator, AD/CVD check, sourcing compare, MCP, embed widget | As today | Keep. The embed earns links. |
| — | CAPE refund eligibility and deadline checker | — | Crowded (Wove, Flexport, Reform) and only covers IEEPA entries from Nov 17, 2025. Fold it into #3 instead. |

## 7. Guarantees that sell and stay legal

**The rules** [V]:
- **FTC 16 CFR 239.** Say "money-back" or "satisfaction" guarantee only if you refund the **full price** on request. Disclose any conditions prominently. Advertise only what you honor promptly.
- **Customs.** Never promise to pay duties, penalties or the cost of a CBP finding. That vouches for entry accuracy (customs business) and starts to look like insurance [I, from 19 CFR 111]. Zonos can guarantee landed cost only because it collects the duty itself [V].
- **Your own rule.** Savings are always potential, so no "save $X or it's free".
- **Comparables.** Avalara and TaxJar cap their accuracy guarantees at fees paid (12 months of fees, or 2× fees) [V]. SaaS service-level credits are usually 5–25% of the fee, capped, paid as account credit [V].

**The three to offer:**

**A. Change Alert Guarantee** (the headline, on brand, capped at one month of fees)
> *"If an official change to the duty on one of your tracked imports is published in the Federal Register or an HTSUS revision and we don't alert you within 1 business day, your next month is free. Tell us within 30 days."*
- **Needs:** the latency log from 1.4. Clear definitions: "official" means FR public inspection or the USITC revision release; "tracked" means in the catalog at the time; "alert" means email, in-app, Slack or Teams. Exclude guidance that only appears in CSMS.
- **Key risk:** alerts need your approval, so this commits you to reviewing every business day. That's in the daily routine. Arrange cover for vacations, or pause the guarantee with notice.

**B. 30-day money-back on the first payment**
> *"Not worth it? Email within 30 days of your first payment for a full refund, no questions asked."*
- With a no-card trial in front of it, the lift is modest. It removes the last objection on annual plans.
- Anecdotal refund rates are under 5–10% [V, vendor blogs]. Keep it unconditional, or don't call it money-back.

**C. Find-it-or-free on the paid audit report**
> *"If our audit of your entries doesn't flag at least one possible overpayment, rate mismatch or savings opportunity worth reviewing with your broker, we refund the report fee."*
- It triggers on **your flag**, never on money recovered. So it isn't a contingency fee, it isn't a refund promise, and it stays find-flag-explain.
- Require a minimum dataset, e.g. 50+ entry lines since Nov 17, 2025.

**Don't offer:** an accuracy guarantee on duty calculations, "we'll cover penalties", a dollar ROI guarantee, or "next year free if we don't save you X".

## 8. The order to do it in (next 12 weeks)

| Weeks | Product | Marketing |
|---|---|---|
| 1–2 | Funnel leaks; Watch {code}; bot filter; latency log; classify offers off tariff pages | Start the daily routine; Nov 10 exclusion-expiry explainer; Nov 13 launch-price emails; personal notes to every account |
| 2–5 | ES-003 import (catalog + audit); broker report PDF | Jan 1, 2027 wood countdown: calculator, page, pitches |
| 4–7 | "Coming up" calendar; 232 Derivative Checker; Tariff Exposure Report | `/industries/` pages for metals and furniture; STAFDA (Nov 15–17) as a visitor, not a booth |
| 6–9 | Flat-fee audit report with guarantee C; guarantees A + B live once 4+ weeks of latency data exist; tier gates | Affiliate program; first monthly Tariff Index; $300 ads test on the audit and refund terms |
| 9–12 | Price-increase letter generator; chapter digests; scope the forwarder plan | Recorded monthly live session; scale whichever channel paid back |

## 9. Decisions that are yours

1. **Free Watch on 3 codes:** this changes the free plan from 0 alert imports. Yes or no?
2. **Beachhead:** metals/fasteners as the long-term niche, plus the furniture deadline campaign? Or a different niche you know better from your classification customers?
3. **Guarantee A** commits you to approving alerts every business day. OK?
4. **Flat-fee audit:** price ($299 / $499), and how much hands-on review per report you're willing to do.

## Sources

Guarantees: [Avalara guarantee](https://www.accountingtoday.com/news/avalara-adds-tax-accuracy-guarantee), [TaxJar guarantees](https://www.taxjar.com/guarantees), [Zonos landed cost guarantee](https://zonos.com/docs/global-ecommerce/landed-cost/guarantee), [FTC 16 CFR 239](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-239), [Dynatrace SLA](https://dynatrace.com/sla/saas), [guarantee lift anecdotes](https://conversionfanatics.com/does-a-money-back-guarantee-matter/), [19 CFR 111.36](https://www.law.cornell.edu/cfr/text/19/111.36), [HQ 113965](https://open-gov.usebase.io/rulings/113965).

Free tools and monetization: [HubSpot Website Grader](https://hubspot.com/blog/bid/5539/Website-Grader-Analyzes-Over-2-Million-Sites), [Ahrefs free tools](https://ahrefs.com/free-seo-tools), [Wise pSEO](https://backlinko.com/programmatic-seo), [Flexport refund calculator](https://www.businesswire.com/news/home/20260120812295/en/Flexport-Launches-Tariff-Refund-Calculator-Giving-Businesses-Early-Insight-Into-Possible-Tariff-Refunds), [Flexport broker audit](https://www.flexport.com/audit-your-customs-broker/), [Wove refund calculator](https://wove.com/blog/ieepa-tariff-refund-calculator), [Wove for forwarders](https://www.freightwaves.com/news/wove-speeds-tariff-change-info-for-forwarders-tms-and-its-free), [TariffsAPI pricing](https://tariffsapi.com/pricing), [NCBFAA certifications](https://dot.egr.uh.edu/programs/professional/national-customs-brokers-forwarders-association-of-america-certifications), [refund claim market](https://www.wunc.org/2026-02-25/the-market-for-tariff-refunds), [CAPE phase 3](https://www.thompsonhinesmartrade.com/2026/09/cbp-confirms-october-6-2026-launch-of-phase-3-of-the-ieepa-tariff-refund-process/).

Founder go-to-market: [TaxJar CEO](https://www.insightpartners.com/blog/growth-gurus-mark-faggiano-ceo-of-taxjar/), [Gymdesk](https://erangalperin.com/2024/07/17/how-i-bootstrapped-a-b2b-saas-to-7-figures-in-arr/), [Bannerbear](https://www.starterstory.com/stories/bannerbear-breakdown), [Plausible](https://plausible.io/blog/open-source-saas), [indie MRR base rates](https://stealwhatworks.com/blogs/news/solo-projects-over-10k-per-month), [Gateway Lines growth](https://gatewaylines.com/news/how-gateway-lines-built-goto-us-import-tariff), [Flexport simulator launch](https://wwd.com/sourcing-journal/logistics/flexport-tariff-simulator-launch-importers-costs-trump-tariffs-forecasting-1238852409/), [Flexport webinars](https://www.flexport.com/webinars/tariff-trends-2025-expert-insights-on-the-new-u-s-customs-landscape-june-4-2025/), [ImportYeti](https://mywifequitherjob.com/episode453/), [founder vs company LinkedIn](https://www.revboss.com/founder-led-marketing-benchmarks), [company page reach](https://www.tryordinal.com/blog/the-declining-reach-of-linkedin-company-pages), [Discover breaking news](https://pressgazette.co.uk/media-audience-and-business-data/us-publishers-see-traffic-boost-for-breaking-news-from-google-discover/), [Shopify ranking case](https://blog.appjubilee.io/shopify-app-store-ranking-trends-case-study), [GoFreight referrals](https://gofreight.com/referral-program).

Niches: [232 metals restructure, FR 2026-06960](https://www.federalregister.gov/documents/2026/04/09/2026-06960/strengthening-actions-taken-to-adjust-imports-of-aluminum-steel-and-copper-into-the-united-states), [CRS on June changes](https://www.congress.gov/crs-product/IN12519), [BIS 14 proposed categories](https://kpmg.com/us/en/taxnewsflash/news/2026/08/us-bis-section-232-tariffs-derivative-articles.html), [Aug 2025 derivative additions](https://www.govinfo.gov/content/pkg/FR-2025-08-19/html/2025-15819.htm), [Section 301 forced-labor tariffs](https://www.honigman.com/alert-3462), [China 301 exclusions to Nov 10](https://ustr.gov/about/policy-offices/press-office/press-releases/2025/november/ustr-extends-exclusions-china-section-301-tariffs-related-forced-technology-transfer-investigation), [aluminum extrusion petition](https://natlawreview.com/article/it-again-new-antidumping-and-countervailing-duty-petitions-aluminum-extrusions), [STAFDA](https://stafda.org/conventions/), [wood 232 delay to Jan 1, 2027](https://www.thompsonhinesmartrade.com/2026/01/president-trump-delays-section-232-tariff-increase-on-wood-furniture-cabinets-and-vanities/), [cabinet AD/CVD scope](https://www.compositepanel.org/u-s-issues-final-scope-ruling-on-cabinet-and-vanity-imports-from-malaysia-and-vietnam/), [furniture imports 2025](https://eightx.co/blog/furniture-import-cost-tracker-2026), [HFA guidance](https://www.furnituretoday.com/tariffs/hfa-offers-insight-on-stacking-of-president-trumps-proposed-tariffs), [High Point Market](https://www.highpointmarket.org/about), [auto parts 232 inclusions](https://www.autocare.org/detail-pages/blog/gtsc/2025/07/07/commerce-announces-process-to-add-auto-parts-to-section-232-tariffs).
