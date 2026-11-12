import { describe, it, expect } from "./test-runner"
import { matchCatalog, matchImport, namedByUpdate, scopeOf, type MatchableUpdate } from "../libs/tariff-updates/match"

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

// An update that names only Chapter 99 headings ("all exclusions under heading 9903.88.69") names
// the codes under them, from the duty engine's data on the day it takes effect
describe("Tariff updates: headings-only updates name the codes under them", () => {
  const extension = { kind: "exclusion" as const, authority: "section_301" as const, effective_on: "2026-11-10" }

  it("an import on the heading's list is likely; another import of the country isn't matched", () => {
    const scoped = { ...extension, scope_codes: [] as string[], scope_headings: ["9903.88.69", "9903.88.70"], scope_countries: ["CN"] }
    expect(level(scoped, "8483509040", "CN")).toBe("likely")
    expect(level(scoped, "8486100000", "CN")).toBe("likely")
    expect(level(scoped, "6109100012", "CN")).toBe(null)
    expect(level(scoped, "8483509040", "VN")).toBe(null)
  })

  it("works from the codes the sources named too, when no scope was read", () => {
    const named = { ...extension, hts_codes: ["9903.88.69"], countries: ["CN"] }
    expect(level(named, "8607211000", "CN")).toBe("likely")
    expect(level(named, "6109100012", "CN")).toBe(null)
  })

  it("an update that names product codes isn't widened by the headings it cites", () => {
    const listed = { ...extension, hts_codes: ["9903.88.03", "8413.91.90.85"], countries: ["CN"] }
    expect(level(listed, "8413919085", "CN")).toBe("likely")
    // 9903.88.03 (List 3) covers thousands of codes; the update covers only the one it names
    expect(level(listed, "8483509040", "CN")).toBe(null)
  })

  it("headings the engine doesn't know leave the update as it was", () => {
    expect(level({ ...extension, hts_codes: ["9903.91.12"], countries: ["CN"] }, "8426110000", "CN")).toBe("possible")
  })
})

// What the update page, review and Duty Guard show under the headings: the same codes matching uses
describe("Tariff updates: the codes shown under headings", () => {
  it("lists each known heading's codes, with the described-product ones marked", () => {
    const { children } = namedByUpdate(update({ hts_codes: ["9903.88.69", "9903.88.70", "9903.91.12"], countries: ["CN"], effective_on: "2026-11-10" }))
    expect(children.map((h) => h.heading).join(",")).toBe("9903.88.69,9903.88.70")
    const exclusions = children[0]
    expect(exclusions.codes.includes("8483.50.90.40")).toBe(true)
    expect(exclusions.describedCodes.includes("8483.50.90.40")).toBe(false)
    expect(exclusions.describedCodes.length > 0).toBe(true)
    expect(children[1].allDescribed).toBe(true)
  })

  it("shows none when the update names product codes", () => {
    expect(namedByUpdate(update({ hts_codes: ["9903.88.69", "8413.91.90.85"], countries: ["CN"] })).children.length).toBe(0)
  })
})
