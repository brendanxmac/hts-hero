# Engine v2: progress log

Implementation of the design in [HowTariffsWork.md](../../HowTariffsWork.md), running alongside the legacy engine.
Branch: `feat/tariff-engine-v2`. Data reflects **2026 HTS Revision 5** (Apr 8 – Apr 23, 2026).

## Status

| Area | State |
|---|---|
| Engine (types, snapshots, handlers, pipeline, validator) | Done |
| Legacy data migrated (106 headings, 59 lists) | Done, hand-reviewed |
| Tests: 29 mechanics + 20 real-data (both engines) | All passing |
| Full comparison, every HTS line × 14 countries | Done: 98.4% identical totals, every difference explained |
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
Full run: 23,193 HTS lines × 14 countries = **324,702 calculations**. **98.4% have identical total duty.** The 5,130 differences fall into 3 kinds, all explained below (D3 and D5 disappeared when the legacy data was fixed on Sep 30). See [COMPARISON.md](COMPARISON.md).

## Differences from the legacy engine

D1, D2 and D4 are cases where I believe v2 is right. Please confirm. D3 and D5 are resolved.

| # | Difference | Count | Cause |
|---|---|---|---|
| D1 | EU/JP/KR goods: v2 higher | 3,386 | Legacy's UI "below 15%" rule drops the base duty for **every** EU/JP/KR good with a base under 15%, even when no 15% deal heading applies (deal-exempt goods, 232 goods). Example: 0711.90.30 from Germany owes $0 in legacy and $800 (8% base) in v2. |
| D2 | Russia 232 steel: v2 lower | 1,743 | Legacy's `tariffIsActive` "visited" set treats 9903.82.14 as inactive the second time it's reached, so 9903.03.06 (the Section 122 exemption for 232 goods) doesn't activate and Section 122 is charged on top of 232. |
| D3 | ~~3913.10.00.00 CN: v2 lower~~ **Resolved:** legacy data fixed | 1 | Legacy data lists `3913.10.0000` (missing a dot) in 9903.88.69's exclusions. Substring matching never finds it; v2 matches on digits. |
| D4 | 6307.90.98.70 CN: v2 lower | 1 | 9903.91.04's text says it applies before January 1, 2026. Legacy still applies it at Rev 5. |
| D5 | ~~9401.69.60.31 CN: v2 lower~~ **Resolved:** legacy data fixed | 1 | Same as D3: `9401.69.6031` in 9903.88.15's exclusions. |

Other intended differences that the comparison doesn't exercise (they only show up after the user answers questions):
- **9903.94.44** (EU auto parts, 33(r)): the legacy record says "<15%" and charges 15%, identical to .45. By the pairing pattern it's the "≥15%" heading at 0%, and v2 does that. See Q5.
- **9903.92.10** listed exception `9903.91.09`, which doesn't exist. v2 uses 9903.92.09 (the cranes exception). See Q7.

## Issues found

