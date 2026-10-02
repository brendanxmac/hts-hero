// Section 201 – Quartz Surface Products: U.S. note 41 to subchapter III and headings 9903.45.30
// (in quota) and 9903.45.31 (over quota), from 2026HTSRev16 (Proclamation 11051, effective
// 2026-08-15). See HowTariffsWork.md §6.
//
// 41(a) defines quartz surface products by what they are (predominantly silica with a resin
// binder; silica greater than any other single material by weight; not quarried stone), and the
// three codes are where they're classified. Some goods under these codes, especially the
// catch-all 7020.00.60.00 (other articles of glass), aren't QSP, so both headings ask
// `isQuartzSurfaceProduct`, assumed yes: the duty applies unless the importer says it isn't QSP
// (decision, Oct 3, 2026).
//
// 41(b): the duties are "cumulative and imposed in addition to the rate of duty established … in
// chapters 68 or 70", so they stack with everything else. 41(c): exempt countries. 41(d): the
// quarterly tariff-rate quota; whether it's filled is the importer's answer (`quartzQuotaFilled`),
// and unanswered means in quota (decision, Oct 3, 2026). 41(e): the rates step down each year.
// The Special subcolumn is blank and the FTA partners are exempt by country, so one rate applies
// in every column (Column 2 reads the same as General).
import { Tariff } from "../../types"
import { tariffVersions } from "../../versioning"

const PROGRAM = "201-quartz"
const SOURCE = { revision: "2026HTSRev16", citation: "Proclamation 11051" }

// Applies unless the importer answers that the goods aren't QSP
const IS_QSP = { kind: "answer", input: "isQuartzSurfaceProduct", equals: true, assume: true }

// 41(a): "The scope covers imported products provided for under HTSUS subheadings 6810.99.0020,
// 6810.99.0040, and 7020.00.6000."
const SCOPE = {
  countries: "all" as const,
  excludeCountries: [{ list: "quartzSafeguardExempt41c" }],
  codes: ["6810.99.00.20", "6810.99.00.40", "7020.00.60.00"],
}

// 41(e): rates by period, then the safeguard ends after August 14, 2030
const steps = (rates: [number, number, number]) => [
  { from: "2027-08-15", set: { rate: { kind: "adValorem", pct: rates[0] } }, source: { ...SOURCE, note: "U.S. note 41(e)" } },
  { from: "2028-08-15", set: { rate: { kind: "adValorem", pct: rates[1] } }, source: { ...SOURCE, note: "U.S. note 41(e)" } },
  { from: "2029-08-15", set: { rate: { kind: "adValorem", pct: rates[2] } }, source: { ...SOURCE, note: "U.S. note 41(e)" } },
  { from: "2030-08-15", ends: true as const, source: { ...SOURCE, note: "U.S. note 41(e): the last period ends August 14, 2030" } },
]

export const headings: Tariff[] = [
  ...tariffVersions(
    {
      code: "9903.45.30",
      program: PROGRAM,
      name: "Section 201 – Quartz Surface Products (In Quota)",
      description:
        "Quartz surface products, as defined in U.S. note 41(a) to this subchapter, when the product of any country not exempt under U.S. note 41(c) to this subchapter, if entered in an aggregate quantity not exceeding the quantity defined in U.S. note 41(d) to this subchapter",
      scope: SCOPE,
      exceptions: ["9903.45.31"],
      requires: [IS_QSP],
      rate: { kind: "adValorem", pct: 25 },
      effective: { from: "2026-08-15" },
      source: { ...SOURCE, note: "U.S. note 41(a)–(e)" },
    },
    steps([23, 21, 19]),
  ),
  ...tariffVersions(
    {
      code: "9903.45.31",
      program: PROGRAM,
      name: "Section 201 – Quartz Surface Products (Over Quota)",
      description:
        "Quartz surface products, as defined in U.S. note 41(a) to this subchapter, when the product of any country not exempt under U.S. note 41(c) to this subchapter, if entered in an aggregate quantity exceeding the quantity defined in note 41(d) to this subchapter",
      scope: SCOPE,
      // 41(d): "Entry of goods in excess of the quantities specified above … shall be entered under
      // the over-quota heading 9903.45.31"
      requires: [IS_QSP, { kind: "answer", input: "quartzQuotaFilled", equals: true }],
      rate: { kind: "adValorem", pct: 50 },
      effective: { from: "2026-08-15" },
      source: { ...SOURCE, note: "U.S. note 41(a)–(e)" },
    },
    steps([49, 48, 47]),
  ),
]
