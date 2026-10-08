# Engine v2: progress log

Implementation of the design in [HowTariffsWork.md](../../HowTariffsWork.md), running alongside the legacy engine.
Branch: `feat/tariff-engine-v2`. Data reflects **2026 HTS Revision 10** (Apr 8 – Jun 30, 2026: Revisions 5 to 10).

## Status

| Area | State |
|---|---|
| Engine (types, snapshots, handlers, pipeline, validator) | Done |
| Legacy data migrated (106 headings, 59 lists) | Done, hand-reviewed |
| Tests: mechanics, real data, partial-value rates, Tariff Tracker | All passing |
| Full comparison, every HTS line × 14 countries | Done: 99.5% identical totals, every difference explained (before the legacy engine was removed) |
| Tariff Finder toggle + new results panel | Done, checked in the browser (desktop and phone width) |

## How to run

```bash
npm run tests              # all tests, including engine-v2 mechanics and real-data cases
npm run sync-revisions     # refresh HTS revision dates from USITC
```

## Trying it

Open the Tariff Finder with `?engine=v2`, e.g. `/duty-calculator?code=7326.90.86.88&country=CN&engine=v2`. In local development the toggle always shows.

- A **Classic / New engine (beta)** switch appears once a code and country are selected. Without the flag in production, nothing changes for users.
- The new panel has:
  - **Tariffs as of**: verified revisions, plus "Today" with a warning that later changes aren't entered
  - **Trade preference claimed**: only programs available for this code, country and date
  - **Summary**: total duty, effective rate, fees, landed cost
  - **Duties that apply**: every line with its value, rate and reason
  - **Questions that can change this result**: named questions plus heading confirmations
  - **Considered but not applied**: every candidate heading and why it didn't apply

Checked in the browser:

| Check | Result |
|---|---|
| 7326.90.86.88 from China | Classic and new engine both $7,790.00 duty, $17,837.14 landed |
| Confirming 9903.82.01 | Removes the 232 duty ($2,790.00) |
| "Today" | Shows the unverified-data warning and drops Section 122 (expired Jul 24) |
| 0711.90.30.00 from Germany | $800.00 (D1 fix) |
| 375px width | No horizontal overflow |

## Where things are

| Path | What |
|---|---|
| `tariffs/engine-v2/types.ts` | All record and result types |
| `tariffs/engine-v2/calculate.ts` | The pipeline (HowTariffsWork.md §12) |
| `tariffs/engine-v2/handlers.ts` | Condition, basis and rate handlers |
| `tariffs/engine-v2/snapshot.ts` | Resolving rules and lists for a date; code/country matching |
| `tariffs/engine-v2/validate.ts` | Data checks (§15) |
| `tariffs/engine-v2/versioning.ts` | `tariffVersions`, `codeListVersions` |
| `tariffs/engine-v2/revisions.ts` | HTS revision dates, verified revisions |
| `tariffs/engine-v2/data/` | Programs, headings, lists, inputs, columns, preferences, fees |
| `testing/engine-v2/` | Mechanics and real-data tests, HTS fixture loader (every USITC line with its base rates) |
| `components/TariffFinderPage.tsx` | Tariff Calculator |
| `components/duty-calculator/` | Calculator UI, `DutyEstimateEmbed` (explorer, classification pages), shared estimate helpers |
| `components/tariff-tracker/` | Tariff Tracker: catalog parsing, report, CSV/Excel export, app shell |

## Completed work

### 1. Engine core
- Everything in HowTariffsWork.md except `recordedAt` (audits) and a real fees-by-transport-mode input.
- Exception resolution settles over repeated rounds. Cycles that can't settle are broken in favor of the heading backed by an answer; otherwise both are switched off with a warning.
- A heading whose value basis needs an unanswered input (e.g. steel content %) is decided before exceptions, so it can't trigger or displace other headings. (This was a bug in my first pass, caught by a test.)

### 2. Data migration
The script converted every legacy record mechanically, then I reviewed each by hand. The two commits show the raw output and the hand edits separately:
- `0aa8815` raw migration output
- `4bfb917` hand edits

Mechanical conversion:
- `inclusions`/`exclusions` → `scope`; `inclusions.tariffs` → `scope.whenApplies`
- Code arrays → named lists, reusing your legacy export names (`steel16ciii`, `automobileParts33G`…) where they matched exactly, and unions of them where possible
- `general`/`special`/`other` → `rate` + `rateByColumn`
- `requiresReview` → a confirmation question per heading (`confirm("9903.xx.xx")`), which keeps the legacy default of "doesn't apply until confirmed"

A check confirmed every heading's lists contain exactly the legacy codes (0 mismatches).

Hand edits:
- **Base-rate thresholds moved from engine code into data.** The legacy `filterCountryTariffsFor15PercentExeption` and `filterCountryTariffsByAdValoremRate` became `baseRate` conditions on 9903.02.19/.20/.72/.73/.79/.80, 9903.94.40–.65, and 9903.82.07/.08/.10/.11/.14/.15.
- **"Replaces general duty" headings became `topUpTo`.** This affects 9903.82.07 (10%), 9903.82.10 and every 15% deal heading. The total is the same, but the base line is no longer hidden.
- **Dates added only where the heading text or name states them:**
  - Section 122 family: Feb 24 – Jul 24, 2026
  - 9903.03.02: in-transit window
  - 9903.91.01–.05, .11
  - 9903.88.69/.70
  - 9903.92.09
  - Autos: 9903.94.02–.04, .06, .31, .32
  - 9903.96.01
- **Named inputs replace confirmations where the fact is clear:**

  | Heading | Now asks for |
  |---|---|
  | 9903.03.02 | Loading date |
  | 9903.03.07 / .08 | USMCA claim (SPI S/S+) |
  | 9903.03.09 | CAFTA-DR claim (P/P+) + confirmation |
  | 9903.03.10 | Donation |
  | 9903.03.11 | Informational materials |

- **Names no longer contain dates** (e.g. "Section 122 Tariff (Expires July 24, 2026)" → "Section 122 Tariff").

### 3. Tests
- `testing/engine-v2/engine.test.ts`: 29 tests on synthetic rules, one capability each: dates, list versions, scope, conditions, top-ups, whenApplies, partial exceptions, cycles, interactions, columns, preferences, fees, validation.
- `testing/engine-v2/dual.test.ts`: 20 tests on real codes and base rates, run offline:
  - 9 cases where both engines must agree
  - 6 pinned known differences
  - 5 v2-only behaviors on real data (USMCA exemption, 122 expiry, and others)
- The 5 failing tests in `testing/tariffs.test.ts` fail on `master` too (see Issue L1).

### 4. Legacy vs v2 comparison
Full run: 23,193 HTS lines × 14 countries = **324,702 calculations**. **99.5% have identical total duty.** The 1,752 differences fall into 4 kinds (D2, D4, D6, D7) below. D1, D3 and D5 were fixed in the legacy calculator on Sep 30. See [COMPARISON.md](COMPARISON.md).

