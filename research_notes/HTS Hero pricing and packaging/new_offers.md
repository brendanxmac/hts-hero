# New and Adjacent Revenue Offers for HTS Hero

Research date: 2026-10-21. US-focused. Most pricing comes from vendor pages or vendor-written comparison blogs, so treat figures as benchmarks to re-check before quoting. "Inference" means my reasoning, not a sourced fact.

## Which comparable companies monetize tariff/trade data via API, and at what price points?

### Takeaway
Tariff and classification data APIs sell at two very different levels. Developer/SMB APIs run about $19–$199/mo or $2–$11 per 1,000 calls. Enterprise content (Avalara, Descartes CustomsInfo, Zonos Classify at volume) is quote-based or $500+ per block. HTS Hero's Chapter 99-aware rate engine and change feed could fit the SMB/developer tier quickly. The enterprise tier would need SLAs and broader country coverage.

### Cited Findings
- **Zonos Classify (Standard tier):** 10,000 classifications for $500, 100,000 for $3,100, and 500,000 for $5,500, with custom pricing above that. The per-classification minimum is $0.031 and overage is $0.062. Plans are annual subscriptions billed monthly, and unused classifications don't roll over. — [Zonos docs](https://docs.zonos.com/catalog/classify/pricing)
- Zonos includes HS codes free inside Landed Cost when none is supplied, but API access to those classifications needs a Classify subscription. Sources disagree on how many free classifications come with the platform: 10,000 in the English docs, 1,000 in the Chinese page. — [Zonos docs (EN)](https://docs.zonos.com/catalog/classify/pricing); [Zonos (ZH-TW)](https://zonos.com/zh-tw/docs/supply-chain/classify/pricing)
- **Avalara Cross-Border / Tariff Code Classification:** no public pricing. It is usage-based, quoted per transaction, sold to enterprise teams, and needs an AvaTax Cross-Border account. — [apis.io Avalara plans](https://apis.io/plans/avalara/avalara-plans-pricing/); [tariffsapi.com (competitor page, biased)](https://tariffsapi.com/alternatives/avalara-cross-border); [Violet docs](https://docs.violet.io/prism/checkout-guides/guides/calculating-duties-with-avalara)
- **Descartes CustomsInfo:** software directories list a starting price of "US$750 per user" with a free trial. They don't say whether that is monthly or annual. The product covers tariff rates, rulings, AI HS classification for 190+ countries, landed cost, denied-party screening, ERP (SAP/Oracle) content feeds and API access. — [Software Advice AU](https://www.softwareadvice.com.au/software/494694/Descartes-CustomsInfo); [Capterra](https://www.capterra.ca/software/220216/descartes-customsinfo)
- **US Tariff Rates (ustariffrates.com):** Free $0, Pro $49/mo, Team $199/mo (adds API access and landed-cost workflows), Enterprise custom. There is also a free developer API key with HTS search, bulk lookup and a landed-duty calculator covering 301/232 overlays. — [ustariffrates.com pricing](https://ustariffrates.com/pricing); [ustariffrates.com developers](https://ustariffrates.com/developers)
- **Dutyfinch**, reported by a secondary blog: 50 free calls a day, Importer $19/mo for 2,500 calls, Broker $49/mo for 7,500 calls. The same post lists competitors at $49 and $75/mo. Not verified on the vendor site. — [cybermaxtools blog](https://cybermaxtools.com/blog/check-us-tariff-rate-by-hts-code/)
- **Apify marketplace tariff actors:** from $11.10 per 1,000 tariff lines (a US import tariff/landed cost actor), $3.00 per 1,000 results, and $2.00 per 1,000 results. All usage-based. — [Apify us-import-tariff-api](https://apify.com/neverempty/us-import-tariff-api); [Apify HTS scraper](https://apify.com/compute-edge/usitc-hts-tariff-scraper/api); [Apify HTS lookup](https://apify.com/pink_comic/us-tariff-hts-lookup)
- **tariffsapi.com:** free developer tier. Saved calculations and alerts sit behind a free account. — [tariffsapi.com](https://tariffsapi.com/tariff-calculator)
- **Other SMB tariff tools** (from vendor-written comparison blogs): Gaia Dynamics has a free tier (30 credits/yr), then Starter $99/mo, Pro $379/mo, Advanced $1,399/mo, Enterprise custom, billed yearly and credit-based. Gauge27 is from $99/mo, TariffWise from $59/mo, LandedCost from $49/mo, and GingerLite $150/mo for 300 credits plus top-ups. The same guides put enterprise trade-compliance suites (SAP GTS, Oracle GTM, ONESOURCE, e2open) at an estimated $5K–$50K/yr for the SMB tier. — [GingerControl pricing models (vendor-authored)](https://gingercontrol.com/blog/trade-compliance-software-pricing-models-compared); [ustariffrates best-of list](https://ustariffrates.com/best/best-trade-compliance-software)
- One source warns that in the raw HTS, the lines you actually import often have no rate of their own; the rate sits on the 8-digit parent. Any rate API has to handle that inheritance and apply Chapter 99 surcharges. — [cybermaxtools blog](https://cybermaxtools.com/blog/check-us-tariff-rate-by-hts-code/)

### Inferences
- **API pricing:** a "Rate API + change feed" at about $49–$199/mo, with per-call overage around $0.01–$0.06, would sit within the observed market. Credits and usage pricing (Zonos, Gaia, GingerLite, Apify) are the norm, which supports a pay-per-use credit pack alongside subscriptions.
- **Annual plans:** annual-commit, monthly-billed contracts (the Zonos model) are an accepted norm for B2B buyers.
- **Differentiation:** low-end APIs are crowded and many are thin USITC scrapers. The selling points would be a structured Chapter 99 stacking engine and a change feed ("what changed, which HTS codes are affected, effective date"), not base rates.

### Gaps
- No verified public pricing for 3CE, Thomson Reuters ONESOURCE, Flexport's tariff simulator, or Tarifflo.
- I couldn't confirm what Descartes' $750 covers.
- No data on how much revenue these API businesses make.

## What do refund, drawback and overpayment recovery firms charge, and what is the 2025–2026 IEEPA refund situation? What can a non-licensed software company legally do?

### Takeaway
IEEPA refunds are a huge but closing window. About $166B was paid by roughly 330K importers, and around $126–137B has already been accepted or certified through CBP's free CAPE process as of early October 2026. Contingency recovery runs about 15–25% for IEEPA work (mostly litigation) and 15–30% for drawback. A CBP ruling from 2026 (H350722) sets out what an unlicensed software company may do:
- Allowed: general education, tools to 6 digits, and a general database that carries a meaningfully implemented disclaimer and has no link to a specific entry.
- Generally needs a license: classifying specific goods that will be imported to 10 digits, extracting or preparing entry data, and preparing refund, drawback or protest filings.

### Cited Findings
**IEEPA refund status**
- The Supreme Court held in February 2026 (Feb 20 per Quinn Emanuel) that the IEEPA tariffs were unlawful. About 330,000 importers paid or deposited roughly $166B in IEEPA duties across more than 53M entries. — [White and Williams](https://www.whiteandwilliams.com/resources-alerts-IEEPA-Tariff-Refunds-CBP-Launches-CAPE-Process); [Quinn Emanuel alert](https://news.quinnemanuel.com/l/865552/2026-02-21/qqbxgl)
- **Who can file:** refunds go through CAPE, a claims module in the ACE portal. Only the importer of record or its licensed customs broker can file. Refunds are not automatic, they are paid by ACH, and they are expected 60–90 days after a CAPE declaration is accepted. — [White and Williams](https://www.whiteandwilliams.com/resources-alerts-IEEPA-Tariff-Refunds-CBP-Launches-CAPE-Process); [CBP IEEPA refunds page](https://www.cbp.gov/trade/programs-administration/trade-remedies/ieepa-duty-refunds); [Norton Rose Fulbright](https://www.nortonrosefulbright.com/en-us/knowledge/publications/44450c73/cbp-issues-tariff-refund-instructions)
- **Rollout phases:**
  - Phase 1 launched April 20, 2026, covering unliquidated entries and entries liquidated within 80 days.
  - Phase 2 was planned for reconciliation entries. I did not confirm its status.
  - Phase 3 covers finally liquidated entries. It was delayed from late July to October 2026.
  — [White and Williams](https://www.whiteandwilliams.com/resources-alerts-IEEPA-Tariff-Refunds-CBP-Launches-CAPE-Process); [Supply Chain Dive, Oct 8 2026](https://www.supplychaindive.com/news/cbp-starts-paying-out-ieepa-tariff-refunds-for-finally-liquidated-entries/832411/)
- **Progress as of Oct 2, 2026:** CBP had accepted about $136.6B in potential and certified refunds and sent about $126B (duties plus interest) to Treasury. As of Oct 6 it had accepted 477 Phase 3 declarations covering 425,517 entries. Phase 3 is expected to cover about $11.4B, roughly 6.9% of IEEPA tariffs. — [Supply Chain Dive](https://www.supplychaindive.com/news/cbp-starts-paying-out-ieepa-tariff-refunds-for-finally-liquidated-entries/832411/). A BDO summary gives about $128.68B, likely as of a different date. — [BDO FAQ](https://www.bdo.com/insights/tax/ieepa-tariff-refunds-frequently-asked-questions)
- **Finally liquidated entries:** for now, only plaintiffs who gave CBP a valid importer of record number by July 30, 2026 can receive these refunds. The CIT extended its refund order to finally liquidated entries. DOJ has appealed to the Federal Circuit, arguing no universal refund order is possible and relief should go only to parties that sued. That appeal is still pending. — [Supply Chain Dive](https://www.supplychaindive.com/news/cbp-starts-paying-out-ieepa-tariff-refunds-for-finally-liquidated-entries/832411/)
- **Claim volume:** 126,237 CAPE claims had been submitted and 86,874 had passed the initial check as of May 11, 2026. This comes from a secondary source and is unverified. — [gingercontrol IEEPA guide](https://gingercontrol.com/blog/ieepa-tariff-refund-guide)
- **Cost and interest:** CBP charges no fee to process refunds. Interest is paid under 19 CFR 24.36, but sources disagree on the rate (6–7%). — [gingercontrol](https://gingercontrol.com/blog/ieepa-tariff-refund-guide)
- **Unclaimed refunds:** a GDLSK attorney was quoted in Newsweek on why some tariff refunds may go unclaimed. Small importers who rely on couriers and brokers are the likely gap. — [GDLSK](https://www.gdlsk.com/?p=7480)
- **Who is offering refund services:** large logistics and accounting firms now run refund programs, including UPS, DHL, Flexport (free calculator plus a project or advisory fee), Avalara, BDO, CLA and the US Chamber. — [UPS](https://www.ups.com/us/en/supplychain/logistics-solutions/customs-brokerage/us-customs-tariff-refunds); [DHL](https://www.dhl.com/discover/en-us/global-logistics-advice/logistics-insights/navigating-us-trade-uncertainty/IEEPA-Trump-Tariff-Refunds); [Flexport](https://tariffs.flexport.com/refunds) (page returned 403; fee detail comes from the search snippet only); [Avalara](https://www.avalara.com/blog/en/north-america/2026/02/how-to-request-tariff-refunds.html); [US Chamber](https://www.uschamber.com/economy/tariff-refunds-faq-what-small-businesses-need-to-know-after-supreme-courts-ruling)

**Recovery fees**
- **IEEPA contingency fees:** one law firm charges 15–25% of what it recovers, with nothing owed if nothing is recovered. McCune Wright uses 20% as its example and runs a referral program for advisors who refer clients. These are law-firm marketing pages, and the contingency work appears to be mainly CIT litigation or denied claims. — [Ayar Law](https://ayarlaw.com/tariff-refund-attorney); [McCune Wright referral page](https://mccunewright.com/practice-areas/commercial-litigation/refer-clients-for-ieepa-tariff-refund-recovery/)
- **Selling the claim instead:** claim buyers reportedly pay about 40–50 cents on the dollar. This comes from a firm pitching contingency counsel as the better option. — [search summary of law-firm sources; see Ayar/McCune pages above]
- **Hourly vs contingency:** one vendor argues hourly billing can cost less than a percentage fee at these refund sizes. That is a vendor opinion. — [gingercontrol](https://gingercontrol.com/blog/ieepa-tariff-refund-guide)
- **Drawback:** most providers charge a 15–30% contingency fee on recovered duties with no upfront cost. Some split the fee into setup, data and audit charges, which raises the effective rate. Under 19 USC 1313, up to 99% of duties, taxes and fees can be recovered, going back 5 years. Contingency-priced drawback firms include Charter Brokerage, Comstock & Holt, Alliance Drawback Services, J.M. Rodgers and Tariff Refund HQ; KPMG bills hourly or on retainer. — [gingercontrol drawback guide (vendor)](https://gingercontrol.com/blog/duty-drawback-service-how-to-choose-provider); [AJOT drawback comparison](https://www.ajot.com/news/best-duty-drawback-companies-in-2026-compared-by-speed-cost-recovery); [Passport Global](https://passportglobal.com/duty-drawback/)
- **Drawback through brokers:** Pax sells drawback as a service through brokers and service providers acting as channel or referral partners, closer to white-label operations than self-serve software. — [Sacra on Pax](https://sacra.com/chat/h/64dacc27-5f20-4f6d-bb61-12a2112d5d80/)

**Legal limits for a non-broker: CBP ruling HQ H350722 (2026)**

I read this ruling directly. The URL path is /hq/2026/, and a secondary source dates it January 2026 (not confirmed). — [CBP ruling H350722 PDF](https://rulings.cbp.gov/api/getdoc/hq/2026/H350722.pdf)

The legal frame:
- 19 USC 1641(b)(1): no one may conduct customs business on behalf of another without a broker license.
- "Customs business" explicitly covers classification, valuation, payment of duties, and "the refund, rebate, or drawback thereof". It also covers preparing documents or parts of documents intended to be filed with CBP, whether or not the preparer signs or files them.
- The CIT calls this definition "very broad" (Delgado, 2008).

What the ruling found:
- **AI classification tool:**
  - Suggestions to 6 digits are not customs business.
  - Suggestions beyond 6 digits for goods that are imported or intended to be imported "generally" require a license, because all imports must be entered and so are tied to an entry. A disclaimer does not cure this (HQ H290535, 2022).
  - A general classification database with a "meaningfully implemented" disclaimer, usable whether or not the product is ever imported, is "narrowly permissible" (HQ H272798, 2017).
  - The AI tool in the ruling was permissible only to the extent it operated separately from the portal connecting importers to brokers for entry, and did not direct either party on the classification to put on an entry.
- **Automated tools in general:** a tool is not a "person". If a tool conducts customs business, a licensed broker must have a role in specifying what its decision matrix generates.
- **OCR or extraction of entry data from shipping documents:** customs business, even if the data is never filed, because it is preparing parts of an entry.
- **Platforms connecting importers with brokers:** acting as a "mere transmission" conduit is not customs business. The broker must get the power of attorney directly from the importer, not through the platform. Broker-to-platform disclosures need written client consent under 19 CFR 111.24. Importers sharing their own data is fine.
- **Preparing and submitting CBP Form 5106** for others: customs business.
- **General education:** unlicensed persons may teach customs law and explain how to use the HTS. They may not advise how to classify, appraise or mark merchandise that will be entered (HQ 114654, 1999).

### Inferences
- **IEEPA refund window:** most of the value has already been claimed through CAPE at no cost. What remains is finally liquidated or protest-window entries, laggard small importers who rely on courier or broker entries, and whatever the Federal Circuit rules. A recurring IEEPA refund product would be a shrinking, legally contingent revenue line. A one-time "Refund Eligibility Check" that hands off to brokers or law firms looks lower-risk than HTS Hero filing claims.
- **Refunds, PSCs, protests and drawback:** "find, flag, explain" fits the ruling, provided the content is general or educational and nothing is prepared for filing. Examples: "these entries may be eligible", "here is how CAPE works", "estimated refund range". HTS Hero should not prepare CAPE declarations, post-summary corrections (PSCs), protests or drawback claims, or extract entry data for them, unless a licensed broker is in the loop. Taking a percentage of refunds while preparing filings would almost certainly be customs business.
- **Takeaway for HTS Hero's own products:** the 10-digit vs 6-digit line and the "separate from the entry pipeline" condition matter directly for the AI HTS classification assistant and for savings detection or entry audits that read entry data. Consider getting customs counsel, or putting a licensed broker in the loop (a partner, or a hire, since corporations can hold a license through one licensed officer under 19 CFR 111.11), before monetizing 10-digit classification of a user's specific imports. This is a significant legal risk to flag, not settled law.
- **Fees:** a referral fee from a law firm on contingency recoveries may raise legal-ethics constraints on attorney fee-splitting with non-lawyers. That is general knowledge and needs counsel.

### Gaps
- Exact date of H350722 and its full conclusion section; I extracted about two-thirds of the text.
- Phase 2 (reconciliation entries) status.
- An authoritative count of importers who have not yet claimed.
- A timeline for the Federal Circuit appeal.
- Any software startup's published percentage fee for IEEPA refunds; none found.
- PSC or overpayment-recovery contingency rates outside drawback and IEEPA.

## Do tariff news newsletters and alert services charge, and at what prices? What do B2B trade newsletters get for sponsorships?

### Takeaway
I found no published price for a paid tariff or trade-intelligence newsletter. General benchmarks suggest about $10/mo or $100/yr for the median paid newsletter, with a B2B premium. B2B and finance sponsorship CPMs run about $70–$130 per 1,000 opens. Paid value in this niche seems to come bundled with software alerts rather than standalone newsletters.

### Cited Findings
- **Paid newsletter pricing:** the median paid newsletter is about $10/mo or $100/yr, and B2B/professional content often charges more. — [beehiiv State of Paid Newsletters 2026](https://www.beehiiv.com/blog/the-state-of-paid-newsletters-2026). A Medium piece cites a typical $50–$150/yr range for indie newsletters. — [Medium](https://medium.com/journalism-innovation/how-to-price-your-subscriptions-membership-and-sponsorships-f53ceabfdb0b)
- **Sponsorship rates:**
  - CPMs range roughly $15–$120, with finance and B2B at the high end.
  - Finance lists get about $70–$130 per 1,000 opens.
  - Rule of thumb: 2.5–5% of subscriber count per placement.
  - A mid-email slot is about 60% of the top-slot price, and a footer text ad about 25%.
  — [Newsletrix pricing guide](https://newsletrix.com/blog/newsletter-sponsorship-pricing-guide); [Newsletrix by niche](https://newsletrix.com/blog/newsletter-sponsorship-rates-by-niche); [Paved](https://www.paved.com/blog/newsletter-sponsorship-rates/); [InfluencerFee](https://influencerfee.com/blog/newsletter-influencer-sponsorship-rates/)
- **Trade-specific comparables:**
  - A free weekly procurement and tariff briefing exists, with no paid price listed. — [Career Chronicles](https://careerchronicles.org/procurement-tariff-newsletter/)
  - "TariffAlert" on ResearchAndMarkets is a telecom pricing service, not a trade-tariff product. — [ResearchAndMarkets](https://www.researchandmarkets.com/reports/4750257/tariffalert-your-daily-pricing-analysis)
- **Free tariff MCP tools:** at least one free tariff-alert MCP tool exists, which suggests free alerting is common. — [socket.dev tariffmonitor-mcp](https://socket.dev/npm/package/tariffmonitor-mcp)

### Inferences
- **Sponsorship revenue:** a 10K-subscriber importer/broker list at about 40% opens and $70–$130 CPM would earn roughly $280–$520 per top placement. That is modest. Newsletter value probably lies more in acquisition, which matches existing HTS Hero email principles.
- **Sponsor targets:** customs brokers, freight forwarders, trade finance providers, refund law firms and drawback firms all actively market to importers, so they would be natural sponsors.

### Gaps
- No pricing found for JOC, FreightWaves Passport/SONAR trade products, Sandler Travis (ST&R) subscriptions, or Substack tariff newsletters. These need direct checks.
- No trade-specific sponsorship rate cards found.

## Are there Shopify/Amazon seller apps for duties and tariffs, and what do they charge?

### Takeaway
Shopify has checkout duty calculators at $30–$600/mo and a native option that charges 0.5% per order with duties calculated. A tariff-exposure app with a free plan (DutyCalc) already targets US importers on Shopify. An HTS Hero Shopify app for catalog tariff exposure and alerts is a proven category, but there is free competition.

### Cited Findings
- **DutyCalc (Shopify):** free plan. It scans the catalog for missing HS/HTS codes and country of origin, then estimates US tariff exposure across base duty, 301, 232 and reciprocal tariffs, with AD/CVD risk flags and margin impact. This is the closest analog to the HTS Hero Tracker. — [Shopify App Store: DutyCalc](https://apps.shopify.com/dutycalc)
- **Dutify:** $30, $100 and $300/mo tiers with a set number of calculations and classifications each, plus a free trial. It requires Carrier-Calculated Shipping. — [Shopify App Store: Dutify](https://apps.shopify.com/dutify)
- **DHL Duty and Tax Calculator:** $50/mo for 200 calls with $0.35 per extra call, Growth $200/mo for 800 calls. One locale lists a $600/mo Enterprise tier. — [Shopify App Store: DHL](https://apps.shopify.com/duty-and-tax-calculator)
- **Native Shopify duties:** available on all plans since February 2025, with a 0.5% transaction fee on orders where duties and import taxes are calculated ("temporarily reduced"). Duty breakdowns on order pages were added in February 2026. — [Shopify changelog Feb 2025](https://changelog.shopify.com/posts/shopify-duty-calculator-now-available-for-all-shopify-plans); [Shopify changelog](https://changelog.shopify.com/posts/see-how-duties-are-calculated-on-your-orders)
- **eBay:** partnered with Avalara on cross-border compliance in 2023, a sign that marketplaces embed duty engines through partners. — [BusinessWire](https://www.businesswire.com/news/home/20230427005209/en/Avalara-and-eBay-Partner-to-Solve-Cross-Border-Compliance-for-Global-Sellers)

### Inferences
- **App positioning:** checkout calculators serve export, landed cost to the buyer. HTS Hero's angle is the importing merchant: inbound tariff exposure on its catalog, alerts when rates change, margin impact. DutyCalc proves the category exists and that a free plan is expected. A freemium Shopify app could feed sign-ups to the paid Tracker.
- **Legal risk in apps:** auto-assigning 10-digit HTS codes to a merchant's catalog runs into the same H350722 concern about classifying goods intended for import.

### Gaps
- I didn't check the Amazon Selling Partner Network for tariff apps.
- DutyCalc's paid tiers, install counts and reviews were not captured.
- No ERP/accounting integration (QuickBooks, NetSuite) pricing for tariff tools was found, beyond CustomsInfo's ERP content feeds.

## What are the referral and partner economics with customs brokers?

### Takeaway
I found no published revenue-share rates for customs-broker referral programs. The observed patterns: brokers resell a vendor's service as a new revenue line (Pax for drawback), software vendors recruit brokers to serve their users (AEB), and refund firms and law firms run referral programs. Generic SaaS referral benchmarks are about 15–20% recurring for 12 months, but those come from other industries.

### Cited Findings
- **Pax:** routes drawback through brokers and service providers as channel or referral partners, letting brokers add revenue from existing clients; the model is near white-label. — [Sacra on Pax](https://sacra.com/chat/h/64dacc27-5f20-4f6d-bb61-12a2112d5d80/)
- **AEB Customs Broker Integration Partner Program:** recruits vetted brokers (national expertise, AEO or equivalent) to serve AEB's shipper and forwarder software customers. This is the reverse flow: the software brings brokers volume. — [AEB](https://www.aeb.com/en/customs-broker-integration/partner-program/index.php)
- **Tariff Refund Agency (IEEPA refunds):** markets to importers, brokers and referral partners. Reviews praise the partner program, but no commission terms are published. — [Trustpilot](https://ie.trustpilot.com/review/tariffrefundagency.com)
- **McCune Wright (law firm):** runs a page for professionals to refer clients for IEEPA refund recovery. — [McCune Wright](https://mccunewright.com/practice-areas/commercial-litigation/refer-clients-for-ieepa-tariff-refund-recovery/)
- **FreightRight:** has a duty drawback partner program. — [FreightRight](https://www.freightright.com/duty-drawback-partner-program)
- **Cross-industry benchmark:** a 15% revenue-share referral tier, and recurring share for the first 12 months, both in non-customs referral programs. — [Visa Acceptance referral](https://www.visaacceptance.com/en-ap/become-a-partner/referral.html); [PartnerStack](https://partnerstack.com/account/wework)
- **Distribution through AI assistants:** tariff MCP servers already exist.
  - Gateway Lines launched a free MCP tariff calculator for ChatGPT and Claude in August 2026.
  - Tandom sells an API-keyed MCP for "broker-grade" classification.
  - tariff-resolver, HTS Tariff MCP and tariffmonitor-mcp are free or listed.
  - Several state they give planning estimates, not rulings or legal advice.
  — [Gateway Lines press release](https://gatewaylines.com/press-releases/your-ai-can-now-price-us-import-tariffs); [Tandom](https://tandom.ai/resources/claude-chatgpt-prompt-hts-classification-broker-grade); [Glama listing](https://glama.ai/mcp/servers/j9khyo3t5l); [MCPBundles](https://mcpbundles.com/blog/hts-code-lookup-ai); [socket.dev](https://socket.dev/npm/package/tariffmonitor-mcp)

### Inferences
- **Broker partnerships do two jobs:** they earn revenue and they reduce legal risk. H350722 lets HTS Hero send importers to brokers as long as the broker gets the power of attorney directly from the importer and HTS Hero doesn't decide entry content. Possible models:
  - Flat referral bounty or rev share from brokers and drawback/refund firms for "flagged" leads.
  - White-label or co-branded Tariff Tracker seats that brokers give their clients (a broker plan at $149–$249/mo for N client workspaces fits the existing tiers).
  - A "Broker Review" add-on where a partner broker confirms 10-digit codes.
- **MCP distribution:** free MCPs are becoming table stakes, so an HTS Hero MCP is best treated as a funnel, with a free tier, account linking and alerts. Charging per call is possible (Tandom uses API keys), but there's little evidence of willingness to pay.
- **Done-for-you managed monitoring, one-time exposure or landed-cost reports, annual prepay and launch price-locks:** I found no comparable published pricing (the exposure-report search returned only academic and Fed studies). Pricing them would rest on inference from the $49–$1,399/mo SaaS tiers and 15–30% contingency norms. A one-time "Tariff Exposure Report" priced near one month of a mid-tier plan ($49–$149) is plausible but unvalidated.

### Gaps
- No published broker rev-share percentages, freight-forwarder white-label pricing, or 3PL embedded-alert pricing found.
- No lead-gen marketplace (importer-to-broker) pricing benchmarks found.
- No evidence of paid ChatGPT/Claude tariff apps or their revenue.
- No comparable for one-time tariff exposure or landed-cost reports.
