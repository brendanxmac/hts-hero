# Plan: apply 2026HTSRev6 (2026HTSRev5 → 2026HTSRev6)

Package checks: `allDecided` true; `contentHash` matches `changes.json`
(`717e54a7…2f47`); `fromRevision` 2026HTSRev5 is the latest in `VerifiedTariffRevisions`;
`consecutive` true. Revision dates (hts-revisions.json): 2026-04-23 → 2026-04-29.

Oddity, not blocking: `manifest.json` `sourceFiles` storage paths for the Chapter 99 PDF and
the change record say `2025HTSRev6/attempt-1/…`, while the filenames say 2026HTSRev6. The AI
summaries also call the newer side "2025HTSRev6". The note text and the change record
(dated April 23, 2026, "after 2026 Revision 5") are consistent with 2026HTSRev6, so I'm treating
it as a labeling bug in the revision checker.

The whole revision is one action: Proclamation 10984 clause 13 reductions for Canadian/Mexican
steel and aluminum supplying U.S. auto/MHDV makers. It adds two headings (9903.82.18, .19) and
widens every "9903.82.02 and 9903.82.04–9903.82.17" reference to "…–9903.82.19". Plus one
unrelated technical correction (CR-3).

---

## Approved changes

### CR-4 + CR-8: new headings 9903.82.18 and 9903.82.19 (note 16(h), 16(i))

**Legal text.** Note 16(h): "Heading 9903.82.18 applies to limited quantities of articles of
steel described in subdivision (c)(iii) of this note that: (1) were melted and poured in Canada
or Mexico; (2) qualify for preferential treatment under the United States-Mexico-Canada
Agreement, as provided in general note 11 of the HTSUS; and (3) are authorized by the Secretary
of Commerce as eligible for a tariff reduction under this heading pursuant to clause 13 of
Presidential Proclamation 10984…". Note 16(i) says the same for aluminum in (c)(i), "smelted and
cast in Canada or Mexico".

Headings (headings.md, reviewed, PDF p.1):
- 9903.82.18: "Certain articles of steel, as provided for in subdivisions (c)(iii) and (h) of
  U.S. note 16 to this subchapter". General "no change", Special "The duty provided in the
  applicable subheading + 25%", Column 2 "no change".
- 9903.82.19: "Certain articles of aluminum, as provided for in subdivision (c)(i) and
  subdivision (i) of U.S. note 16 to this subchapter". Same rate columns.

**Recipe.** §17.2 (a new heading appears; it's an alternative to an existing heading, so that
heading gets a new version with the added exception).

**Effective date.** 2026-04-23. Source: change record, CR-4 and CR-8 ("Notice"). The note text
gives no date. Proclamation 10984 (Oct 17, 2025) only *authorized* reductions, so it's not the
effective date.

**Edits**, in `tariffs/engine-v2/data/headings/232-metals.ts`:
1. Add `9903.82.18`: program `232-metals`; scope `countries: ["CA", "MX"]`,
   `codes: [{ list: "steel16ciii" }]`; `requires: [confirm("9903.82.18")]`;
   `exceptions: ["9903.82.01"]`; `rate: { kind: "adValorem", pct: 25 }` (see open question 1);
   `effective: { from: "2026-04-23" }`;
   `source: { revision: "2026HTSRev6", citation: "Proclamation 10984, clause 13", note: "U.S. note 16(h); effective date from change record" }`.
   The name says it needs Commerce authorization, and the description quotes the heading text.
2. Add `9903.82.19` the same way, with `codes: [{ list: "aluminum16ci" }]` and note 16(i).
3. Convert `9903.82.02` to `tariffVersions(…)`: the current record gets `from` left open (as
   today), plus a change `{ from: "2026-04-23", set: { exceptions: [...current, "9903.82.18", "9903.82.19"] } }`.
   This is note 16(a)'s mutual exclusivity: "an imported article will be subject to no more than
   one of these headings". 9903.82.02 is the only heading whose scope overlaps (c)(i) and
   (c)(iii) for Canada and Mexico. 9903.82.04 (UK) and 9903.82.14 (Russia) can't overlap by
   country.

No `9903.82.03` exception on the new headings: note 16(c) still limits the 15% weight rule to
"headings 9903.82.02 and 9903.82.04–9903.82.17", and every (c)(i) and (c)(iii) code is in
chapter 72, 73 or 76 anyway.

