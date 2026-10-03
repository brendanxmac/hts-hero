# Plan: apply 2026HTSRev20 (2026HTSRev19 → 2026HTSRev20)

Package checks: `allDecided` true; `contentHash` matches `changes.json` (`36f0eae1…02c908`);
`fromRevision` 2026HTSRev19 is the latest in `VerifiedTariffRevisions`; `consecutive` true. No
`context.md`. Revision dates: from 2026-09-28; it's the current revision, with no end date yet. 6
approved, 0 deferred, 9 skipped. No reviewer notes. Headings come from the revision's Chapter 99
JSON (`headings.md`).

**What this revision is:** changes to **Section 232 – Pharmaceuticals** (note 40), all effective
**September 29, 2026** (change record, "Notice"):
- the product list is re-split;
- the definitions narrow;
- 9903.04.69 widens;
- a new exemption, **9903.04.70**, for clinical trials, R&D and non-commercial use.

---

## A. The 40(c) list (CR-2)

The extraction reproduces the engine's current `pharmaceuticals40c` exactly (131 statistical
numbers). Rev 20 has **149**:

- **Split into finer statistical numbers (same coverage):**
  - 2922.19.0900 → .0910/.0990; 2934.99.4700 → .4720/.4730/.4740/.4790;
  - 2937.22.0000 → .0010/.0090; 2941.90.3000 → .3030/.3090; 2941.90.5000 → .5030/.5090;
  - 3004.31.0000 → .0010/.0090.
- **Changed within chapter 30:**
  - removed 3004.20.0083, 3004.32.0060, 3004.39.0055, 3004.90.9225;
  - added 3004.20.0042/.0058/.0073/.0074/.0078/.0085, 3004.32.0020/.0080, 3004.39.0015/.0080,
    3004.90.9212/.9217/.9218/.9226.

→ `pharmaceuticals40c` gets a second version from 2026-09-29 with the Rev 20 list (§17.5).

## B. New heading 9903.04.70 (CR-1, CR-6; 40(a))

Heading (headings.md): "Pharmaceutical articles and associated ingredients provided for in
subdivision (c) of U.S. note 40 to this subchapter that are solely for use in clinical trials,
research and development, or other non-commercial applications | The duty provided in the
applicable subheading + 0%" (all columns). 40(a) now reads "Headings 9903.04.60–9903.04.70 … are
mutually exclusive".

→ New record: all countries, codes `pharmaceuticals40c`, `free`, `confirm("9903.04.70")`, from
2026-09-29.

**Precedence:** it's an exemption about the article's use, so it beats every patented heading. It
goes into the first group with .69/.67/.68, after them (all free, so the order between them only
decides which line shows): .69, .67, .68, **.70**, .61, .66, .65, .64, .62/.63, .60. → .60–.66 get
versions from 2026-09-29 listing .70 among their exceptions, and .70 lists .69, .67, .68. The
brute-force exclusivity test adds .70.

Like generics, 9903.04.70 isn't in the Section 232 lists of notes 50(a)(vi)(8), 51(c)(8) or
52(f)(8) (those name .60–.66). So an exempted article still pays the country rates, unless their own
pharmaceutical exemptions apply.

## C. Definitions (CR-3, CR-4, CR-5): no data change

- **40(c)(i):** "Pharmaceutical articles" are now "finished pharmaceutical products or … active
  pharmaceutical ingredients (including key starting materials for active pharmaceutical
  ingredients) … Inactive ingredients and excipients are not pharmaceutical articles."
- **40(c)(iii):** generic pharmaceutical articles now include "an unpatented animal health product".
- **40(i):** 9903.04.69 now applies to articles that are "(1) not 'pharmaceutical articles' … or
  (2) are 'pharmaceutical articles' but are neither 'patented pharmaceutical articles' nor 'generic
  pharmaceutical articles'".

These change what the confirmations mean, not how they work: an excipient, or a pharmaceutical
article that's neither patented nor generic, is now confirmed under .69, and an unpatented animal
health product under .67. The questions show the heading's legal text with the cited notes
("Referenced notes"), so the new definitions appear automatically once the notes are refreshed.

## D. Engine logic

None.

## E. Tests ($10,000; September 30, 2026 unless stated)

- 2918.99.30.00 from India, 9903.04.70 confirmed → .70, no pharma duty (but the 10% country rate);
  September 28 → .70 doesn't exist yet, so .60.
- A newly listed number, 3004.20.00.42 → .60 from September 29, and none on September 28 (it wasn't
  listed).
- A removed number, 3004.20.00.83 → .60 on September 28, none on September 30.
- A split number, 2922.19.09.10 → .60 on September 30.
- The brute force over .60–.70 with every combination of answers.

---

## Not doing

Skipped by you (extraction noise):
- #7 chapter 99 U.S. note 1; #8 chapter 99 U.S. note 2;
- #9 statistical note 1; #10 statistical note 2;
- #11 subchapter III note 2; #12 note 19; #13 note 20 (21 differences); #14 note 39; #15 note 52.

## Assumptions

1. Effective September 29, 2026 for everything (change record).
2. 9903.04.70 is a confirmation, like the other use-based exemptions.
3. .70 ranks with the other free "not a patented pharmaceutical" headings; the order among free
   headings doesn't change the duty.

## Open questions

None.

## Changelog drafts (to add in phase 2)

- **revision, "HTS Revision 20 (2026)":** "Verified tariff data now covers entries from September
  28, 2026 onward. From September 29, 2026, pharmaceuticals solely for clinical trials, research and
  development or other non-commercial use are exempt from the Section 232 pharmaceutical duty, and
  the list of covered products is updated."
- **improvement, "Section 232 pharmaceutical exemption for clinical trials and research":** "From
  September 29, 2026, pharmaceutical articles and ingredients used solely in clinical trials,
  research and development or other non-commercial applications pay no Section 232 pharmaceutical
  duty. Inactive ingredients and excipients are no longer pharmaceutical articles, and unpatented
  animal health products count as generics."

---

## Decisions after review (Oct 3, 2026)

Approved as planned. Found while implementing: 9903.04.61 already ends on 2026-09-29, the day .70
starts, so it needs no new version.
