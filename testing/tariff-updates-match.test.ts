import { describe, it, expect } from "./test-runner"
import { matchCatalog, matchImport, scopeOf, type MatchableUpdate } from "../libs/tariff-updates/match"

// Which of a user's imports a tariff update may affect (libs/tariff-updates/match.ts): the codes,
// countries and exclusions an update names, against imports keyed by 10-digit code and country
const update = (fields: Partial<MatchableUpdate>): MatchableUpdate => ({
  slug: "test",
  hts_codes: [],
  countries: [],
  authority: "section_232",
  kind: "new_tariff",
  ...fields,
})

const level = (fields: Partial<MatchableUpdate>, code: string, country: string) => matchImport(scopeOf(update(fields)), { code, country })

describe("Tariff updates: matching imports", () => {
  it("matches dotted codes of any length against 10-digit imports", () => {
    const scope = { scope_codes: ["8708", "7326.90.86", "8413.91.9015"], scope_countries: ["CN"] }
    expect(level(scope, "8708801300", "CN")).toBe("likely")
    expect(level(scope, "7326908688", "CN")).toBe("likely")
    expect(level(scope, "8413919015", "CN")).toBe("likely")
    expect(level(scope, "8413919020", "CN")).toBe(null)
    expect(level(scope, "8708801300", "VN")).toBe(null)
  })

  it("an 8-digit import is named by one of its 10-digit lines, but not excluded by one", () => {
    expect(level({ scope_codes: ["8413.91.9015"], scope_countries: ["CN"] }, "84139190", "CN")).toBe("likely")
    expect(level({ scope_codes: ["8413"], scope_excluded_codes: ["8413.91.9015"], scope_countries: ["CN"] }, "84139190", "CN")).toBe("likely")
    expect(level({ scope_codes: ["8413"], scope_excluded_codes: ["8413.91.90"], scope_countries: ["CN"] }, "84139190", "CN")).toBe(null)
  })

  it("reads chapters and ranges of codes", () => {
    expect(level({ scope_codes: ["Chapter 73"], scope_countries: ["ALL"] }, "7326908688", "DE")).toBe("likely")
    expect(level({ scope_codes: ["Chapter 2"], scope_countries: ["AR"] }, "0201300000", "AR")).toBe("likely")
    const range = { scope_codes: ["8708.10 through 8708.99"], scope_countries: ["MX"] }
    expect(level(range, "8708925000", "MX")).toBe("likely")
    expect(level(range, "8709110000", "MX")).toBe(null)
    expect(level({ scope_codes: ["8708.10-8708.29"], scope_countries: ["MX"] }, "8708925000", "MX")).toBe(null)
  })

  it("Chapter 99 numbers and their ranges are headings, not products", () => {
    const scope = scopeOf(update({ hts_codes: ["9903.05.20–9903.05.23", "99030530", "9802.00.80", "Chapter 99"], countries: ["AR"] }))
    expect(scope.codes).toEqual([])
    expect(scope.headings).toEqual(["9903.05.20", "9903.05.21", "9903.05.22", "9903.05.23", "9903.05.30"])
    // Names no products: the country only
    expect(level({ hts_codes: ["9903.05.20", "9802.00.80"], countries: ["AR"] }, "8409999190", "AR")).toBe("possible")
  })

  it("exclusions win over inclusions, and ALL is everything but them", () => {
    const all = { scope_codes: ["ALL"], scope_excluded_codes: ["0901", "8803.30"], scope_countries: ["BR"] }
    expect(level(all, "4016931020", "BR")).toBe("likely")
    expect(level(all, "0901210000", "BR")).toBe(null)
    expect(level(all, "8803300030", "BR")).toBe(null)
    expect(level(all, "4016931020", "AR")).toBe(null)
  })

  it("exceptions with nothing named as covered mean every product but them", () => {
    // How the reader returned Section 301 on Brazil: no covered codes, 2,126 exemptions
    const brazil = { scope_codes: [] as string[], scope_excluded_codes: ["0901", "2601"], scope_countries: ["BR"], scope_headings: ["9903.05.01"] }
    expect(level(brazil, "4016931020", "BR")).toBe("likely")
    expect(level(brazil, "0901210000", "BR")).toBe(null)
    // No codes and no exceptions: the country only
    expect(level({ scope_codes: [], scope_countries: ["MA"] }, "3103110000", "MA")).toBe("possible")
  })

  it("all countries, less the excluded ones", () => {
    const quartz = { scope_codes: ["6810.99.0020"], scope_countries: ["ALL"], scope_excluded_countries: ["CA", "MX"] }
    expect(level(quartz, "6810990020", "CN")).toBe("likely")
    expect(level(quartz, "6810990020", "MX")).toBe(null)
    // Every country and no products: too broad to say
    expect(level({ countries: ["ALL"] }, "6810990020", "CN")).toBe(null)
  })

  it("the European Union is its member states, UK is GB", () => {
    expect(level({ hts_codes: ["8409"], countries: ["EU"] }, "8409999190", "DE")).toBe("likely")
    expect(level({ countries: ["EU", "TW"] }, "8409999190", "ES")).toBe("possible")
    expect(level({ scope_codes: ["ALL"], scope_countries: ["ALL"], scope_excluded_countries: ["EU"] }, "8409999190", "IT")).toBe(null)
    expect(level({ hts_codes: ["8409"], countries: ["UK"] }, "8409999190", "GB")).toBe("likely")
    // Hong Kong isn't China
    expect(level({ hts_codes: ["8409"], countries: ["CN"] }, "8409999190", "HK")).toBe(null)
  })

  it("codes with no countries named: the codes decide", () => {
    expect(level({ hts_codes: ["8409"] }, "8409999190", "TR")).toBe("likely")
  })

  it("the scope, when there is one, replaces what the sources named", () => {
    const fields = { hts_codes: ["0201.10.05"], countries: ["BR"], scope_codes: ["8708"], scope_countries: ["BR"] }
    expect(level(fields, "0201100500", "BR")).toBe(null)
    expect(level(fields, "8708801300", "BR")).toBe("likely")
  })

  it("HTS revisions match nothing", () => {
    const found = matchCatalog([update({ kind: "hts_revision", hts_codes: ["8708"], countries: ["CN"] })], [{ code: "8708801300", country: "CN" }])
    expect(found.size).toBe(0)
  })
})
