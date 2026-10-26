# HTS Hero's current AD/CVD pipeline: end-to-end audit (accuracy and cost)

Scope: code in `libs/adcvd/*`, `scripts/adcvd/*`, `app/api/adcvd/*`, `app/api/cron/adcvd/route.ts`, `vercel.json`, `tariffs/hts-concordance/successors.json`, plus read-only queries against the DEV Supabase project (host `exviallkczzlrkpaafxq.supabase.co`) run 2026-10-26. Query scripts are in the session scratchpad (`/private/tmp/claude-501/-Users-brendanmclaughlin-Projects-HTS-Hero-hts-hero/ef33aad5-817c-4fd5-a84e-7f3e6cbecfa7/scratchpad/stats.ts`, `stats2.ts`, `noise.ts`, `q3.ts`–`q8.ts`). The golden output is saved in the same folder as `golden_all.txt`. Prod was not queried: there are no prod keys in `.env.local`, and querying prod was out of scope.

Citation convention: `[file:line](path)` for code. `[dev query: script]` for data I pulled myself. `[memory: note]` for the user's memory notes, which are the user's own records and not independently verified.

---

## 1. Data sources and how each field of adcvd_cases / adcvd_events is filled; how status is derived

### Takeaway
Everything is rebuilt from Federal Register (FR) notice text with regex. The inputs are about 12 months of ITA/ITC notices, each case's FR docket history (titles only), ITA case pages, and CBP's public message feed. Status comes from a hand-written state machine over notice titles plus two date heuristics. No official status source is read. The ITA page has none, so status is inferred. Status looks right for live/ended membership (17 ended cases, 0 "unknown"). The dates are weaker: 59 of 853 orders have a "last continued" date more than 5.5 years old, so the sunset estimates are wrong. Two phantom (typo) cases are still live in dev and still flag imports.

### Cited Findings
**Sources, by field**
- Notice discovery: the `tariff_source_items` rows from the shared FR collector, filtered to agencies "International Trade Administration" and "International Trade Commission" and to unread rows (`adcvd_at is null`) ([notices.ts:58-72](libs/adcvd/notices.ts)). In dev: 1,704 ITA/ITC FR items from 2025-11-17 to 2026-10-22, 0 unread [dev query: stats2.ts]. The adcvd_events date range is 2025-11-18 to 2026-10-22, 3,720 events [dev query: stats2.ts].
- Notice text: GovInfo HTML first, then FR `raw_text_url`, through one serialized queue at 1 request/s with backoff of 30/60/120/240 s ([fr.ts:18-19](libs/adcvd/fr.ts), [fr.ts:150-162](libs/adcvd/fr.ts), [fr.ts:76-112](libs/adcvd/fr.ts)).
- Case number: regex `[AC]-ddd-ddd` taken from the notice's bracketed header line plus its FR `docket_ids` ([parse.ts:24-40](libs/adcvd/parse.ts), [notices.ts:447-448](libs/adcvd/notices.ts)).
  - For list notices (annual opportunity, review initiation, sunset), the rows come from a custom table parser that uses country/section markers and a typo check (case country vs. heading) ([parse.ts:401-481](libs/adcvd/parse.ts)).
  - ITC notices link only through 701/731-TA numbers already stored on a case ([notices.ts:362-387](libs/adcvd/notices.ts)). If none match, a word-overlap similarity is used: ≥0.75 links outright, 0.34–0.75 goes to Sonnet ([summaries.ts:105-108](libs/adcvd/summaries.ts)).
- `kind`: the first letter of the case number. `commerce_country`: digits 3–5. `country`: a lookup table ([notices.ts:81-121](libs/adcvd/notices.ts)).
- `product`: the title text before " From " ([parse.ts:66-85](libs/adcvd/parse.ts)), or the product cell of a list row ([notices.ts:236](libs/adcvd/notices.ts)). history.ts overwrites it with the newest docket title ([history.ts:33-34](libs/adcvd/history.ts)).
- `status`, `initiated_on`, `order_on`, `last_continued_on`, `ended_on`: `applyEvent` maps title-regex event types to transitions ([notices.ts:133-219](libs/adcvd/notices.ts)). `applyListRow` treats a list appearance as "order in effect" ([notices.ts:233-252](libs/adcvd/notices.ts)). `reconciledStatus` adds two heuristics:
  - an "investigation" older than 730 days with no order or reviews becomes "terminated";
  - an "order" with no order or continuation date, initiated within 548 days, becomes "investigation" ([checks.ts:34-39](libs/adcvd/checks.ts)).
- `fillHistory` replays every title in the case's FR docket (`conditions[docket_id]=<case>`, back to 1994) through the same `applyEvent` ([history.ts:16-56](libs/adcvd/history.ts), [fr.ts:124-133](libs/adcvd/fr.ts)). It runs from scripts (`recompute.ts`, `backfill.ts`) and for new CBP cases ([cbp.ts](libs/adcvd/cbp.ts)), not on every cron run.
- Event type comes only from the title: a ~40-line regex cascade in `eventOf` ([parse.ts:88-132](libs/adcvd/parse.ts)). "Negative" in a title ends an investigation ([parse.ts:173](libs/adcvd/parse.ts)). Split ITC votes are parsed from the text ([parse.ts:208-229](libs/adcvd/parse.ts)).
- `third_countries`: from affirmative circumvention titles ([notices.ts:457-458](libs/adcvd/notices.ts)) and from "Third Country Case Number" in CBP message titles ([cbp.ts](libs/adcvd/cbp.ts), the readCbpMessages loop).
- `rates` (case) and `adcvd_company_rates`: Haiku extracts them from notice text cut at 60,000 characters ([claude.ts:19](libs/adcvd/claude.ts), [claude.ts:74-85](libs/adcvd/claude.ts)). The newest rate-setting notice replaces the case's rates ([summaries.ts](libs/adcvd/summaries.ts), in summarizeMonth: `if (!current || current.as_of <= rates.as_of)`).
- CBP public messages: one request per cron run. The feed holds only a few days of messages, so gaps happen when crons are down ([cbp.ts:1-19](libs/adcvd/cbp.ts)). Up to 5 unknown case numbers per run are inserted as "unknown" and given history ([cbp.ts:19](libs/adcvd/cbp.ts)).

