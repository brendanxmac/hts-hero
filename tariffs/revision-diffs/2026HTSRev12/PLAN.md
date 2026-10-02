# Plan: apply 2026HTSRev12 (2026HTSRev11 → 2026HTSRev12)

Package checks: `allDecided` true; `contentHash` matches `changes.json` (`df989990…d55438`);
`fromRevision` 2026HTSRev11 is the latest in `VerifiedTariffRevisions`; `consecutive` true.
No `context.md`. Revision dates: 2026-07-21 → 2026-07-28 (entries through July 27, 2026).
10 approved, 0 deferred, 6 skipped. No reviewer notes. Headings come from the revision's own
heading pages (`headings.md`, reviewed).

**What this revision is:** a new **25% additional duty on all products of Brazil**, effective
**July 22, 2026** ("Notice", every CR row), in a new U.S. note 50 and headings 9903.05.01–.09. Its
structure copies Section 122 (note 2(aa), 9903.03.01–.11) clause for clause. The rest of the
change record is unit-of-quantity errata in chapter 84 (484(f)), which don't affect Chapter 99.

All new records start **2026-07-22** (CR effective date), one day after the revision's start. No
end date is given.

---

## A. The duty: 9903.05.01 (CR-1, CR-2; note 50(a)(i))

Note 50(a)(i): "Except as provided in headings 9903.05.02–9903.05.09 and in subdivisions (a)(ii)
through (a)(vi) of this note, … heading 9903.05.01 imposes an additional ad valorem rate of duty on
imports of all products of Brazil." Heading: "Except for products described in headings
9903.05.02–9903.05.09, articles the product of Brazil … | The duty provided in the applicable
subheading + 25%" (General and Special); Column 2: "The duty provided in the applicable subheading".

- **Stacking:** "all products that are subject to … 9903.05.01 shall also be subject to any
  additional duty provided for in this subchapter or in subchapter IV", except as in (a)(ii)–(vi).
  So it stacks with Section 122 (while 122 lasts, to July 24) and Section 301 China doesn't apply to
  Brazil anyway. Note 2(aa) is unchanged in Rev 12, so Section 122 doesn't exempt it.
- **FTA claims don't remove it:** "Products that are eligible for special tariff treatment under
  general note 3(c)(i) … shall be subject to the additional ad valorem rate" (heading's Special
  column is also "+ 25%"). No preference condition.
- **Record:** `9903.05.01`, program `301-brazil` (open question 1), `countries: ["BR"]`,
  `codes: "all"`, `exceptions: [.02–.09]`, `rate: adValorem 25`,
  `rateByColumn: { column2: free }` (as the heading's Column 2 reads), from 2026-07-22.

**Recipe:** §17.2 (new headings), with a new program (§5).

## B. Exemption headings (CR-3–CR-10; note 50(a)(ii)–(vi))

All free (`rate: free`), `countries: ["BR"]`, from 2026-07-22, each listed in 9903.05.01's
`exceptions`. Modeled exactly like their Section 122 counterparts.

| Heading | Text | Model | 122 twin |
|---|---|---|---|
| **9903.05.02** | loaded before 12:01 a.m. July 22, 2026 and entered before 12:01 a.m. July 29, 2026 | `dateBefore loadingDate 2026-07-22`; effective 2026-07-22 → 2026-07-29 | 9903.03.02 |
| **9903.05.03** | (a)(ii): "articles … classifiable in the following subheadings" | new list `brazilExempt50aii` (864 subheadings from the note) | 9903.03.03 |
| **9903.05.04** | (a)(iii): 11 particular articles (etrogs, açaí, religious-use items…) | new list `brazilExempt50aiii` that includes `argiculturalArticlesExemptFromCertainTariffs` (identical 11 subheadings) | 9903.03.04 |
| **9903.05.05** | (a)(iv): civil aircraft and parts meeting general note 6 | new list `brazilCivilAircraft50aiv` that includes `civilAircraftArticleExemptFromSection122Tariff` (identical 546 codes); `confirm("9903.05.05")` | 9903.03.05 |
| **9903.05.06** | (a)(v): "articles … for use in pharmaceutical applications" in the listed provisions | new list `brazilPharma50av` (705 codes from the note); `confirm("9903.05.06")` (open question 2) | EU 9903.02.77 |
| **9903.05.07** | (a)(vi): Section 232 articles | `whenApplies: { codes: [the 232 headings in (a)(vi)(1)–(7)] }` | 9903.03.06 |
| **9903.05.08** | donations to relieve human suffering | `answer isDonation = true` | 9903.03.10 |
| **9903.05.09** | informational materials | `answer isInformationalMaterial = true` | 9903.03.11 |

**(a)(vi) list:** checked line by line against 2(aa)(v) in Rev 11/12: (1) metals "headings
9903.82.02 and 9903.82.04–9903.82.26" (so .01 and .03 aren't included, matching the Rev 11
correction); (2)–(7) autos, auto parts (incl. Taiwan .94.66–.69), wood (incl. .76.24), MHDV,
MHDV parts, semiconductors 9903.79.01. **Identical to 9903.03.06's current trigger list.** To keep
them from drifting, I'll export that list from `122.ts` as a named constant and use it in both.

