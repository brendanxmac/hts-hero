# HTS successors

`successors.json` maps 10-digit HTS codes that no longer exist to the current codes that replaced
them: `{"0802502000": {"to": ["0802510000"], "how": "one"}}`. AD/CVD scopes often list codes
renumbered since the order; libs/adcvd/codes.ts uses this map so imports under the new codes still
match. `how` says how sure the mapping is:

- `one`: one clear replacement. A scope code mapped this way counts as listed (a "likely" match).
- `split`: several candidates. Imports under them match as "possible", unless they're on the old
  code's own 8-digit line and the case lists no current code on that line (libs/adcvd/match.ts).

How it was built (2026-10-23), by `scripts/adcvd/build-successors.py`:

- Snapshots of every 10-digit code in effect, with its description: the Census Bureau's yearly
  import concordance files (https://www.census.gov/foreign-trade/reference/codes/concordance/index.html,
  impconcord02–22), then each HTS revision stored in Supabase (hts_revisions, 2025 onward; written
  by `npx tsx scripts/adcvd/hts-snapshots.ts DIR`).
- Where each HS subheading went in the next HS edition: the UN Statistics Division's correlation
  tables HS 2022↔2017 and HS 2017↔2012
  (https://unstats.un.org/unsd/classifications/Econ/tables/). HS 2022 moved whole groups to new
  subheadings (R-125 2903.39 → 2903.44; PET resin 3907.60 → 3907.61/.69), which a same-subheading
  rule can't follow.
- For each code gone from the current HTS, among the codes added in the next snapshot after it last
  appeared:
  - several on its own 8-digit line: the line was restructured, products carved out of it
    (7310.10.0010 "empty steel drums" → .0005 kegs + .0015 drums), so all of them, `split`
  - else those under its heading or the subheadings it went to, picked by how alike the
    descriptions are: one clear pick `one`, 2–4 close ones `split`
  - else (no confident pick) everything added on its 8-digit line, else its 6-digit subheading, `split`
  - then followed forward until current.

Spot check (2026-10-23): 25 random `one` mappings on live AD/CVD cases, all right or plausible.
Codes that left before 2002 aren't mapped, nor codes whose replacements' descriptions don't match
(R-32's old 2903.39.2035, three chemicals on one line, went to three subheadings: ITA's case page
has the current code). The 2023 and 2024 editions aren't snapshots yet: a code added in 2023 and
gone by 2025 is skipped. Rebuild when a new yearly file or revision should be included.
