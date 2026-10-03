# Plan: apply 2026HTSRev18 (2026HTSRev17 → 2026HTSRev18)

Package checks: `allDecided` true; `contentHash` matches `changes.json` (`1f4d04eb…0ab7f2`);
`fromRevision` 2026HTSRev17 is the latest in `VerifiedTariffRevisions`; `consecutive` true.
`context.md`: unmanned aircraft systems (note 43, 9903.08.20–.26) are Section 232; the note
20(vvv)(i)(4)–(6) and (iv)(4) updates are Section 301; 9903.54.02 is a new quota; "add any
additional questions that would need to be answered … to the Possible Adjustments". Revision dates:
2026-09-02 → 2026-09-15 (entries through September 14, 2026). 18 approved, 0 deferred, 4 skipped.
No reviewer notes.

Three unrelated changes:
- **A.** Section 232 on unmanned aircraft systems, from September 3, 2026.
- **B.** Section 301 China exclusions re-pointed to new statistical numbers, from July 1, 2026.
- **C.** A new lean beef trimmings quota, September 1 – November 30, 2026.

---

## A. Section 232 – Unmanned Aircraft Systems: note 43, headings 9903.08.20–.26 (CR-3–6, 11–17; PP 11055, effective September 3, 2026)

**43(a):** "Except for heading 9903.08.20, headings 9903.08.21–9903.08.26 provide the ordinary
customs duty treatment of unmanned aircraft systems … These headings are mutually exclusive".
**43(b):** collected "in addition to any special rate of duty", so FTA claims don't remove them.

**43(c), the scope (four lists, extracted from the note):**

| | Provisions | Heading |
|---|---|---|
| (1) "Unmanned aircraft, docking stations for unmanned aircraft or parts for such docking stations" | 8504.40.95.80, 8537.10.91.70, 8806.24.00, 8806.29.00, 8806.94.00, 8806.99.00 | .21 (+100%) |
| (2) "Parts or components for use in or with an unmanned aircraft system with a maximum take-off weight of more than 25 kg, except those for systems for retail delivery use, agricultural use, or sale to the Department of War" | 8807.10.00, 8807.20.00, 8807.30.00, 8807.90.90 | .21 (+100%) |
| (3) "Unmanned aircraft with thermal imaging" | 8806.21.00, .22.00, .23.00, .91.00, .92.00, .93.00 | .21 (+100%) |
| (4) "Unmanned aircraft without thermal imaging" | the same six codes as (3) | .22 (+25%) |

**Headings (headings.md):**

| Heading | Text | Rate | Model |
|---|---|---|---|
| **9903.08.20** | (c) provisions "that are not for use in or with the products described therein" | no change | free; see open question 1 |
| **9903.08.21** | UAS, parts and components, (c)(1)–(3) | + 100% (all columns) | `adValorem 100` |
| **9903.08.22** | UAS, (c)(4) | + 25% (all columns) | `adValorem 25` |
| **9903.08.23** | UK, under (d) | + 10% (Column 2: no change) | `adValorem 10`, `confirm` |
| **9903.08.24** | JP, LI, KR, CH, TW, EU, under (d) | "15%", (d): totals 15% including column 1 | `topUpTo 15`, `confirm` |
| **9903.08.25** | imported for companies with an onshoring plan approved by DHS or the Department of War | no change | free, `confirm` |
| **9903.08.26** | imported under an onshoring plan approved by Commerce | no change | free, `confirm` |

**43(d):** .23/.24 apply only "if substantially all the critical components and technology are the
product of the United States, Japan, the Republic of Korea, Taiwan, Switzerland, Liechtenstein, a
member nation of the European Union or the United Kingdom". That's a confirmation on each heading
(label explains it). Unconfirmed, UK/EU/etc. goods pay .21/.22 like everyone else.

**New questions (Possible Adjustments):**
- **Thermal imaging** for the six 8806 codes in both (3) and (4): new input `uasThermalImaging`,
  "This unmanned aircraft has thermal imaging". .21 for those codes requires it; .22 applies when
  it's not checked. Default: open question 2.