**Dev data state (2026-10-26)** [dev query: stats.ts]
- 969 cases: order 853, investigation 92, revoked 10, terminated 7, suspended 7, unknown 0.
- 952 live. 1 live case has no codes: A-122-855 (PET resin, Canada) has `scope_method` null and the problem "Scope not read yet". This is the "-122-855 printed without its letter" bug the user's 2026-10-23 memory note lists. It is still open in dev: the list parser now accepts the missing letter ([parse.ts:370-374](libs/adcvd/parse.ts)), but this case was never scoped.
- `country` is null for 0 cases. 45 orders have no `order_on`.

**Concrete status/date failures found**
- **Phantom cases still live in dev and still matchable:**
  - A-570-957 ("Seamless … Pipe", China): ITA has no page for it (`ita_found=false`). It has 37 main codes, and its only event is an ITC sunset institution (2026-08-03). The real cases are A-570-956 (AD) and C-570-957 (CVD), both present [dev query: q3.ts].
  - A-533-849 (Commodity Matchbooks, India; the real case is A-533-848): `ita_found=false`, one event (the 2025-12-08 opportunity list) [dev query: q3.ts].
  - `matchCase` ignores `ita_found` ([match.ts:52-92](libs/adcvd/match.ts)), so both still flag imports. The user's memory note says the 8 typo cases were removed in dev on 2026-10-23, but these two survive. phantoms.ts deletes a case only if ITA has no page AND the FR docket is empty ([phantoms.ts](scripts/adcvd/phantoms.ts)). FR docket tags are themselves mis-tagged, so the second test fails for these two.
- **The phantom gate fails open:** `confirmNew` trusts any new number when the FR API can't be reached (`docs === null`) ([notices.ts:326-339](libs/adcvd/notices.ts), line 335). A FR block therefore creates typo cases.
- **Missed sunset continuations:**
  - 59 of 851 dated orders have `last_continued_on ?? order_on` more than 5.5 years ago; 34 are more than 6.5 years ago [dev query: q6.ts].
  - Example: A-489-826 (hot-rolled steel, Türkiye) has order_on 2016-10-03 and last_continued_on null. Its stored events are 2026 list rows only [dev query: q6.ts]. Orders from 2016–2018 must have been continued around 2021–2023, or they would be revoked.
  - Impact: `nextDates` prints a sunset date already in the past ([match.ts:198-215](libs/adcvd/match.ts)). Status is still "order", which is correct, because annual lists keep it live.
- **Suspension agreements:** 7 are stored, among them A-821-802 (uranium, Russia) and A-823-808 (CTL plate, Ukraine) [dev query: q5.ts]. A-201-820 (fresh tomatoes, Mexico) is an "order" with a 4-digit main code `0702` read by Opus; its last continuation date is 2019-05-13 [dev query: stats.ts, q5.ts].
- **Long-running "investigations":** 20 are more than 365 days past initiation. Examples: A-557-832 (float glass, Malaysia, initiated 2025-01-08); C-549-856 (silicon metal, Thailand, 2025-05-21); several hardwood plywood and solar cases from June–August 2025 [dev query: q5.ts]. The user's memory note already flags float glass MY and silicon metal TH as "not linked to ITC votes". Both are probably ended or ordered. The 730-day heuristic has not caught them yet ([checks.ts:36](libs/adcvd/checks.ts)).
- **Unlinked or skipped ITC notices:**
  - 9 ITC events have `case_number=null` [dev query: stats2.ts].
  - 380 of 1,704 notices produced no event. Most are Section 337 or admin notices, correctly skipped. AD/CVD-relevant ones were skipped too [dev query: q4.ts]:
    - "Fresh Tomatoes From Mexico; Determination" (ITC, 2026-07-23)
    - "Quartz Surface Products" (ITC, 2026-05-21)
    - three "Rescission of Antidumping and Countervailing Duty Administrative Reviews" lists
    - four "Advance Notification of Sunset Review" lists. These are deliberate: no event type is defined for them ([notices.ts:275-280](libs/adcvd/notices.ts)).
    - correction notices (C1-…), dropped because `eventOf` returns "correction" ([parse.ts:90](libs/adcvd/parse.ts)).
- **Ended-case history:** dev holds only 17 ended cases, because the registry starts from notices since November 2025. "history" flags (cases ended in the past 365 days, [match.ts:42](libs/adcvd/match.ts)) work only if the revocation was read [dev query: stats.ts].
- **One list gap was logged:** the 2026-09 month error says "Check 2026-17809: 2 case numbers in this list weren't read as rows" [dev query: stats2.ts, adcvd_months].

### Inferences
- Status quality depends on title regexes and FR docket tagging. Both have proven fragile: the out-of-order `newer` logic, the "listed after ended" reversal, and the 548/730-day heuristics are all patches over not having an official status feed. The user's memory says the ITA case page has no status, so every status is inferred. The ITC investigation dataset (ids.usitc.gov) and ITA's AD/CVD proceedings dashboard are the obvious ground-truth sources (see the case_status_ground_truth notes).
- Missing continuation dates point to the docket query (`conditions[docket_id]`) missing multi-case sunset continuation notices. Those notices often carry incomplete docket tags. This is a hypothesis: I did not query the FR API to confirm.

