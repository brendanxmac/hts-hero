# Plan: apply 2026HTSRev7 (2026HTSRev6 → 2026HTSRev7)

Package checks: `allDecided` true; `contentHash` matches `changes.json` (`7807f499…304a`);
`fromRevision` 2026HTSRev6 is the latest in `VerifiedTariffRevisions`; `consecutive` true.
No `context.md`. Revision dates: 2026-04-29 → 2026-05-22 (entries through May 21, 2026).

**Every change in the change record is effective April 6, 2026 (Notice).** That's the day the
9903.82 family started (Proclamation 11021), before Rev 5 and Rev 6. So these are retroactive
(HowTariffsWork §14.7, case 1: record the law as it now stands). The 9903.82 records have no
start date, since the family began on April 6. The changes are therefore edits in place, and
they change results for dates already verified in Rev 5 and Rev 6. Each record's `source.note`
says so.

---

## Approved changes

### CR-3: heading 9903.82.01 added (effective 2026-04-06, Notice)

**Heading (headings.md, reviewed, PDF p.1):** "Articles provided for in subdivision (c) of U.S.
note 16 to this subchapter that do not contain any aluminum, steel, or copper". General, Special
and Column 2: "No change". Footnote: "1/ See chapter 99 statistical note 1."

**Engine before:** `9903.82.01` already exists in `232-metals.ts`, carried over from the legacy
data. It has the same description, `rate: free`, `requires: confirm("9903.82.01")`, and no
dates. Its scope lists every (c) list **except `copperArticles16cviii`** (note 16(c)(viii),
articles of copper: 8544.42.10/.20/.90, 8544.49.10). Its scope also includes
`motorcycleParts16cg`; every code in that list is already in a (c) list, so it changes nothing.

**Recipe.** §17.2 for a heading that already exists in our data: bring the record in line with
the heading text. "No change" in every column = no additional duty, which is `free`.

**Edits** (`232-metals.ts`):
- `9903.82.01`: add `{ list: "copperArticles16cviii" }` to its scope. Set
  `source: { revision: "2026HTSRev7", note: "Added to the HTS by Notice effective 2026-04-06 (retroactive); listed from 2026HTSRev7. Scope now includes (c)(viii)." }`.

**Tests:** pinned case: 8544.42.90 copper cable from VN with 9903.82.01 confirmed → 9903.82.01
applies, 9903.82.09 excluded, only the 2.6% base remains.

### CR-1: note 16(a) adds 9903.82.01 to its exceptions (effective 2026-04-06, Notice)

**Text after:** "Except as provided in headings 9903.82.01, 9903.85.67, and 9903.85.68, headings
9903.82.02–9903.82.19 provide the ordinary customs duty treatment…".

**Engine before:** every heading in .02–.19 except **9903.82.13** already lists 9903.82.01 as an
exception (carried over from the legacy data).

**Edit:** add `"9903.82.01"` to `9903.82.13`'s `exceptions`. Both headings are $0 exemptions, so
no amounts change. Only which line shows as applying changes, now matching the note.

**Tests:** pinned case: a motorcycle part with both .01 and .13 confirmed → .01 applies, .13
excluded. The existing note 16(a) exclusivity test covers .02–.19 and still applies.

### CR-2: note 16(e) drops the sentence limiting 9903.82.06 (effective 2026-04-06, Notice)

**Removed:** "Heading 9903.82.06 applies to articles classifiable in the provisions provided for
in subdivisions (c)(ii), (iv), (vi) and (vii) of this note."

**Effect:** with that sentence gone, 9903.82.06's reach is set by its heading text, which the
engine already has: "articles of copper and derivative aluminum and steel articles, as provided
for in subdivisions (c)(ii), (iv), (vi)–(viii) and (e)". 16(e) itself already sets the
95%-U.S.-smelted test for (c)(viii) copper. So **(c)(viii) copper articles that are 95% U.S.-smelted
now get 9903.82.06 (10%) instead of 9903.82.09 (25%).**

**Engine before:** `9903.82.06` scope = 16(c)(ii), (iv), (vi), (vii) and the motorcycle list. It
has no (c)(viii) list.

**Recipe.** §17.6 (a heading starts using another list). Done in place, because the change goes
back to the family's start date.

**Edit:** add `{ list: "copperArticles16cviii" }` to `9903.82.06`'s scope.
`source: { revision: "2026HTSRev7", note: "Note 16(e) sentence limiting .06 to (c)(ii), (iv), (vi), (vii) removed by Notice effective 2026-04-06 (retroactive); scope follows the heading text, adding (c)(viii)." }`.
Precedence needs no change: .09 already excepts .06, and for Russia .15 already wins over .06.

**Tests:** pinned cases on 8544.42.90:
- VN, .06 confirmed → .06 at 10% ($1,000), .09 excluded.
- VN, unconfirmed → .09 at 25%.
- RU, .15 confirmed → .15 only.
- The exclusivity brute force passes (it already includes the (c)(viii) list).

### #5: note 20, 11 differences not in the change record (approved, with your note)

**Reviewer note:** "Only apply the sub-III/us-notes/20(e) update where 20(qqq) was swapped for
20(yyy), if we've got those lists created. (otherwise don't worry)".

**Engine:** there are no lists or records for 20(qqq) or 20(yyy), and no 9903.88.64 heading.
9903.88.64 appears only inside the description text of 9903.88.03 and .04. So **no change**.

The other ten differences are cosmetic or fix the earlier PDF extraction errors: hyphens, "film"
for "file", "sharpening" for the garbled "sharピング", an IUPAC name, and an added "of". None
affects duties.

---

## Engine logic changes

None. Every change is a scope or exception edit on existing records.

## Not doing

- **#4 (defer), note 13(e)(vi):** a trailing "-" added after 4421.90.9760. Cosmetic.

## Assumptions

1. **The edits are in place, with no new dated versions.** The Notice is effective 2026-04-06,
   the day the whole 9903.82 family began, and those records have no start date. As the law now
   stands, the changed scope applied from day one. Results for Rev 5 and Rev 6 dates change for
   (c)(viii) copper articles where .06 or .01 is confirmed.
2. **9903.82.01's motorcycle list stays.** Every code in it is already in a (c) list.
3. **"No change" in every column means no additional duty** (`free`), which is what the existing
   record has.

## Open questions

1. **Re-dating the family (not needed now).** The whole 9903.82 family is undated even though it
   began 2026-04-06 (§17.13 backfill). Fine while verified history starts at Rev 5. Only worth
   doing before backfilling dates earlier than April 6.

## Changelog drafts (to add in phase 2)

- revision, "HTS Revision 7 (2026)": "Verified tariff data now covers entries through May 21,
  2026. Copper articles in U.S. note 16(c)(viii) (certain insulated copper wire and cable) now
  qualify for the 9903.82.01 no-metal exemption and the 10% rate for U.S.-smelted copper,
  retroactive to April 6, 2026."
- fix, "U.S.-smelted copper cable now gets the 10% Section 232 rate": "Insulated copper wire and
  cable (8544.42, 8544.49) with at least 95% U.S.-smelted copper now pays 10% under 9903.82.06
  instead of 25%, back to April 6, 2026."
