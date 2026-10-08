# How Tariffs Work

This document describes the versioned tariff system for HTS Hero: how tariff rules are stored, how they change over time, and how the engine turns them into a duty calculation for a given HTS code, country of origin and date.

> **Status: implemented as `tariffs/engine-v2`** on branch `feat/tariff-engine-v2`, alongside the legacy engine, with data as of 2026 HTS Revision 10. It's reachable on the Tariff Finder with `?engine=v2`.
> See [tariffs/engine-v2/PROGRESS.md](tariffs/engine-v2/PROGRESS.md) for what's done, differences from the legacy engine, and open questions.
> Not implemented yet: `recordedAt` (§14.7) and fee rules by transport mode.
> Section [18. Migrating from the current model](#18-migrating-from-the-current-model) maps today's `TariffI` onto this design.

> **About the examples.** Heading numbers, rates, dates and list contents in this document are **illustrative**. They're chosen to show the mechanics realistically, not to be copied into data. Always take real values from the HTS, the U.S. notes, and the Federal Register or CSMS source.

---

## Contents

1. [Goals](#1-goals)
2. [Core ideas](#2-core-ideas)
3. [The record types at a glance](#3-the-record-types-at-a-glance)
4. [Shared building blocks: dates and sources](#4-shared-building-blocks-dates-and-sources)
5. [Programs](#5-programs)
6. [Tariffs (Chapter 99 headings)](#6-tariffs-chapter-99-headings)
7. [Code lists and country lists](#7-code-lists-and-country-lists)
8. [Interactions: how tariffs combine](#8-interactions-how-tariffs-combine)
9. [Duty columns, base rates and trade preferences](#9-duty-columns-base-rates-and-trade-preferences)
10. [Inputs and answers](#10-inputs-and-answers)
11. [Handlers: the engine's extension points](#11-handlers-the-engines-extension-points)
12. [The calculation pipeline](#12-the-calculation-pipeline)
13. [Stacking and exclusion cheat sheet](#13-stacking-and-exclusion-cheat-sheet)
14. [Versioning in detail](#14-versioning-in-detail)
15. [Validation](#15-validation)
16. [Testing](#16-testing)
17. [Recipes: day-to-day maintenance](#17-recipes-day-to-day-maintenance)
18. [Migrating from the current model](#18-migrating-from-the-current-model)
19. [Worked examples](#19-worked-examples)
20. [File layout](#20-file-layout)
21. [Glossary](#21-glossary)
22. [Open questions](#22-open-questions)

---

## 1. Goals

The system has to answer one question accurately:

> **For this HTS code, from this country, entered on this date, with these facts about the shipment: which duties apply, at what rates, on what value, and why?**

It must:

- **Handle every mechanism the HTS uses.** That means duty columns (Column 1 General, Column 1 Special, Column 2), FTA and preference programs, Chapter 99 additional duties, exemption headings, value splits for metal content, caps and top-ups, and non-stacking orders.
- **Answer for any date since January 2025**, not just today. The same code can have a different answer on March 1 and June 1.
- **Keep history.** Nothing is deleted. Ending or changing a rule adds information instead of overwriting it.
- **Make updates easy.** A new HTS revision should mostly mean editing data. A brand-new kind of rule should mean adding one small, tested function, not rewriting the engine.
- **Explain every result.** Each duty line records why it applied, what excluded it, or what answer is still needed.

---

## 2. Core ideas

### 2.1 Everything is a dated record

Every rule (a tariff heading, a list of HTS codes, a non-stacking rule, a Column 2 assignment) is a record with an **effective period**:

```ts
effective: { from: "2026-02-24", to: "2026-07-24" }
```

- `from` is **inclusive**, `to` is **exclusive**. The record above applies on 2026-02-24 and on 2026-07-23, but not on 2026-07-24.
- A missing `from` means "since before we started tracking." A missing `to` means "still in effect."
- Dates are ISO strings (`YYYY-MM-DD`), which compare correctly as plain strings.

### 2.2 Never delete, never overwrite

| Something happens | What you do |
|---|---|
| A tariff ends | Set `effective.to` on its record |
| A tariff's rate, scope or exceptions change | End the current record and add a new record with the same heading code, starting that day |
| A list gains or loses codes | Add a new version of the list |
| You find a mistake in how you recorded a past rule | Fix the record (see [14.7](#147-retroactive-changes-and-corrections)) |

Two records for the same heading may never be in effect on the same day. The validator enforces this.

### 2.3 Resolve first, then calculate

For a given date, the engine first builds a **snapshot**: the version of every record in effect that day.

```ts
const rules = getRulesAsOf("2026-06-10")
// → { programs, tariffs, lists, interactions, preferences, columnAssignments, htsRevision }
```

After that, the calculation never looks at dates again. It only sees the rules as they stood that day. That keeps the calculation code simple, and means every past date is calculated with exactly the rules in force then.

### 2.4 Data for rules, code for mechanisms

- **Data** (records) says *which* rule applies, *where* and *when*: "9903.81.91 applies 50% to the steel content of goods in list 16(c)(xi), from April 6."
- **Code** (handlers) says *how* a kind of rule works: "how to compute a rate that tops the total up to X%."

Most HTS changes are data. A genuinely new mechanism is one new handler, registered under a name that records refer to.

---

## 3. The record types at a glance

| Record | What it represents | Example | Dated? | Changes |
|---|---|---|---|---|
| [`Program`](#5-programs) | A family of tariffs and the law it comes from | `232-steel`, `301-china` | Rarely needed | Rarely |
| [`Tariff`](#6-tariffs-chapter-99-headings) | One Chapter 99 heading | `9903.81.91` | Yes | Some revisions |
| [`CodeList`](#7-code-lists-and-country-lists) | A set of HTS codes or countries defined in a note | `99-III-16(c)(xi)`, EU members | Yes, per version | Often |
| [`Interaction`](#8-interactions-how-tariffs-combine) | A rule about how programs combine | a non-stacking order, a total cap | Yes | Rarely |
| [`TradePreference`](#92-trade-preferences-ftas-and-spi-programs) | An FTA or preference program | USMCA, KORUS, GSP | Yes | Rarely |
| [`ColumnAssignment`](#91-duty-columns) | A country's duty column | Russia → Column 2 | Yes | Rarely |
| `Prohibition` | An import ban: goods in scope can't be entered at all. Never a duty, so it never changes the total; the result lists it in `prohibitions`. Optional `unless` conditions lift it (a scope limitation such as "packaged only") and are asked like any input | Section 338 Canada bans, `ban:canada-338-dairy` | Yes | Rarely |
| [`InputDefinition`](#10-inputs-and-answers) | A question the engine may need answered | steel content %, loading date | No | When a new mechanism needs a new input |
| [Handlers](#11-handlers-the-engines-extension-points) | Code that implements a `kind` | `topUpTo`, `metalContent` | Versioned by name | When a new mechanism appears |

The HTS itself (base rates, special program symbols, units) comes from the USITC revision data already stored per revision in Supabase. Revision start and end dates come from the USITC release list (see [14.5](#145-hts-revisions-and-the-revision-dropdown)).

---

## 4. Shared building blocks: dates and sources

```ts
type IsoDate = string // "YYYY-MM-DD"

interface EffectivePeriod {
  from?: IsoDate // inclusive
  to?: IsoDate   // exclusive
}

interface Source {
  revision?: string    // USITC release name, e.g. "2026HTSRev7"
  citation?: string    // "Proclamation 11021", "91 FR 12345", "CSMS # 68554727"
  url?: string
  publishedOn?: IsoDate // when the cited document was published (signed, or in the FR)
  note?: string        // anything a future reader needs to know
}

interface Dated {
  effective: EffectivePeriod
  source?: Source
}
```

Every record that changes over time extends `Dated`. Always fill in `source`. It's what lets you (or an auditor) trace a number back to the law months later.

`publishedOn` is when the cited document was published, which often isn't when it took effect: retroactive deals were published weeks after their effective date, and some proclamations weeks before. Fill it in whenever you read the document anyway. It's what lets the data answer "when was this announced?" as well as "when did it apply?".

---

## 5. Programs

A **program** groups tariffs that come from the same legal action. Tariffs refer to their program, and interactions refer to programs instead of listing individual headings.

```ts
type Authority =
  | "232"     // Trade Expansion Act §232 (national security)
  | "301"     // Trade Act §301 (unfair practices)
  | "122"     // Trade Act §122 (balance of payments)
  | "201"     // Trade Act §201 (safeguards)
  | "IEEPA"   // International Emergency Economic Powers Act
  | "ADCVD"   // antidumping / countervailing (usually out of scope, see §22)
  | "deal"    // country agreements with no other authority (most deals were IEEPA: use that, plus tradeDeal)
  | "other"

interface Program {
  id: string            // stable identifier, never reused
  name: string          // shown to users
  authority: Authority  // the law it was enacted under
  tradeDeal?: boolean   // implements a trade deal, whatever its authority
  legalBasis?: string[] // proclamations, EOs, FR notices that created or changed it
  description?: string
}
```

```ts
// tariffs/programs.ts
export const Programs: Program[] = [
  { id: "301-china", name: "Section 301 – China", authority: "301" },
  { id: "301-forced-labor", name: "Section 301 – Forced Labor Enforcement", authority: "301" },
  { id: "232-steel", name: "Section 232 – Steel & Derivatives", authority: "232",
    legalBasis: ["Proclamation 9705", "Proclamation 11021"] },
  { id: "232-aluminum", name: "Section 232 – Aluminum & Derivatives", authority: "232" },
  { id: "232-copper", name: "Section 232 – Copper", authority: "232" },
  { id: "232-autos", name: "Section 232 – Autos & Auto Parts", authority: "232" },
  { id: "122", name: "Section 122 – Balance of Payments Surcharge", authority: "122" },
  { id: "reciprocal", name: "IEEPA Reciprocal Tariffs", authority: "IEEPA" },
  { id: "ieepa-fentanyl-cn", name: "IEEPA Fentanyl – China", authority: "IEEPA" },
  { id: "ieepa-fentanyl-ca", name: "IEEPA Fentanyl – Canada", authority: "IEEPA" },
  { id: "ieepa-fentanyl-mx", name: "IEEPA Fentanyl – Mexico", authority: "IEEPA" },
]
```

Rules can target three levels of detail:

```ts
interface Selector {
  codes?: string[]           // specific Chapter 99 headings
  programs?: string[]        // whole programs
  authorities?: Authority[]  // everything under a law, e.g. "any Section 232 duty"
}
```

A selector matches a tariff if **any** of its fields match.

> **Naming:** customs also uses "trade program" to mean FTAs and preference programs (USMCA, GSP…). In this system those are [`TradePreference`](#92-trade-preferences-ftas-and-spi-programs) records, kept separate from `Program` so the two meanings never get mixed up.

---

## 6. Tariffs (Chapter 99 headings)

A `Tariff` is one Chapter 99 heading as it stands during one effective period.

```ts
interface Tariff extends Dated {
  code: string          // the Chapter 99 heading, e.g. "9903.81.91"
  program: string       // Program.id
  name: string          // short title shown in the UI (conventions below)
  description: string   // the heading's legal text

  scope: Scope          // which countries and HTS codes it covers
  requires?: Condition[] // extra conditions that must hold (all of them)
  exceptions?: string[]  // headings that displace this one when they apply

  basis?: ValueBasis    // which value the rate applies to (default: full customs value)
  rate: RateRule        // how the duty is computed
  rateByColumn?: Partial<Record<DutyColumn, RateRule>> // rare: a different rate for a column
}
```

**Titles (`name`).** They're for importers, not lawyers:

- Start with the program ("Section 232 Autos:", "Section 301 China:"), with "Exemption:" for exemptions ("Exclusion:" for USTR's Section 301 exclusions).
- No note citations ("20 (e) and (f)"): the line's legal text shows them. Name what the heading covers ("List 3", "Solar Cells").
- No rates or effective dates: the Rate column and `effective` show those, and they change between versions. Keep thresholds that define the line ("Base Duty 15% or More", "85%+ U.S. Metal") and dates you have to check ("Loaded Before Feb 24").
- Caps say "(15% Including Base Duty)", and the paired line says "(Base Duty 15% or More)".

### 6.1 Scope: which countries and codes

```ts
type ListRef = { list: string } // refers to a CodeList by id

type CountrySelector = "all" | (string | ListRef)[] // ISO 2-letter codes and/or country lists
type CodeSelector = (string | ListRef)[]            // HTS prefixes and/or code lists

interface Scope {
  countries: CountrySelector       // required
  excludeCountries?: (string | ListRef)[]
  codes: "all" | CodeSelector      // required
  excludeCodes?: CodeSelector
  whenApplies?: Selector           // only applies if a tariff matching this selector also applies
}
```

`countries` and `codes` are **required**, and "everything" is written explicitly as `"all"`. A forgotten field is then a validation error instead of silently meaning "all codes."

**HTS code matching is by prefix on digits only.** `"7326"` matches `7326.90.86.88`. `"7326.90"` matches `7326.90.xx.xx` but not `7326.11`. Dots are ignored on both sides. (The current code uses `htsCode.includes(code)`, a substring match; see [§18](#18-migrating-from-the-current-model).)

**All codes from specific countries:**

```ts
{
  code: "9903.01.24",
  program: "ieepa-fentanyl-cn",
  name: "IEEPA Fentanyl – China & Hong Kong",
  description: "…",
  scope: { countries: ["CN", "HK"], codes: "all" },
  rate: { kind: "adValorem", pct: 20 },
  effective: { from: "2025-03-04", to: "2025-11-10" },
  source: { citation: "EO 14228" },
}
```

**Specific codes from specific countries, with exclusions:**

```ts
{
  code: "9903.88.03",
  program: "301-china",
  name: "Section 301 – China List 3",
  description: "…",
  scope: {
    countries: ["CN"],
    codes: [{ list: "99-III-20(f)" }],
    excludeCodes: [{ list: "99-III-20(vvv)" }], // product exclusions
  },
  rate: { kind: "adValorem", pct: 25 },
  effective: { from: "2019-05-10" },
}
```

**Every country except some:**

```ts
scope: { countries: "all", excludeCountries: ["CA", "MX"], codes: "all" }
```

**Every country in a list that itself changes over time:**

```ts
scope: { countries: [{ list: "301-forced-labor-tier-12.5" }], codes: "all" }
```

**Only when another program applies** (the usual shape of exemption headings):

```ts
scope: {
  countries: "all",
  codes: "all",
  whenApplies: { authorities: ["232"] }, // "articles subject to any Section 232 duty"
}
```

### 6.2 Conditions: `requires`

`requires` lists conditions that must **all** hold for the tariff to apply. Each condition names a handler by `kind` and passes parameters:

```ts
type Condition = { kind: string; [param: string]: unknown }
```

```ts
requires: [
  { kind: "baseRate", op: "<", pct: 15 },                       // MFN rate below 15%
  { kind: "answer", input: "usmcaQualifying", equals: false },  // importer says it doesn't qualify
  { kind: "dateBefore", input: "loadingDate", date: "2026-02-24" }, // loaded before a cutoff
  { kind: "contentBelow", input: "metalWeightPct", pct: 15 },   // metal under 15% by weight
]
```

A condition can return **true**, **false**, or **unknown** (an input it needs hasn't been answered). See [§10](#10-inputs-and-answers) for what happens with unknown.

### 6.3 Value basis: what the rate applies to

```ts
type ValueBasis = { kind: string; [param: string]: unknown }
```

| `kind` | Meaning |
|---|---|
| `fullValue` (default) | The whole customs value |
| `metalContent` | The value of the named metal's content (`metal: "steel" \| "aluminum" \| "copper"`) |
| `nonUsContent` | The value that isn't U.S. content (e.g. auto 232 for vehicles with U.S. parts) |
| `coveredBy` | The value covered by other tariffs that apply (`selector`), e.g. "the part subject to Section 232". Used by partial exemption headings ([§6.5](#65-exceptions-except-as-provided-in-heading-x)) |
| `usContentShare` | A share of the value split at a cap on U.S. content (`cap`, `part: "upToCap" \| "rest"`), from the `usContentPct` answer. Used by 9903.82.20/.21 (U.S. note 16(j)) |

```ts
basis: { kind: "metalContent", metal: "steel" }
```

When the law changes *how* the value is measured, you don't edit the old basis. Add a new version of the tariff with a different basis (see the Section 232 example in [§14.3](#143-changing-a-tariff-over-time)).

### 6.4 Rate rules: how the duty is computed

```ts
type RateRule = { kind: string; [param: string]: unknown }
```

| `kind` | Parameters | Result |
|---|---|---|
| `adValorem` | `pct` | `pct`% of the basis value |
| `perUnit` | `amount`, `per` (`"kg"`, `"unit"`, `"liter"`…) | `amount × quantity` |
| `compound` | `pct`, `amount`, `per` | both of the above, added together |
| `topUpTo` | `pct` | `max(0, pct − base rate equivalent)`%, used by the "15% all-in" deals |
| `free` | none | 0 (exemption headings) |

Most tariffs use the same rate in every column. For the rare heading where Column 2 differs:

```ts
rate: { kind: "adValorem", pct: 25 },
rateByColumn: { column2: { kind: "free" } },
```

### 6.5 Exceptions: "except as provided in heading X"

`exceptions` lists headings that **displace this one when they apply**. It mirrors the HTS text, where a heading says "except as provided in headings 9903.03.02–9903.03.11."

```ts
{
  code: "9903.03.01",
  program: "122",
  name: "Section 122 Surcharge",
  description: "Except for products described in headings 9903.03.02–9903.03.11, …",
  scope: { countries: "all", codes: "all" },
  rate: { kind: "adValorem", pct: 10 },
  exceptions: ["9903.03.02", "9903.03.03", "9903.03.04", "9903.03.05", "9903.03.06",
               "9903.03.07", "9903.03.08", "9903.03.09", "9903.03.10", "9903.03.11"],
  effective: { from: "2026-02-24", to: "2026-07-24" },
}
```

The exception headings are ordinary tariffs, usually at `rate: { kind: "free" }`, with their own scope and conditions. Because the importer must file them, they appear in the result as $0 lines.

**Partial exceptions.** An exception displaces a heading only for **the value the exception covers**:

- If the exception heading covers the full value (the default basis), the displaced heading is excluded entirely.
- If it covers only part of the value, the displaced heading still applies to the rest.

That's how "articles subject to Section 232" exemptions work when 232 applies only to metal content:

```ts
{
  code: "9903.03.06",
  program: "122",
  name: "122 Exemption – Section 232 Articles",
  description: "…",
  scope: { countries: "all", codes: "all", whenApplies: { authorities: ["232"] } },
  basis: { kind: "coveredBy", selector: { authorities: ["232"] } },
  rate: { kind: "free" },
  effective: { from: "2026-02-24", to: "2026-07-24" },
}
```

With $10,000 of goods and 232 duty on $6,000 of steel content, 9903.03.06 covers $6,000 and 9903.03.01 applies to the remaining $4,000. When 232 moved to the full customs value (April 6, 2026), the same records give 9903.03.06 the full $10,000 and 9903.03.01 nothing, with no data change needed for Section 122.

---

## 7. Code lists and country lists

Many U.S. notes define lists: "steel derivative products in note 16(c)(xi)", "the products in note 20(f)". Lists change more often than the headings that use them, so they're versioned **separately**.

```ts
interface CodeListVersion extends Dated {
  codes?: string[]      // HTS prefixes, or ISO country codes for country lists
  includes?: ListRef[]  // other lists whose members are included
}

interface CodeList {
  id: string            // stable id, ideally the note citation: "99-III-16(c)(xi)"
  kind: "hts" | "country"
  description: string
  versions: CodeListVersion[]
}
```

### 7.1 Why lists are separate

A heading refers to a list by id:

```ts
scope: { countries: "all", codes: [{ list: "99-III-16(c)(xi)" }] }
```

When revision 16 adds three codes to 16(c)(xi), **only the list changes**. The heading record doesn't need a new version. On any date, the engine uses the version of the list in effect that day.

This is also what the automated extraction script produces: for each note, a set of codes per revision, compared with the previous set.

### 7.2 Writing list versions

Most list updates add or remove a handful of codes. The `codeListVersions` helper takes a starting list plus dated changes, so you only write the changes:

```ts
// tariffs/lists/99-III-16(c)(xi).ts
export const steelDerivatives16cxi = codeListVersions(
  {
    id: "99-III-16(c)(xi)",
    kind: "hts",
    description: "Steel derivative products, U.S. note 16(c)(xi) to subchapter III",
    codes: ["7308.90.95", "7326.90.86", "8302.41.60" /* … */],
    effective: { from: "2026-04-06" },
    source: { revision: "2026HTSRev5", citation: "Proclamation 11021" },
  },
  [
    { from: "2026-05-22", add: ["8302.49.60"], source: { revision: "2026HTSRev8" } },
    {
      from: "2026-08-14",
      add: ["9403.20.00"],
      remove: ["7326.90.86"],
      source: { revision: "2026HTSRev16", note: "7326.90.86 moved to 16(c)(xii)" },
    },
  ],
)
```

This expands to three `CodeListVersion`s with back-to-back effective periods, just like `tariffVersions` does for tariffs.

For a large list that gets rewritten wholesale (for example, a new annex replacing an old one), write a new full version instead of a long add/remove.

### 7.3 Lists made of lists

```ts
{
  id: "99-III-16(c)",
  kind: "hts",
  description: "All articles in U.S. note 16(c)",
  versions: [{
    includes: [
      { list: "99-III-16(c)(i)" }, { list: "99-III-16(c)(ii)" }, /* … */ { list: "99-III-16(c)(xi)" },
    ],
    effective: { from: "2026-04-06" },
  }],
}
```

Each included list is resolved as of the same date. The validator rejects lists that include themselves, directly or indirectly.

### 7.4 Country lists

Country groups work exactly the same way, with `kind: "country"`:

```ts
{
  id: "eu-members",
  kind: "country",
  description: "European Union member states",
  versions: [{ codes: ["AT", "BE", "BG", /* … */ "SE"], effective: {} }],
}

{
  id: "301-forced-labor-tier-12.5",
  kind: "country",
  description: "Economies subject to the 12.5% forced-labor Section 301 rate",
  versions: [{ codes: [/* … */], effective: { from: "2026-07-24" },
               source: { citation: "USTR notice of July 23, 2026" } }],
}
```

---

## 8. Interactions: how tariffs combine

By default, **every tariff that applies is added together.** Most combinations need nothing beyond that and a heading's `exceptions`.

Some rules aren't about a single heading. They're about how whole programs combine, usually set by an executive order or proclamation rather than a heading's text. Those are **Interaction** records: dated records of their own that produce no duty line.

```ts
type Interaction = Dated & {
  id: string
  description: string
  appliesTo?: { countries?: CountrySelector; codes?: "all" | CodeSelector } // default: everywhere
} & (
  | { kind: "noStack"; order: Selector[] }
  | { kind: "excludePortion"; winner: Selector; losers: Selector }
  | { kind: "capTotal"; pct: number; covers: Selector; includesBaseRate: boolean }
)
```

### 8.1 `noStack`: precedence between programs

"If A applies, B and C don't; if B applies, C doesn't." The engine walks `order` from the first group to the last. The first group with a tariff that applies wins, and **every later group is dropped**. Tariffs in programs not named in `order` are unaffected.

```ts
{
  id: "non-stacking-2025-04",
  kind: "noStack",
  description: "Auto 232 takes precedence over CA/MX fentanyl duties, which take precedence over steel/aluminum 232",
  order: [
    { programs: ["232-autos"] },
    { programs: ["ieepa-fentanyl-ca", "ieepa-fentanyl-mx"] },
    { programs: ["232-steel", "232-aluminum"] },
  ],
  effective: { from: "2025-03-04" },
  source: { citation: "Executive order of April 29, 2025 on non-stacking (retroactive)" },
}
```

One record replaces dozens of pairwise `exceptions`, and has its own dates. If the programs it names stop existing (as the IEEPA ones did), the rule simply has nothing to act on.

### 8.2 `excludePortion`: partial non-stacking

Some rules exclude a tariff from **part** of the value: "X doesn't apply to the value subject to Y." When the HTS provides an exemption heading for this (like 9903.03.06 for Section 122), model it as a partial exception on that heading ([§6.5](#65-exceptions-except-as-provided-in-heading-x)). Use `excludePortion` when the rule comes from an order or proclamation **without** a heading of its own:

```ts
{
  id: "232-metal-content-excluded-from-reciprocal",
  kind: "excludePortion",
  description: "Reciprocal duties don't apply to the value subject to 232 metal duties",
  winner: { programs: ["232-steel", "232-aluminum", "232-copper"] },
  losers: { programs: ["reciprocal"] },
  effective: { to: "2026-04-06" },
}
```

The losers apply only to the value the winners **don't** cover. If the winners cover the whole value (which is what happened when 232 moved to a full-value basis), the losers get nothing, with no extra rule needed.

### 8.3 `capTotal`: a ceiling across several programs

For rules that genuinely say "the combined duty from these programs may not exceed X%":

```ts
{
  id: "example-total-cap",
  kind: "capTotal",
  description: "Combined duty from the listed programs, including MFN, capped at 15%",
  appliesTo: { countries: [{ list: "eu-members" }] },
  covers: { programs: ["reciprocal", "232-autos"] },
  includesBaseRate: true,
  pct: 15,
  effective: { from: "…", to: "…" },
}
```

Tariffs outside `covers` still stack on top. **Most "15% all-in" deals aren't modeled this way**: the HTS implements them as pairs of headings with a `topUpTo` rate (see [§19.2](#192-eu-good-under-a-15-all-in-deal)). Use `capTotal` only when the law is written as a ceiling rather than as its own headings.

### 8.4 Order of application

Interactions are applied in a fixed order: all `noStack` rules, then `excludePortion`, then (after rates are computed) `capTotal`. Within the same kind, rules are applied in the order they appear in `interactions.ts`. The validator warns if two interactions of the same kind touch the same programs on the same date, so you can check the order is intended.

---

## 9. Duty columns, base rates and trade preferences

### 9.1 Duty columns

Every HTS line has three rate columns:

| Column | Applies to |
|---|---|
| **Column 1 – General** (MFN) | Countries with normal trade relations |
| **Column 1 – Special** | Goods that qualify for an FTA or preference program listed on that line |
| **Column 2** | Countries without normal trade relations (currently Cuba, North Korea, Russia, Belarus) |

```ts
type DutyColumn = "general" | "special" | "column2"

interface ColumnAssignment extends Dated {
  country: string
  column: "column2"
}
```

```ts
// tariffs/columns.ts
export const ColumnAssignments: ColumnAssignment[] = [
  { country: "CU", column: "column2", effective: {} },
  { country: "KP", column: "column2", effective: {} },
  { country: "RU", column: "column2", effective: { from: "2022-04-09" },
    source: { citation: "Suspending Normal Trade Relations with Russia and Belarus Act" } },
  { country: "BY", column: "column2", effective: { from: "2022-04-09" } },
]
```

The engine picks the column like this:

1. If the country has a Column 2 assignment in effect → **Column 2**.
2. Otherwise, if the importer claims a trade preference that is available (see below) → **Special**, using that program's rate on the line.
3. Otherwise → **General**.

### 9.2 Trade preferences (FTAs and SPI programs)

```ts
interface TradePreference extends Dated {
  symbol: string                  // the SPI symbol in the HTS special column: "S", "KR", "A", …
  name: string                    // "USMCA", "Korea FTA", "GSP"
  countries: CountrySelector      // eligible countries
  requiresClaim: true             // the importer must confirm the goods qualify
}
```

```ts
{ symbol: "S", name: "USMCA", countries: ["CA", "MX"], requiresClaim: true,
  effective: { from: "2020-07-01" } },
{ symbol: "A", name: "GSP", countries: [{ list: "gsp-beneficiaries" }], requiresClaim: true,
  effective: { to: "2021-01-01" }, source: { note: "GSP authorization lapsed Dec 31, 2020" } },
```

A preference is **available** for an entry when all three hold on the date: the program is in effect, the country is eligible, and the HTS line's special column lists its symbol. Whether the goods actually **qualify** (rules of origin) can't be computed. It's an answer the importer gives (`claimedPreference: "S"`). The UI offers only the available programs.

Chapter 99 tariffs can also depend on preference claims, e.g. "except goods of Canada that qualify for USMCA":

```ts
requires: [{ kind: "preferenceClaimed", symbol: "S", equals: false }]
```

### 9.3 Base rates and their percentage equivalent

The base rate comes from the chosen column of the HTS line **in the HTS revision in effect on the date**. Base rates can be:

- ad valorem: `4.5%`
- specific: `$0.50/kg`
- compound: `2.1¢/kg + 3.4%`
- `Free`

Several rules compare against "the base rate" as a percentage (the 15% deals, for example). The engine computes a **base rate equivalent** for the entry:

```
baseRateEquivalentPct = ad valorem part + (specific amount × quantity ÷ customs value × 100)
```

Because this depends on the entry's value and quantity, **which heading applies can change with the shipment size.** Conditions like `baseRate` use this figure.

---

## 10. Inputs and answers

Some rules depend on facts the engine can't know: steel content, whether goods were loaded before a date, whether they qualify for USMCA, whether they're a donation. These are **inputs**, declared once and referenced by conditions, bases and rates.

```ts
interface InputDefinition {
  id: string
  label: string                 // shown to the user
  help?: string
  type: "boolean" | "percent" | "number" | "date" | "choice"
  unit?: string                 // "kg", "%"
  choices?: { value: string; label: string }[]
  default?: unknown             // used only when a sensible default exists
}
```

```ts
// tariffs/inputs.ts
export const Inputs: InputDefinition[] = [
  { id: "steelContentPct", label: "Steel content (% of customs value)", type: "percent" },
  { id: "aluminumContentPct", label: "Aluminum content (% of customs value)", type: "percent" },
  { id: "copperContentPct", label: "Copper content (% of customs value)", type: "percent" },
  { id: "metalWeightPct", label: "Combined steel/aluminum/copper weight (% of article weight)", type: "percent" },
  { id: "usContentPct", label: "U.S. content (% of value)", type: "percent" },
  { id: "loadingDate", label: "Date goods were loaded for export", type: "date" },
  { id: "isDonation", label: "Is this a donation?", type: "boolean" },
  { id: "claimedPreference", label: "Claiming a trade preference?", type: "choice" },
]
```

### 10.1 Asking only what's needed

Handlers declare which inputs they use (see [§11](#11-handlers-the-engines-extension-points)). For each calculation, the engine collects the inputs used by the tariffs that are candidates on that date, and the UI shows exactly those fields. There's no special-casing of metals or U.S. content in the page.

### 10.2 Unanswered inputs

If a condition needs an input that hasn't been answered, it returns **unknown**. The condition then uses its `assume` value, which defaults to `false`:

```ts
requires: [{ kind: "answer", input: "confirm:9903.94.05", equals: true }]               // assume false
requires: [{ kind: "answer", input: "usedInUsProduction", equals: false, assume: true }] // assume true
```

- With the default, a heading that needs an answer **doesn't apply until answered** and gets the status **needs an answer**. For an exemption that's the conservative choice: the importer pays the duty the exemption would have removed. It matches the legacy `requiresReview` behavior, which applied it to duty-imposing headings too (e.g. 9903.94.05 auto parts isn't charged until confirmed).
- Set `assume: true` on a condition where the safer default is that it holds, so a duty applies until the user says otherwise.
- **Word yes/no questions so that "yes" is the answer that changes the default.** The calculator shows them as checkboxes, and an unchecked box is *unanswered*, not "no"; links don't carry "no" either. So a condition like `equals: true, assume: true` could never be turned off. Ask the opposite instead: `notQuartzSurfaceProduct` with `equals: false, assume: true`, where checking the box removes the duty.
- The result lists every question the entry depends on (`questions`), and which of them are unanswered (`unansweredInputs`), with the headings each one affects.

> **Implemented in `tariffs/engine-v2`.** A later improvement: show what each answer would change ("If loaded before Feb 24, 2026: −$1,000") by running the calculation both ways.

### 10.3 Answers from entry data

For audits, answers come from entry records rather than the UI. The preference claimed is on the entry line, the dates are on the entry summary, and the Chapter 99 lines filed show which exemptions the broker claimed. The same engine runs with those answers filled in.

---

## 11. Handlers: the engine's extension points

Handlers are small pure functions registered under a name (`kind`). Records choose behavior by naming a kind; the engine never contains tariff-specific `if` statements.

There are four handler registries:

| Registry | Used by | Decides |
|---|---|---|
| `conditions` | `Tariff.requires` | whether a tariff applies |
| `bases` | `Tariff.basis` | what value a tariff applies to |
| `rates` | `Tariff.rate` | how much duty a tariff produces |
| `interactions` | `Interaction.kind` | how applying tariffs combine |

### 11.1 The context handlers receive

```ts
interface CalculationContext {
  asOf: IsoDate
  htsCode: string
  country: string
  column: DutyColumn
  customsValue: number
  quantity?: number
  quantityUnit?: string
  answers: Record<string, unknown>   // input id → value
  baseRate: ParsedBaseRate           // from the HTS revision in effect
  baseRateEquivalentPct: number      // see §9.3
  rules: RuleSnapshot                // everything in effect on asOf
}
```

### 11.2 Handler shapes

```ts
type Tri = true | false | "unknown"

interface ConditionHandler {
  inputs?: string[] // InputDefinition ids this handler may read
  check(args: { params: Record<string, unknown>; ctx: CalculationContext }): Tri
}

interface BasisHandler {
  inputs?: string[]
  value(args: { params: Record<string, unknown>; ctx: CalculationContext }): number | "unknown"
  explain?(params, ctx, basisValue): string // optional reason shown on the line
}

interface RateHandler {
  inputs?: string[]
  compute(args: {
    params: Record<string, unknown>
    ctx: CalculationContext
    basisValue: number
  }): { pct?: number; amount?: number } // pct is of basisValue; amount is dollars
  explain?(params, ctx, result): string // optional reason shown on the line
}
```

`explain` is text only and never affects amounts. `usContentShare` uses it to say how the value was split, and `topUpTo` to say what it adds ("Tops up to 100% including the regular duty (6.5%), so 93.5% here").

### 11.3 Built-in handlers

```ts
conditions.register("baseRate", {
  check: ({ params, ctx }) => compare(ctx.baseRateEquivalentPct, params.op, params.pct),
})

conditions.register("answer", {
  check: ({ params, ctx }) => {
    const value = ctx.answers[params.input as string]
    return value === undefined ? "unknown" : value === params.equals
  },
})

conditions.register("dateBefore", {
  check: ({ params, ctx }) => {
    const value = ctx.answers[params.input as string] as string | undefined
    return value === undefined ? "unknown" : value < (params.date as string)
  },
})

bases.register("fullValue", { value: ({ ctx }) => ctx.customsValue })

bases.register("metalContent", {
  inputs: ["steelContentPct", "aluminumContentPct", "copperContentPct"],
  value: ({ params, ctx }) => {
    const pct = ctx.answers[`${params.metal}ContentPct`] as number | undefined
    return pct === undefined ? "unknown" : (ctx.customsValue * pct) / 100
  },
})

rates.register("adValorem", { compute: ({ params }) => ({ pct: params.pct as number }) })

rates.register("perUnit", {
  compute: ({ params, ctx }) => ({ amount: (params.amount as number) * (ctx.quantity ?? 0) }),
})

rates.register("topUpTo", {
  compute: ({ params, ctx }) => ({
    pct: Math.max(0, (params.pct as number) - ctx.baseRateEquivalentPct),
  }),
})

rates.register("free", { compute: () => ({ pct: 0 }) })
```

### 11.4 The one rule for handlers

**Once any past result depends on a handler's behavior, never change that behavior.** If the method changes, register a new handler under a new name and point new records (with new dates) at it. Fixing a genuine bug is the only exception, and it should be a deliberate decision with the pinned tests updated to match.

This is what keeps past dates stable: old records name old handlers, so their results can't shift when new rules arrive.

### 11.5 Adding a brand-new mechanism

Suppose a new proclamation charges **$2.00 per kg of copper content, capped at 25% of the customs value.** No existing rate handler does that.

**Step 1: declare the input**

```ts
// tariffs/inputs.ts
{ id: "copperKg", label: "Copper content (kg)", type: "number", unit: "kg" },
```

**Step 2: register the handler, with a unit test**

```ts
// tariffs/handlers/rates.ts
rates.register("perKgOfContentCapped", {
  inputs: ["copperKg"],
  compute: ({ params, ctx }) => {
    const kg = ctx.answers[params.input as string] as number | undefined
    if (kg === undefined) return { amount: 0 } // the engine flags "needs an answer" via inputs
    const uncapped = (params.dollarsPerKg as number) * kg
    const cap = (ctx.customsValue * (params.capPct as number)) / 100
    return { amount: Math.min(uncapped, cap) }
  },
})
```

**Step 3: add the dated records that use it**

```ts
{
  code: "9903.78.10",
  program: "232-copper",
  name: "Copper Content – Per-kg Duty",
  description: "…",
  scope: { countries: "all", codes: [{ list: "99-III-19(b)" }] },
  rate: { kind: "perKgOfContentCapped", input: "copperKg", dollarsPerKg: 2, capPct: 25 },
  effective: { from: "2026-10-15" },
  source: { citation: "Proclamation …" },
}
```

**Step 4: add pinned test cases for dates after it starts** (see [§16](#16-testing)).

Nothing else changes. Earlier dates can't be affected, because no earlier record names the new handler.

---

## 12. The calculation pipeline

Every calculation runs the same steps in the same order.

```ts
calculate({
  htsCode: "7326.90.86.88",
  country: "CN",
  entryDate: "2026-03-15",
  customsValue: 10_000,
  quantity: 250, quantityUnit: "kg",
  answers: { steelContentPct: 60 },
}) → CalculationResult
```

| Step | What happens |
|---|---|
| **1. Snapshot** | `getRulesAsOf(entryDate)` resolves every record type, and every list, to the version in effect. Loads the HTS revision in effect. |
| **2. Column** | Pick General / Special / Column 2 ([§9.1](#91-duty-columns)). Read the base rate from that column; compute the base rate equivalent. |
| **3. Candidates** | Tariffs whose `scope.countries`, `excludeCountries`, `codes` and `excludeCodes` match. (`whenApplies` is checked in step 5.) |
| **4. Conditions** | Evaluate `requires` on each candidate: keep (true), drop (false), or mark **needs an answer** (unknown, see [§10.2](#102-unanswered-inputs)). |
| **5. Exceptions** | Repeat until nothing changes: turn on tariffs whose `whenApplies` is satisfied; mark tariffs displaced by an active exception. |
| **6. noStack** | Apply `noStack` interactions ([§8.1](#81-nostack-precedence-between-programs)). |
| **7. Value split** | Compute each tariff's basis value. A tariff displaced by an exception keeps only the value that exception doesn't cover (none, for a full-value exception). Then apply `excludePortion` interactions ([§8.2](#82-excludeportion-partial-non-stacking)). |
| **8. Rates** | Compute each remaining tariff's duty with its rate handler (`rateByColumn` overrides if present). |
| **9. Caps** | Apply `capTotal` interactions ([§8.3](#83-captotal-a-ceiling-across-several-programs)). |
| **10. Fees** | MPF and HMF, using the rates and limits in effect on the date (MPF limits change every October 1; HMF applies only to ocean shipments). |
| **11. Explain** | Record the result and the reason for every candidate. |

Step 5 repeats because turning one heading on can turn another off, and vice versa. The validator rejects cycles ([§15](#15-validation)), so it always settles; the engine also stops with an error after a fixed number of rounds as a safety net.

### 12.1 The result

```ts
interface DutyLine {
  code: string                      // Chapter 99 heading, or "BASE" for the base rate
  program?: string
  status: "applies" | "excluded" | "needsAnswer" | "notApplicable"
  basisValue: number
  ratePct?: number
  amount: number
  reasons: string[]                 // human-readable explanation
  source?: Source
}

interface CalculationResult {
  asOf: IsoDate
  htsRevision: string
  column: DutyColumn
  lines: DutyLine[]
  fees: { name: string; amount: number }[]
  totalDuty: number
  unansweredInputs: { input: string; impact: string }[]
  engineVersion: string             // git commit
  rulesHash: string                 // hash of the snapshot used
}
```

`engineVersion` and `rulesHash` let you reproduce any result exactly, later. Store them with every saved calculation.

---

## 13. Stacking and exclusion cheat sheet

| You want to say… | Use | Where |
|---|---|---|
| These tariffs add together | Nothing (stacking is the default) | — |
| Heading A doesn't apply if heading B applies | `exceptions: ["B"]` on A | Tariff |
| Heading B (a $0 exemption) applies whenever any 232 duty applies | `scope.whenApplies: { authorities: ["232"] }` on B | Tariff |
| …but only for the part of the value 232 covers | Also `basis: { kind: "coveredBy", selector: { authorities: ["232"] } }` on B | Tariff |
| A tariff applies only if a condition holds | `requires: [...]` | Tariff |
| Program X beats Y, which beats Z | `noStack` with `order: [X, Y, Z]` | Interaction |
| Program Y doesn't apply to the part of the value X covers | `excludePortion` | Interaction |
| The MFN rate plus heading H must total exactly X% | Two headings: `topUpTo` below the threshold, `free` at or above it | Tariff |
| The total from several programs may not exceed X% | `capTotal` | Interaction |
| A tariff covers only some countries' goods | `scope.countries` / `excludeCountries` | Tariff |
| A tariff covers codes in a note that keeps changing | `scope.codes: [{ list: … }]` | Tariff + CodeList |

---

## 14. Versioning in detail

### 14.1 What "as of" means

Every calculation has one **as-of date**: the date whose rules apply. By default this is the **entry date**. Rules that depend on other dates (loading date, export date, date of withdrawal from a warehouse) express that through conditions on inputs, not by changing the as-of date.

### 14.2 Adding a tariff

```ts
{
  code: "9903.03.01",
  program: "122",
  name: "Section 122 Surcharge",
  description: "…",
  scope: { countries: "all", codes: "all" },
  rate: { kind: "adValorem", pct: 10 },
  exceptions: ["9903.03.02" /* … */],
  effective: { from: "2026-02-24" },
  source: { revision: "2026HTSRev4", citation: "Proclamation of Feb 2026 under §122" },
}
```

### 14.3 Changing a tariff over time

Use `tariffVersions`: a starting record plus dated changes. Fields not mentioned in a change carry over.

```ts
...tariffVersions(
  {
    code: "9903.81.91",
    program: "232-steel",
    name: "Section 232 – Steel Derivatives",
    description: "…",
    scope: { countries: "all", codes: [{ list: "99-III-16(c)(iv)" }] },
    basis: { kind: "metalContent", metal: "steel" },
    rate: { kind: "adValorem", pct: 25 },
    effective: { from: "2025-03-12" },
    source: { citation: "Proclamation 10896" },
  },
  [
    { from: "2025-06-04", set: { rate: { kind: "adValorem", pct: 50 } },
      source: { citation: "Proclamation 10947" } },
    { from: "2026-04-06", set: { basis: { kind: "fullValue" } },
      source: { citation: "Proclamation 11021", note: "Duty now on full customs value" } },
  ],
)
```

This expands into three ordinary records:

```
9903.81.91  2025-03-12 → 2025-06-04   25% of steel content
9903.81.91  2025-06-04 → 2026-04-06   50% of steel content
9903.81.91  2026-04-06 → (current)    50% of full customs value
```

and the engine sees exactly one of them on any date:

| As of | Record | Duty on $10,000 with 60% steel |
|---|---|---|
| 2025-05-01 | 25% of content | $1,500 |
| 2025-09-01 | 50% of content | $3,000 |
| 2026-05-01 | 50% of full value | $5,000 |

### 14.4 Ending a tariff

Add a final change with `ends: true`:

```ts
...tariffVersions(section122Base, [
  { from: "2026-07-24", ends: true, source: { revision: "2026HTSRev12", note: "§122 authority expired" } },
])
```

or, for a record with no other changes, set `effective.to` directly. **Don't delete it.** Past dates still need it.

### 14.5 HTS revisions and the revision dropdown

Revision dates come from USITC:

```bash
npm run sync-revisions
```

writes `tariffs/hts-revisions.json`:

```json
[
  { "name": "2026HTSRev5", "title": "Revision 5 (2026)", "from": "2026-04-08", "to": "2026-04-23" },
  { "name": "2026HTSRev6", "title": "Revision 6 (2026)", "from": "2026-04-23", "to": "2026-04-29" }
]
```

Choosing a revision in the UI sets the as-of date to that revision's `from` date. The base rates come from that revision's HTS data.

`VerifiedTariffRevisions` lists the revisions whose Chapter 99 data has been entered **with dates** and checked. **Only verified revisions appear in the dropdown**, so unverified history is never shown as fact. Add a revision to the list when you finish entering it.

### 14.6 Versioning everything else

| Record | How it changes |
|---|---|
| `CodeList` | `codeListVersions(base, [{ from, add, remove }])`, or a new full version |
| `Interaction` | Same as a tariff: end the old record and add a new one with the same `id` |
| `TradePreference`, `ColumnAssignment` | Set `to` / add a record |
| `Program` | Usually unchanged; add to `legalBasis` as proclamations amend it |
| Handlers | Never change behavior; add a new `kind` ([§11.4](#114-the-one-rule-for-handlers)) |

### 14.7 Retroactive changes and corrections

Two different things can look similar:

1. **The law changes retroactively.** For example, an order published in May says a rule applies from March 4. Record it with `from: "2025-03-04"`: the law as it now stands. For audits, you'll eventually want to know what was believed at the time too; that's the job of a "recorded on" date (below).
2. **You made a data-entry mistake.** Fix the record. Pinned tests covering that period should be updated in the same change, with a note saying why.

**Later, for audits:** add a second date to every record, `recordedAt`, and never edit records: corrections supersede them. That makes it possible to ask both "what did the law say on the entry date, as understood at the time?" and "what does the law say about that date, as we know it now?". The difference between the two is where refunds and underpayments show up. This isn't needed for the calculator or the revision dropdown.

---

## 15. Validation

`validateRules()` runs as a test on all real data. **Errors** fail the test; **warnings** are printed.

**Errors:**

- A date that isn't `YYYY-MM-DD`, or `from` not before `to`.
- Two records for the same tariff code, list id or interaction id in effect on the same day.
- `countries` or `codes` missing from a tariff's scope.
- A `ListRef`, program, or input id that doesn't exist.
- A `kind` with no registered handler.
- A cycle: in `exceptions` plus `whenApplies`, or in lists including lists.
- A program appearing in more than one group of the same `noStack`.

**Warnings:**

- A tariff in effect on some date refers to a heading, list or program that isn't in effect that day.
- Two interactions of the same kind touch the same programs on the same date (check the order is intended).
- A record without a `source`.
- A tariff whose list is empty on some date it's in effect.

The validator checks every date on which anything starts or ends, so it covers the whole history, not just today.

---

## 16. Testing

### 16.1 Handler unit tests

Every handler gets tests of its own: normal cases, boundaries (exactly 15%), and missing inputs.

### 16.2 Pinned cases per period

A pinned case fixes an input and its expected output for a specific date. **Never change an expected value because the engine changed.** Only change it if the law or your recording of the law changed, and say which in a comment.

```ts
// testing/cases/232-steel.cases.ts
pinned("China steel derivative before the full-value change", {
  input: {
    htsCode: "7326.90.86.88", country: "CN", entryDate: "2026-03-15",
    customsValue: 10_000, answers: { steelContentPct: 60 },
  },
  expect: {
    lines: {
      "9903.88.03": { status: "applies", amount: 2_500 },
      "9903.81.91": { status: "applies", amount: 3_000 },
      "9903.03.06": { status: "applies", amount: 0 },     // covers the $6,000 steel content
      "9903.03.01": { status: "applies", amount: 400 },   // 10% of the remaining $4,000
    },
  },
})
```

Keep a few pinned cases for every period where something important changed. The test file doubles as documentation of how each rule should behave.

### 16.3 Comparing with the old engine during migration

While families are being moved over, run both engines on the same inputs (every pinned case plus a sample of real codes and countries) for the current date and report any difference. A difference is either a bug in the port or a bug in the old engine; either way, investigate before switching.

---

## 17. Recipes: day-to-day maintenance

### 17.1 Processing a new HTS revision

1. `npm run sync-revisions` to pick up the new revision's dates.
2. Read the change record, the new or changed U.S. notes, and any related Federal Register notice or CSMS message.
3. Run the list extraction script (when available) to get added and removed codes per note.
4. For each change, find the recipe below. Always use the **legal effective date** from the source, which is often not the revision's start date.
5. Fill in `source` on everything you touch.
6. Run the tests: validation, handler tests, pinned cases.
7. Add pinned cases for anything new.
8. Add the revision to `VerifiedTariffRevisions`.
9. `npm run notes:cited` to refresh the note text the calculator shows under "Referenced notes" (`public/data/notes`). It finds citations in heading descriptions and question help with `tariffs/engine-v2/citations.ts`, plus any `citations` on an input, and reads the text from each verified revision's parsed notes in the revision checker.

### 17.2 A new heading appears

Add a `Tariff` with `effective.from`. If it's an exemption from an existing heading, also add it to that heading's `exceptions` **as a new version of that heading** (the old version didn't have it):

```ts
...tariffVersions(section122Base, [
  { from: "2026-05-22", set: { exceptions: [...section122Base.exceptions, "9903.03.12"] } },
])
```

### 17.3 A rate changes

```ts
{ from: "2026-06-08", set: { rate: { kind: "adValorem", pct: 25 } }, source: { … } }
```

### 17.4 A heading ends

```ts
{ from: "2026-07-24", ends: true, source: { … } }
```

### 17.5 Codes are added to or removed from a note list

Only the list changes:

```ts
{ from: "2026-08-14", add: ["9403.20.00"], remove: ["7326.90.86"], source: { revision: "2026HTSRev16" } }
```

### 17.6 A heading starts using a different list

```ts
{ from: "2026-09-02", set: { scope: { countries: "all", codes: [{ list: "99-III-16(c)(xii)" }] } } }
```

### 17.7 A new country deal with a "15% all-in" rate

Two headings per covered program, following the HTS:

```ts
{
  code: "9903.02.90",
  program: "deal-ch",
  name: "Switzerland – top up to 15%",
  description: "…",
  scope: { countries: ["CH", "LI"], codes: "all" },
  requires: [{ kind: "baseRate", op: "<", pct: 15 }],
  rate: { kind: "topUpTo", pct: 15 },
  effective: { from: "…" },
},
{
  code: "9903.02.91",
  program: "deal-ch",
  name: "Switzerland – base rate of 15% or more",
  description: "…",
  scope: { countries: ["CH", "LI"], codes: "all" },
  requires: [{ kind: "baseRate", op: ">=", pct: 15 }],
  rate: { kind: "free" },
  effective: { from: "…" },
},
```

Then add both to the `exceptions` of the heading the deal replaces, as a new version of that heading.

### 17.8 A new non-stacking order

Add an `Interaction` with `kind: "noStack"`, its order, dates and source. If it's partial (only part of the value), use `excludePortion`.

### 17.9 A new kind of calculation

Follow [§11.5](#115-adding-a-brand-new-mechanism): declare inputs, register a handler with tests, add records, add pinned cases.

### 17.10 A country moves to or from Column 2

Add or end a `ColumnAssignment`.

### 17.11 A trade preference starts, lapses or changes eligible countries

Add or end a `TradePreference`, or version its country list.

### 17.12 You find a mistake in past data

Fix the record, update affected pinned cases with a comment explaining the correction, and note it in the commit message. (Once `recordedAt` exists, add a superseding record instead.)

### 17.13 Backfilling past revisions

Because every record carries its own dates, history can be entered in any order. Adding 2025 revisions after 2026 is already in place just means adding records with earlier dates. Nothing about later dates changes.

#### What backfilling looks like

Say the data starts at 2026 Rev 5, and 9903.81.91 exists only in its current form, with no dates:

```ts
// Before: current form only, no dates (= "in effect forever")
{
  code: "9903.81.91",
  program: "232-steel",
  name: "Section 232 – Steel Derivatives",
  description: "…",
  scope: { countries: "all", codes: [{ list: "99-III-16(c)(iv)" }] },
  basis: { kind: "fullValue" },
  rate: { kind: "adValorem", pct: 50 },
}
```

Backfilling means adding the earlier versions in front of it:

```ts
// After: earlier versions added; the current version is unchanged except it gains a start date
...tariffVersions(
  {
    code: "9903.81.91",
    program: "232-steel",
    name: "Section 232 – Steel Derivatives",
    description: "…",
    scope: { countries: "all", codes: [{ list: "99-III-16(c)(iv)" }] },
    basis: { kind: "metalContent", metal: "steel" },
    rate: { kind: "adValorem", pct: 25 },
    effective: { from: "2025-03-12" },
    source: { citation: "Proclamation 10896" },
  },
  [
    { from: "2025-06-04", set: { rate: { kind: "adValorem", pct: 50 } },
      source: { citation: "Proclamation 10947" } },
    { from: "2026-04-06", set: { basis: { kind: "fullValue" } },       // ← the record you already had
      source: { citation: "Proclamation 11021" } },
  ],
)
```

The same approach works for every record type:

| Backfilling… | What you do |
|---|---|
| A tariff that no longer exists (e.g. IEEPA fentanyl, reciprocal) | Add it with both `from` and `to` |
| An older rate, scope or exception list for a tariff that still exists | Add earlier versions in front of the current one, and give the current one a `from` |
| An older version of a code list | Add a version with an earlier `from` and a `to` where the current version starts, and give the current version a `from` |
| An older non-stacking rule or cap | Add an `Interaction` with those dates |
| An old column assignment or trade preference | Add or date the record |
| An old calculation method (e.g. 232 on metal content only) | Register the handler if it doesn't exist yet. Only the older records use it, so later dates can't change |

#### The workflow: work backward

Each revision's change record describes what changed from the revision before it, so the easiest direction is backward. For each earlier revision, you're undoing the changes the next revision made.

1. **Start at the earliest verified revision** (say 2026 Rev 5). Its data is known to be right.
2. **Read that revision's change record, changed notes and related Federal Register notices.** Every change it made has a "before" state that you now need to record.
3. **For each change, record the "before" version:**
   - A heading **added** in Rev 5 → give it `from` = its legal effective date (it didn't exist before).
   - A heading **removed** in Rev 5 → add it back with `to` = its legal end date.
   - A heading **changed** in Rev 5 → add the earlier version in front, ending on the change's effective date.
   - Codes **added to a list** in Rev 5 → add an earlier list version without them.
   - Codes **removed from a list** in Rev 5 → add an earlier list version with them.
4. **Run validation.** Any current record still missing a `from` now overlaps with the earlier version you added, and the validator names it (see below).
5. **Add pinned cases for dates in the earlier revision** (Rev 4 here), covering the rules that changed.
6. **Run all tests.** Pinned cases for later dates must still pass. If one fails, the backfill changed something it shouldn't have.
7. **Mark the earlier revision as verified** by adding it to `VerifiedTariffRevisions`.
8. **Repeat** for the revision before that, back to where you want history to start (January 2025).

Working backward means each step builds on a revision you've just verified, instead of guessing forward toward data you already trust.

You can also backfill in any other order. For example, if a customer needs August 2025 before the rest of 2025 is done, backfill just the records that affect those dates and verify those revisions. The dropdown can have gaps: only verified revisions appear.

#### Tools

- **The revision checker** compares N-1 → N, as going forward, with the older revision's heading pages as the "before" of every cited heading. Upload every subchapter III heading page for each revision: when both sides are complete (checked against the archive below), every subchapter III heading is diffed, including added and removed ones, and only rows the changes rely on need reviewing. `npm run pull-revision -- <N-1> --backfill` writes the package, and `/backfill-revision <N-1>` plans and implements it.
- **`npm run ch99:archive`** reads USITC's archived Chapter 99 PDF for every revision and writes `tariffs/engine-v2/data/ch99-first-seen.json`: the revisions each 9903 heading appears in. `npm run ch99:archive -- --step <N-1>` lists the headings N added and removed, as an independent check on the change record.
- **The validator**, given that file, fails on an undated record whose heading first appears in the HTS after the earliest verified revision starts: undated, it would apply before it existed.

#### Safeguards

- **Overlaps are caught.** Current records without a `from` mean "in effect forever." Adding an earlier version without dating the current one puts two versions of the same heading or list in effect at once. `validateRules()` fails with an overlap error naming it, so history can't be double-counted by accident.
- **Later dates are protected by pinned tests.** The pinned cases for dates you've already verified must keep passing. A backfill that changes a 2026 result is a bug.
- **Unverified history is hidden.** Only revisions in `VerifiedTariffRevisions` are selectable, so a half-finished backfill never shows up as fact.

#### Things to watch

- **Use legal effective dates, not revision dates.** Many 2025 changes took effect between revisions, were applied retroactively (e.g. the non-stacking order reaching back to March 4, 2025), or had in-transit cutoffs. Revisions often published changes days or weeks after they took effect. Take dates from the proclamation, executive order or Federal Register notice.
- **Retroactive changes can reach into periods you've already verified.** If a later order made a rule apply from an earlier date, the record's `from` goes back before revisions that didn't show it at the time. That's correct: it records the law as it now stands. Note it in `source.note`, and re-check pinned cases for the affected dates.
- **Tariffs that were suspended, not ended.** Some headings were suspended and later revived or revoked. Model a suspension as the record ending and, if it came back, a new version starting. Don't leave a record in effect across a period when it didn't apply.
- **Base rates are a separate backfill.** The dropdown needs the HTS data for each past revision in Supabase storage to show that revision's base rates. Chapter 99 history and base-rate history are backfilled independently.
- **Handlers only get added, never changed.** If backfilling reveals an old mechanism the engine doesn't support yet, register a new handler kind for it ([§11.5](#115-adding-a-brand-new-mechanism)) instead of modifying a current one.

#### Backfill checklist, per revision

- [ ] Change record, changed notes and related FR notices / CSMS messages read
- [ ] Every added, removed or changed heading has its earlier version recorded, with legal dates
- [ ] Every changed list has its earlier version recorded
- [ ] Interactions, column assignments and trade preferences checked for that period
- [ ] `source` filled in on every record touched
- [ ] Validation passes (no overlaps, no missing references)
- [ ] Pinned cases added for the revision; all pinned cases pass
- [ ] Revision added to `VerifiedTariffRevisions`

---

## 18. Migrating from the current model

### 18.1 Field mapping

| Current (`TariffI`) | New | Notes |
|---|---|---|
| `code` | `Tariff.code` | |
| `name` | `Tariff.name` | Remove dates from names ("Expires July 24, 2026") and put them in `effective` |
| `description` | `Tariff.description` | |
| `category` | `Tariff.program` → `Program.authority` | |
| `inclusions.countries` | `scope.countries` | `["*"]` becomes `"all"` |
| `inclusions.codes` | `scope.codes` | Arrays spread from `tariff-lists.ts` / `232-metals.ts` become `{ list }` references |
| omitted `inclusions.codes` | `scope.codes: "all"` | Now explicit |
| `inclusions.tariffs` | `scope.whenApplies` | By code or, better, by program/authority |
| `exclusions.countries` | `scope.excludeCountries` | |
| `exclusions.codes` | `scope.excludeCodes` | |
| `exceptions` | `exceptions` | Same meaning |
| `general` / `special` / `other` | `rate` (+ `rateByColumn` if they differ) | |
| `contentRequirement` | `basis: { kind: "metalContent", metal }` | Content percentages become inputs |
| `requiresReview` | `requires` with named conditions | Each becomes a specific question |
| `suppressesBaseDuty` + paired headings | `topUpTo` / `free` pair with `baseRate` conditions | |
| (none) | `effective`, `source` | New |

### 18.2 Engine code that becomes data

| Current code | Becomes |
|---|---|
| `filterCountryTariffsFor15PercentExeption` (EU/JP/KR codes and 15% threshold) | `baseRate` conditions on the deal headings |
| `filterCountryTariffsByAdValoremRate` (9903.82.07/.08/.10/.11/.14/.15) | `baseRate` conditions on those headings |
| `Column2CountryCodes` | `ColumnAssignment` records |
| `Section232MetalTariffs` ignore list in `getArticleTariffSet`, and the separate "Article" / "Content" tariff sets | `basis` on each tariff, plus partial exceptions (`coveredBy`) and `excludePortion` |
| `htsCode.includes(code)` matching | Prefix match on digits only |
| `requiresReview` defaults | Unanswered inputs ([§10.2](#102-unanswered-inputs)) |
| `MPF_MIN` / `MPF_MAX` constants | Dated fee records |

### 18.3 Suggested order

Move one family at a time, comparing results with the old engine at each step:

1. **Foundation:** types, snapshot resolution, handler registries, inputs, validator, pinned-case runner. Port **Section 122** first: it's small and has real start and end dates.
2. **Section 232 metals:** lists, content bases, the April 2026 basis change, partial exceptions.
3. **Deals and caps:** EU, Japan, Korea (and Switzerland), removing the two hardcoded filters.
4. **Section 301** China and forced labor.
5. **Autos, lumber, heavy vehicles, semiconductors,** and the remaining families.
6. **Columns and trade preferences.**
7. Switch the UI to the new engine and delete the old one once comparison runs are clean.

---

## 19. Worked examples

### 19.1 China steel derivative, before and after the April 2026 change

Illustrative inputs: HTS 7326.90.86.88, China, customs value $10,000, steel content 60%, base rate 2.9%.

**Entered 2026-03-15:**

| Line | Program | Basis | Rate | Duty | Why |
|---|---|---|---|---|---|
| BASE | — | $10,000 | 2.9% | $290 | Column 1 General |
| 9903.88.03 | 301-china | $10,000 | 25% | $2,500 | In list 20(f); stacks |
| 9903.81.91 | 232-steel | $6,000 | 50% | $3,000 | In list 16(c)(iv); steel content basis |
| 9903.03.06 | 122 | $6,000 | 0% | $0 | A 232 duty applies; covers the value 232 covers |
| 9903.03.01 | 122 | $4,000 | 10% | $400 | Displaced by 9903.03.06 for $6,000; applies to the rest |

**Entered 2026-05-01:** 9903.81.91 now uses the full value, so it's $5,000. 9903.03.06 therefore covers the full $10,000, and 9903.03.01 is **excluded** entirely. 301 is unchanged. No Section 122 record changed between the two dates; the difference comes from the 232 basis change.

**Entered 2026-08-01:** Section 122 has ended, so neither 122 heading is a candidate. If the forced-labor 301 program covers China on that date, its heading appears as a candidate and is checked against its own exceptions.

### 19.2 EU good under a 15% "all-in" deal

The deal is two headings (see [§17.7](#177-a-new-country-deal-with-a-15-all-in-rate)); the heading it replaces lists both as exceptions.

| Good | Base rate equivalent | Heading that applies | Its rate | Base + deal total |
|---|---|---|---|---|
| MFN 4.5% | 4.5% | top-up heading | 10.5% | **15%** |
| MFN 20% | 20% | "15% or more" heading | 0% | **20%** |
| MFN $0.50/kg; $1,000; 100 kg | 5% | top-up heading | 10% | **15%** |
| Same good; $1,000; 400 kg | 20% | "15% or more" heading | 0% | **20%** |

The last two rows show why the base rate equivalent is computed per shipment: for specific rates, **which heading applies depends on value and quantity.**

Only the program the deal replaces is limited. Other programs that apply (for example, 232 metal duties) still stack, unless a `capTotal` interaction says otherwise.

### 19.3 An exemption that needs an answer

Section 122 in-transit exemption:

```ts
{
  code: "9903.03.02",
  program: "122",
  name: "122 Exemption – Loaded Before Feb 24, 2026",
  description: "…",
  scope: { countries: "all", codes: "all" },
  requires: [{ kind: "dateBefore", input: "loadingDate", date: "2026-02-24" }],
  rate: { kind: "free" },
  effective: { from: "2026-02-24", to: "2026-07-24" },
}
```

- Loading date not given → 9903.03.02 **needs an answer**, doesn't apply; 9903.03.01 applies; the result says "If loaded before Feb 24, 2026: −$1,000."
- Loading date 2026-02-20 → 9903.03.02 applies at $0; 9903.03.01 is excluded.
- Loading date 2026-02-26 → 9903.03.02 doesn't apply; 9903.03.01 applies.

---

## 20. File layout

```
tariffs/
  HowTariffsWork.md          (or keep at the repo root)
  hts-revisions.json         generated by `npm run sync-revisions`
  programs.ts                Program records
  inputs.ts                  InputDefinition records
  columns.ts                 ColumnAssignment records
  preferences.ts             TradePreference records
  interactions.ts            Interaction records (order matters, see §8.4)
  lists/                     one file per CodeList
    99-III-16(c)(xi).ts
    99-III-20(f).ts
    eu-members.ts
    …
  headings/                  Tariff records, one file per program
    122.ts
    232-steel.ts
    301-china.ts
    …
  handlers/
    conditions.ts
    bases.ts
    rates.ts
    interactions.ts
  engine/
    snapshot.ts              getRulesAsOf()
    calculate.ts             the pipeline
    explain.ts
  versioning.ts              tariffVersions(), codeListVersions(), date helpers
  validate.ts                validateRules()
scripts/
  sync-hts-revisions.ts
  extract-note-lists.ts      (future) per-revision list extraction
testing/
  cases/                     pinned cases, one file per program
```

In practice, most revisions touch only `lists/`, some touch `headings/`, and `interactions.ts` and `handlers/` change rarely.

---

## 21. Glossary

| Term | Meaning |
|---|---|
| **As-of date** | The date whose rules apply to a calculation; normally the entry date |
| **Base rate** | The duty rate on the HTS line itself, from the applicable column |
| **Base rate equivalent** | The base rate expressed as a percentage for this entry, converting specific rates with value and quantity |
| **Chapter 99** | The HTS chapter holding temporary and additional duties (Sections 232, 301, 122, IEEPA…) |
| **Column 1 General / Special, Column 2** | The three rate columns on each HTS line (see [§9.1](#91-duty-columns)) |
| **Effective period** | `from` (inclusive) and `to` (exclusive) dates on a record |
| **Exception** | A heading that displaces another when it applies |
| **Exemption heading** | A $0 Chapter 99 heading the importer files to claim an exemption |
| **Handler** | A registered function implementing a condition, basis, rate or interaction `kind` |
| **Input / answer** | A fact about the shipment the engine can't know, and the user's (or entry data's) value for it |
| **Interaction** | A dated rule about how programs combine: `noStack`, `excludePortion`, `capTotal` |
| **MFN** | Most-favored-nation rate: Column 1 General |
| **Pinned case** | A test fixing the expected result for an input on a specific date |
| **Program** | A family of tariffs from one legal action |
| **Snapshot** | The version of every record in effect on one date |
| **SPI** | Special Program Indicator: the symbol for an FTA or preference program in the special column |
| **Trade preference** | An FTA or preference program (USMCA, KORUS, GSP…) |
| **Verified revision** | An HTS revision whose Chapter 99 data has been entered with dates and checked |

---

## 22. Open questions

Decisions to confirm before or during implementation:

1. **Where this document lives.** Repo root (current) or `tariffs/`?
2. **Which revision the current data reflects.** The prototype assumed `2026HTSRev5` as the starting point for verified history.
3. **How to handle your in-progress revision work.** To keep history for revisions 6–19, each revision's changes need to be entered as dated changes rather than overwriting records and lists.
4. **Default for unanswered inputs.** [§10.2](#102-unanswered-inputs) proposes "exemptions don't apply until answered." Confirm this matches how you want the calculator to behave.
5. **Antidumping and countervailing duties.** They're case-specific (by manufacturer and exporter) and not currently covered. Out of scope, or a separate module later?
6. **Base rates for past revisions.** The UI needs the HTS data for the selected revision, which depends on how revision files are named in Supabase storage.
7. **Storage.** Records as TypeScript files in git (reviewable diffs, current approach), compiled into Supabase later for audits, or Supabase from the start?
8. **`recordedAt` timing.** Add it from day one (cheap now, harder to backfill), or wait until audits are a real product?
9. **Refunds.** Duties a court later struck down (IEEPA, from Feb 20, 2026) keep their effective periods, since they were assessed, but are owed back. Planned as a legal status on top of the records; see [tariffs/engine-v2/REFUNDS.md](tariffs/engine-v2/REFUNDS.md).