### Gaps
- I could not verify the "prod differs from dev on 349 cases' codes and ~17 statuses" claim (no prod access). PRE_DEPLOY.md confirms prod lacks the 2026-10-23 migration (fr_*/ita_*/hts_sources) and the post-fix copy, and that phantoms were not removed in prod ([PRE_DEPLOY.md:39-47, 164-170](PRE_DEPLOY.md)). Prod therefore runs the pre-ITA-merge codes and statuses.
- No independent truth set for status exists in the repo. The user's memory note says statuses "match ITA's dashboard for all 946 live cases" (2026-10-23), but no script or saved comparison output is committed. recompute.ts only prints counts to compare by hand ([recompute.ts:1-6](scripts/adcvd/recompute.ts)).

---

## 2. How scope HTS codes are derived, and measured accuracy

### Takeaway
Codes are merged from two text sources: the FR scope (regex, re-sorted by Sonnet when "may also" or exclusion language appears) and the ITA case page (both its HTS list and its scope text, regex plus Sonnet). Dead codes are mapped forward with a 5,239-entry successors map. The golden test shows 89/98 correct, 0 misses, 3 false "likely", and 6 "possible" noise. But the golden set is small and in-sample (52 imports, half of them China), and it does not score most of what the matcher emits. A whole-HTS sweep shows the real noise: for China, 2,722 of 21,528 HTS lines flag at least one case (1,393 "likely"), producing 6,873 case flags.

### Cited Findings
**Pipeline**
1. **FR scope regex.** `scopeOf` finds "Scope of …" headings and reads up to "dispositive", or to the next heading, or 12,000 characters. It keeps regions that mention HTSUS and picks the one with the most codes ([parse.ts:301-324](libs/adcvd/parse.ts)). `splitScopeCodes` sorts by paragraph and sentence. In a paragraph that mentions any exclusion, every coded sentence that isn't a "subject merchandise" sentence counts as excluded ([parse.ts:267-296](libs/adcvd/parse.ts)). This is the known flaw that excluded R-32's own code ([memory: adcvd-renumbered-codes-plan]). The code regex requires `dddd.dd[.dddd|.dd[.dd]]` and drops chapters 98/99 ([parse.ts:235-244](libs/adcvd/parse.ts)).
2. **Which notice supplies the scope.** Monthly reading uses the newest notice with a scope ([notices.ts:255-272](libs/adcvd/notices.ts)). The scope step, for cases without codes, tries up to 8 docket notices ranked by title (Orders > Continuation > Final > Initiation > Sunset > Prelim) ([scope.ts:21-31, 73-81](libs/adcvd/scope.ts)). Next it tries a sibling case's codes ([scope.ts:83-87](libs/adcvd/scope.ts)). Last, Opus reads 6 notices of up to 15,000 characters each ([scope.ts:22-24, 127-151](libs/adcvd/scope.ts)).
3. **Sonnet sort check.** Runs only when the regex found "also" or "excluded" codes ([scope.ts:33](libs/adcvd/scope.ts)). The prompt gets the scope text (up to 40,000 characters) plus the regex sort ([claude.ts:89-128](libs/adcvd/claude.ts)). If Sonnet returns empty main and empty also, the regex result stands ([scope.ts:58-61](libs/adcvd/scope.ts)).
4. **ITA case page** (`beta.trade.gov/adcvd?adcvdcase=`). Parsed from HTML without AI: the HTS grid plus the scope-text div. The scope text is sorted by the same regex, then Sonnet if it has also/excluded codes. Pages are refreshed every 30 days for live cases, 60 per cron run ([ita.ts:20-24, 48-80, 84-123](libs/adcvd/ita.ts); [process.ts:225](libs/adcvd/process.ts)). Dev: 958 of 969 fetched; `ita_method` for live cases is sonnet 422, regex 388, null 142 [dev query: stats.ts].
5. **Merge** (`mergeCodes`):
   - FR codes are kept even when dead. ITA codes are kept only if they exist in the current HTS. The ITA HTS list goes into "also".
   - A 10-digit code ending in 00 that exists only as an 8-digit line becomes that 8-digit line.
   - When one source lists a code as covered and another as excluded, covered wins.
   - Dead codes map through successors.json: "one" means renumbered in place; "split" goes to `hts_successors`, matched as possible. On an 8-digit line the case already lists, split candidates count only as "also" ([codes.ts:48-127](libs/adcvd/codes.ts)).
   - successors.json has 5,239 entries (2,591 "one", 2,648 "split"). Its snapshots are 2002–2022 plus 2025-14 … 2026-21. **The 2023 and 2024 HTS editions are missing**, though the user's memory plan said to add them [successors.json meta via python; memory: adcvd-renumbered-codes-plan].
6. **ITC petition codes.** For investigations without a Commerce scope, the codes from the ITC notice go into `fr_also`, so they match as "possible" only ([checks.ts:88-95](libs/adcvd/checks.ts)).

**Provenance of live-case codes** [dev query: stats.ts]
- Code-source pairs: fr 14,664; ita-scope 10,962; ita-list 11,885; renumbered 3,207; itc-petition 16.
- Per code: both FR and ITA 11,054; FR only 3,626; ITA only 1,100; renumbered only 938.
- 358 live cases carry 1,926 outdated codes. 52 live cases have split successors.
- `hts_main` code lengths: 10-digit 10,325; 8-digit 346; 6-digit 50; 4-digit 1 (`0702`, tomatoes).
- 1,893 distinct main codes and 978 distinct also codes.
- Problems by type: "ITA lists N current codes the FR scope doesn't": 218 cases. "N scope codes aren't in the current HTS … split": 203. "… map to one code": 103. "… with no replacement found": 52.

