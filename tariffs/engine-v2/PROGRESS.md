# Engine v2: progress log

Implementation of the design in [HowTariffsWork.md](../../HowTariffsWork.md), running alongside the legacy engine.
Branch: `feat/tariff-engine-v2`. Data reflects **2026 HTS Revision 5** (Apr 8 – Apr 23, 2026).

## Status

| Area | State |
|---|---|
| Engine (types, snapshots, handlers, pipeline, validator) | Done |
| Legacy data migrated (106 headings, 59 lists) | Done, hand-reviewed |
| Tests: 29 mechanics + 20 real-data (both engines) | All passing |
| Full comparison, every HTS line × 14 countries | Done: 99.5% identical totals, every difference explained |
| Tariff Finder toggle + new results panel | Done, checked in the browser (desktop and phone width) |

## How to run

```bash
npm run tests              # all tests, including engine-v2 and legacy-vs-v2
npm run compare-engines    # sample comparison → tariffs/engine-v2/COMPARISON.md (~35s)
npm run compare-engines -- --all   # every HTS line (~3 min)
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
| `scripts/engine-v2/migrate-legacy.ts` | One-time migration from the legacy data (already run) |
| `scripts/engine-v2/compare-engines.ts` | Legacy vs v2 comparison report |
| `testing/engine-v2/` | Tests, legacy adapter, HTS fixture loader |
| `components/tariff-engine-v2/TariffResultsV2.tsx` | The new results panel |
| `components/TariffFinderPage.tsx` | Engine toggle (`?engine=v2`) |

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
4. **9903.82.14/.15.** The names say "base ≥10%" / "<10%", but the descriptions say note 16 subdivisions (c)(iii)–(v) vs (c)(iv),(vii),(viii),(e). I kept legacy's base-rate split. Is that the real distinction?
5. **Answered:** 9903.94.44 is 0% in every column. The legacy data was updated Sep 30, and v2 already had it.
6. **9903.03.01 exceptions** `8471.50`/`8471.80`/`8473.30`: meant to exclude semiconductors from Section 122?
7. **9903.92.10's exception.** The HTS text says 9903.91.09; I used 9903.92.09. OK?
8. **Done Sep 30:** FY2027 MPF values added to both calculators, switching on Oct 1 (see E2).
9. **Broad "needs review" headings (L9).** Should these be narrowed to specific lists?
10. **Stale legacy tests (L1).** Update them for the full-value 232 structure, or delete them?
11. **9903.03.06 and "no metal" articles.** Legacy lists 9903.82.01 ("contains no aluminum, steel or copper") among the headings that trigger the Section 122 exemption. So confirming "no metal" removes 232 **and** keeps Section 122 off. Is a note 16(c) article with no metal still exempt from 122?
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
- **10 more `TODO(list)` comments** mark headings that cover every code except an exclusion list, while their text points to a specific note subdivision (L9): 9903.94.07/.33/.44/.45/.54/.55/.64/.65 and 9903.74.09/.10.
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

- **Default date in the v2 panel** is the latest verified revision (2026 Rev 5), not today. Data for later revisions isn't entered yet, so "today" would silently drop Section 122 without adding its replacement.
- **Confirmation questions default to "no"**, matching legacy. An exemption doesn't apply, and a confirm-to-apply duty (e.g. 9903.94.05 auto parts) isn't charged, until answered. Each condition can set `assume: true` to flip that.
- **Dates only from heading text.** Headings without a stated date are undated ("in effect throughout"). They get dates as revisions are backfilled.
- **Lists keep legacy names.** New lists are named after their heading (`9903.88.03`) until renamed to note citations.
