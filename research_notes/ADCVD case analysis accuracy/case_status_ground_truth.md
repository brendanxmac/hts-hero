# US AD/CVD case status: ground truth and automatic derivation (as of 2026-10-26)

Method note: all FR lookups used the federalregister.gov API (one request at a time, about 1.2 s apart). FR shortlinks `https://www.federalregister.gov/d/<doc number>` resolve to the cited document. ITA dashboard figures come from a "Export data → Summarized" export of the Power BI report taken 2026-10-23 (saved by an earlier session at `/private/tmp/claude-501/-Users-brendanmclaughlin-Projects-HTS-Hero-hts-hero/0a8604a5-0c12-4bff-92fe-348c060a3f92/scratchpad/research/ita-adcvd-proceedings-2026-10-23.txt`). Everything else was fetched 2026-10-26.

## 1. Which official lists state status directly, and are they machine-readable?

### Takeaway
ITA's "ADCVD Proceedings" Power BI dashboard is the only official list that states status directly for every case: in effect as an order, in effect as a suspension agreement, revoked (with date), terminated suspension, or investigation in progress. It is reliable but can only be exported by hand. The USITC IDS JSON is the best machine-readable source: it is refreshed daily and has per-case order and revoke/termination dates. But it lags on revocations, does not separate orders from suspension agreements, and writes case numbers inconsistently. The other lists (ITA's old "orders in effect" page, the ITA sunset page, USITC's orders-in-place files) are retired or block automated access. CBP's public message JSON is a good corroborating signal for each case.