**Concrete parse defects**
- A-428-820 (small seamless pipe, Germany). The FR notice prints "7304.3900.16" and "7304.3900.20", and the regex stored `390016` and `390020` as 6-digit main codes. These are junk (chapter 39), but harmless because no HTS line starts with 3900. ITA's scope supplied the right codes, 7304390016 and 7304390020 [dev query: q3.ts]. The case shows both the regex's fragility and the value of the ITA merge.
- A-570-967 / C-570-968 (aluminum extrusions, China):
  - 192 main codes, including `94032000` (all "other metal furniture"), from both FR and ITA [dev query: q3.ts].
  - The scope really does list those downstream codes as "currently classifiable" [dev query: q8.ts]. So any metal-furniture import from China is a "likely" aluminum-extrusions flag. That is correct to the text and wrong for most products.
  - The real "may also" sentence uses "may be classifiable under the following additional Chapter 76 subheadings: 7610.10 …". The regex catches it, and 6-digit also codes result (`761010` …) [dev query: q8.ts].
- A-570-024 (PET resin, China): main includes `39076900` (the whole 3907.69 "Other" 8-digit line). This drives golden T7's false "likely" for low-viscosity PET [dev query: q3.ts; golden_all.txt].
- 50 six-digit main codes, e.g., A-570-894 tissue paper `480230`, `482390`; uncoated paper `480255`; magnesia bricks `681599` [dev query: noise.ts]. Each one makes every 10-digit line under that subheading "likely" for the country.

**Golden test** (`npm run adcvd:golden -- --all`, 2026-10-26, full output in scratchpad `golden_all.txt`)
- "52 imports, 98 checks: correct 89 · missed 0 · false 'likely' 3 · weaker 0 · 'possible' noise 6. Flags on cases not in the expectations: 33."
- False "likely":
  - T7 3907690050 CN: A-570-024 and C-570-025 (PET resin) for PET below the scope's IV floor.
  - T38: A-570-970 (multilayered wood flooring) on plain plywood 4412.33.0670, which MLWF's own scope lists.
- Noise:
  - T12/T13: steel racks / boltless shelving cross-flags.
  - T26 2903441020 CN: HFC-143a flags R-125 cases via `same_subheading`.
  - T35 8541430080 CN: thin-film modules flag the CSPV cases via `same_subheading`.
- Unscored extras: T12 (9403200075 CN) also flags 10 other cases, including aluminum extrusions A-570-967 and C-570-968 as **likely**, plus metal lockers, file cabinets, tool chests and ironing tables as possible. T48 also flags C-570-027 as likely [golden_all.txt].
- Set composition: 26 of 52 imports are China, 8 India, 4 Vietnam. Expectations: 52 likely, 30 none, 15 flag, 1 any. 7 imports have no expected case [python over golden.json].
- In-sample history: per the user's memory, the set was written while the fixes were built. "Today" scored 77 ok / 12 missed / 4 false; after the fixes, 88–89 ok / 0 missed [memory: adcvd-renumbered-codes-plan]. The fixes were tuned on the same set that measures them.

**Whole-HTS noise sweep** (real `matchCases` over all 969 dev cases × 21,528 current HTS lines, history level excluded) [dev query: noise.ts]

| Origin | Lines flagged | With a "likely" | "Possible" only | Case flags | Top "possible" reasons |
|---|---|---|---|---|---|
| CN | 2,722 | 1,393 | 1,329 | 6,873 | same_subheading 2,151; also_listed 1,384; renumbered 291; listed_renumbered 127 |
| IN | 893 | 423 | 470 | 1,886 | also_listed 559; same_subheading 461 |
| KR | 717 | 405 | 312 | 1,583 | |
| TW | 669 | 325 | 344 | 936 | |
| VN | 632 | 296 | 336 | 1,086 | includes third_country+listed 34 |
| ID | 468 | 294 | 174 | 834 | |
| MX | 428 | 218 | 210 | 622 | |
| TH | 364 | 111 | 253 | 544 | third_country+listed 46 |

- The single worst lines flag 13 cases at once: 7326908688, 9403200011 and 9403200016 for CN. For KR, 7225990090 flags 11.

