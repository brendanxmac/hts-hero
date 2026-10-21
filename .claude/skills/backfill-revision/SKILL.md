---
name: backfill-revision
description: Plan, then implement, the backfill of an older HTS revision in the engine-v2 tariff data, working backward from the earliest verified revision. Use when the user runs /backfill-revision <revision> after pulling a reviewed comparison with `npm run pull-revision -- <revision> --backfill`.
---

# Backfill an HTS revision

The argument is the revision being backfilled, such as `2026HTSRev4`. Call it **N-1**. The revision right after it, **N**, is the earliest verified revision. The package is in `tariffs/revision-diffs/<N-1>/`, written by `npm run pull-revision -- <N-1> --backfill` from the revision checker (`/revision-checker`).

The comparison is N-1 → N, read from N's change record. N is verified, so the engine's records are the "after". For every change N made, record how things stood in N-1 (the "before"), with the change's **legal effective date** as the boundary. When that's done, N-1 is verified too. This is HowTariffsWork.md §17.13, one revision at a time.

The goal is history accurate enough for audits of past entries. **Never guess a date.** A date without a document behind it is an open question, not a record.

Work in two phases, and stop between them.

## Phase 1: check the package and write a plan

1. **Check the package.** Stop and tell the user if any of these fail:
   - `manifest.json` exists, `direction` is `"backfill"` and `allDecided` is true.
   - `contentHash` equals the SHA-256 of `changes.json` (`shasum -a 256 changes.json`). If not, the files were edited after the pull, so ask the user to pull again.
   - `verifiedRevision` (N) is the **first** revision in `VerifiedTariffRevisions` (`tariffs/engine-v2/revisions.ts`), and `revision` (N-1) comes right before it in `HtsRevisions`. Otherwise revisions would be skipped or backfilled twice. Say which revision the engine starts at and stop.
   - `consecutive` is true. If it's false or null, the change record doesn't follow N-1, so stop.
   - `headings.md` (N-1's heading pages, the "before") exists. Rows marked "no" in its Reviewed column weren't reviewed: the pull only requires review for headings the changes rely on, so check any other row against the PDF before relying on it. If `citedHeadingsWithoutBefore` lists codes, check each one: either N added it (its change says so), or N-1's heading pages are missing a page. A missing page is an open question; ask for the page instead of guessing the text.
2. **Read `HowTariffsWork.md` in full**, especially §4 (sources), §6 (tariffs), §7 (lists), §8 (interactions), §14 (versioning) and §17.13 (backfilling). Follow it for every record.
3. **Read the package:**
   - `README.md`, then `context.md` if it exists.
   - Every file in `changes/` whose decision is `approve`. Read the `defer` and `skip` files only far enough to list them.
   - `headings.md` (N-1, before) and `headings-<N>.md` (N, after).
   - `reference/ch99-notes-<N-1>.md` and `reference/ch99-notes-<N>.md` for lookups.
4. **Run the cross-checks.** Put every result in the plan.
   - **Headings, from USITC's archived PDFs:** if `manifest.json` says `headingDiff: "heading_pages_full"`, both revisions' heading pages hold every subchapter III heading, so the package already diffs them all, including added and removed headings. Otherwise run `npm run ch99:archive -- --step <N-1>`. It lists the headings N added and removed, read independently of the user's uploads. Every one should match a change in the package. Any that doesn't is an open question: the change record or the review may have missed it. The archive sees headings only: note changes have to come from the change record and the notes diff.
   - **Undated records:** search `tariffs/engine-v2/data/ch99-first-seen.json` for headings whose `first` is N. Each one that the engine models without `effective.from` must get its legal start date in this step. The validator fails otherwise once N-1 is verified.
   - **Lists:** before relying on the notes diff, check that the lists the engine models for every note this step touches match N's note text exactly (the technique from Rev19/20). A mismatch means the engine or the extraction is wrong; report it separately from the backfill.
   - **Every list against N-1's note text:** run `npm run lists:check -- <N-1>`. The validator has no first-seen check for lists, so a list still carrying a later revision's codes would otherwise apply silently to N-1's dates. The script matches each list used on N-1's first day to its closest note subdivision. For every list it reports as differing, decide one of:
     - **Expected:** the list is a deliberate part of its subdivision (an "excluded" list, or described products only); or a retroactive change that N-1's text doesn't show yet (a deal or EO dated before N-1); or statistical numbers from a later year.
     - **Extraction:** the parsed note dropped or garbled codes. Check the PDF (the archive copy in `node_modules/.cache/hts-archive/`) before relying on it.
     - **Needs an earlier list version:** N-1's note text really has different codes. Add the version, with the legal date of the change, and put it in the plan.

     Put the result in the plan's cross-checks.
5. **How to weigh the sources**, from most to least authoritative:
   1. The note text and heading rows: N-1's (`headings.md`, `reference/ch99-notes-<N-1>.md`) for the before, and N's for the after. Never take a heading's text or rate from any other revision.
   2. The reviewer notes in each change, then `context.md`. These are the user's interpretation and instructions, and they override the AI summary. Neither overrides the note text: if they conflict with it, list the conflict under open questions.
   3. The change record entry.
   4. The AI summary. Treat it as a pointer only. Claims marked "quote not found in the source text" are unverified.

   **The engine's current record is the after.** It was verified for N. If N's text doesn't match the engine's record, that's an error in verified data: report it under open questions instead of working around it.

   If the text looks garbled (a PDF extraction error), say so instead of interpreting it.

   **When the note text and the proclamation or executive order disagree, follow the note text** (decided by the user, Oct 7, 2026). Always flag it: quote both in the plan under a "Conflicts with the legal documents" heading, say which records it affects and by how much on an example entry, and record it in the `source.note` of each affected record (and a comment above it). Example: Rev 4 note 2(aa)(v)(a)–(b) applies Section 122 to the non-steel content even under full-value Section 232 headings, while Proclamation 11012 clause (4) exempts every part 232 applies to.
6. **Dates.** For each change, find its **legal effective date**: the boundary where N-1's version ends and N's begins. The order of preference:
   1. The heading or note text itself ("on or after <date>").
   2. The proclamation, executive order or Federal Register notice. Use govinfo.gov copies (federalregister.gov blocks automated reads).
   3. The CSMS message.
   4. The change record's date column.

   Record the citation, a URL, and `publishedOn` (when the document was signed or published) on every record you add or end.

   **A date backed only by the change record, or by "Notice" with no document, goes under open questions** unless the user's notes already settle it. `tariffs/backfill/legal-timeline-DRAFT.md` is a map of where to look. Never cite it.

   Watch for:
   - **The boundary falling inside N-1.** This is common: N often published changes that took effect days or weeks earlier.
   - **The boundary falling before N-1** (retroactive). It's still the right date. Note it in `source.note`, since it reaches into revisions not yet backfilled.
   - **The boundary falling after N starts** (published early). Then N-1's version continues into N, and the engine's record for N should already start on that date. Check it does.
   - **In-transit rules** (loaded before X, entered before Y). These are conditions on inputs, not dates (§14.1).
7. **What to model.** Every approved change gets its before-state, using the §17.13 table:
   - Added in N → the engine record gets `from`.
   - Removed in N → add the full record back, with its text, rate, scope, lists and exceptions from N-1, and `to`.
   - Changed in N → add an earlier version in front.
   - List codes added or removed → add an earlier list version.

   **Removed headings are part of the backfill, not coverage**, even though the engine never modeled them: they were the law in N-1. Headings in force in N-1 that the change record doesn't touch are coverage work for later; don't add them here.

   **Completeness bar (decided by the user, Oct 7, 2026):** a revision during which IEEPA duties applied (from Feb 2025 to Feb 23, 2026) can be marked verified only once every IEEPA program in force during it is modeled: the fentanyl/border duties, reciprocal and country rates, India, Brazil, and their exemptions and interactions. If the backfill reaches such a revision first, the IEEPA work is part of it.
8. **Group the work.** A step that touches several programs heavily (2026Rev4: the old Section 232 metals structure; 2026Rev3: IEEPA) is split into **one PR per program** (decided by the user). Order them so tests pass after each one. N-1 is added to `VerifiedTariffRevisions` only in the last PR.
9. **Write `tariffs/revision-diffs/<N-1>/PLAN.md`** with:
   - **For each approved change:** what N changed legally (cite the note key or heading and quote the text); the recipe it reverses; the exact before-records, lists and files to add or edit; the boundary date with its citation, URL, `publishedOn` and source strength (1–4 above); and the pinned cases to add.
   - **A table of every date** the plan adds: record, date, citation, source strength, quote. This is what the user checks.
   - **Cross-check results** from step 4.
   - **Engine logic changes** (a new handler, condition, input or basis), called out separately, since they need the most scrutiny. Old mechanisms get new handler kinds; never change an existing handler (§11.4).
   - **PR split**, if any.
   - **Not doing:** deferred and skipped changes, and in-force headings left for coverage, one line each.
   - **Assumptions:** every interpretation the reviewer notes don't settle.
   - **Open questions** for the user.
10. **Stop.** Show the user a short summary of the plan, including the date table, and ask for approval. Don't edit tariff data or engine code before they approve.

## Phase 2: implement (after approval)

1. Create a branch `backfill/<N-1>` from `master`, or `backfill/<N-1>-<program>` per PR when the step is split.
2. Make the changes from the approved plan, following HowTariffsWork.md. Every record you add or touch gets a `source` with:
   - `revision`: the revision the text was read from (N-1 for a before-record)
   - `citation`, `url` and `publishedOn`
   - `note: "Backfilled from <N>'s change record"`, plus anything a future reader needs (retroactive, in-transit)
3. **Tests.**
   - Add pinned cases for each change: a date in N-1 before the boundary, a date after it, one country and code it applies to, one it doesn't, and any exception or condition.
   - Run `npm run tests`. **Every existing pinned case must pass unchanged.** A backfill that changes a result for a verified date is a bug. The one exception is a real correction of verified data that the user approved; update that case with a comment saying why (§14.7).
   **Test links.** Give the user links to check the result in the calculator, and put them in the final message (and the PR description, if there is one). Build them from the pinned cases:
   - Format: `http://localhost:3000/duty-calculator?code=<10-digit HTS>&country=<ISO>&date=<YYYY-MM-DD>&value=10000&units=100&answers=<id>=<value>,<id>` (also `pref=S` for a trade preference claim). `answers` takes input ids from `tariffs/engine-v2/data/inputs.ts`, such as `steelContentPct=60` and `ftzPrivilegedForeignAdmissionDate=2025-05-01`, plus `confirm:<heading>` for a heading confirmation. Use the production domain from `config.ts` instead of localhost once the change is deployed.
   - **Applied correctly:** one link per change, on a date where it applies, with the expected total and the Chapter 99 lines that should show (for example "$6,190: 9903.81.90 $3,000 on the steel content, 9903.03.01 $400").
   - **Boundaries:** the same entry the day before and the day of each legal effective date, so the switch is visible. Duty Over Time on that entry should show the change on that date and nowhere else.
   - **Other revisions unaffected:** a few links on dates in the neighboring verified revisions, with their unchanged totals. If a correction did change verified results, say which links show the new result and what it was before.
   - Open a few of them yourself in the browser pane (the calculator runs at `npm run dev`) and confirm the totals match before handing them over.
4. **Independent date check.** Start a subagent with a fresh context. Give it only the table of new dates (record, date, citation, URL, quoted sentence) and ask it to confirm each one against the cited document. Fix what it finds, or raise it with the user; never overrule it silently.
5. **Mark N-1 verified** by adding it to the **front** of `VerifiedTariffRevisions`, but only if:
   - every approved change is implemented
   - no deferred change affects duties in N-1
   - the completeness bar in step 7 is met

   Otherwise, leave it out and say why. Then run `npm run tests` again: the validator now checks from N-1's start, including undated records against `ch99-first-seen.json`.
6. Run `npm run notes:cited` and commit `public/data/notes`. Report any citations it couldn't find.
7. **Add a draft changelog entry:**
   `npm run changelog:draft -- --type revision --revision <N-1> --title "HTS Revision N (YYYY)" --summary "…"`
   - The summary starts with "Verified tariff data now covers entries from <N-1's first day>.", then the one or two things that mattered most in that period, for importers.
   - Add a `fix` entry for any correction to verified data.
   - Same style rules as `/apply-revision`: for importers, no internal names, no hedging.
8. Commit with `PLAN.md` included, push, and open a PR. The PR description has:
   - For each change: citation → what was added or ended → dates with their sources → pinned cases.
   - The date table from the plan, with the independent check's result for each row.
   - Cross-check results, and anything not addressed.
   - Assumptions.
   - Changelog drafts, to publish after deploy.
9. Remind the user to upload the next revision back (its change record, trimmed Chapter 99 notes and heading pages) and compare it to N-1 in `/revision-checker`.

The last planned step is **2025HTSBasic** (compared to 2025HTSRev1). Going back into 2024 would first need 2024 added to `scripts/engine-v2/sync-hts-revisions.ts` (`FIRST_YEAR`) and to `ch99-first-seen.json`.
