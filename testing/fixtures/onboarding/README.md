# Import onboarding test files

For trying the Tracker's import takeover by hand (step 3, "Upload a spreadsheet"). In development,
`/tariff-tracker?onboardingPreview=1` opens the takeover on any account, signed out too.
Codes checked against HTS revision 2026-21.

## clean-imports.csv

Every row reads: the review is skipped and it goes straight to "You're tracking 10 imports"
(11 rows, one a repeat).

## messy-imports.xlsx

- **Sheets:** "Read me" (notes only) comes first; the data is on "Parts master", which is picked by itself.
- **Set aside by themselves:** two title rows and a blank one above the header, a header repeated
  mid-sheet, a "Discontinued items below" note, and Subtotal / Grand total rows.
- **Ready as they are (16 + repeats):** P-1001 to P-1016, including a code stored as a number
  (8413919015), a code with spaces (8708 99 81 80), two-letter countries, and P-4003, a number
  that lost its leading zero (read back as 0102.21.00.10 with nothing to fix).
- **Countries written another way:** "Viet Nam" ×5 (one group fix), "PRC" ×2, "Korea", "UK",
  "Holland", the typo "Veitnam", "Made in China".
- **6-digit HS codes, never one fix for all:** 610910 ×3 (men's V-neck tee, boys' graphic tee,
  men's tank top: each a different US line), 6110.20 ×2 (women's cardigan, men's pullover).
- **Zero-padded HS codes:** 6109.10.00.00, 6110.20.0000.
- **A dropped leading zero (one right answer, one group fix):** "102210010" ×2 stored as text.
- **Codes the HTS dropped:** 8517.12.00.50 (phones, now 8517.13), 9403.60.80.81.
- **Wrong number of digits:** 84131 (5), 8471.30.01.001 (11), 8482.10.504 (9, not a dropped zero).
- **Missing or impossible:** a blank country, "N/A", a blank code, "USA" as the origin, "Atlantis".
- **Extra columns** (supplier, cost, quantity) that are read in the browser and never kept.
