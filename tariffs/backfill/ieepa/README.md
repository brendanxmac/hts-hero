# IEEPA tariffs: what they were and when they ended

Researched Oct 7, 2026. Use these files to know where to look and what to cite. Before recording a date in the engine, check it against the official text in `sources/`.

## Files

- [headings.md](headings.md): the 109 subchapter III headings (9903.01 and 9903.02) the coverage checker showed as "in effect". Each one has its executive order, whether it's IEEPA, its end date and a citation.
- [claims.md](claims.md): the fentanyl/border duties, Brazil, India, and how and when IEEPA duties ended. Exact quotes.
- [inventory.md](inventory.md): every IEEPA tariff action from 2024 to 2026, including frameworks that were never applied and threats that were never implemented.
- `sources/`: official texts as downloaded:
  - `eo/<number>.txt`: executive orders, from govinfo.gov
  - `csms/<number>.txt`: CBP CSMS messages
  - the Supreme Court opinion in No. 24-1287
  - the Court of International Trade's *Atmus* order

## Confirmed against official text

| Fact | Source |
|---|---|
| The Supreme Court held on Feb 20, 2026 that "IEEPA does not authorize the President to impose tariffs" | `sources/scotus-24-1287-opinion.txt` |
| EO 14389 (Feb 20, 2026) ended the IEEPA duties under EOs 14193, 14194, 14195, 14245, 14257, 14323, 14329, 14380 and 14382, "as soon as practicable". It gives no date or time. | `sources/eo/14389.txt` |
| **The duties stopped for goods entered (or withdrawn from warehouse) "on or after 12:00 a.m. eastern time on February 24, 2026"** | CSMS #67834313, `sources/csms/67834313.txt` |
| India's 25% (EO 14329, headings 9903.01.84–.89) **ended earlier: Feb 7, 2026**, by EO 14384 | CSMS #67702087, `sources/csms/67702087.txt` |
| The China fentanyl rate in 9903.01.24 went from 20% to 10% (effective Nov 10, 2025) | EO 14357, `sources/eo/14357.txt` |

## What this means for the engine

- **End date for "what was assessed on an entry date":** every IEEPA record gets `to: "2026-02-24"`, except India 9903.01.84–.89, which gets `to: "2026-02-07"`. Cite EO 14389 and CSMS #67834313, or EO 14384 and CSMS #67702087 for India.
  - Feb 20 is the decision date, not the end date: IEEPA duties were still assessed on entries Feb 20–23.
  - The engine already ends the deal headings on 2026-02-24.
  - The 12:00 a.m. end and the 12:01 a.m. start of Section 122 fall on the same day, which is all the engine records.
- **Refunds:** all IEEPA duties are refundable with interest (the *Atmus* order of Mar 4, 2026; CBP's refund function in ACE, CAPE, from Apr 20, 2026). This is a legal status on top of what was assessed, not a shorter effective period. It isn't modeled yet: see `tariffs/engine-v2/REFUNDS.md`.
- **Never applied, so never model them:**
  - secondary tariffs under EO 14245 (Venezuelan oil), EO 14380 (Cuba) and EO 14382 (Iran): frameworks only, with no country designated
  - the Feb 4, 2025 Canada/Mexico start (paused to Mar 4)
  - Colombia (Jan 2025)
  - the Canada TV-ad 10% (Oct 2025)
  - the Greenland tariffs on 8 European countries (Jan 2026)

  The negatives come from secondary sources only.
- **Still in force:** the de minimis suspension and postal duties (EO 14324, continued by EO 14388 under IEEPA and 19 U.S.C. 2483). These aren't Chapter 99 duty headings the engine models today.

## For the backfill

**India, 9903.01.84–.89** (EO 14329; the user's notes, confirmed by CSMS #66027027 in `sources/csms/66027027.txt`):
- The 25% applies to goods entered or withdrawn from warehouse on or after 12:01 a.m. EDT Aug 27, 2025.
- **In-transit exception, 9903.01.85.** The goods qualify only if all three hold:
  1. They were loaded onto a vessel at the port of loading, and in transit on the final mode of transit to the United States, before 12:01 a.m. EDT Aug 27, 2025.
  2. They are entered or withdrawn from warehouse before 12:01 a.m. EDT Sep 17, 2025.
  3. The importer declares 9903.01.85.
- **End:** the duty ended at 12:01 a.m. EST Feb 7, 2026 (EO 14384; CSMS #67702087). Use `to: "2026-02-07"`, not Feb 24.

Model the in-transit exception as a condition on a loading-date input (HowTariffsWork.md §14.1), not as a date.

**Coverage checker (Oct 7, 2026):** all 9903.01 and 9903.02 headings are marked expired, with cited notes. The seed list is `libs/hts-coverage/initial-status.ts`, and the live rows were updated the same way.
