# Plan: apply 2026HTSRev15 (2026HTSRev14 → 2026HTSRev15)

Package checks: `allDecided` true; `contentHash` matches `changes.json` (`584ec8d0…d9d5cb`);
`fromRevision` 2026HTSRev14 is the latest in `VerifiedTariffRevisions`; `consecutive` true.
No `context.md`. Revision dates: 2026-08-03 → 2026-08-14 (entries through August 13, 2026).
1 approved, 0 deferred, 4 skipped. No reviewer notes. Headings come from the revision's own
heading pages (`headings.md`, reviewed).

---

## A. 9903.04.63 (UK patented pharmaceuticals): +10% → +0% (CR-1)

- **Change record:** "9903.04.63 | Modified (rates of duty) | July 31, 2026 | Notice".
- **Heading in Rev 15:** "Patented pharmaceutical articles that are the product of the United
  Kingdom as defined in subdivisions (c) and (g) of U.S. note 40 to this subchapter | The duty
  provided in the applicable subheading +0%" (General and Special). Column 2 is unchanged.
- **Before (engine, Rev 14):** `rate: { kind: "adValorem", pct: 10 }`.

**Legal effective date: July 31, 2026**, the day the heading itself started, so the new rate
covers the heading's whole life. Note 40(g) (when .63 applies) is unchanged.

**Recipe:** §14.7 case 1 (a retroactive law change starting at the family's start date), so it's
edited **in place**: `rate: { kind: "free" }` (as for .65/.66's "+ 0%"), with the source citing
Rev 15. `rateByColumn` is dropped, since it's free in every column now. The heading stays as a $0
line, so UK patented pharmaceuticals still show 9903.04.63, and it still displaces .60 under 40(a).

**Tests:** the Rev 14 case "UK +10% ($1,000)" becomes $0, with a comment (the law changed).

## B. Engine logic

None.

---

## Not doing

Skipped by you:
- #2 note 2 (2 differences).
- #3 note 13.
- #4 note 20 (22 differences).
- #5 note 39.

## Assumptions

1. "+0%" means no additional duty (`free`), as for .65/.66.

## Open questions

1. **Onshoring now costs UK importers more.** Your Rev 14 decision was: the country heading by
   default, and a confirmed onshoring plan (9903.04.64, +20%) takes precedence. With .63 at 0%,
   a UK company that confirms onshoring would go from **$0 to $2,000**. Options:
   - **(a) Keep the rule as decided:** onshoring wins when confirmed, even for the UK.
   - **(b) Recommended: the UK's .63 wins over onshoring,** since it's now free. The onshoring
     question can't raise a UK estimate. Japan, the EU, Korea, Switzerland and Liechtenstein keep
     the Rev 14 rule (onshoring wins when confirmed).

   If (b), it's an in-place change to the exceptions (.63 stops listing .64; .64 lists .63), with a
   test.

## Changelog drafts (to add in phase 2)

- **revision, "HTS Revision 15 (2026)":** "Verified tariff data now covers entries through August
  13, 2026. Patented pharmaceuticals from the United Kingdom no longer pay an additional Section
  232 duty, back to July 31, 2026."
- **fix, "No Section 232 duty on patented pharmaceuticals from the UK":** "Patented pharmaceuticals
  from the United Kingdom entered from July 31, 2026 no longer show the additional 10% Section 232
  duty. HTS Revision 15 set their rate to 0% from the start of the pharmaceutical duties."

---

## Decisions after review (Oct 2, 2026)

1. **Open question 1: (a), keep the rule.** The country headings take precedence by default, and
   a confirmed onshoring plan (.64) takes precedence over them, the UK included. So a UK company
   that confirms onshoring goes from $0 to $2,000. No change to the exceptions; pinned by a test.
2. **Changelog:** only the revision entry. The two Rev 14 drafts were unpublished, so they were
   corrected to say UK patented pharmaceuticals pay no additional duty, and no separate fix entry
   is needed.
