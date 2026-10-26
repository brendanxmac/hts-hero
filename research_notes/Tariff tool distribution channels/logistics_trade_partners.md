# Logistics, Sourcing, Fintech and Trade-Ecosystem Partnerships as Distribution Channels for HTS Hero

Scope note: researched 2026-10-26 with about 25 search/fetch calls. Several primary pages (Flexport tariffs.flexport.com/about, the BusinessWire Flexport refund release) returned HTTP 403, so some Flexport details come from search-engine summaries of those pages and are flagged as such. Many "partner program" terms (CargoWise, Magaya, Customs City, Descartes, Brex/Ramp/Mercury vendor side) are not published. Those are listed as gaps, not guessed.

## Which partners launched or promoted tariff tools in 2025-2026, and who built them?

### Takeaway
The large freight and logistics players built their own tariff tools in-house in 2025-2026 (Flexport, C.H. Robinson, UPS, Shopify, Descartes, Magaya, Helium 10), so they are competitors or closed ecosystems rather than easy distribution partners. Mid-market shipping, 3PL, sourcing and fintech players mostly have not shipped a US duty calculator plus alerts, and that is where an integration or embed pitch is most plausible. Flexport's free Tariff Simulator plus Refund Calculator is the closest direct competitor to HTS Hero's free-calculator-to-paid-monitoring funnel.

