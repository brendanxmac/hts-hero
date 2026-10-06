# Content to write later

Posts and pages that are worth writing once the data behind them exists. Each one names what it's waiting on.

## Waiting on: verified IEEPA-period history (Feb 2025 – Feb 2026)

HTS Hero's verified rate history starts with 2026 HTS Revision 5 (April 8, 2026). Once the IEEPA period is backfilled, these become some of the highest-traffic pages we can publish: IEEPA refunds are the biggest content category among competitors right now (Flexport, Wove, GingerControl, TariffsTool and TariffLens all have refund tools or guides), and every refund depends on the rate on each entry date, which is exactly what HTS Hero calculates.

Priority order:

1. **IEEPA tariff refunds: who qualifies and how to calculate yours.** A pillar guide: the Supreme Court ruling (Feb 20, 2026), which duties are refundable, the headings involved, how refunds are worked out per entry, and an HTS Hero entry audit as the CTA. Targets "IEEPA refund", "tariff refund calculator", "how to get tariff refund".
2. **IEEPA tariff rates by country, Feb 2025 – Feb 2026.** The full reciprocal and fentanyl rate timeline for every country, generated from the backfilled data like the "Latest US Tariff Changes" table. Built to be cited.
3. **The IEEPA reciprocal tariff, revision by revision.** One table of every 2025 HTS revision's changes to 9903.01.xx and 9903.02.xx headings.
4. **Fentanyl tariffs on Canada, Mexico and China: the full history.** Rates, USMCA carve-outs and end dates.
5. **Comparison: IEEPA refund calculators.** HTS Hero vs Flexport's Tariff Refund Calculator, Wove and others, once HTS Hero can audit IEEPA-period entries. Add as tool records in `libs/compare/tools/` with a new feature row for refund estimates.
6. **Refresh the four migrated 2025 posts** (de minimis, India Russian oil tariff, China 301 exclusions, reciprocal exemptions) with "audit your entries from this period" CTAs that link to the backfilled history.

When this lands, also update the "history" CTA in `components/blog/cta/ctaContent.ts` and HTS Hero's `entryDate` note in `libs/compare/tools/htsHero.ts`; both read the start date from `VerifiedTariffRevisions`, so they update on their own once those revisions are added.
