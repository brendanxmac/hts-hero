# Selling the partner plan to brokers, forwarders, 3PLs and consultancies (target: 5-15 paying partners by Feb-Mar 2027)

Scope note: research done 2026-11-03 with about 18 search/fetch calls. Facts marked "(prior report)" come from the earlier HTS Hero reports in `reports/` and were not re-verified here. Partner plan under study: "Duty Guard for Trade Professionals", from $299/mo for 10 clients, then $25/client, sold through demos.

## 1. Market size and which segment buys fastest

### Takeaway
The pool is about 14,000 licensed individual brokers, about 1,400 NCBFAA member firms and 9,000+ FMC-licensed ocean intermediaries. That is far more than a 5-15 partner goal needs. The fastest buyers are probably small independent brokers and small forwarders/3PLs (1-30 staff). Big forwarders build their own tools, and small firms are the ones absorbing the tariff workload by hand. Forwarders and 3PLs have a further advantage: they are not bound by the broker fee-sharing rule.

### Cited Findings
- About 14,454 licensed customs brokers (individuals); NCBFAA's roughly 1,400 member firms; brokers handle more than 97% of US import entries — (prior report) [CBP](https://www.cbp.gov/node/77830); [NCBFAA](https://www.ncbfaa.org/about-ncbfaa)
- 9,000+ FMC-licensed ocean transportation intermediaries — (prior report) [FMC](https://www.fmc.gov/?p=6327)
- Census counts about 239,000 identified US importers, 97% of them small or medium. These are the end clients that partners serve — (prior report) [Census](https://www.census.gov/foreign-trade/Press-Release/edb/2024prelimprofile.pdf)
- US customs brokering is estimated at roughly a $5B industry. Reuters described "mom-and-pop" and family-run brokers (for example Imperial Freight Brokers, Miami, 54 years old) alongside giants (FedEx, DHL, UPS) that bundle brokerage with shipping — [AJOT/Reuters](https://www.ajot.com/news/us-importers-turn-to-brokers-to-navigate-trump-era-tariffs-at-a-cost)
- Large forwarders built their own tariff tools: Flexport's simulator and refund calculator, C.H. Robinson Tariff Impact Analysis, UPS Global Checkout. They compete with HTS Hero rather than partner with it — (prior report) [FreightWaves](https://www.freightwaves.com/news/firms-launch-tools-to-help-shippers-measure-tariff-costs)
- HTS Hero's current paying customers (classification plans) are mostly importers, forwarders and 3PLs, with very few brokers — (prior report, internal Mixpanel) `reports/HTS Hero growth strategy.md`
- NCBFAA membership has Regular, Affiliate and Associate classes. Importers and manufacturers cannot join (they use NEI membership instead) — [NCBFAA events page](https://ncbfaa.org/membership-benefits/conferences-events)

### Inferences
- Segment ranking, most to least likely to pay quickly:
  - **(a) Existing forwarder/3PL classification customers.** They are warm, already trust the data, and have importer clients. They are not brokers, so revenue share or referral fees are allowed.
  - **(b) Small independent brokers (1-20 staff, 30-150 importer clients).** Their pain is highest, and they field "dozens of questions daily". They are slower and more suspicious (see objections).
  - **(c) Independent trade compliance consultants.** Their client counts are small, so the 10-client minimum may be too much for some. They suit a referral deal better than the $299 plan.
  - **(d) Amazon/e-com 3PLs and prep centers.** Many of their clients ship DDP through a forwarder acting as importer of record. Fit varies.
- With only 5-15 deals needed, the partner count is not the limit. Trust and timing are.

### Gaps
- No public count of firms by size (for example, brokerages with under 20 staff). CBP lists individual licenses and filer codes, not firm headcount.
- No source on the share of NCBFAA members that are forwarders vs brokers.

## 2. Their 2025-2026 pain and current tools

### Takeaway
Brokers absorb rule churn by hand. HTS revisions hit version 31 in 2025, automation was "thrown out", work gets redone after late changes, and clients send a constant stream of "what do I owe" questions. Their filing platforms (CargoWise, Descartes, Magaya, CustomsCity) handle entries, not monitoring each client's products for changes. That gap is what HTS Hero fills. A few small startups are now chasing the same gap.

### Cited Findings
- Laredo independent broker JD Gonzalez (also NCBFAA president) fields dozens of questions daily from clients unsure what they owe. He said "some of the automation we've used has been thrown out, so there's more work to do" — [AJOT/Reuters](https://www.ajot.com/news/us-importers-turn-to-brokers-to-navigate-trump-era-tariffs-at-a-cost)
- Late changes force rework: brokers who cleared shipments ahead of time have to "come back and retroactively redo it and fix it" (Imperial Freight Brokers) — [AJOT/Reuters](https://www.ajot.com/news/us-importers-turn-to-brokers-to-navigate-trump-era-tariffs-at-a-cost)
- Fees: previously about $4-7 per HTS code. Some brokers added $1-5 per code. A&A Customs Brokers added $3 per product type because of "tariff stacking" — [AJOT/Reuters](https://www.ajot.com/news/us-importers-turn-to-brokers-to-navigate-trump-era-tariffs-at-a-cost)
- Staffing: DHL grew its US customs entry headcount 30%. FedEx had 40+ open customs postings and UPS 10 (June 2025) — [AJOT/Reuters](https://www.ajot.com/news/us-importers-turn-to-brokers-to-navigate-trump-era-tariffs-at-a-cost)
- The HTS reached version 31 by end of 2025, when one or two versions a year is normal (vendor source) — [Gaia Dynamics](https://www.gaiadynamics.ai/blog/from-version-2-to-version-31-what-2025-did-to-global-trade)
- A NY/NJ forwarders association leader said brokers relied on manual reviews because automation could not be trusted 100%, and that firms invested in compliance teams and technology upgrades — [JOC](https://www.joc.com/aro/al-raffa-president-and-vp-new-yorknew-jersey-foreign-freight-forwarders-and-brokers-association-6179362)
- A vendor illustration (not data): 75 clients x 200 codes = 15,000 client-code pairs to check per notice. Manual checks catch headlines but miss long-tail changes (expiring exclusions, new 232 subheadings). A custom alert system cut a broker's (Jet Import Brokers) per-update work from "a day or two per client" — [GingerControl](https://gingercontrol.com/blog/trade-policy-alerts-for-customs-brokers); [GingerControl](https://gingercontrol.com/blog/trade-compliance-software-customs-brokers-2026)
- Tools in use: CargoWise ("over 17,000 organizations"), Descartes (quote-based), CustomsCity (ABI per transaction, $49/mo for 20 up to $1,999/mo for 10,000), Amari (AI entry automation), Gaia (from $99/mo), GingerLite ($150/mo for 300 credits) — [GingerControl comparison](https://gingercontrol.com/blog/trade-compliance-software-customs-brokers-2026)
- CargoWise pricing hikes have forwarders feeling "trapped" — [The Loadstar](https://theloadstar.com/forwarders-trapped-in-cargowise-monopoly-as-new-pricing-hikes-costs/)
- IEEPA refunds: the importer of record receives refunds, but a broker may submit claims (CAPE). UPS sells a fee-based CAPE filing service and a multi-broker advisory — [UPS](https://www.ups.com/cn/en/supplychain/logistics-solutions/customs-brokerage/us-customs-tariff-refunds); CAPE went live April 20, 2026 — (prior report) [KPMG](https://kpmg.com/us/en/taxnewsflash/news/2026/04/us-cbp-launches-ieepa-refund-tool.html)
- Brokers won't take refund claims under about $100k (Pax), which leaves SMB importers underserved — (prior report) [Sacra](https://sacra.com/research/penny-chen-pax-ai-powered-tariff-refunds/)

### Inferences
- The pitch should be "answer the 'does this hit my client?' question across every client in minutes, and look proactive". It should not be "replace your filing system". HTS Hero sits beside CargoWise and CustomsCity, not in place of them.
- Brokers raising per-code fees shows tariff complexity is billable. Brokers could resell monitoring as a "tariff watch" service line, which makes the per-client $25 easier to justify.
- Potential overpayment flags on past entries help small brokers with refund workload (sorting which clients to file for). They can also read as a threat ("you got it wrong"). Frame them as "find clients worth a CAPE/PSC review".

### Gaps
- No 2026 broker survey quantifying time spent per tariff change or client question volume. Search found none. NCBFAA may have member surveys that are not public.
- No Reddit or r/CustomsBroker threads surfaced in search. Broker sentiment there is unverified.

## 3. How competitors sell to brokers and forwarders

### Takeaway
The broker channel is filling up with small startups: TariffDesk, US Tariff Rates "Broker AI" ($499/mo branded portal), Global Tariff Rates broker tier, GingerControl custom builds, Stable Software white-label drawback and portal, CargoTrans and Villalon white-label add-ons. Almost none publish per-client pricing or proof of traction. Refund firms recruit referral partners (CPAs, advisors) with a cut of collected fees. HTS Hero's $299 + $25/client is mid-market against these and simpler to understand.

### Cited Findings
- US Tariff Rates sells a white-label "Broker AI" portal at $499/month — (prior report) [ustariffrates.com](https://ustariffrates.com/broker-ai) (page returned 403 on 2026-11-03; not re-verified)
- TariffDesk: multi-client dashboard, CSV client import, bulk alerts, weekly reports, CAPE refund workbench, white-labeled client emails, API/MCP. No public pricing. Its TrustMRR listing suggests an early stage — [TrustMRR](https://trustmrr.com/startup/tariff-desk)
- Global Tariff Rates broker tier: real-time alerts tied to the HS codes in a broker's portfolio, multi-client dashboard, API, dedicated broker support. Branding not stated — [globaltariffrates.com](https://www.globaltariffrates.com/for-brokers)
- GingerControl: white-label direct-to-client alerts are a custom build only (GingerLite does not include them). It also files CAPE/§1514 refund packages directly — [GingerControl](https://gingercontrol.com/blog/trade-policy-alerts-for-customs-brokers); [GingerControl refund estimator](https://gingercontrol.com/vi/tools/ieepa-refund-estimator)
- Stable Software: DrawbackAI, a flat-license white-label for brokers who file under their own filer code, plus a white-label broker client portal — [Stable Software](https://www.stablesoftware.com/alternatives/drawback-software-for-customs-brokers); [Broker Portal](https://www.stablesoftware.com/platform/broker-portal)
- CargoTrans sells tariff intelligence as an add-on "under your brand and your client relationship". Villalon sells white-label client apps with clearance alerts — [CargoTrans](https://cargotransinc.com/tariff-solutions-for-customs-brokers/); [Villalon](https://www.villalon.engineering/customs-broker-software/)
- Tariff Refund Agency offers brokers its refund program under the broker's brand, co-branded, or as a referred partner service — [tariffrefundagency.com](https://tariffrefundagency.com/lp/brokers)
- Freight Right's IEEPA refund partner program targets CPAs, tax professionals, finance directors, lawyers and trade/compliance advisors. Fees are customized and paid only on fees Freight Right collects, within 30 days after month-end. Sub-affiliate overrides are allowed. The partner keeps the client relationship — [Freight Right](https://www.freightright.com/ieepa-tariff-refund-partner-program)
- Refund firms (Tarifflo, Declaro at 20%, Leyton) run on 15-25% contingency. Cervo and Tarifflo use brokers as a channel — (prior report) [growth strategy sources](https://www.techbuzznews.com/tarifflo-leverages-agentic-ai-to-automate-tariff-classification/)
- Legal constraint from prior brokerage-limits research: under 19 CFR 111.36(b), HTS Hero should not take commissions, percentages or per-entry fees tied to broker transactions. A flat software subscription not tied to transactions is the safe shape. Referral fees to non-broker forwarders/3PLs are fine — (prior report) `reports/Tariff tool distribution channels.md`

### Inferences
- Pricing position: $299 for 10 clients sits between GingerLite ($150, no white-label) and Broker AI ($499). Per-client pricing ($25) is unusual in this field and easy to explain to a broker as "about $25 per client per month, and you can bill clients more".
- Differentiators competitors don't show publicly: full duty stacking (Chapter 99, exemptions, AD/CVD) in the same alert, potential overpayment flags on past entries, and sourcing comparisons. Lead demos with a real client's import list.
- Copy the refund firms' partner mechanics only for non-brokers. For brokers, offer a co-branded service, not a revenue share.

### Gaps
- Tarifflo, Caspian, Zonos, Avalara and Descartes partner terms were not retrieved (budget limit). Kroll-style payments to brokers for refund referrals were not found.
- No competitor discloses partner counts or churn.

## 4. Channels without cold calling, and the Nov 2026 - Mar 2027 calendar

### Takeaway
No major national broker event falls inside the window. The NCBFAA Annual Conference (Apr 11-14, 2027, Orlando) comes just after it, and TPM 2027 (likely Feb 28-Mar 3, Long Beach; unverified) is a forwarder/shipper event. The 3-4 month push therefore has to run on LinkedIn (founder content plus personalized DMs), existing customers, regional association webinars and newsletters, and a free "client tariff impact report" as the door opener. Conferences become the closing and expansion venue in April.

### Cited Findings
- NCBFAA 2027 Annual Conference: April 11-14, Renaissance Orlando at SeaWorld, "over 700" attendees (brokers, forwarders, regulators). It has exhibitor and sponsorship pages; prices not retrieved. The NCBFAA page lists no events between Nov 2026 and Mar 2027. GTE 2027: Aug 1-3, Louisville. GAC 2027: Sept 19-21, DC — [NCBFAA](https://ncbfaa.org/membership-benefits/conferences-events)
- NCBFAA has an Affiliate Presidents Network linking the regional associations — [NCBFAA](https://ncbfaa.org/membership-benefits/conferences-events)
- TPM 2027 is listed for Feb 28-Mar 3, 2027, Long Beach, but only on a sponsor page that may be a reused template. TPM 2026 ran Mar 1-4 — [STG USA](https://www.stgusa.com/conferences/tpm-2026/) (unverified)
- LACBFFA runs virtual webinars with outside speakers (for example a CPSC Import Surveillance webinar, Aug 19, 2026) and in-person mixers (summer mixer, Long Beach, Aug 6, 2026) — [CPSC calendar](https://www.cpsc.gov/Newsroom/Public-Calendar/2026-08-19-140000/Office-of-Import-Surveillance-Presents-to-the-Los-Angeles-Customs-Brokers-and-Freight-Forwarders-Association); [FTZ Consultants](https://ftzconsultants.com/events/2026-summer-mixer/); [LACBFFA](https://www.lacbffa.org/)
- NY/NJ Foreign Freight Forwarders and Brokers Association leadership is quoted in JOC on tariff burdens, which makes it a plausible webinar or newsletter host — [JOC](https://www.joc.com/aro/al-raffa-president-and-vp-new-yorknew-jersey-foreign-freight-forwarders-and-brokers-association-6179362)
- SBDCs and trade groups already demo third-party tariff tools in sessions — (prior report) [SBA](https://www.sba.gov/event/79766)
- HTS Hero's GSC data shows bare Chapter 99 queries (for example `9903.05.93`) that are mostly broker/compliance searchers. That is inbound intent that could be routed to a "for trade professionals" page — (prior report) `reports/HTS Hero growth strategy.md`

### Inferences
- Channel priority for this window:
  1. Email or call existing forwarder/3PL classification customers (warm, no cold calling).
  2. A broker CTA on `/hts/9903.*` pages and the calculator ("Monitor this for all your clients"), aimed at the broker search traffic already arriving.
  3. LinkedIn: 3 posts/week showing a real tariff change and "here's how many importer clients this would hit", plus DMs to people who engage and to targeted brokers.
  4. Pitch regional associations (LACBFFA, NY/NJ, Florida, Chicago, Houston, Laredo) for a free "tariff change monitoring across your client book" webinar slot or newsletter feature.
  5. Book NCBFAA April 2027 meetings ahead of time with pipeline prospects, if not exhibiting.
- Under a $1,000/mo budget, skip exhibiting at TPM and NCBFAA unless prices are confirmed low. Attending NCBFAA requires eligibility (HTS Hero may qualify as an Associate member; check).

### Gaps
- No 2026-27 event calendars found for the Florida (FCBF), Chicago, Houston or NY/NJ associations. They need direct site checks.
- NCBFAA associate membership and exhibitor/sponsor prices not retrieved.
- No source on how active broker groups on LinkedIn or Facebook are, or on Upwork broker counts.

## 5. What a winning offer looks like, and objections

### Takeaway
The offer that fits a skeptical small broker: start with a free client tariff impact report built from one of their real clients' product lists (or a 30-day pilot on up to 10 clients). Then $299/mo flat with co-branded alerts that go out under the broker's name, so the broker looks proactive and owns the client. Address three objections directly: client poaching, data security, and liability or accuracy.

### Cited Findings
- Competitors frame white-label as "under your brand and your client relationship" and alerts "with the broker copied". That shows client ownership is the main selling point — [CargoTrans](https://cargotransinc.com/tariff-solutions-for-customs-brokers/); [GingerControl](https://gingercontrol.com/blog/trade-policy-alerts-for-customs-brokers)
- Freight Right's referral model explicitly lets the partner "keep the client relationship" — [Freight Right](https://www.freightright.com/ieepa-tariff-refund-partner-program)
- Accuracy and liability: brokers keep supervision duties. A CBP statement, quoted by a vendor and unverified, says a broker relying solely on AI classification likely isn't meeting supervision obligations. An attorney described a client owing millions after software accepted an exemption it shouldn't have — [search summary of vendor and law-firm sources](https://ustariffrates.com/best/best-customs-broker-software); [Faegre Drinker](https://www.faegredrinker.com/en/insights/publications/2025/7/mollie-sitkowski-comments-on-ever-changing-tariffs-in-bloomberg-law)
- Prior growth plan: automatic audits can feel threatening to a broker, so brokers should self-select — (prior report) `reports/HTS Hero growth strategy.md`

### Inferences
- Offer structure:
  - Free tier: a "client tariff impact report", a co-branded PDF/page covering one client's top SKUs with current full duty stacked, pending changes and possible exposure. It is made in the demo and they can forward it to the client.
  - Pilot: 30 days free, up to 10 clients, with a founder-run setup (CSV of client SKUs).
  - Paid: $299 + $25/client, annual discount. A founding-partner price lock for the first 10 partners gives a reason to sign before the NCBFAA April conference.
- Objection answers:
  - **Poaching:** HTS Hero never markets to partner clients. Alerts carry the partner's brand. Say no-solicit in the terms.
  - **Data:** client lists stay in the partner's workspace, no data resale, export/delete on request.
  - **Liability:** "decision support; you review and file". Never "guaranteed". Savings copy is always "may qualify / could".
- For forwarders/3PLs (non-brokers), add a referral path: a recurring % for importers who sign up for their own Duty Guard. Not for licensed brokers.

### Gaps
- No primary interviews or survey data on brokers' top objections to third-party tariff tools.

## 6. Benchmarks and funnel math for 5-15 partners in ~17 weeks (Nov 3 - Feb 28)

### Takeaway
Using LinkedIn benchmarks for logistics (about 32% acceptance, about 12% reply to messages once connected) and SMB demo-to-close of 10-30%, about 20 targeted connection requests a day reaches roughly 4-5 partners by itself. Getting to 10+ needs warm sources (existing customers, inbound broker traffic, association webinars) to add about 1-2 demos a week. Plan on 2-4 demos a week and a 30-60 day cycle.

### Cited Findings
- LinkedIn, logistics and supply chain (May 2025-Apr 2026, 72 accounts, 93,652 requests): acceptance 32.3%, note reply 3.4%, message reply 11.8%. Cross-industry: 28.5% / 3.0% / 10.4%. Small sample — [Expandi](https://expandi.io/industry-benchmarks/logistics-and-supply-chain/)
- Belkins 2026: messages to existing connections get a 12.2% reply rate. Connection requests with a personalized note: 25.3% accept / 8.2% reply; without a note: 27.6% / 5.3% — [Belkins](https://belkins.io/blog/linkedin-outreach-study.md)
- Demo-to-close: Optifai (939 companies) B2B 25%, SaaS 30%, SMB about 32%. Visionary median 18.7%, SMB horizontal SaaS 9.2% — [Optifai](https://optif.ai/learn/questions/demo-to-close-conversion-rate/); [Visionary Marketing](https://visionary-marketing.co.uk/blog/b2b-demo-conversion-statistics-2026)
- SMB sales cycle: 14-30 days (Optifai, under $15K ACV) vs 84 days (Ebsta 2024) vs 1.8 months (Cognism). Demo no-shows 20-24% (ChiliPiper 2025) — [Optifai benchmarks](https://optif.ai/learn/benchmarks/saas/); [Starr Conspiracy](https://www.thestarrconspiracy.com/insights/benchmarks/b2b-gtm-strategy-benchmarks-2025)

### Inferences
- LinkedIn-only math (assumptions are mine; benchmark rates from above):
  - 20 personalized connection requests/day x 5 days = 100/week → about 30 accepts → 30 follow-up messages at about 12% → about 3.5 replies/week → about 1.5 booked demos/week (assume 50% of replies book, 20% no-show).
  - Over ~15 working weeks that is about 20 demos. At 20% close that is about 4 partners, at 30% about 6.
- To hit 10 partners at a 20% close you need about 50 held demos, roughly 3/week. Suggested mix:
  - LinkedIn about 1.5/week.
  - Existing forwarder/3PL customers and inbound "for trade professionals" page about 1/week.
  - Association webinars and newsletters about 0.5-1/week. One webinar with 30-60 attendees might yield 3-6 demos; an assumption, not sourced.
- Weekly activity checklist:
  - 100 connection requests
  - 30-40 follow-up DMs
  - 3 LinkedIn posts showing a real tariff change
  - 10 comments on broker/forwarder posts
  - 5 emails to existing customers
  - 1 association pitch
  - 3 demos plus pilot setups
  - 2-3 pilot check-ins
- Timeline: the November-December holidays slow decisions, so start pilots in November so they convert in January. Pilots started after about Feb 1 may not convert before March. The NCBFAA April conference makes a natural "founding-partner pricing ends" deadline.
- Revenue check: 10 partners averaging 20 clients ≈ $299 + 10 x $25 = $549/mo each ≈ $5.5k MRR, which covers the 5k MRR goal alone. Five small partners at $299 ≈ $1.5k MRR.

### Gaps
- No logistics-specific demo-to-close or pilot-to-paid benchmark for broker software was found.
- LinkedIn's weekly invitation limit (commonly cited as about 100-200/week) was not verified here. Keep requests at or below 100/week.
- Email reply benchmarks to logistics pros and Sales Navigator costs were not retrieved.
