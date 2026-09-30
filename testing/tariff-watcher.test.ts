import { describe, it, expect } from "./test-runner"
import { parseWatchList } from "../components/tariff-watcher/parse"

// Known codes stand in for the HTS; the parser only needs to know whether a code exists
const KNOWN = ["8413919015", "8409999190", "84833080", "7326908688"]
const find = (digits: string) => (KNOWN.includes(digits) ? digits : undefined)

describe("Tariff Watcher: reading the list", () => {
  it("reads code,country lines", () => {
    const { entries, errors } = parseWatchList("8413919015,BR\n8409999190,AR", find)
    expect(errors.length).toBe(0)
    expect(entries.map((e) => `${e.element}/${e.country.code}`)).toEqual(["8413919015/BR", "8409999190/AR"])
  })

  it("accepts dotted codes, other separators, names and lower case", () => {
    const { entries, errors } = parseWatchList(
      "8413.91.90.15; br\n8483.30.80\tAustria\n7326 90 86 88 china",
      find
    )
    expect(errors.length).toBe(0)
    expect(entries.map((e) => e.country.code)).toEqual(["BR", "AT", "CN"])
  })

  it("skips blank lines, comments and a header row, and keeps line numbers", () => {
    const { entries, errors } = parseWatchList("HTS Code,Country\n\n# pumps\n8413919015,BR", find)
    expect(errors.length).toBe(0)
    expect(entries[0].line).toBe(4)
  })

  it("explains lines it can't read", () => {
    const { entries, errors } = parseWatchList(
      "841391,BR\n8413919015\n8413919015,XX\n8413919015,US\n9999999999,BR\nhello",
      find
    )
    expect(entries.length).toBe(0)
    expect(errors.map((e) => e.line)).toEqual([1, 2, 3, 4, 5, 6])
    expect(errors[0].message).toBe("HTS codes need 8 or 10 digits (this has 6)")
    expect(errors[1].message).toBe("Add a country of origin after the code")
    expect(errors[3].message).toBe("The country of origin can't be the United States")
    expect(errors[4].message).toBe("9999999999 isn't in the current HTS")
  })

  it("keeps duplicates, in order", () => {
    const { entries } = parseWatchList("8413919015,BR\n8413919015,BR", find)
    expect(entries.length).toBe(2)
  })
})
