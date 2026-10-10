// 2026HTSBasic text of headings that Proclamation 11002 (Section 232 semiconductors) changed on
// Jan 15, 2026. PP 11002 inserted new semiconductor exemptions in U.S. note 2 (2(v)(xvi), 2(x)(xv)
// and 2(z)(xiii)) and renumbered the subdivisions after them, so these headings' citations
// changed, and three added "semiconductor articles". Each record in force on Jan 15 is split
// there: the Basic text before, the current (2026HTSRev1) text after. Amounts don't change:
// before Jan 15 there's no 9903.79.01 for the exemptions to name. Backfilled from 2026HTSRev1's
// change record; see tariffs/revision-diffs/2026HTSBasic/PLAN.md.
import { Tariff } from "../../types"
import { replaceOnce, splitTariffAt } from "../../versioning"

export const PP_11002_FROM = "2026-01-15"

export const pp11002Source = {
  citation: "Proclamation 11002 (91 FR 2443)",
  url: "https://www.govinfo.gov/content/pkg/FR-2026-01-20/html/2026-01052.htm",
  publishedOn: "2026-01-20",
}

// The semiconductor heading these exemptions gained on Jan 15 (2(v)(xvi), 2(x)(xv), 2(z)(xiii))
const SEMICONDUCTORS = "9903.79.01"

const BASIC_DESCRIPTIONS: Record<string, string> = {
  "9903.01.33":
    "Articles of iron or steel; derivative articles of iron or steel; articles of aluminum; derivative articles of aluminum; wood products; passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans and cargo vans); light trucks; parts of passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans and cargo vans) and light trucks; medium- and heavy-duty vehicles; parts of medium- and heavy-duty vehicles; semi-finished copper; and intensive copper derivative products, of any country, as provided in subdivisions (v)(vi) through (v)(xv) of U.S. note 2 to this subchapter",
  "9903.01.34":
    "The U.S. content of articles the product of any country, in which the U.S. content of the article provides at least 20 percent of the Customs value of the imported article, as provided for in subdivision (v)(xvi) of U.S. note 2 to this subchapter",
  "9903.01.83":
    "Articles of iron or steel; derivative articles of iron or steel; articles of aluminum; derivative articles of aluminum; wood products; passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans and cargo vans); light trucks; parts of passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans and cargo vans) and light trucks; medium- and heavy-duty vehicles; parts of medium- and heavy-duty vehicles; semi-finished copper; and intensive copper derivative products, of Brazil, as provided in subdivisions (x)(v) through (x)(xiv) of U.S. note 2 to this subchapter",
  "9903.01.87":
    "Articles of iron or steel; derivative articles of iron or steel; articles of aluminum; wood products; derivative articles of aluminum; passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans, and cargo vans); light trucks; parts of passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans, and cargo vans) and light trucks; medium- and heavy-duty vehicles; parts of medium- and heavy-duty vehicles; semi-finished copper; and intensive copper derivative products, of India, as provided in subdivisions (z)(iii) through (z)(xiii) of U.S. note 2 to this subchapter",
  "9903.01.88":
    "Articles the product of India that are donations, by persons subject to the jurisdiction of the United States, such as food, clothing, and medicine, intended to be used to relieve human suffering, as provided for in subdivision (z)(xiii) of U.S. note 2 to this subchapter",
}

// The rest changed only a subdivision citation: [current, Basic]
const RENUMBERED: Record<string, [string, string]> = {
  "9903.02.74": ["(v)(xx)", "(v)(xix)"],
  "9903.02.75": ["(v)(xxi)", "(v)(xx)"],
  "9903.02.76": ["(v)(xxii)", "(v)(xxi)"],
  "9903.02.77": ["(v)(xxiii)", "(v)(xxii)"],
  "9903.02.79": ["(v)(xxiv)(a)", "(v)(xxiii)(a)"],
  "9903.02.80": ["(v)(xxiv)(a)", "(v)(xxiii)(a)"],
  "9903.02.81": ["(v)(xxiv)(b)", "(v)(xxiii)(b)"],
  "9903.02.84": ["(v)(xxv)(b)", "(v)(xxiv)(b)"],
  "9903.02.85": ["(v)(xxv)(c)", "(v)(xxiv)(c)"],
  "9903.02.86": ["(v)(xxv)(d)", "(v)(xxiv)(d)"],
  "9903.02.89": ["(v)(xxv)(b)", "(v)(xxiv)(b)"],
  "9903.02.90": ["(v)(xxv)(c)", "(v)(xxiv)(c)"],
  "9903.02.91": ["(v)(xxv)(d)", "(v)(xxiv)(d)"],
}

