# Plan: apply 2026HTSRev17 (2026HTSRev16 → 2026HTSRev17)

Package checks: `allDecided` true; `contentHash` matches `changes.json` (`01122714…fe7cec4`);
`fromRevision` 2026HTSRev16 is the latest in `VerifiedTariffRevisions`; `consecutive` true.
`context.md`: "2026 HTS Revision 17 of the HTS added and temporarily suspending tariffs on specific
goods from Canada under the legal authority of Section 338. These new tariffs stack ontop of
additional duties". Revision dates: 2026-08-24 → 2026-09-02 (entries through September 1,
2026). 18 approved, 0 deferred, 4 skipped. No reviewer notes. Headings come from the revision's own
heading pages (`headings.md`, reviewed).

**What this revision is:** a **50% additional duty on listed products of Canada** under Section 338
(Proclamations 11046, 11047, 11048 and 11056), from **August 22, 2026** (change record), in a new
U.S. note 51 with headings 9903.03.12–.16. August 22 falls inside Rev 16 (Aug 14–23), so August
22–23 entries change too.

---

## A. The duties: 9903.03.12, .13, .14 (CR-1–7, CR-14–16; note 51(a), (b))

Note 51(a): "headings 9903.03.12–9903.03.14 impose an additional ad valorem rate of duty on imports
of products of Canada enumerated in subdivision (b)". They're "also … subject to any additional
duty provided for in this subchapter or subchapter IV" (except (c) and (d)), and apply even when
special tariff treatment (general note 3(c)(i), so USMCA) is claimed.

| Heading | Scope, 51(b) | Rate (headings.md) |
|---|---|---|
| 9903.03.12 | (b)(1): 63 provisions (beer, wine and spirits in ch. 22; cosmetics in 33; wood, paper, sporting goods) | + 50% |
| 9903.03.13 | (b)(2): 52 provisions (dairy in ch. 04, plus 05, 12, 13, 17, 19, 22, 33, 35) | + 50% |
| 9903.03.14 | (b)(3): 439 provisions across chapters 04–97 | + 50% |

Column 2: "No change" → `rateByColumn: { column2: free }`. Canada only (`countries: ["CA"]`).
Each heading lists .15 and .16 as exceptions. New lists `canada338b1`, `canada338b2`,
`canada338b3`, extracted from the note text.

## B. Exemptions: 9903.03.15 and .16 (CR-8–13, CR-17–18; note 51(c), (d))

- **9903.03.15**, (c)(1)–(8): Section 232 goods, the same headings word for word as notes
  50(a)(vi) and 52(f) as of Rev 14, including (8) "patented pharmaceutical articles provided for in
  headings 9903.04.60–9903.04.66". → `whenApplies` the shared `section232ArticleHeadingsFromJuly31`.
  `free`.
- **9903.03.16**, (d): civil aircraft "(all aircraft other than military aircraft **and unmanned
  aircraft**)" of Canada meeting general note 6, in the listed provisions. The list (554 codes) is
  identical to the existing `civilAircraftAndPartsOf`, so the new list `canada338d` includes it.
  `confirm("9903.03.16")`, like the other aircraft exemptions. `free`.

## C. Dates

Every row is effective **August 22, 2026**, except "U.S. note 51(d) | Modified | 8/12/2026 |
PP 11047, PP 11056". Heading 9903.03.16 itself is established 8/22, so I treat 8/12 as a typo for
8/22 (open question 2). No end date in the HTS text. **But see open question 1: the suspension.**

## D. Program

New program `338-canada`, "Section 338 – Canada", legal basis Proclamations 11046, 11047, 11048
and 11056. The `Authority` type has no `"338"`, so I'd add it (a one-line type change; nothing
selects by authority).

**Recipe:** §17.2 (new headings), §7.2 (new lists), §5 (program).

## E. Engine logic

None (beyond adding `"338"` to the `Authority` union).

## F. Tests ($10,000, August 26, 2026 unless stated)

- Canadian wine (2204.21.20, (b)(1)): 9903.03.12 at 50%. August 21 → none; August 22 → applies.
  It stacks with the note 52 rate (9903.05.29 10%) unless USMCA is claimed.
- With a USMCA claim (S): still 50% (51(a)), and the note 52 rate drops (9903.05.93).
- A dairy code ((b)(2)) → .13; a (b)(3) code → .14.
- The same wine from France → no 338 duty.
- A Canadian steel article under 9903.82.02 → .15, no 338 duty (if it's on a (b) list), or no 338
  line at all (if not).
- A civil aircraft part on (b)(3) and the (d) list → .14 until confirmed, then .16.

---

## Not doing

Skipped by you:
- #19 note 2 (2 differences).
- #20 note 13.
- #21 note 19.
- #22 note 20 (14 differences).

Not modeled (as for the other country programs): the chapter 98 rules in 51(a), and the
personal-use baggage exclusion.

## Assumptions

1. Effective August 22, 2026 (change record).
2. Applies with a USMCA claim (51(a): special tariff treatment doesn't exempt it).

## Open questions

1. **The suspension.** Your context says the tariffs were added and "temporarily suspend[ed]".
   Nothing in this revision's package says so: the headings read "+ 50%", note 51 has no compiler's
   note, and the change record marks every row "Established" or "Modified", not "Suspended" (a term
   its own glossary defines). PP 11056 is cited on every row and may be the suspending
   proclamation, but the HTS text doesn't say what it does. Which is it?
   - **(a) As written:** 50% from August 22, no end date.
   - **(b) Suspended:** in the HTS but not collected for a period. Then I need the dates (from when,
     until when or open-ended) and the source. I'd model it as the headings not applying during the
     suspension, with a note on the record, so the duty shows again automatically if the
     suspension ends on a known date.
2. **51(d) "Modified 8/12/2026":** a typo for 8/22? (9903.03.16 itself is established 8/22, so
   nothing can apply before then either way.)
3. **Program name:** `338-canada`, "Section 338 – Canada", with `"338"` added as an authority. OK?

## Changelog drafts (to add in phase 2; wording depends on question 1)

- **revision, "HTS Revision 17 (2026)":** "Verified tariff data now covers entries through
  September 1, 2026. From August 22, 2026, listed products of Canada, including beer, wine and
  spirits, dairy, wood and paper products, pay an additional 50% Section 338 duty, even when
  claimed under USMCA."
- **improvement, "New 50% Section 338 duty on listed Canadian products":** "From August 22, 2026,
  about 550 listed products of Canada pay an additional 50% on top of other duties, including when
  entered under USMCA. Section 232 goods and certified civil aircraft parts are exempt."

---

## Decisions after review (Oct 3, 2026)

1. **Open question 1: (a), as written.** 50% from August 22, 2026, no end date. Noted in the
   headings file.
2. **Open question 2:** 51(d)'s "8/12/2026" is a typo for 8/22.
3. **Open question 3:** `338-canada`, "Section 338 – Canada", authority `"338"` added.