**Tests and pinned cases** (new `describe` block in `testing/engine-v2/real-data.test.ts`, as of
2026-04-24):
- 7206.90.00.00 from CA, 9903.82.18 confirmed → .18 applies at 25% ($2,500), .02 excluded,
  9903.03.06 applies ($0).
- Same, not confirmed → .18 needs an answer, .02 applies at 50% ($5,000).
- Same, confirmed, as of 2026-04-22 → .18 not a candidate, .02 applies at 50%.
- 7206.90.00.00 from CN, .18 "confirmed" → not a candidate (country scope), .02 applies.
- An aluminum (c)(i) code (7601 or 7606, base rate copied from the USITC export into `RATES`)
  from MX, .19 confirmed → .19 at 25%, .02 excluded.
- `validateRules()` passes with no new errors.

### CR-2: note 16(a)–(c) range 9903.82.02–.17 → 9903.82.02–.19

**Legal text.** 16(a) "headings 9903.82.02–9903.82.19 provide the ordinary customs duty
treatment… These headings are mutually exclusive"; 16(b), duties "collected in addition to any
special rate of duty"; 16(c), "Headings 9903.82.02–9903.82.19 apply to the full customs value".
The 15% weight sentence still says "9903.82.02 and 9903.82.04–9903.82.17" (unchanged).

**Recipe.** No new record of its own. Each clause is already met by the CR-4/CR-8 records:
- Mutual exclusivity → the new `9903.82.02` exception version above.
- 16(b), stacking on FTA rates → the engine's default: an `adValorem` Chapter 99 rate stacks on
  the Special-column base rate.
- 16(c), full customs value → default `fullValue` basis.
- 16(c) 15% rule → not extended, so no change (above).

The (c)(ii) 7612.10.10 → 7612.10.00 change is CR-3 (below). The (c)(vii) change is punctuation
only, with an identical code list.

**Effective date.** 2026-04-23 (change record CR-2, "Notice").

### CR-3: note 16(c)(ii) technical correction, 7612.10.10 → 7612.10.00

**Legal text.** Change record: "Technical correction (7612.10.10 changed to 7612.10.00)",
effective **April 6, 2026**, source **PP 11021**. The (c)(ii) list in 2026HTSRev6 reads
"| 7308.20.0035 | 7610.10.00 | 7610.90.00 | 7612.10.00 |".

**Engine state.** `aluminumDerivatives16cii` in `lists.generated.json` already has `7612.10.00`,
and no list contains `7612.10.10`. The legacy data had the corrected code, so the engine already
matches the law as corrected from April 6.

**Edit.** None to data. I'll add a `source.note` on the list only if the generated-list format
supports it without hand-editing generated JSON. If it doesn't, the PR records it.

**Tests.** Pinned case: 7612.10.00 (a base rate from USITC) from VN on 2026-04-10 → 9903.82.02
applies. This pins that the corrected code is covered in Rev 5's date range too.

### CR-1: note 2(aa)(v)(1), Section 122 exemption range → 9903.82.04–.19

**Legal text.** "As provided in heading 9903.03.06, the additional duty imposed by heading
9903.03.01 shall not apply to: (1) … articles provided for in headings 9903.82.02 and
9903.82.04–9903.82.19;"

**Recipe.** §17.2 applied to an exemption's trigger list: a new version of `9903.03.06`.

**Edit**, in `tariffs/engine-v2/data/headings/122.ts`: convert `9903.03.06` to
`tariffVersions(base from 2026-02-24, [{ from: "2026-04-23", set: { scope: { …, whenApplies: { codes: [...existing, "9903.82.18", "9903.82.19"] } } }, source: { revision: "2026HTSRev6", note: "U.S. note 2(aa)(v)(1) range extended to 9903.82.19" } }, { from: "2026-07-24", ends: true }])`.
The base keeps its 2026-07-24 end, which moves into the `ends` change (tariffVersions rejects a
base `to`).

Strictly, the note excludes 9903.82.03 and the engine's list includes it, and 9903.82.01 is
already a known question (PROGRESS Q11). I'm not touching either here.

**Effective date.** 2026-04-23 (change record CR-1, "Notice").

**Tests.** The CA 9903.82.18 pinned case above asserts that 9903.03.06 applies and 9903.03.01 is
excluded. To isolate .03.06 from the USMCA 122 exemption (9903.03.07), the case doesn't claim
USMCA.

### CR-5, CR-6, CR-7: notes 33, 38(a)(1)/(h)(1), 39(a)(5), metals exclusion range → .19

