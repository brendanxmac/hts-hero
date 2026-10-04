---
name: apply-batch
description: Plan, then implement, a coverage batch of Chapter 99 headings that the engine-v2 tariff data doesn't model yet. Use when the user runs /apply-batch <batch name> after pulling a batch from the coverage checker with `npm run pull-batch`.
---

# Apply a coverage batch

The argument is a batch name such as `301-china-exclusions`. The batch is in `tariffs/coverage-batches/<name>/`, written by `npm run pull-batch -- <name>` from the coverage checker (`/coverage-checker`). Each **included** heading is in the HTS but has no tariff record in the engine yet; the job is to add it. Work in two phases, and stop between them.

## Phase 1: check the package and write a plan

1. **Check the package.** Stop and tell the user if any of these fail:
   - `tariffs/coverage-batches/<name>/manifest.json` exists and `allDecided` is true.
   - `contentHash` equals the SHA-256 of `batch.json` (`shasum -a 256 batch.json`). If it doesn't match, the files were edited after the pull, so ask the user to pull again.
   - `latestVerifiedRevision` is still the latest revision in `VerifiedTariffRevisions` (`tariffs/engine-v2/revisions.ts`). If the engine has moved on, the package's view of the engine may be stale: say so and ask whether to pull again.
   - For each included heading, search `tariffs/engine-v2/data/` for its code. If it's already modeled now (someone added it since the pull), say so and leave it out of the plan.
2. **Read `HowTariffsWork.md`** in full, especially §5 (programs), §6 (tariffs), §7 (lists), §8 (interactions), §10 (inputs), §11 (handlers), §14 (versioning) and §17 (recipes, including §17.2 "A new heading appears" and §17.13 backfilling). Follow it for every heading.
3. **Read the package:** `README.md`, then `instructions.md` (the user's instructions for the whole batch and how to date the records), then every file in `headings/` whose decision is `include`. Read the `skip` files only far enough to list them.
4. **How to weigh the sources**, from most to least authoritative:
   1. The HTS text and rates in each heading file, and the cited note text. These are the law. Check anything important against `reference/ch99-notes-<revision>.md`, which holds every parsed note (code lists often live in a different subdivision than the one a heading cites).
   2. The user's instructions: for the heading, then for the batch (`instructions.md`). They override everything below. Neither overrides the note text: if they conflict with it, list the conflict under open questions.
   3. The engine's conventions: the "Modeled examples nearby" and the records that already name the heading ("Named elsewhere"). Model new headings the way their siblings are modeled (program, list ids, conditions, interactions) unless the text says otherwise.
   4. Claude's suggestion. A pointer only, never a source. It wasn't verified.

   If the text looks garbled (a PDF extraction error), or a cited note says "not found", say so instead of interpreting it, and ask for the text.
5. **Dates.** Follow `instructions.md`:
   - **From the earliest verified revision**: `effective.from` is the earliest verified revision's start date (in `manifest.json`), unless the heading's own text gives a later start ("on or after <date>"; the heading file lists it as "Starts"), which then wins. A heading that starts after today still gets its real start date. Don't add earlier history.
   - **Research and backfill real history**: find each heading's legal start date and every later change in the official sources (Federal Register, proclamations and executive orders, USTR notices, CSMS messages, HTS change records), and record them as dated versions per §17.13. Put the source of every date in `source`. If you can't verify a date, don't guess: list it under open questions.
6. **Group the work.** Headings that share a note, a program or a code list are usually one change (a new program and its headings, or a set of exclusions from one heading). Exclusions and exemptions ("the duty provided in the applicable subheading") also need the heading they exempt from to list them in `exceptions`, as a new version of that heading (§17.2).
7. **Write `tariffs/coverage-batches/<name>/PLAN.md`** with:
   - For each included heading (or group): what it does legally (cite the heading and the note key, and quote the text), the §17 recipe it follows, the program (existing, or a new one with its id and name), the exact records, lists and files to add or edit, any `requires` conditions or inputs the importer must answer, interactions and exceptions with existing headings, the **effective dates** and their sources, and the pinned cases to add.
   - Engine logic changes (a new handler, a new kind of condition or rate rule, a new program type), called out separately, since they need the most scrutiny. Prefer data over code (§2): add a handler only when no existing one fits, and never change an existing handler's behavior (§11).
   - Not doing: skipped headings and anything you're leaving out, one line each with the reason.
   - Assumptions: every interpretation the user's instructions don't already settle.
   - Open questions for the user.
8. **Stop.** Show the user a short summary of the plan and ask for approval. Don't edit any tariff data or engine code before they approve.

## Phase 2: implement (after approval)

1. Create a branch `coverage/<name>` from the current branch.
2. Make the changes from the approved plan, following HowTariffsWork.md. Fill in `source` on every record you add or touch: the revision the text was read from (`htsRevision` in the manifest), the legal citation, and `note: "Added from coverage batch <name>"`.
3. Add pinned cases for every new heading (a code and country it applies to, one it doesn't, and any exception or condition), then run `npm run tests` and fix any failures.
4. Run `npm run notes:cited` to add the new headings' cited note text to what the calculator shows ("Referenced notes"), and commit `public/data/notes`. Report any citations it says it couldn't find.
5. Run `npm run ch99:coverage` and confirm every included heading now shows as modeled (it's in `covered.csv`, not `missing.csv`). Report any that aren't.
6. **Add draft changelog entries** for the customer-facing changelog at `/duty-calculator/changelog`: one `improvement` entry per group of headings a customer would notice:
   `npm run changelog:draft -- --type improvement --title "…" --summary "…"`
   - Write for importers, not engineers. The title is one line saying what the calculator now covers ("Section 301 exclusions for Chinese medical equipment are now included"). The summary is one to three short sentences on what it means for an estimate, with the heading or note only when it helps. No internal names (list ids, file names, "engine"), and no hedging.
   - Entries are saved as **drafts**. List them in the PR description under "Changelog drafts" and remind the user to publish them once the PR is deployed.
7. Commit with `PLAN.md` and the package included, push, and open a PR. The PR description has:
   - For each heading or group: heading and note citation → what was added (records, lists, interactions) → effective dates and their sources → pinned cases covering it.
   - Not addressed: skipped headings and anything you couldn't resolve.
   - Assumptions: anything you interpreted that the plan or the user's instructions didn't settle.
   - Changelog drafts: the entries from step 6, to publish after deploy.
8. Remind the user to **mark the batch applied** on its page in `/coverage-checker` (with the PR link) once the PR is merged, and to press Refresh so the headings show as modeled.
