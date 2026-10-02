# Plan: apply 2026HTSRev13 (2026HTSRev12 → 2026HTSRev13)

Package checks: `allDecided` true; `contentHash` matches `changes.json` (`75590425…cfa8da`);
`fromRevision` 2026HTSRev12 is the latest in `VerifiedTariffRevisions`; `consecutive` true.
`context.md`: "This Revision marks the end of the Section 122 tariffs at the end of the day on July
23, 2026. All these new tariffs in this list come into affect July 24, 2026." Revision dates:
2026-07-28 → 2026-07-31 (entries through July 30, 2026). 103 approved, 0 deferred, 3 skipped. No
reviewer notes. Headings come from the revision's own heading pages (`headings.md`, reviewed).

**What this revision is:** Section 122 ends at the close of July 23, and from **July 24, 2026**
(change record, every row: "Notice") a new U.S. note 52 sets **country-by-country additional
duties** for 62 countries and the EU (headings 9903.05.20–.84), with exemptions (9903.05.85–.06.21).
Like Brazil's note 50, it copies Section 122's structure.

July 24 falls inside Rev 12 (July 21–27), so the new records start mid-Rev 12. Results for July
24–27 change, and **one Rev 12 test changes** (see E).

---

## A. Section 122 ends (change #103, note 2(aa) compiler's note)

"[Compiler's note: Subdivisions (aa)(i) through (aa)(viii) of U.S. note 2 to this subchapter and
headings 9903.03.01–9903.03.11 expired at the close of July 23, 2026. See 91 Fed. Reg. 9339.]"

The engine already ends every 122 record at `to: "2026-07-24"` (exclusive), i.e. the close of
July 23. **No data change.** I'll add a pinned test that 9903.03.01 doesn't apply on July 24.

## B. The country rates: 9903.05.20–.84 (CR-1–CR-66; note 52(a), (k))

Note 52(a): "headings 9903.05.20–9903.05.84 impose additional ad valorem rates of duty on imports
of all products of the countries provided for in these headings … shall also be subject to any
additional duty provided for in this subchapter or in subchapter IV … Products that are eligible
for special tariff treatment under general note 3(c)(i) … shall be subject to the additional ad
valorem rates". So: all codes, stacks with everything else, applies even with an FTA claim (except
where (g)–(j) say otherwise).

**Plain adders** (`adValorem`; Column 2: "The duty provided in the applicable subheading", so
`rateByColumn: { column2: free }`):
- **+12.5%:** Algeria .20, Angola .21, Australia .23, Bahamas .24, Bahrain .25, Brazil .27, Chile
  .30, China .31, Colombia .32, Costa Rica .33, Dominican Republic .34, Egypt .36, Guyana .41,
  Hong Kong .43, Iraq .46, Israel .47, Kazakhstan .51, Kuwait .52, Libya .53, Morocco .56, New
  Zealand .57, Nicaragua .58, Nigeria .59, Norway .60, Oman .61, Peru .63, Philippines .64, Qatar
  .65, Russia .66, Saudi Arabia .67, Singapore .68, South Africa .69, Thailand .77, Türkiye .79,
  UAE .80, Uruguay .82, Venezuela .83, Vietnam .84.
- **+10%:** Argentina .22, Bangladesh .26, Cambodia .28, Canada .29, Ecuador .35, El Salvador .37,
  Guatemala .40, Honduras .42, India .44, Indonesia .45, Jordan .50, Malaysia .54, Mexico .55,
  Pakistan .62, Sri Lanka .72, Trinidad and Tobago .78, United Kingdom .81.