**Legal text.** In all 13 subdivisions of note 33, and in 38(a)(1), 38(h)(1) and 39(a)(5),
"…provided for in headings 9903.82.02 and 9903.82.04–9903.82.17" becomes "…–9903.82.19". In
other words, autos and auto parts, MHDVs and their parts, and 9903.79.01 semiconductors are not
subject to these metals duties.

**Engine state.** The engine **doesn't model these exclusions at all**, for any metals heading.
`interactions.ts` is empty, and no metals heading lists a 9903.94/.74/.79 heading as an
exception. I checked it on real data: an 8708.10.30 part from JP with 9903.94.43 and 9903.82.09
both confirmed charges both ($1,250 + $2,500).

**Effect of this revision.** The new headings' lists (`steel16ciii`, `aluminum16ci`) share no
codes with `automobiles33B`, `automobileParts33G`, `autoPartsOfUK33J`, `partsOfMHDVs38i`,
`mediumAndHeavyDutyVehicles`, `busesAndSimilarVehicles` or `semicondutorArticles39B`. The only
possible overlap is through the broad "all codes except a list" auto-parts headings (PROGRESS
L9), which is the same pre-existing gap .02 already has.

**Edit.** None for this revision. Extending a rule the engine doesn't implement would be
a no-op. See open question 3.

**Effective date.** 2026-04-23 (change record CR-5/6/7, "Notice").

---

## Engine logic changes

**None.** CR-2 and CR-4 are categorized `mixed`, but every condition maps onto existing
handlers: `answer` (via `confirm()`), `adValorem`, `fullValue`, and heading `exceptions`. No
handler, pipeline or type change is planned. If the answer to open question 1 needs a
column-specific rate, that's still data (`rateByColumn`), not logic.

---

## Not doing

- **#9 (defer), note 13(e)(vi):** a stray trailing "-" dropped after 4421.90.9760. Cosmetic.
- **#10 (defer), note 19:** 19(g)(iv)/19(o)(iv) cross-matched as "renumbered". An artifact
  ("heading" wording only). Cosmetic.
- **#11 (defer), note 20:** 15 hyphen, IUPAC-name and extraction-noise differences in expired 301
  exclusion text. One is a garbled extraction ("sharピング levers" for "sharpening levers" in
  20(jjj)(75)), and two IUPAC names swap between 20(vv)(25) and 20(vvv)(iii)(20). No duty effect.

I read the word diffs of all three myself. None changes a code, rate or date, so none affects
duties in this revision.

---

## Assumptions

1. **Country scope CA/MX.** "Melted and poured / smelted and cast in Canada or Mexico" plus
   USMCA origin means country of origin CA or MX. Goods of other origin can't qualify.
2. **One confirmation question covers all three conditions, plus "limited quantities".** These
   are melt/pour or smelt/cast location, USMCA qualification, and Commerce authorization. It
   follows the 9903.82.04 (UK 95%) pattern. I'm **not** gating on `preferenceClaimed: S`: the
   engine refuses a USMCA claim on lines whose General rate is Free (verified on 7206.90.00.00:
   "Trade preference S isn't available"), and most (c)(i)/(c)(iii) lines are Free. That gate
   would make the heading unreachable.
3. **Unconfirmed → 9903.82.02 at 50% applies.** This is the standard §10.2 default: the
   importer pays the higher rate until they confirm authorization.
4. **No 9903.82.03 or 9903.82.06 exceptions on the new headings.** 9903.82.03 is barred by
   16(c)'s unchanged ".04–.17". 9903.82.06 (95% U.S. melt) doesn't cover (c)(i) or (c)(iii).
5. **9903.82.02's description stays as is.** It may read differently in Rev 6 (e.g. adding
   ".18, .19" to "Except as provided for in…"), but heading text outside the change record isn't
   in the package, and the exception list carries the legal effect.
6. **CR-3 needs no dated list change.** The correction is effective April 6 and the engine has
   always had 7612.10.00, which is correct for every verified date (Rev 5 starts April 8).

## Open questions

1. **Rate columns for 9903.82.18/.19.** headings.md has General "no change", Special
   "+ 25%", Column 2 "no change". My guess is that the PDF table shifted a column, and the
   heading is really "+25%" in General. Taken literally, it would also work, since only
   USMCA-qualifying goods are eligible. **I propose 25% in every column** (one `rate`, no
   `rateByColumn`). Otherwise, unconfirmed or Free-general entries would get "no change", which
   the engine can't express as "doesn't displace .02". Can you confirm the PDF row?
