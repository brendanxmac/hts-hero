# Backfilling HTS revisions: analysis and plan

Written Oct 7, 2026. Nothing in the engine or tooling has changed yet. Supporting material in this folder:

- [sizing.md](sizing.md): heading counts and changes for each revision pair from 2025HTSBasic to 2026HTSRev5, measured from USITC's archived Chapter 99 PDFs.
- [legal-timeline-DRAFT.md](legal-timeline-DRAFT.md): a map of 2025 to early-2026 legal actions. **Most rows aren't checked against official text yet. Use it to know where to look, never as a citation.**

---

## 1. The short version

- **Work backward one revision at a time, reviewing each step yourself.** Each upload you make covers two steps: the attempt for revision N-1 is the "from" side now and the "to" side in the next step.
- **Two backward steps are different from the rest.** Don't run them as normal revision steps; split each into one PR per program:
  - **2026 Rev4:** Rev5 removed **242** headings, the whole pre-April-2026 Section 232 steel, aluminum and copper structure (9903.78/.80/.81/.85). Backfilling Rev4 means rebuilding all of it, with its note 16/19 lists.
  - **2026 Rev3:** IEEPA ended Feb 24, 2026, which falls inside Rev3. The engine has **no IEEPA program at all**: no fentanyl duties, no reciprocal, no country rates. Rev3 can't be verified until the IEEPA state as of February 2026 is built.
  - After those two, 2026 Rev2 back to 2025 Basic is incremental. Seven steps have no heading changes at all.
- **Missing 9903 headings: add the ones the history depends on during the backfill, and the rest afterwards.** About 330 headings that the engine doesn't model were in force during the window. Of these, 9903.01 and 9903.02 (IEEPA) and the old 232 metals headings *are* the 2025 history: leave them out and a "verified" 2025 estimate would miss most of the duty. The rest (9903.17/.18/.52/.41/.89 and so on) are coverage work, done with coverage batches that use real dates.
- **Accuracy depends on six safeguards, listed in §5.** The two most important:
  1. An automatic full heading diff from USITC's archived PDFs, to catch anything the change record leaves out.
  2. A citation for every date, ranked by source strength. Anything weaker than a "Notice" with no document reference goes to you as an open question.
- **Base rates are a separate gap.** The calculator always loads the *latest* HTS for base rates, whatever the entry date (`components/duty-calculator/lib/useTariffFinder.ts:169`, `fetchElements("latest")`). Auditing 2025 entries and building charts over time need each revision's own base rates and 10-digit codes. This is its own workstream (§7).

---

## 2. Where we are

### 2.1 Verified range
`VerifiedTariffRevisions` covers 2026HTSRev5 to Rev20, from 2026-04-08 onward. Dates before that already show an "unverified" notice.

### 2.2 Engine data (from the engine-state audit)

**Size:** 18 programs, 293 tariff records for 260 heading codes, 116 code lists and 12 interaction records (all `noStack`).

**History before Rev5 exists only for:**
- 301 China (9903.88.69/.70, 9903.91.01–.05/.11, 9903.92.09)
- some autos headings (9903.94.02/.03/.04/.06/.31/.32)
- 9903.96.01
- the 8 lists china31b–i
- Section 122 (from 2026-02-24)

**Not modeled at all:** IEEPA (fentanyl, reciprocal, country rates, India, Brazil) and the 232 metals structure before Apr 6, 2026.
- `deals.ts` and `interactions.ts` already refer to IEEPA ranges such as `headingRange("9903.01.24","9903.01.76")`. Those references have no effect until the IEEPA headings exist.

**79 heading codes have no start date:**
- 53 records with `effective: {}`, plus 12 deal headings that have only `to: 2026-02-24`. Those 65 are listed in `MISSING_START_DATES.md`.
- 14 versioned base records that have only `to`. These aren't on that list; for example, the whole 9903.82 family, which started 2026-04-06.

**Other gaps:**
- Fees: no MPF record before 2025-10-01, so FY25 values are needed.
- Lists: 55 of 116 lists have no start date, including all 54 generated lists.

### 2.3 Undated records don't change any verified result
I checked each of the 65 against the archived PDFs. Every one first appears in the HTS in 2026 Rev5 or earlier, and stays in every revision after that. Each will be dated when the backward step for its "first in HTS" revision comes up. The list:

| First in HTS | Headings |
|---|---|
| 2025 Basic | 9903.88.01/.02/.03/.04/.15, 9903.92.10, 9903.85.67/.68 |
| 2025 Rev6 | 9903.94.01 |
| 2025 Rev18 | 9903.02.19/.20 |
| 2025 Rev23 | 9903.02.72/.73, 9903.94.40–.43, 9903.96.02 |
| 2025 Rev24 | 9903.02.74–.77, 9903.94.50–.53 |
| 2025 Rev25 | 9903.76.01/.04/.20/.21/.22 |
| 2025 Rev26 | 9903.74.01–.11, 9903.94.33/.44/.45/.54/.55 |
| 2025 Rev29 | 9903.02.78 |
| 2025 Rev32 | 9903.02.79/.80/.81, 9903.76.23, 9903.94.60–.65 |
| 2026 Rev1 | 9903.79.01 |
| 2026 Rev5 | 9903.82.03/.04/.10/.11/.12/.14/.17 |

"First in HTS" means the first revision whose archived Chapter 99 PDF contains the number. It is **evidence, not the legal date**.

### 2.4 Lessons from Rev6–Rev20 (from the 15 plans and 14 PRs)
**Package totals:** 267 approved changes, 6 deferred, 61 skipped. These are the patterns most likely to recur, and to be worse, in 2025:

- **The legal date is almost never the revision date.** It happened in nearly all 15 revisions. In 6 the change was retroactive, and in 4 the date fell inside an *earlier, already-verified* revision, which meant revisiting tests for that revision.
- **The weakest citation was common.** "Notice" with no document reference was the date source 8 times. 2025 has many more FR notices, proclamations and EOs to cite, so we should require them.
- **Old data needed fixing.** Revisions 6, 9, 10, 11 and 13 found errors left over from the legacy migration, such as missing list codes, a flat rate that should have been `topUpTo`, and a wrong Section 122 exemption. Backfilling will find more.
- **PDF extraction noise** produced every one of the 61 skipped items: text flip-flopping between revisions, garbled characters, LaTeX.
- **Gaps or errors in change records and packages** (5 times): rows cut off, wrong dates, a wrong manifest path.
- **Open questions:** 28 went back to you. Most were about program names, defaults for unanswered questions, and whether to keep a typo in the legal text.
- **New mechanisms** were needed in 5 revisions. 2025 will need more (§6).

**One technique worked very well:** Rev19 and Rev20 first checked that the extracted note lists exactly matched the engine's lists, then diffed the full note text. Every backfill step should do the same.

---

## 3. Size of the backfill
Full table in [sizing.md](sizing.md). These counts come from heading rows in the table pages of each archived Chapter 99 PDF. The method matched the coverage checker's 637 headings for Rev20 exactly, and the known start revisions it was checked against.

- **38 backward steps**, from 2026Rev4 to 2025Basic.
- **No change at all in 7 steps:** R2→R1, R10→R9, R13→R12, R15→R14, R19→R18, R22→R21, 26R2→26R1. A few more have only 1–2 small changes.
- **Busiest steps** (added + removed + approximately changed headings):

  | Step | Changes | What happened |
  |---|---:|---|
  | 26R5→26R4 | 268 | 232 metals restructure |
  | 25R18→R17 | 116 | Aug 2025 country reciprocal rates |
  | R26→R25 | 91 | MHDV, autos parts |
  | R29→R28 | 77 | reciprocal text edits |
  | R4→R3 | 63 | March 2025: fentanyl, 232 steel/aluminum |
  | R7→R6 | 50 | April 2025 reciprocal launch |
  | R17→R16 | 47 | |

- **Headings were never removed from the HTS during 2025.** Expired headings stay in the HTS, and they end through note text or the legal action. **So in 2025 the heading diff can't show when something ended.** End dates have to come from the change record and the legal source.
- **Note-only changes don't show in a heading diff.** For example, Rev9→Rev10 changed no heading rows. The change record and the notes diff are what catch these.

**Headings in force at some point from 2025Basic to 2026Rev4 (710 in all):**

| Group | Count | Detail |
|---|---:|---|
| Modeled | 91 | |
| Not modeled, still in the current HTS (in `missing.csv`) | 204 | 9903.02 (75), 9903.01 (34), 9903.52 (27), 9903.17 (23), 9903.18 (10), others |
| Not modeled, history only | 415 | |

**Of the 415 history-only headings:**
- 242 are the old 232 metals headings removed in Rev5.
- 41 are IEEPA 9903.01 headings: country rates .43–.76, China .84–.89, and others.
- About 128 old 301 exclusions and other 2019-era rows were already expired in 2025Basic. Check them row by row, but they probably need nothing.

The coverage checker shows IEEPA headings such as 9903.01.01 as "in effect", because the Rev20 HTS doesn't mark them expired. They ended Feb 24, 2026 (EO 14389). `initial-status.ts` should be corrected.

---

## 4. The process, step by step

### 4.1 What you upload (one attempt per revision, working backward)
For revision N-1, upload all three, cleaned by hand as before:
1. **N-1's change record.** It isn't used in this step; it becomes the evidence for the *next* step, when N-1 is the "to" side.
2. **The trimmed Chapter 99 PDF**: the subchapter III notes for N-1. These are the "before" notes and lists for this step.
3. **The heading pages for N-1.** These are now **required**. They're the only source of the "before" text and rates, since older revisions have no JSON (§4.3).