**"X% including the base rate" pairs** (note 52(k): "the sum of the column 1 duty rate and the
additional ad valorem rate of duty is 10 [12.5] percent ad valorem"), modeled like the existing
deal pairs (§17.7): the ≥ heading is `free` with `baseRate >= X`; the < heading is `topUpTo X`
with `baseRate < X`:
- **EU** (`eu-members`) 10%: .38 / .39.
- **Japan** 12.5%: .48 / .49.
- **South Korea** 12.5%: .70 / .71.
- **Switzerland** 12.5%: .73 / .74.
- **Taiwan** 10%: .75 / .76.

**(k) ad valorem equivalent:** "dividing the amount of duty payable under column 1-General by the
customs value", and for Korea, column 1-Special "properly claimed". The engine's
`baseRateEquivalentPct` already is duty payable ÷ customs value, from the column actually used. So
specific and compound rates are handled, and a claimed KORUS rate counts, with no logic change.

**Exceptions:** each heading lists exactly the exemption headings its text names: .85–.92 for all;
plus Canada .93, Mexico .94, CAFTA textiles .95 (CR, DO, SV, GT, HN, NI), UK .96, EU .97,
Switzerland .98, and each (j) country's pair (MY .99/.06.01, KH .06.02/.03, GT .06.04–.06, SV
.06.07–.09, AR .06.10/.11, BD .06.12/.13, TW .06.14/.15, ID .06.16/.17, EC .06.18/.19, JO
.06.20/.21). Every heading's exception list was read from `headings.md`.

## C. Exemptions: 9903.05.85–9903.06.21 (CR-67–CR-102; note 52(b)–(j))

All `free`, **from 2026-07-24**, modeled like their Section 122 and Brazil twins:

