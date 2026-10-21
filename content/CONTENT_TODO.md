# Content to write later

Posts and pages that are worth writing once the data behind them exists. Each one names what it's waiting on.

## Refund pages, one per refund group (linked from /tariff-audit)

`/tariff-audit` has a section for each refund group (`components/tariff-audit/lib/refundGroups.ts`). Each group gets its own landing page, built like `/tariff-monitor` and `/tariff-audit`: answer-first, server-rendered, FAQPage schema, a free audit CTA. When a page ships, set its `href` in `refundGroups.ts` so the card links to it.

1. **IEEPA tariff refunds** (`/tariff-refunds/ieepa`). Who qualifies, CAPE phases and deadlines, protests for finally liquidated entries, interest under 19 U.S.C. 1505, and an entry audit of IEEPA duty paid. Waits on the IEEPA-period backfill (verified rates currently start Nov 17, 2025; IEEPA duties started Feb 4, 2025). Biggest demand: "tariff refunds for businesses", "tariff refund portal", "IEEPA refund".
2. **Section 122 refunds** (`/tariff-refunds/section-122`). The Feb 24 to Jul 24, 2026 surcharge, the May 7, 2026 CIT ruling, the Federal Circuit stay and appeal (*State of Oregon v. Trump*, Nos. 2026-1804, -1805), and how to preserve claims before liquidation. Update when the Federal Circuit rules.
3. **Retroactive exemptions and HTS corrections** (`/tariff-refunds/corrections`). Every retroactive change the engine models (e.g. Rev 11's 9903.82.02 correction back to Apr 6, 2026; EO 14361's Brazil agricultural exemption back to Nov 13, 2025), generated from the tariff data, with the PSC and protest routes.
4. **Duty drawback** (`/tariff-refunds/drawback`). Up to 99% back on exported or destroyed goods, 5-year window; how tariff stacking raises drawback value.
5. **Section 301 exclusions** (`/tariff-refunds/section-301-exclusions`). Retroactive exclusion extensions and how to claim them.

## Waiting on: verified IEEPA-period history (Feb 2025 – Feb 2026)

HTS Hero's verified rate history starts on November 17, 2025 (2025 HTS Revision 29) as of Oct 10, 2026, and the backfill is moving earlier. Once the IEEPA period is backfilled, these become some of the highest-traffic pages we can publish: IEEPA refunds are the biggest content category among competitors right now (Flexport, Wove, GingerControl, TariffsTool and TariffLens all have refund tools or guides), and every refund depends on the rate on each entry date, which is exactly what HTS Hero calculates.

Priority order:

1. **IEEPA tariff refunds: who qualifies and how to calculate yours.** A pillar guide: the Supreme Court ruling (Feb 20, 2026), which duties are refundable, the headings involved, how refunds are worked out per entry, and an HTS Hero entry audit as the CTA. Targets "IEEPA refund", "tariff refund calculator", "how to get tariff refund".
2. **IEEPA tariff rates by country, Feb 2025 – Feb 2026.** The full reciprocal and fentanyl rate timeline for every country, generated from the backfilled data like the "Latest US Tariff Changes" table. Built to be cited.
3. **The IEEPA reciprocal tariff, revision by revision.** One table of every 2025 HTS revision's changes to 9903.01.xx and 9903.02.xx headings.
4. **Fentanyl tariffs on Canada, Mexico and China: the full history.** Rates, USMCA carve-outs and end dates.
5. **Comparison: IEEPA refund calculators.** HTS Hero vs Flexport's Tariff Refund Calculator, Wove and others, once HTS Hero can audit IEEPA-period entries. Add as tool records in `libs/compare/tools/` with a new feature row for refund estimates.
6. **Refresh the four migrated 2025 posts** (de minimis, India Russian oil tariff, China 301 exclusions, reciprocal exemptions) with "audit your entries from this period" CTAs that link to the backfilled history.

When this lands, also update the "history" CTA in `components/blog/cta/ctaContent.ts` and HTS Hero's `entryDate` note in `libs/compare/tools/htsHero.ts`; both read the start date from `VerifiedTariffRevisions`, so they update on their own once those revisions are added.
