# HTS successors

`successors.json` maps 10-digit HTS codes that no longer exist to the current codes that replaced
them. AD/CVD scopes often list codes renumbered since the order (libs/adcvd/checks.ts uses this map
so imports under the new codes still match).

How it was built (2026-10-18), by `scripts/adcvd/build-successors.py`:

- Snapshots of every 10-digit code in effect: the Census Bureau's yearly import concordance files
  (https://www.census.gov/foreign-trade/reference/codes/concordance/index.html, impconcord02–22),
  then each HTS revision stored in Supabase (hts_revisions, 2025 onward).
- For each code gone from the current HTS: the codes added in the next snapshot after it last
  appeared, under the same 8-digit line (else the same 6-digit subheading), followed forward until
  they're current.

Codes that left before 2002, or whose replacement doesn't share their subheading, aren't mapped.
Rebuild when a new yearly file or revision should be included.