| Heading | Note | Model |
|---|---|---|
| .85 | in transit: loaded before July 24, entered before July 28 | `dateBefore loadingDate 2026-07-24`; effective 2026-07-24 → 2026-07-28; all countries |
| .86 | (b) listed provisions | new list `countryRatesExempt52b` (863 codes). Close to Brazil's 50(a)(ii) but not equal (92/93 differ) |
| .87 | (c) 16 particular articles | new list `countryRatesExempt52c` (the 11 Section 122/Brazil articles plus 5 seeds for sowing and a plywood) |
| .88 | (d) civil aircraft, general note 6 | new list `countryRatesCivilAircraft52d` (541 codes, Brazil's 546 minus 5); `confirm` |
| .89 | (e) pharmaceuticals | new list `countryRatesPharma52e` (700 codes, Brazil's 705 minus 5); `confirm` (as you decided for Brazil) |
| .90 | (f) Section 232 articles | `whenApplies` the shared `section232ArticleHeadingsFromJune8` ((f)(1)–(7) match it word for word) |
| .91 / .92 | donations / informational materials | `isDonation` / `isInformationalMaterial` |
| .93 / .94 | (g)/(h) Canada / Mexico "entered free of duty under the USMCA" | `preferenceClaimed S, S+`, like 9903.03.07/.08 |
| .95 | (i) CAFTA-DR textile or apparel goods (GN 29(d)(v)) of the six countries | `preferenceClaimed P, P+` and `confirm` (textile/apparel), like 9903.03.09 |
| .96–.98 | (j)(1)–(3) UK, EU, Switzerland lists (49, 43, 134 codes) | one list each |
| .99–.06.21 | (j)(4)–(13) MY, KH, GT, SV, AR, BD, TW, ID, EC, JO: (i) a list and (ii) particular articles each; GT and SV also (iii) a list "for which entry is claimed under" CAFTA-DR | one list per subdivision; (iii) adds `preferenceClaimed P, P+` |

The lists were extracted from the Rev 13 note text (reference file). They go in a new
`data/lists/country-rates-2026.ts`. List sizes: (j)(6)(iii) 1,737 and (j)(7)(iii) 1,707
(CAFTA-claimed goods, mostly textiles); (j)(13)(i) Jordan 1,887 (a superset of the Guatemala
list).

## D. Files

- New program (open question 1) in `programs.ts`.
- New `headings/country-rates-2026.ts`, generated by a script from `headings.md` so all 101
  headings carry their exact text, rates and exceptions, then reviewed by hand. The script isn't
  committed.
- New `lists/country-rates-2026.ts`, registered in `data/index.ts`.
- `revisions.ts`: add `2026HTSRev13`.

**Engine logic:** none. Everything uses existing handlers.

## E. Tests (new Rev 13 block, plus one Rev 12 change)

$10,000 unless stated, July 29 unless stated:
- VN T-shirt: July 23 → Section 122 only; July 24 → 9903.05.84 12.5%, no Section 122.
- UK +10%; a country not listed (e.g. Kenya) → nothing.
- EU 4% good → .39 tops up to 10% ($1,000 total); EU 12% good → .38, nothing added. Japan 2% →
  .49 ($1,250 total).
- Specific rate: a Japan good with $0.50/kg, 100 kg at $1,000 → 5% equivalent → .49 adds 7.5%.
- Brazil: .27 12.5% **and** 9903.05.01 25% (they stack: (a) "shall also be subject to any
  additional duty").
- China: 12.5% on top of Section 301.
- Canada with a USMCA claim → .93; without → .29 10%.
- Exemptions: (b) code → .86; pharma and aircraft confirmed → .89 / .88; steel 7206.90 → .90 with
  9903.82.02; loaded July 22, entered July 26 → .85; UK (j)(1) code → .96; Malaysia (j)(4)(ii)
  argan oil → .06.01; Guatemala (j)(6)(iii) code with a CAFTA claim → .06.06.
- Russia: no additional duty (Column 2; open question 2).
- **Rev 12 test changed:** the Brazil T-shirt on July 25 was "25% only ($4,150)". From July 24 it
  also pays 9903.05.27's 12.5% ($5,400). That's a law change inside Rev 12's window, not a
  correction. The other Brazil tests filter on "9903.05" and will be narrowed to 9903.05.01–.09.

---

## Not doing

Skipped by you (extraction noise): #104 note 19, #105 note 20 (14 differences), #106 note 38.

Not modeled, as with Sections 122 and 301 Brazil: the chapter 98 rule in 52(a), and the
personal-use baggage exclusion.

## Assumptions

1. Effective July 24, 2026 (change record and your context). No end date.
2. The country rates stack with Section 301 China and Section 301 Brazil, per 52(a).
3. 9903.05.87's religious-use items need no confirmation (like 9903.03.04 and 9903.05.04).
   Aircraft (.88) and pharma (.89) are confirmed, matching your Brazil decision.
4. "Hong Kong, China" is HK only; "China" is CN.
5. .95 and the (j)(6)(iii)/(7)(iii) headings need a CAFTA-DR claim (P/P+). .95 also confirms the
   good is a textile or apparel good.

## Open questions

1. **Which legal action, for the program name?** The change record only says "Notice", and note 52
   doesn't name the authority. I'd guess USTR Section 301 country determinations replacing Section
   122. I propose program `301-country-rates`, "Section 301 – Country Rates", authority `301`.
   It's a label only; nothing selects by authority.
2. **Russia (9903.05.66):** its heading's Column 2 rate is "The duty provided in the applicable
   subheading", and Russia is a Column 2 country. Read literally, **Russia pays no additional duty**
   under note 52. I propose following the heading (`rateByColumn: { column2: free }` on every
   country heading, as in 9903.05.01). Alternatively, I can make Russia's 12.5% apply in Column 2
   too.

## Changelog drafts (to add in phase 2)

- **revision, "HTS Revision 13 (2026)":** "Verified tariff data now covers entries through July
  30, 2026. Section 122's 10% duty ended at the close of July 23, 2026, and from July 24 new
  country-specific duties of 10% or 12.5% apply to goods from 62 countries and the EU. For the EU,
  Japan, South Korea, Switzerland and Taiwan, the rate is a total including the regular duty."
- **improvement, "New country-specific duties replace Section 122 from July 24, 2026":** "Goods
  from 62 countries and the EU now pay an additional 10% or 12.5% instead of Section 122's 10%. EU
  and Taiwan goods pay at least 10% in total, and Japan, South Korea and Switzerland at least
  12.5%, including the regular duty. Exemptions cover goods in transit, listed products, civil
  aircraft, pharmaceuticals, Section 232 goods, USMCA goods and some country-specific products."

---

## Decisions after review (Oct 2, 2026)

1. **Open question 1:** program `301-forced-labor`, "Section 301 – Forced Labor", authority
   `301`. Headings in `headings/301-forced-labor.ts`, lists in `lists/forced-labor-301.ts`, with
   list ids `forcedLabor52…`.
2. **Open question 2: follow the heading.** **Correction to the plan:** Russia's heading
   (9903.05.66) is the one country heading whose Column 2 reads "The duty provided in the
   applicable subheading **+ 12.5%**". Every other country heading's Column 2 has no additional
   duty. Following the heading therefore means **Russia pays the 12.5%**, not "no additional
   rate" as the plan said. Implemented per the heading text; flagged to you for confirmation.
3. **Count correction:** 59 countries plus the EU (55 with plain adders, plus Japan, South Korea,
   Switzerland and Taiwan), not 62.
