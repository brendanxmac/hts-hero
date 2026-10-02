# Plan: apply 2026HTSRev10 (2026HTSRev9 → 2026HTSRev10)

Package checks: `allDecided` true; `contentHash` matches `changes.json` (`1983b288…7d1f8b`);
`fromRevision` 2026HTSRev9 is the latest in `VerifiedTariffRevisions`; `consecutive` true.
No `context.md`. Revision dates: 2026-06-08 → 2026-07-01 (entries through June 30, 2026).
28 approved, 4 skipped, 0 deferred. No reviewer notes.

**What this revision is:** a Section 232 metals restructuring under **Proclamation 11032,
effective June 8, 2026** (every item; that's also Rev 10's start date). It:
- moves 62 codes out of 16(c)(vii) steel derivatives, mostly to (x), and adds a new (xi) list,
  "mobile industrial equipment";
- lowers the U.S.-content test in 16(e) from 95% to **85%**;
- adds new relief headings 9903.82.20–.26: USMCA content split (16(j)), partner-country 15%,
  and parts for agricultural/industrial equipment (16(k));
- extends every "9903.82.02 and 9903.82.04–9903.82.19" reference to "…–9903.82.26".

All of it becomes **dated versions from 2026-06-08**. Earlier dates are unchanged.

---

## A. Note 16(c) lists (CR-4–9)

Computed by comparing the full note text of both revisions. The engine's lists match the Rev 9
note exactly today.

| List | Change from 2026-06-08 |
|---|---|
| (vi) `aluminumDerivatives16cvi` | +3701.30.00; −8415.90.80.10/.20/.45/.85 (to (ix)), −8708.29.21 |
| (vii) `steelDerivatives16cvii` | −62 codes (to (x) and the new (xi)); +9403.20.00.75, 9403.20.00.82, 9403.99.90.40 |
| (ix) `aluminumDerivatives16cix` | +8415.90.80.10/.20/.45/.85, 8708.29.21.30 |
| (x) `steelDerivatives16cx` | +34 codes from (vii) (A/C parts, tractors, ag machinery, auto parts, 8708.29.21.20) |
| (xi) new `steelDerivatives16cxi` | 28 codes: forklifts and work trucks (8427), earthmoving (8429), their parts (8431.20/.42/.49.90), certain tractors (8701.xx.50) and special vehicles (8705.10/.20) |

**Effect on duties:** moved codes follow their new list. For example, A/C parts and tractors move
from the 25% (c)(vi)–(viii) treatment (9903.82.09) to the 10%/15% top-up treatment for
(ix)–(x) (9903.82.07/.08/.10/.11).

**Recipe.** §17.5 (codes move between lists). Each list gets a second version from 2026-06-08
holding the Rev 10 note's codes; (xi) is new from that date.

## B. Existing headings: new versions from 2026-06-08

Rev 9 → Rev 10 heading text is from `headings.md` (CR-18–21) and notes 16(a)–(c), (e)–(g).
- **9903.82.01** ("Articles provided for in subdivision (c)…"): add (xi) to its scope.
- **9903.82.06** (now "(c)(ii), (iv), (vi)–(viii), (xi) and (e)"): add (xi). Name and description
  change to 85%. It gives way to 9903.82.23/.24, the (k) parts headings for U.S.-content goods;
  see assumption 3.
- **9903.82.07 / .08:** names change from 95% to 85% (note 16(e)). No scope change, since they
  follow the (ix)/(x) lists.