// Proclamation 10999 (91 FR 889), Annex II, corrected these four headings' cross-references,
// which Proclamations 10976 and 10984 had left behind when they renumbered note 2(v). Two steps,
// both "Effective with respect to goods entered for consumption, or withdrawn from warehouse for
// consumption, on or after 12:01 am eastern time on": October 14, 2025 (section E) and November 1,
// 2025 (section F). Retroactive: 2025HTSRev32 still printed the oldest text, and 2026HTSBasic's
// change record dates the change Jan 1, 2026 (Annex II, read from its scanned pages, wins). Text only
const PP_10999_STEPS = ["2025-10-14", "2025-11-01"] as const
// [Basic (from Nov 1, 2025), Oct 14–31, 2025, before Oct 14, 2025 (2025HTSRev32)]
const PP_10999_CITATIONS: Record<string, [string, string, string]> = {
  "9903.02.74": ["(v)(xix)", "(v)(xvii)", "(v)(xvi)"],
  "9903.02.75": ["(v)(xx)", "(v)(xviii)", "(v)(xvii)"],
  "9903.02.76": ["(v)(xxi)", "(v)(xix)", "(v)(xviii)"],
  "9903.02.77": ["(v)(xxii)", "(v)(xx)", "(v)(xix)"],
}
const pp10999Source = (step: string) => ({
  revision: "2025HTSRev32",
  citation: "Proclamation 10999 (91 FR 889), Annex II",
  url: "https://www.govinfo.gov/content/pkg/FR-2026-01-08/pdf/2026-00245.pdf",
  publishedOn: "2026-01-08",
  note: `The cross-reference before Proclamation 10999's correction effective ${step} (Annex II, retroactive; the change record's Jan 1, 2026 is wrong). Backfilled from 2026HTSBasic's change record`,
})

const basicDescription = (t: Tariff) => {
  if (BASIC_DESCRIPTIONS[t.code]) return BASIC_DESCRIPTIONS[t.code]
  const [current, basic] = RENUMBERED[t.code]
  return replaceOnce(t.description, current, basic, t.code)
}

// Splits each listed heading's record in force across Jan 15, 2026 into its Basic text before and
// its current text from then on; 9903.02.74–.77's Basic part is split again at Nov 1 and Oct 14, 2025
// (Proclamation 10999's two steps). splitTariffAt only splits a record that spans the date, so
// earlier versions a later backfill adds keep their own text
export const withBasicText = (tariffs: Tariff[]): Tariff[] =>
  tariffs.flatMap((t) => {
    if (!(t.code in BASIC_DESCRIPTIONS || t.code in RENUMBERED)) return [t]
    const pieces = splitTariffAt(t, PP_11002_FROM, (r) => {
      const whenApplies = r.scope.whenApplies
      return {
        description: basicDescription(r),
        // Note 2(v)(xvi), 2(x)(xv) and 2(z)(xiii) didn't exist yet
        scope:
          whenApplies && "codes" in whenApplies && Array.isArray(whenApplies.codes)
            ? { ...r.scope, whenApplies: { ...whenApplies, codes: whenApplies.codes.filter((c) => c !== SEMICONDUCTORS) } }
            : r.scope,
        source: {
          ...pp11002Source,
          revision: "2026HTSBasic",
          note: `The 2026HTSBasic text, before Proclamation 11002 renumbered U.S. note 2 on Jan 15, 2026. Backfilled from 2026HTSRev1's change record${r.source?.note ? `. Later text: ${r.source.note}` : ""}`,
        },
      }
    })
    const steps = PP_10999_CITATIONS[t.code]
    if (!steps) return pieces
    const [basic, middle, oldest] = steps
    const [oct14, nov1] = PP_10999_STEPS
    return pieces
      .flatMap((p) =>
        splitTariffAt(p, nov1, (r) => ({
          description: replaceOnce(r.description, `${basic} of`, `${middle} of`, t.code),
          source: pp10999Source(nov1),
        })),
      )
      .flatMap((p) =>
        splitTariffAt(p, oct14, (r) => ({
          description: replaceOnce(r.description, `${middle} of`, `${oldest} of`, t.code),
          source: pp10999Source(oct14),
        })),
      )
  })