## Differences from the legacy engine

D1, D3 and D5 are resolved. D2, D4 and D6 remain in the legacy calculator by your decision (Sep 30): legacy fixes for them aren't wanted.

| # | Difference | Count | Cause |
|---|---|---|---|
| D1 | ~~EU/JP/KR goods: v2 higher~~ **Resolved Sep 30:** legacy now replaces the base duty per heading (`suppressesBaseDuty`) | 3,386 | Legacy's UI "below 15%" rule drops the base duty for **every** EU/JP/KR good with a base under 15%, even when no 15% deal heading applies (deal-exempt goods, 232 goods). Example: 0711.90.30 from Germany owes $0 in legacy and $800 (8% base) in v2. |
| D2 | Russia 232 steel: v2 lower | 1,743 | Legacy's `tariffIsActive` "visited" set treats 9903.82.14 as inactive the second time it's reached, so 9903.03.06 (the Section 122 exemption for 232 goods) doesn't activate and Section 122 is charged on top of 232. |
| D3 | ~~3913.10.00.00 CN: v2 lower~~ **Resolved:** legacy data fixed | 1 | Legacy data lists `3913.10.0000` (missing a dot) in 9903.88.69's exclusions. Substring matching never finds it; v2 matches on digits. |
| D4 | 6307.90.98.70 CN: v2 lower; **kept in legacy by decision** | 1 | 9903.91.04's text says it applies before January 1, 2026. Legacy still applies it at Rev 5. |
| D5 | ~~9401.69.60.31 CN: v2 lower~~ **Resolved:** legacy data fixed | 1 | Same as D3: `9401.69.6031` in 9903.88.15's exclusions. |
| D6 | 4015.12.10 CN (medical gloves): v2 lower; **kept in legacy** | 3 | Gloves were 50% under 31(f) in 2025 and 100% under 31(i) from Jan 1, 2026. v2 removes them from the 31(f) list on that date (a dated list version); legacy charges both 9903.91.05 and 9903.91.08. |
| D7 | 5 respirator/face-mask/EV-battery codes, CN: v2 lower at Rev 5 | 5 | 89 FR 76581 deleted items (1)–(4) (6307.90.98.42/.44/.50/.75, 8507.60.00.10) from 31(b) effective Jan 1, 2026; they moved to 31(h) and 31(g). v2's `china31b` has both versions. Legacy has no dates, so its 9903.91.01 list still includes them. |

Other intended differences that the comparison doesn't exercise (they only show up after the user answers questions):
- **9903.94.44** (EU auto parts, 33(r)): the legacy record says "<15%" and charges 15%, identical to .45. By the pairing pattern it's the "≥15%" heading at 0%, and v2 does that. See Q5.
- **9903.92.10** listed exception `9903.91.09`, which doesn't exist. v2 uses 9903.92.09 (the cranes exception). See Q7.

## Issues found

### Legacy code
- **L1. Five stale legacy tests.** `testing/tariffs.test.ts` expects a heading with a `"Section 232 Metal"` content requirement. None exists since the April 2026 data update moved 232 metals to full value. They fail on `master`. I haven't changed them.
- **L2. Visited-set bug in `tariffIsActive`.** Causes D2. **Won't fix in legacy (decision, Sep 30).** A heading reached twice in one traversal counts as inactive.
- **L3. Fixed Sep 30.** The "below 15%" rule is applied per country, not per heading. Causes D1 (`CountryTariff.tsx`, `calculateDutyEstimates`).
- **L4. Substring code matching.** `htsCode.includes(code)` misses codes with a missing dot (D3, D5).
- **L5. `findExceptions`** (unused) passes `htsCode` and `countryCode` in the wrong order in its recursive call.

### Legacy data
- **L6. Fixed Sep 30.** Codes with missing dots: `3913.10.0000` (9903.88.69), `9401.69.6031` (9903.88.15).
- **L7. 9903.03.01's `exceptions` contains HTS codes** `8471.50`, `8471.80`, `8473.30` (the semiconductor list). They have no effect in either engine; v2 dropped them. Were they meant as `excludeCodes`? See Q6.
- **L8. 27 exception cycles**, mostly among the 232 metals alternatives (e.g. 9903.82.04 ↔ .06, .08 ↔ .11 ↔ .12, .09 ↔ .13, 9903.94.01 ↔ .31). Both engines currently resolve them through the "needs confirmation" defaults. The validator lists them as warnings.
- **L9. Very broad "needs review" headings.** 9903.94.07, 9903.94.33, 9903.94.44/.45/.54/.55/.64/.65, 9903.74.09, 9903.74.10 and 9903.82.03 cover *all codes except a list*. So nearly every product from those countries gets their questions. The v2 panel groups them, but the scopes look broader than the notes intend. See Q9.
  - **Oct 4: 9903.94.07 and 9903.74.09 narrowed.** U.S. notes 33(p) and 38(j) (Rev 20) list no codes: they cover vehicle parts certified for U.S. production or repair, outside chapters 72, 73 and 76 and the 33(g) and 38(i) lists. Both now also exclude `notVehiclePartChapters` (`data/lists/vehicle-parts.ts`), the chapters that can't hold vehicle parts (food, apparel, toys and so on). That list is an engine judgment, not note text.
- **L10. The base-rate parser can't read some rates** (`$1.13/m3`, "less 0.020668¢/kg for each degree…"). Both engines count those as 0; v2 shows a warning.

