import successorsFile from "../../tariffs/hts-concordance/successors.json"
import type { CaseRow } from "./types"

// A case's scope codes from every source, merged into what imports match on (hts_main, hts_also,
// hts_excluded) with where each code came from (hts_sources):
//   fr:<document>   the Federal Register scope (scope.ts, notices.ts), kept as it is: a code no
//                   longer in the HTS still names its 8-digit line (match.ts) and maps forward
//   itc-petition    an investigation's ITC petition notice, until Commerce publishes a scope
//   ita-scope       ITA's case page, its scope text (ita.ts)
//   ita-list        ITA's case page, its HTS list: "may also enter" codes
//   renumbered:<old> the one clear replacement of a scope code the HTS has dropped
// ITA's codes count only when they're in the current HTS: its list keeps some codes long gone
// (HFC blends still lists 3824.78.00.20). A code one source covers and another excludes is covered.
// A 10-digit code ending in 00 that the HTS has only as an 8-digit line ("3907.61.00.00", when its
// lines are .0010 and .0050) names that whole line: it's kept as the 8 digits, which every import
// under the line matches.
//
// Scope codes the HTS has dropped (hts_outdated) map forward (tariffs/hts-concordance):
//   one clear replacement  joins the same list as the old code (covered, may also, excluded)
//   several candidates     hts_successors, matched as renumbered (match.ts); but when the case
//                          already lists a current code on the old code's 8-digit line, the agency
//                          has updated that line, so the candidates only count as "may also"
//                          (boltless shelving listed 9403.20.0018, split across ten lines since,
//                          one of them steel racks; it also lists the current shelving line)

type Successors = Record<string, { to: string[]; how: "one" | "split" }>
const SUCCESSORS = (successorsFile as { successors: Successors }).successors

type Sources = Pick<
  CaseRow,
  "scope_doc" | "fr_main" | "fr_also" | "fr_excluded" | "ita_main" | "ita_also" | "ita_excluded" | "ita_hts"
>

export type MergedCodes = Pick<CaseRow, "hts_main" | "hts_also" | "hts_excluded" | "hts_sources" | "hts_outdated" | "hts_successors">

export interface MergeNotes {
  // Covered codes ITA has that the Federal Register scope doesn't
  itaAdded: string[]
  // Dropped codes mapped to one replacement, to several, or to none
  renumbered: number
  split: number
  unmapped: number
}

const uniq = (codes: string[]) => Array.from(new Set(codes))

// `hts`: every 4, 6, 8 and 10-digit prefix of the current HTS's codes (empty: not loaded, keep all)
export const mergeCodes = (c: Sources, hts: Set<string>, successors: Successors = SUCCESSORS): MergedCodes & MergeNotes => {
  const asLine = (code: string) => (hts.size && code.length === 10 && code.endsWith("00") && !hts.has(code) && hts.has(code.slice(0, 8)) ? code.slice(0, 8) : code)
  const isCurrent = (code: string) => !hts.size || hts.has(code.slice(0, Math.min(code.length, 10)))
  const lines = (codes: string[] | undefined) => uniq((codes ?? []).map(asLine))
  const fr = { main: lines(c.fr_main), also: lines(c.fr_also), excluded: lines(c.fr_excluded) }
  const ita = {
    main: lines(c.ita_main).filter(isCurrent),
    also: lines(c.ita_also).filter(isCurrent),
    excluded: lines(c.ita_excluded).filter(isCurrent),
    list: lines(c.ita_hts).filter(isCurrent),
  }

  const sources: Record<string, string[]> = {}
  const add = (codes: string[], source: string) => {
    for (const code of codes) {
      sources[code] ??= []
      if (!sources[code].includes(source)) sources[code].push(source)
    }
  }
  const frSource = c.scope_doc ? `fr:${c.scope_doc}` : "itc-petition"
  add([...fr.main, ...fr.also, ...fr.excluded], frSource)
  add([...ita.main, ...ita.also, ...ita.excluded], "ita-scope")
  add(ita.list, "ita-list")

  const main = uniq([...fr.main, ...ita.main])
  const also = uniq([...fr.also, ...ita.also, ...ita.list])
  const excluded = uniq([...fr.excluded, ...ita.excluded])

  // Dropped codes, forward to the current ones
  const outdated = hts.size ? uniq([...main, ...also]).filter((code) => !isCurrent(code)) : []
  const split: Record<string, string[]> = {}
  let renumbered = 0
  let unmapped = 0
  for (const [list, codes] of [
    ["main", main],
    ["also", also],
    ["excluded", excluded],
  ] as const) {
    for (const old of codes.filter((code) => hts.size && !isCurrent(code))) {
      const next = successors[old]
      const to = (next?.to ?? []).filter(isCurrent)
      if (!to.length) {
        if (list !== "excluded") unmapped++
        continue
      }
      if (next.how === "one") {
        renumbered++
        codes.push(...to.filter((code) => !codes.includes(code)))
        add(to, `renumbered:${old}`)
      } else if (list === "main" && !main.some((code) => isCurrent(code) && code.slice(0, 8) === old.slice(0, 8))) {
        split[old] = to
      } else if (list !== "excluded") {
        // A "may also" code's candidates, or a line the case already lists a current code on
        also.push(...to.filter((code) => !also.includes(code)))
        add(to, `renumbered:${old}`)
      }
      if (next.how !== "one" && list !== "excluded") split[old] ??= []
    }
  }
  // Only the candidates still matched as renumbered stay in hts_successors
  const hts_successors = Object.fromEntries(Object.entries(split).filter(([, to]) => to.length))

  const covered = uniq(main)
  const excludedOnly = uniq(excluded).filter((code) => !covered.includes(code))
  const alsoOnly = uniq(also).filter((code) => !covered.includes(code) && !excludedOnly.includes(code))
  const kept = new Set([...covered, ...alsoOnly, ...excludedOnly])
  const known = new Set([...fr.main, ...fr.also, ...fr.excluded])
  return {
    hts_main: covered,
    hts_also: alsoOnly,
    hts_excluded: excludedOnly,
    hts_sources: Object.fromEntries(Object.entries(sources).filter(([code]) => kept.has(code))),
    hts_outdated: outdated,
    hts_successors,
    itaAdded: [...covered, ...alsoOnly].filter((code) => isCurrent(code) && !known.has(code) && (sources[code] ?? []).some((s) => s.startsWith("ita"))),
    renumbered,
    split: Object.keys(split).length,
    unmapped,
  }
}
