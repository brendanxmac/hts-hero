# Plan: apply 2026HTSRev9 (2026HTSRev8 → 2026HTSRev9)

Package checks: `allDecided` true; `contentHash` matches `changes.json` (`ae9ae198…adec3`);
`fromRevision` 2026HTSRev8 is the latest in `VerifiedTariffRevisions`; `consecutive` true.
No `context.md`. Revision dates: 2026-05-28 → 2026-06-08 (entries through June 7, 2026).
31 approved, 4 skipped, 0 deferred. No reviewer notes.

**What this revision is:** the U.S.–Taiwan arrangement, plus wording fixes. Taiwan gets the same
treatment Japan, the EU and Korea already have:
- **Auto parts at 15% all-in:** new 9903.94.66–.69, which mirror Korea's 9903.94.62–.65.
- **Wood products at 15%:** new 9903.76.24, which mirrors Korea's 9903.76.23.
- **Civil aircraft components exempt from Section 232 metals duties:** new 9903.96.03 and note 35(c).
- **The usual cross-references:** the Section 122 exemption list, and the non-stacking rules in
  notes 33 and 39.

**Every change is effective May 1, 2026 (Notice).** That's inside Rev 7 (Apr 29 – May 22), a
verified period, and well after the records' start dates. So unlike Rev 7's April 6 changes,
these are **new dated versions from 2026-05-01** (§14.3 `tariffVersions`; new records get
`effective.from`). Results before May 1 stay exactly as they are.

---

## Approved changes

### A. Taiwan auto parts: 9903.94.66–.69 (CR-26–29, note 33(u) via CR-11, 33(f)/(g)/(m)/(p)/(r) via CR-3/4/6/7/8)

**Headings (headings.md):**
- **9903.94.66:** parts of Taiwan, subdivisions (g) and (u), column 1 rate ≥ 15%. "No change" in
  every column.
- **9903.94.67:** same, rate < 15%. General 15%, Special 15%, Column 2 "No change".
- **9903.94.68 / .69:** same pair for subdivisions (r) and (u). These are parts certified for U.S.
  automobile production or repair.

**Note 33(u):** "Except as provided for in heading 9903.94.06, headings 9903.94.66, 9903.94.67,
9903.94.68, and 9903.94.69 set forth the ordinary customs duty treatment for certain parts of
passenger vehicles and light trucks … enumerated in subdivision (g) … or that meet the
requirements of subdivision (r) … that are products of Taiwan." Note 33(m) now covers "of
Taiwan" for ad valorem equivalents of specific rates, which the engine's base-rate equivalent
already handles.

**Recipe.** §17.7 (a 15% all-in deal) and §17.2. They mirror Korea's records exactly.

**Edits** (`232-autos.ts`), all `effective: { from: "2026-05-01" }`, `source: { revision: "2026HTSRev9", note: "U.S. note 33(u); Notice effective 2026-05-01" }`:
- `9903.94.66`: `countries: ["TW"]`, `codes: [automobileParts33G]`, `exceptions: ["9903.94.06"]`,
  `requires: [baseRate >= 15, confirm]`, `rate: free`.
- `9903.94.67`: as .66 with `baseRate < 15`, `rate: topUpTo 15`, `rateByColumn: { column2: free }`.
- `9903.94.68`: `countries: ["TW"]`, `codes: "all"` minus the same lists as .64 (automobileParts33G,
  ch72/73/76, partsOfMHDVs38i), `requires: [baseRate >= 15, confirm]`, `rate: free`.
- `9903.94.69`: as .68 with `baseRate < 15`, `topUpTo 15`, column 2 free.

**New versions** of the general headings, from 2026-05-01 (they give way to the Taiwan headings):
- `9903.94.05`: add `.66`, `.67` to `exceptions`. Update its description to the Rev 9 heading text
  (CR-22).
- `9903.94.07`: add `.68`, `.69` to `exceptions`. Update its description to the Rev 9 text (CR-23).

### B. Taiwan wood: 9903.76.24 (CR-21, note 37(m) via CR-13/19, 37(c)–(f)/(k) via CR-14–18)

**Heading:** "Wood products of Taiwan as provided for in subdivisions (d) and (f) of U.S. note 37".
General 15%, Special 15%, Column 2 "No change". **Note 37(m):** "heading 9903.76.24 provides the
ordinary customs duty treatment of wood products of Taiwan … collected in lieu of any special rate
of duty".

**Notes 37(c) and (e):** 9903.76.02 (upholstered furniture) and 9903.76.03 (cabinets and vanities)
apply to "all countries other than: the United Kingdom, the member nations of the European Union,
South Korea, Japan, and Taiwan". Notes 37(d) and (f) add .24 and subdivision (m) to the product lists.

**Recipe.** §17.2 for the new heading. The headings it replaces get a new version that adds Taiwan
to their excluded countries.

**Edits** (`232-wood.ts`), from 2026-05-01:
- New `9903.76.24`: `countries: ["TW"]`, `codes`: the same lists Korea's .23 uses (the 37(d)
  furniture and 37(f) cabinet codes), `exceptions` mirroring .23 (.94.01, .94.03, .76.04, .94.05,
  .94.66–.69), `rate: topUpTo 15` (see open question 1), `rateByColumn: { column2: free }`.
- `9903.76.02` and `9903.76.03`: new versions adding `"TW"` to `excludeCountries`.

### C. Taiwan civil aircraft components: 9903.96.03 (CR-31, note 35(c) via CR-12)

**Note 35(c):** "As provided in heading 9903.96.03, the additional duties imposed by headings
9903.82.02 and 9903.82.04–9903.82.19 shall not apply to articles the product of Taiwan that are
civil aircraft … components that otherwise meet the criteria of General Note 6 … classifiable in
the following provisions". About 119 HTS codes follow. Heading: "No change" in every column.

