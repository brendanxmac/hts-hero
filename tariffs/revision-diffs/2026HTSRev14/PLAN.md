# Plan: apply 2026HTSRev14 (2026HTSRev13 → 2026HTSRev14)

Package checks: `allDecided` true; `contentHash` matches `changes.json` (`807c8383…f1dcc3`);
`fromRevision` 2026HTSRev13 is the latest in `VerifiedTariffRevisions`; `consecutive` true.
`context.md`: "Section 232 Pharmaceutical Tariffs Added". Revision dates: 2026-07-31 →
2026-08-03 (entries through August 2, 2026). 28 approved, 0 deferred, 6 skipped. One reviewer
note (CR-2, cut off in the package): "Headings 9903.04.60–9903.04.69 are mutually exclusive, so
only one of them can apply to a given article / importa…". Headings come from the revision's own
heading pages (`headings.md`, reviewed).

**What this revision is:** a new **Section 232 tariff on pharmaceuticals** (Proclamation 11020),
from **July 31, 2026** (every CR row): U.S. note 40 and headings 9903.04.60–.69. Patented
pharmaceuticals in the note 40(c) provisions pay **100% including the base rate**, with lower
rates or exemptions by country, company, product type and patent status. The Brazil and
forced-labor exemptions for Section 232 goods now include patented pharmaceuticals.

---

## A. Section 232 pharmaceuticals: note 40, headings 9903.04.60–.69 (CR-2–12, CR-19–28)

**Scope, 40(c):** the headings "apply to articles that are classifiable in the following provisions
of the HTSUS": **131 provisions** in chapters 29 and 30 (APIs, hormones, antibiotics, blood
products, medicaments), written as 10-digit statistical numbers ("3004.90.9201"). New list
`pharmaceuticals40c`.

**40(a):** "These headings are mutually exclusive, such that an imported article will be subject
to no more than one of these headings. Pharmaceutical articles … are subject to heading
9903.04.60 unless another of these headings applies." That matches your reviewer note.

**40(b):** the duties are "collected in addition to any special rate of duty", so FTA claims don't
remove them. No condition on preferences.

| Heading | Text (headings.md, note 40) | Rate | Model |
|---|---|---|---|
| **9903.04.60** | patented pharmaceutical articles, (c) and (d) | "100%"; (d): "the sum of the column 1 duty rate and the additional ad valorem rate of duty shall be the rate of duty provided by heading 9903.04.60" | `topUpTo 100`; the default per 40(a) |
| **9903.04.61** | (e): patented articles "imported for companies identified by the Secretary and imported before 12:01 am eastern time on September 29, 2026" | no additional duty | `free`, `confirm`; effective 2026-07-31 → 2026-09-29 |
| **9903.04.62** | (f): patented articles of Japan, an EU member, South Korea, Switzerland or Liechtenstein "that would otherwise be subject to … 9903.04.60" | "15%", (f): total including the base rate | `topUpTo 15`; countries JP, `eu-members`, KR, CH, LI |
| **9903.04.63** | (g): patented articles of the United Kingdom "that would otherwise be subject to … 9903.04.60" | "+ 10%" | `adValorem 10`; GB |
| **9903.04.64** | (h)(i): patented articles imported for companies with an approved onshoring plan | "+ 20%" | `adValorem 20`, `confirm` |
| **9903.04.65** | (h)(ii): meets (h)(i) **and** a Most-Favored-Nation pricing agreement | "+ 0%" | `free`, `confirm` |
| **9903.04.66** | (h)(iii): orphan drugs, nuclear medicines, plasma-derived, fertility, cell and gene therapies, ADCs, medical countermeasures, other listed specialty products | "+ 0%" | `free`, `confirm` |
| **9903.04.67** | generic pharmaceutical articles, (c)(iii) | no additional duty | `free`, `confirm` |
| **9903.04.68** | "Pharmaceutical products with an active pharmaceutical ingredient packaged in dosage form that is a product of the United States" | no additional duty | `free`, `confirm` |
| **9903.04.69** | (i): articles in the (c) provisions "that are not pharmaceutical articles" | no additional duty | `free`, `confirm` |

Column 2 for every heading: "The duty provided in the applicable subheading", so
`rateByColumn: { column2: free }` on the duty headings (.60, .62–.64).

**Mutual exclusivity (40(a)).** Each heading lists the ones that displace it, so at most one
applies. Proposed order, first wins (open question 2 is the one uncertain step):
1. **.69** not a pharmaceutical article, **.67** generic, **.68** U.S. API in dosage form. These
   are facts about the article that mean it isn't a patented pharmaceutical, so they beat every
   patented heading.
2. **.61** identified companies before September 29.
3. **.66** specialty products, **.65** onshoring and MFN agreement.
4. **.62** partner countries 15% total, **.63** UK +10%.
5. **.64** onshoring +20%.
6. **.60** 100%, the default.

The free headings among themselves (.61, .65–.69) give the same duty whichever wins; the order
only decides which line is shown. The note 16(a)-style exclusivity brute force test is extended
to .60–.69.

**Recipe:** §17.2 (new headings), a new program `232-pharmaceuticals` ("Section 232 –
Pharmaceuticals", authority `232`, legal basis "Proclamation 11020"), a new list (§7.2), and new
confirmations.

## B. The Section 232 exemptions in the Brazil and forced-labor duties (CR-13–18)

- Note 50(a)(vi)(8): "patented pharmaceutical articles provided for in headings
  9903.04.60–9903.04.66". 9903.05.07's description adds "patented pharmaceutical articles".
- Note 52(f)(8): the same, for 9903.05.90.
- → New versions of **9903.05.07** and **9903.05.90** from 2026-07-31: `whenApplies` adds
  9903.04.60–.66 to the shared 232 list, with the new descriptions. I won't change the shared
  `section232ArticleHeadingsFromJune8`: it also drives 9903.03.06, which ended July 24.
- Effect: a patented pharmaceutical from Brazil or from a note 52 country pays the 232 pharma duty
  **instead of** 9903.05.01 / the country rate. Generics (.67), U.S. API (.68) and non-pharma
  (.69) aren't listed, so those still pay the country rate (unless 9903.05.06 / .05.89, the
  pharmaceutical-use exemptions, are confirmed).
