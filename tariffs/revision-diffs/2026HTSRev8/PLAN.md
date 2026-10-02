# Plan: apply 2026HTSRev8 (2026HTSRev7 → 2026HTSRev8)

Package checks: `allDecided` true; `contentHash` matches `changes.json` (`dd133b16…47d3`);
`fromRevision` 2026HTSRev7 is the latest in `VerifiedTariffRevisions`; `consecutive` true.
No `context.md`. Revision dates: 2026-05-22 → 2026-05-28 (entries through May 27, 2026).

The change record's only Chapter 99 item is U.S. note 38(i). Its other items (general notes
16(a) and 16(c), chapter 98 notes and 9819.11.12, Statistical Annex A) are outside Chapter 99 and
aren't modeled by the engine.

---

## Approved changes

### CR-1: U.S. note 38(i), MHDV parts, made "subject to" Commerce import adjustment offsets (effective 2025-11-01, Notice)

**Text before:** "The rates of duty set forth in heading 9903.74.08 apply to parts of medium- and
heavy-duty vehicles classifiable in the provisions of the HTSUS enumerated in this subdivision:"

**Text after:** "Subject to a manufacturer's import adjustment offset amount that may be
determined by the Secretary of Commerce under Proclamation 10984 of October 17, 2025 (90 FR
48451), the rates of duty set forth in heading 9903.74.08 applies to parts of medium- and
heavy-duty vehicles classifiable in the provisions of the HTSUS enumerated in this subdivision:"

**The code list is unchanged:** 183 codes before and after. The engine's `partsOfMHDVs38i`
matches the note exactly (the only code not in it is 9903.74.08, the heading itself). The
`| tariff_code | column_2 | column_3 | column_4 |` row in the new text is a table header picked
up by the PDF extraction, not legal text.

**What changes legally:** 9903.74.08's 25% can be reduced by an offset that Commerce sets per
manufacturer. The offset isn't a rate in the HTS. It depends on who the manufacturer is and what
Commerce has approved for them, so it can't be worked out from an HTS code, country and date.

**Engine:** no import adjustment offset is modeled anywhere. Note 33(g) has carried the same
wording for auto parts (Proclamation 10925) since before Rev 5, and the engine charges those
headings' full rate.

**Recipe.** None of §17 applies. Modeling an offset would be a new mechanism (§17.9 / §11.5):
a new input for the manufacturer's offset and a rate handler that subtracts it.

**Edits (no change to duties):**
- `9903.74.08` (`232-mhdv.ts`): set
  `source: { revision: "2026HTSRev8", citation: "Proclamation 10984", note: "U.S. note 38(i): duty is subject to a manufacturer's import adjustment offset set by Commerce (Notice, effective 2025-11-01). Offsets aren't modeled; the full rate is charged, as for note 33(g)." }`.
- PROGRESS.md: record offsets (notes 33(g) and 38(i)) as a known limitation.

**Legal effective date:** 2025-11-01 (change record, "Notice"). That's before verified history
starts (Rev 5, April 2026), and nothing about duties changes, so there's nothing to date.

**Tests:** none new, because duties don't change. The existing MHDV pinned case (tractor →
9903.74.01) and the full suite must still pass.

---

## Engine logic changes

None.

## Not doing

- **#2 (defer), note 2(s):** "expeditiously" → "expediently". Wording only.
- **#3 (defer), note 20:** 17 differences, all extraction noise. Several exactly undo Rev 7's
  differences: 20(yyy) back to 20(qqq), "film" back to "file", "sharpening" back to the garbled
  "sharピング", "of" removed. The PDF text extraction is flipping between parses, not the HTS
  changing.

None of these affects duties, so Rev 8 can be marked verified.

## Assumptions

1. **The full 9903.74.08 rate stays.** Without a manufacturer's Commerce-approved offset, the
   rate applies as written. The calculator can't know an offset, the same as for auto parts
   under note 33(g).

## Open questions

1. **Model import adjustment offsets?** It would cover both notes 33(g) (auto parts) and 38(i)
   (MHDV parts). The simplest version is an optional answer, "Commerce-approved offset for this
   entry (USD or % of value)", that reduces 9903.74.08 or 9903.94.05/.42/.43/.52/.53/.62/.63.
   It's a new handler and input, so it needs its own change and pinned cases. Not part of this
   revision unless you want it.
2. **Note 20 extraction noise.** It flip-flops between revisions (Rev 7 and Rev 8 undo each
   other). Worth a look in the revision checker's parser, so these stop showing up as
   differences.

## Changelog draft (to add in phase 2)

- revision, "HTS Revision 8 (2026)": "Verified tariff data now covers entries through May 27,
  2026. No duty rates changed in Chapter 99. The note for medium- and heavy-duty vehicle parts
  now says their Section 232 duty can be reduced by a manufacturer's import adjustment offset
  approved by Commerce; estimates show the full rate."

---

## Decisions after review (Oct 2, 2026)

1. **Offsets: not modeled.** The offset headings keep requiring review. Checked: 9903.74.08 and
   9903.94.05/.42/.43/.52/.53/.62/.63 all already need the user's confirmation before they're
   charged. No change beyond the source note.
2. **Note 20 parser noise:** leave it.
