// The groups of duty importers can get back, each shown as a card on /tariff-audit. Each group
// will get its own page (see content/CONTENT_TODO.md): set its href when that page ships.
// Statuses and dates were checked on Oct 10, 2026; update them when a court or CBP acts.

import {
  CBP_IEEPA_REFUNDS_URL,
  DRAWBACK_STATUTE_URL,
  PROTEST_STATUTE_URL,
  SCOTUS_IEEPA_OPINION_URL,
  htsChangeRecordUrl,
} from "@/libs/official-sources";

export type RefundStatusTone = "success" | "warning" | "neutral";

export interface RefundGroup {
  id: string;
  name: string;
  period: string;
  status: string;
  tone: RefundStatusTone;
  summary: string;
  // What HTS Hero's audit does for this group; {verifiedFrom} is filled in on the page
  check: string;
  // The group's own refund page, once it exists
  href: string | null;
  // The primary sources for the summary's facts. None for Section 122 until the CIT ruling and
  // the Federal Circuit stay are checked against the court records (tariffs/engine-v2/REFUNDS.md).
  sources: { label: string; url: string }[];
}

export const REFUND_GROUPS: RefundGroup[] = [
  {
    id: "ieepa",
    name: "IEEPA tariffs",
    period: "Feb 4, 2025 to Feb 23, 2026",
    status: "Refunds open",
    tone: "success",
    summary:
      "The Supreme Court held on Feb 20, 2026 that IEEPA doesn't authorize tariffs. CBP refunds the duty with interest through CAPE in ACE for unliquidated entries and entries within 80 days of liquidation. Finally liquidated entries need a protest or a court action.",
    check:
      "Flags the IEEPA duty on each entry from {verifiedFrom}, the start of HTS Hero's verified rates. Earlier entries are being added.",
    href: null,
      sources: [
      { label: "Learning Resources v. Trump, No. 24-1287 (Supreme Court)", url: SCOTUS_IEEPA_OPINION_URL },
      { label: "CBP: IEEPA duty refunds", url: CBP_IEEPA_REFUNDS_URL },
      { label: "19 U.S.C. 1514 (protests)", url: PROTEST_STATUTE_URL },
    ],
  },
  {
    id: "section-122",
    name: "Section 122 surcharge",
    period: "Feb 24 to Jul 24, 2026",
    status: "Appeal pending",
    tone: "warning",
    summary:
      "The Court of International Trade held the 10% surcharge invalid on May 7, 2026, with relief for the named plaintiffs. The Federal Circuit stayed that ruling on June 11 while the appeal proceeds, so importers are preserving their claims before entries liquidate.",
    check: "Shows the Section 122 duty on every entry in the period, so you know what's at stake and which entries to protect.",
    href: null,
    sources: [],
  },
  {
    id: "corrections",
    name: "Retroactive exemptions and corrections",
    period: "Any date a change reaches back to",
    status: "Claimable now",
    tone: "success",
    summary:
      "Some changes reach back in time. HTS Revision 11 restored a Section 122 exemption for steel and aluminum under 9903.82.02 back to Apr 6, 2026, and EO 14361 exempted Brazilian agricultural products back to Nov 13, 2025. Duty paid before the change can be recovered.",
    check: "Recalculates each entry with the rules as they now stand for its date, so retroactive savings show up as overpaid duty.",
    href: null,
    sources: [
      { label: "USITC: HTS Revision 11 change record", url: htsChangeRecordUrl("2026HTSRev11") },
      { label: "EO 14361 (90 FR 54467)", url: "https://www.federalregister.gov/d/2025-21417" },
    ],
  },
  {
    id: "section-301-exclusions",
    name: "Section 301 exclusions",
    period: "Per exclusion",
    status: "Case by case",
    tone: "neutral",
    summary:
      "USTR grants and extends exclusions from the China Section 301 tariffs, sometimes after goods have already entered. Entries that paid 301 duty on an excluded product can be corrected.",
    check: "Applies every Section 301 exclusion in the HTS to each entry's date.",
    href: null,
    sources: [
      { label: "USTR exclusion extensions, 90 FR 55232", url: "https://www.govinfo.gov/content/pkg/FR-2025-12-01/html/2025-21671.htm" },
    ],
  },
  {
    id: "drawback",
    name: "Duty drawback",
    period: "Up to 5 years after import",
    status: "Ongoing program",
    tone: "neutral",
    summary:
      "If you export or destroy goods you imported, up to 99% of the duty paid can come back as drawback. The higher the tariffs on an entry, the more its drawback is worth.",
    check: "Coming soon: entries whose duty makes drawback worth pursuing.",
    href: null,
    sources: [{ label: "19 U.S.C. 1313 (drawback)", url: DRAWBACK_STATUTE_URL }],
  },
];