**The new lists** were extracted from the Rev 12 note text (reference file) and checked against the
existing lists: (iii) and (iv) match exactly. (ii) shares most of its codes with Section 122's
(aa)(ii) list but differs (131 codes only in note 50, 365 only in 122's), so it's its own list.
(v) is close to the EU pharma list but not equal (19 only in note 50, 121 only in the EU list), so
it's its own list too. Lists (iii)/(iv) are written as `includes` of the existing lists, so they
can diverge later with a new version (§7.3).

**Recipe:** §17.2 and §7.2 (new lists in a new file `data/lists/brazil.ts`).

## C. Where the files go

- New `tariffs/engine-v2/data/headings/301-brazil.ts` (headings) and `data/lists/brazil.ts`
  (lists), registered in `data/index.ts`.
- `data/programs.ts`: new program `301-brazil`.
- `headings/122.ts`: export the (aa)(v) trigger list (no behavior change).
- `revisions.ts`: add `2026HTSRev12` to `VerifiedTariffRevisions`.

## D. Engine logic

None. Every piece uses existing handlers (`adValorem`, `free`, `dateBefore`, `answer`,
`whenApplies`).

## E. Tests (`testing/engine-v2/real-data.test.ts`, new Rev 12 block)

$10,000 of goods from BR unless stated:
- A non-listed product on July 21 → no Brazil duty; on July 22–23 → 9903.05.01 25% **plus**
  9903.03.01 10% (they stack); on July 25 (Section 122 over) → 25% only.
- The same product from VN on July 25 → no Brazil duty.
- A (ii) code (e.g. orange juice or a listed fruit) → 9903.05.03, no 25%.
- Civil aircraft part: not confirmed → 25%; confirmed → 9903.05.05.
- Pharmaceutical code: confirmed → 9903.05.06.
- 7206.90 steel → 9903.82.02 50% and 9903.05.07, no 25%; with 9903.82.01 confirmed (no metal) →
  25% applies (not in (a)(vi)(1)).
- Loaded July 20, entered July 25 → 9903.05.02, no 25%; entered July 29 → 25%.
- Donation / informational materials answered yes → no 25%.
- A USMCA-style FTA claim doesn't matter (Brazil has none); skip.

---

## Not doing

Skipped by you (not in the change record, extraction noise):
- #11 note 13(e)(vi).
- #12 note 19(g)(iv).
- #13 note 20 (15 differences).
- #14 note 21(a).
- #15 note 37(a).
- #16 note 39(b)(2).

Also not modeled, as with Section 122: the chapter 98 rule in (a)(i) (no duty on goods properly
entered under chapter 98, except 9802.00.40/.50/.60/.80 on the value added abroad). The calculator
works from chapters 1–97 codes.

## Assumptions

1. Effective 2026-07-22, the change record's date for every row (the revision starts July 21).
2. 9903.05.04's religious-use items need no confirmation, like Section 122's 9903.03.04 (same
   list, same wording).
3. 9903.05.07 exempts the whole value when a listed 232 heading applies (232 is on the full value
   since April 6), the same as 9903.03.06.

## Open questions

1. **Which legal action is this, for the program name?** The change record only says "Notice",
   and note 50 doesn't name the authority. The timing (July 2026, a year after USTR opened its
   Section 301 investigation of Brazil) and "Notice" suggest **Section 301**. I propose program
   `301-brazil`, "Section 301 – Brazil", authority `301`. It's a label only: no interaction
   selects by authority, so stacking is the same either way.
2. **9903.05.06 pharmaceuticals: require a confirmation?** The exemption is for articles "for use
   in pharmaceutical applications" in the listed provisions, an end-use test. I propose asking for
   confirmation (until confirmed, the 25% applies), like the EU's 9903.02.77. The alternative is
   exempting every listed code automatically.

## Changelog drafts (to add in phase 2)

- **revision, "HTS Revision 12 (2026)":** "Verified tariff data now covers entries through July
  27, 2026. From July 22, 2026, products of Brazil pay an additional 25% duty, with exemptions for
  listed products, civil aircraft, pharmaceuticals, Section 232 goods, donations and informational
  materials."
- **improvement, "New 25% duty on products of Brazil":** "From July 22, 2026, most products of
  Brazil pay an additional 25% on top of the regular duty and any other additional duties. Goods
  already in transit before July 22 and entered by July 28 are exempt, as are goods paying Section
  232 duties."

---

## Decisions after review (Oct 2, 2026)

1. **Open question 1:** program `301-brazil`, "Section 301 – Brazil", authority `301`.
2. **Open question 2:** 9903.05.06 requires confirmation (`confirm("9903.05.06")`); until
   confirmed, the 25% applies.
