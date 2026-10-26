# Authoritative public data sources for US AD/CVD cases (catalogue for a product team)

Research date: 2026-10-26. Every "fetched" line below was requested from this machine on that date, using a plain identifying User-Agent with no browser spoofing, and the result is recorded. Federal Register requests were sent one at a time, at least 2 s apart. Local copies of the responses are in the session scratchpad `/private/tmp/claude-501/-Users-brendanmclaughlin-Projects-HTS-Hero-hts-hero/ef33aad5-817c-4fd5-a84e-7f3e6cbecfa7/scratchpad/src/`. Some facts come from earlier HTS Hero work and are cited to repo files or the project memory file `adcvd-renumbered-codes-plan.md`. Two things were deliberately not done: TLS checks were not bypassed (api.trade.gov), and usitc.gov's bot wall was not got around by faking a browser.

## 1. ITA / Enforcement & Compliance (trade.gov, ACCESS, developer portal)

### Takeaway
ITA's public case pages on beta.trade.gov are the best free per-case source for current scope text, an HTS list, final scope, circumvention and changed-circumstances rulings with links to ACCESS documents, and upcoming review deadlines. They are server-rendered HTML with no JSON API, they have no status field, and their HTS lists keep dead or never-existing codes. ITA has no live AD/CVD API: the old `api.trade.gov/v1/adcvd_orders` endpoint is dead, and the developer portal lists no AD/CVD product. ACCESS is the official document store, but it is a Blazor app with no REST API.