**Recipe.** §17.2 (a new $0 exemption heading) plus §17.8 (a `noStack` rule, since the note
removes the metals duties).

**Edits** (from 2026-05-01):
- New list `civilAircraftComponents35c`: the 35(c) codes, parsed from the note text. The four
  heading numbers in the sentence are excluded.
- New `9903.96.03` (`deals.ts`, program `aircraft-agreements`): `countries: ["TW"]`,
  `codes: [civilAircraftComponents35c]`, `requires: [confirm("9903.96.03")]` (General Note 6
  criteria), `rate: free`.
- New interaction `232-metals-not-on-taiwan-civil-aircraft`: `noStack`, order
  `[{ codes: ["9903.96.03"] }, { codes: [9903.82.02, .04–.19] }]`, from 2026-05-01.

### D. Section 122 exemption lists (CR-1, CR-2: notes 2(aa)(v)(3) and (4))

Note 2(aa)(v)(3) adds 9903.94.66–.69 (auto parts), and (4) adds 9903.76.24 (wood), to the articles
"9903.03.01 shall not apply to".

**Edit** (`122.ts`): add a change to `9903.03.06`'s `tariffVersions` from 2026-05-01, adding
those five codes to `whenApplies.codes`. It still ends 2026-07-24.

### E. Non-stacking for Taiwan parts (CR-11 note 33(u)(1)–(2), CR-20 note 39(a)(2))

- **33(u)(1):** Taiwan parts under .66–.69 aren't subject to metals duties (9903.82.02, .04–.19).
- **33(u)(2):** …nor wood duties under 9903.76.01, .02, .03 and .24.
- **39(a)(2):** semiconductors under 9903.79.01 aren't subject to the auto parts duties, now
  including .66–.69.

**Edits** (`interactions.ts`): new versions from 2026-05-01 for three interactions. Each existing
record gets `to: "2026-04-23"` / `"2026-05-01"` as needed, and its new version adds .66–.69:
- `232-metals-not-on-autos-mhdv-semiconductors`: winners get .66–.69.
- `232-wood-not-on-auto-mhdv-parts`: winners get .66–.69.
- `232-autos-mhdv-ieepa-not-on-semiconductors`: losers get .66–.69.
- New `232-wood-9903.76.24-not-on-taiwan-auto-parts`: `[.66–.69]` over `[9903.76.24]`, mirroring
  Korea's .76.23 rule.

### F. Wording-only heading updates (CR-24, CR-25, CR-30) and FTZ dates (CR-5, CR-9, CR-10)

- **9903.94.31, 9903.94.32 (UK autos and parts) and 9903.96.01 (UK aircraft):** "Effective with
  respect to entries on or after [ ]" becomes "on or after June 30, 2025", and the compiler's note
  goes. Rates match the engine (7.5% / 10% / free), and `from: 2025-06-30` is already right.
  **Edit:** update the descriptions, with `source.revision: "2026HTSRev9"`. Wording only, so no new
  version.
- **33(j), (s), (t):** the FTZ "privileged foreign status" dates are filled in (June 30, 2025;
  December 4, 2025). Not modeled; no change.

---

## Engine logic changes

None. Everything is new records, new dated versions and interactions, using existing handlers.

## Not doing

Skipped by you. All are noise:
- **#32, note 2(s):** "expediently" → "expeditiously" (flip-flop).
- **#33, note 20:** 13 hyphen and extraction differences.
- **#34, note 38(i):** table-header label ("tariff_code" → "HTS_Code"), an extraction artifact.
- **#35, note 39(b)(2):** LaTeX → plain text in the TPP formula.

## Assumptions

1. **Taiwan's 15% headings top up to 15% including the base rate** (`topUpTo 15`), like Japan's and
   the EU's wood and every auto-parts deal. The heading rate is a plain "15%", not "+15%".
2. **9903.76.24 uses Korea's .23 product lists.** Both are "(d) and (f) of note 37", the same
   furniture and cabinet codes.
3. **9903.96.03 requires confirmation.** The note limits it to components that "meet the criteria
   of General Note 6", which the calculator can't check.
4. **Dated versions from 2026-05-01**, so Rev 7 dates before May 1 keep today's results.

## Open questions

1. **Korea's wood heading 9903.76.23 adds a flat 15%** (`adValorem 15`) on top of the base rate.
   Japan, the EU and now Taiwan top up to 15% including it. Note 37(l) for Korea uses the same
   words as Japan's 37(i) and Taiwan's 37(m) ("collected in lieu of any special rate"). Korea's
   heading text isn't in this package. Should I check it and correct .23 to `topUpTo 15` in a
   follow-up?

## Changelog drafts (to add in phase 2)

- **revision, "HTS Revision 9 (2026)":** "Verified tariff data now covers entries through June 7,
  2026. Goods of Taiwan now get the same deal rates as Japan, the EU and Korea from May 1, 2026:
  auto parts and wood furniture and cabinets are capped at 15% including the regular duty, and
  certified civil aircraft components are exempt from Section 232 metals duties."
- **improvement, "Taiwan auto parts and wood products capped at 15%":** "From May 1, 2026, auto
  parts and upholstered wood furniture, kitchen cabinets and vanities from Taiwan pay 15%
  including the regular duty, instead of 25% on top of it."

---

## Decisions after review (Oct 2, 2026)

1. **Approved as planned.**
2. **Open question 1:** bring Korea in line. 9903.76.23 is corrected in place from a flat 15% to
   `topUpTo 15` (§14.7 case 2, a data-entry correction: note 37(l) has always used the same terms
   as Japan's and Taiwan's). This changes Korean wood results for all dates where the base rate is
   above 0.
