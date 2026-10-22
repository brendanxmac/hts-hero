# Competitor and Adjacent-Tool Pricing and Packaging (US import duty, HTS classification, tariff alerts, compliance, refunds)

Research date: 2026-10-21. About 20 tool calls. Status labels: **Verified (vendor page)** means I fetched the vendor's own pricing page this session. **Third-party** means a review site, a directory or a competitor's comparison. **Not public** means contact sales or quote only. Several vendor pages (ustariffrates.com, businesswire.com, yespress.io) returned 403, so their figures come from search snippets and are marked as such.

## Master comparison table

| Vendor / tool | Category | Target buyer | Value metric | Published price (USD unless noted) | Free tier / trial | Calc / Alerts / Classify / Audit-Refund | Status and source |
|---|---|---|---|---|---|---|---|
| Flexport Tariff Simulator | Duty calculator | Any US importer (lead gen for forwarding) | None (free) | Free, at tariffs.flexport.com | Fully free | Calc Y / Alerts: Pro version for HTS codes you follow / Classify: separate AI product / Refund: free refund calculator (Jan 2026) | Search snippets of Flexport press releases ([BusinessWire Jun 2025](https://www.businesswire.com/news/home/20250602561783/en), [Jan 2026](https://www.businesswire.com/news/home/20260120812295/en/Flexport-Launches-Tariff-Refund-Calculator-Giving-Businesses-Early-Insight-Into-Possible-Tariff-Refunds)) |
| Flexport Tariff Simulator Pro | Alerts and monitoring | Flexport clients | Not stated | Not public; requires a Flexport Client App login | n/a | Follows HTS codes | [GingerControl comparison, Oct 2026](https://gingercontrol.com/blog/trade-policy-alert-services-compared-2026); [Flexport tutorial](https://www.flexport.com/resources/product-tutorials/tariff-simulator-pro/) |
| Flexport Customs Technology Suite (Oct 2025), including "Audit Your Customs Broker" | Audit and refunds | Importers | Not stated | Not public | Unknown | Audits past entries, files corrections, estimates refunds | [BusinessWire Oct 2025](https://www.businesswire.com/news/home/20251014811735/en/Flexport-Launches-Customs-Technology-Suite-to-Help-Businesses-Manage-Tariffs-and-Reduce-Costs) (403; snippet only) |
| Gaia Dynamics | AI classification plus tariff lookup | SMB to enterprise, multi-country importers | Credits, with product (SKU) caps per tier; unlimited users | Free $0 (30 credits/yr, 100 products); Starter $99/mo (1.2K–2.4K credits/yr, 1,000 products); Pro $379/mo (5K–10K credits/yr, 10,000 products); Advanced $1,399/mo (20K–40K credits/yr, 100,000 products); Enterprise custom. **Billed yearly.** | Free plan plus a 14-day no-card trial (trial per [GingerControl blog](https://gingercontrol.com/blog/best-automated-hts-classification-tools)) | Classify Y / "Quick tariff lookup", "Catalog tariff scan" / Alerts on announced and rumored tariffs (per GingerControl) / "Tariff Audit Engine" flags refund opportunities (per TariffLens) | **Verified (vendor page)** [gaiadynamics.ai/pricing](https://gaiadynamics.ai/pricing) |
| GingerControl (GingerLite) | Classification, calculator, alerts (Compliance Radar), services | SMB to mid-market; manufacturers with many SKUs | Credits ("Nothing is priced per SKU") | GingerLite $150/mo for 300 credits. API and GingerOS are quote only. Credit packs from $10, about $0.80 per credit at volume (third-party). | No trial mentioned. Policy Briefings email is free. | Calc Y (no AD/CVD) / Alerts: Compliance Radar (private beta), matched to HTS codes, "affects N of your products" / Classify Y / Audit, IEEPA refund (with a licensed partner), drawback: all quoted per scope | **Verified (vendor page)** [gingercontrol.com/pricing](https://gingercontrol.com/pricing) |
| US Tariff Rates (ustariffrates.com) | Tariff lookup, tracker, API | SMB importers, developers, teams | Seat/plan tier with watchlist and API caps | Free $0 (5 watchlist alerts, 50 API requests/mo, 10 rows per bulk lookup); Pro $49/mo or $399/yr; Team $199/mo or $1,590/yr; Enterprise quote | Free tier | Lookup and calc Y / Alerts: watchlist / Classify: no (lookup, not a classifier) | Search snippet (pricing page returned 403) |
| TariffClassify (tariffclassify.ai) | Classification plus rate-change alerts | SMB importers | Credits: 1 credit per extra watched HTS code (the same credit buys one AI classification); subscribers watch up to 50 free | Credit packs from $5 for 2 credits; Starter, Pro and Business subscription prices not shown on the page I read | First watch free | Alerts: daily checks of HTS code plus country of origin, old and new rate per duty type / Classify Y | **Verified (vendor page)** [tariffclassify.ai/tariff-rate-alerts](https://tariffclassify.ai/tariff-rate-alerts) |
| TariffLens | Classification plus duty stack | US importers and customs brokers | Self-serve subscription | Dollar amounts not found | Free trial | Calc Y (duty stack per origin) / Classify Y | [TariffLens blog, Jul 2026](https://www.tarifflens.ai/blog/best-ai-hts-classification-tools-2026) (vendor self-ranking) |
| Harmonize | Classification | US and Australian importers (reportedly moving toward Australia) | Not detailed | From $49/mo | Unknown | Classify Y | Third-party ([TariffLens](https://www.tarifflens.ai/blog/best-ai-hts-classification-tools-2026)) |
| KYG Trade | Classification at volume | Mid-market and enterprise | Per classification plus a platform fee | From $825/mo for 5,000 classifications, plus a separate platform fee | Unknown | Classify Y | Third-party ([TariffLens](https://www.tarifflens.ai/blog/best-ai-hts-classification-tools-2026)) |
| Camtom | Classification (Mexico, LatAm, US) | Mexico and US importers | Tiered | Basic $99/mo; Growth $1,245/mo; API in higher tiers | Free trial | Partial calc (301/232; IEEPA and AD/CVD not published) | Third-party ([TariffLens](https://www.tarifflens.ai/blog/best-ai-hts-classification-tools-2026)) |
| Zonos Classify | Classification API | E-commerce and enterprise | Per classification, annual volume tiers | About $3,100/yr for 100K classifications ($0.031 each); $5,125/yr for 250K; $5,500/yr for 500K; custom above that. A "Standard" plan is $5,000. Third-party snippet: 1,000 free, then from $500/mo. | 1,000 free classifications (third-party) | Classify Y | Zonos docs via search snippet ([zonos docs Classify pricing](https://zonos.com/zh-tw/docs/supply-chain/classify/pricing)); main pricing page is "Book a demo" only ([zonos.com/pricing](https://zonos.com/pricing)) |
| Zonos Landed Cost | Checkout duty and tax calculation (DDP) | Cross-border e-commerce sellers | Per order | $2 plus 10% of duties, taxes and fees per order, usually paid by the shopper at checkout. Platform plans about $2,500–$4,000/yr, plus a possible $4,000 setup fee (sources conflict). | Auto-classification inside Landed Cost is free | Calc Y (checkout) | Search snippet of [Zonos Landed Cost fee docs](https://zonos.com/docs/global-ecommerce/landed-cost/pricing) |
| SimplyDuty | Duty calculator and classification API | SMB sellers, developers (UK-based, global) | Per API call or calculation | Basic £9.99/mo for 100 calls; Start-up £49.99 for 500; Professional £99.99 for 1,000; Enterprise £499.99 for 5,000. Pay as you go £0.10 per classification or calculation call. | Free registration with 5 free calculations per day | Calc Y / Classify Y / Alerts not mentioned | **Verified (vendor page)** [simplyduty.com/pricing](https://www.simplyduty.com/pricing/) |
| Descartes CustomsInfo | Trade content, classification research | Enterprise and broker research teams | Per user | Not public. Aggregators list "from $750 per user" with no billing period stated; probably old or estimated. | Aggregators say a free trial exists | Classify research, rates content | [Capterra](https://www.capterra.com/p/220216/Descartes-CustomsInfo/) (third-party; undated) |
| Avalara Cross-Border / Managed Tariff Code Classification | Classification service, landed cost | Mid-market and enterprise e-commerce | Usage- or transaction-based, quoted | Not public | No | Calc and Classify | [apis.io directory](https://apis.io/plans/avalara/avalara-plans-pricing/) (third-party) |
| Thomson Reuters ONESOURCE Global Trade | Enterprise GTM suite | Large multinationals | Quote plus implementation | Not public | No | All, inside the suite | [TariffLens](https://www.tarifflens.ai/blog/best-ai-hts-classification-tools-2026) |
| e2open (Amber Road) | Enterprise GTM | Multinationals | Quote | Not public | No | Landed cost included | Same |
| SAP GTS | Enterprise GTM | SAP shops | License plus SI, about 22% annual maintenance; 6–12 month project | Not public | No | Via configuration | Same |
| MIC Customs Solutions, Digicust | Customs filing, EU-centric | Enterprise | Quote | Not public | No | — | Same |
| Cervo AI (acquired by Altana, Jul 22 2026) | Broker entry automation | **Customs brokers** | "Flexible", tailored | Not public; pilot on real entries | Pilot | Entry automation, AD/CVD, IEEPA refund guide for brokers | [usecervo.com](https://usecervo.com/); [SaaSRise deal note](https://www.saasrise.com/deals/altana-says-acquisition-will-help-customs-brokers-keep-up-with-tariff-changes-712a696b-b6f1-43c8-950a-6ad06299b020) |
| Strix | Self-filing customs software | SMB importers | Per entry | About $30 per entry (vendor's claim) vs $100–$250 per entry for full-service brokers | — | Entry filing | [Strix blog 2026](https://strixsmart.com/resources/blog/customs-broker-cost) (vendor) |
| Tarifflo (YC S26) | Classification, CBP filing, refund audit | Importers | Unknown | Not found | — | Classify, file, audit for overpaid duties | [yespress.io](https://yespress.io/tarifflo-yc-s26) (403; snippet only) |
| Import Genius | Trade data (bills of lading) | Sourcing, sales, competitive intelligence | Per user per month | Essentials $125/user/mo; Business $399; Enterprise $899 | — | Not a duty tool | [Capterra](https://www.capterra.com/p/10032153/ImportGenius/reviews/) (third-party; may be stale) |
| ImportYeti | Trade data | SMB sourcing | — | Not public, per G2, Capterra and TrustRadius | Free search core | — | [Capterra](https://www.capterra.com/p/10006176/ImportYeti/pricing/) |
| Gateway Lines tariff tool | Free calculator | Individuals; enterprise alerts | — | Free; enterprise alerts quoted | Free | Calc Y / Alerts (enterprise) | [tariff.gatewaylines.com](https://tariff.gatewaylines.com/) (snippet) |
| Tariffs API (tariffsapi.com) | Free calculator plus API | Developers, SMB | — | Calculator free with no signup; API pricing not found | Free | Calc covers 301, 232, IEEPA, CBP fees | [tariffsapi.com](https://tariffsapi.com/tariff-calculator?hts=9615) |
| AMZ Prep, TimeTrex calculators | Free calculators (lead gen) | Amazon sellers, SMB | — | Free | Free | Calc | [AMZ Prep](https://amzprep.com/us-reciprocal-tariffs-calculator/), [TimeTrex](https://www.timetrex.com/resources/us-tariff-calculator) |
| Apify USITC HTS monitor | Scraper and monitor | Developers | Usage-based | From $1.31 per 1,000 tariff lines | — | Monitoring by HTS prefix | [Apify](https://apify.com/getascraper/us-hts-tariff-monitor) (snippet) |
| CustomsMobile, USITC HTS Search, CBP CROSS, Federal Register email, CBP CSMS | Government and free references | Everyone | — | Free | Free | Lookups and rulings. Topic-level alerts (Federal Register, CSMS), not matched to HTS codes. | [GingerControl Oct 2026](https://gingercontrol.com/blog/trade-policy-alert-services-compared-2026) |
| Tariff Recovery Group | IEEPA refund recovery | Small-business importers | Contingency % of refund | "As low as 1.5%" and fully contingency-based. Also buys refund claims for cash now. | Free consultation | Refund audit, CAPE filing, litigation coordination | **Verified (vendor page)** [tariffrecoverygroup.com](https://tariffrecoverygroup.com/) |
| One Eagle Advisory | Refunds for downstream buyers | Buyers who paid tariffs passed through by suppliers | % of recovery | % not stated | — | Refund | [oneeagleadvisory.com](https://www.oneeagleadvisory.com/service/tariff-refund) |
| Duty drawback providers (general) | Drawback | Exporters and re-exporters | Contingency | 15–30% of recovered amounts (also given as 10–25%, midpoint about 17.5%); watch for setup and per-claim add-ons | — | Drawback | [GingerControl drawback guide](https://gingercontrol.com/blog/duty-drawback-service-how-to-choose-provider) (vendor; no independent benchmark) |
| CBP (CAPE in ACE) | IEEPA refund channel | IOR / brokers | — | CBP charges no fee for refunds | — | Refund filing | [CBP IEEPA refunds](https://www.cbp.gov/trade/programs-administration/trade-remedies/ieepa-duty-refunds) |
| DHL (as broker) | Broker refund filing | DHL customers | Service fee | Chargeable, amount not stated; brokerage fees are not refunded | — | Refund filing | [DHL](https://www.dhl.com/discover/en-il/Customs-and-Shipping-Guides/IEPPA-Updates-USA) |

**HTS Hero shows up in third-party comparisons with old prices.** GingerControl's Oct 12, 2026 alert comparison lists the "HTS Hero Pro Tariff Tracker" at $49/mo for 30 pairs, $79 for 100 and $149 for 500 ([source](https://gingercontrol.com/blog/trade-policy-alert-services-compared-2026)). A search summary also cited HTS Hero "Starter $39/mo for 10 classifications, Pro $89/mo for up to 100." These don't match the current launch pricing of $12/$29/$89/$149 for 10/30/100/500 imports. Competitors read and republish HTS Hero's pricing page, so stale numbers are circulating.

## Which tools offer US duty/tariff calculators (free or paid), and what do paid tiers cost?

### Takeaway
A standalone US duty calculator is now free nearly everywhere: Flexport, Tariffs API, AMZ Prep, TimeTrex, Gateway Lines and government lookups all charge nothing. Paid calculator access exists only as metered API calls (SimplyDuty about £0.10 per call, Zonos per order) or bundled inside classification suites ($99–$1,399/mo, Gaia) and enterprise GTM platforms (quote only).

### Cited Findings
- Flexport's Tariff Simulator is free to the public for US imports at tariffs.flexport.com and updated in real time. A free Refund Calculator (upload your ACE entry report) launched Jan 2026 and was updated after the Feb 2026 Supreme Court IEEPA ruling — [BusinessWire Jan 2026](https://www.businesswire.com/news/home/20260120812295/en/Flexport-Launches-Tariff-Refund-Calculator-Giving-Businesses-Early-Insight-Into-Possible-Tariff-Refunds); [StatTimes](https://www.stattimes.com/air-cargo/flexport-unveils-tool-to-estimate-potential-us-duty-refunds-1357887)
- SimplyDuty charges £9.99/mo for 100 calls up to £499.99/mo for 5,000; pay as you go is £0.10 per call; free accounts get 5 calculations per day — [SimplyDuty pricing](https://www.simplyduty.com/pricing/)
- Zonos Landed Cost charges $2 plus 10% of duties, taxes and fees per order, usually passed to the shopper — [Zonos docs](https://zonos.com/docs/global-ecommerce/landed-cost/pricing)
- Gaia Dynamics bundles "Quick tariff lookup" and "Catalog tariff scan" in plans from $0 to $1,399/mo, billed yearly — [Gaia pricing](https://gaiadynamics.ai/pricing)
- GingerControl's calculator sits inside GingerLite at $150/mo for 300 credits and does not compute AD/CVD — [GingerControl pricing](https://gingercontrol.com/pricing); [TariffLens](https://www.tarifflens.ai/blog/best-ai-hts-classification-tools-2026)
- Tariffs API offers a free calculator with no signup, covering 301, 232, IEEPA and CBP fees — [tariffsapi.com](https://tariffsapi.com/tariff-calculator?hts=9615)
- US Tariff Rates: Free, Pro $49/mo ($399/yr), Team $199/mo ($1,590/yr) — search snippet of ustariffrates.com (page returned 403)
- Enterprise suites (ONESOURCE, e2open, SAP GTS, Descartes, Avalara) are quote only; SAP GTS adds about 22% annual maintenance and a 6–12 month implementation — [TariffLens](https://www.tarifflens.ai/blog/best-ai-hts-classification-tools-2026)

### Inferences
- HTS Hero's free, unlimited calculator matches the market norm. Charging for the calculator alone would put it against Flexport's free tool.
- The price-anchor ladder for self-serve tools runs from free, to about $49/mo (US Tariff Rates Pro, Harmonize), to $99–$150/mo (Gaia Starter, Camtom Basic, GingerLite), to $199–$379/mo (US Tariff Rates Team, Gaia Pro), to $800–$1,400/mo (KYG, Gaia Advanced, Camtom Growth), to enterprise quotes. HTS Hero's $12 and $29 tiers sit well below every paid self-serve anchor found, and $89/$149 sits in the SMB band.

### Gaps
- I could not reach a Freightos duty calculator page or confirm one exists, and I did not verify dutycalculator.com, 3CE, Tarifftel, Passport, Hurricane Commerce, Tariffy or Tariffs.ai.
- US Tariff Rates figures are unverified (403).

## Which offer tariff-change alerts/monitoring, and how is it priced?

### Takeaway
Few vendors sell alerts matched to specific HTS codes, and those that do meter by codes watched or credits, not seats: TariffClassify charges 1 credit per code (about $2.50) and caps subscribers at 50 codes; US Tariff Rates gives 5 free watchlist alerts and charges $49+/mo; GingerControl Compliance Radar is $150/mo in credits, still in beta. Enterprise vendors bundle alerts with no separate price. Free government and newsletter alerts are not matched to products. Matching on HTS code plus country of origin, the way HTS Hero prices it, is rare in what I found; only TariffClassify explicitly ties a country of origin to each watch.

### Cited Findings
- TariffClassify: one watch free per account; each extra code costs 1 credit (packs from $5 for 2 credits); Starter, Pro and Business subscribers save up to 50 codes at no charge; daily checks at 03:00 UTC; the alert shows old and new rate per duty type — [TariffClassify](https://tariffclassify.ai/tariff-rate-alerts)
- GingerControl Compliance Radar: matched to HTS codes, shows "affects N of your products", priced inside GingerLite at $150/mo for 300 credits; its free Policy Briefings email is not product-matched — [GingerControl Oct 2026](https://gingercontrol.com/blog/trade-policy-alert-services-compared-2026)
- Flexport Tariff Simulator Pro follows HTS codes and requires a Flexport client login; price not public — same source
- Gaia Dynamics alerts on announced and rumored tariffs, and Pro adds a catalog tariff scan; code-level matching not stated — same source; [Gaia pricing](https://gaiadynamics.ai/pricing)
- Descartes and ONESOURCE keep tariff updates inside the suite, quote only — [GingerControl](https://gingercontrol.com/blog/trade-policy-alert-services-compared-2026)
- Federal Register email subscriptions and CBP CSMS (GovDelivery) are free but filter by topic or agency, not HTS code — same source
- Gateway Lines offers real-time alerts as an enterprise feature (quote) next to a free calculator — [tariff.gatewaylines.com](https://tariff.gatewaylines.com/)
- Apify's USITC monitor costs about $1.31 per 1,000 tariff lines, for developers — [Apify](https://apify.com/getascraper/us-hts-tariff-monitor)

### Inferences
- The common value metrics for alerts are "codes watched" and credits. HTS Hero's "imports" (code plus country pair) metric is close to TariffClassify's code-plus-country watch, and more granular than Gaia's per-product caps.
- Implied cost per watched item: TariffClassify about $2.50 per code (one-off credit); HTS Hero $1.20 (10 for $12), $0.97 (30 for $29), $0.89 (100 for $89), $0.30 (500 for $149) per pair per month; Gaia Starter $0.10 per product per month (1,000 products for $99, but credit-limited and billed yearly).
- The gap in the market: code-plus-country-matched alerts that also say what changed and why (rate before and after) at under $50/mo. Of the tools I found, only TariffClassify and US Tariff Rates compete there.

### Gaps
- TariffClassify subscription prices and US Tariff Rates watchlist limits on paid tiers were not visible.
- No pricing for Tradeverifyd, Altana, Sourcemap or Prewave alerting was found. Those are supply-chain risk platforms, typically enterprise quote; not verified.

## Who targets brokers/forwarders vs SMB importers vs e-commerce vs enterprise, and how do prices differ?

### Takeaway
Prices split by segment. Enterprise GTM is quote-only with implementation projects. E-commerce is priced per order or per classification at volume (Zonos, Avalara, SimplyDuty). SMB importers get self-serve tiers from $49 to $400/mo. Broker-focused AI tools (Cervo, now owned by Altana; TariffLens) don't publish prices and sell through pilots.

### Cited Findings
- Cervo AI (broker entry automation) has "flexible pricing uniquely tailored" plus a pilot on real entries; Altana acquired it on Jul 22, 2026 — [usecervo.com](https://usecervo.com/); [SaaSRise](https://www.saasrise.com/deals/altana-says-acquisition-will-help-customs-brokers-keep-up-with-tariff-changes-712a696b-b6f1-43c8-950a-6ad06299b020)
- TariffLens targets US importers and customs brokers with a self-serve subscription and free trial, but no published amounts — [TariffLens](https://www.tarifflens.ai/blog/best-ai-hts-classification-tools-2026)
- Brokers typically charge $100–$250 per entry for full-service clearance, vs about $30 per entry for Strix self-filing (vendor claim) — [Strix](https://strixsmart.com/resources/blog/customs-broker-cost)
- Gaia gives unlimited users on every tier and scales by products and credits, which suits multi-user importer teams — [Gaia](https://gaiadynamics.ai/pricing)
- Zonos sells per classification ($0.011–$0.031 at 100K–500K/yr) and per order, aimed at e-commerce platforms — [Zonos docs](https://zonos.com/zh-tw/docs/supply-chain/classify/pricing)
- Import Genius (trade data) prices per user, $125–$899/user/mo, for sourcing and sales intelligence — [Capterra](https://www.capterra.com/p/10032153/ImportGenius/reviews/)

### Inferences
- No self-serve, published-price, multi-client tier for brokers turned up. A broker plan priced on pooled imports across clients (for example 1,000–5,000 pairs) would face little posted-price competition, though brokers may expect demos or pilots.
- The $149 cap for 500 pairs is far below Gaia Pro ($379/mo, 10K products) and US Tariff Rates Team ($199/mo). There may be room for a $249–$399 tier for larger catalogs or brokers. This matches the $249 tier noted in earlier internal plans.

### Gaps
- No public pricing for CargoWise or other broker ERP tariff modules, Descartes broker tools, or Kintetsu.

## What do refund, drawback, IEEPA-refund or audit services charge?

### Takeaway
IEEPA refund filing through CBP's CAPE costs nothing in government fees. Recovery firms charge contingency, from "as low as 1.5%" (Tariff Recovery Group) up to an unstated percentage. Drawback providers typically take 15–30% of recoveries (vendor-sourced). Many software-led refund estimators (Flexport) are free lead magnets, and the actual filing goes to brokers or partners.

### Cited Findings
- CBP charges no fee for IEEPA refunds and warns of scammers asking for payment — [CBP](https://www.cbp.gov/trade/programs-administration/trade-remedies/ieepa-duty-refunds)
- Tariff Recovery Group: fully contingency, "fees starting as low as 1.5%" scaled to claim value, no retainers, also buys refund claims, targets small importers — [TRG](https://tariffrecoverygroup.com/)
- For CIT litigation past the 180-day protest window, firms sometimes propose contingency; one commentator advises pushing for hourly billing instead. For mostly unliquidated entries, the broker plus CAPE costs close to nothing beyond data prep — search snippet of [GingerControl IEEPA guide](https://gingercontrol.com/blog/ieepa-tariff-refund-guide)
- Drawback contingency usually runs 15–30% of recovery, with add-on setup and per-claim fees that can double or triple the effective rate — [GingerControl drawback guide](https://gingercontrol.com/blog/duty-drawback-service-how-to-choose-provider) (vendor-authored)
- GingerControl quotes audits, IEEPA refunds (through a licensed partner) and drawback per scope — [GingerControl pricing](https://gingercontrol.com/pricing)
- DHL charges a service fee for filing refunds on a customer's behalf (amount not stated); brokerage fees are not refunded — [DHL](https://www.dhl.com/discover/en-il/Customs-and-Shipping-Guides/IEPPA-Updates-USA)
- Flexport's "Audit Your Customs Broker" audits entries and prepares refunds, pricing not found; Gaia has a "Tariff Audit Engine"; Tarifflo (YC S26) audits import history for overpaid duties — [Flexport Oct 2025](https://www.businesswire.com/news/home/20251014811735/en/Flexport-Launches-Customs-Technology-Suite-to-Help-Businesses-Manage-Tariffs-and-Reduce-Costs); [TariffLens](https://www.tarifflens.ai/blog/best-ai-hts-classification-tools-2026); [yespress](https://yespress.io/tarifflo-yc-s26)

### Inferences
- The refund and audit market prices on contingency or as a free lead magnet. A software audit that finds and flags issues and hands the filing to a broker (HTS Hero's unlicensed stance) fits a subscription or credit metric (for example "audits per month") better than contingency, which brings licensing and fee-sharing questions.

### Gaps
- No independent survey of IEEPA contingency percentages. Only TRG's 1.5% floor is public, and it is a marketing floor.

## What free tools set a "free" expectation for calculators?

### Takeaway
Many free calculators exist: Flexport (simulator plus refund calculator), Tariffs API, AMZ Prep, TimeTrex, Gateway Lines, CustomsMobile, USITC HTS Search, CBP CROSS, and free tiers at SimplyDuty (5 per day), US Tariff Rates and Gaia (30 credits per year). Users now expect a single-shipment duty estimate to be free; paid value has to come from monitoring, catalog scale, history and audit.

### Cited Findings
- Flexport Tariff Simulator and Refund Calculator are free — [BusinessWire](https://www.businesswire.com/news/home/20260120812295/en/Flexport-Launches-Tariff-Refund-Calculator-Giving-Businesses-Early-Insight-Into-Possible-Tariff-Refunds)
- Tariffs API calculator is free with no signup — [tariffsapi.com](https://tariffsapi.com/tariff-calculator?hts=9615)
- AMZ Prep and TimeTrex run free 2026 tariff calculators as lead gen — [AMZ Prep](https://amzprep.com/us-reciprocal-tariffs-calculator/); [TimeTrex](https://www.timetrex.com/resources/us-tariff-calculator)
- CustomsMobile, USITC HTS Search and CBP CROSS are free references — [TariffLens](https://www.tarifflens.ai/blog/best-ai-hts-classification-tools-2026)
- SimplyDuty free accounts get 5 calculations per day — [SimplyDuty](https://www.simplyduty.com/pricing/)

### Inferences
- HTS Hero's decision to keep the calculator free and unlimited, with the paid Tracker for monitoring, matches the market.
- The free calculators conflict on 2026 rates (Section 122 status, for example). Accuracy across the full duty stack (301, 232, 122, AD/CVD, MPF/HMF) is a differentiator, not price.

### Gaps
- Freightos and dutycalculator.com free calculators not verified this session.
