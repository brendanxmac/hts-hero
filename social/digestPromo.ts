import type { DigestPromoProps } from "./types"

// The Weekly Tariff Digest's promo post (social/templates/DigestPromo.tsx): the copy, and the
// updates its email shows. Real published updates from /tariff-updates, as of the date below,
// shaped as the digest email draws them (libs/email/tariff-news.ts updateSummary). Refresh them
// before posting again so the email shows what's current.
// Copy rules: what the digest really is (free, weekly, every US tariff action); rates in %.

export const DIGEST_PROMO_AS_OF = "2026-11-04"

export const DIGEST_PROMO: DigestPromoProps = {
  theme: "dark",
  eyebrow: "The Weekly Tariff Digest",
  line1: "Every US tariff change.",
  line2: "One email. Every Monday.",
  cta: "Subscribe free",
  url: "htshero.com/tariff-digest",
  emailSubject: "Your Weekly Tariff Brief",
  emailHeading: "The latest US tariff updates",
  updates: [
    {
      "slug": "commerce-defines-u-s-content-for-usmca-metal-goods-under-proclamation-11032-2026-10-09",
      "title": "Commerce defines \"U.S. content\" for USMCA metal goods under Proclamation 11032 tariffs",
      "summary": "A Bureau of Industry and Security notice gives CBP guidance on assessing \"U.S. content\" under clause (2)(d) of Proclamation 11032 of June 1, 2026, which adjusted the Section 232 tariffs on aluminum, steel and copper. It applies to products of Canada and Mexico that qualify for USMCA preferential treatment. U.S. content means the value attributable to parts wholly obtained, entirely produced or substantially transformed in the US. It also covers, where not already counted, the value of steel melted and poured or aluminum or copper smelted and cast in the US. The guidance applies to goods entered or withdrawn from warehouse for consumption on or after 12:01 a.m. ET on October 14, 2026.",
      "authorityLabel": "Section 232",
      "stageLabel": "Published",
      "effectiveOn": "2026-10-14",
      "countriesLabel": "Canada, Mexico",
      "tone": "brand"
    },
    {
      "slug": "adcvd-investigation-hardwood-and-decorative-plywood-2026-07",
      "title": "Commerce makes final antidumping and countervailing duty determination on hardwood and decorative plywood from China, Indonesia and Vietnam",
      "summary": "This notice is a correction to a prior final affirmative antidumping determination on hardwood and decorative plywood from Vietnam, fixing a product dimension description in the scope language; it sets no new rates.",
      "authorityLabel": "AD/CVD",
      "stageLabel": "Published",
      "effectiveOn": "2026-10-21",
      "countriesLabel": "China, Indonesia, Vietnam",
      "tone": "brand"
    },
    {
      "slug": "ustr-conforms-china-section-301-exclusion-20-vvv-i-20-to-new-hts-statistical-2026-09-01",
      "title": "USTR conforms China Section 301 exclusion 20(vvv)(i)(20) to new HTS statistical number",
      "summary": "USTR makes a conforming amendment to Section 301 product exclusion U.S. note 20(vvv)(i)(20) to subchapter III of chapter 99 of the HTSUS, following USITC changes to ten-digit statistical reporting categories effective July 1, 2026. The excluded product is now described under statistical reporting number 8479.90.9591 from July 1, 2026, with the earlier description applying through June 30, 2026. The amendment maintains pre-existing product coverage and applies retroactively to goods of China entered on or after July 1, 2026. CBP will issue entry and implementation instructions.",
      "authorityLabel": "Section 301",
      "stageLabel": "CBP guidance",
      "effectiveOn": "2026-07-01",
      "countriesLabel": "China",
      "tone": "down"
    },
    {
      "slug": "cbp-seeks-comment-on-extending-ieepa-tariff-refund-worksheet-cape-information-2026-07-07",
      "title": "CBP seeks comment on extending IEEPA tariff refund worksheet (CAPE) information collection",
      "summary": "CBP published a 30-day Paperwork Reduction Act notice (OMB Control No. 1651-0149) proposing to extend the information collection for court-ordered refunds of IEEPA duties, filed as CAPE Declarations through the ACE Portal. The refunds follow the Supreme Court's February 20, 2026 ruling in Learning Resources, Inc. v. Trump that IEEPA tariffs collected since February 3, 2025 were unlawful, and CIT orders now in the Euro-Notions Florida, Inc. test case. Importers or their brokers submit CSV files of entry summary numbers (up to 9,999 per declaration); AD/CVD, Section 232 duties, taxes and fees are retained, and refunds are paid electronically via ACH. Comments are due by November 4, 2026.",
      "authorityLabel": "IEEPA",
      "stageLabel": "Published",
      "effectiveOn": null,
      "countriesLabel": "All countries",
      "tone": "brand"
    }
  ],
}
