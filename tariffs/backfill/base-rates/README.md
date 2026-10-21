# Base-rate changes across HTS revisions (chapters 1–98)

Checks whether General, Special or Column 2 rates in chapters 1–98 changed between revisions, so the
engine's base rates can be dated like the Chapter 99 rules (PROGRESS.md E3). Local only: USITC PDFs
parsed with `unpdf`, no Datalab or Claude.

## Result (run Oct 8, 2026: 2025HTSBasic → 2026HTSRev20, 54 revisions)

- **General and Column 2:** no changes in any revision.
- **Special:** only **2026HTSBasic** (Jan 1, 2026) changed anything, about 150 lines:
  - Annual FTA staging to Free, mostly chapters 2, 4, 15–24 and 52: KR ~88, PA ~78, CO ~51,
    BH/CL/JO/MA/OM/P/PE/SG ~72 each, a few A+/AU/S/P+.
  - US–Japan agreement staging, chapter 17: 1.6% → 1.2% (JP), 1.8% → 1.35% (JP).
- Everything else was noise: footnote renumbering, typos, new statistical suffixes (e.g. "Certified
  organic" in 2026 Rev 2 and Rev 11), units, text reflowed between pages.
- 2026HTSRev13 changed the PDF's text layout, so the line diff shows every chapter changed. The
  order-independent token check (`tokens.py`) shows no rate changes there.

## How to rerun

Run from this folder. `pdf/` (~18 MB per revision) and `txt/` are gitignored and get regenerated.

1. `revs.txt`: revision names and start dates (from `tariffs/engine-v2/data/hts-revisions.json`).
2. `node extract.mjs <revision>`: downloads USITC's full-HTS PDF (`filename=finalCopy`) to `pdf/`.
   It writes `txt/<revision>.txt`, which holds the tariff-table lines of chapters 1–98. Each line
   is prefixed with its chapter (taken from the page footer), with whitespace and leader dots removed.
   - All revisions: `cut -d' ' -f1 revs.txt | xargs -P 6 -I{} node extract.mjs {}`
3. `python3 -I compare.py [skip revisions...]`: line diff of consecutive revisions with footnote
   markers stripped. Writes `results/diff.json`.
4. `python3 -I classify.py <revision>...`: splits a revision's diff hunks into FTA staging to Free
   and other rate changes.
5. `python3 -I tokens.py`: order-independent check. It counts rate tokens (with their country lists)
   per chapter and compares the counts. Writes `results/tokens.json`. This is the check to trust.
6. `bycode.py`: per-code rate parse (`results/bycode.json`). Too lossy to rely on: it reads all
   three columns for only ~25% of lines.

## Next

- Apply the 2026HTSBasic Special-column changes, so pref claims dated before 2026-01-01 use the 2025
  rates.
- Rerun after each new Basic edition. The big one is HS 2028 (WCO edition effective Jan 1, 2028;
  USITC investigation 1205-14).