### Cited Findings
**Case pages**
- `https://www.trade.gov/adcvd?adcvdcase=A-570-137` now returns **404** (a 250 KB "not found" page). The working case page is `https://beta.trade.gov/adcvd?adcvdcase=A-570-137`, which returned 200 (43.6 KB, text/html). It is a Salesforce Visualforce site: the assets are under `/resource/…`. — [beta.trade.gov case page](https://beta.trade.gov/adcvd?adcvdcase=A-570-137)
- **Fields on the page** (verified for A-570-137, C-570-138, A-580-903, A-570-093, C-201-846, A-821-840, A-570-979):
  - case number, country, product name, industry sector
  - "Upcoming Announcements": segment type, the date due, "Extension Days Remaining" and the period covered
  - "HTS Numbers" list
  - "Scope of the Order" (or "Scope of the Suspension Agreement"), full text with footnotes
  - "Final Scope Rulings, Circumvention Determinations, and Changed Circumstance Determinations" table: Record Type, Final Signature Date, Product Description, Decision ("View Document" link to `access.trade.gov/efiledetails/<id>`), In Scope?, Scope Determination summary, HTS Change(s), Scope Language Change(s).
  - Not on the page: a status, order or revocation dates, rates and company names. — [A-570-979](https://beta.trade.gov/adcvd?adcvdcase=A-570-979); [C-201-846](https://beta.trade.gov/adcvd?adcvdcase=C-201-846)
- **R-125 (A-570-137 and C-570-138)**:
  - Both pages list 11 HTS numbers: 2903.44.10.10, 2903.49.00.00, **2903.49.10.10**, 3827.11.00.00, 3827.39.00.00, 3827.62/.63/.64/.65/.68/.69.00.00.
  - The page's own scope text names 2903.44.1010 as the main code, plus 2903.49.0000 and eight 3827 codes. It does not name 2903.49.1010.
  - So ITA's list keeps the never-existing 2903.49.10.10 that the 2022 order printed. The current HTS has only 2903.49.00.00 under 2903.49 (hts.usitc.gov search, fetched).
  - No scope rulings are listed and no upcoming announcements. — [A-570-137](https://beta.trade.gov/adcvd?adcvdcase=A-570-137); [C-570-138](https://beta.trade.gov/adcvd?adcvdcase=C-570-138); [HTS search 2903.49](https://hts.usitc.gov/reststop/search?keyword=2903.49)
- **A-580-903 (PET sheet, Korea)**: the HTS list is just 3920.62.00.90, matching the scope text. — [A-580-903](https://beta.trade.gov/adcvd?adcvdcase=A-580-903)
- **A-570-093 (refillable stainless steel kegs, China)**:
  - The page lists 7310.10.00.10, 7310.10.00.50, 7310.29.00.25 and 7310.29.00.50, and the scope text names the same four codes.
  - The current HTS under 7310.10.00 has only .05 ("Refillable stainless steel kegs…"), .15 (empty drums) and .90. So **both the ITA list and the scope text are stale**: kegs now enter under 7310.10.0005, a code neither of them names. — [A-570-093](https://beta.trade.gov/adcvd?adcvdcase=A-570-093); [HTS search 7310.10.00](https://hts.usitc.gov/reststop/search?keyword=7310.10.00)
- **C-201-846 (sugar from Mexico, suspension agreement)**:
  - The HTS Numbers section says "No data is available to display", yet the scope text lists 18 HTSUS codes. A footnote gives the pre-2016 and pre-2020 codes (1701.99.1010, 1701.14.1000, 1701.99.5010).
  - The page shows an administrative review with preliminary results due 12/21/2026 (period 1/1/2025–12/31/2025) and a "Scope Inquiry Post AB10" ruling dated 02/28/2025 (Batory-Rafi powdered sugar, not in scope). — [C-201-846](https://beta.trade.gov/adcvd?adcvdcase=C-201-846)
- **A-821-840 (unwrought palladium, Russia)**: the page exists, but HTS, scope and rulings all say "No data is available to display." This is consistent with no order: the ITC's final vote was negative (see section 3). — [A-821-840](https://beta.trade.gov/adcvd?adcvdcase=A-821-840)
- **A-570-979 (solar cells, China; the big order)**:
  - The HTS list has 9 entries: 8501.31.80.00, 8501.61.00.00, 8507.20.80, and 8541.40.60.15/.20/.25/.30/.35/.45. The scope text names only 8501.61.0000, 8507.20.80, 8541.40.6020, 8541.40.6030 and 8501.31.8000. So the **ITA list is broader than the scope text**: four extra 8541.40.60 suffixes.
  - The scope text says 8501.31.8000 was added at CBP's request ("ACE Case Reference File Update" memo, May 16, 2012).
  - Upcoming announcements: final results due 12/15/2026 (POR 12/1/2023–11/30/2024) and preliminary results due 12/28/2026 (POR 12/1/2024–11/30/2025).
  - The rulings table has 24 "View Document" links. They include changed-circumstances partial revocations (Nextracker off-grid panels 12/15/2025, Source Global 03/14/2024), scope rulings (off-grid module GC4291F, in scope, 08/13/2024) and the 08/17/2023 circumvention findings for Cambodia, Malaysia, Thailand and Vietnam. — [A-570-979](https://beta.trade.gov/adcvd?adcvdcase=A-570-979)

**Case search**
- The case search page (`https://beta.trade.gov/adcvd-search`) is a React bundle (`/resource/1577131835000/adcvdsearch/adcvdsearch/0adcvd_search.js`). Its config points at `https://api.trade.gov/v1/adcvd_orders/search` with an API key embedded in the bundle.
- A request to that host fails TLS: "SSL certificate problem: certificate has expired". This legacy AD/CVD API is effectively dead. I did not bypass TLS to test it. — [beta.trade.gov/adcvd-search](https://beta.trade.gov/adcvd-search)

**Developer portal and terms**
- ITA's developer portal (Azure API Management) lists six APIs: Business Service Providers, Consolidated Screening List, FTA Tariff Rates, ITA Office Locations, Trade Events and Trade Leads. **There is no AD/CVD API.** They need a subscription key, sent in the `subscription-key` header or query. — [developer.trade.gov API list JSON](https://developer.trade.gov/developer/apis?api-version=2022-04-01-preview)
- **ITA API terms of service**:
  - Use to "search, display, analyze, retrieve" is allowed.
  - A required notice: "This product uses the International Trade Administration's Data API but is not endorsed or certified by the International Trade Administration."
  - No modifying content and still claiming ITA as the source.
  - ITA may throttle, or block users who try to exceed limits.
  - You may not obtain material "not intentionally made publicly available". This is relevant to keys embedded in bundles. — [ITA Terms of Service](https://developer.trade.gov/terms-of-service)
- The ITA SLA states a 99.5% uptime target, with per-API throttling levels given on each API's documentation page. — [ITA SLA](https://developer.trade.gov/service-level-agreement)

**ADCVD Proceedings dashboard**
- The dashboard page (`https://www.trade.gov/data-visualization/adcvd-proceedings`, 200) embeds a Power BI report: `powerbi.trade.gov/#/workspace/EC-DAS-OOS-ADMIN-PUBLIC/report/ADCVD%20Proceedings`.
- No CSV or JSON export link was found in the page HTML. `www.trade.gov/adcvd-proceedings`, `/scope-rulings` and `/federal-register-notices-0` return 404, and `/us-antidumping-and-countervailing-duties` returned 403 to curl. — [ADCVD Proceedings dashboard](https://www.trade.gov/data-visualization/adcvd-proceedings)

**ACCESS (access.trade.gov)**
- ACCESS is "the repository for all documents filed in an AD/CVD proceeding". The public can search and view Public Documents and Public Versions; filing needs registration. — [ACCESS home](https://access.trade.gov/)
- The FR notices search ("FR Notices and Associated Decision Memoranda") is a Blazor Server app (`_framework/blazor.web.js`, SignalR), so there is no plain REST endpoint to call.
  - Filters: Document Title, Case Number, POR/POI dates, Country, Product, FR Cite, Publication Date.
  - Segment: CCR, CIRC, CMI, INV, NSR, REM, REV, S129, SCO, SUNR, SUSP.
  - Document Type: FR Notice Published, FR Notice Unpublished, Decision Memo.
  - Subject: includes Final/Prelim Issues and Decision Memo, Order, Revocation, Continuation, Opportunity to Req. Admin Review, and others.
  - The old ASPX path `access.trade.gov/public/FRNoticesListLayout.aspx` returns 404. — [ACCESS FR Notices](https://access.trade.gov/frnotices)
- Scope ruling documents are reachable as `https://access.trade.gov/efiledetails/<id>` links from the case pages, for example `4855744-01`. — [A-570-979 case page](https://beta.trade.gov/adcvd?adcvdcase=A-570-979)
- HTS Hero's current code (`libs/adcvd/ita.ts`):
  - It reads the beta case pages one request at a time, about 1 s apart, re-reading after 30 days.
  - Its comments note the HFC blends scope text has new 3827.6x codes while notices keep the old 3824.78 codes.
  - An earlier session found ITA statuses can be matched for all 946 live cases only via parser fixes, because the page has no status. — `libs/adcvd/ita.ts`; project memory `adcvd-renumbered-codes-plan.md`

### Inferences
- For a product, the beta case page is the best scraped source for **scope text, ruling history and upcoming deadlines**. Treat its HTS list as "codes ITA once associated with the case", not as the current valid codes. It can be stale (kegs, R-125), incomplete (sugar: empty), or broader than the scope (solar).
- The move from www.trade.gov to beta.trade.gov suggests these URLs may change again. Monitor for 404s, and keep the case number as the key rather than the URL.
- ITA has no sanctioned bulk AD/CVD feed. The case list and status must come from the FR, the ITC or CBP, with the Power BI dashboard as a manual check.
- Do not use the API key embedded in the beta bundle. The ToS bars obtaining material not intentionally published, and the endpoint is dead anyway.

### Gaps
- I couldn't extract data from the Power BI "ADCVD Proceedings" report. It needs a JS-rendered embed. Whether Power BI's "export data" works anonymously was not tested.
- No official "Active AD/CVD orders" file on trade.gov was found at the URLs tried. It may exist under a URL I didn't find.
- No rate limit is published for beta.trade.gov. One request per second was not throttled in these tests.
- ACCESS's terms for automated searching were not found. Its Blazor UI makes scripted use impractical without a headless browser.

## 2. CBP (AD/CVD public messages, ACE case reference file, CSMS)

### Takeaway
CBP's public AD/CVD message service is open JSON with no key. Its message bodies are the best public source for **cash deposit rates by exporter (with company sub-case numbers), effective dates, liquidation and suspension events, and the HTS codes CBP was given at order time**. The ACE case reference file itself, with case status, all HTS codes, rates and company records, needs an ACE login.

### Cited Findings
**Endpoints that work anonymously**
- `GET https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/getLatestMessages` returned 200 JSON (15 KB).
  - Top-level keys: `currentLimit, displayMsg, resultData, returningLimitedResults, totalRecords`.
  - 28 messages, dated 10/20–10/23/2026.
  - Message fields: `caseNumber` (for example "A570914; A583803; C570915"), `imn, messageDate` (MM/DD/YYYY), `messageNumber, messageTitle, periodCoveredBeginDate/EndDate, poiPorBeginDate/EndDate, publicIndicator, shortCaseName, status, subtype` (SCOINQ, ADRV, ORD, INVST, GAP …), `subtypeText, type` (CD-Cash Deposit, LIQ-Liquidation, ALI-Automatic Liquidation, INF …). — [getLatestMessages](https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/getLatestMessages)
- `GET …/messages/public/getLatestMessageCount` returned `28`. — [getLatestMessageCount](https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/getLatestMessageCount)
- `POST …/messages/public/quickSearchMessage-ServerSide/A570137` (the same call the public UI makes) returned 200 without a login.
  - Body: `{"filter":"","sortDirection":"desc","pageIndex":0,"pageSize":50,"sortActive":"messageDate","maxResultSize":500,"pageOrSortRequest":false}`.
  - Result: **14 messages for A-570-137** from 02/12/2021 (initiation) to 06/02/2026 (automatic liquidation). They include the order (03/07/2022, msg 2066405), cash deposits (08/14/2024, 03/24/2026), liquidation, gap-period and ITC critical-circumstances messages. — [CBP public message service](https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/quickSearchMessage-ServerSide/A570137)
- `GET …/messages/public/getMsgBody/<messageNumber>` returned 200 JSON `{"text": …}`, and `GET …/viewMessageASPdf/<messageNumber>` returned a 256 KB PDF. — [getMsgBody 6296410](https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/getMsgBody/6296410)
- **Cash deposit message 6083439** (03/24/2026, A-570-137):
  - Cites 91 FR 12565 (03/16/2026) as the effective date.
  - Exporter Zhejiang Sanmei group: sub-case **A-570-137-011**, 48.67%. Zhejiang Yonghe: **A-570-137-000** (China-wide), 267.51%.
  - Sub-case **A-570-137-012** deactivated, its entries to go under -000.
  - The China-wide rate is 267.51%, and third-country exporters take their supplier's rate.
  - The FR final results (GovInfo granule 2026-05002) give the same 267.51% China-wide rate, and its summary names Sanmei and Yonghe. — [getMsgBody 6083439](https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/getMsgBody/6083439); [GovInfo 2026-05002](https://www.govinfo.gov/content/pkg/FR-2026-03-16/html/2026-05002.htm)
- **Order message 2066405** (03/07/2022, R-125) lists 2903.44.1010, 2903.49.0000 and 3827.11/.39/.62/.63/.64/.65/.68/.69.0000. It does **not** list the 2903.49.1010 typo that ITA's HTS list and the 2022 FR order carry. — [getMsgBody 2066405](https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/getMsgBody/2066405); project memory `adcvd-renumbered-codes-plan.md` (the FR order printed 2903.49.1010)

**Endpoints that need a login**
- `GET …/messages/public/getMessageByCase/A570137`, `findSingleMessage/…`, `quickMessageNumberSearch/…`, `quickExactIMNSearchOnly/…` and `getMessageTypes` all returned **401** without a session.
- The public Angular bundle (`/ace/adcvd/adcvd-public/main.js`, 2.5 MB) also references a case service, `https://trade.cbp.dhs.gov/ace/adcvd/service-cases`, with paths such as `/cases/getRates`, `/cases/exportHTS/`, `/cases/getAllHtsCodes`, `/cases/getCaseStatuses`, `/cases/exportCompanyCases/` and `/cases/exportThirdCountryCases/`. These are the ACE case-reference functions. I did not call them; they are not documented as public. — [CBP AD/CVD public app](https://trade.cbp.dhs.gov/ace/adcvd/adcvd-public/)

**What the case reference file is**
- CBP's guidance says an AD/CVD case is "an electronic reference file used to validate in-bound entry summary transactions". It is created when an investigation starts, holds milestone dates and cash deposit rates, and is under the ACE portal's "References" tab, so it needs an ACE account. — [CBP AD/CVD cases and messages guidance](https://www.cbp.gov/document/guidance/adcvd-cases-and-messages); [CBP guidance PDF](https://cbp.gov/sites/default/files/documents/cases_messages_3.pdf)
- CBP's quick reference card: the public portal supports quick search by partial or full message or case number, plus advanced search. — [CBP QRC Trade Public Messages](https://cbp.gov/sites/default/files/assets/documents/2020-May/ACE-ADCVD%20-%20QRC%20-%20Trade%20Public%20Messages.pdf)
- A broker job aid says ITA won't have scope text before an order, so CBP's portal is where pre-order notices appear. Case numbers are entered with dashes. — [Expeditors job aid](https://info.expeditors.com/hubfs/Locating%20ADCVD%20Case%20Scopes.pdf)
- CBP adds HTS numbers to the case file at its own request, through Commerce memos titled "ACE Case Reference File Update". Solar's 8501.31.8000 was added this way in 2012. — [A-570-979 case page](https://beta.trade.gov/adcvd?adcvdcase=A-570-979)
- data.gov lists a "CBP Active Dumping and Active Countervailing (AD/CVD) Cases" dataset with no file downloads. Its metadata is from 2023, so it is likely stale. A data.gov API lookup by that slug returned nothing on 2026-10-26. — [data.gov listing](https://catalog.data.gov/dataset/cbp-active-dumping-and-active-countervailing-ad-cvd-cases)
- `https://www.cbp.gov/trade/programs-administration/trade-remedies/antidumping-countervailing-duties` returned 404 via WebFetch, so CBP's landing page URL has moved. — (fetch result)
- HTS Hero already polls `getLatestMessages`. The prior finding was that CBP messages "only restate codes at order time". — `libs/adcvd/cbp.ts`; project memory `adcvd-renumbered-codes-plan.md`

### Inferences
- CBP messages are US government works with no stated licence restrictions. As federal works they are generally public domain, but no explicit CBP terms page was found.
- For **current cash deposit rates per exporter**, CBP CD messages are the most operational source. Reconstruct the current rate per sub-case by replaying CD messages in date order, with later ones replacing earlier ones, and checking the "deactivated" notes. FR final results give the same numbers but don't carry the sub-case numbers.
- `quickSearchMessage-ServerSide` is the practical per-case history endpoint. It is undocumented but used by the public UI. Keep the request rate low, about 1 per second.
- CSMS (govdelivery bulletins) carries CBP-wide trade notices; AD/CVD instructions go through the AD/CVD message system instead. — [CSMS bulletin example](https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3c87c61)

### Gaps
- No published rate limit or terms of use for trade.cbp.dhs.gov public endpoints.
- I didn't check whether non-public messages (`publicIndicator` N) are listed but not readable.
- The ACE case reference file's current HTS list per case isn't public. How far it differs from ITA's list can't be measured without ACE access.
- CSMS archive search and API were not tested.

## 3. USITC (ids.usitc.gov, usitc.gov orders list, EDIS, DataWeb, HTS API)

### Takeaway
`ids.usitc.gov/investigations.json` is a public bulk JSON export of all ITC investigations, updated daily. It is the best source for **ITC votes (including negative final votes that stop an order), the Commerce case numbers linked to each investigation, order issue, continuation and revocation dates, and parties**. www.usitc.gov pages, including the orders-in-place list, return 403 to scripted clients. `hts.usitc.gov/reststop` is an open JSON API for HTS releases and lookups.

### Cited Findings
- `GET https://ids.usitc.gov/investigations.json` returned 200 (37 MB, application/json).
  - Top-level keys: `data, date, count`, with `date` = 2026-10-23T22:00:02Z and `count` = 4,434.
  - Investigation types: 1,941 "Import Injury", 1,687 "Unfair Imports" (337), 764 factfinding, plus others.
  - Fields include: Full Title, Investigation Number, official_investigation_number, Investigation Phase, Investigation Status, Countries, Commerce Initiation Date, Commerce Preliminary/Final AD/CVD Determination Dates, Vote Date, Determination Date, Sub-investigation (with **Votes**: Affirmative/Negative per commissioner), **Commerce Orders** (Commerce Order/Case Number, Order Issuance/Suspension Agreement Date, Continued Date, Revoke/Termination Date, Revocation Reason), Participants (with petitioner flag), Staff (names, emails, phones), HTS Number, Historic HTS, Investigation Documents, and F.R. Citation for Notice of Institution. — [ids.usitc.gov investigations.json](https://ids.usitc.gov/investigations.json)
- **Commerce Orders**:
  - 2,654 order rows with 1,140 distinct Commerce case numbers; 228 rows carry a Revoke/Termination Date.
  - HTS Number is filled for 987 investigations, mostly Section 337 cases with 8-digit codes, so it is **not** a source of AD/CVD scope codes. — [investigations.json](https://ids.usitc.gov/investigations.json)
- **Concrete cases**:
  - R-125 final (701-TA-662 and 731-TA-1554): Determination Date 2022-02-23; Commerce Orders C-570-138 and A-570-137, issued 03-03-2022.
  - PET sheet (731-TA-1455 Final, vote 2020-08-19, and a later Review): linked to A-580-903.
  - **Unwrought Palladium from Russia (701-TA-776 and 731-TA-1761 Final)**: vote 2026-05-29, Determination Date 2026-06-15, sub-investigation vote "Negative", and **no Commerce Orders**. This explains the empty ITA page for A-821-840.
  - Kegs final (731-TA-1425-1427): orders A-570-093 and C-570-094 (12-16-2019) and A-201-849 (10-10-2019). The row for A-428-846 (Germany) has a Revoke/Termination Date of **12-13-2018, a year before its 12-16-2019 issuance date**, so this data has internal inconsistencies. — [investigations.json](https://ids.usitc.gov/investigations.json)
- `https://www.usitc.gov/trade_remedy/documents/orders.xls`, `/research_and_analysis/trade_remedy/documents/orders.xls` and `/trade_remedy/731_ad_701_cvd/investigations.htm` all returned **403 "Access Denied"** (Akamai edgesuite reference) to curl, and to WebFetch for the .htm. The ITC's "orders in place" list couldn't be fetched by script. — [usitc.gov trade remedy page](https://www.usitc.gov/trade_remedy/731_ad_701_cvd/investigations.htm)
- **HTS API**:
  - `GET https://hts.usitc.gov/reststop/releaseList` returned 200 JSON with 184 releases. The current one is "2026HTSRev21" (Revision 21 (2026)), release start 10/09/2026; Rev 20 was archived, valid 09/28–10/09/2026. Each record has name, description, date, status (current or archive), releaseStartDate/EndDate and mergedRevisions.
  - `GET /reststop/search?keyword=2903.44.10` returns JSON rows with htsno, statisticalSuffix, description, general/special/other rates, footnotes and indent.
  - HTS Hero also uses `reststop/file?release=…` for full exports. — [releaseList](https://hts.usitc.gov/reststop/releaseList); [search](https://hts.usitc.gov/reststop/search?keyword=2903.44.10); repo grep of `libs/` and `scripts/`
- An earlier HTS Hero session found the ITC investigations list nearly complete against ITA's dashboard (857/858 cases). — project memory `adcvd-renumbered-codes-plan.md`

### Inferences
- investigations.json is the cleanest bulk, machine-readable public source for **case existence and the investigation or order outcome**: affirmative or negative votes, issuance, continuation in sunset, revocation. It is a US government work, generally public domain.
- It carries ITC staff personal contact details. Don't republish those fields.
- The 37 MB daily export fits a daily cron. Diff on `date`.
- The revoke-before-issue anomaly means ITC dates should be cross-checked against the FR before they are shown.

### Gaps
- No documented rate limit or terms for ids.usitc.gov. One full download a day is clearly reasonable.
- EDIS (edis.usitc.gov) and DataWeb (dataweb.usitc.gov) weren't tested. DataWeb needs a login for its API, and EDIS holds ITC documents, not Commerce scope, rates or companies. Both are low value for scope codes.
- HTS "change record" documents per revision weren't fetched. `releaseList` gives revision dates, but not code-level change lists.
- The orders-in-place spreadsheet's freshness is unknown because of the 403.

## 4. Federal Register API and GovInfo

### Takeaway
The FR API (`/api/v1/documents.json`) works without a key and filters by docket ID (Commerce puts case numbers in `docket_ids`). It is the legal source of record for initiations, determinations, orders, review results, revocations and rates. All federalregister.gov HTML and documentation pages now redirect scripted clients to a CAPTCHA "unblock" page, and parallel API use has led to IP blocks. GovInfo has the identical text through a keyed API (api.data.gov) and keyless bulk XML, which makes it the safer channel for full text at volume.

### Cited Findings
**Federal Register API**
- `GET https://www.federalregister.gov/api/v1/documents.json?per_page=50&order=oldest&conditions[docket_id]=A-570-137&fields[]=…` returned 200 with count = 10.
  - From the 2021-02-08 initiation (2021-02529) through prelim, final and the order (2022-04505, docket_ids [A-570-137, C-570-138]), an amended order (2022-04946), and reviews up to the 2026-03-16 final results (2026-05002).
  - The response carried **no rate-limit headers** (only security and cache headers plus `x-request-id`). — [FR API query](https://www.federalregister.gov/api/v1/documents.json?per_page=50&order=oldest&conditions%5Bdocket_id%5D=A-570-137)
- `https://www.federalregister.gov/developers/documentation/api/v1` and `/api/v1.json` (the OpenAPI spec) redirected (302) to `https://unblock.federalregister.gov/`. That page says: "Due to aggressive automated scraping of FederalRegister.gov and eCFR.gov, programmatic access to these sites is limited to access to our extensive developer APIs," followed by a CAPTCHA "Request Access" form. WebFetch of `/reader-aids/developer-resources/rest-api` was redirected the same way. — [unblock.federalregister.gov](https://unblock.federalregister.gov/)
- The FR developer page states "No API keys are needed". The pagination cap is the first 2,000 results, so use date-range filters to get more. No official numeric rate limit was found; third-party claims disagree. — [FR REST API page (via search snippet)](https://www.federalregister.gov/reader-aids/developer-resources/rest-api); [third-party guide](https://www.vaquill.ai/blog/federal-register-api-python-search-rules-and-notices)
- HTS Hero's experience (2026-10-17):
  - 4 parallel requests got this machine's IP 403-blocked.
  - Full-text pages then served a 200 "Request Access" challenge page instead of the notice, which a naive parser would treat as content.
  - Code now queues 1 request per second with backoff and falls back to GovInfo for text.
  - The docket_id filter found scope codes for 85% of cases in a 39-case test.
  - Omnibus notices ("Opportunity to Request Administrative Review", initiations) list many cases in one document. — project memory `adcvd-matching-plan.md`; `libs/adcvd/fr.ts`

**GovInfo**
- `GET https://api.govinfo.gov/collections/FR/2026-10-20T00:00:00Z?pageSize=5&offsetMark=*&api_key=DEMO_KEY` returned 200, count 6 (FR issues), with headers `x-ratelimit-limit: 10` and `x-ratelimit-remaining: 9`. — [GovInfo collections](https://api.govinfo.gov/collections/FR/2026-10-20T00:00:00Z?pageSize=5&offsetMark=*&api_key=DEMO_KEY)
- api.data.gov documents DEMO_KEY at 30 requests per IP per hour and 50 per day, and normal keys at 1,000 per hour by default. Every response includes X-RateLimit-Limit and Remaining. The DEMO_KEY header seen on GovInfo (10) is lower than the documented 30, so read the header rather than trusting the docs. — [api.data.gov developer manual](https://api.data.gov/docs/developer-manual/)
- A third-party guide claims GovInfo keys get higher limits (36,000 per hour). That is **unverified**: I couldn't find the GovInfo page. — [Vaquill GovInfo guide](https://www.vaquill.ai/blog/govinfo-api-guide-keys-endpoints-limits-and-bulk-data)
- `GET https://api.govinfo.gov/packages/FR-2026-03-16/granules/2026-05002/summary?api_key=DEMO_KEY` returned 200 JSON with summary, title, agencies and detailsLink. — [GovInfo granule summary](https://api.govinfo.gov/packages/FR-2026-03-16/granules/2026-05002/summary?api_key=DEMO_KEY)
- `GET https://www.govinfo.gov/content/pkg/FR-2026-03-16/html/2026-05002.htm` (no key) returned 200 HTML with the full notice: cash deposit requirements and the 267.51% China-wide rate. — [GovInfo content](https://www.govinfo.gov/content/pkg/FR-2026-03-16/html/2026-05002.htm)
- `GET https://www.govinfo.gov/bulkdata/json/FR/2026/10` (no key) returned a JSON listing of daily XML files (for example FR-2026-10-01.xml, 3.5 MB) and a monthly zip (FR-2026-10.zip, 9 MB, modified 24-Oct-2026). — [GovInfo bulk data FR 2026/10](https://www.govinfo.gov/bulkdata/json/FR/2026/10)

### Inferences
- **Best reliable recipe:**
  1. Use the FR API only for metadata and search (docket_id, agency=international-trade-administration, type, dates, `fields[]` limited), one request at a time at 1 per second or slower. Detect the unblock redirect or challenge page and back off.
  2. Fetch full text from GovInfo `content/pkg/FR-<date>/html/<doc>.htm`, or from the daily bulk XML, which needs no key and supports filtering locally by agency.
  3. Use a registered api.data.gov key for the GovInfo API.
- FR and GovInfo content is a public-domain government publication.
- FR notices are the legal source of record for rates and dates. But scope HTS codes in FR review notices often aren't restated: the scope sits in the decision memo, which is on ACCESS.

### Gaps
- FR's official rate limit isn't published anywhere I could reach. The documentation itself is behind the CAPTCHA for scripts.
- How long an FR IP block lasts wasn't measured.
- I didn't test whether docket_id coverage includes omnibus initiation notices for every case.

## 5. Census and HTS code mapping (renumbered codes)

### Takeaway
Census publishes yearly import concordance files: every 10-digit HTS code in effect with its description and other classification codes. The index page lists 2002–2022, but **impconcord23–26.xlsx also download (200)**. That closes the 2023–2024 gap HTS Hero's successor map had. USITC's releaseList gives revision dates for codes changed mid-year.

### Cited Findings
- The Census concordance index lists import files impconcord02–impconcord22 (XLS 2002–2019, XLSX 2020–2022). The index page also showed a "Page not found" notice. — [Census concordance index](https://www.census.gov/foreign-trade/reference/codes/concordance/index.html)
- `impconcord22.xlsx` (1.24 MB), `impconcord23.xlsx` (1.26 MB), `impconcord24.xlsx`, `impconcord25.xlsx` and `impconcord26.xlsx` (1.28 MB) all returned 200 with the XLSX content type, though the index doesn't list 23–26.
  - impconcord23 has 19,880 rows with columns `commodity, descriptn, abbreviatn, unit_qy1, unit_qy2, sitc, end_use, naics, usda, hitech` (for example 0101210010 "HORSES, LIVE, PUREBRED BREEDING MALE"). — [impconcord23.xlsx](https://www.census.gov/foreign-trade/reference/codes/concordance/impconcord23.xlsx); [impconcord26.xlsx](https://www.census.gov/foreign-trade/reference/codes/concordance/impconcord26.xlsx)
- `https://www.census.gov/foreign-trade/reference/codes/index.html` returned 404, and `/foreign-trade/schedules/b/index.html` returned 500, on 2026-10-26. — (fetch results)
- Census has historically published "new-obsolete" files listing obsolete codes and their replacements. Import code changes can take effect within a year, not only in January. — [Pierce & Schott, FEDS 2012-16](https://www.federalreserve.gov/econres/feds/concording-us-harmonized-system-categories-over-time.htm)
- HTS Hero's successor map (`tariffs/hts-concordance/successors.json`, built 2026-10-23) uses impconcord02–22 plus HTS revisions from 2025 on, and UN Stats HS 2022↔2017↔2012 correlation tables. Its README says "The 2023 and 2024 editions aren't snapshots yet". — `tariffs/hts-concordance/README.md`

### Inferences
- Adding impconcord23–26 should fill the missing snapshots for 2023 and 2024 directly.
- Concordance files carry no "replaced by" column, so successors still have to be inferred: by diffing years, from HS correlation tables, and by matching descriptions.
- Census data is a US government work, public domain.

### Gaps
- I didn't confirm whether Census still publishes the "new-obsolete" change files and where.
- I didn't confirm whether impconcord26 reflects January 2026 or a later revision.

## 6. Commercial and secondary datasets: existence and licensing

### Takeaway
None of these is a good live source for a product. The Temporary Trade Barriers Database is research data through 2024, with no licence stated. GTA's public content is CC BY-NC 4.0, so commercial use needs a paid licence. WTO I-TIP covers AD/CVD only through mid-2020. Law-firm trackers are copyrighted commentary.

### Cited Findings
- **World Bank Temporary Trade Barriers Database**: 30 countries from the 1980s through 2024, page dated March 12, 2025, as .zip downloads plus an .xls codebook. No licence is stated, only a suggested citation (Bown, Cieszkowsky, Erbahar, Signoret 2020). — [World Bank TTBD](https://www.worldbank.org/en/data/interactive/2021/03/02/temporary-trade-barriers-database)
- Bown's own Global Antidumping Database is no longer maintained; its last update covered data through 2015:Q4. US cases were identified at the 10-digit HTS level of the petition. — [chadpbown.com TTBD](https://www.chadpbown.com/temporary-trade-barriers-database/); [ADB appendix](https://www.adb.org/sites/default/files/publication/974216/ewp-729-politically-motivated-trade-protection-appendix.pdf)
- **Global Trade Alert**: content is under CC BY-NC 4.0 "except where otherwise stated". Commercial use is licensed through Internal Use, Derived Use or Redistribution classes with fees. — [GTA data access](https://globaltradealert.org/data-access); [GTA terms](https://globaltradealert.org/terms)
- **WTO I-TIP Goods**: AD/CVD covers "all measures initiated and/or with final duties in force from 2001 to the first half of 2020", with summary and detailed export. Terms are behind a WTO copyright notice I didn't read. — [I-TIP Goods](https://i-tip.wto.org/goods/default.aspx)
- Third-party scrapers of CBP AD/CVD data exist, for example an Apify actor. They show the CBP endpoints are widely used, but they are not authoritative. — [Apify CBP AD/CVD actor](https://apify.com/mikechiou/cbp-adcvd-hts-duty-alert)

### Inferences
- For a commercial product, rely only on the primary government sources. They are public domain or have open terms, apart from ITA API attribution. Use TTBD at most for historical research, after confirming its licence; World Bank data is often CC BY 4.0, but that is not confirmed for TTBD.

### Gaps
- TTBD's licence and US HTS-level detail in the current release aren't confirmed.
- WTO semi-annual AD reports weren't checked.
- Law-firm trackers weren't catalogued; they are presumed copyrighted.

## 7. Field-by-field source of truth, and how sources disagree

### Takeaway
No single public source is right for every field. Use the ITC for whether an order exists and its outcome, the FR for legal dates and rates, CBP messages for cash deposit rates by exporter sub-case, ITA case pages for current scope text and rulings, and current HTS plus Census files for checking codes. The scope text decides coverage; HTS lists in every source go stale.

### Cited Findings
| Field | Best source | Second source | Known disagreements seen |
|---|---|---|---|
| Case exists, AD/CVD, country | ITC investigations.json (Commerce Orders + votes) | FR docket_ids; CBP caseNumber | Palladium RU: ITA page exists but empty; ITC final vote Negative and no order ([ITC](https://ids.usitc.gov/investigations.json), [ITA](https://beta.trade.gov/adcvd?adcvdcase=A-821-840)) |
| Status (investigation, order, suspended, revoked) | ITC order rows (issue, continued, revoke) + FR notices | ITA Power BI dashboard (manual) | ITA case page has no status; ITC kegs Germany revoke date precedes issuance ([ITC](https://ids.usitc.gov/investigations.json)) |
| Effective dates | FR notice (publication or effective date) | CBP message dates | CBP CD message cites the FR date (03/16/2026) as effective ([CBP](https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/getMsgBody/6083439)) |
| Scope text | ITA case page (current consolidated) | FR order and decision memos (ACCESS) | HFC blends: notices keep 3824.78, ITA scope has 3827.6x (`libs/adcvd/ita.ts`) |
| Scope HTS codes | ITA scope text + CBP order message, checked against current HTS | ITA HTS list | R-125: ITA list includes non-existent 2903.49.10.10, CBP order message doesn't ([ITA](https://beta.trade.gov/adcvd?adcvdcase=A-570-137), [CBP](https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/getMsgBody/2066405)); kegs: all sources cite dead 7310.10.0010/.0050, current is 7310.10.0005 ([HTS](https://hts.usitc.gov/reststop/search?keyword=7310.10.00)); solar: ITA list has 4 more suffixes than scope text; sugar: ITA list empty though scope names 18 codes |
| Renumbered codes | Census impconcord02–26 + USITC releases + HS correlation tables | ITA "HTS Change(s)" column in ruling table | — |
| All-others / country-wide rate | FR final results or order | CBP CD message | R-125 China-wide 267.51% agrees in FR and CBP ([GovInfo](https://www.govinfo.gov/content/pkg/FR-2026-03-16/html/2026-05002.htm)) |
| Company rates and cash deposits | CBP CD messages (sub-case numbers, deactivations) | FR review results | FR doesn't give sub-case numbers such as A-570-137-011 or -012 ([CBP](https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/getMsgBody/6083439)) |
| Companies (respondents, parties) | CBP CD messages / FR | ITC Participants (parties to the injury case, not rate holders) | — |
| Third-country / circumvention findings | ITA ruling table + FR | CBP messages (e.g. third-country case numbers A-552-914 in the LWR pipe message) | ([ITA solar](https://beta.trade.gov/adcvd?adcvdcase=A-570-979), [CBP latest](https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/getLatestMessages)) |
| Scope rulings | ITA ruling table (links to ACCESS) | ACCESS SCO segment; CBP SCOINQ messages | — |
| Upcoming deadlines | ITA "Upcoming Announcements" | — | Only on ITA pages (solar 12/15 and 12/28/2026; sugar 12/21/2026) |

- An earlier HTS Hero proof run used ITA case pages, an old→new code map and official statuses. It took the hand-checked golden set from 77 ok / 12 missed / 4 false alarms to 88 ok / 0 missed / 1 false alarm. — project memory `adcvd-renumbered-codes-plan.md`

### Inferences
- Disagreements are mostly about **HTS codes**: stale, typos, broader or missing. Rates and dates agreed where they were cross-checked (R-125).
- Merge codes from several sources, keep where each came from, and validate against the current HTS. Never treat any one list as complete. As every scope says, the written description is dispositive.

### Gaps
- Rates weren't compared across sources beyond R-125. Other cases (steel, solar company rates) need the same FR vs CBP comparison.
- The ITA dashboard's statuses couldn't be pulled automatically in this session.
