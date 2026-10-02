---
name: apply-revision
description: Plan, then implement, the reviewed Chapter 99 changes for an HTS revision in the engine-v2 tariff data. Use when the user runs /apply-revision <revision> after pulling a reviewed comparison with `npm run pull-revision`.
---

# Apply a reviewed HTS revision

The argument is a revision name such as `2026HTSRev6`. The reviewed changes are in `tariffs/revision-diffs/<revision>/`, written by `npm run pull-revision -- <revision>` from the revision checker (`/revision-checker`). Work in two phases, and stop between them.

## Phase 1: check the package and write a plan

1. **Check the package.** Stop and tell the user if any of these fail:
   - `tariffs/revision-diffs/<revision>/manifest.json` exists and `allDecided` is true.
   - `contentHash` equals the SHA-256 of `changes.json` (`shasum -a 256 changes.json`). If it doesn't match, the files were edited after the pull, so ask the user to pull again.
   - `fromRevision` is the latest revision in `VerifiedTariffRevisions` in `tariffs/engine-v2/revisions.ts`. If the engine is on a different revision, revisions would be skipped or applied twice. Say which revision the engine is on and stop.
   - If `consecutive` is false, warn that the change record doesn't cover the revisions in between.
2. **Read `HowTariffsWork.md`** in full, especially §6 (Tariffs), §7 (lists), §8 (interactions), §14 (versioning) and §17 (recipes). Follow it for every change.
3. **Read the package:** `README.md`, then `context.md` if it exists (the user's background on the revision), then every file in `changes/` whose decision is `approve`. Read the `defer` and `skip` files only far enough to list them.
4. **How to weigh the sources**, from most to least authoritative:
   1. The note text and heading rows in each change file (from the PDF and JSON). Check anything important against `reference/ch99-notes-<revision>.md`.
   2. The reviewer notes in each change, then `context.md`. These are the user's interpretation and instructions, and they override the AI summary. Reviewer notes are specific to a change; `context.md` is background on the whole revision (why it happened, what it's aimed at). Neither overrides the note text: if they conflict with it, list the conflict under open questions.
   3. The change record entry.
   4. The AI summary. Treat it as a pointer only. Claims marked "quote not found in the source text" are unverified.

   If the text looks garbled (a PDF extraction error), say so instead of interpreting it.

   **Headings:** the "before" for a heading is the engine's own record (search `tariffs/engine-v2/data/headings/` and `tariffs/engine-v2/data/lists/` for the code), not old USITC data. The "after" is the heading row in the change file's "Headings cited by the change record" section, or in `headings.md`, which holds the headings read from the revision's own tariff-table pages and reviewed by the user. Both are authoritative for this revision; never take a heading's text or rate from any other revision. Unless `manifest.json` says `headingDiff: "full"`, heading changes come only from the change record, so don't assume headings not listed there are unchanged. When a cited heading is marked "not checked" (no JSON for that revision), its new wording and rate aren't in the package: list it under open questions and ask the user for the text instead of guessing.
5. **Write `tariffs/revision-diffs/<revision>/PLAN.md`** with:
   - For each approved change: what changes legally (cite the note key or heading and quote the text), the §17 recipe it follows, the exact records and files to edit, the **legal effective date** and its source (often not the revision's start date), and the tests or pinned cases to add.
   - Changes to engine logic (category `logic` or `mixed`), called out separately, since they need the most scrutiny.
   - Not doing: deferred and skipped changes, one line each.
   - Assumptions: every interpretation that the reviewer notes don't already settle.
   - Open questions for the user.
6. **Stop.** Show the user a short summary of the plan and ask for approval. Don't edit any tariff data or engine code before they approve.

## Phase 2: implement (after approval)

1. Create a branch `revision/<revision>` from the current branch.
2. Make the changes from the approved plan, following HowTariffsWork.md. Fill in `source` on every record you touch.
3. Add pinned cases for anything new, then run `npm run tests` and fix any failures.
4. Add the revision to `VerifiedTariffRevisions` only if every approved change is implemented and no deferred change affects duties in this revision. Otherwise, leave it out and say why.
5. **Add draft changelog entries** for the customer-facing changelog at `/duty-calculator/changelog`:
   - One `revision` entry for the revision itself:
     `npm run changelog:draft -- --type revision --revision <revision> --title "HTS Revision N (YYYY)" --summary "…"`
   - One `fix` or `improvement` entry for each other change a customer would notice, such as a correction that changes duties for past dates. Skip internal-only changes like refactors, tests and docs.
   - If `context.md` exists, use it to explain why the change matters, in plain words, where that helps an importer.
   - Write for importers, not engineers. The title is one line saying what changed. The summary is one to three short sentences: what it means for an estimate, with the heading or note only when it helps. Lead with the effect, e.g. "Steel and aluminum housewares now get Section 232 duties". No internal names (list ids, file names, "engine"), and no hedging.
   - The revision summary starts with the dates it covers ("Verified tariff data now covers entries through <revision's last day>."), then the one or two changes that matter most.
   - Entries are saved as **drafts**. List them in the PR description under "Changelog drafts" and remind the user to publish them at `/duty-calculator/changelog` once the PR is deployed.
6. Commit with `PLAN.md` and the package included, push, and open a PR. The PR description has:
   - For each change: note or heading citation → what changed in the data or code → tests or pinned cases covering it.
   - Not addressed: deferred and skipped changes, and anything you couldn't resolve.
   - Assumptions: anything you interpreted that the plan or the reviewer notes didn't settle.
   - Changelog drafts: the entries from step 5, to publish after deploy.
