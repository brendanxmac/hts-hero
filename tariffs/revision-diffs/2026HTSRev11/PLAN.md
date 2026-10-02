# Plan: apply 2026HTSRev11 (2026HTSRev10 → 2026HTSRev11)

Package checks: `allDecided` true; `contentHash` matches `changes.json` (`b1bfb2b7…a3dc4`);
`fromRevision` 2026HTSRev10 is the latest in `VerifiedTariffRevisions`; `consecutive` true.
No `context.md`. Revision dates: 2026-07-01 → 2026-07-21 (entries through July 20, 2026).
1 approved, 0 deferred, 6 skipped. No reviewer notes.

**What this revision is (for chapter 99):** one technical correction that fixes the Revision 10
typo in note 2(aa)(v)(1). Everything else in the change record is statistical breakouts outside
chapter 99 (484(f), July 1), which don't affect Chapter 99 duties.

---

## A. Note 2(aa)(v)(1) technical correction (CR-1)

**Change record:** "U.S. note 2(aa)(v)(1), ch | Technical correction | April 6, 2026 | PP 11021".
The row is cut off ("ch"); the only note 2(aa)(v)(1) in chapter 99 is in subchapter III.

**Text (subchapter III, U.S. note 2(aa)(v)(1)), checked against both reference files:**
- Rev 10: "articles of aluminum, of steel, or of copper or derivative aluminum or steel articles
  provided for in headings **9903.82.04** and 9903.82.04–9903.82.26;"
- Rev 11: "… provided for in headings **9903.82.02** and 9903.82.04–9903.82.26;"

Every revision from Rev 5 to Rev 9 reads "9903.82.02 and 9903.82.04–…", so Rev 10 is the only
revision with the omission.

**Effect:** 9903.82.02 (the 50% metals heading) triggers the Section 122 exemption 9903.03.06
again. A 9903.82.02 article no longer pays the 10% Section 122 duty.

**Legal effective date: April 6, 2026 (change record, PP 11021).** This is before the typo took
effect (June 8), so the correction covers the whole window: as the law now stands, 9903.82.02 was
never out of the exemption.

**Recipe.** §14.7 case 1 (the law changes retroactively: record the law as it now stands) with
§17.12's mechanics. Because the effective date is earlier than the version it corrects, the fix
goes **in place** in the existing 2026-06-08 version of 9903.03.06; no new version is needed.

**Edits (`tariffs/engine-v2/data/headings/122.ts`):**
- In 9903.03.06's 2026-06-08 version, stop filtering 9903.82.02 out of
  `section232ArticleHeadings`.
- Replace the "applied as written, on purpose" comment and `source.note` with: Rev 10 as published
  omitted 9903.82.02; the Rev 11 technical correction (PP 11021, effective 2026-04-06) restores it
  retroactively. `source.revision` stays 2026HTSRev10 for that version's other changes, with the
  correction cited (`2026HTSRev11`) in the note.

**Tests (`testing/engine-v2/real-data.test.ts`):**
- Rewrite the Rev 10 pinned case "note 2(aa)(v)(1) as written leaves 9903.82.02 out…" with a
  comment saying why (§16.2: the recording of the law changed). 7206.90 steel from VN, value
  $10,000: before June 8 → 9903.03.06 + 9903.82.02, $5,000; **June 15 (the old typo window) →
  the same, $5,000** (was $6,000); July 1 (Rev 11) → $5,000.

## B. Engine logic

None.

## C. Changelog

- Edit the unpublished Rev 10 draft (`f3f3e890…`) to drop its last sentence ("As written in this
  revision, the main steel and aluminum heading (9903.82.02) also pays the 10% Section 122
  duty…"), since it's no longer true. The draft hasn't been published, so no correction entry is
  needed for it.
- New drafts in phase 2 (wording below).

---

## Not doing

Skipped by you, all outside the change record:
- #2 note 2: 2(s) wording, the usual extraction flip-flop.
- #3 note 13(e)(vi).
- #4 note 19(a)(iii).
- #5 note 20 (22 differences).
- #6 note 37(a).
- #7 note 39(b)(2) formatting.

Out of chapter 99: the statistical breakouts in chapters 7–94 (July 1, 484(f)). Base-rate data
comes from the revision's HTS data, not from these records.

## Assumptions

1. The cut-off citation is subchapter III note 2(aa)(v)(1), the only note with that number.
2. "Technical correction … April 6, 2026" means the corrected text applies from April 6, so it
   retroactively replaces Rev 10's wording rather than starting on July 1.

## Open questions

1. **Effective date: retroactive (April 6), or from July 1?** In Revision 10 you kept the typo
   because the gap matters for refund claims. The change record dates the fix April 6, before the
   gap opened. That means importers who paid Section 122 on 9903.82.02 goods entered June 8–30 are
   owed it back.
   - **Retroactive (proposed):** the calculator gives the law as it now stands, so June 8–30
     entries show no Section 122 on 9903.82.02. The refund point goes in the changelog instead
     (draft below).
   - **From July 1:** June 8–30 keeps showing the 10%, as published in Rev 10. The calculator then
     shows a duty the law has since withdrawn.

   Which do you want?
2. **Found while planning, outside this revision: 9903.82.01 and 9903.82.03 trigger the Section
   122 exemption, but the note has never listed them.** Every revision's note 2(aa)(v)(1) lists
   only ".02 and .04–…". However, `section232ArticleHeadings` (migrated from the legacy data in
   Rev 5) also includes .01 (no aluminum, steel or copper) and .03 (metal under 15% of the
   article's weight). As a result, an article that qualifies for .01 or .03 skips Section 122 in
   the calculator, though by the note it should pay the 10%. Should I fix this here, as a
   data-entry correction for all dates (§17.12), or leave it for a separate change?

## Changelog drafts (to add in phase 2, assuming the retroactive date)

- **revision, "HTS Revision 11 (2026)":** "Verified tariff data now covers entries through July
  20, 2026. This revision corrects the Section 122 exemption for steel and aluminum under heading
  9903.82.02: it applies again, including to entries from June 8, 2026."
- **fix, "Section 122 duty removed from main steel and aluminum heading for June 2026
  entries":** "Steel and aluminum articles under heading 9903.82.02 entered from June 8 to June
  30, 2026 no longer show the 10% Section 122 duty. A technical correction in HTS Revision 11
  restores their exemption back to April 6, 2026, so importers who paid it may be able to claim a
  refund."

---

## Decisions after review (Oct 2, 2026)

1. **Open question 1: retroactive to April 6.** The June 8 version of 9903.03.06 is corrected in
   place, so June 8–30 entries of 9903.82.02 goods show no Section 122.
2. **Open question 2: fix here.** 9903.82.01 and 9903.82.03 are removed from
   `section232ArticleHeadings` for all dates (§17.12, a data-entry correction). The basis: note
   2(aa)(i) imposes Section 122 on "all products" except as provided; 2(aa)(v)(1) lists only
   "9903.82.02 and 9903.82.04–…"; note 16(a) treats .01 as outside .02–.26, and the "and .04"
   wording skips exactly .03. The Rev 7 pinned case for no-metal copper cable changes from $260 to
   $1,260, with a comment. PROGRESS.md question 11 is marked answered.
3. **Changelog:** the Rev 10 draft's sentence about 9903.82.02 paying Section 122 is removed. Two
   fix drafts are added (the June refund window, and .01/.03 now paying Section 122).