### Cited Findings
- **ITA ADCVD Proceedings dashboard**: https://www.trade.gov/data-visualization/adcvd-proceedings. It is an embedded Power BI report with tables for Orders, Revoked Orders and Investigations. Each row has case number, country, status code (O = order, S = suspension agreement, "Revoked", "Terminated Suspension", "Investigation In Progress"), a date and the product. The 2026-10-23 export had 858 in-effect rows (851 orders + 7 suspension agreements; the dashboard card said 861), 422 revoked rows and 88 investigations. The page's `Last-Modified` header was Thu, 22 Oct 2026 21:01:29 GMT. Export is manual only (no API, no documented feed). — [ITA dashboard](https://www.trade.gov/data-visualization/adcvd-proceedings); export copy at the scratchpad path above
- **ITA case detail pages** (`https://beta.trade.gov/adcvd?adcvdcase=<case>`): server-rendered HTML, plain curl works. Each shows case number, country, product, commodity group, upcoming announcements, HTS list, scope and scope rulings. **There is no status field.** A revoked order (A-580-903) still shows its full scope and HTS list, and "Upcoming Announcements: No data is available to display." Every URL returns HTTP 200, even for numbers that don't exist. A nonexistent number gives an empty "Case #" header (see §4). — [A-580-903 page](https://beta.trade.gov/adcvd?adcvdcase=A-580-903), [C-583-840 page](https://beta.trade.gov/adcvd?adcvdcase=C-583-840)
- **USITC IDS JSON**: https://ids.usitc.gov/investigations.json (37 MB). It is an object `{data, date, count}`. On 2026-10-26 it had `date` 2026-10-23T22:00:02Z, 4,434 investigation records and `Last-Modified` Fri, 23 Oct 2026 22:20:12 GMT. Each record's `Commerce Orders[]` has `Commerce Order/Case Number`, `Order Issuance/Suspension Agreement Date` and `Revoke/Termination Date`. Records also have `Investigation Status`, `Investigation Phase` (Preliminary/Final/Review), `Vote Date` and `Determination Date`. — [USITC IDS JSON](https://ids.usitc.gov/investigations.json)
- IDS compared with the ITA dashboard (my computation, 2026-10-23 data on both sides): IDS has 1,140 distinct case-number strings, 920 of them with no revoke date.
  - **Revocations missing:** 65 cases that ITA lists as revoked have no revoke date in IDS (mostly old ones, e.g. A-570-101, A-588-046, C-570-913).
  - **Order dates missing:** 51 ITA in-effect cases appear in IDS only in malformed form (en dashes `A–557–827`, embedded spaces `A-552- 836`, stray bracket `[A-533-924`), so exact matching misses them.
  - **Agreement vs order:** IDS has one field, `Order Issuance/Suspension Agreement Date`, for both. It cannot tell an agreement from an order.
  - **A-821-808** still shows only the 1997 suspension date, not the 2023 order.
  - **Revocation dates:** IDS records the FR publication date of the revocation (A-580-903: 01-12-2026), while ITA records the effective date (2025-09-10). — [USITC IDS JSON](https://ids.usitc.gov/investigations.json); [ITA dashboard](https://www.trade.gov/data-visualization/adcvd-proceedings)
- **USITC "orders in place" files**: every usitc.gov URL tried returned HTTP 403 to a browser-UA curl on 2026-10-26: `/trade_remedy/documents/orders.xls`, `/trade_remedy/documents/historical_orders_data.xls`, `/trade_remedy/documents/orders.pdf`, `/trade_remedy/731_ad_701_cvd/investigations.htm`. An earlier session (2026-10-23) found `historical_orders_data.xls` last modified 2023-01-09 and `orders.xls` gone. — [usitc.gov orders.xls (403)](https://www.usitc.gov/trade_remedy/documents/orders.xls)
- **ITA sunset schedule**: FR sunset notices still point readers to the Commerce sunset page for "Commerce's schedule for Sunset Reviews, a listing of past revocations and continuations". But `https://enforcement.trade.gov/sunset/` now redirects to an unrelated PDF (`trade.gov/sites/default/files/2024-09/ita-338p.pdf`), and guessed trade.gov sunset URLs return 404. In practice the schedule is now the monthly FR "Advance Notification of Sunset Review" and "Initiation of Five-Year (Sunset) Reviews" notices, plus ITC review records in IDS. — [example FR sunset notice](https://www.govinfo.gov/content/pkg/FR-2025-06-02/html/2025-09939.htm); enforcement.trade.gov/sunset/ redirect observed via curl 2026-10-26
- `https://www.trade.gov/us-antidumping-and-countervailing-duties` returned 403 to curl, and `access.trade.gov/public/ADCVDSearch.aspx` returned 404. — curl, 2026-10-26
- **CBP AD/CVD public messages** (unauthenticated JSON): `https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/quickSearchMessage-MemorySide/<case without dashes>` returns `{resultData:[{caseNumber, messageDate, type, subtype, messageTitle, ...}], totalRecords}`. The `subtype` codes include **REVORD** (revocation of order), CRTD (court decision), ADRV, INVST and ORD. There is no status field, but a `REVORD` message is a strong revocation signal. Results are not sorted; parse `messageDate` (MM/DD/YYYY) before sorting. A821808 returned 0 results, so coverage is not complete. — [CBP A580903 messages](https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/quickSearchMessage-MemorySide/A580903)
- The FR API returns `docket_ids` holding Commerce case numbers for case-specific ITA notices (e.g. 2024-27170 → `A-201-849, A-570-093, C-570-094`). Omnibus notices (opportunity lists, initiation lists) have empty `docket_ids`. — [FR 2024-27170](https://www.federalregister.gov/d/2024-27170); [FR 2026-06418](https://www.federalregister.gov/d/2026-06418)

### Inferences
- Best automated design: use IDS for case enumeration and dates, the FR (titles + `docket_ids` + body text) for status events, and CBP REVORD messages to corroborate. Then reconcile everything against a periodic manual ITA dashboard export, which serves as the reference. When IDS and ITA disagree on revoked versus live, ITA should win: it had no live-but-revoked errors in this comparison, and IDS was missing 65 revocations.
- Normalize case numbers before any join: map en dashes and em dashes to "-", strip spaces and brackets.

### Gaps
- Could not get USITC's current orders-in-place list (403). Its format and update cadence today are unknown.
- No documented update cadence for the ITA dashboard. The only evidence is the page's Last-Modified date and the lag checks in §5.
- CBP's case-status list ("cases" endpoints) needs an ACE login and was not tested.

## 2. Which FR notice types change status, and which are easy to misread?

### Takeaway
Status changes come from a small set of title patterns, but four kinds of notice trip up title-only parsers:
- **ITC negative final votes** say "Determinations" with no "negative" in the title.
- **Court notices** amend an order that may already be revoked, or themselves revoke one.
- **Suspension-agreement review titles** look like ordinary order reviews.
- **Omnibus lists** keep naming revoked orders for stub periods and contain typos.

### Cited Findings
Status-setting notice types, with real examples:
- **Initiation**: "…: Initiation of Less-Than-Fair-Value Investigation" or "…: Initiation of Countervailing Duty Investigation" (e.g. A-821-840, 2025-08-22). Before initiation there can be "Notice of Extension of the Deadline for Determining the Adequacy of the … Petitions" (fence pickets, 2026-10-19). That means a petition only; no investigation exists yet. — [FR 2025-16156](https://www.federalregister.gov/d/2025-16156); [FR 2026-21285](https://www.federalregister.gov/d/2026-21285)
- **Commerce prelim/final**: "Preliminary Affirmative Determination…" and "Final Affirmative Determination of Sales at Less Than Fair Value". An affirmative Commerce final **does not create an order**. Palladium and active anode material both had affirmative Commerce finals and then ITC negatives. — [FR 2026-08487](https://www.federalregister.gov/d/2026-08487); [FR 2026-02998](https://www.federalregister.gov/d/2026-02998)
- **ITC final determinations**: the title is only "<Product> From <Country>; Determinations". The negative is in the body.
  - Palladium: "not materially injured or threatened with material injury". — [FR 2026-12219](https://www.federalregister.gov/d/2026-12219)
  - Active anode material: "the establishment of an industry in the United States is not materially retarded". That is a different phrase, which a regex for "not materially injured" misses. — [FR 2026-06488](https://www.federalregister.gov/d/2026-06488)
  - Commerce published no follow-up termination notice for palladium. The FR search for "A-821-840" returns only the three ITA investigation notices. So the ITC notice is the only status signal. — [FR search A-821-840](https://www.federalregister.gov/api/v1/documents.json?conditions%5Bterm%5D=%22A-821-840%22)
  - ITC notices also mislabel phase: the fence-pickets revised schedule (a preliminary investigation) says the Commission "established a schedule for the conduct of the final phase". — [FR 2026-21504](https://www.federalregister.gov/d/2026-21504)
- **Orders**: "…: Antidumping Duty Order(s)" or "Countervailing Duty Order", e.g. Oleoresin Paprika From India, 2026-10-08. Corrections exist, e.g. "Dioctyl Terephthalate From Malaysia, Poland, Taiwan, and the Republic of Türkiye: Antidumping Duty Orders; Correction", 2026-10-20. — [FR search, ITA order notices Sep–Oct 2026](https://www.federalregister.gov/api/v1/documents.json?conditions%5Bagencies%5D%5B%5D=international-trade-administration&conditions%5Bpublication_date%5D%5Bgte%5D=2026-09-01)
- **Suspension of investigation**, e.g. "Suspension of Antidumping Investigation: Certain Cut-to-Length Carbon Steel Plate From Ukraine" (2008-10-03). Later reviews of a suspended case are titled "Agreement Suspending the … Investigation …: Final Results of … Administrative Review" or "Continuation of Suspension of the … Investigation". — [FR E8-23393](https://www.federalregister.gov/d/E8-23393); [FR 2025-18222](https://www.federalregister.gov/d/2025-18222)
- **Termination of suspension agreement → order**: "Certain Cut-to-Length Carbon Steel Plate From the Russian Federation: Termination of the Suspension Agreement and Issuance of Antidumping Duty Order" (2023-08-14). The word "Termination" here means the case becomes an **order**, not that it ends. — [FR 2023-17407](https://www.federalregister.gov/d/2023-17407)
- **Sunset revocation**: "…: Final Results of Sunset Review and Revocation of Antidumping Duty Order". The revocation is effective on the fifth anniversary of the order, which is months **before** the FR publication date (A-580-903: published 2026-01-12, effective 2025-09-10). — [FR 2026-00384](https://www.federalregister.gov/d/2026-00384)
- **Continuation**: "…: Continuation of Antidumping and Countervailing Duty Orders" (e.g. matchbooks, 2026-06-29; welded wire mesh, 2026-10-26). — [FR 2026-13039](https://www.federalregister.gov/d/2026-13039)
- **Court-ordered (Timken / "not in harmony") notices**: these come in two kinds that look almost the same.
  - Mattresses Indonesia: "…Notice of Court Decision Not in Harmony…; Notice of Amended Final Determination; and Notice of Revocation of Antidumping Order". This one revokes. — [FR 2025-03529](https://www.federalregister.gov/d/2025-03529)
  - Kegs China (2024-12-10): "…Not in Harmony…; Notice of Amended Final Determination; and Notice of Amended Antidumping Duty Order". This only amends rates, and it was published **after** the order had already been revoked in a sunset review. — [FR 2024-28946](https://www.federalregister.gov/d/2024-28946)
- **ITC termination of five-year reviews** (no domestic response): "Refillable Stainless Steel Kegs From China and Mexico; Notice of Termination of Five-Year Reviews". Here "termination" ends the review and goes with revocation of the orders. — [FR 2024-28129](https://www.federalregister.gov/d/2024-28129)
- **Omnibus "Opportunity To Request Administrative Review" and "Initiation of … Administrative Reviews" lists**:
  - They list revoked orders with stub periods (kegs "12/1/24-12/15/24"; PET sheet "9/1/25-9/9/25").
  - They carry footnotes such as "this order has been revoked due to litigation" (mattresses Indonesia, July 2026 initiation).
  - They contain typos (§3).
  - Line wrapping splits case numbers across lines ("Certain Hot-Rolled Carbon Steel Flat Products, A- … 533-820").
  — [FR 2026-13892](https://www.federalregister.gov/d/2026-13892); [FR 2025-22201](https://www.federalregister.gov/d/2025-22201)
- Partial revocations ("revoked with respect to subject merchandise produced and exported by…") appear as footnotes in the shrimp China listings. They are company-specific, not case-level. — [FR 2026-13892](https://www.federalregister.gov/d/2026-13892)

### Inferences
- Status rules a parser needs:
  1. Read ITC "Determinations" bodies for both "not materially injured" and "not materially retarded", and check which countries are named. Then terminate those investigations.
  2. Treat "Termination of the Suspension Agreement and Issuance of … Order" as → order.
  3. Keep a case suspended while any notice title contains "Agreement Suspending" or "Suspension of the … Investigation".
  4. Never revive a revoked order from a list row, a court "Amended … Order" notice, or a CBP liquidation or cash-deposit message.
  5. Store the revocation **effective** date as well as the publication date.

### Gaps
- I did not test rescission notices or changed-circumstances full/partial revocations on a live example in this pass. Their title pattern is "…Final Results of Changed Circumstances Review, and Revocation of the Antidumping Duty Order", based on general knowledge, not verified here.

## 3. Ground truth for the named cases (and what a naive parser gets wrong)

### Takeaway
Of the 21 numbers:
- 3 are live orders.
- 3 are live suspension agreements.
- 4 are revoked.
- 3 are terminated investigations (ITC negative).
- 1 is still under investigation.
- 2 are only petitions.
- 5 never existed: C-583-840, A-533-849, A-557-857, C-555-003, C-821-824.

A-583-839 is a special case: it is a real but dead 2002 Taiwan number, misused in 2026 for Türkiye.

### Cited Findings
| Case | Authoritative status (2026-10-26) | Notice that set it | Naive-parser error |
|---|---|---|---|
| A-580-903 PET sheet, Korea | **Revoked** (sunset, no domestic response), effective 2025-09-10 | [FR 2026-00384](https://www.federalregister.gov/d/2026-00384), 2026-01-12. ITA dashboard "Revoked 2025-09-10"; IDS revoke 01-12-2026; CBP REVORD message 02/18/2026 ([CBP](https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/quickSearchMessage-MemorySide/A580903)) | Revived by the Sep 2026 opportunity list's stub period 9/1/25–9/9/25; uses the FR date instead of the effective date |
| A-821-840 palladium, Russia (AD) | **Terminated: ITC negative final** | Commerce affirmative final [FR 2026-08487](https://www.federalregister.gov/d/2026-08487) (2026-05-01); ITC "not materially injured" [FR 2026-12219](https://www.federalregister.gov/d/2026-12219) (2026-06-18; vote 2026-05-29 per IDS) | Stays "investigation" (title says only "Determinations"), or reads the affirmative Commerce final as an order |
| C-821-841 palladium, Russia (CVD) | **Terminated: ITC negative final** | Commerce affirmative final [FR 2026-10342](https://www.federalregister.gov/d/2026-10342) (2026-05-22); same ITC notice [FR 2026-12219](https://www.federalregister.gov/d/2026-12219) | Same as A-821-840 |
| A-570-243 / C-570-244 wooden fence pickets, China | **Petition only; not initiated.** Commerce extended its initiation deadline to 2026-11-03; ITC preliminary investigation instituted | [FR 2026-21285](https://www.federalregister.gov/d/2026-21285) (2026-10-19); [FR 2026-19875](https://www.federalregister.gov/d/2026-19875); [FR 2026-21504](https://www.federalregister.gov/d/2026-21504). ITA case page exists with no HTS or scope ([page](https://beta.trade.gov/adcvd?adcvdcase=A-570-243)) | Treated as an investigation or order; the ITC notice misleadingly says "final phase" |
| A-570-194 active anode material, China | **Terminated: ITC negative final** ("not materially retarded") | Commerce affirmative final [FR 2026-02998](https://www.federalregister.gov/d/2026-02998) (2026-02-17); ITC [FR 2026-06488](https://www.federalregister.gov/d/2026-06488) (2026-04-03) | A regex for "not materially injured" misses the "retarded" wording |
| A-201-845 sugar, Mexico (AD) | **Suspension agreement in effect**, continued after the second sunset | [FR 2025-18222](https://www.federalregister.gov/d/2025-18222) (2025-09-19, applicable 2025-09-09); latest review [FR 2025-23327](https://www.federalregister.gov/d/2025-23327). ITA "S 2014-12-19" | Labelled "order" because review titles look like order reviews; IDS can't tell |
| C-201-846 sugar, Mexico (CVD) | **Suspension agreement in effect** | [FR 2025-18223](https://www.federalregister.gov/d/2025-18223) (2025-09-19). ITA "S" | Same as A-201-845 |
| A-823-808 CTL plate, Ukraine | **Suspension agreement in effect**; fifth sunset found termination likely to lead to dumping | [FR 2026-20041](https://www.federalregister.gov/d/2026-20041) (2026-09-30). ITA "S 2008-11-01". ITC review active in IDS (instituted 2026-06-01) | Labelled "order" (it is grouped with the China plate order in shared continuation notices) |
| A-821-808 CTL plate, Russia | **Order in effect** since 2023-08-14 (agreement terminated) | [FR 2023-17407](https://www.federalregister.gov/d/2023-17407). ITA: order 2023-08-14 and "Terminated Suspension 2023-08-08" | Stays "suspended", or reads "Termination" as the case ending; IDS shows only the 1997 date |
| A-553-003 solar cells, Laos (AD) | **Investigation in progress**: Commerce affirmative final 2026-09-16; ITC final pending (schedule [FR 2026-09531](https://www.federalregister.gov/d/2026-09531)) | [FR 2026-18941](https://www.federalregister.gov/d/2026-18941). ITA "Investigation In Progress" | Treats the affirmative final as an order. The AD/CVD pair is A-553-003 / C-553-004, and A-553-003 has nothing to do with Cambodia's A-555-003 |
| A-570-093 kegs, China (AD) | **Revoked** (sunset, no domestic response), effective 2024-12-16 | [FR 2024-27170](https://www.federalregister.gov/d/2024-27170) (2024-11-21); ITC [FR 2024-28129](https://www.federalregister.gov/d/2024-28129). CBP REVORD 11/26/2024. ITA and IDS both 2024-12-16 | Revived by the later court notice "Notice of Amended Antidumping Duty Order" ([FR 2024-28946](https://www.federalregister.gov/d/2024-28946)), CBP's 12/13/2024 amended cash-deposit message, and the 12/1/24–12/15/24 stub-period listing |
| C-570-094 kegs, China (CVD) | **Revoked**, effective 2024-12-16 | [FR 2024-27170](https://www.federalregister.gov/d/2024-27170) | Revived by the stub-period listing |
| A-560-836 mattresses, Indonesia | **Revoked by court decision**, effective 2025-02-28 (final made negative; deposits refunded) | [FR 2025-03529](https://www.federalregister.gov/d/2025-03529) (2025-03-05) + correction [FR 2025-04763](https://www.federalregister.gov/d/2025-04763). ITA/IDS revoke 2025-02-28. CBP refund message 05/02/2025 | Revived by the May 2026 opportunity list and the Jul 2026 initiation ([FR 2026-13892](https://www.federalregister.gov/d/2026-13892)), which list it with a footnote "revoked due to litigation" |
| A-583-839 | **Real but dead number**: Taiwan cold-rolled carbon steel flat products (2001–02 investigation; ITA page "Taiwan Cold-Rolled Carbon Steel Flat Products", no HTS or scope). **Not** in ITA's live, revoked or investigation tables. The aluminum sheet case meant here is Türkiye **A-489-839** (order 2021-04-27) | [FR 02-24786](https://www.federalregister.gov/d/02-24786); [ITA page](https://beta.trade.gov/adcvd?adcvdcase=A-583-839) | A "does an FR docket exist?" check passes because of the 2002 hits, so country and product checks are needed |
| C-583-840 | **Does not exist.** FR typo in the Apr 2026 opportunity list: "REPUBLIC OF TÜRKIYE: Common Alloy Aluminum Sheet, C-583-840". Real case **C-489-840** | [FR 2026-06418](https://www.federalregister.gov/d/2026-06418); ITA page for C-583-840 is empty ("Case #" blank). The number A-583-840 is an old Taiwan bottle-grade PET resin AD investigation, negative Commerce final 2005 ([FR E5-1220](https://www.federalregister.gov/d/E5-1220)) | Creates a phantom Taiwan case that flags Taiwanese aluminum sheet |
| A-533-849 | **Does not exist as AD.** Dec 2025 opportunity list printed "Commodity Matchbooks, A-533-849" in the AD section. Real cases: AD **A-533-848**, CVD **C-533-849** | [FR 2025-22201](https://www.federalregister.gov/d/2025-22201); empty ITA page | Phantom AD case (duplicate of matchbooks) |
| A-533-848 matchbooks, India | **Order in effect**, continued after the third sunset | [FR 2026-13039](https://www.federalregister.gov/d/2026-13039) (2026-06-29). ITA "O 2009-12-11" | None if the typo above is filtered out |
| A-557-857 | **Does not exist.** Jul 2026 initiation printed "MALAYSIA: Dioctyl Terephthalate, A-557-857". Real case **A-557-827** (ITA "O 2025-05-22"; FR docket on the 2026-10-20 correction) | [FR 2026-13892](https://www.federalregister.gov/d/2026-13892); FR term search gives 1 hit only; empty ITA page | Phantom case |
| C-555-003 | **Does not exist.** Jun 2026 opportunity list: "CAMBODIA: Crystalline Silicon Photovoltaic Cells … C-555-003" in the AD section. Real cases: AD **A-555-003**, CVD **C-555-004** | [FR 2026-10938](https://www.federalregister.gov/d/2026-10938); empty ITA page | Phantom CVD case |
| C-821-824 | **Does not exist.** Apr 2026 list: "RUSSIA: Phosphate Fertilizers, C-821-824". Real case **C-821-825**. Note that **A-821-824** is a real, different case (Russia wire rod AD, order 2018-01-24) | [FR 2026-06418](https://www.federalregister.gov/d/2026-06418); empty ITA page; IDS has A-821-824 and C-821-825 | Phantom; a letter-agnostic matcher could merge it with wire rod |

- ITA's case page title for A-583-840 says "Polyethylene Terephthalate (Pet) Film", while the FR notices say bottle-grade PET resin (PET film Taiwan is A-583-837). This looks like an ITA data error, flagged as a conflict. It is irrelevant to live status. — [ITA page A-583-840](https://beta.trade.gov/adcvd?adcvdcase=A-583-840); [FR E5-1220](https://www.federalregister.gov/d/E5-1220)
- An earlier session found more phantoms of the same kind: A-571-806 (meant A-517-806), C-750-118 (meant C-570-118), A-570-957 (meant A-570-956 / C-570-957). It also found that "-122-855" (PET resin, Canada, a live order) was printed without its A/C prefix in the May 2026 opportunity list (2026-08559). — prior audit `/private/tmp/claude-501/-Users-brendanmclaughlin-Projects-HTS-Hero-hts-hero/0a8604a5-0c12-4bff-92fe-348c060a3f92/scratchpad/research/3-case-list-audit.md`; [FR 2026-08559](https://www.federalregister.gov/d/2026-08559)

### Inferences
- Typo patterns seen: wrong letter (A↔C: C-555-003, A-533-849, C-821-824), wrong country code (583 for Türkiye 489; 571/517; 750/570), and wrong serial digit (857/827). Several typos collide with real numbers (A-583-839, A-583-840, A-821-824, C-533-849), so an existence check alone is not enough.

### Gaps
- The Laos solar ITC final vote date was not found. As of 2026-10-26 I found no ITC final "Determinations" notice for India/Indonesia/Laos solar.
- The India and Indonesia solar Commerce finals were not checked.

## 4. Detecting phantom/typo case numbers and handling formats

### Takeaway
Before accepting a case number, check three things: its format and prefix, that its country code matches the row's country heading, and that it exists as a real case for that country and product. The ITA case page exists for every real case and is blank for phantoms, so it is a cheap, reliable existence oracle. Existence must also match the country and product, because typos often hit old real numbers.

### Cited Findings
- Format: `[AC]-\d{3}-\d{3}`. A = antidumping, C = countervailing. The middle 3 digits are Commerce's country code (e.g. 570 China, 583 Taiwan, 489 Türkiye, 821 Russia, 823 Ukraine, 201 Mexico, 533 India, 557 Malaysia, 555 Cambodia, 553 Laos, 560 Indonesia, 580 Korea, 122 Canada). Seen in the ITA dashboard export country column. — [ITA dashboard](https://www.trade.gov/data-visualization/adcvd-proceedings) (export)
- Text as printed is messy:
  - The FR wraps numbers across lines ("A- 533-820").
  - It drops the prefix ("-122-855").
  - It prints the wrong letter for the section.
  - IDS stores en-dash and space variants ("A–557–827", "A-552- 836", "[A-533-924").
  — [FR 2025-22201](https://www.federalregister.gov/d/2025-22201); [USITC IDS JSON](https://ids.usitc.gov/investigations.json)
- Existence oracle: `beta.trade.gov/adcvd?adcvdcase=X` always returns 200. For real cases (including revoked, pre-initiation and decades-old ones) it shows "Case #X <Country> <Product>". For C-583-840, A-533-849, A-557-857, C-555-003 and C-821-824 the header is the bare "Case #". — ITA case pages fetched 2026-10-26, e.g. [C-821-824](https://beta.trade.gov/adcvd?adcvdcase=C-821-824), [A-570-243](https://beta.trade.gov/adcvd?adcvdcase=A-570-243)
- Secondary checks:
  - The FR term search returns only the typo notice for phantoms (count 1 for A-533-849, A-557-857, C-555-003, C-583-840, C-821-824).
  - FR `docket_ids` on case-specific notices list real case numbers.
  - The CBP message search returns 0 for phantoms. It also returned 0 for the real A-821-808, so it is not decisive on its own.
  — [FR API](https://www.federalregister.gov/api/v1/documents.json?conditions%5Bterm%5D=%22C-821-824%22); [CBP A821808](https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/quickSearchMessage-MemorySide/A821808)

### Inferences
- Suggested gate, for numbers taken from omnibus lists:
  1. Normalize dashes and whitespace. Rejoin numbers split across line wraps. Recover a missing prefix from the section heading (AD vs CVD) and the known registry.
  2. Require the letter to match the section, and the country code to match the country heading.
  3. Require the ITA case page to show the same country, and a product that fuzzy-matches the row's product.
  4. If any check fails, look for the nearest real case with the same country and product (letter flip, one-digit edit, or swapped country code) and map to it. Otherwise quarantine the number; never create a case from it.

### Gaps
- No official machine-readable list of Commerce country codes was found. The code list has to be derived from the ITA export or IDS.

## 5. How fast do official lists reflect a change after the FR notice?

### Takeaway
The FR is first, CBP follows within days to weeks, and the ITA dashboard reflected a new order within 15 days. IDS is current for new investigations but misses many old revocations. So: trust the FR for timing, and use ITA as the periodic reconciliation reference.

### Cited Findings
- **ITA dashboard, new order:** Oleoresin Paprika From India orders were published 2026-10-08 ([FR](https://www.federalregister.gov/api/v1/documents.json?conditions%5Bagencies%5D%5B%5D=international-trade-administration&conditions%5Bpublication_date%5D%5Bgte%5D=2026-09-01)). They were already in the ITA export of 2026-10-23 as A-533-938 / C-533-939 "O 2026-10-08". So the lag is at most 15 days. — [ITA dashboard](https://www.trade.gov/data-visualization/adcvd-proceedings) (export)
- **ITA dashboard, ITC negative:** after the palladium ITC negative (FR 2026-06-18) and the active anode negative (FR 2026-04-03), neither case appeared in ITA's 2026-10-23 investigations table, so they were dropped at some point within about 4 months. Snapshots were too sparse to measure more precisely. — [FR 2026-12219](https://www.federalregister.gov/d/2026-12219); [FR 2026-06488](https://www.federalregister.gov/d/2026-06488)
- **CBP after revocation notices:**
  - Kegs: sunset revocation FR 2024-11-21 → CBP REVORD message 11/26/2024 (5 days).
  - PET sheet Korea: FR 2026-01-12 → CBP REVORD 02/18/2026 (37 days).
  - Mattresses Indonesia: FR 2025-03-05 → amended cash-deposit message 03/10/2025; refund message 05/02/2025.
  — [CBP A570093](https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/quickSearchMessage-MemorySide/A570093); [CBP A580903](https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/quickSearchMessage-MemorySide/A580903); [CBP A560836](https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/quickSearchMessage-MemorySide/A560836)
- **IDS:**
  - Refreshed daily (`date` 2026-10-23T22:00Z).
  - Recorded A-580-903's revocation with the FR date (01-12-2026).
  - Has fence pickets (instituted 2026-09) and palladium final-phase records marked "Completed".
  - Still lacks revoke dates for 65 cases ITA lists as revoked.
  — [USITC IDS JSON](https://ids.usitc.gov/investigations.json)
- **Effective dates can come before the notice:** A-580-903 revocation is effective 2025-09-10 but was published 2026-01-12. Mattresses revocation is applicable 2025-02-28 but was published 2025-03-05. For about 4 months, any list built from the FR alone would wrongly show PET sheet Korea as live. — [FR 2026-00384](https://www.federalregister.gov/d/2026-00384); [FR 2025-03529](https://www.federalregister.gov/d/2025-03529)

### Inferences
- Policy:
  - Apply FR status events the day they publish, backdated to the effective date the notice states.
  - Treat CBP REVORD as confirmation.
  - Reconcile against an ITA dashboard export about monthly and alert on any disagreement.
  - Never let IDS alone keep a case live when ITA says it is revoked.
- Sunset revocations are predictable: an order with an initiated sunset review is at risk on its fifth anniversary. If no continuation notice follows, a system can show "possibly revoked" before the FR notice lands.

### Gaps
- No direct measurement of how quickly the ITA dashboard reflects revocations. That needs repeated exports over time.
- The USITC orders-in-place update cadence could not be measured (403).