### Engine v2
- **E1. HMF is always charged.** It should only apply to ocean shipments. This matches legacy for now; it needs a transport-mode input.
- **E2. Fixed Sep 30.** MPF FY2027 values ($34.58 min, $670.86 max, 0.3464% unchanged) added as a dated record from 2026-10-01 ([FR Doc. 2026-15530](https://www.federalregister.gov/documents/2026/07/31/2026-15530/customs-user-fees-to-be-adjusted-for-inflation-in-fiscal-year-2027)). The legacy calculator now picks the limits by date too (`getMpfLimits()` in `tariffs/tariff-calculations.ts`).
- **E3. Base rates come from the latest HTS revision.** The panel's revision dropdown dates the Chapter 99 rules only. Loading each revision's own base rates needs the revision's HTS file in Supabase storage.
- **E4. The legacy engine still runs** on the page when the new engine is shown. It's used for the Units field's visibility. It's cheap, but can be removed when the old engine is retired.

## Questions for you

1. **Done Sep 30: deal headings end Feb 24, 2026.** CBP's CSMS #67834313 made all IEEPA HTS numbers inactive from Feb 24, 2026, and CSMS #67844987 applies Section 122 with no country caps.
   - **v2:** 9903.02.19/.20, .72/.73, .79/.80 and the reciprocal exemptions .74–.78, .81 have `to: "2026-02-24"`. They still apply to earlier dates.
   - **Legacy:** those headings were removed (legacy only represents the current revision).
2. **Done Sep 30: EU/Japan wood is 15% including the base duty.** The proclamation caps the combined 232 + MFN duty at 15% for EU and Japan; the UK's 10% is a flat add-on.
   - **v2:** 9903.76.21/.22 use `topUpTo: 15`.
   - **Legacy:** they're marked `suppressesBaseDuty` and removed by the base-rate filter at or above 15%.
   - **Still open:** Korea's 9903.76.23 isn't confirmed.
3. **9903.88.69/.70 end date.** The heading text says "through November 29, 2025"; your legacy name says "Expires November 9, 2026". I used Nov 10, 2026 (i.e. through Nov 9). Correct?
4. **Answered Oct 2 (Rev 6):** note 16(e) makes .15 the Russia U.S.-content heading. **9903.82.14/.15.** The names said "base ≥10%" / "<10%", but the descriptions say note 16 subdivisions (c)(iii)–(v) vs (c)(iv),(vii),(viii),(e). I kept legacy's base-rate split. Is that the real distinction?
5. **Answered:** 9903.94.44 is 0% in every column. The legacy data was updated Sep 30, and v2 already had it.
6. **9903.03.01 exceptions** `8471.50`/`8471.80`/`8473.30`: meant to exclude semiconductors from Section 122?
7. **9903.92.10's exception.** The HTS text says 9903.91.09; I used 9903.92.09. OK?
8. **Done Sep 30:** FY2027 MPF values added to both calculators, switching on Oct 1 (see E2).
9. **Broad "needs review" headings (L9).** Should these be narrowed to specific lists? Partly answered (Oct 4): 9903.94.07 and 9903.74.09 have no list in their notes, so they now skip chapters that can't hold vehicle parts. The rest are still open.
10. **Stale legacy tests (L1).** Update them for the full-value 232 structure, or delete them?
11. **Answered (Oct 2): 9903.03.06 and "no metal" articles.** No. Note 2(aa)(v)(1) lists only "9903.82.02 and 9903.82.04–…", so 9903.82.01 (no metal) and 9903.82.03 (metal under 15% of the weight) don't trigger the exemption and pay Section 122. Corrected for all dates in Rev 11.
12. **Rolling this out.** Answered: don't make it the default for now.
13. **Answered (Sep 30), from USITC's archived Chapter 99 PDFs.** Note 31(b) first appears in 2024 HTS Rev 9 (not in Rev 8), effective for entries on or after Sep 27, 2024, with items (1)–(4) plus 348 subheadings. The items are present through 2025 Rev 32. They're gone in the 2026 Basic Edition, whose compiler's note says "Numbers (1) through (4) have been deleted. See 89 Fed. Reg. 76581". That's effective Jan 1, 2026, the date the 31(g)–(i) texts use. The 348 other codes are identical in every revision checked and match `china31b`. `china31b` now has two versions: 2024-09-27 (353 codes) and 2026-01-01 (348 codes).

## Sep 30: Section 301 China 2026 increases (both calculators)

- **9903.91.06** (31(g), 25%), **9903.91.07** (31(h), 50%, respirators and face masks) and **9903.91.08** (31(i), 100%, medical gloves) were added, all effective Jan 1, 2026.
  - Legacy: named lists `china31g`/`china31h`/`china31i` in `tariffs/lists.ts`; .06 un-commented in `china.ts`.
  - v2: the same list ids in `tariffs/engine-v2/data/lists/china-301.ts` (its first hand-written list file), plus the headings in `301-china.ts`.
- **v2's 31(f) list is now `china31f`** with two dated versions. Medical gloves (4015.12.10) leave it on Jan 1, 2026, when 31(i) takes over. Legacy is unchanged, so it charges both (D6).
- **`china31g` uses 8507.60.00**, the full 8-digit subheading as listed in the HTS (confirmed from the 2026 Basic Chapter 99 text). EV batteries (8507.60.00.10) move there from 31(b) on Jan 1, 2026, so there's no double charge now that `china31b` is versioned.
- **9903.91.04 stays in legacy** by decision, so Chinese face masks pay .04 (25%) + .07 (50%) there (D4). v2 ended .04 on Jan 1, 2026.

## Sep 30: Tariff Finder redesign (branch `feat/tariff-finder-redesign`)

- **The page now runs engine-v2 for everyone.** The Classic/New toggle and `TariffResultsV2` are gone. The legacy engine still powers the classification dashboard and the multi-country table.
- **New inputs:**
  - entry date (defaults to today, with a warning and a one-click "use the latest verified date" fix when the date isn't verified)
  - mode of transport (HMF on ocean only)
- **Two views:**
  - Detailed: figures, line-by-line statement, questions with the dollar impact of each answer, calculation basis, and headings checked but not applied
  - Simple: one total and a plain-language breakdown by program

  The view is remembered per device, and `?view=` overrides it.
- **Share links** carry `code, country, value, units, date, mode, pref`, plus `compare` (e.g. `compare=VN,DE`) and `view=compare`.
- **Country comparison:** up to 3 countries side by side.
  - The country field is multi-select, with chips inside the field; the first chip is the main country used by Detailed and Simple.
  - Code, value, date, transport and answers are shared across countries; each card can claim its own trade preference.
  - The lowest landed cost is highlighted, and the other cards show the difference.
  - Each card has × to remove its country and "View details" to make it the main one.
  - Answers and preferences reset only when the HTS code changes.
- **Engine additions:** `transportMode`, `FeeSchedule.modes`, `requiresQuantity`, and an MPF note for entries under $2,500 (informal-entry MPF isn't modeled).
- **Visual design:** design tokens are in `components/duty-calculator/theme.module.css`.
- **Speed:** about 0.07 ms per calculation; under 1 ms per keystroke including the per-question impact calculations.
- **Theme:** follows the site's `data-theme` (header toggle, or the OS setting until the user picks one), and falls back to the OS setting if the attribute is missing.
- **SEO:** metadata and FAQ JSON-LD no longer claim AD/CVD or GSP coverage. A new FAQ says AD/CVD isn't included.
- **Follow-up:** the explorer modal still uses the site's daisyUI styling.

## Sep 30: named lists for 9903.91.01–.04, and a list audit

- **9903.91.01–.04 now use `china31b`–`china31e`** (added by you in `lists/china-301.ts`), and the migrated stand-ins `9903.91.01`–`.04` were removed from `lists.generated.json`. Checked against the old lists:
  - c, d, e are identical
  - b is identical except for the 5 removed codes
  - no duplicates or odd-length codes
- **29 `TODO(list)` comments** mark headings still using a migrated stand-in list named after their heading (e.g. `"9903.88.03"`) instead of a U.S. note list:
  - 301 lists 20(a)–(s)
  - exclusions (vvv)/(www)
  - 9903.91.11
  - cranes
  - 9903.82.03's exclusions
  - 9903.85.67/.68
  - 122's 9903.03.03
  - 9903.94.31
  - wood
  - the ended EU exemption lists
- **8 more `TODO(list)` comments** mark headings that cover every code except an exclusion list, while their text points to a specific note subdivision (L9): 9903.94.33/.44/.45/.54/.55/.64/.65 and 9903.74.10. (9903.94.07 and 9903.74.09 were resolved Oct 4: their notes list no codes.)
- **The validator now warns** for every list whose id starts with `9903.`, so the stand-ins stay visible until they're replaced.
- **"All codes" is correct as-is** for the Section 122 family, the country deals, and 9903.82.03 ("except chapters 72, 73, 74 or 76").

## Sep 30 changes to the legacy calculator

Made alongside the v2 changes so both calculators agree:
- **Deal headings removed.** 9903.02.19/.20/.72/.73/.74–.81 are gone from `european-union.ts`, `japan.ts`, `south-korea.ts` and `argicultural.ts`, and from the 15% filter in `tariffs.ts`.
- **The country-wide "below 15%" rule is gone** (it caused D1). It was removed from `CountryTariff.tsx`, `Tariffs.tsx`, `TariffDashboardSection.tsx` and the `calculateDutyEstimates`/`calculateSummaryTotals`/`calculateAllTariffs` signatures.
- **Headings that replace the general duty now say so with `suppressesBaseDuty: true`:** 9903.94.41/.43/.45/.51/.53/.55/.61/.63/.65 and wood 9903.76.21/.22. `getTotalPercentTariffsSum` also uses that flag now, instead of a country check.
- **The 15% filter removes 9903.76.21/.22** when the base rate is 15% or more.
- **MPF limits are chosen by date** (`getMpfLimits()`).
- **Not checked in the browser:** the multi-country table (`Tariffs.tsx`, used by `SideBySideTariffs`). It's behind sign-in; it type-checks.

## Oct 8: 2026 Rev 1 verified, with no chapter 99 changes

- **Verified from Jan 16, 2026.** Rev 2's change record has no chapter 99 entries, and USITC's archived Rev 1 and Rev 2 chapter 99 PDFs are word-for-word identical (756 pages and 318,730 words each). No records were added; Rev 2's records hold. This was verified without a revision-checker comparison (decided by the user); the evidence is in `tariffs/revision-diffs/2026HTSRev1/PLAN.md`.

## Oct 8: 2026 Rev 2 backfilled: IEEPA India (branch `backfill/2026HTSRev2`)

- **Verified from Jan 30, 2026.** `VerifiedTariffRevisions` now starts with "2026HTSRev2". Plan: `tariffs/revision-diffs/2026HTSRev2/PLAN.md`.
- **New program `ieepa-india`** (authority IEEPA) in `data/headings/ieepa-india.ts`: India's 25% (9903.01.84) and its exemptions .85–.89 (U.S. note 2(z)).
  - **Dates:** from Aug 27, 2025 (the heading text) to Feb 7, 2026 (EO 14384, 91 FR 6501).
  - **9903.01.86** covers both parts of 2(v)(iii). The (b) particular articles need confirming, through `answerForListedCodes` (decided by the user).
- **IEEPA snapshot holds for Rev 2.** Every subchapter III heading row in USITC's Rev 2 and Rev 3 PDFs was compared. The only changes are the India termination notes and the new 9903.54.01, an Argentine beef quota that isn't modeled. The 7 skipped note differences are extraction noise; for example, the PDF's note 33(g) does list 9401.20.00.
- **Sweep:** 862 of 144,270 results changed, all Indian goods on Rev 2 dates; no verified date changed.

## Oct 8: Plainer tariff titles (branch `fix/tariff-titles`)

- **284 title changes** (the `name` shown on the Duty Breakdown and Possible Adjustments); codes, rates, dates and amounts are unchanged. Every change and its reason is in `title-changes.md` (review copy, not committed). The conventions are now in HowTariffsWork.md §Tariff.
- **12 titles were wrong**, among them:
  - 9903.03.02 said "or" where the exemption needs both conditions.
  - 9903.74.03 was labeled an exemption but charges the duty.
  - 9903.74.07 said "over 25 years" where the note says at least 25.
  - Three Russia metals headings had the same title.
- **Section 338 titles:** `duty()` in `338-canada.ts` now takes the title.
- **"Of" or "from", and names spelled out:** titles for one country's goods say "of" or "from", and United Kingdom, European Union and United States are spelled out. This is also done for the 6 trade-deal and civil-aircraft program names, and the aircraft program now lists Taiwan.
- **Descriptions fixed:**
  - 9903.94.44 said "less than 15 percent"; the HTS says "equal to or greater than".
  - 9903.76.01–.22 were "TODO"; they now carry the USITC heading text.

## Oct 8: Section 301 China exclusions need confirmation for described products (branch `fix/301-china-exclusions`)

- **Two kinds of exclusion in U.S. note 20(vvv).**
  - Parts (i)–(ii) list whole statistical numbers.
  - Parts (iii)–(iv) describe a product within a number, e.g. "Cable hooks of steel … with spring loaded closure gate (described in statistical reporting number 7326.90.8688)".
  - The engine applied 9903.88.69 to every code on its list, so all Chinese goods under the 120 described-product numbers lost their Section 301 duty.
- **New condition `answerForListedCodes`.** It asks `confirm:9903.88.69` only for codes on `china301ExclusionDescribedProducts20vvv` (140 numbers). Whole-number exclusions still apply without a question.
  - **Supporting change:** `ConditionHandler.inputs` takes an optional context, so the question shows only where it's needed.
- **9903.88.70 (20(www), solar wafer equipment):** all of its exclusions are described products, so it now uses `confirm()`.
- **Added the three missing exclusions:** 7009.10.00.00 (rear-view mirrors), 7326.90.86.88 (steel cable hooks) and 8544.42.20.00 (telecom conductors). Every revision from Rev 3 to Rev 20 lists them.
- **Dates documented:** USTR's extension notice, 90 FR 55232 (Dec 1, 2025), extends "the 178 current exclusions" from 12:01 a.m. EST Nov 30, 2025 "before 11:59 p.m. eastern daylight time on November 9, 2026". The heading text now matches: "through November 9, 2026".
- **Effect, a correction to verified data:** 351 results changed in the regression sweep, all Chinese goods on described-product codes. Unconfirmed, they pay Section 301 again; confirmed, it's $0 as before. The Rev 18 pinned case is updated with a comment.

## Oct 8: 2026 Rev 3 backfilled, with the IEEPA snapshot (branch `backfill/2026HTSRev3`)

Verified data now starts at 2026HTSRev3 (Feb 12, 2026). See `tariffs/revision-diffs/2026HTSRev3/PLAN.md`.
- **The Rev 4 change record needed no before-records.** It deleted de minimis and postal sentences, added Section 122 (already modeled) and marked the expired solar safeguard.
- **IEEPA, as in force Feb 12–23, 2026** (completeness bar). 106 headings in `data/headings/ieepa-2026.ts` and lists in `data/lists/ieepa-2026.ts`, all ending 2026-02-24 (EO 14389; CSMS # 67834313):
  - fentanyl duties on Mexico, Canada and China/HK, with their exemptions;
  - the reciprocal 10% baseline (China too: its 34% is suspended), its exemptions, the 64 country rates and 40% transshipment;
  - Brazil's 40% and its exemptions;
  - the Swiss and Liechtenstein deals.
  - All programs have authority IEEPA (for refunds).
- **Lists from CBP guidance**, since the notes have none: potash (CSMS # 64336037 and # 64335789, the same 9 subheadings) and Canadian energy (CSMS # 65054354, 413 codes).
- **New basis `usContentPortion`** (partial): 9903.01.34 spares the U.S. content when it is at least 20%.
- **9903.01.33** reuses `metalContentCovered`: steel and aluminum articles pay on the non-metal content; copper, autos, wood, MHDV and semiconductors are fully exempt.
- **EU/Japan/Korea deal records fixed for February:**
  - exceptions follow the Rev 3 text (Section 232 goods through 9903.01.33, not the post-April 9903.82 headings);
  - descriptions cite the right subdivisions;
  - 9903.02.78 moved to `ieepa-reciprocal`.
- **Interactions:** Canada/Mexico IEEPA drops for the old metals headings (notes 16 and 19) and for Section 232 wood; the semiconductor rule adds the deal headings named in 2(v)(xvi).
- **Correction to verified data:** 9903.88.15 no longer lists 8507.60.00. Note 20(s) never did; the batteries are in note 31.
- **Checks:**
  - invariant sweep: 2,515 codes × 15 countries (113,175 calculations), 0 problems;
  - every result from Feb 24 on unchanged: 113,175 compared, 0 differences.

## Oct 7: 2026 Rev 4 backfilled (branch `backfill/2026HTSRev4`)

The first backward step. Verified data now starts at 2026HTSRev4 (Feb 25, 2026). See `tariffs/revision-diffs/2026HTSRev4/PLAN.md`.

- **Old Section 232 metals headings until April 6, 2026** (PP 11021, Annex IV A.11), in `data/headings/232-metals-2025.ts` with lists in `data/lists/metals-2025.ts`:
  - steel 9903.81.87–.99, aluminum 9903.85.02–.15, .69, .70, copper 9903.78.01/.02;
  - many charged only the metal content: all of 16(n)/(u), 19(k)/(s) and 36(b), plus chapter 73 (steel) and chapter 76 (aluminum) goods under the others.
- **New handlers:**
  - `metalContentInChapters`: content for listed chapters, full value otherwise.
  - `metalContentCovered`: the Rev 4 9903.03.06 exempts only the metal content from Section 122, per note 2(aa)(v). Resolved in step 7, with triggers settled before noStack.
- **New inputs:** steel, aluminum and copper content %, and an FTZ admission date for the FTZ headings.
- **Interactions before April 6:** notes 33/38/39 (autos, MHDV, semiconductors) and the four civil aircraft agreements over the old headings.
- **From April 6:** 9903.82.02–.17 now start on 2026-04-06.
- **Checks:** an invariant sweep over 1,374 metals codes × 8 countries (21,984 calculations) found 0 problems. Results from April 6 on are unchanged: 65,952 compared, 0 differences.
- **Russia precedence, fixed afterwards** (branch `fix/232-russia-aluminum-precedence`, corrections to Rev 5+):
  - **Every 9903.82.02–.26 heading now gives way to 9903.85.67/.68,** per note 16(a). Before, only .02 did, so Russian goods paid the 200% plus a 9903.82 duty.
  - **7616.99.51.30/.40/.90 (in both 19(g) and 19(j)) pay 200% once:** .67, or .68 when confirmed. Before, both applied.
  - **Rev 4 matches:** the old .02/.07 give way to the Russia headings.
  - **Side effects that follow the text:** without a 9903.82 heading, those goods pay Section 122 (note 2(aa)(v) doesn't exempt .67/.68) and, from August 2026, the forced-labor Section 301 duty (note 52(f) only exempts the 9903.82 headings).
  - **Sweeps:** a Russia invariant sweep found 179 problems before and 0 after. In the regression sweep (65,952 results), 12 changed, all Russian.
- **Not modeled:** the 2018–2025 quota and exemption headings (9903.80.xx, 9903.81.01–.86, most of 9903.85). Per the compiler's notes to 16(a) and 19(a), they only covered entries before March 12, 2025.

## Oct 7: corrections found while planning the 2026HTSRev4 backfill (branch `fix/232-civil-aircraft-and-metals-lists`)

These are corrections to verified data (Rev 5–20). The backfill itself is paused; see `tariffs/revision-diffs/2026HTSRev4/PLAN.md`.

- **Civil aircraft agreements over Section 232 metals.** U.S. notes 35(a) (UK, 9903.96.01), 2(v)(xxii) (EU, 9903.02.76), 35(b) (Japan, 9903.96.02) and 2(v)(xxiv)(b) (Korea, 9903.02.81) exempt their civil aircraft articles from 9903.82.02 and .04–.17. That range is the same in every verified revision.
  - Now modeled as the `232-metals-not-on-civil-aircraft-agreements` noStack, from 2026-04-06.
  - **9903.02.76/.81 no longer end on Feb 24, 2026.** Their IEEPA role ended, but Proclamation 11021 clause (10) keeps the Section 232 civil aircraft agreements. They move to `aircraft-agreements`, with the Rev 5 heading text, which cites (v)(xxii) and (v)(xxiv)(b).
  - This **lowers Rev 5+ duties** on confirmed UK, EU, Japanese and Korean aircraft articles.
- **`9903.85.68` rebuilt from note 19(i)–(k)** (254 codes). The note is identical from Rev 4 to Rev 20. The migrated list had 131 of its codes, plus 9401.99.90.81, which isn't in the note. Russian aluminum containers, wire, cable and the other missing goods now pay 200% instead of 50%.
- **`motorcycleParts16cg`:** 8516.90.50.00 → 8516.90.50, as listed in note 16(c)(vi).
- **9903.03.06 description** replaced with the Rev 5 heading text. It was a paraphrase; no duty effect.
- **Not changed:** 9903.96.02's `exceptions: ["9903.94.06"]`, which note 35 doesn't support. Left for a decision.

## Oct 6: import bans (Section 338 Canada, from Sep 29, 2026)

- **New record type `Prohibition`** (`types.ts`, `data/prohibitions.ts`): an import ban, dated and scoped like a tariff, with optional `unless` conditions. `calculate()` returns the bans in scope as `result.prohibitions` (step 11); a ban never changes `totalDuty`, because goods imported before it still pay the duty when withdrawn from a warehouse or FTZ. Validated in `validate.ts`; included in `ruleChangeDates`.
- **Data:** Proclamations 11061 (alcoholic beverages), 11062 (dairy: whey, molasses, non-alcoholic beer) and 11063 (motorcycles over 800 cc), from the annexes attached to CSMS #70050970, in `data/lists/canada-338-bans.ts`. The 28 alcohol provisions with the "Packaged" scope limitation are banned unless the new `alcoholInBulk` input is checked.
- **Calculator:** `ProhibitedNotice` above the results; questions that can lift a ban (`Question.liftsProhibition`) are always shown first and counted as open.
- **Tests:** "Section 338 – Canada import bans" in `testing/engine-v2/real-data.test.ts`.
- **Not done:** the Tariff Tracker / Watcher doesn't flag banned products yet. No HTS revision has added Chapter 99 text for the bans (Rev 20 is still current), so the source is the proclamations and the CSMS.
- **Note:** Proclamation 11056 ("Temporary Suspension…") only moved the Section 338 start date to Aug 22; the comment in `338-canada.ts` now says so.

## Oct 3: 2026 Rev 20 applied (branch `revision/2026HTSRev20`)

Section 232 – Pharmaceuticals changes from 2026-09-29 (Notice). See `tariffs/revision-diffs/2026HTSRev20/PLAN.md`.
- `pharmaceuticals40c` has a second version (131 → 149: finer statistical numbers, some chapter 30 numbers added or removed).
- New 9903.04.70 (clinical trials, R&D, non-commercial use; free, confirmed). .60 and .62–.66 have September 29 versions listing it among their exceptions; the exclusivity brute force covers .60–.70.
- The narrower definitions (40(c)(i), (iii), (i)) need no data change; they show through Referenced notes.

## Oct 3: 2026 Rev 19 applied (branch `revision/2026HTSRev19`)

Section 338 – Canada changes from 2026-09-15 (PP 11064, 11065). See `tariffs/revision-diffs/2026HTSRev19/PLAN.md`.
- `canada338b1` (63 → 101: cheeses, hides and furskins, boats, whisky/liqueur narrowed to statistical numbers) and `canada338b3` (439 → 513: furniture and seats, lamps, aluminum and steel structures, fittings, paper, cars; 8 removed or narrowed) have second versions from September 15.
- 51(c) now exempts only 9903.03.13 (dairy): 9903.03.12 and .14 have September 15 versions without the 9903.03.15 exception, so Section 232 goods on those lists pay the 50% on top.

## Oct 3: 2026 Rev 18 applied (branch `revision/2026HTSRev18`)

See `tariffs/revision-diffs/2026HTSRev18/PLAN.md`.
- **Section 232 – Unmanned Aircraft Systems** (`232-uas`, Proclamation 11055, from 2026-09-03): 9903.08.20–.26 in `headings/232-uas.ts`, lists in `lists/uas.ts`. Drones +25% (.22), or +100% (.21) with thermal imaging (`uasThermalImaging`) or in (c)(1); general-purpose codes (power supplies, control panels, aircraft parts) are .20 at $0 unless `uasForUse` is checked (decisions). UK +10% (.23) and JP/LI/KR/CH/TW/EU 15% total (.24) when the critical components test is confirmed; onshoring plans (.25/.26) free. Mutually exclusive (brute-force test). Stacks with the country programs.
- **20(vvv) exclusions:** 9903.88.69's list has a 2026-07-01 version adding the new statistical numbers for the pump parts and plastic articles.
- **Lean beef trimmings quota** 9903.54.02 (`headings/quotas.ts`, program `quotas`): a confirmed $0 line, Sep 1 – Nov 30, 2026, not for Argentina.

## Oct 3: 2026 Rev 17 applied (branch `revision/2026HTSRev17`)

Section 338 – Canada (Proclamations 11046–11048, 11056), from 2026-08-22. See `tariffs/revision-diffs/2026HTSRev17/PLAN.md`.
- **New program `338-canada`** (new authority `"338"`) with 9903.03.12/.13/.14 at +50% for the products in note 51(b)(1)/(2)/(3) (lists in `lists/canada-338.ts`). They stack with other duties and apply with a USMCA claim.
- **Exemptions:** 9903.03.15 for Section 232 goods (`section232ArticleHeadingsFromJuly31`), 9903.03.16 for confirmed civil aircraft articles (the existing `civilAircraftAndPartsOf` list).
- The context mentions a temporary suspension, but the HTS text has none; applied as written (decision).

## Oct 3: 2026 Rev 16 applied (branch `revision/2026HTSRev16`)

Section 201 – Quartz Surface Products (Proclamation 11051), from 2026-08-15. See `tariffs/revision-diffs/2026HTSRev16/PLAN.md`.
- **New program `201-quartz`** and headings 9903.45.30 (in quota) and 9903.45.31 (over quota) in `headings/201-quartz.ts`, for 6810.99.00.20, 6810.99.00.40 and 7020.00.60.00. Rates step down each August 15 (25/50%, 23/49%, 21/48%, 19/47%) and end after August 14, 2030. They stack with other duties.
- **Exempt countries** (note 41(c)) in the country list `quartzSafeguardExempt41c` (`lists/quartz.ts`), used as `excludeCountries`. Kosovo and Congo (Kinshasa) aren't in the calculator's country list yet.
- **Quota:** new input `quartzQuotaFilled`. Unanswered means in quota (decision); yes means .31.
- **Is it QSP?** New input `notQuartzSurfaceProduct` ("These goods aren't quartz surface products"): checking it removes the 201 duty, for goods under the three codes that aren't QSP per 41(a), e.g. other glass articles under 7020.00.60.00. Asked as "not" because an unchecked box is unanswered, not "no".

## Oct 2: 2026 Rev 15 applied (branch `revision/2026HTSRev15`)

One change, see `tariffs/revision-diffs/2026HTSRev15/PLAN.md`: 9903.04.63 (UK patented pharmaceuticals) is +0% instead of +10%, from July 31, 2026 (the heading's start, so edited in place). By decision, a confirmed onshoring plan (.64, +20%) still takes precedence over it.

## Oct 2: 2026 Rev 14 applied (branch `revision/2026HTSRev14`)

Section 232 – Pharmaceuticals (Proclamation 11020), from 2026-07-31. See `tariffs/revision-diffs/2026HTSRev14/PLAN.md`.
- **New program `232-pharmaceuticals`** and headings 9903.04.60–.69 in `headings/232-pharmaceuticals.ts`, scoped to the 131 provisions of note 40(c) (`lists/pharmaceuticals.ts`). .60 tops up to 100% including the base rate; .62 (JP, EU, KR, CH, LI) to 15%; .63 UK +10%; .64 onshoring +20% (confirmed, and then it takes precedence over .62/.63, by decision); .61, .65–.69 free and confirmed. Mutually exclusive per 40(a) through `exceptions`; a brute-force test checks it.
- **Brazil and forced-labor exemptions:** 9903.05.07 and 9903.05.90 have July 31 versions adding 9903.04.60–.66 (notes 50(a)(vi)(8), 52(f)(8)), via `section232ArticleHeadingsFromJuly31` in `122.ts`.
- Note 2(aa)(v)'s new pharma item (added after Section 122 expired) changes nothing.

## Oct 2: 2026 Rev 13 applied (branch `revision/2026HTSRev13`)

Section 122 ended at the close of July 23 (already modeled); Section 301 – Forced Labor from 2026-07-24 (Notice). See `tariffs/revision-diffs/2026HTSRev13/PLAN.md`.
- **New program `301-forced-labor`** and 101 headings in `headings/301-forced-labor.ts` (U.S. note 52), generated from the revision's reviewed heading text. 9903.05.20–.84: +10% or +12.5% for 59 countries, and pairs totaling 10% (EU, Taiwan) or 12.5% (Japan, South Korea, Switzerland) including the base rate. They stack with everything else, including Section 301 Brazil and China, and apply with FTA claims.
- **Column 2:** every country heading's Column 2 is "the duty provided in the applicable subheading" (no additional duty) except Russia's, which is "+ 12.5%", so Russia pays it.
- **Exemptions** 9903.05.85–9903.06.21: in transit, listed and particular articles, civil aircraft and pharmaceuticals (confirmed), Section 232 articles (shared trigger list), donations, informational materials, USMCA (CA/MX, claimed), CAFTA-DR textiles (claimed and confirmed), and country lists for the UK, EU, Switzerland and 10 more countries (29 lists in `lists/forced-labor-301.ts`).
- **Rev 12 tests:** from July 24, the Brazil cases also get 9903.05.27's 12.5% and note 52's matching exemptions (law change within Rev 12's window).

## Oct 2: 2026 Rev 12 applied (branch `revision/2026HTSRev12`)

Section 301 – Brazil, all from 2026-07-22 (Notice). See `tariffs/revision-diffs/2026HTSRev12/PLAN.md`.
- **New program `301-brazil`** and headings 9903.05.01–.09 in `headings/301-brazil.ts`, from U.S. note 50. 9903.05.01 adds 25% to all products of Brazil, stacks with other duties (including Section 122 until July 24) and applies even with a preference claim.
- **Exemptions** copy Section 122's: in transit (.02), listed products (.03, new list `brazilExempt50aii`), particular articles (.04) and civil aircraft (.05, confirmed) as lists that include the identical Section 122 lists, pharmaceuticals (.06, new list `brazilPharma50av`, confirmed), Section 232 articles (.07, the same trigger list as 9903.03.06, now shared as `section232ArticleHeadingsFromJune8`), donations (.08) and informational materials (.09).
- **Not modeled:** the chapter 98 rule in 50(a)(i), as with Section 122.

## Oct 2: 2026 Rev 11 applied (branch `revision/2026HTSRev11`)

One chapter 99 change. See `tariffs/revision-diffs/2026HTSRev11/PLAN.md`.
- **Note 2(aa)(v)(1) technical correction** (PP 11021, effective 2026-04-06): 9903.82.02 is back in the Section 122 exemption (9903.03.06). Retroactive, so the June 8 version is corrected in place and June 8–30 entries no longer pay Section 122 on 9903.82.02 goods.
- **Correction, all dates:** 9903.82.01 and 9903.82.03 no longer trigger 9903.03.06. The note has never listed them (legacy data did), so those articles pay Section 122 from Feb 24 to July 24, 2026.

## Oct 2: 2026 Rev 10 applied (branch `revision/2026HTSRev10`)

Section 232 metals restructuring, Proclamation 11032, all from 2026-06-08 (dated versions). See `tariffs/revision-diffs/2026HTSRev10/PLAN.md`.
- **Lists:** 16(c)(vi), (vii), (ix), (x) have a second version from June 8; 62 codes leave (vii) for (x) and the new **(xi)** `steelDerivatives16cxi` (mobile industrial equipment). New `metalsPartsForEquipment16k` ((vi)–(viii) parts in chapters 84/85/87).
- **New headings 9903.82.20–.26:** USMCA (xi) content split at 40% (.20/.21), partner-country (xi) at 15% total (.22, `TODO(review)`), and (k) parts for equipment (.23–.26, topped up to 10%/15%).
- **Engine (new handler):** basis `usContentShare` and input `usContentPct`, for .20/.21.
- **Existing headings** .01/.05/.06/.07/.08/.09/.13/.15/.16 have June 8 versions ((xi) scope, 85% U.S.-content names, precedence for the new headings). The legacy motorcycle list is dropped from .06/.09 from June 8 (it still held codes that moved out of (vi)–(viii)); .13 uses the 16(k) parts list plus (xi), matching 16(g).
- **Section 122:** note 2(aa)(v)(1) in Rev 10 omits 9903.82.02 ("headings 9903.82.04 and 9903.82.04–9903.82.26"). It was first applied as written; Rev 11's technical correction (effective April 6) restores it retroactively, so the gap is gone.
- The note 16(a) exclusivity test now covers .02–.26 (the .20/.21 split counts as one treatment).

## Oct 2: 2026 Rev 9 applied (branch `revision/2026HTSRev9`)

Taiwan joins the Japan/EU/Korea deal structure, all from 2026-05-01 (dated versions, so earlier dates are unchanged). See `tariffs/revision-diffs/2026HTSRev9/PLAN.md`.
- **Auto parts:** new 9903.94.66–.69 (copies of Korea's .62–.65 for TW); 9903.94.05/.07 give way to them from May 1.
- **Wood:** new 9903.76.24 (TW, 15% including the base rate); Taiwan excluded from 9903.76.02/.03 from May 1.
- **Civil aircraft components:** new 9903.96.03 and list `civilAircraftComponents35c` (note 35(c)); a `noStack` rule drops the metals duties once confirmed.
- **Cross-references:** 9903.03.06 (Section 122 exemption), and the metals, wood and semiconductor non-stacking rules, include the Taiwan headings from May 1.
- **Correction:** Korea's wood heading 9903.76.23 now tops up to 15% including the base rate (it added a flat 15%), matching Japan, the EU and Taiwan under the same note wording.

## Oct 2: 2026 Rev 8 applied (branch `revision/2026HTSRev8`)

No duty changes. U.S. note 38(i) now says the 9903.74.08 duty is subject to a manufacturer's import adjustment offset set by Commerce (Proclamation 10984); note 33(g) says the same for auto parts (Proclamation 10925). **Offsets aren't modeled, by decision:** the offset is per manufacturer, so those headings keep requiring the user's confirmation before they're charged, at the full rate.

## Oct 2: 2026 Rev 7 applied (branch `revision/2026HTSRev7`)

See `tariffs/revision-diffs/2026HTSRev7/PLAN.md`. Every change is by Notice effective 2026-04-06, the start of the 9903.82 family, so the edits are in place and Rev 5/6 results change too.
- **9903.82.01** (no aluminum, steel or copper) now covers all of note 16(c), adding (c)(viii) copper articles.
- **9903.82.06** (95% U.S.-melted/smelted) covers (c)(viii) too, after note 16(e) dropped the sentence limiting it to (c)(ii), (iv), (vi), (vii). U.S.-smelted copper cable pays 10% instead of 25%.
- **9903.82.13** now gives way to 9903.82.01 (note 16(a)).
- Note 20's 20(qqq) → 20(yyy) swap needs no change: neither list (nor 9903.88.64) is modeled.

## Oct 2: 2026 Rev 6 applied (branch `revision/2026HTSRev6`)

See `tariffs/revision-diffs/2026HTSRev6/PLAN.md` for the full plan.
- **New headings** 9903.82.18 (steel of CA/MX) and 9903.82.19 (aluminum of CA/MX): 25% in the Special column only, so they need a USMCA claim plus a Commerce-authorization confirmation. From 2026-04-23.
- **New versions** of 9903.82.02 (new exceptions .18 and .19, note 16(a)) and 9903.03.06 (.18 and .19 trigger the Section 122 exemption, note 2(aa)(v)(1)).
- **Metals non-stacking (notes 33, 38, 39)** is now modeled as a `noStack` interaction: when a listed auto, MHDV or semiconductor heading applies, 9903.82.02 and .04–.17 are dropped, plus .18 and .19 from 2026-04-23. This wasn't modeled before, so it **changes Rev 5 results** for confirmed auto, MHDV and semiconductor goods.
- **Note 16(a) mutual exclusivity enforced** (corrections, in place): .06 wins over .04 (no textual order; the facts contradict); .08 over .11 (16(f) covers goods "that do not meet" (e)); .12 over .07/.08/.10/.11 for Column 2 countries (16(e)/(f) "except as provided for in 9903.82.12 and 9903.82.17"); .13 over every (c)(vi)–(viii) heading (16(g)). **9903.82.14/.15 corrected (answers Q4):** 16(e) names .15 among the 95%-U.S.-content headings, so .15 now needs that confirmation instead of "base < 10%", and .14 no longer needs "base ≥ 10%". A brute-force test checks that at most one of .02–.19 ever applies.
- **More non-stacking from notes 33/38/39:** semiconductors (9903.79.01) over auto, MHDV and IEEPA headings (39(a)(1)–(4), (8)); no wood 9903.76.01–.03 on auto and MHDV parts, and no 9903.76.23 on Korean parts (33(t)(2)); no Canada/Mexico IEEPA (9903.01.10/.01.01) on vehicles, parts and semiconductors. The last one has no effect until those IEEPA headings are backfilled.
- **Note 16(c) lists checked against the note text.** `aluminumDerivatives16cvi` was missing 15 codes (7615 housewares, 7616.99.10, 7616.99.51.30/.40) and `steelDerivatives16cvii` 40 (7321–7326 housewares and articles), so those goods got no Section 232 duty. Both are rebuilt from the note (a correction, same text in Rev 5 and 6), and `steel16ciii` now uses the note's 8-digit codes. The other seven lists already matched.
- **USMCA on Free lines (engine change):** a line that's free under General with no special column now offers S/S+ for CA/MX. Before, a claim there was refused, so 9903.82.18 could never apply and 9903.03.07/.08 couldn't exempt Free USMCA goods from Section 122.

## Oct 1: legacy engine removed

Every duty estimate on the site now comes from engine-v2.
- **Moved to v2 first:** the HTS explorer's Duty & Tariffs card and the classification Duty & Tariffs tab (both `DutyEstimateEmbed`), and the classification overview's Tariff Summary.
- **Removed:**
  - The legacy engine: `tariffs/*.ts` (country files, lists, exclusion lists, `tariffs.ts`, `tariff-calculations.ts`, `tariff-columns.ts`).
  - Its UI: `CountryTariff`, `SingleCountryDutyTariffCard`, `Tariff`, `Tariffs`, `SideBySideTariffs`, `EstimatedCostsDisplay`, `BaseTariff`, and the inputs and popover only they used.
  - Its tests (`testing/tariffs.test.ts`, the legacy adapter).
  - The migration and comparison scripts.
- **Kept:** `tariffs/announcements` (Tariff Impact Checker data, not part of the calculator) and `public/trade-programs` (used by engine-v2's preferences).
- **Tests:** `dual.test.ts` became `real-data.test.ts`. The cases where both engines agreed are pinned to those totals and headings, and the known differences now assert only v2's corrected behavior.
- **History:** the sections below describe the work while both engines existed. COMPARISON.md and the D-numbered differences refer to that period.

## Sep 30: rates on part of the goods (engine-v2 only)

Some base rates apply to one part of the article, e.g. 9103.10.40 "24¢ each + 4.5% on the case + 3.5% on the battery" or 2603.00.00 "1.7¢/kg on lead content". v2 used to charge every percentage on the whole customs value.
- **`base-rates.ts`** parses the rate column into parts. A part "on X" becomes a question: `baseValue:<x>` (USD) for a percentage, `baseQuantity:<x>` for an amount. Until it's answered, the whole customs value or quantity is used, which is the most the part can be. The part is marked `assumed`, and the base line says so. "on (the) entire set" counts as the whole article.
- **Parser fixes in the rate text only**, so the shared `libs/hts.tsx` parser and the legacy calculator are unchanged:
  - "+" without spaces ("drained weight+45%") used to drop the second part.
  - "¢/pf. liter" (proof liter) used to parse as 0.
- **`CalculationResult.baseParts`** lists each part with its basis and amount. The results table shows one line per part, and the base questions appear first under "Refine this estimate".
- **A warning** appears when an entered component value exceeds the customs value.
- **Regression checks:**
  - All HTS lines × CN, DE, RU, MX with no answers, before vs. after: 92,598 of 92,772 v2 totals are unchanged. The 174 that changed are all parser fixes (91 "+" spacing, 83 proof-liter).
  - `compare-engines --all`: the only new kind of difference is "v2 higher, same headings", 368 calculations, which is the same parser fixes across 14 countries. The existing kinds are unchanged.
  - Nine new tests are in `engine.test.ts`.
- **Legacy calculator still** charges partial rates on the whole value and still drops "+"-less parts. Fixing that means changing the shared parser.

## Decisions I made (easy to change)

- **Default date in the v2 panel** is the latest verified revision (2026 Rev 20), not today. Data for later revisions isn't entered yet, so "today" would silently drop Section 122 without adding its replacement.
- **Confirmation questions default to "no"**, matching legacy. An exemption doesn't apply, and a confirm-to-apply duty (e.g. 9903.94.05 auto parts) isn't charged, until answered. Each condition can set `assume: true` to flip that.
- **Dates only from heading text.** Headings without a stated date are undated ("in effect throughout"). They get dates as revisions are backfilled.
- **Lists keep legacy names.** New lists are named after their heading (`9903.88.03`) until renamed to note citations.