- Stacking with Section 301 China: no exclusion, so a patented Chinese drug pays both.

**Recipe:** §17.2-style new versions of existing headings (`tariffVersions`).

## C. Note 2(aa)(v) (CR-1)

Adds "(1) patented pharmaceutical articles provided for in headings 9903.04.60 … 9903.04.66", with
the compiler's note "Subdivision (aa)(v) expired at the close of July 23, 2026 … was modified after
expiration". Section 122 ended July 23 and these headings start July 31, so this can't change any
duty. **No data change**; noted in the plan and the PR.

## D. Engine logic

None. Existing handlers: `topUpTo`, `adValorem`, `free`, `answer`/`confirm`, `whenApplies`.

## E. Files

- `programs.ts`: `232-pharmaceuticals`.
- New `headings/232-pharmaceuticals.ts` and `lists/pharmaceuticals.ts`, registered in
  `data/index.ts`.
- `headings/301-brazil.ts` and `headings/301-forced-labor.ts`: July 31 versions of .05.07 and
  .05.90.
- `revisions.ts`: add `2026HTSRev14`.

## F. Tests ($10,000, August 1 unless stated)

- 3004.90.9201 (a medicament in (c)) from India, base Free:
  - July 30 → no pharma duty, 9903.05.44 10%;
  - August 1 → 9903.04.60, $10,000 (100%), and no 9903.05.44 (52(f)(8)).
- Base rate 5% → .60 tops up to 100% ($10,000 total).
- Germany → .62, $1,500 total. Liechtenstein → .62. UK → .63, +10%.
- Confirmed onshoring → .64, +20%; onshoring and MFN → .65, $0. Specialty → .66; generic → .67,
  and then India's 10% applies; not a pharmaceutical → .69.
- A Japanese company with onshoring confirmed → .62 (open question 2).
- Brazil → .60 and 9903.05.07, without 9903.05.01's 25%.
- China → .60 plus Section 301 China and no 9903.05.31.
- A code outside (c) (e.g. 3006.10) → no pharma heading.
- The exclusivity brute force over .60–.69 with every combination of confirmations.

---

## Not doing

Skipped by you (extraction noise or not substantive):
- #29 note 2.
- #30 note 13 (3 differences).
- #31 note 20 (14 differences).
- #32 note 21.
- #33 note 37.
- #34 note 38.

## Assumptions

1. Effective July 31, 2026 (change record, PP 11020). No end date, except .61's September 29.
2. Without answers, a (c) article is treated as a patented pharmaceutical under .60 (40(a): "subject
   to heading 9903.04.60 unless another of these headings applies"). Generic, non-pharmaceutical
   and U.S.-API status, and the company programs, are confirmations. This is conservative: the
   100% shows until the importer says otherwise.
3. .62's countries are the EU via `eu-members`, plus JP, KR, CH and LI.
4. "+ 0%" on .65/.66 means no additional duty (`free`).

## Open questions

1. **Program name:** I propose `232-pharmaceuticals`, "Section 232 – Pharmaceuticals" (legal basis
   Proclamation 11020). OK?
2. **Onshoring (.64, +20%) vs the country headings (.62 15% total, .63 UK +10%):** which applies to
   an onshoring company's drug from Japan, the EU, Korea, Switzerland, Liechtenstein or the UK?
   .62/.63 apply to articles "that would otherwise be subject to … 9903.04.60"; .64 has no such
   wording, and the note gives no order. I propose the **country heading wins** (it's the lower rate
   in both cases and is written relative to .60), so .64 only matters for other countries.
   Alternatively, .64 could win whenever the onshoring plan is confirmed.

## Changelog drafts (to add in phase 2)

- **revision, "HTS Revision 14 (2026)":** "Verified tariff data now covers entries through August
  2, 2026. From July 31, 2026, patented pharmaceuticals pay a new Section 232 duty of up to 100%,
  with lower rates for Japan, the EU, South Korea, Switzerland, Liechtenstein and the UK, and
  exemptions for generics and qualifying companies and products."
- **improvement, "New Section 232 duty on patented pharmaceuticals":** "From July 31, 2026,
  patented pharmaceuticals and their ingredients in the listed provisions pay a total of 100%
  including the regular duty. Products of Japan, the EU, South Korea, Switzerland and Liechtenstein
  pay 15% in total, UK products an additional 10%, and companies with approved onshoring plans an
  additional 20%. Generics, non-pharmaceutical goods and certain specialty products are exempt.
  These goods no longer pay the Brazil or country-specific Section 301 duties."

---

## Decisions after review (Oct 2, 2026)

1. **Open question 1:** program `232-pharmaceuticals`, "Section 232 – Pharmaceuticals".
2. **Open question 2:** the country heading (.62/.63) applies by default; when the user confirms
   an onshoring plan, **.64 takes precedence** over .62/.63. Implemented by listing .64 in
   .62/.63's exceptions. Final order, first wins: .69, .67, .68, .61, .66, .65, .64, .62/.63, .60.

## Found while implementing

- Most 40(c) codes (87 of 131) are already on note 52(b)'s or 50(a)(ii)'s automatic exemption
  lists, so the new 52(f)(8)/50(a)(vi)(8) exemptions change the result only for the other 44. The
  tests use one of those (2918.99.30.00).