- **9903.82.09** (now "Except as provided for in headings 9903.82.16, 9903.82.20–9903.82.26 and
  9903.85.68 … (c)(vi)–(viii) and (xi)"): add (xi); add .20–.26 to its exceptions.
- **9903.82.13** (16(g): "(c)(vi)–(viii) and (xi)"): add (xi).
- **9903.82.15** (Russia, U.S.-content; now "(c)(iv), (vii), (viii), (xi) and (e)"): add (xi);
  name changes to 85%.
- **9903.82.16** (Russia; now "(c)(vii)–(viii) and (xi)"): add (xi).
- **Weight rule (16(c)):** the 15% metal-weight rule now also covers ".20–.26", so every new
  heading lists 9903.82.03 as an exception.

## C. New headings (CR-22–28, notes 16(j) and (k))

| Heading | Text (headings.md) | Model |
|---|---|---|
| **9903.82.20** | (c)(xi) derivative steel, 16(j) (USMCA): "+ a duty of 25%" | CA/MX; requires a USMCA claim (S/S+); 25% on the **non-U.S. content plus U.S. content above 40%** of value |
| **9903.82.21** | same: "No change" | CA/MX; USMCA claim; free on the **U.S. content up to 40%** of value |
| **9903.82.22** | (c)(xi) of AR, EC, SV, GT, JP, KR, LI, CH, TW, GB, EU: "15%" | those countries; `topUpTo 15` (see open question 2) |
| **9903.82.23** | (e)+(k), column 1 < 10%: "10%" | `topUpTo 10`; requires base < 10 and confirming (k) use and 85% U.S. content |
| **9903.82.24** | (e)+(k), ≥ 10%: "No change" | free; base ≥ 10 |
| **9903.82.25** | (k) not (e), < 15%: "15%" | `topUpTo 15`; base < 15 and confirming (k) use |
| **9903.82.26** | (k) not (e), ≥ 15%: "No change" | free; base ≥ 15 |

**Note 16(k):** "headings 9903.82.23–9903.82.26 apply to parts classifiable in the provisions of
subdivision (c)(vi)–(viii) … in chapters 84, 85, or 87 … used exclusively in the manufacturing of
agricultural equipment or fixed industrial equipment … or mobile industrial equipment …
Headings 9903.82.23–9903.82.26 do not apply to products of any country identified in general
note 3(b)." Note 16(e)/(f) confirm that the plain 10% and 15% rates mean a total: "heading
9903.82.07 or 9903.82.23 applies and the sum of the column 1 duty rate and the additional ad
valorem rate of duty will total 10 percent".

**New list `metalsPartsForEquipment16k`:** the Rev 10 (vi)–(viii) codes in chapters 84, 85 and 87.
The .23–.26 headings use it and exclude the Column 2 countries (BY, CU, KP, RU).

**Precedence, so that note 16(a)'s "no more than one" still holds:**
- .01 (no metal) beats everything.
- .03 (weight rule) beats .20–.26.
- .13 (motorcycle parts) beats the (vi)–(viii)/(xi) headings, including .20–.26.
- .09 gives way to .20–.26, as its heading text says.
- .25/.26 give way to .06/.23/.24, since 16(f) says "do not meet the requirements described in
  subdivision (e)".
- .06 gives way to .23/.24, and beats .20/.21/.22 (assumption 3).

The exclusivity brute force test moves to .02–.26, adds the new lists, and tries U.S. content
answers, so it checks all of this.

## D. Engine logic: new value basis (needed for 9903.82.20/.21), called out for scrutiny

Note 16(j): "Heading 9903.82.20 applies to the non-U.S. content of such derivative steel
articles and to U.S. content that exceeds 40 percent of the value … Heading 9903.82.21 applies to
the U.S. content that does not exceed 40 percent of the value."

**Recipe.** §11.5 (a new mechanism).
- **New input `usContentPct`:** "U.S. content (% of value): the value of parts produced in the
  United States".
- **New basis handler `usContentShare`:** `{ cap: 40, part: "upToCap" | "rest" }`.
  - `upToCap` → value × min(US%, 40) / 100.
  - `rest` → value − that.
  - Unanswered → "unknown", so the headings wait for an answer and 9903.82.09's full 25% applies
    meanwhile. That's the conservative default (§10.2).
- **Interplay:** .09 already treats .20 and .21 as partial exceptions, so it keeps nothing once
  both apply. The new handler gets its own unit tests: below, at and above 40%, and unanswered.
- **Never changes existing handlers** (§11.4).

## E. Cross-references (CR-1, CR-15–17)

- **9903.03.06 (Section 122):** note 2(aa)(v)(1) extends to ".26" → new version from 2026-06-08
  adding .20–.26. (The 9903.82.02 question is open question 1.)
- **Notes 33 (all subdivisions, incl. (u)), 38(a)(1)/(h)(1), 39(a)(5):** the metals exclusion
  extends to .26 → the metals `noStack` interaction gets a version from 2026-06-08 adding
  .20–.26 to its losers.
- **Note 35(c)** (Taiwan aircraft) is unchanged, so its rule stays at .02/.04–.19.
- **38(i):** only the table-header label changed; nothing to do.

---

## Not doing

Skipped by you: #29 note 2, #30 note 19, #31 note 20 (45 differences), #32 note 39. All are
extraction noise, consistent with earlier revisions.

## Assumptions

1. **(xi) is a new list from June 8.** The 62 codes leaving (vii) stop getting 9903.82.09 that day.
2. **9903.82.22's plain "15%" is a total including the base rate** (`topUpTo 15`), like .23/.25,
   where notes 16(e)/(f) say so explicitly, and like the earlier deal headings.
3. **9903.82.06 (85% U.S.-melted) beats .20/.21/.22,** and the (k) headings .23/.24 beat .06. The
   text gives no order between alternatives whose facts can overlap. This matches the earlier
   choices (.06 beat the UK heading; specific beats general).
4. **9903.82.20/.21 require a USMCA claim**, since 16(j) covers articles "eligible for special
   tariff treatment under the United States-Mexico-Canada Agreement". U.S. content is a new
   answer the importer gives.
5. **(k) "used exclusively in manufacturing" equipment, and the 85% U.S. content for .23/.24, are
   confirmations,** like the existing (e) headings.

## Open questions

1. **Note 2(aa)(v)(1) now reads "headings 9903.82.04 and 9903.82.04–9903.82.26".** Taken
   literally, 9903.82.02 (the main 50% metals heading) loses its Section 122 exemption from June 8
   to July 24. The duplicated ".04" looks like a drafting typo for ".02". **I propose keeping
   9903.82.02 in the exemption.** Can you confirm?
2. **9903.82.22 at 15%:** a total including the base rate (my assumption), or 15% on top?

## Changelog drafts (to add in phase 2)

- **revision, "HTS Revision 10 (2026)":** "Verified tariff data now covers entries through June
  30, 2026. From June 8, 2026, Section 232 metals duties are restructured: mobile industrial
  equipment like forklifts and earthmovers gets its own list, many machinery and A/C parts move to
  the lower 10–15% rates, the U.S.-content threshold drops from 95% to 85%, and new relief
  applies to parts for agricultural and industrial equipment."
- **improvement, "Lower Section 232 rates for parts used to build agricultural and industrial
  equipment":** "From June 8, 2026, steel, aluminum and copper parts used only to manufacture
  agricultural, industrial or mobile equipment pay 10% or 15% including the regular duty,
  instead of 25%."

---

## Decisions after review (Oct 2, 2026)

1. **Open question 1, the 2(aa)(v)(1) typo: keep it as written.** From 2026-06-08, 9903.82.02 is
   not in 9903.03.06's triggers, so 9903.82.02 goods pay Section 122 until it ends on 2026-07-24.
   It's fixed in the next revision. The gap is part of the legal record, which matters for refund
   claims. Pinned by a test.
2. **Open question 2:** 9903.82.22's 15% is a total (`topUpTo 15`), with a `TODO(review)` comment
   in the record.

## Found while implementing

- **The legacy motorcycle-parts list** (in 9903.82.06/.09/.13) still held codes that moved out of
  (vi)–(viii) on June 8. From June 8, .06/.09 drop it (it was redundant: every code is in a (c)
  list), and .13 uses the (vi)–(viii) chapter 84/85/87 parts list plus (xi), matching 16(g).
- **UK 9903.82.05** overlaps the (k) headings, so it gives way to .23–.26 from June 8 (the same
  rule as .06: the specific end-use relief wins).
- **The 9903.82.20/.21 split** is one article under two headings by design (16(j)). The exclusivity
  test counts it as one treatment.
