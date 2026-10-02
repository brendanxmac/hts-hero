# Plan: apply 2026HTSRev16 (2026HTSRev15 → 2026HTSRev16)

Package checks: `allDecided` true; `contentHash` matches `changes.json` (`b05236e3…eaeadb1`);
`fromRevision` 2026HTSRev15 is the latest in `VerifiedTariffRevisions`; `consecutive` true.
`context.md`: "New Section 201 Tariff Safeguards on Quartz with Quotas included". Revision dates:
2026-08-14 → 2026-08-24 (entries through August 23, 2026). 7 approved, 0 deferred, 4 skipped. No
reviewer notes. Headings come from the revision's own heading pages (`headings.md`, reviewed).

**What this revision is:** a **Section 201 safeguard on quartz surface products** (Proclamation
11051), from **August 15, 2026** (every CR row; the revision starts August 14). New U.S. note 41
and headings 9903.45.30 (in quota) and 9903.45.31 (over quota), with rates stepping down each year
to August 14, 2030.

---

## A. Note 41 and headings 9903.45.30/.31 (CR-1–CR-7)

**Scope, 41(a):** quartz surface products (silica greater than any other single material, with a
resin binder), whether slabs, countertops, tiles etc.; not quarried stone. "The scope covers
imported products provided for under HTSUS subheadings 6810.99.0020, 6810.99.0040, and
7020.00.6000." → codes `6810.99.00.20`, `6810.99.00.40`, `7020.00.60.00`. Only the quartz part of
goods imported with sinks, vanities and so on is covered; the calculator works from the quartz
code, so nothing extra is modeled.

**41(b):** "such duties shall be cumulative and imposed in addition to the rate of duty established
… in chapters 68 or 70". With no exclusion elsewhere, they also stack with the other Chapter 99
duties (Section 301 China, the note 52 country rates, Brazil).

**41(c), exempt countries:** "the products of the following countries shall not be subject to the
rates of duty and tariff-rate quotas":
- (i) Canada and Mexico;
- (ii) Australia, Colombia, Costa Rica, Dominican Republic, El Salvador, Guatemala, Honduras,
  Israel, Nicaragua, Panama, Peru, Singapore, South Korea;
- (iii) 107 developing countries;
- (iv) 17 Caribbean Basin countries and territories.

→ New country list `quartzSafeguardExempt41c` (ISO codes), used as `excludeCountries`. Two
countries, Kosovo (XK) and Congo (Kinshasa) (CD), aren't in the calculator's country list yet; they
go in the list anyway.

**Headings (headings.md):**
- 9903.45.30: "Quartz surface products … when the product of any country not exempt under U.S.
  note 41(c) … if entered in an aggregate quantity **not exceeding** the quantity defined in U.S.
  note 41(d)": General 25%, Column 2 25%.
- 9903.45.31: the same, "**exceeding**" the quantity: General 50%, Column 2 50%.

The Special subcolumn is blank, and the FTA partners are exempt by country anyway, so the same rate
is used in every column.

**41(e), rates by year (dated versions):**

| Entered | 9903.45.30 | 9903.45.31 |
|---|---|---|
| Aug 15, 2026 – Aug 14, 2027 | 25% | 50% |
| Aug 15, 2027 – Aug 14, 2028 | 23% | 49% |
| Aug 15, 2028 – Aug 14, 2029 | 21% | 48% |
| Aug 15, 2029 – Aug 14, 2030 | 19% | 47% |