### Legacy code
- **L1. Five stale legacy tests.** `testing/tariffs.test.ts` expects a heading with a `"Section 232 Metal"` content requirement. None exists since the April 2026 data update moved 232 metals to full value. They fail on `master`. I haven't changed them.
- **L2. Visited-set bug in `tariffIsActive`.** Causes D2. A heading reached twice in one traversal counts as inactive.
- **L3. The "below 15%" rule is applied per country, not per heading.** Causes D1 (`CountryTariff.tsx`, `calculateDutyEstimates`).
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
- **E2. Fixed Sep 30.** MPF FY2027 values ($34.58 min, $670.86 max, 0.3464% unchanged) added as a dated record from 2026-10-01 ([FR Doc. 2026-15530](https://www.federalregister.gov/documents/2026/07/31/2026-15530/customs-user-fees-to-be-adjusted-for-inflation-in-fiscal-year-2027)). The legacy constants in `tariffs/tariff-calculations.ts` still have the FY2026 values.
- **E3. Base rates come from the latest HTS revision.** The panel's revision dropdown dates the Chapter 99 rules only. Loading each revision's own base rates needs the revision's HTS file in Supabase storage.
- **E4. The legacy engine still runs** on the page when the new engine is shown. It's used for the Units field's visibility. It's cheap, but can be removed when the old engine is retired.

## Questions for you

1. **Deal headings alongside Section 122.** *Researched Sep 30, awaiting your decision; no changes made.* The evidence says the reciprocal deal headings ended on Feb 24, 2026:
   - CBP's CSMS #67834313 made all IEEPA HTS numbers inactive in ACE from Feb 24, 2026. It explicitly left Section 232 and 301 alone.
   - 9903.02.19/.20, .72/.73, .79/.80 (and the reciprocal exemptions .74–.78, .81) are provided for in U.S. note 2(v), the IEEPA reciprocal note.
   - Secondary sources say the EU/JP/KR caps were lost and no guidance reimplemented them under Section 122.
   - CBP's Section 122 guidance (CSMS #67844987) has no country caps: 10% on top of MFN for everyone.

   If you agree, those headings get `to: "2026-02-24"`. EU/JP/KR goods at Rev 5 would then pay MFN + 10% (122), not the 15% top-up plus 10%. The 232 auto and wood deal headings (9903.94.xx, 9903.76.xx) are Section 232 and stay.
2. **Wood deal rates (9903.76.20–.23).** *Researched Sep 30, awaiting your decision; no changes made.* CBP's CSMS #66492057 guidance, as summarized by several brokers, says EU and Japan wood tariffs are "capped at a combined rate of 15%, inclusive of MFN rates". 9903.76.21/.22 are listed at "15% additional", so the cap has to come from how the rate is applied. That supports modeling EU/JP (and likely KR, from its later deal) as "top up to 15%": 15% minus the base, never below 0. The UK's 9903.76.20 is a flat 10%. I haven't confirmed the KR and UK details from a primary source.
3. **9903.88.69/.70 end date.** The heading text says "through November 29, 2025"; your legacy name says "Expires November 9, 2026". I used Nov 10, 2026 (i.e. through Nov 9). Correct?
4. **9903.82.14/.15.** The names say "base ≥10%" / "<10%", but the descriptions say note 16 subdivisions (c)(iii)–(v) vs (c)(iv),(vii),(viii),(e). I kept legacy's base-rate split. Is that the real distinction?
5. **Answered:** 9903.94.44 is 0% in every column. The legacy data was updated Sep 30, and v2 already had it.
6. **9903.03.01 exceptions** `8471.50`/`8471.80`/`8473.30`: meant to exclude semiconductors from Section 122?
7. **9903.92.10's exception.** The HTS text says 9903.91.09; I used 9903.92.09. OK?
8. **Done:** FY2027 MPF values added (see E2). Should I also update the legacy constants, and if so, on Oct 1?
9. **Broad "needs review" headings (L9).** Should these be narrowed to specific lists?
10. **Stale legacy tests (L1).** Update them for the full-value 232 structure, or delete them?
11. **9903.03.06 and "no metal" articles.** Legacy lists 9903.82.01 ("contains no aluminum, steel or copper") among the headings that trigger the Section 122 exemption. So confirming "no metal" removes 232 **and** keeps Section 122 off. Is a note 16(c) article with no metal still exempt from 122?
12. **Rolling this out.** Answered: don't make it the default for now.

## Decisions I made (easy to change)

- **Default date in the v2 panel** is the latest verified revision (2026 Rev 5), not today. Data for later revisions isn't entered yet, so "today" would silently drop Section 122 without adding its replacement.
- **Confirmation questions default to "no"**, matching legacy. An exemption doesn't apply, and a confirm-to-apply duty (e.g. 9903.94.05 auto parts) isn't charged, until answered. Each condition can set `assume: true` to flip that.
- **Dates only from heading text.** Headings without a stated date are undated ("in effect throughout"). They get dates as revisions are backfilled.
- **Lists keep legacy names.** New lists are named after their heading (`9903.88.03`) until renamed to note citations.
