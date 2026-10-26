# Best-in-Class AD/CVD Screening: How Commercial Products and Expert Practitioners Identify Applicable Orders (US, as of Oct 2026)

Research note scope: US AD/CVD only. About 22 searches and fetches. Public vendor material on AD/CVD specifically is thin. Most large GTM vendors describe "ADD/CVD rates" as one content field and publish no method or accuracy figures. Unverified vendor marketing is labelled as such below.

## Q1. What do the commercial products claim, and what can be verified?

### Takeaway
None of the large trade-content vendors (Thomson Reuters ONESOURCE, Descartes CustomsInfo, E2open/Amber Road) publicly documents an AD/CVD matching method or an accuracy figure. Their public material presents AD/CVD as an extra field on the tariff line, keyed by HTS code and country. The clearest public description of a "scope-first, company-rate-aware" design comes from a small newer entrant, Tandom (compliance.tandom.ai). It names four primary sources, cites a source for every match, and says that HTS code plus origin only nominates candidate orders. Nobody publishes accuracy figures.

### Cited Findings
- **Thomson Reuters ONESOURCE Global Trade Content:** the brochure says users can see "Antidumping Duties, Binding Rulings, Additional Codes, WCO Explanatory Notes" next to the tariff schedule. In other words, AD/CVD is presented as extra information on the tariff line. — [ONESOURCE GTC brochure](https://store.tax.thomsonreuters.com.au/content/dam/ewp-m/documents/tax/en/pdf/brochures/onesource-global-trade-content-brochure.pdf)
- ONESOURCE's Trade Lane Analyzer lists "ADD/CVD Rates" as an output alongside sanctions and preferential rates. Content is "updated by the ONESOURCE Global Trade Content team on a daily basis" for 200+ countries. This is a vendor claim: there is no public description of how scope or company rates are handled. — [TR help: GTC Analyzer](https://www.thomsonreuters.com/en-us/help/onesource-global-trade/content/global-trade-content-gtc-analyzer.html); [TR GTC product page](https://tax.thomsonreuters.com/en/products/onesource-global-trade-content.html)
- **Descartes CustomsInfo:** the Reference subscription covers US rulings, CBP decisions and bulletins, CIT/CAFC cases, 19 CFR, and the current Federal Register, with 253,000+ US ruling documents. Descartes claims 40,000+ of those are on no other database (unverified). CustomsInfo also publishes news-style "Federal Register International Trade Alerts" on AD/CVD reviews and preliminary determinations. The public pages show no structured AD/CVD case-matching product. — [CustomsInfo Reference](https://www.customsinfo.com/solutions/customs-info-reference/); [CustomsInfo FR alerts](https://www.customsinfo.com/category/fr-alerts/page/18); [Descartes CustomsInfo catalog](https://www.descartes.com/resources/knowledge-center/descartes-customsinfo-catalog)
- **E2open / Amber Road:** trade content is "sourced from government agencies and transportation providers and curated for over 170 countries". Public material does not mention AD/CVD specifically. — [SCMR on E2open–Amber Road](https://www.scmr.com/article/e2open_acquires_amber_road/Supply_Chain_Management)
- **Tandom (compliance.tandom.ai), a free AD/CVD lookup:**
  - It monitors 4 sources: Federal Register (orders, reviews, scope decisions, rate notices), CBP CSMS (cash-deposit instructions), Commerce ACCESS (case records), and USITC IDS.
  - It states that "the HTS code alone does not decide whether an order applies"; applicability depends on the narrative scope.
  - Rates are shown as manufacturer-specific, combination, country-wide, or all-others "when the available record supports them".
  - Combination rates require both producer and exporter to match (19 CFR 351.107).
  - Every match carries a source citation.
  - There is no quantified accuracy claim, no stated scan cadence (it shows only "Last scan Oct 25, 2026"), and a disclaimer of "not legal advice, customs brokerage, or an entry determination".
  - Source: [Tandom compliance](https://compliance.tandom.ai/)
- Tandom also republishes CSMS AD/CVD messages and individual order pages, such as C-570-171. It describes CSMS messages as the layer that turns Commerce decisions into binding operational instructions for entry filing. This is a secondary source. — [Tandom CSMS catalog](https://compliance.tandom.ai/adcvd-catalog/browse/csms/18); [Tandom order C-570-171](https://compliance.tandom.ai/adcvd-catalog/orders/C-570-171)
- **Gaia Dynamics** (AI Fund-backed, founded 2024, $7M seed): its headline claim is automated HTS classification at "92% accuracy … within 30 seconds" (vendor claim, method unpublished). The coverage found shows no AD/CVD-specific feature. — [Pulse2](https://pulse2.com/gaia-dynamics-raises-7-million-seed-round-led-by-corazon-capital); [FreightWaves](https://www.freightwaves.com/news/exclusive-gaia-dynamics-uses-ai-to-help-shippers-save-on-compliance-tariffs)
- **US Tariff Rates** (competitor comparison page): lists "AD/CVD risk flags", with the caveat that exact AD/CVD liability cannot be set from HTS code and country alone. — [ustariffrates.com Gaia alternative](https://ustariffrates.com/alternatives/gaia-dynamics)
- **Lower-end calculators** split into two camps:
  - Flag AD/CVD exposure: Shipping Solutions says it will "warn you if anti-dumping duties or countervailing duties may apply". — [Shipping Solutions](https://shippingsolutionssoftware.com/free-trial-landed-cost-calculator)
  - Disclaim it: CalcMyTariff says its rates may not include AD/CVD. — [CalcMyTariff](https://www.calcmytariff.com/tools/calculator)
  - findhs.codes claims AD/CVD calculations "with company-specific rates". — [findhs.codes](https://www.findhs.codes/AD-CVD-Calculations)

### Inferences
- The incumbents' AD/CVD offering is a rate-per-HTS-line content field. Because the scope text, not the HTS code, decides coverage, that model over-flags (an HTS line only partly in scope) and misses scope-covered goods filed under other HTS codes. Excellence therefore lies in what the incumbents do *not* publicly document: scope-text matching, company-rate waterfalls, and a citation for every claim.
- Citing a source for every match and stating "potential match, not determination" is becoming the norm for new entrants (Tandom, US Tariff Rates). This fits HTS Hero's existing "never guaranteed, link sources" rule.

### Gaps
- No public method or accuracy documentation was found for Descartes, E2open, SAP GTS, Avalara, 3CE, Zonos, Flexport, Livingston, Expeditors, UPS or FedEx on AD/CVD. Searches for Zonos, Avalara and SAP GTS returned nothing relevant. Their docs are likely behind customer portals.
- No G2 or Capterra reviews mentioning AD/CVD errors were found; I ran no dedicated review search because of the call budget.
- Altana, Trademo, Tarifflo, and CustomsMobile's AD/CVD module were not covered. CustomsMobile and CBP's own "ADCVD Search" message database came up indirectly but were not documented.

## Q2. How do brokers and trade attorneys actually decide scope, and what does a careful expert workflow look like?

### Takeaway
The written scope text is legally decisive and the HTS codes are only a convenience. Experts therefore work in this order:
1. Use HTS code plus country to find candidate orders.
2. Read the scope paragraph, with its inclusions, exclusions and kit or finished-goods carve-outs.
3. Check prior scope rulings and the (k)(1) sources.
4. Identify the producer and exporter, and pick the right rate through the combination → exporter → all-others / country-wide waterfall.
5. Document the reasoning when disclaiming an order.
6. Request a scope ruling when the answer is ambiguous.

### Cited Findings
- Commerce scope guidance: because only part of an HTSUS subheading may be covered, "the narrative description of the scope is dispositive". Commerce may look to CBP's reading of the HTS numbers as one of many sources. — [ITA Scope Ruling Guidance (4/1/2022)](https://access.trade.gov/help/Scope_Ruling_Guidance_(4.1.2022).pdf)
- Standard order language says HTS subheadings are "provided for convenience and customs purposes" and that the written description "is dispositive". — [ITA remand 17-70 / scope materials](https://enforcement.trade.gov/remands/17-70.pdf)
- When scope language is ambiguous, Commerce analyses the factors in 19 CFR 351.225(k)(1). DynaEnergetics' gun carrier tubing was found in scope this way. — [DynaEnergetics v. US](https://case-law.vlex.com/vid/dynaenergetics-u-s-inc-891174275)
- Courts do overturn (k)(1) analyses: the CIT held in *Vandewater* that Commerce unreasonably relied on (k)(1) sources (steel branch outlets). — [CIT Slip Op. 19-109](https://www.cit.uscourts.gov/sites/cit/files/19-109.pdf)
- When a scope ruling finds goods in scope, Commerce directs CBP to suspend liquidation and collect cash deposits under 351.225(l). How far back suspension can reach was litigated in *Sunpreme* (Fed. Cir.). — [Akin Gump on Sunpreme](https://www.akingump.com/en/experience/practices/international-trade/ag-trade-law/federal-circuit-confirms-limits-to-the-suspension-of-liquidation.html)
- **Kit and finished-goods exclusions are fact-specific.** In the China aluminum extrusions orders:
  - A "finished goods kit" must contain at importation all parts needed to fully assemble a final good. Adding fasteners alone does not qualify.
  - Finished merchandise that is fully and permanently assembled at entry is excluded.
  - Courts repeatedly remanded on door thresholds, refrigerator trim kits and dock ladder kits.
  - Sources: [CIT Slip Op. 23-05 (Reflection)](https://www.cit.uscourts.gov/sites/cit/files/23-05.pdf); [ITA remand 20-129](https://access.trade.gov/resources/remands/20-129.pdf); [ITA remand 21-115](https://access.trade.gov/resources/remands/21-115.pdf)
- **Broker practice (C.H. Robinson checklist):**
  - The broker needs current case numbers and rates in the importer's broker instructions so they are reported at entry.
  - If disclaiming AD/CVD, "document your product details internally" and give "detailed rationale as to why your product does not fall within the scope".
  - Source: [C.H. Robinson Customs & Compliance Checklist](https://www.chrobinson.com/en-us/resources/resource-center/guides/customs-clearance-checklist/)
- **Inputs and rate waterfall (Tandom guide, secondary):**
  - A full check needs the HTS code, country of origin, manufacturer, exporter, entry date, the scope text, and any scope rulings.
  - Rate waterfall: named producer/exporter combination → exporter rate → manufacturer rate → all-others / country-wide.
  - Missing manufacturer information pushes the entry to the country-wide rate, which is often very high for non-market economies.
  - Source: [Tandom: how to check AD/CVD exposure by HTS code](https://tandom.ai/resources/how-to-check-adcvd-exposure-by-hts-code)
- The broker shares reasonable-care exposure with the importer, and a binding scope ruling may be warranted when scope is ambiguous (secondary source). — [ClawHub AD/CVD exposure skill](https://clawhub.ai/deciqai/customs-adcvd-tariff-exposure)
- **CSMS and Commerce messages are the operational truth at entry.** CBP publishes the AD/CVD messages Commerce issues (for example, an Aug 26, 2026 batch covering a mattress scope inquiry from Mexico, a softwood lumber amendment, and others). — [Willson International](https://www.willsonintl.com/news/antidumping-and-countervailing-duty-updates/)
  - In FY2021 CBP processed 1,851 AD/CVD instruction messages from Commerce and liquidated 242,143+ AD/CVD entries. CBP says it reviews every instruction Commerce drafts. — [CBP AD/CVD Liquidation Instructions report to Congress FY2021](https://www.dhs.gov/sites/default/files/2021-12/CBP%20-%20Antidumping%20and%20Countervailing%20Duty%20Liquidation%20Instructions%20-%20FY%202021_1.pdf)

### Inferences
An expert workflow that software could emulate:
- **Step 1 (high recall):** use HTS code plus origin to nominate candidate orders. Also include orders whose scope text matches the product description even when the HTS code is not listed.
- **Step 2 (precision):** compare the product description with the scope's inclusions and exclusions, quoting the controlling sentences.
- **Step 3:** surface prior scope rulings and CBP CROSS rulings on similar products.
- **Step 4:** ask for producer and exporter, then resolve the rate waterfall and show which rung matched.
- **Step 5:** produce a "disclaim rationale" artifact for the importer's file.
- **Step 6:** escalate ambiguous cases with "consider a scope ruling / talk to a broker".

This matches HTS Hero's "find, flag, explain; broker decides" stance.

### Gaps
- I did not retrieve the 2021 amendments to 19 CFR 351.225: the 120-day ruling clock, the effect on unliquidated entries, and the (c)/(k)(2) changes. Read the eCFR text and an Oct 2021 Federal Register practitioner alert.
- I did not research how CBP CROSS rulings interact with Commerce scope rulings. CBP generally defers to Commerce on scope, but I did not cite this.

## Q3. Common documented screening mistakes and their consequences

### Takeaway
The expensive mistakes are not obscure misreadings of the HTS. They are:
- treating in-scope goods as out of scope through mislabelling (the "sham kit"),
- misdescribing goods as non-subject materials,
- origin transshipment through a third country,
- failing to identify the producer.

Consequences now regularly reach the hundreds of millions: False Claims Act treble damages, EAPA conversion of entries to AD/CVD, and interim cash deposits above 200–500%. Even CBP's own systems have mis-validated AD/CVD case numbers.

### Cited Findings
- **FCA settlements and judgments tied to AD/CVD evasion:**
  - *Island Industries v. Sigma* (9th Cir.): $26M; Chinese pipe fittings.
  - Evolutions Flooring: $8.1M, Mar 2025; false manufacturer identity and origin on multilayered wood flooring.
  - Grosfillex: $4.9M, Jul 2025; aluminum furniture components described as not subject to AD/CVD as "sham" furniture kits.
  - Allied Stone: $12.4M, Aug 2025; quartz described as marble or glass.
  - Perfectus Aluminum / PengCheng: $549.5M, May 2026; aluminum extrusions declared as finished pallets.
  - Redi-Bag USA: $7.3M, Jul 2026; carrier bags transshipped via Hong Kong.
  - Customs-fraud FCA recoveries exceeded $100M in 2025.
  - Source: [AFS Law, "FCA Customs Enforcement at Mid-Year 2026"](https://www.afslaw.com/perspectives/investigations-blog/baseline-not-finish-line-fca-customs-enforcement-mid-year-2026)
- In *Island Industries*, damages were trebled to $24,256,638, plus penalties for each of 205 false entry summaries ($1,824,145). The court held that § 1592 and the FCA can coexist. It rejected an "objective reasonableness" defense: reckless disregard is enough. — [Foley](https://www.foley.com/insights/publications/2025/07/ninth-circuit-slams-importer-false-claims-act-case/); [Crowell](https://www.crowell.com/en/insights/client-alerts/ninth-circuit-decision-underscores-increasing-false-claims-act-risks-to-us-importers)
- **EAPA remedies:** CBP keeps entries suspended, converts non-AD/CVD entries to AD/CVD entries, and reviews bonds. These "do not preclude" further civil penalty or criminal action. (Example: EAPA case 7552, quartz.) — [CBP EAPA 7552 determination](https://www.cbp.gov/trade/trade-enforcement/tftea/eapa/recent-eapa-actions/eapa-action-determination-evasion-eapa-case-7552-quartz-surface-products)
- **EAPA scale:**
  - Commentary reports $400M in unpaid duties uncovered Jan 20–Aug 8, 2025, including about $250M from one consolidated mattress case with 23 importers. CBP said every importer investigated was in violation. This is secondary commentary. — [Barnes Richardson](https://www.barnesrichardson.com/cbp-touts-some-dumping-evasion-wins)
  - EAPA consolidated case 8163 (solar modules, June 23, 2026) reportedly carried cash-deposit rates up to 271.28% (Vietnam AD) and 238.95% (China-wide AD). This is press coverage and was not checked against the CBP notice. — [pv magazine India](https://www.pv-magazine-india.com/?p=15596)
  - In *ICON EV v. US* (CIT Slip Op. 26-42), the CIT blocked EAPA interim measures carrying a combined 519.23% deposit rate. — [Mondaq](https://www.mondaq.com/unitedstates/international-trade-investment/1798974/a-court-just-blocked-an-eapa-evasion-action-over-a-519-duty-rate)
- **Third-country circumvention (SE Asian solar):**
  - Commerce's Dec 2022 preliminary finding applied country-wide to Cambodia, Malaysia, Thailand and Vietnam, except for named non-circumventing companies.
  - Importers could avoid deposits only with certifications signed by the time the entry summary was filed. Uncertified goods could be presumed subject to the orders.
  - Sources: [Foley](https://www.foley.com/insights/publications/2022/12/circumvention-solar-energy-products-se-asia/); [Akin Gump final determinations](https://akingump.com/en/insights/alerts/commerce-reaches-final-affirmative-circumvention-findings-for-solar-products-from-cambodia-malaysia-thailand-and-vietnam)
  - The duty waiver under Proclamation 10414 ended June 6, 2024 (or on earlier termination of the emergency). After that, importers had to pay AD/CVD or meet the other certifications. — [Federal Register 2022-20057](https://www.govinfo.gov/content/pkg/FR-2022-09-16/pdf/2022-20057.pdf)
- **CBP's own system error:** from Oct 5, 2019 to Oct 28, 2020, ACE would not accept AD/CVD entries with *any* third-country case number. Importers had to file post-summary corrections with deposits, and the correction window was later extended. — [Crane Worldwide summary of CSMS #46031819 / #46587197](https://www.craneww.com/knowledge-center/trade-advisory-notices/third-country-cases/); [Expeditors](https://info.expeditors.com/newsflash/cbp-releases-information-on-identifying-antidumping-and-countervailing-duty-third-country-case-numbers-in-ace)
- **Collection failure (system-wide):**
  - GAO-20-50R: $4.5B of AD/CVD billed for FY2001–2018 remained uncollected as of May 2019. 20 importers accounted for $1.93B (43.3%). — [GAO-20-50R](https://www.gao.gov/products/GAO-20-50R); [Kelley Drye](https://www.kelleydrye.com/viewpoints/blogs/trade-and-manufacturing-monitor/gao-report-reveals-deficiencies-in-process-for-collecting-antidumping-and-countervailing-duties)
  - GAO-16-542 found processing errors that caused bills to close at the initial rate instead of the final rate, and a correction initiative of limited reach. — [GAO-16-542](https://www.gao.gov/products/GAO-16-542)
  - GAO-08-391 found $613M+ uncollected for FY2001–2007. — [GAO-08-391](https://www.gao.gov/products/gao-08-391)
- **Clerical errors in liquidation instructions:** a CBP-posted court decision describes a "clerical error"/"mistake of fact" when data was moved from a printout into liquidation instructions, which produced an incorrect rate. — [CBP bulletin slip op.](https://www.Cbp.Gov/bulletins/40slipops8.pdf)

### Inferences
- The dominant failure mode is a gap between how the goods are *described* and what they actually are, together with unknown or misstated producer and origin. An HTS-based screen cannot catch any of this. Best practice is to ask for producer, exporter and supply-chain facts (for example, the origin of cells or wafers for solar) and to flag "description sounds like a known evasion pattern": kits, pallets, marble or glass versus quartz.
- Because reckless disregard can create FCA liability, a tool that only says "no AD/CVD" without scope reasoning is a liability. "Potential match + reasoning + source" protects the user better.

### Gaps
- No public example was found of a named commercial software product producing a wrong AD/CVD answer that led to a penalty. Such cases are not attributed publicly.
- No specific 2026 DOJ § 1592 penalty case for undeclared AD was found apart from the FCA matters above.

## Q4. Status lifecycle subtleties that trip up trackers

### Takeaway
Rates and coverage change through many channels, each with its own effective date:
- preliminary and final determinations,
- ITC votes,
- administrative reviews,
- court-driven Timken notices (cash deposits revise only if no later review has superseded the rate),
- circumvention findings with certification regimes and waiver windows,
- scope rulings that reach back to unliquidated entries,
- sunset and changed-circumstances revocations.

Federal Register publication date and the effective or applicability date differ, and each notice sets its own.

### Cited Findings
- **Timken / Diamond Sawblades:** Commerce must publish notice of a court decision "not in harmony" with its determination and suspend liquidation until the decision is conclusive. — [FR public inspection 2026-17735](https://public-inspection.federalregister.gov/2026-17735.pdf)
- **Revised deposits depend on whether a later review exists:**
  - Universal Tube (CIT judgment Aug 19, 2026): no revised cash deposit, because "there have been final results published in a subsequent administrative review". — [FR 2026-17770](https://public-inspection.federalregister.gov/2026-17770.pdf)
  - Trina Solar: revised cash deposit instructions issued, because no superseding rate existed. — [FR 2025-08162](https://public-inspection.federalregister.gov/2025-08162.pdf)
  - Wood mouldings (China Cornici; CIT judgment Sep 23, 2026): amends a review rescission and the cash deposit rate, applicable Oct 5, 2026. — [FR 2026-21045](https://public-inspection.federalregister.gov/2026-21045.pdf)
  - These notices were found via search snippets and not fully read; check which FR number matches which case before citing.
- **Circumvention lifecycle (solar):**
  - preliminary (Dec 2022) → final (Aug 2023), with certification procedures kept;
  - company-specific non-circumvention carve-outs, conditional on an unchanged supply chain;
  - a statutory waiver window ending June 6, 2024.
  - Sources: [Foley](https://www.foley.com/insights/publications/2022/12/circumvention-solar-energy-products-se-asia/); [Akin Gump](https://akingump.com/en/insights/alerts/commerce-reaches-final-affirmative-circumvention-findings-for-solar-products-from-cambodia-malaysia-thailand-and-vietnam); [FR 2022-20057](https://www.govinfo.gov/content/pkg/FR-2022-09-16/pdf/2022-20057.pdf)
- **Scope outcomes reach back to unliquidated entries:** a CBP instruction for a later scope ruling directed liquidation of unliquidated entries made after a set date. Entries suspended earlier followed the earlier instructions, and a pending court challenge delayed liquidation. — [CustomsMobile AD/CVD message (eff. Nov 4, 2021)](https://www.customsmobile.com/adcvd/4176405)
- **ACE validation behaviour:** an entry type change from 03 to 06 is valid only if the 06 entry references at least one AD/CVD case. A specific-rate bonded case requires a single transaction bond. The guidance found is older and may be superseded. — [CBP ACE ES instructions 2.4a (2016)](https://cbp.gov/sites/default/files/assets/documents/2016-Sep/ace_es_instructions%202.4a%20(09-02-2016).pdf); [CSMS bulletin](https://content.govdelivery.com/accounts/USDHSCBP/bulletins/2be63cb)

### Inferences
- A tracker must model events, not a single status. Each event needs: event type, FR publication date, effective or applicability date, affected companies, and whether it supersedes the previous deposit rate.
- Timken notices are a classic trap. A court win does not always change the current deposit rate.
- Company-specific outcomes (non-circumvention carve-outs, combination rates, exclusions) mean the honest answer is often "depends on producer". It should be shown as a range across rates, which matches HTS Hero's AD/CVD plan.

### Gaps
- Not separately researched with sources: ITC negative final votes (an order never issues and deposits are refunded), partial revocations, sunset revocation effective dates (usually the anniversary of the order or the five-year date), changed-circumstances revocations, and suspension agreements (for example, sugar from Mexico or tomatoes from Mexico, where the 2019 agreement was terminated in 2025). I know these from background but did not verify them here.

## Q5. What does best-in-class accuracy look like quantitatively?

### Takeaway
Nobody publishes AD/CVD screening accuracy: no incumbent vendor, startup, broker or government body. The only published "accuracy" figure in the space is Gaia's unverified 92% for HTS classification, not AD/CVD. The closest public measures of real-world error are government collection and processing statistics.

### Cited Findings
- Gaia Dynamics claims 92% HTS classification accuracy within 30 seconds. This covers classification only, with no published evaluation method. — [Pulse2](https://pulse2.com/gaia-dynamics-raises-7-million-seed-round-led-by-corazon-capital)
- Tandom makes "no quantified accuracy claim"; it offers per-match source citations instead. — [Tandom compliance](https://compliance.tandom.ai/)
- ONESOURCE claims daily content updates but publishes no accuracy metric. — [TR GTC product page](https://tax.thomsonreuters.com/en/products/onesource-global-trade-content.html)
- System-level error proxies:
  - $4.5B uncollected AD/CVD, FY2001–2018. — [GAO-20-50R](https://www.gao.gov/products/GAO-20-50R)
  - Bills closing at initial rather than final rates. — [GAO-16-542](https://www.gao.gov/products/GAO-16-542)
  - 1,851 instruction messages and 242,143 AD/CVD entries liquidated in one year. This gives the scale a tracker must keep in sync with. — [CBP FY2021 report](https://www.dhs.gov/sites/default/files/2021-12/CBP%20-%20Antidumping%20and%20Countervailing%20Duty%20Liquidation%20Instructions%20-%20FY%202021_1.pdf)
  - "Every importer investigated" was found in violation in the 2025 consolidated mattress EAPA case, which shows how badly self-screening fails in high-risk categories (secondary source). — [Barnes Richardson](https://www.barnesrichardson.com/cbp-touts-some-dumping-evasion-wins)

### Inferences: practices that separate excellent from mediocre screening
1. **Scope-first, HTS-second.** Use the HTS code for recall only and decide on the scope text, quoting the controlling inclusion or exclusion sentence. Mediocre tools stop at "HTS line has an order".
2. **Company-aware rates.** Collect producer and exporter, then resolve the combination → exporter → all-others / country-wide waterfall. Show a range when the party is unknown. Mediocre tools show one "AD rate" per HTS line.
3. **Track events, not just status.** Model preliminary and final determinations, ITC votes, reviews, Timken notices, circumvention and certification regimes, revocations and suspension agreements, each with a publication date and an effective date.
4. **Primary-source citation on every claim:** FR, CSMS, ACCESS, ITC IDS. CSMS cash-deposit messages are the operational truth.
5. **Red-flag evasion patterns.** Watch for kits, pallets or "parts" of in-scope goods; material relabelling (marble or glass versus quartz); transshipment origins; third-country assembly from components made in an order country.
6. **A documented "disclaim rationale"** saved for the importer's reasonable-care file.
7. **Honest uncertainty and escalation.** Say "potential match, not a determination" and point to a scope ruling, broker or attorney.
8. **Measured accuracy.** Since no one publishes it, a credible approach is a labelled test set: scope rulings plus EAPA and FCA fact patterns as ground truth. Measure recall on in-scope goods, precision on HTS-matched-but-excluded goods, and rate accuracy against CSMS. Publishing this would set HTS Hero apart. This is a recommendation only; no source does it.

### Gaps
- No published precision or recall, test set, or third-party benchmark for AD/CVD screening exists in anything found.
- No customer reviews quantifying vendor AD/CVD error rates were found.