→ `tariffVersions` from 2026-08-15 with rate changes on 2027-08-15, 2028-08-15 and 2029-08-15,
ending on 2030-08-15 (the table's last day is August 14, 2030; nothing says it continues).

**41(d), the quota:** quarterly in-quota quantities in square meters (3,251,606 m² a quarter in
year one), with unused quantity carried forward, and "Entry of goods in excess of the quantities
specified above … shall be entered under the over-quota heading 9903.45.31". Whether a quarter's
quota is filled is a fact the calculator can't know, so it becomes a question: new input
`quartzQuotaFilled`, "Has the quarterly tariff-rate quota for quartz surface products been filled
(the entry falls outside it)?". 9903.45.31 requires it; 9903.45.30 lists .31 as an exception, so
exactly one applies. The default is open question 2.

**Recipe:** §17.2 (new headings), §14.3 (rate versions), §7.4 (country list), §10 (a new input), and
a new program `201-quartz` ("Section 201 – Quartz Surface Products", authority `201`, legal basis
Proclamation 11051).

## B. Engine logic

None. `excludeCountries`, `answer` with `assume`, `adValorem` and `tariffVersions` all exist.

## C. Files

- `programs.ts`: `201-quartz`.
- `inputs.ts`: `quartzQuotaFilled`.
- New `headings/201-quartz.ts`, and the country list in a new `lists/quartz.ts`, registered in
  `data/index.ts`.
- `revisions.ts`: add `2026HTSRev16`.

## D. Tests ($10,000; August 20, 2026 unless stated)

- 6810.99.00.20 from Vietnam:
  - August 14 → no 201 duty; August 20 → 9903.45.30 25% (plus Vietnam's 12.5% country rate,
    stacked).
  - Quota filled → 9903.45.31 50%.
- Rate steps: August 20, 2027 → 23% / 49%; 2029 → 19% / 47%; August 15, 2030 → none.
- China → 25% stacked with Section 301 China and the country rate.
- Exempt: Canada, South Korea (FTA), Brazil (developing), Bahamas (CBERA) → no 201 duty. India
  isn't on the list → pays.
- 7020.00.60.00 is covered; a granite code (6802.93) isn't.

---

## Not doing

Skipped by you:
- #8 note 2 (2 differences).
- #9 note 19.
- #10 note 20 (12 differences).
- #11 note 39.

Not modeled: the quota quantities, quarters and carry-forward (only the in/over answer); the
"only the QSP" split for combined goods; AD/CVD (41(b)).

## Assumptions

1. Effective August 15, 2026 (change record, PP 11051), ending after August 14, 2030.
2. Same rate in every column (blank Special; the FTA partners are exempt by country).
3. The 201 duties stack with the other Chapter 99 duties (41(b) "cumulative"; no exclusion in
   notes 50/52).

## Open questions

1. **Program name:** `201-quartz`, "Section 201 – Quartz Surface Products"? (The context says
   "Section 201 Tariff Safeguards on Quartz".)
2. **Quota default:** with no answer, which heading?
   - **(a) Recommended: in quota (25%),** with the question "quota filled?" turning it into 50%.
     9903.45.30 is the ordinary heading, and the questions panel will show "+$2,500 if the quota is
     filled".
   - **(b) Over quota (50%)** until the user says the quota isn't filled. It's more conservative,
     but it overstates most entries early in each quarter.

## Changelog drafts (to add in phase 2)

- **revision, "HTS Revision 16 (2026)":** "Verified tariff data now covers entries through August
  23, 2026. From August 15, 2026, quartz surface products (slabs, countertops, tiles and similar)
  pay a Section 201 safeguard duty of 25% within the quarterly quota and 50% above it, unless from
  an exempt country."
- **improvement, "New Section 201 safeguard duty on quartz surface products":** "From August 15,
  2026, quartz countertops, slabs and other quartz surface products pay an additional 25% within
  the quarterly quota and 50% once it's filled, stepping down each year until August 2030. Products
  of Canada, Mexico, most free-trade partners, and listed developing and Caribbean countries are
  exempt."

---

## Decisions after review (Oct 3, 2026)

1. **Open question 1:** program `201-quartz`, "Section 201 – Quartz Surface Products".
2. **Open question 2: (a), in quota by default.** 9903.45.31 requires `quartzQuotaFilled` = yes.

## Corrections

- 41(c)(iii) lists **100** developing countries, not 107. Eight countries are in both (iii) and (iv).

## Follow-up decision (Oct 3, 2026): "is it a quartz surface product?"

41(a) defines QSP by what the goods are ("predominately silica … as well as a resin binder";
"the silica content is greater than any other single material, by actual weight"; not quarried
stone). The three codes are where QSP is classified, but not everything under them is QSP,
especially 7020.00.60.00 (other articles of glass). New input `notQuartzSurfaceProduct` ("These goods aren't quartz surface products") is checked
by both headings (`equals: false, assume: true`): the duty applies unless the importer checks the
box, and the question is listed with its effect. It's asked as "not" because the calculator's
yes/no questions are checkboxes, where unchecked means unanswered, so a "Is this QSP?" box assumed
yes could never be turned off (found after the first version). Tests: checked → no 201 duty (also
with the quota filled); unchecked → duty applies.
Not modeled: 41(a)'s "only the QSP is covered" for quartz imported with sinks, vanities or cabinets.