- **For use with unmanned aircraft?** for the general-purpose codes in (1) (power supplies
  8504.40.95.80, control panels 8537.10.91.70) and (2) (aircraft parts 8807): open question 1.
- Confirmations for .23, .24, .25 and .26.

**Precedence (43(a), exactly one of .21–.26; .20 means none):** .20 > .25 > .26 > .23/.24 >
.21/.22, with the free headings first. The note gives no order between onshoring and the country
headings; the free headings winning can't overstate duty. The exclusivity brute force test is
extended to these headings.

**Stacking:** the Brazil, forced-labor and Section 338 exemptions for Section 232 goods list
specific headings, and none lists 9903.08.xx. So UAS duties stack with the note 52 country rates,
Section 301 China, Brazil and Section 338.

**Recipe:** §17.2, new program `232-uas` ("Section 232 – Unmanned Aircraft Systems", legal basis
Proclamation 11055), new lists and inputs.

## B. Section 301 exclusions, 20(vvv)(i)(4)–(6) and (iv)(4) (CR-7–10; Notice, effective July 1, 2026)

The exclusions for pump casings and bodies, pump covers, plastic pump parts not over $3 (each
"described in statistical reporting number 8413.91.9085 or 8413.91.9096 effective January 1, 2020
through June 30, 2026; described in statistical reporting numbers 8413.91.9039, 8413.91.9046,
8413.91.9059 or 8413.91.9099 effective July 1, 2026"), and (iv)(4) "3926.90.9910 prior to July 1,
2026; described in statistical reporting numbers 3926.90.9915 or 3926.90.9920 effective July 1,
2026", follow the July 1 statistical breakouts.

→ The 9903.88.69 exclusion list gets a version from 2026-07-01 **adding** 8413.91.90.39, .46, .59,
.99 and 3926.90.99.15, .20. The old numbers stay: other (vvv) and note 20 exclusions still cite
them, and they're no longer HTS lines after July 1, so nothing can match them. 9903.88.69 itself
ends 2026-11-10 (unchanged).

**Recipe:** §17.5 (codes added to a list). Tests: a Chinese pump casing under 8413.91.90.39 → .69
exclusion on July 15, 2026.

## C. Lean beef trimmings quota: note 7(c)–(d), heading 9903.54.02 (CR-1–2, 18; PP 11059, September 1 – November 30, 2026)

"an additional 300,000 metric tons of lean beef trimmings of other countries or areas, described in
statistical reporting numbers 0201.30.5091, 0201.30.5097, 0202.30.5091 and 0202.30.5097, may be
entered … between 12:01 a.m. local port time on September 1, 2026, and 11:59 p.m. eastern time on
November 30, 2026", in three 30-day tranches of 100,000 t (7(d)). Heading rate: "No change".

It's quota access, not a duty: the in-quota rate already comes from the chapter 2 line. → A $0
heading so it's filed and explained: codes `0201.30.50.91`, `.97`, `0202.30.50.91`, `.97`, all
countries except Argentina (which has its own quota, 9903.54.01, not modeled), effective 2026-09-01
→ 2026-12-01, `confirm("9903.54.02")` ("Entered under the additional lean beef trimmings quota").
It never changes the total, so it sits under "Show more". The chapter 2 additional U.S. note 3
changes (CR 3(a), 3(c)) aren't Chapter 99.

## D. Engine logic

None. New inputs only.

## E. Files

- `programs.ts`: `232-uas`; a new `quota` program for 9903.54.02 (open question 4).
- New `headings/232-uas.ts`, `lists/uas.ts`, `headings/quotas.ts`.
- `inputs.ts`: `uasThermalImaging` (and `uasForUse` if question 1 goes that way).
- `lists.generated.json`: the 9903.88.69 version.
- `revisions.ts`: add `2026HTSRev18`. `npm run notes:cited`.

## F. Tests ($10,000; September 5, 2026 unless stated)

- A Chinese drone 8806.22.00: September 2 → none; September 5 → .22 25% (plus 301 China and the
  12.5% country rate); thermal imaging → .21 100%.
- A large drone 8806.24 (always (c)(1)) → .21 100%.
- A German drone, critical components confirmed → .24 (15% total); unconfirmed → .22.
- A UK drone confirmed → .23 +10%.
- Onshoring (DHS/DoW) → .25, $0 UAS duty.
- Not for use with UAS (.20) → no UAS duty.
- Brute force: one of .21–.26 at most, for every combination of answers and several countries.
- Pump casings (8413.91.90.39) from China, July 15, 2026 → 9903.88.69.
- Beef trimmings 0201.30.50.91 from Australia, October 1, confirmed → 9903.54.02 at $0; from
  Argentina → not offered; December 1 → gone.

---

## Not doing

Skipped by you:
- #19 note 13 (2 differences).
- #20 note 20 (15 differences).
- #21 note 21.
- #22 note 52.

Not modeled: quota quantities and tranches (beef); the chapter 98 rules in 43(b).

## Assumptions

1. Effective dates per the change record: UAS September 3, 2026; beef September 1, 2026; 20(vvv)
   July 1, 2026.
2. .23/.24's "substantially all the critical components and technology" test is a confirmation.
3. UAS duties stack with the other country programs (none of their Section 232 lists includes
   9903.08.xx).

## Open questions

1. **General-purpose codes in (c)(1)/(c)(2)** (power supplies 8504.40.95.80, control panels
   8537.10.91.70, aircraft parts 8807.xx): most goods under these codes aren't for unmanned aircraft.
   - **(a) Recommended:** the 100% applies to those codes only when the user checks "These goods are
     for use in or with unmanned aircraft (docking stations, or parts for UAS over 25 kg not for
     retail delivery, agriculture or the Department of War)"; otherwise 9903.08.20 shows as the $0
     line. Drones themselves (8806) apply automatically.
   - **(b)** The 100% applies to every entry under those codes until the user checks 9903.08.20
     ("not for use in or with unmanned aircraft"). That's conservative, but it adds 100% to every
     control panel and power supply in the US by default.
2. **Thermal imaging default** for 8806.21–.23 and .91–.93:
   - **(a)** Without thermal imaging (25%) by default, with "has thermal imaging" switching to 100%
     (like your in-quota default for quartz).
   - **(b)** With (100%) by default, with the checkbox reading "doesn't have thermal imaging".
3. **Program name:** `232-uas`, "Section 232 – Unmanned Aircraft Systems"?
4. **The beef quota heading:** model it as above (a $0 heading with a confirmation, under "Show
   more"), or leave it out, since it never changes the duty?

## Changelog drafts (to add in phase 2)

- **revision, "HTS Revision 18 (2026)":** "Verified tariff data now covers entries through
  September 14, 2026. From September 3, 2026, unmanned aircraft (drones), their docking stations and
  parts pay a new Section 232 duty of 25% or 100%, with lower rates for qualifying allied-made
  systems and exemptions for approved onshoring plans."
- **improvement, "New Section 232 duty on drones and drone parts":** "From September 3, 2026,
  unmanned aircraft pay an additional 25%, or 100% with thermal imaging or over 25 kg, as do their
  docking stations and parts for large systems. Systems made substantially with U.S. or allied
  components pay 15% in total (Japan, Korea, Taiwan, Switzerland, Liechtenstein, EU) or an additional
  10% (UK)."
- **fix, "Section 301 exclusions follow the new statistical numbers for pump parts and plastic
  articles":** "From July 1, 2026, excluded Chinese pump casings, covers and small plastic pump parts,
  and the excluded plastic articles, are recognized under their new statistical reporting numbers."

---

## Decisions after review (Oct 3, 2026)

1. **Open question 1: (a).** The general-purpose codes (8504.40.95.80, 8537.10.91.70, 8807.xx) are
   9903.08.20 at $0 unless the user checks `uasForUse` ("These goods are for use in or with unmanned
   aircraft"); then 9903.08.21. Drones (8806) are charged automatically.
2. **Open question 2: (a).** The (c)(3)/(4) drones are 9903.08.22 (25%) unless the user checks
   `uasThermalImaging`; then 9903.08.21 (100%).
3. **Open question 3:** `232-uas`, "Section 232 – Unmanned Aircraft Systems".
4. **Open question 4:** the beef quota is shown, as a confirmed $0 line (program `quotas`).