**Independent check not done:** the broker review sheet (`adcvd-review/review-2026-10-23.csv`, 220 rows: ita 60 / likely 60 / possible 60 / near_miss 40) exists, but its answer columns are blank. There is no externally judged precision or recall [adcvd-review/*.csv; review-sample.ts:1-20].

### Inferences
- Measured on its own terms, the code-matching core has few misses. The bigger accuracy problem is precision:
  - "likely" rests on code plus country plus live status alone. Broad scopes (aluminum extrusions' downstream codes, whole 8-digit or 6-digit lines, basket "Other" lines) make "likely" mean "a code the scope names", not "probably in scope".
  - About half of China's flagged lines are possible-only, and most of those come from the `same_subheading` fallback. That level of noise will train users to ignore flags.
- The golden harness measures recall well but under-measures precision: 33 unscored extra flags, and none of the 6,873 sweep flags graded. An out-of-sample, broker-graded set (the sheet already built) is the missing measurement.

### Gaps
- There is no ground truth for the ~1,100 ITA-only codes. They are probably good (ITA corrects FR typos and HS renumbering), but the ita group in the broker sheet is unanswered.
- I don't know how often FR scope text exceeds the 40,000-character region or the 12,000-character `storedScope` cap ([parse.ts:248](libs/adcvd/parse.ts)), losing codes in the middle. Not measured.

---

## 3. AI usage: models, prompt sizes, costs, and what could be deterministic or improved

### Takeaway
Total AD/CVD AI spend in dev is $14.36 across 3,752 calls. Of that, 78% is Sonnet sorting scope codes ($7.35 FR checks + $3.96 ITA sorts), and 38% of the FR-check spend ($2.80) went to repeated calls on the same cases. Steady-state monthly cost is under $1–2. AI is used where it adds little (re-sorting code lists that are mostly regex-solvable). It is not used where it would add accuracy: matching the product description or exporter to scope language and exclusions, and validating extracted rates.

### Cited Findings
- **Models** ([claude.ts:11-16](libs/adcvd/claude.ts)): summary → `claude-haiku-5-5`; scope check and ITC link → `claude-sonnet-5-5`; history read → `claude-opus-5-5`. All calls use structured JSON schemas through `callJson` with `effort: low` (history: medium) ([claude.ts:74-190](libs/adcvd/claude.ts)).

**Measured spend by step** (ai_usage, pipeline=adcvd, dev) [dev query: stats2.ts]

| Step | Model | Calls | Total | Per call | Avg tokens in / out | Distinct refs |
|---|---|---|---|---|---|---|
| scope_check | Sonnet | 808 | $7.349 | $0.0091 | 3,925 / 125 | 525 cases |
| ita_scope | Sonnet | 423 | $3.960 | $0.0094 | 3,976 / 141 | 423 |
| history | Opus | 21 | $0.911 | $0.0434 | 10,334 / 103 | 14 cases |
| summary | Haiku | 1,279 | $0.885 | $0.0007 | 6,062 / 168 | |
| companies | Haiku | 700 | $0.726 | $0.0010 | 7,131 / 646 | |
| rates | Haiku | 484 | $0.420 | $0.0009 | 7,199 / 299 | |
| link | Sonnet | 37 | $0.108 | $0.0029 | 924 / 109 | |
| **Total** | | **3,752** | **$14.359** | | | |

- **When the money was spent:**
  - 2026-10-17 backfill: scope_check $7.175, history $0.911, summary $0.881, rates $0.420.
  - 2026-10-18 companies: $0.726.
  - 2026-10-23 ITA sort: $3.960 [dev query: stats2.ts].
  - These were one-off backfills. The user's memory note records the Nov 2025–Oct 2026 backfill at $9.07, which matches the 10-17 rows.
- **Redundant scope checks:**
  - 480 cases were checked once. Others were checked many times: A-580-911 thermal paper 25×, A-489-844 aluminum foil 22×, A-351-856 aluminum foil 21×, A-523-815 aluminum foil 21×, A-570-176 20×, A-489-853, C-489-854 and A-570-154 18× each.
  - Spend beyond the first call per case: $2.803 of $7.349 [dev query: q7.ts].
  - Likely cause (a hypothesis I did not reproduce): two code paths overwrite each other. Monthly `applyScope` resets `scope_method` to "regex" whenever it reads a newer notice with a scope ([notices.ts:255-272](libs/adcvd/notices.ts)). `needsCheck` then re-queues Sonnet ([scope.ts:33, 157-175](libs/adcvd/scope.ts)). Each month of the backfill re-triggered it, and the same cases appear under 2–4 `for_month` budgets [dev query: q7.ts].
- **Opus history:** $0.011–$0.181 per case (A-570-170 $0.181; C-570-171 $0.156; A-201-820 $0.133). It produced 3 live cases' codes (`scope_method=opus`) [dev query: stats.ts, q5.ts]. One of those results is the 4-digit `0702` for tomatoes.
- **Budget attribution:**
  - Cron scope retries and ITA sorting are charged to the *current* month's budget (`budgetTracker(db, thisMonth)`, [process.ts:251, 256](libs/adcvd/process.ts)). So 2026-10 shows $9.684 of AI spend against a $20 monthly budget [dev query: stats2.ts settings].
  - Summaries for the current month's notices pause once that shared budget is reached ([summaries.ts](libs/adcvd/summaries.ts) `budget.reached`; [process.ts:174](libs/adcvd/process.ts)). A big ITA re-sort can therefore silently stop that month's notice summaries and rate extraction.
- **Steady state:** ~150–170 ITA/ITC notices per month ([dev adcvd_months], e.g., 2026-08: 146; 2026-07: 169). At $0.0007–$0.001 per Haiku summary that is about $0.15/month. The remainder is Sonnet sorts for new or changed scopes (~$0.009 each) and rare Opus calls. Per-month backfill cost per adcvd_months ranges from $0.02 (2025-11) to $1.17 (2026-09) [dev query: stats2.ts].
- **Truncation risks in prompts:**
  - Summaries and rates cut notice text at 60,000 characters ([claude.ts:19](libs/adcvd/claude.ts)). Company rate tables for big China cases sit in appendices.
  - Sonnet sees at most 40,000 characters of scope text ([claude.ts:121](libs/adcvd/claude.ts)), and the stored scope is capped at 12,000 characters (head and tail) ([parse.ts:248](libs/adcvd/parse.ts)). The Sonnet check runs on `c.scope_text`, the capped version ([scope.ts:50-55](libs/adcvd/scope.ts)). A long scope's middle codes are therefore invisible to the check.
- **Company rates quality:**
  - 3,520 company rows over 766 cases; 1,145 rows above 100%; 19 marked excluded. Rows are dated back to 1994 (as_of years 1994–2026; 1,662 rows from 2026) [dev query: stats2.ts, q5.ts].
  - Names have no canonical identity. Light normalization already collapses 4 pairs ("Inox India Limited | Inox India Ltd", "Alpha Marine | Alpha Marine Limited") [dev query: q5.ts].
  - Case-level `rates` have `all_others` null for 211 of 843 orders that have rates [dev query: q5.ts]. A review's final results cover only the companies reviewed, yet the newest notice replaces the case's range ([summaries.ts](libs/adcvd/summaries.ts) "The newest rates become the case's").

### Inferences
- **Steps that could be deterministic or use a better source:**
  1. The FR scope-sort check. Most of the $7.35 is redundant: 38% repeats, plus cases where Sonnet returns the regex result unchanged. Fixing the regex's paragraph-level exclusion rule, memoizing by `(scope_doc, hash(scope_text))`, and never re-checking an unchanged text would cut it to near zero.
  2. ITA scope sorting. The ITA HTS grid is already structured. Many ITA scopes are the same text as the FR scope, so the FR sort could be reused when the texts match.
  3. Opus history. A deterministic "find the order notice" lookup via ITA/FR (order notices always restate the scope) covers most of these. Opus produced only 3 live cases' codes, one of them a 4-digit heading.
  4. Rates and companies. CBP's ADCVD case reference data, the source of truth for deposit rates, needs an ACE login per the user's memory. ITA publishes final results in structured tables in the decision memos and the notice. A table parser for the standard "Exporter/Producer | Weighted-average dumping margin (percent)" layout would be cheaper and auditable. Haiku could stay as a fallback.
- **Where AI is missing and would add accuracy:**
  1. Product-to-scope reasoning: using the import's description, and the user's product name when the Tracker has one, to tell in-scope from excluded products under the same code. Examples: low-IV PET, thin-film modules, HFC-143a vs R-125, plywood vs MLWF.
  2. Exclusion-aware matching: scope exclusions are product descriptions, not codes, and are currently ignored.
  3. Company and exporter matching: the import's manufacturer is never used.
  4. Validation of extracted rates against the notice tables.
  The user's memory records that description-only triggering was too noisy (14% false flags at 80% recall), so AI belongs in re-ranking and explaining code-triggered candidates, not in triggering.

### Gaps
- The per-token prices behind `cost_usd` live in `libs/hts-revision-diff/claude` (callJson), which I did not open. I report measured per-call costs instead.
- How many notices exceed 60,000 characters: not measured, since it would need fetching texts from GovInfo.

---

## 4. How match.ts decides likely / possible / history, and its blind spots

### Takeaway
Matching takes only (HTS code, country). "Likely" means the import is under a current main code, or under a same-8-digit replacement of a dead main code, from the case's own country, and the case is live. Everything else that touches the code is "possible". History is the same match on a case that ended in the past 365 days. The matcher never sees the product description, the manufacturer/exporter, entry dates, scope rulings or product exclusions. It ignores whether ITA knows the case, and it matches 6-digit codes and whole-subheading fallbacks.

### Cited Findings
**Decision order** ([match.ts:52-92](libs/adcvd/match.ts))
1. Import codes shorter than 6 digits are rejected.
2. Country: the case's own country, or one of its `third_countries`.
3. Status: ended cases more than 365 days old are dropped. Statuses other than live or "unknown" are dropped. "Unknown" is matchable (line 62).
4. `listed`: a current `hts_main` code that is a prefix of the import code. For an 8-digit import, a 10-digit scope code under it also counts ([match.ts:48](libs/adcvd/match.ts)).
5. `replaced`: a split successor of a dead main code. It ranks first when it is on the same 8-digit line (lines 70-74).
6. An excluded code that names the import returns null, unless the import is listed or replaced (line 76).
7. `alsoListed`: a current `hts_also` code (line 77).
8. `renumbered`: any `hts_outdated` code sharing 8 digits (or 6, for shorter codes) (line 80).
9. `subheading`: any current main code of 6+ digits sharing the first 6 digits (line 81).
10. Level: "likely" only for listed, or same-line replaced, on the direct country and a live case. Third-country matches are always "possible" (lines 89-90).

- **Petitions:** unlinked ITC events match on country plus a code with the same 6 digits ([match.ts:98-101](libs/adcvd/match.ts)).
- **Grouping:** the API groups AD and CVD matches by normalized product + country + third-country flag ([app/api/adcvd/match/route.ts](app/api/adcvd/match/route.ts), the `groups` map).
- **Signed-out summary:** the count includes "possible" flags (`cases: live.flatMap(f => f.cases).length`), so the "may apply" teaser fires on possible noise as well ([route.ts](app/api/adcvd/match/route.ts), the `summary` construction).
- **Public HTS pages** use `hts_main` without removing `hts_outdated` codes, so dead codes can still name pages ([public.ts:12-55](libs/adcvd/public.ts)).

**Blind spots, with evidence**
- **Code-only matching:** these false "likely" flags are code-correct and product-wrong: golden T7 (PET), T38 (MLWF lists plywood 4412.33.0670), aluminum extrusions on all metal furniture ([golden_all.txt]; [dev query: q8.ts]).
- **6-digit fallback** (`same_subheading`): the largest source of "possible" (CN 2,151 flags). It produces T26 and T35 noise [dev query: noise.ts; golden_all.txt].
- **6-digit and 8-digit main codes:** 50 six-digit and 346 eight-digit main codes in live cases. Each makes every child line "likely" [dev query: stats.ts].
- **Excluded codes:** honored only as whole codes. 49 live cases carry excluded codes [dev query: stats.ts]. Exclusions written as product descriptions, which is most of them, never reach matching.
- **Third countries and circumvention:**
  - Only 9 cases have `third_countries`: solar CN→KH/MY/TH/VN; aluminum foil CN→KR/TH; A-570-095/C-570-096 →KH/KR/VN; A-570-112/C-570-113 →TH/VN; A-570-040 →CO [dev query: stats.ts].
  - Sources are affirmative circumvention titles and CBP third-country case numbers. Countries are parsed from titles with fragile patterns like "with respect to|completed in|…" ([parse.ts:507-517](libs/adcvd/parse.ts)).
  - Pending inquiries (not yet affirmative) and certification regimes are not modeled. Third-country hits are always "possible", even when CBP has a third-country case number.
- **Companies:** companies are shown but never used to gate or adjust a flag. An excluded producer's goods still flag "likely" ([route.ts](app/api/adcvd/match/route.ts) attaches `companies`; `matchCase` takes no company).
- **Dates:** no entry-date logic. The "history" window is 365 days from `ended_on`, which is unreliable for 1 ended case with no date [dev query: stats.ts]. Merchandise entered before revocation is still liable.
- **Status "unknown"** is matchable. There are 0 such cases today, but CBP-created cases start "unknown" ([cbp.ts](libs/adcvd/cbp.ts) row insert) and would match until history fills.
- **Phantom cases** match, because `ita_found=false` is not used (A-570-957, A-533-849; see Q1).

### Inferences
- The level semantics are honest ("never more than likely"), but "likely" is over-assigned for broad or downstream scopes. Possible ways to tighten it:
  - a per-code specificity score (10-digit, named product line vs. a basket "Other" or a 6/8-digit heading);
  - a per-case "breadth" flag (the scope lists more than N chapters, as aluminum extrusions does);
  - description-based re-ranking. The HTS line description is already available (`htsLines`, [hts-lines.ts](libs/adcvd/hts-lines.ts)).
- Dropping or demoting `same_subheading` to a hidden "near" level would remove the largest noise source. Its recall value should be measured on the broker sheet's `near_miss` group first.

### Gaps
- I can't size the false-negative risk from codes missing in both FR and ITA. The golden set shows 0 misses on 98 checks, but it was built on known cases, and the near_miss sample is unscored.

---

## 5. Operational fragility

### Takeaway
The pipeline is one hourly Vercel function with a 300-second limit. It works through a single serialized 1 request/s FR/GovInfo queue, then CBP, scope retries, and 60 ITA pages with no shared time accounting below the step level. Several critical correctness steps run only by hand: history recompute, phantom removal, rates backfill, copy-to-prod, golden. Prod is behind dev on schema and data.

### Cited Findings
- **Cron:** `/api/cron/adcvd` runs at :08 every hour ([vercel.json](vercel.json)). `maxDuration=300`, and the run deadline is now + 260 s ([route.ts:9, 18](app/api/cron/adcvd/route.ts)). In `runNew`, the order is:
  1. a catch-up of last month on days 1–3 (deadline −90 s);
  2. this month (deadline −60 s);
  3. CBP;
  4. a scope retry of 3 cases, if more than 20 s remain;
  5. ITA, 60 pages at 1 s minimum each, if more than 45 s remain ([process.ts:221-268](libs/adcvd/process.ts)).
  - `refreshItaPages` checks the deadline only between pages. Its final `checkCases` runs unbounded and loads the whole HTS (`getHtsElementsServer`) plus about 3–5 queries per case ([ita.ts:100-122](libs/adcvd/ita.ts); [checks.ts:72-116](libs/adcvd/checks.ts)).
- **Prod timeout history:** the 2026-10-26 commit 40eb0118 says "The hourly /api/cron/adcvd run was timing out at 300s: a throttled or blocked Federal Register request backed off for up to ~10 minutes without looking at the run's deadline". It added deadline-aware backoff, GovInfo first, and a 1-hour block memory in `adcvd_settings.fr_blocked` ([git show 40eb0118]; [fr.ts:29-112](libs/adcvd/fr.ts)). PRE_DEPLOY lists the `fr_blocked` column as not yet applied in prod or dev ([PRE_DEPLOY.md:42-44](PRE_DEPLOY.md)). The column does exist in dev (`fr_blocked: {}`) [dev query: stats2.ts].
- **FR blocking:** 4 parallel requests got the machine's IP blocked (403) on 2026-10-17. FR's site then served a 200 "Request Access" challenge ([memory: adcvd-matching-plan]; detection regex in [fr.ts:74](libs/adcvd/fr.ts)). After two gated answers, all FR API calls are skipped for an hour ([fr.ts:39, 96-100](libs/adcvd/fr.ts)). During that hour, `confirmNew` trusts new case numbers, the fail-open phantom risk ([notices.ts:334-335](libs/adcvd/notices.ts)), and the scope step stops ([scope.ts:191-193](libs/adcvd/scope.ts)).
- **Rate-limit scope:** the queue (`queue`, `last`) is module-level per serverless instance ([fr.ts:20-21](libs/adcvd/fr.ts)). Separate invocations do not share it, e.g., the cron overlapping a manual `/api/adcvd/process` run or the tariff-updates fulltext fetcher, which also touches FR ([git show 40eb0118 --stat]: libs/tariff-updates/fulltext.ts). ITA fetches use a separate 1 s gap with no backoff and no block detection ([ita.ts:57-64](libs/adcvd/ita.ts)).
- **Notices marked read on error:** an exception other than out-of-time still sets `adcvd_at`, so a transient failure loses the notice until someone clicks "Read again" ([notices.ts:506-512](libs/adcvd/notices.ts)). The month catch-up on days 1–3 re-reads the previous month once ([process.ts:217-245](libs/adcvd/process.ts)).
- **Summaries marked done on error:** `summarized_at` is set on failure, and that notice's rates and companies are lost ([summaries.ts](libs/adcvd/summaries.ts) catch branch). 17 events are unsummarized in dev [dev query: stats2.ts].
- **CBP feed:** holds only the latest few days, so cron downtime loses third-country case numbers and new-case detection permanently ([cbp.ts:12](libs/adcvd/cbp.ts)). The dev cron last ran 2026-10-18 (`last_cron_at`) [dev query: stats2.ts settings].
- **Hand-run scripts:** `adcvd:month`, `backfill`, `recompute` (status from history), `rates`, `companies`, `ita`, `phantoms`, `copy-to-prod`, `golden`, `review-sample` / `review-score` ([package.json:38-50](package.json)). History refills (`fillHistory`) are not part of the cron, except for new CBP cases. Status drift from a missed revocation or continuation is fixed only by a manual recompute.
- **Dev vs prod:**
  - Prod got a one-time copy on 2026-10-21 (976 cases, 3,683 events) ([PRE_DEPLOY.md:179-181](PRE_DEPLOY.md)).
  - The 2026-10-23 schema, ITA codes, merged codes, status fixes and phantom removal are still pending for prod, with an unresolved conflict: "step 3 says never to run adcvd:copy-to-prod again after launch" ([PRE_DEPLOY.md:45-47, 164-170](PRE_DEPLOY.md)).
  - The user's memory and git log show the fixes were "BUILT in dev 2026-10-23 (uncommitted)", then committed in e5bd7ce5 on 2026-10-25 [git log; memory].
  - Prod processes new notices hourly with the deployed (older) code. Dev's cron is idle, so the two datasets will keep diverging.
- **Tests:** `testing/adcvd-parse.test.ts` and `testing/adcvd-match.test.ts` exist. The golden runner is the regression gate (`--strict`), and it is not wired into CI as far as the repo shows (PRE_DEPLOY instructs running it by hand) ([golden.ts:6-9](scripts/adcvd/golden.ts); [PRE_DEPLOY.md:41](PRE_DEPLOY.md)).

### Inferences
- A sustained FR block or a cron outage degrades data silently. There is a "cron stopped" email (`stale_alerted_at`), but no alert on data-quality regressions: new phantoms, rising `same_subheading` counts, unsummarized events.
- Two databases fed by two code versions with one-way copying is the root of the dev/prod divergence. A single production pipeline with dev as a read replica or snapshot would remove it.

### Gaps
- The real prod cron run times and error rates (Vercel logs, prod `last_cron`) are not accessible from here.

---

## 6. Ranked biggest accuracy risks and cost drivers

### Takeaway
The worst accuracy problem is precision. Code-only "likely" flags on broad or downstream scopes, plus the 6-digit `same_subheading` fallback, mean about 12.6% of all HTS lines flag something for China, and many lines flag 10+ cases. Next come stale/unsynced prod data, phantom cases, inferred statuses and dates, and unvalidated rates. Cost is small: about $14 lifetime in dev. It is dominated by Sonnet scope sorting, of which about 38% was repeat calls.

### Cited Findings
**Accuracy risks (ranked by user impact × likelihood)**
1. **Over-broad "likely" from code-only matching.**
   - CN: 1,393 lines carry a likely flag and 6,873 total case flags.
   - Aluminum extrusions makes all of 9403.20 "likely".
   - 50 six-digit and 346 eight-digit main codes.
   - Golden: 3 false likely and 33 unscored extra flags [noise.ts; q3/q8; golden_all.txt].
2. **"Possible" noise from `same_subheading` and also-lists:** CN 2,151 + 1,384 possible flags. Golden T26 and T35 [noise.ts; golden_all.txt; [match.ts:81](libs/adcvd/match.ts)].
3. **Prod runs older codes and statuses than dev:** the 2026-10-23 migration and copy are pending, prod phantoms are not removed, and the copy-after-launch conflict is unresolved ([PRE_DEPLOY.md:39-47, 164-170](PRE_DEPLOY.md)). The 349-code / 17-status figures are not verified here.
4. **Phantom cases still matchable:** A-570-957 and A-533-849 in dev. The gate fails open on FR outages ([notices.ts:335](libs/adcvd/notices.ts)), and the matcher ignores `ita_found` ([match.ts:52-62](libs/adcvd/match.ts)) [q3.ts].
5. **Inferred status and dates:**
   - 59 orders have stale continuation dates, giving wrong sunset estimates.
   - 20 investigations are more than 365 days old (float glass MY since 2025-01-08).
   - ITC determinations and corrections were skipped (tomatoes MX ITC determination 2026-07-23).
   - The 548/730-day heuristics ([checks.ts:34-39](libs/adcvd/checks.ts)) [q4–q6].
6. **Dead or renumbered codes:** 1,926 outdated codes on 358 live cases. The successors map lacks the 2023/2024 HTS editions. 52 cases have split successors, matched as possible [stats.ts; successors.json].
7. **Rates and companies:** Haiku-extracted with no validation. `all_others` is null on 211 orders. The newest review replaces the case range. 60,000-character truncation. No company identity. 1,145 of 3,520 rows above 100% are unverified [q5.ts; stats2.ts; [claude.ts:19](libs/adcvd/claude.ts)].
8. **Circumvention coverage is thin:** 9 cases with third countries, title-regex extraction, always "possible" [stats.ts; [parse.ts:507-517](libs/adcvd/parse.ts)].
9. **Regex scope parsing:** paragraph-level exclusions; typos like "7304.3900.16" → `390016`; the 12,000-character stored scope cap feeding the Sonnet check; A-122-855 never scoped [q3.ts; stats.ts; [parse.ts:248, 259-296](libs/adcvd/parse.ts)].
10. **No independent accuracy measurement:** the broker sheet of 220 rows is unanswered. The golden set has 52 imports, is in-sample, and is 50% China [adcvd-review/; golden.json].

**Cost drivers (dev, lifetime $14.36)** [stats2.ts; q7.ts]
1. Sonnet FR scope_check, $7.35 (51%). $2.80 of it was repeat calls on the same cases, up to 25× (A-580-911).
2. Sonnet ITA scope sort, $3.96 (28%). One-off. Charged to the current month's shared budget, which can pause that month's summaries ([process.ts:251-256](libs/adcvd/process.ts)).
3. Opus history, $0.91 for 14 cases ($0.04–$0.18 each). It yielded 3 live cases' codes.
4. Haiku summary + companies + rates, $2.03 combined, across 2,463 calls.
5. Non-AI cost: Vercel function time for an hourly 300-second job that mostly waits on 1-request-per-second queues. The user's memory notes that crons moved to hourly "to cut Vercel costs" (commit e5bd7ce5).

### Inferences
- Better accuracy will not come from more AI spend on sorting codes, where the regex is mostly right and checks are duplicated. It will come from:
  - official sources for status and codes (ITC IDS, the ITA dashboard and case pages, CBP messages);
  - a specificity-aware "likely" rule;
  - demoting the 6-digit fallback;
  - exclusion- and description-aware re-ranking, one targeted AI call per flagged import, cached per (code, case);
  - an out-of-sample, broker-graded evaluation.
- On cost, memoizing Sonnet checks by `(case, scope_doc, text hash)` and giving ITA/backfill work its own budget line removes waste and the budget-starvation risk. These are low-effort fixes.

### Gaps
- No prod spend, prod cron duration, or prod error data is available here.
- No user-facing metric exists for how often users see "possible" vs. "likely" on real tracked imports. Tracker imports were not queried.