USITC serves both originals for any release:
- `https://hts.usitc.gov/reststop/file?release=<rev>&filename=Chapter 99`
- `https://hts.usitc.gov/reststop/file?release=<rev>&filename=Change Record`

The tool can download those for you to trim, but **only PDFs you've cleaned and uploaded go into the comparison.**

### 4.2 Each step (N-1 → N, where N is the earliest verified revision)
1. **Compare N-1 → N in the revision checker.** It reads N's change record, which is already uploaded and is the correct evidence for this step.
2. **Review each change:** approve, defer or skip, with notes, the same as now. Add a `context.md` for the busy 2025 steps.
3. **Pull the package:** `npm run pull-revision -- --backfill 2025HTSRevX`.
4. **Plan:** run `/backfill-revision 2025HTSRevX`. The plan includes:
   - the "before" record for every change
   - every date with its citation and its strength (§5.2)
   - the undated records that this step dates
   - the safeguard results (§5)
   - the pinned cases to add
   - open questions

   **You approve the plan before any data changes.**
5. **Implement:** one PR per revision, or one PR per program for the two big steps. All pinned cases for later dates must still pass. N-1 goes at the *front* of `VerifiedTariffRevisions`.
6. **Changelog:** a draft entry saying "Verified tariff data now covers entries from <N-1 start>."

### 4.3 Tooling changes needed (from the revision-checker audit)
The comparison API already accepts any pair, and the UI allows Rev4 → Rev5. What's missing:

| Area | Change |
|---|---|
| Pipeline | Load the **from** attempt's reviewed heading rows (today only the to-side's are read, `libs/hts-revision-diff/pipeline.ts:399`). Add the "before" heading text for cited codes, and diff from-side vs to-side heading rows when there's no JSON. Today older revisions are always `headingDiff: "change_record_only"`. |
| `pull-revision.ts` | Add a `--backfill` mode. It keys the package by the **from** revision, selects by `from_attempt_id`, requires reviewed from-side heading rows, and writes `direction`, `verifiedRevision` and `backfillRevision` to the manifest. It must not default `headingDiff` to "full" (`:208`), and must not delete an existing forward package folder. |
| Revision checker UI | Backfill labels and default pairs (`RevisionCheckerHome.tsx:613-618`, `:667-680`). Optionally a button to fetch the archived PDFs. |
| New skill `/backfill-revision` | The reverse of `apply-revision`. Gate: N is the **earliest** verified revision and N-1 comes right before it. The engine record is the "after" and the package is the "before". N-1 is added to the front of the verified list. Plus the safeguards in §5. |
| `validate.ts` | See §5.4. |
| `sync-hts-revisions.ts` | `FIRST_YEAR = 2025`. Enough to backfill 2025 Basic (compared to 2025 Rev1); only going back into 2024 would need it raised. |
| Coverage batches | Real dates only, never "earliest verified" (`scripts/hts-coverage/pull-batch.ts:203-233`, `apply-batch` SKILL.md). Records already dated from 2026-04-08 as a placeholder are flagged for re-dating. |
| Coverage checker | `--revision R` (rows from R's heading pages, `asOf = R.from`). Correct `initial-status.ts` for headings that have ended. |

---

## 5. Safeguards for accuracy

### 5.1 Full heading diff from USITC's archived PDFs (automatic)
For each step, a script extracts every 9903 heading row from both revisions' archived Chapter 99 PDFs, the same method as `sizing.md`, and compares the result with the change record. It flags:
- any heading added or changed that the change record doesn't cover
- any heading cited in the change record that doesn't appear

This is a second check alongside your cleaned uploads, not a replacement for them. It can't see note-only changes; the notes diff covers those.

### 5.2 Citation for every date, ranked by source strength
Every `from` and `to` gets a `source` with the document and the sentence it comes from. Sources, strongest first:
1. The heading or note text itself ("on or after …")
2. The proclamation, EO or FR notice (govinfo.gov copies, since federalregister.gov blocks automated reads)
3. The CSMS message
4. The change record's date column

A date backed only by the change record or by "Notice" goes to you as an open question. **Nothing is guessed.**

### 5.3 Second-pass date check
After implementing, a separate agent re-checks every new date against its cited document, without seeing the plan's reasoning, and reports any disagreement. It's cheap compared with a wrong date in an audit.

### 5.4 Stricter validation
- Run `validateRules` with `checkFrom` set to the **earliest** verified revision, not the latest. Today it's 2026-09-28, so nothing before that is checked.
- ~~Inside the verified range, make "exception not in effect" an error.~~ *Corrected Oct 7: this is normal. An exemption heading that ends stays listed on its parent heading, which happens 80 times in today's verified data, so it stays a warning.*
- New error: a record with no start date whose heading first appears in the HTS after the checked range starts (it would apply before it existed), using the "first in HTS" data from the archived PDFs.
- New warnings: a record with no `from` inside the verified range; a `from` equal to a revision start date (likely a placeholder); a source that is only "Notice".

### 5.5 Pinned cases for each backfilled revision
For each step, add pinned cases covering:
- every rule that changed
- one date just before and one just after each legal date
- the in-transit windows

Where CBP or CSMS publish worked examples, pin those too.

### 5.6 Check lists before diffing (from Rev19/20)
Before diffing, check that the note lists extracted from N exactly match the engine's lists. A mismatch means the extraction or the data is wrong, and that has to be fixed first.

---

## 6. New mechanisms 2025 will need (check each against the engine first)
- **Value bases:**
  - 232 duty on the steel or aluminum **content** value, before the full-value change of Apr 6, 2026. §17.13 describes this, but the engine may not have it as a handler.
  - Reciprocal duty not applying to the 232 metal-content portion (`excludePortion`, §8.2).
- **In-transit rules with two dates** (loaded before X and entered before Y): Aug 7 → Oct 5 2025, India Aug 27 → Sept 17, Section 122 Feb 24 / Feb 28. This needs loading-date inputs and conditions (§14.1).
- **Reciprocal exemptions:** U.S. content of 20% or more (`usContentShare` exists from Rev10), the Annex II exempt list as a list with many versions, and the agricultural exemptions (Nov 13, 2025).
- **Non-stacking orders:** for example the April 29, 2025 order, retroactive to March 4 (§8.1 already shows it).
- **Rates changed in place:** the heading number stays the same but the rate text changes, e.g. 9903.01.24 going from 20% to 10% on Nov 10, 2025. This is ordinary `tariffVersions` work, but it can't be seen in a diff of heading numbers alone.
- **Announced but never in effect:** Feb 4, 2025 Canada/Mexico; the furniture increase on Jan 1, 2026. These get no records, but get a note so nobody adds them later.

---

## 7. Base rates and HTS codes over time (separate workstream, also needed for audits and charts)
- The calculator uses the latest HTS for base rates and code validity on every date. For 2025 entries this is wrong whenever:
  - a Column 1 or Column 2 rate changed, including annual FTA staging in the 2026 Basic edition
  - a 10-digit code was added, split or removed
- Supabase storage has full HTS JSON for only 15 revisions, with names like `2025-14`. Some aren't complete for Chapter 99: `2025-14` has no 9903 rows and `2026-4` has 357 where the PDF shows 710.
- **Needed:**
  - one complete HTS file per revision
  - a loader that picks the revision for the entry date
  - pinned cases that cover base rates

  Chapter 99 history and base-rate history can be done in parallel.

---

## 8. Analysis and charts
The engine is built for "rules as of a date", which is exactly what charts over time need. With the backfill done, we can compute:
- average added duty by country over time
- the number of active Chapter 99 measures
- how often rules changed
- retroactive changes against when they were published
- coverage of tariffs by HTS chapter

**One addition worth making now:** record a publication date, `source.publishedOn`, alongside each legal effective date. It costs little while we're reading each notice anyway, and it allows:
- "announced vs. effective vs. in the HTS" charts
- the audit question "what did the law say at the time vs. now" (§14.7, `recordedAt`)

It's much harder to add later.

**IEEPA refunds:** IEEPA duties were paid on 2025 entries and can now be refunded (EO 14389; the Court of International Trade's *Atmus* order; CBP's ACE refund function from Apr 20, 2026, per the draft timeline). An audit view should show them as applied *and* refundable. Those dates are from the draft timeline and need checking against official sources before we use them.

---

## 9. Proposed order
0. **Tooling:**
   - the backfill mode in the pipeline and pull script
   - the `/backfill-revision` skill
   - the archived-PDF cross-check script
   - the validator upgrades
   - MPF FY25
   - correcting IEEPA status in the coverage checker
1. **2026 Rev4**, one PR per program: old 232 steel, aluminum (with derivatives) and copper, with their lists and interactions. Dates the 9903.82 family's start (Apr 6, 2026).
2. **2026 Rev3:** the IEEPA state as of February 2026, one PR per program:
   - fentanyl China/Canada/Mexico
   - reciprocal baseline and country rates
   - Annex II and the agricultural exemptions
   - India and Brazil
   - start dates for the deal headings
   - non-stacking
3. **2026 Rev2 → 2025 Basic**, one PR per revision. The quiet steps are quick.
4. **Coverage:** the remaining 9903 headings, in batches with real dates. Then coverage by revision for every backfilled revision.
5. **Base-rate history** (§7), in parallel from step 1.
