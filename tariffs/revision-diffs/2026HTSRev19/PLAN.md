# Plan: apply 2026HTSRev19 (2026HTSRev18 → 2026HTSRev19)

Package checks: `allDecided` true; `contentHash` matches `changes.json` (`e5bf640d…776be1fc`);
`fromRevision` 2026HTSRev18 is the latest in `VerifiedTariffRevisions`; `consecutive` true. No
`context.md`. Revision dates: 2026-09-15 → 2026-09-28 (entries through September 27, 2026). 3
approved, 0 deferred, 7 skipped. No reviewer notes. No heading changes in the change record.

**What this revision is:** changes to **Section 338 – Canada** (note 51), all effective **September
15, 2026** (change record; PP 11064, PP 11065): two product lists grow, and the Section 232
exemption narrows to the dairy heading only.

---

## A. List 51(b)(1), 9903.03.12 (CR-1; PP 11064)

Computed by comparing both revisions' full note text (the extraction reproduces the engine's
current 63 codes exactly). **63 → 101:**
- **Added (40):**
  - cheeses (0406.10.64 … 0406.90.97, 23 codes), 1518.00.40;
  - whisky and liqueurs as statistical numbers 2208.30.60.20/.40/.55/.65/.75 and 2208.70.00.30;
  - hides and furskins (4101.50.10, 4101.90.10, 4107.11.50, 4301.60.60, 4302.19.30/.45/.60);
  - boats (8903.31.00, 8903.32.00, 8903.93.20).
- **Removed (2):** 2208.30.60 and 2208.70.00, replaced by the statistical numbers above. So
  2208.30.60.80, for example, and the other 2208.70.00 suffixes drop out.

→ `canada338b1` gets a second version from 2026-09-15 with the Rev 19 list (§17.5).

## B. List 51(b)(3), 9903.03.14 (CR-2; PP 11065)

**439 → 513:**
- **Added (82):**
  - cheese 0406.90.99;
  - paper 4802.61–.69 (10 codes);
  - steel structures 7308.90.30/.60/.95;
  - aluminum bars, profiles and tubes 7604.x, 7608.10/.20;
  - base-metal fittings 8307–8311 (16 codes);
  - control panels 8537.10.91.30/.50/.60/.70;
  - cars 8703.10.50, 8703.21.01;
  - boat 8903.99.21;
  - seats and furniture 9401.41–9401.99, 9403.30–9403.89, 9404.10–9404.29 (32 codes);
  - lamps 9405.21/.29 (6 codes);
  - 4818.90.00.20; 9507.10.00.40.
- **Removed (8):**
  - salt 2501.00.00; cement 2523.29.00; 2940.00.60; 4803.00.40; unwrought lead 7801.10.00;
  - 4818.90.00, 8537.10.91 and 9507.10.00, narrowed to the statistical numbers above. Other
    paper towels (4818.90.00.10), control panels (8537.10.91.80) and fishing rods (9507.10.00.80)
    drop out.

→ `canada338b3` gets a second version from 2026-09-15 with the Rev 19 list.

Note: several new codes are also Section 232 goods, e.g. 7308.90 and 7604 (metals), 8703.21.01 and
8703.10.50 (autos), 9401/9403 (wood furniture, metal furniture). That matters because of C.

## C. The Section 232 exemption narrows to 9903.03.13 (CR-3; PP 11064, PP 11065)

51(c): "As provided in heading 9903.03.15, the additional duties imposed by [-headings
9903.03.12–9903.03.14-] {+heading 9903.03.13+} shall not apply to:" (1)–(8) (unchanged).

So from September 15, 2026, **Section 232 goods on lists (b)(1) and (b)(3) pay the 50% on top of
their Section 232 duty.** Only the dairy list (b)(2), 9903.03.13, keeps the exemption.

→ New versions of **9903.03.12** and **9903.03.14** from 2026-09-15 with exceptions
`["9903.03.16"]` (dropping .15). 9903.03.13 keeps both. 9903.03.15 itself is unchanged (it still
appears as the $0 line when a 232 heading applies, but only displaces .13). Note 51(a)'s "Except as
provided for in headings 9903.03.15 and 9903.03.16" wasn't changed in the package.

**Recipe:** §17.3-style new versions (`tariffVersions`) of .12 and .14; §17.5 for the lists.

## D. Engine logic

None.

## E. Tests ($10,000, Canada)

- Steel furniture 9403.20.00.82 ((b)(3), Section 232 metals): September 10 → 9903.82.09 25% and
  .15, no 50% ($2,500); September 20 → .14 50% on top ($7,500).
- Wood cabinets 9403.60.80.93 (Section 232 wood, (b)(3)): the same jump.
- Cheese 0406.10.64: September 10 → no 338; September 20 → .12.
- Paper towels 4818.90.00.10: September 10 → .14; September 20 → none (narrowed to .20).
- Whisky 2208.30.60.20 → .12 both before and after; 2208.30.60.80 → .12 before, none after.
- Dairy 0402.10.05 → .13 unchanged.
- A boat 8903.31.00 → .12 from September 20.
- A dairy (b)(2) Section 232 good, if any: still exempt via .15 (unit check that .13 keeps .15).

---

## Not doing

Skipped by you (extraction noise):
- #4 chapter 99 U.S. note 1; #5 chapter 99 U.S. note 2;
- #6 statistical note 1; #7 statistical note 2;
- #8 subchapter III note 13; #9 note 19; #10 note 20 (21 differences).

## Assumptions

1. Effective September 15, 2026 for all three (change record).
2. 51(a)'s reference to 9903.03.15 stays, but .15 now only displaces .13, per 51(c).
3. List membership follows the note's numbers exactly. Where a provision was narrowed to statistical
   numbers, the other suffixes drop out.

## Open questions

None. The text is unambiguous. One thing to be aware of: C raises duties on Canadian Section 232
goods on these lists (e.g. steel furniture $2,500 → $7,500).

## Changelog drafts (to add in phase 2)

- **revision, "HTS Revision 19 (2026)":** "Verified tariff data now covers entries through
  September 27, 2026. From September 15, 2026, the 50% Section 338 duty on Canadian products covers
  more goods, including cheese, furniture, lamps, aluminum and steel structures and boats, and now
  applies on top of Section 232 duties except for dairy products."
- **improvement, "Section 338 duty on Canadian goods expanded and now stacks with Section 232":**
  "From September 15, 2026, about 120 more Canadian products pay the additional 50%, including
  cheese, furniture and seats, lamps, aluminum and steel structures, boats and some cars. Products
  that also pay Section 232 duties now pay the 50% on top, except dairy products."

---

## Decisions after review (Oct 3, 2026)

Approved as planned, with no open questions.
