# Business Software Marketplaces and Productivity Integrations as Distribution Channels for HTS Hero

Scope note: researched 2026-10-26 in about 25 search and fetch calls. Many marketplace listing pages render with JavaScript or block fetching (403), so live install counts and review counts were often not readable. Where a number came only from a third-party blog, that is stated. Marketplaces I could not research are listed under Gaps instead of being filled in from memory.

## Which marketplaces have concentrated SMB importer audiences and few tariff tools?

### Takeaway
The accounting stores (QuickBooks, Xero) have the largest SMB audiences and, as far as I could find, no dedicated US tariff-alert or duty-audit app. Their gap is real: users keep asking for landed cost and HTS/country-of-origin tracking. The ERP stores are different. Microsoft AppSource (Business Central) and Odoo Apps already have several small "US import duty calculator" modules, but those use static rate tables. None monitors tariff changes (Section 301/232/IEEPA) or audits overpayments. Inventory tools (Katana, Cin7) market "tariff management" pages but have no tariff data source of their own, which makes them good integration and co-marketing partners.

### Cited Findings
**Audience size**
- Intuit stopped disclosing QuickBooks Online subscriber counts in 2024. QBO Accounting revenue grew +22% (+$741M) in fiscal 2025. A third-party, unsourced estimate puts QBO at about 7M+ subscribers. — [Torovictorioso Substack](https://torovictorioso.substack.com/p/xero-vs-quickbooks); [SDO CPA, Sep 2026](https://www.sdocpa.com/?p=4445)
- Xero had about 4.4M subscribers globally in FY25 (sources differ: another says about 4M). No US breakdown is published, and Xero is still a late entrant in the US. — [ThinkInsights](https://thinkinsights.net/print/pdf/node/29228); [Xero ASX FY25 results](https://announcements.asx.com.au/asxpdf/20250515/pdf/06jrf4tktln1pt.pdf)
- Intuit's rest-of-world app store (2023) reaches "200+ markets", and all apps go through technical, marketing and security reviews before going live. — [CPA Practice Advisor](https://www.cpapracticeadvisor.com/2023/04/19/intuit-quickbooks-launches-rest-of-world-app-store/78582/)

**QuickBooks Online**
- A search for tariff/duty/landed-cost apps found no QuickBooks App Store listing for a dedicated tariff tool. Results were vendor blogs (Cleverence) and a Shopify-side app. — [Cleverence: Trump Tariffs and QuickBooks](https://www.cleverence.com/articles/business-blogs/trump-tariffs-impact-on-quickbooks-4827/)
- QBO's own landed cost tool is typically limited to the Plus and Advanced tiers. It allocates duty, freight and broker bills by value, weight or quantity. It has no customs classification. Guides suggest custom item fields for HS code and country of origin. — [Cleverence: Tariff volatility in QuickBooks](https://www.cleverence.com/articles/business-blogs/tariff-volatility-quickbooks-5827/)
- A Cleverence roundup of 10 "QuickBooks-compatible tariff tools" includes Cin7 Core (landed cost allocation). These are general inventory tools, not tariff-data tools. — [Cleverence](https://www.cleverence.com/articles/business-blogs/trump-tariffs-impact-on-quickbooks-4827/)
- A bookkeeper forum thread is titled roughly "my clients' COGS just jumped 25-40% and nobody's books are ready: how are you tracking landed costs". It argues HTS tagging is hard in QuickBooks without custom reporting. — [beancount.io forum](https://beancount.io/forum/t/tariff-accounting-chaos-my-clients-cogs-just-jumped-25-40-and-nobodys-books-are-ready-how-are-you-tracking-landed-costs/3658)

**Xero**
- The Xero Product Ideas forum has a long-running "Inventory – Landed Cost allocation" request. Users call it a basic need for importers and note competitors have it. I found no evidence it has shipped. — [Xero Product Ideas](https://productideas.xero.com/forums/939198-for-small-businesses/suggestions/48529637-inventory-landed-cost-allocation)
- Landara (a Shopify app, listing date Aug 13 2026) uses AI to extract freight, duty and customs from POs and freight invoices, allocates them per SKU, and posts COGS journals to Xero or QBO. It has a free tier (250 orders/mo, 10 landed-cost calcs/mo) and a paid tier at $49/mo or $490/yr. It is the closest "duty into the books" competitor found. — [Shopify App Store: Landara](https://apps.shopify.com/landara-landed-costs); [PickYourApp](https://pickyourapp.com/products/landara-landed-costs)

**Microsoft Dynamics 365 Business Central / AppSource**
- Withum Digital's "US Import Duties Calculator" applies import duties by item category, country of origin and HS code, with real-time calculation on purchase documents. Withum markets it as "the U.S. Tariff Calculator". — [Microsoft Marketplace listing](https://marketplace.microsoft.com/product/web-apps/PUBID.withumdigital|AID.usimportdutiescalcbusinesscentral|PAPPID.a9f66b3d-e96a-43e6-a30a-c2e3bb1f110a) (returned 403 on fetch); [Withum article](https://www.withum.com/resources/managing-import-duties-and-landed-cost-in-business-central/)
- Acumens "Freight, Duties & Tariffs" (SBC Dynamics ERP) calculates duties from configurable rules by country, product type and supplier. — [Microsoft Marketplace](https://marketplace.microsoft.com/en-US/product/PUBID.sbcdynamicserp1637715412860%7CAID.acumensfreightdutiesandtariffs%7CPAPPID.8113be16-e3b5-4604-b455-79442168ab44)
- Other BC apps are excise-focused (DS365 Excise Duty, Abakion Duty Reporting), not import tariffs. — [AppSource DS365](https://appsource.microsoft.com/zh-cn/product/dynamics-365-business-central/type.connect%7Cpubid.dsss%7Caid.ds365-excise-duty-app%7Cpappid.42686037-9102-4d37-b7fd-6d57b6ea2cf4); [AppSource Abakion](https://appsource.microsoft.com/en-ca/product/dynamics-365-business-central/PUBID.abakion%7CAID.duty_reporting%7CPAPPID.82ac6168-cac3-4574-a142-a36ec61610e9)
- BC partners (ArcherPoint) published content on tariffs and duty drawback in Business Central, prompted by the Canada/Mexico/China tariffs. — [ArcherPoint](https://archerpoint.com/tariffs-duty-drawbacks-and-business-central/)

**NetSuite**
- NetSuite's native Landed Cost can factor duties into item cost, and HS codes can be associated with items. Partners (RSM, Forvis Mazars) published tariff-management guides in 2025. — [RSM](https://technologyblog.rsmus.com/technologies/netsuite/navigating-tariff-changes-with-netsuites-landed-cost-functionality/); [Forvis Mazars, Feb 2025](https://www.forvismazars.us/forsights/2025/02/navigating-tariff-management-with-netsuite)
- I found no current Built for NetSuite tariff-rate SuiteApp. The only duty SuiteApp that surfaced was a 2011 Pitney Bowes cross-border release. — [Pitney Bowes release](https://pitneybowesinc.gcs-web.com/node/13826)

**Odoo Apps** (several paid modules, mostly static or non-US)
- "Tariff Tracking" (v18) by Clients First Business Solutions (US), $456.58. It manages HTS codes per product and puts tariff charges into landed cost. No mention of Section 301, IEEPA or rate updates, and no download count shown. — [Odoo Apps: tariff_tracking](https://apps.odoo.com/apps/modules/18.0/tariff_tracking)
- "Tariff Impact Calculator" (v19) estimates duties pre-purchase by HS code, origin, destination and FTA. — [Odoo Apps](https://apps.odoo.com/apps/modules/19.0/tariff_impact_calculator)
- "Import Fees" (Odoo Skillz, v17) offers HS codes per product, customs duty, CIF value, and customs bills from landed costs. "Customs Duties and Tariff Rates" (Creyox, SerpentCS) uses South Asian duty components (CID, PAL, SSCL), so it is not a US fit. — [Odoo import_fees](https://apps.odoo.com/apps/modules/17.0/import_fees); [Odoo customs_duties_and_tariff_rates](https://apps.odoo.com/apps/modules/19.0/customs_duties_and_tariff_rates)

**Inventory and ops tools**
- Katana has a "Manage tariffs" solution page: landed costs on POs, multicurrency, reorder suggestions for tariff-affected materials, and an MCP option. It names no tariff data source, HTS field or country-of-origin field. — [Katana: Manage tariffs](https://katanamrp.com/solutions/manage-tariffs/)
- Cin7 Core allocates landed costs (duty, freight) to POs proportionally by cost or quantity. Users report three gaps:
  - allocation applies only to a whole PO, not per line, which matters when tariffs differ by product — [Cin7 community](https://help.omni.cin7.com/hc/en-us/community/posts/13448320264847-Landed-Cost-Allocation-by-sku)
  - landed cost is not exposed in the API — [Cin7 community](https://help.omni.cin7.com/hc/en-us/community/posts/10417707021199-API-access-to-Landed-Cost-for-reporting-engines)
  - an open feature request asks to "automatically accrue and track tariffs" by country of origin — [Cin7 community](https://help.core.cin7.com/hc/en-us/community/posts/13696284566287-Feature-Request-Ability-to-Automatically-Accrue-and-Track-Tariffs)
  - Sources: [Cin7 help](https://help.core.cin7.com/hc/en-us/articles/9034516716047-Landed-cost-expense-distribution)
- A Cin7 partner (Certum) claims Cin7 uses "real-time duty rates". This conflicts with the user reports above and is unverified. — [Certum Solutions](https://www.certumsolutions.com/library/cin7-tariff-management-turn-cross-border-costs-into-competitive-advantage)
- Cin7 Core starts at $349/mo and Omni at $799/mo (2026 comparison). Cin7 claims 700+ integrations. — [OneCart](https://www.getonecart.com/cin7-alternatives/); [Cin7 vs Unleashed](https://www.cin7.com/unleashed-alternative/)

**Productivity and automation**
- A Google Workspace Marketplace search for "tariff" returned one irrelevant result: a Ukrainian shipping app, Uchet Zakazov. No HTS or duty add-on was found. — [Workspace Marketplace search](https://workspace.google.com/marketplace/search/tariff)
- The closest Sheets-adjacent products are:
  - a paid Excel workbook, "Tariff Auto-Fill Tool": enter an 8-digit HTS code, get the duty rate and overlay flags — [SamCart](https://careerchronicle.samcart.com/products/taf-097)
  - DutyDesk, a Chrome extension that classifies HTS/TARIC and calculates duty on Alibaba and AliExpress — [Chrome Web Store](https://chromewebstore.google.com/detail/cclleafggpkkkjmihkfndmdokoklmgmn)
  - an n8n/Neura workflow for Sheets HS-code lookup (EU API) — [Neura](https://www.neura.market/workflow/automate-hs-code-lookup-enrichment-with-google-sheets-customs-api)
  - Parabola's HTS integration (USITC API) — [Parabola](https://parabola.io/product/integration/hts)
- I found no dedicated Zapier app for HTS or tariff lookups. A Zapier Community answer suggests scraping a government duty page to trigger Zaps, a DIY workaround that shows unmet demand. — [Zapier Community](https://community.zapier.com/how-do-i-3/need-help-automating-small-business-projects-using-zapier-51952)
- Camtom (a Mexico-based customs compliance vendor) offers a Slack integration for compliance alerts and an SAP sync for tariff classifications. It is the only "tariff alerts in Slack" product found. — [Camtom Slack](https://camtomx.com/integraciones-apps/slack)

### Inferences
- **Best audience-to-competition ratio:** QuickBooks Online App Store, then Xero. Both have huge SMB bases, no tariff-monitoring or audit app found, and documented importer pain: no HTS or country-of-origin fields, landed cost tiers only, bookkeepers struggling.
- **Lowest-friction "empty shelf":** a Google Sheets custom function (=DUTY(hts, country)) and a Zapier/Make app. Both are uncontested by any US tariff app I could find.
- **AppSource (BC) and Odoo already have duty calculators:** HTS Hero's edge there would be maintained, current rates (301/232/IEEPA stacking), change alerts, and audits, not calculation itself. These are partner-led (VAR) ecosystems, so they are harder for a solo founder.
- **Katana and Cin7:** they market tariff pages with no data source, which makes them strong candidates for a tech-partner integration and co-marketing. Their own communities ask for automatic tariff accrual by country of origin.

### Gaps
- No live install or review counts for any QuickBooks, Xero, AppSource or Odoo tariff listing (pages are JS-rendered or returned 403).
- US-specific Xero subscriber count and the share of QBO/Xero users who import: not found. No source quantifies the importer share of any marketplace's audience.
- Not researched for lack of budget: Sage Marketplace, Acumatica, SAP Store, Zoho Marketplace, Brightpearl, Fishbowl, Linnworks, inFlow, Extensiv, SkuVault, Unleashed, ShipHero, Prediko, Notion, Airtable, Make, n8n and Pipedream directories, Teams store, and Salesforce AppExchange listings for tariff apps.
- No Reddit threads (r/Bookkeeping, r/smallbusiness) surfaced through search.

## Specific evidence of tariff app demand in 2025-2026 on these stores

### Takeaway
Demand evidence is mostly indirect. ERP partners published tariff guides in 2025 (RSM, Forvis Mazars, ArcherPoint, Withum). Odoo and AppSource show a cluster of tariff modules, Katana launched a tariff solutions page, and there are open feature requests in Xero and Cin7. The newest app found is Landara (Aug 2026). I found no review-backed traction numbers for any tariff app.

### Cited Findings
- Partner and SI content prompted by the 2025 tariffs:
  - Forvis Mazars, Feb 2025, NetSuite tariff management — [Forvis Mazars](https://www.forvismazars.us/forsights/2025/02/navigating-tariff-management-with-netsuite)
  - RSM, NetSuite landed cost for tariff changes — [RSM](https://technologyblog.rsmus.com/industry/industrials/navigating-tariff-changes-with-netsuites-landed-cost-functionality)
  - ArcherPoint, BC tariffs and duty drawback (Canada/Mexico/China) — [ArcherPoint](https://archerpoint.com/tariffs-duty-drawbacks-and-business-central/)
  - Withum, US Import Duties Calculator for BC — [Withum](https://www.withum.com/resources/managing-import-duties-and-landed-cost-in-business-central/)
- Vendor SEO content: Cleverence has published multiple 2025-26 articles on "Trump tariffs and QuickBooks" and "Trump tariffs impact on Odoo". This shows search demand for tariffs plus each accounting brand. — [Cleverence QuickBooks](https://www.cleverence.com/articles/business-blogs/trump-tariffs-quickbooks-3974/); [Cleverence Odoo](https://www.cleverence.com/amp/articles/business-blogs/trump-tariffs-impact-on-odoo-4072/)
- Katana "Manage tariffs" solution page — [Katana](https://katanamrp.com/solutions/manage-tariffs/)
- Odoo v18/v19 tariff modules (Tariff Tracking at $456.58; Tariff Impact Calculator v19) — [Odoo Apps](https://apps.odoo.com/apps/modules/18.0/tariff_tracking); [Odoo Apps](https://apps.odoo.com/apps/modules/19.0/tariff_impact_calculator)
- Landara launched Aug 13 2026, with duty extraction into Xero and QBO — [Shopify App Store](https://apps.shopify.com/landara-landed-costs)
- Feature requests: Cin7 "Automatically Accrue and Track Tariffs" — [Cin7 community](https://help.core.cin7.com/hc/en-us/community/posts/13696284566287-Feature-Request-Ability-to-Automatically-Accrue-and-Track-Tariffs); Xero landed cost — [Xero ideas](https://productideas.xero.com/forums/967139-purchase-orders-bills-inventory/suggestions/48529637-inventory-landed-cost-allocation)
- Avalara has 353 Capterra reviews (4.0/5) but is sales-tax led. Zonos Landed Cost has 1 Capterra review. These are the incumbent cross-border tools, and both are checkout-oriented (DTC exporters) rather than importer audits. — [Capterra compare](https://www.capterra.co.uk/compare/75673/1017801/avatax/vs/zonos-landed-cost)

### Inferences
- Tariff demand shows up as content and feature requests rather than as apps with traction. That suggests the stores are under-supplied, though it could also mean the store channel converts poorly for this category. Both readings fit the evidence.

### Gaps
- No marketplace published "trending: tariffs" data. No app reviews mentioning tariffs were found. Release dates for the AppSource and Odoo modules are unknown.

## Revenue share, security review requirements, timelines and cost for a solo founder

### Takeaway
Several stores have moved from revenue share to API-usage fees. Intuit (Jul 2025) and Xero (Mar 2026) now charge for reads, which is exactly what a PO and bill-reading tariff monitor does. Entry tiers are free or cheap: Intuit Builder is $0 with 500k read credits, and Xero Starter is free but capped at 5 connections. Certification gates are modest for a solo founder, except NetSuite (SDN $3k/yr), Salesforce ($999 per review plus revenue share) and possibly Google CASA if restricted scopes are used.

### Cited Findings
**QuickBooks (Intuit App Partner Program)**
- The program launched Jul 28 2025 for US partners. Full variable API fees started Nov 1 2025. — [Apideck](https://www.apideck.com/blog/quickbooks-api-pricing-and-the-intuit-app-partner-program); [Intuit blog](https://blogs.a.intuit.com/?p=34971)
- Tiers:

  | Tier | Monthly fee | CorePlus credits | Overage |
  |---|---|---|---|
  | Builder | $0 | 500k/mo | Calls blocked over limit |
  | Silver | $300 | 1M | $3.50 per 1k calls |
  | Gold | $1,700 | about 10M | Not stated |
  | Platinum | $4,500 | Up to 75M | $0.25 per 1k calls |

  Truto reports Gold needs 500+ active connections and Platinum 3,000+. Premium APIs (e.g. Custom Fields) start at Silver. — [Apideck](https://www.apideck.com/blog/quickbooks-api-pricing-and-the-intuit-app-partner-program); [Truto](https://truto.one/blog/how-much-does-the-quickbooks-api-cost-2026-pricing-rate-limits/)
- Core calls (mostly POST writes) are free and unlimited. CorePlus calls (mostly GET reads: bills, invoices, reports) are metered. Only 2xx responses count, and billing is per workspace. — [Apideck](https://www.apideck.com/blog/quickbooks-api-pricing-and-the-intuit-app-partner-program)
- All App Store apps go through technical, marketing and security reviews. — [CPA Practice Advisor](https://www.cpapracticeadvisor.com/2023/04/19/intuit-quickbooks-launches-rest-of-world-app-store/78582/)
- Revenue share terms: not found. A partner directory mentions "co-selling incentives, revenue share options, and joint marketing campaigns" without terms. — [Partnerfleet directory](https://partner-program-directory.partnerfleet.io/partners/intuit-app-partner-program)

**Xero**
- The 15% App Store revenue share (introduced 2022) is retired. Tiered usage pricing took effect Mar 2 2026, App Store subscription billing (XASS) is being wound down, and partners now bill directly. — [Apideck Xero docs](https://developers.apideck.com/connectors/xero/docs/application_owner+oauth_credentials); [Xero pricing FAQ](https://developer.xero.com/faq/pricing-and-policy-updates)
- Tiers (third-party figures, billed in AUD):

  | Tier | Monthly fee | Connections | Egress |
  |---|---|---|---|
  | Starter | Free | 5 | Unlimited |
  | Core | about A$35 | 50 | 10GB |
  | Plus | about A$245 | 1,000 | 50GB |
  | Advanced | about A$1,445 | 10,000 | 250GB |
  | Enterprise | Custom | Custom | Custom |

  Overage is about A$2.40/GB. Journals and other premium endpoints need Advanced plus a security assessment. Existing apps had to transition by Jul 1 2026. — [Truto](https://truto.one/blog/xero-api-pricing-changes-2026-costs-tiers-and-how-to-minimize-egress/); [Xero pricing](https://developer.xero.com/pricing); [Accountants Daily](https://www.accountantsdaily.com.au/technology/21986-all-you-can-eat-xero-data-buffet-comes-to-abrupt-end)
- Certification is mandatory from the Plus tier. Sources disagree on the connection requirement: 10 active customer connections during review per Apideck's current docs, or 3 within 30 days per older Apideck and Codat pages. Review runs as multiple checkpoints and "can take several months". New apps get only granular OAuth scopes. — [Apideck](https://developers.apideck.com/connectors/xero/docs/application_owner+oauth_credentials); [Codat](https://www.codat.io/blog/get-your-app-certified-on-the-xero-app-store/)

**NetSuite**
- SuiteCloud Developer Network membership is $3,000/yr (Select) or $10,000/yr (Premier, invitation only). Built for NetSuite is self-verification against NetSuite standards, and no separate fee was found. — [NetSuite SDN](https://netsuite.com/portal/developers/sdn.shtml); [VATCalc BFN](https://www.vatcalc.com/global/vatcalc-vat-filer-achieves-built-for-netsuite-status/)

**Salesforce AppExchange**
- There is no security review fee for free apps. Paid and freemium apps pay $999 per review attempt, including resubmissions and new versions (official docs, v242). Older figures of $2,700 + $300/yr are outdated. — [Salesforce docs](https://developer.salesforce.com/docs/atlas.en-us.242.0.packagingGuide.meta/packagingGuide/security_review_fees.htm)
- The revenue share is historically 15% (ISVforce) or 25% (OEM), with tiered royalties since 2020. — [InfoWorld](https://www.infoworld.com/article/2193561/update-salesforce-com-to-impose-massive-fee-hike-for-app-store-security-review.html); [Ceptes](https://ceptes.com/blogs/salesforce-appexchange-pricing-the-definitive-guide/)

**HubSpot App Marketplace**
- Listings are manually reviewed by the Ecosystem Quality team: one use case per app, no second-app dependency (docs updated Aug 22 2025). An agency blog says the minimum is 3 active installs in unaffiliated accounts within 30 days, and unlisted apps are capped at 25 installs. — [HubSpot docs](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/listing-your-app/app-marketplace-listing-requirements); [SpotDev](https://www.spotdev.co.uk/blog/how-to-list-a-saas-product-on-hubspot-app-marketplace)

**Google Workspace Marketplace**
- Apps requesting restricted scopes (e.g. Drive write) need a CASA security assessment. Costs reported:
  - free for Tier 2 in one developer's case — [James Cui](https://jamescui.substack.com/p/crack-googles-casa-review)
  - about $540-1,500+ for Tier 2 across labs (2024) — [Switch Labs](https://switchlabs.dev/post/casa-tier-2-tier-3-security-review-providers-pricing-and-the-cheapest-option)
  - $3,000-6,000 at one lab — [Leviathan](https://leviathansecurity.com/programs/google-casa-cloud-application-security-assessment)
  - Assessment takes 4-8 weeks, with possible annual reassessment. Scope guidance: [Google docs](https://developers.google.com/workspace/marketplace/authorizing?hl=en)

### Inferences
- **Solo-founder cost ranking (cheapest first):**
  1. Zapier/Make app, plus a Sheets custom function scoped to the current sheet and external requests (likely avoids restricted scopes, so likely avoids CASA; worth verifying)
  2. QuickBooks Builder ($0, read-credit limit applies)
  3. Xero Core (about A$35/mo, but certification needs Plus at about A$245/mo plus 3-10 live customers)
  4. HubSpot
  5. Salesforce ($999 per review)
  6. NetSuite ($3k/yr SDN, plus a SuiteScript build)
- A tariff monitor reads bills and POs continuously. On QuickBooks those are metered CorePlus reads, so prefer webhooks or CDC and incremental syncs to stay inside 500k/mo on Builder.

### Gaps
- Official Intuit App Store listing and security-questionnaire requirements, and timelines: not retrieved.
- Microsoft AppSource, Odoo (vendor revenue share), Slack Marketplace, Teams, Zapier and Make partner terms were not researched.
- Xero's official tier prices were not read directly (from third parties only).

## Which offer co-marketing or featured placement for timely topics like tariffs?

### Takeaway
I found no documented store-run "tariff" collections or featured placements. The visible co-marketing comes from ERP implementation partners and from inventory vendors' own tariff pages. Intuit's partner program mentions joint marketing with no terms, and Gold and Platinum tiers include an allocated partner team. Katana, Cin7 and Withum-type BC partners look like the most realistic co-marketing targets, because they publish tariff content without their own rate data.

### Cited Findings
- Intuit App Partner Program: "co-selling incentives, revenue share options, and joint marketing campaigns" (no terms). Gold and above get an allocated partner team. — [Partnerfleet](https://partner-program-directory.partnerfleet.io/partners/intuit-app-partner-program); [Apideck](https://www.apideck.com/blog/quickbooks-api-pricing-and-the-intuit-app-partner-program)
- Google CASA Tier 3 brings "inclusion into high value categories" on the Workspace Marketplace. — [James Cui](https://jamescui.substack.com/p/crack-googles-casa-review)
- Partner tariff content in 2025: RSM, Forvis Mazars, ArcherPoint, Withum, Certum (Cin7). Katana runs its own tariff solution page. — sources above.

### Inferences
- The fastest co-marketing pitch is to inventory and ERP vendors that already rank for "tariffs + [product]" but lack a rate engine: "plug HTS Hero rates and alerts into your landed cost". A store-level featured slot is unproven.

### Gaps
- No evidence found of a QuickBooks, Xero, AppSource, Zapier or Slack editorial feature on tariffs. Store editorial contact processes were not researched.