### Cited Findings
**Freight forwarders / 3PL platforms (built in-house)**
- Flexport Tariff Simulator launched June 2, 2025 at tariffs.flexport.com. Founder and CEO Ryan Petersen said Flexport's own engineering team built it. It estimates landed cost from HTS code plus origin, has an interactive map of each country's import value and average duty rate, and includes a searchable HTS catalog. It is open to the general public. — [FreightWaves](https://www.freightwaves.com/news/firms-launch-tools-to-help-shippers-measure-tariff-costs); [BusinessWire release, 2025-06-02](https://www.businesswire.com/news/home/20250602561783/en)
- Flexport's simulator page (per a search summary, since the page returned 403 on direct fetch) says it is free with no login, updates within 48 hours of an official change, compares alternative sourcing countries, and flags preference programs like USMCA. It reportedly caps the free tier at 10 lookups, with a sign-in "Pro" version that adds bulk upload and change alerts. The press coverage does not mention the cap. — [Flexport tariff sim](https://www.flexport.com/tariff-sim/); [tariffs.flexport.com/about](https://tariffs.flexport.com/about)
- Flexport launched a free Tariff Refund Calculator in January 2026 at tariffs.flexport.com/refunds, giving early estimates of possible IEEPA tariff refunds. — [BusinessWire, 2026-01-20](https://www.businesswire.com/news/home/20260120812295/en/Flexport-Launches-Tariff-Refund-Calculator-Giving-Businesses-Early-Insight-Into-Possible-Tariff-Refunds)
- C.H. Robinson added a "U.S. Tariff Impact Analysis" tool to its shipper platform. It assesses duty exposure, gives per-shipment cost analysis, and finds high-volume SKUs from one origin to compare duty spend across alternative sources. — [FreightWaves](https://www.freightwaves.com/news/firms-launch-tools-to-help-shippers-measure-tariff-costs)
- UPS Global Checkout (a landed-cost calculator merchants embed in checkout), Shopify's tariff calculator, and an Agtools food-industry tariff calculator were all covered in the same 2025 FreightWaves roundup. — [FreightWaves](https://www.freightwaves.com/news/firms-launch-tools-to-help-shippers-measure-tariff-costs)
- Freightos: I found no Freightos tariff/duty calculator. It has a free freight-rate calculator with an API "to be embedded in other sites", and a free carbon calculator (May 2022). — [FreightWaves](https://www.freightwaves.com/news/freightos-establishes-global-rate-calculator); [Cargo Facts](https://cargofacts.com/allposts/archive/freightos-launches-free-to-all-carbon-emissions-calculator/)
- ShipMonk (a 3PL) publishes an "IEEPA tariff refund guide 2026" content hub page, so 3PLs are producing tariff content for merchants without (as far as I found) a tool. — [ShipMonk](https://www.shipmonk.com/resources/content-hub/ieepa-tariff-refund-guide-2026)
- Kuehne+Nagel publishes an IEEPA tariffs customs how-to page. — [Kuehne+Nagel](https://www.kuehne-nagel.com/how-to/customs-clearance/ieepa-tariffs)

**Shipping software**
- ShipStation (November 2025) added guaranteed duties and taxes that US merchants pay at label creation for UPS, FedEx and DHL Express, available in the app and API. This is outbound/export DDP, not a US import tariff tool. — [BusinessWire, 2025-11-18](https://secure.businesswire.com/news/home/20251118263606/en/ShipStation-Streamlines-Duty-and-Tax-Payments-for-US-Businesses-Shipping-Internationally)
- Easyship has import tariff, tax and duty calculation, HS classification and DDP/DDU support. These are outbound cross-border shipping tools, not US-importer monitoring. — [Wikipedia: Easyship](https://en.wikipedia.org/wiki/Easyship)
- I found no tariff calculator from Shippo or ShipBob. ShipBob partners with Shippo for carrier rates. — [ShipBob partners: Shippo](https://www.shipbob.com/uk/partners/shippo/)

**Customs / trade software**
- Magaya (April 2025) announced tariff-response features for brokers and self-filers after the baseline tariffs and the end of de minimis for China/HK: automatic regulatory/tariff updates, filing validation, and bulk AMS-to-in-bond conversion. Magaya Customs Compliance is cloud ACE-certified ABI software. — [Magaya](https://magaya.com/magaya-empowers-customs-brokers-and-importers-to-stay-compliant-as-trade-regulations-and-tariffs-evolve); [DC Velocity](https://www.dcvelocity.com/supply-chain/magaya-empowers-customs-brokers-and-importers-to-stay-compliant-as-trade-regulations-and-tariffs-evolve)
- Descartes (August 4, 2026) launched an AI "Free Trade Intelligence" product to qualify goods for preferential treatment and find duty savings. It plugs into Descartes' Global Trade Intelligence suite and ERPs. Descartes also expanded Post Summary Correction (PSC) handling for self-filers and brokers dealing with tariff adjustments (2025 landing page), and runs CustomsInfo (HTS search, tariff lookup, landed cost, AI classification). — [Container News](https://container-news.com/descartes-launches-ai-powered-free-trade-intelligence-solution/); [Descartes PSC page](https://www.descartes.com/lp/tariffs-06-2025); [GetApp: CustomsInfo](https://www.getapp.com/all-software/a/descartes-customsinfo/)
- WiseTech/CargoWise moved to "Value Packs" (December 2025), replacing seat and transaction licensing with packs covering forwarding, customs, warehousing and land transport. — [CargoWise partner/program search results](https://partners.wisetechglobal.com/)

**Amazon/e-commerce seller tools**
- Helium 10 built its own "Tariff Analyzer" (SKU-level margin impact and pricing scenarios, relies on the seller's COGS), available on Starter plans and up, plus a free "Tariff Strategy Center" content hub. — [Helium 10 blog](https://www.helium10.com/blog/new-tariff-analyzer-tool/); [Tariff Strategy Center](https://www.helium10.com/tariff-strategy-center)
- I found no Jungle Scout tariff calculator. Viral Launch and My Amazon Guy host tariff calculators/pages aimed at Amazon sellers. — [Viral Launch](https://viral-launch.com/?p=114031); [My Amazon Guy](https://myamazonguy.com/?p=108042)

**Sourcing platforms**
- I found no native Alibaba.com tariff/landed-cost calculator. Third parties fill the gap with browser extensions that run on Alibaba/AliExpress product pages: DutyDesk (HTS classification plus duty and landed cost from USITC data) and Tariff Lens by USTariffRates.com (10 free lookups/day, $19/month Pro). — [Chrome Web Store: DutyDesk](https://chromewebstore.google.com/detail/cclleafggpkkkjmihkfndmdokoklmgmn); [Tariff Lens](https://chromeboard.com/extension/tariff-lens-afeggbomofalnphnjloioffadkhekinp)
- Other standalone calculators: SwapCommerce (SimplyDuty data) and an Apify "US Tariff Exposure & Landed-Cost Analyzer" actor. — [SwapCommerce](https://www.swap-commerce.com/tariff-calculator); [Apify](https://apify.com/maxwiles/us-tariff-exposure-analyzer)

**Publishers**
- Supply Chain Dive's 2025 award entry says it built news trackers and data lookup tools for tariff changes, including a status page on tariffs on Canada, Mexico, China and the EU. — [AZBEE awards entry](https://azbeeawards.secure-platform.com/a/gallery/rounds/76/details/29632)

**Government**
- CBP launched CAPE (Consolidated Administration and Processing of Entries) in the ACE Portal on April 20, 2026 for IEEPA refunds. Importers or authorized brokers with an ACE Portal account and bank info file a CSV "CAPE Declaration" of entry numbers. Phase 1 covers certain unliquidated entries and entries within 80 days of liquidation. Refunds come with interest, 60-90 days after acceptance. — [KPMG](https://kpmg.com/us/en/taxnewsflash/news/2026/04/us-cbp-launches-ieepa-refund-tool.html); [CBIZ](https://www.cbiz.com/insights/article/tariff-refund-process-underway-quick-facts-to-know)
- Sources disagree on the dates: most say the Supreme Court IEEPA ruling came February 20, 2026, while ShipMonk's guide gives February 24, 2026 as the collection-stop date and February 4, 2025 to February 24, 2026 as the eligible-entry window. — [ShipMonk](https://www.shipmonk.com/resources/content-hub/ieepa-tariff-refund-guide-2026); [KPMG](https://kpmg.com/us/en/taxnewsflash/news/2026/03/us-cbp-ieepa-duty-refund-process-update.html)

### Inferences
- The players with the deepest importer data (Flexport, C.H. Robinson, Descartes, Magaya, CargoWise) all built tariff features themselves. A small vendor is unlikely to be distributed by them, and Flexport in particular competes head-on (free HTS+COO calculator, alerts gated behind sign-in, refund calculator).
- The biggest whitespace is among players with US-importer audiences but no import-duty monitoring product: 3PLs (ShipBob, ShipMonk, Deliverr-type), parcel/shipping software (ShipStation, Shippo, EasyPost, Veeqo, whose duty features face outbound), sourcing marketplaces (Alibaba.com, Global Sources, Made-in-China, which rely on third-party extensions), Amazon tools other than Helium 10 (Jungle Scout), and fintechs (no tariff tools found).
- ShipMonk publishing IEEPA refund content shows that 3PLs see refunds and tariffs as merchant-retention content. A co-branded refund-check or alert embed is a natural pitch.

### Gaps
- Forto, Freightify, EasyPost, Veeqo, ShipMonk (tool), Global Sources, Made-in-China, Thomasnet, ImportYeti, Panjiva, Thomson Reuters ONESOURCE and Customs City: I did not find confirmed 2025-2026 tariff-tool launches in these searches. Absence is not proven.
- Usage numbers for any of these tariff tools (Flexport simulator traffic, Helium 10 analyzer adoption) were not found.
- Flexport simulator's current free/Pro limits could not be verified on a primary page (403).

## Which have open partner/app programs vs. require BD deals? Fees, rev share, affiliate rates.

### Takeaway
Open, self-serve channels with published economics exist mainly in e-commerce ecosystems: the Shopify App Store (0% revenue share on the first $1M lifetime, then 15%) and the Amazon Selling Partner Appstore (the planned 2026 SP-API fees were cancelled). Freight and customs ecosystems (CargoWise, Magaya, Descartes, Flexport) are BD-led or closed, and none publish third-party marketplace fees. Fintech "perks" marketplaces (Brex, Ramp, Mercury) reach startups at scale, but vendor-side admission terms are unpublished, so they need outreach.

### Cited Findings
**E-commerce app stores (open, self-serve)**
- Shopify App Store: since a change announced May 2025 (effective June 16), Shopify takes 0% of the first US$1M of revenue over a developer's lifetime (revenue before January 1, 2025 does not count), then 15%. The old rule reset the $1M annually. Developers with ≥$20M annual app revenue or ≥$100M company revenue are not eligible for the 0% tier. — [Barchart](https://www.barchart.com/story/news/32186933/shopify-developers-lose-annual-revenue-share-break-as-program-moves-to-lifetime-model); [Shopify dev docs](https://shopify.dev/apps/store/revenue-share); [NBC/CNBC on the 2021 policy](https://www.nbcnewyork.com/news/business/money-report/amazon-competitor-shopify-cuts-app-store-fees-for-developers-on-first-1-million-in-revenue/3131103/)
- Amazon SP-API / Selling Partner Appstore: Amazon announced on November 3, 2025 a $1,400/year developer fee plus usage fees (tiers up to $10,000/month, $0.40 per 1,000 calls of overage), then cancelled them. Its developer portal says it "will not move forward with the SP-API usage and annual fees at this time." — [Amazon developer notice](https://developer.amazonservices.com/cancellation-of-sp-api-fees); [PPC Land: drop](https://ppc.land/amazon-drops-sp-api-fees-after-developer-pushback); [PPC Land: original](https://ppc.land/amazon-introduces-fees-for-third-party-developer-api-access-in-2026/)
- Easyship and ShipBob distribute through the Shopify App Store, which shows the App Store is where shipping/3PL tools reach importing merchants. — [Shopify: Easyship](https://apps.shopify.com/easyship?locale=fr); [Shopify: ShipBob](https://apps.shopify.com/shipbob?locale=fr)
- Brightpearl and ChannelEngine list ShipStation as an integration/technology partner. ShipStation's own developer and partner pages were not found in these searches. — [Brightpearl](https://www.brightpearl.com/integrations/shipping-and-fulfillment); [ChannelEngine](https://www.channelengine.com/de/partners/shipstation)

**Customs/freight software (BD-led)**
- WiseTech CargoWise Industry Partner program: "no direct financial investment" to join. Applicants are assessed by the CargoWise team by email and phone, and partners get discounts on the platform and integration features. A separate Service Partner track earns revenue from consulting, training, integration and support for CargoWise customers. The 2020 guidebook notes some items (dedicated non-production/production systems) carry a fee. — [WiseTech partners](https://partners.wisetechglobal.com/cargowise-industry-partners); [CargoWise: become a partner](https://cargowise.com/partners/become-a-partner/); [Service Partner Guidebook (2020)](https://cdn.intelligencebank.com/au/share/9yK3/qrp74/Ykq8q/original/CargoWise+Service+Partner+Guidebook)
- A third-party Shopify fulfillment app connected to CargoWise charges $29-$149/month (the vendor's own price, not a CargoWise fee), which shows that third-party CargoWise-linked apps exist. — [PickYourApp](https://pickyourapp.com/es/products/complect-fulfill-cargowise)
- Magaya has a "Connect" integration module. I found no public third-party marketplace or partner fee terms. — [Magaya Momentum 2026](https://www.magaya.com/momentum-magazine-2026/)
- CBP's ABI vendor list (May 2024) includes Customs City Global Solutions (ACE Entry, In-bond, DIS, service bureau) and Magaya. It is the canonical list of broker filing-software vendors to target for integrations. — [CBP ABI vendor list, May 2024](https://Www.Cbp.gov/sites/default/files/2024-05/ABI%20Software%20Vendors%20%28FINAL%20May%202%202024%29%20REFORMATTED_508_0.pdf)

**Fintech perks marketplaces (BD/application, terms unpublished)**
- Brex advertises $350K+ in partner discounts for bootstrapped, pre-seed and seed startups, with no VC referral needed. Ramp advertises a $350K+ perks pool (ramp.com/startups). Mercury advertises $200K+ in partner credits bundled with Mercury Raise. These figures come from third-party aggregators, and none covered how a vendor gets listed. — [guptadeepak.com: Brex](https://guptadeepak.com/startup-offers/programs/brex-startup); [guptadeepak.com: Ramp](https://guptadeepak.com/startup-offers/programs/ramp-rewards); [PerkStack, June 2026](https://perkstack.co/blog/startup-bank-perks)
- Airwallex runs a partner program (referral/partner page). I found no tariff angle for Payoneer or Airwallex. — [Airwallex partners](https://www.airwallex.com/ko-kr/partners)

**Institutions (free, relationship-based)**
- SBDCs run tariff education for importers. Examples: the Florida SBDC at FIU webinar (May 2025) on HTS/COO classification, brokers, ACE duty tracking and drawback; the Illinois SBDC International Trade Center's free "Trade Tariffs in 30 Minutes" (October 16, 2025) on finding rates and lowering tariffs; and an Ohio SBDC Export Assistance HTS workshop. A Mohawk Valley SBDC seminar demos the US Commercial Service FTA Tariff Tool, which shows SBDCs already demo free government/third-party tools in sessions. — [FIU SBDC](https://growbiz.fiu.edu/2025/05/tariffs-and-trade-what-you-need-to-know-now/); [Peoria Chamber listing](https://business.peoriachamber.org/events/details/trade-tariffs-in-30-minutes-22642); [SBA event 78811](https://www.sba.gov/event/78811); [SBA event 79766](https://www.sba.gov/event/79766)
- LA SBDC Network has run "Tips for Importing" webinars (2019-2022 listings). — [smallbizla.org](https://smallbizla.org/event/webinar-how-to-prepare-a-headache-free-import-transaction-3)

**Affiliate economics seen in the space**
- tariffstool.com is an affiliate-driven page that earns commission on Shippo sign-ups, which shows shipping platforms run affiliate programs that tariff-content sites monetize. The rate is not published in the result. — [tariffstool.com](https://www.tariffstool.com/tools/shipping-rates)

### Inferences
- The fastest open channel for HTS Hero is probably the Shopify App Store (no rev share on the first $1M) and possibly the Amazon Appstore (fees cancelled), since both reach DTC/Amazon importers. A Shopify app would need to map product catalogs or COGS to HTS+COO to be useful. Shopify already ships its own tariff calculator, so the listing would need to sell the alerts and audits.
- CargoWise, Magaya, Descartes and Flexport require BD. The CargoWise Industry Partner program is free to apply but assessed manually, and better suits a later stage.
- Fintech perks marketplaces are low-cost to try (offer a discount or extended trial) but reach startups broadly, not importers specifically. Treat them as low-intent, low-effort placements.
- SBDCs and trade centers are free, credible channels. They already demo tools in tariff webinars, so a "free calculator + how to find possible refunds" guest session fits HTS Hero's free-calculator model and its "find, flag, explain" positioning.

### Gaps
- No published listing terms, rev share or fees for: CargoWise marketplace integrations, Magaya, Descartes, Freightos/WebCargo, Flexport platform partners, ShipStation, Shippo, EasyPost, Veeqo, ShipBob, Payoneer, Wise, Brex/Ramp/Mercury (vendor side), Amex, PayPal, Alibaba.
- Affiliate rates for Shippo, ShipStation, Easyship and Jungle Scout/Helium 10 were not retrieved.
- Trade associations (NRF, AAFA, Toy Association, SBE Council) member-benefit/vendor-directory programs and their sizes were not researched in this pass.
- I found no evidence on licensing calculator widgets to FreightWaves, JOC or Sourcing Journal. Supply Chain Dive built its own trackers, which suggests publishers may build rather than license.

## Which give access to the importer's actual shipment data (entries, HTS, COO, value) to power alerts/audits automatically?

### Takeaway
Entry-level data (entries, HTS, COO, value) sits with customs brokers' ABI software (CargoWise, Magaya, Descartes, Customs City and the others on CBP's ABI vendor list), with forwarder-brokers like Flexport, and with the importer's own ACE Portal reports. Flexport has a public Customs Entries API, but only for shipments where Flexport is the broker, and it is status-focused. Shipping/3PL and fintech platforms mostly hold outbound parcel or payment data, not entry data.

### Cited Findings
- Flexport API: `GET /customs_entries` and `GET /customs_entries/{id}` (paged, up to 100 per page) return US CBP customs entry status for shipments where Flexport is the importer's customs broker. Webhook milestones (customs_entry release status) are also available. Credentials are created by the customer's admin in the Flexport Developer Portal by enabling specific resources. — [Flexport tutorial](https://developer.flexport.com/tutorials/customs-entries-api-tutorial/); [Flexport API docs](https://apidocs.flexport.com/v2/tag/Customs-Entries); [Flexport customs FAQ](https://developer.flexport.com/faq/customs/)
- Third-party connectors (Parabola, dlt) already pull Flexport API data for customers, which shows a customer-authorized integration path exists. — [Parabola: Flexport](https://parabola.io/product/integration/flexport); [dlthub](https://dlthub.com/context/pipeline/flexport-to-duckdb)
- ABI is the electronic filing channel for brokers, importers, port authorities and service centers. Non-automated filers use service bureaus (Customs City is one). — [CBP ABI vendor list](https://Www.Cbp.gov/sites/default/files/2024-05/ABI%20Software%20Vendors%20%28FINAL%20May%202%202024%29%20REFORMATTED_508_0.pdf); [Thomson Reuters ONESOURCE ABI help](https://www.thomsonreuters.com/en-us/help/onesource-global-trade/us-connectivity/automated-broker-interface-abi)
- Descartes' new Free Trade Intelligence integrates with ERP systems and Descartes' Global Trade Intelligence suite, so Descartes customers' product and entry data stays inside Descartes. — [Container News](https://container-news.com/descartes-launches-ai-powered-free-trade-intelligence-solution/)
- C.H. Robinson's Tariff Impact Analysis works on per-shipment data inside its own shipper platform. — [FreightWaves](https://www.freightwaves.com/news/firms-launch-tools-to-help-shippers-measure-tariff-costs)
- Helium 10's Tariff Analyzer relies on seller-entered COGS, not customs entry data, which shows Amazon tool ecosystems lack HTS/COO/entry data. — [Helium 10 blog](https://www.helium10.com/blog/new-tariff-analyzer-tool/)
- ShipStation's duty data is for outbound labels (guaranteed duties and taxes at label creation). — [BusinessWire](https://secure.businesswire.com/news/home/20251118263606/en/ShipStation-Streamlines-Duty-and-Tax-Payments-for-US-Businesses-Shipping-Internationally)
- The CAPE refund process works on lists of entry numbers uploaded by the importer or authorized broker via ACE, so the importer or broker holds the entry list. — [KPMG](https://kpmg.com/us/en/taxnewsflash/news/2026/04/us-cbp-launches-ieepa-refund-tool.html)

### Inferences
- For automatic alerts and audits, the highest-value integrations are (1) a customer-authorized Flexport API connector (status only, so HTS/value may need extra endpoints or document data; not verified) and (2) broker ABI-software exports (CargoWise, Magaya, Customs City), which require broker cooperation. ACE report upload remains the universal self-serve path.
- Shipping/3PL/fintech partners are distribution partners (audience), not data partners. HTS Hero would still need the importer to upload entry data or connect a broker.

### Gaps
- Whether Flexport's API exposes line-level HTS, COO and entered value (vs. release status only) was not confirmed.
- CargoWise, Magaya, Descartes and Customs City data-export APIs for third parties: no public documentation found in this pass.
- Freightos/WebCargo hold booking data (Q4 2025: 445k transactions, about 20,700 unique buyer users, 77 carriers; full-year 2025 GBV $1.29B, +44%), but nothing indicates customs entry data. — [Digital Commerce 360](https://www.digitalcommerce360.com/2026/02/23/freightos-revenue-transaction-volume-q4-2025/amp/)

## Customs brokers as a channel: white-label alerts/audits for brokers to offer clients

### Takeaway
Brokers are a concentrated channel, with about 14,454 active licensed brokers and NCBFAA members handling more than 97% of US entries. A white-label "broker AI / branded client alerts" category already exists in 2026 (TariffDesk, US Tariff Rates Broker AI around $499/month, GingerControl), which validates demand and also means competition. Brokers hold the entry data and do the filing, which fits HTS Hero's "find, flag, explain; broker files" positioning.

### Cited Findings
- CBP says there are approximately 14,454 active licensed customs brokers in the US (page undated). — [CBP](https://www.cbp.gov/node/77830)
- NCBFAA has 1,422+ member companies and 170+ affiliates (About page). Its membership page cites 1,300+, so the count depends on page date. Members handle more than 97% of US import entries. Membership also includes forwarders, OTIs, NVOCCs and air cargo agents. — [NCBFAA About](https://www.ncbfaa.org/about-ncbfaa); [NCBFAA membership](https://members.ncbfaa.org/join/company/join.html)
- TariffDesk monitors the Federal Register, the HTS and USTR Section 301 lists, and gives brokers a multi-client dashboard with white-labeled client alerts plus a REST API and MCP server. This comes from a TrustMRR startup profile, so treat its traction claims cautiously. — [TrustMRR: TariffDesk](https://trustmrr.com/startup/tariff-desk?metric=mrr)
- US Tariff Rates "Broker AI": a branded portal under the broker's firm name, a Pro tier at $499/month with a 14-day free trial, and a database covering Section 301 Lists 1-4B, 232 and 122 overlays. The same company makes the Tariff Lens Chrome extension ($19/month Pro). — [ustariffrates.com/broker-ai](https://ustariffrates.com/broker-ai); [Tariff Lens](https://chromeboard.com/extension/tariff-lens-afeggbomofalnphnjloioffadkhekinp)
- GingerControl positions itself for brokerages with per-client policy alerts ("Compliance Radar"). Its 2026 comparison also covers CargoWise, SAP GTS, Descartes, AEB and Gaia Dynamics. This is vendor-authored. — [GingerControl](https://gingercontrol.com/blog/trade-compliance-software-customs-brokers-2026)
- Magaya's 2025 broker features (automatic tariff updates, filing validation) show broker software vendors bundle tariff updates at no added cost to brokers (in NZ, updates come from Magaya's compliance team at no additional cost). — [Magaya](https://magaya.com/magaya-empowers-customs-brokers-and-importers-to-stay-compliant-as-trade-regulations-and-tariffs-evolve); [DCN](https://www.thedcn.com.au/news/magaya-brings-customs-compliance-to-kiwi-forwarding-platform)
- Brokers are on the front line of IEEPA refunds. CAPE lets authorized brokers file declarations for importers, and broker firms published "IEEPA refunds are here" client updates (Krieger Worldwide, April 2026). — [KPMG](https://kpmg.com/us/en/taxnewsflash/news/2026/04/us-cbp-launches-ieepa-refund-tool.html); [Mann Publications / Krieger](https://www.mannpublications.com/fashionmannuscript/2026/04/13/krieger-worldwide-industry-news-ieepa-refunds-are-here/)

### Inferences
- A white-label broker offering (branded client alerts + "possible overpayment" audit reports that the broker then files) fits HTS Hero's unlicensed "find, flag, explain" constraint: the broker decides and files. Competitor pricing of about $499/month for a branded portal gives a price anchor.
- A white-label calculator embed for broker and forwarder websites (lead gen) is plausible. Flexport's and Freightos's public calculators show that "free calculator → lead" is the standard playbook, and small brokers lack engineering teams to build one. No direct evidence of demand for licensed calculator embeds was found.
- NCBFAA (about 1,400 member firms) is the natural broker-channel venue (conference sponsorship, affiliate membership for its 170+ affiliates). Costs were not researched.

### Gaps
- NCBFAA affiliate/vendor membership fees and conference sponsorship pricing were not retrieved.
- Customer counts and revenue for TariffDesk, US Tariff Rates Broker AI and GingerControl were not verified.
- No survey data was found on how many brokers would pay for white-label client alerts or audits.