2. **Mark 2026HTSRev6 verified?** All approved changes would be implemented, and none of the
   deferred ones affects duties, so I plan to add it to `VerifiedTariffRevisions`. The caveat is
   question 3: the auto/MHDV/semiconductor exclusions are missing for every metals heading, not
   just the new ones. Is that acceptable for "verified", given Rev 5 was verified with the same
   gap?
3. **Pre-existing gap: notes 33/38/39 metals non-stacking isn't modeled.** Fix it in this
   revision (a `noStack` interaction, autos/MHDV/semis over `232-metals`, from these notes'
   start dates), or separately? I recommend separately: it changes Rev 5 results and needs its
   own pinned cases and a check of the partial "U.S. content" auto headings.
4. **Manifest labels.** The `sourceFiles` paths say `2025HTSRev6`. Is that worth fixing in the
   revision checker?

---

## Decisions after review (Oct 2, 2026)

1. **Rate columns:** 25% in **Special only**, as headings.md says. 9903.82.18/.19 apply only when
   the user claims USMCA (`preferenceClaimed: S/S+`) and confirms the note 16(h)/(i) conditions.
   This replaces assumption 2 and open question 1.
2. **USMCA on Free lines:** every 16(c)(iii) steel line is free under General with no special
   column, so a USMCA claim was refused and .18 could never apply. **Engine change** in
   `calculate.ts` (`getAvailablePreferences`): when General is "Free" and the special column is
   empty, S and S+ are available (for their countries, CA/MX). This also lets 9903.03.07/.08
   exempt Free USMCA goods from Section 122.
3. **Notes 33/38/39 non-stacking: fixed here.** It's a `noStack` interaction
   (`232-metals-not-on-autos-mhdv-semiconductors`) with two dated versions: the .02/.04–.17 range
   until 2026-04-23, then .02/.04–.19. The first group is the headings each subdivision names:
   9903.94.01/.05/.07/.31–.33/.40–.45/.50–.55/.60–.65, 9903.74.01/.02/.08/.09 and 9903.79.01. The
   first version has no start date. This is a §14.7 correction, so Rev 5 results change for
   confirmed auto, MHDV and semiconductor goods.
4. **Verified:** 2026HTSRev6 added to `VerifiedTariffRevisions`.
5. **Manifest `2025HTSRev6` paths:** a typo for 2026; nothing to change here.

## Follow-up fixes (Oct 2, 2026, after the note 16(a) check)

6. **Note 16(a) mutual exclusivity.** A brute force over the real engine (one code per list
   combination × 11 countries × 4 base rates × USMCA claim on/off × every answer combination ×
   Rev 5 and Rev 6 dates) found existing headings applying together. Fixed in place as
   corrections, since the text settles each case:
   - 9903.82.08 over .10/.11: 16(f) applies to articles "that do not meet the requirements
     described in subdivision (e)".
   - 9903.82.12 over .07/.08/.10/.11: 16(e)/(f): "Except as provided for in headings
     9903.82.12 and 9903.82.17".
   - 9903.82.13 over .05/.06/.09/.15/.16: 16(g) covers articles "that otherwise meet the criteria
     of subdivisions (c)(vi)–(viii)".
   - 9903.82.15 over .02/.09/.14/.16: 16(e) lists .15 among the U.S.-content headings. Its
     legacy "base < 10%" condition became a 95%-U.S.-content confirmation, and .14 lost its
     "base ≥ 10%" condition (PROGRESS Q4).
   - **Assumption:** 9903.82.06 over .04 (UK). The text gives no order and the facts contradict;
     this matches the existing .05 vs .06 resolution.
   - A permanent brute-force test (`note 16(a) mutual exclusivity`) checks it.
7. **Other notes 33/38/39 exclusions**, as `noStack` interactions (corrections, undated):
   - 39(a)(1)–(4) and (8): 9903.79.01 over auto, MHDV and IEEPA (9903.01.24–.76, 9903.02.01–.71)
     headings.
   - Wood: 33(f), (j), (l), (o), (p)(iii), (q)(iii), (r)(iii), (t) and 38(h)(4) remove
     9903.76.01–.03; 33(t)(2) also removes 9903.76.23 for 9903.94.62–.65.
   - Canada 9903.01.10 / Mexico 9903.01.01: 33(a), (f), (p)(iii), (r)(iii), 38(a), (h) and
     39(a)(6)–(7). Those IEEPA headings aren't in the data (they ended Feb 24, 2026), so this
     has no effect until they're backfilled.
